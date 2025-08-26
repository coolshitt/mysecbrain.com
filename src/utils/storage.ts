import { Habit, HabitEntry, Module, BackupData, ModuleType } from '../types';

const STORAGE_KEYS = {
  HABITS: 'mysecbrain_habits',
  HABIT_ENTRIES: 'mysecbrain_habit_entries',
  MODULES: 'mysecbrain_modules',
  CURRENT_MODULE: 'mysecbrain_current_module',
} as const;

// Generic storage utilities
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  }
};

// Habits specific storage
export const habitsStorage = {
  getHabits: (): Habit[] => {
    return storage.get<Habit[]>(STORAGE_KEYS.HABITS) || [];
  },

  setHabits: (habits: Habit[]): void => {
    storage.set(STORAGE_KEYS.HABITS, habits);
  },

  getHabitEntries: (): HabitEntry[] => {
    return storage.get<HabitEntry[]>(STORAGE_KEYS.HABIT_ENTRIES) || [];
  },

  setHabitEntries: (entries: HabitEntry[]): void => {
    storage.set(STORAGE_KEYS.HABIT_ENTRIES, entries);
  },

  addHabit: (habit: Habit): void => {
    const habits = habitsStorage.getHabits();
    habits.push(habit);
    habitsStorage.setHabits(habits);
  },

  updateHabit: (habitId: string, updates: Partial<Habit>): void => {
    const habits = habitsStorage.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index >= 0) {
      habits[index] = { ...habits[index], ...updates };
      habitsStorage.setHabits(habits);
    }
  },

  deleteHabit: (habitId: string): void => {
    const habits = habitsStorage.getHabits().filter(h => h.id !== habitId);
    const entries = habitsStorage.getHabitEntries().filter(e => e.habitId !== habitId);
    habitsStorage.setHabits(habits);
    habitsStorage.setHabitEntries(entries);
  },

  toggleHabitEntry: (habitId: string, date: string): void => {
    const entries = habitsStorage.getHabitEntries();
    const existingEntry = entries.find(e => e.habitId === habitId && e.date === date);
    
    if (existingEntry) {
      existingEntry.completed = !existingEntry.completed;
    } else {
      entries.push({
        id: `${habitId}_${date}_${Date.now()}`,
        habitId,
        date,
        completed: true
      });
    }
    
    habitsStorage.setHabitEntries(entries);
  }
};

// Module management
export const moduleStorage = {
  getModules: (): Module[] => {
    const defaultModules: Module[] = [
      { id: 'habits', name: 'Habits', isEnabled: true, icon: '📋' },
      { id: 'tasks', name: 'Tasks & Projects', isEnabled: false, icon: '📝' },
      { id: 'finance', name: 'Wallet', isEnabled: false, icon: '💰' },
    ];
    
    return storage.get<Module[]>(STORAGE_KEYS.MODULES) || defaultModules;
  },

  setModules: (modules: Module[]): void => {
    storage.set(STORAGE_KEYS.MODULES, modules);
  },

  getCurrentModule: (): ModuleType => {
    return storage.get<ModuleType>(STORAGE_KEYS.CURRENT_MODULE) || 'habits';
  },

  setCurrentModule: (moduleId: ModuleType): void => {
    storage.set(STORAGE_KEYS.CURRENT_MODULE, moduleId);
  }
};

// Backup and restore functionality
export const backupStorage = {
  exportData: (): BackupData => {
    const habits = habitsStorage.getHabits();
    const habitEntries = habitsStorage.getHabitEntries();
    const modules = moduleStorage.getModules();
    
    const sortedEntries = habitEntries.sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      habits,
      habitEntries,
      modules,
      metadata: {
        totalDays: new Set(habitEntries.map(e => e.date)).size,
        firstEntry: sortedEntries[0]?.date,
        lastEntry: sortedEntries[sortedEntries.length - 1]?.date,
      }
    };
  },

  importData: (backupData: BackupData): boolean => {
    try {
      // Validate backup data structure
      if (!backupData.version || !backupData.habits || !backupData.habitEntries) {
        throw new Error('Invalid backup data format');
      }

      // Clear existing data and import
      habitsStorage.setHabits(backupData.habits);
      habitsStorage.setHabitEntries(backupData.habitEntries);
      
      if (backupData.modules) {
        moduleStorage.setModules(backupData.modules);
      }

      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  },

  downloadBackup: (): void => {
    const data = backupStorage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mysecbrain-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};