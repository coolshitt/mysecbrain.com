// Core data types for mysecbrain

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created: Date;
  isActive: boolean;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD format
  totalHabits: number;
  completedHabits: number;
  percentage: number;
}

// Module types for future extensibility
export type ModuleType = 'habits' | 'tasks' | 'finance' | 'notes';

export interface Module {
  id: ModuleType;
  name: string;
  isEnabled: boolean;
  icon: string;
}

// Backup and export types
export interface BackupData {
  version: string;
  exportDate: string;
  habits: Habit[];
  habitEntries: HabitEntry[];
  modules: Module[];
  metadata: {
    totalDays: number;
    firstEntry?: string;
    lastEntry?: string;
  };
}

// UI State types
export interface AppState {
  currentModule: ModuleType;
  selectedDate: Date;
  habits: Habit[];
  habitEntries: HabitEntry[];
  modules: Module[];
}