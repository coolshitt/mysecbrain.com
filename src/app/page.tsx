'use client';

import { useState } from 'react';
import { addDays, subDays } from 'date-fns';
import HabitCalendar from '@/components/HabitCalendar';
import HabitManager from '@/components/HabitManager';
import DataManager from '@/components/DataManager';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const goToPreviousMonth = () => {
    setCurrentDate(subDays(currentDate, 30));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(addDays(currentDate, 30));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleDateSelect = (date: Date) => {
    // This will be handled by the calendar component
    console.log('Date selected:', date);
  };
  
  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors duration-200">
      <ThemeToggle />
      
      {/* Header */}
      <header className="bg-white dark:bg-primary-900 shadow-sm border-b border-primary-200 dark:border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
                mysecbrain.com
              </h1>
              <p className="text-primary-600 dark:text-primary-400 mt-1">
                Habit Tracker - Build Better Habits
              </p>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-2">
            <HabitCalendar
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
            />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <HabitManager />
            <DataManager />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-primary-900 border-t border-primary-200 dark:border-primary-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-primary-600 dark:text-primary-400 text-sm">
              © 2024 mysecbrain.com - Your Personal Productivity Hub
            </p>
            <p className="text-primary-500 dark:text-primary-500 text-xs mt-2">
              Habit Tracker MVP - More modules coming soon!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
