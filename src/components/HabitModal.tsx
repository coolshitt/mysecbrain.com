'use client';

import { format } from 'date-fns';
import { useHabitStore, type Habit } from '@/lib/store';

interface HabitModalProps {
  date: Date;
  onClose: () => void;
}

export default function HabitModal({ date, onClose }: HabitModalProps) {
  const { habits, habitEntries, toggleHabitEntry, getHabitProgress } = useHabitStore();
  
  const dateString = format(date, 'yyyy-MM-dd');
  const progress = getHabitProgress(dateString);
  
  const getHabitStatus = (habitId: string) => {
    const entry = habitEntries.find(
      (entry) => entry.habit_id === habitId && entry.date === dateString
    );
    return entry?.status || false;
  };
  
  const handleHabitToggle = (habitId: string) => {
    toggleHabitEntry(habitId, dateString);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-primary-900 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary-100 dark:bg-primary-800 px-6 py-4 border-b border-primary-200 dark:border-primary-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </h3>
            <button
              onClick={onClose}
              className="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-primary-200 dark:border-primary-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Daily Progress
            </span>
            <span className="text-sm font-bold text-primary-900 dark:text-primary-100">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-primary-200 dark:bg-primary-700 rounded-full h-2">
            <div
              className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Habits List */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                No habits created yet
              </p>
              <p className="text-sm text-primary-500 dark:text-primary-500">
                Create your first habit to start tracking!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompleted = getHabitStatus(habit.id);
                
                return (
                  <div
                    key={habit.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleHabitToggle(habit.id)}
                      className="w-5 h-5 text-primary-600 bg-primary-100 border-primary-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400 dark:ring-offset-primary-800 focus:ring-2"
                    />
                    <span
                      className={`flex-1 text-sm font-medium ${
                        isCompleted
                          ? 'text-primary-600 dark:text-primary-400 line-through'
                          : 'text-primary-900 dark:text-primary-100'
                      }`}
                    >
                      {habit.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-primary-50 dark:bg-primary-800 border-t border-primary-200 dark:border-primary-700">
          <div className="text-center">
            <p className="text-xs text-primary-500 dark:text-primary-400">
              {progress === 100 ? '🎉 Perfect day! All habits completed!' : 
               progress > 0 ? `Keep going! ${100 - progress}% to go!` : 
               'Start your day by completing your first habit!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
