import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  status: boolean;
}

interface HabitStore {
  habits: Habit[];
  habitEntries: HabitEntry[];
  addHabit: (name: string) => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitEntry: (habitId: string, date: string) => void;
  getHabitProgress: (date: string) => number;
  exportData: () => { habits: Habit[]; habit_entries: HabitEntry[] };
  importData: (data: { habits: Habit[]; habit_entries: HabitEntry[] }) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      habitEntries: [],
      
      addHabit: (name: string) => {
        const newHabit: Habit = {
          id: Date.now().toString(),
          name,
          user_id: 'user1', // For MVP, hardcoded user
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          habits: [...state.habits, newHabit],
        }));
      },
      
      updateHabit: (id: string, name: string) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, name } : habit
          ),
        }));
      },
      
      deleteHabit: (id: string) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
          habitEntries: state.habitEntries.filter((entry) => entry.habit_id !== id),
        }));
      },
      
      toggleHabitEntry: (habitId: string, date: string) => {
        set((state) => {
          const existingEntry = state.habitEntries.find(
            (entry) => entry.habit_id === habitId && entry.date === date
          );
          
          if (existingEntry) {
            // Toggle existing entry
            return {
              habitEntries: state.habitEntries.map((entry) =>
                entry.id === existingEntry.id
                  ? { ...entry, status: !entry.status }
                  : entry
              ),
            };
          } else {
            // Create new entry
            const newEntry: HabitEntry = {
              id: Date.now().toString(),
              habit_id: habitId,
              date,
              status: true,
            };
            return {
              habitEntries: [...state.habitEntries, newEntry],
            };
          }
        });
      },
      
      getHabitProgress: (date: string) => {
        const state = get();
        const dayEntries = state.habitEntries.filter((entry) => entry.date === date);
        const totalHabits = state.habits.length;
        
        if (totalHabits === 0) return 0;
        
        const completedHabits = dayEntries.filter((entry) => entry.status).length;
        return Math.round((completedHabits / totalHabits) * 100);
      },
      
      exportData: () => {
        const state = get();
        return {
          habits: state.habits,
          habit_entries: state.habitEntries,
        };
      },
      
      importData: (data: { habits: Habit[]; habit_entries: HabitEntry[] }) => {
        set({
          habits: data.habits,
          habitEntries: data.habit_entries,
        });
      },
    }),
    {
      name: 'habit-storage',
    }
  )
);
