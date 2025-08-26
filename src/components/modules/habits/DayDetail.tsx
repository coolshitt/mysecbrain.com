import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Habit, HabitEntry } from '../../../types';
import { formatDate, isToday } from '../../../utils/dateUtils';

interface DayDetailProps {
  date: Date;
  habits: Habit[];
  habitEntries: HabitEntry[];
  onHabitToggle: (habitId: string, date: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onClose: () => void;
}

const DayDetail: React.FC<DayDetailProps> = ({
  date,
  habits,
  habitEntries,
  onHabitToggle,
  onDeleteHabit,
  onClose
}) => {
  const dateStr = formatDate(date);
  const activeHabits = habits.filter(h => h.isActive);
  
  const getHabitEntry = (habitId: string): HabitEntry | undefined => {
    return habitEntries.find(e => e.habitId === habitId && e.date === dateStr);
  };

  const isHabitCompleted = (habitId: string): boolean => {
    const entry = getHabitEntry(habitId);
    return entry?.completed || false;
  };

  const completedCount = activeHabits.filter(habit => isHabitCompleted(habit.id)).length;
  const progressPercentage = activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;

  const formatDateDisplay = (date: Date): string => {
    if (isToday(date)) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (activeHabits.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{formatDateDisplay(date)}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p className="mb-2">No habits created yet</p>
            <p className="text-sm">Click "Add Habit" to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{formatDateDisplay(date)}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Progress Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily Progress</span>
            <span className="text-lg font-bold">{progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-600 mt-2">
            {completedCount} of {activeHabits.length} habits completed
          </p>
        </div>
      </div>

      {/* Habits List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {activeHabits.map((habit) => {
            const isCompleted = isHabitCompleted(habit.id);
            
            return (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onHabitToggle(habit.id, dateStr)}
                    className={`
                      flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200
                      ${isCompleted 
                        ? 'bg-black border-black' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {isCompleted && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Habit Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {habit.name}
                    </h4>
                    {habit.description && (
                      <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                        {habit.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {isToday(date) 
            ? "Build consistent habits, one day at a time" 
            : "Review your past progress or plan ahead"
          }
        </p>
      </div>
    </div>
  );
};

export default DayDetail;