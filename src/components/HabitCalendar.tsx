'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { useHabitStore } from '@/lib/store';
import HabitModal from './HabitModal';

interface HabitCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function HabitCalendar({ currentDate, onDateSelect }: HabitCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { getHabitProgress } = useHabitStore();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add padding days to align calendar grid
  const startPadding = monthStart.getDay();
  const endPadding = 6 - monthEnd.getDay();
  
  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-habit-0';
    if (progress <= 25) return 'bg-habit-25';
    if (progress <= 50) return 'bg-habit-50';
    if (progress <= 75) return 'bg-habit-75';
    return 'bg-habit-100';
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };
  
  const closeModal = () => {
    setSelectedDate(null);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Calendar Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-primary-600 dark:text-primary-400">
            {day}
          </div>
        ))}
        
        {/* Padding days before month start */}
        {Array.from({ length: startPadding }).map((_, index) => (
          <div key={`start-${index}`} className="p-2" />
        ))}
        
        {/* Month days */}
        {daysInMonth.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const progress = getHabitProgress(dateString);
          const isCurrentDay = isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`
                relative p-2 h-16 w-full rounded-lg transition-all duration-200
                hover:scale-105 hover:shadow-lg
                ${getProgressColor(progress)}
                ${isCurrentDay ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                ${isSameMonth(day, currentDate) ? 'opacity-100' : 'opacity-50'}
              `}
            >
              <div className="text-sm font-medium text-primary-900 dark:text-primary-100">
                {format(day, 'd')}
              </div>
              {progress > 0 && (
                <div className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                  {progress}%
                </div>
              )}
            </button>
          );
        })}
        
        {/* Padding days after month end */}
        {Array.from({ length: endPadding }).map((_, index) => (
          <div key={`end-${index}`} className="p-2" />
        ))}
      </div>
      
      {/* Habit Modal */}
      {selectedDate && (
        <HabitModal
          date={selectedDate}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
