import React from 'react';
import { Habit, HabitEntry } from '../../../types';
import { 
  getCalendarDays, 
  formatDayOfMonth, 
  formatDayOfWeek, 
  isToday, 
  isSameMonth,
  formatDate,
  getDayProgress
} from '../../../utils/dateUtils';

interface HabitsCalendarProps {
  currentDate: Date;
  selectedDate: Date | null;
  habits: Habit[];
  habitEntries: HabitEntry[];
  onDateClick: (date: Date) => void;
}

const HabitsCalendar: React.FC<HabitsCalendarProps> = ({
  currentDate,
  selectedDate,
  habits,
  habitEntries,
  onDateClick
}) => {
  const calendarDays = getCalendarDays(currentDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getProgressColor = (progress: number): string => {
    // Convert progress (0-100) to grayscale color
    // 0% = black (#000000), 100% = white (#ffffff)
    const intensity = Math.round((progress / 100) * 255);
    const hex = intensity.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  };

  const getTextColor = (progress: number): string => {
    // Use white text for dark backgrounds (< 50%), black text for light backgrounds
    return progress < 50 ? '#ffffff' : '#000000';
  };

  const getDayCellStyles = (date: Date): React.CSSProperties => {
    const progress = getDayProgress(date, habits, habitEntries);
    const backgroundColor = getProgressColor(progress);
    const color = getTextColor(progress);
    
    return {
      backgroundColor,
      color,
      border: isToday(date) ? '2px solid #3b82f6' : 
              selectedDate && formatDate(selectedDate) === formatDate(date) ? '2px solid #ef4444' : 
              '1px solid #e5e7eb'
    };
  };

  const isCurrentMonth = (date: Date): boolean => {
    return isSameMonth(date, currentDate);
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Week Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const progress = getDayProgress(date, habits, habitEntries);
          const dayOfMonth = formatDayOfMonth(date);
          const inCurrentMonth = isCurrentMonth(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`
                relative aspect-square min-h-[3rem] flex flex-col items-center justify-center
                rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${!inCurrentMonth ? 'opacity-30' : ''}
              `}
              style={getDayCellStyles(date)}
            >
              {/* Day Number */}
              <span className="text-lg font-medium">
                {dayOfMonth}
              </span>
              
              {/* Progress Indicator */}
              {inCurrentMonth && habits.filter(h => h.isActive).length > 0 && (
                <span className="text-xs mt-1 opacity-80">
                  {progress}%
                </span>
              )}
              
              {/* Today Indicator */}
              {isToday(date) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
              
              {/* Selected Indicator */}
              {selectedDate && formatDate(selectedDate) === formatDate(date) && (
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Progress Legend</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded border"></div>
            <span className="text-sm text-gray-600">0% Complete</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-500 rounded border"></div>
            <span className="text-sm text-gray-600">50% Complete</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white rounded border border-gray-300"></div>
            <span className="text-sm text-gray-600">100% Complete</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Each day's shade represents your habit completion percentage. 
          Click any day to view and manage your habits.
        </p>
      </div>
    </div>
  );
};

export default HabitsCalendar;