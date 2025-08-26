import React, { useState, useEffect } from 'react';
import { Habit, HabitEntry } from '../../types';
import { habitsStorage } from '../../utils/storage';
import { addMonths } from '../../utils/dateUtils';
import HabitsCalendar from './habits/HabitsCalendar';
import DayDetail from './habits/DayDetail';
import HabitsHeader from './habits/HabitsHeader';

const HabitsModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHabits(habitsStorage.getHabits());
    setHabitEntries(habitsStorage.getHabitEntries());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleHabitToggle = (habitId: string, date: string) => {
    habitsStorage.toggleHabitEntry(habitId, date);
    loadData(); // Reload data to update UI
  };

  const handleAddHabit = (name: string, description?: string) => {
    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name,
      description,
      created: new Date(),
      isActive: true
    };
    
    habitsStorage.addHabit(newHabit);
    loadData();
  };

  const handleDeleteHabit = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit? All progress will be lost.')) {
      habitsStorage.deleteHabit(habitId);
      loadData();
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Calendar View */}
      <div className="flex-1 flex flex-col">
        <HabitsHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onAddHabit={handleAddHabit}
          habitsCount={habits.filter(h => h.isActive).length}
        />
        
        <div className="flex-1 p-4">
          <HabitsCalendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            habits={habits}
            habitEntries={habitEntries}
            onDateClick={handleDateClick}
          />
        </div>
      </div>

      {/* Day Detail Sidebar */}
      {selectedDate && (
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200">
          <DayDetail
            date={selectedDate}
            habits={habits}
            habitEntries={habitEntries}
            onHabitToggle={handleHabitToggle}
            onDeleteHabit={handleDeleteHabit}
            onClose={() => setSelectedDate(null)}
          />
        </div>
      )}
    </div>
  );
};

export default HabitsModule;