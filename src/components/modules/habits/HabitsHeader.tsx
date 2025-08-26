import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { formatDisplayDate } from '../../../utils/dateUtils';

interface HabitsHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddHabit: (name: string, description?: string) => void;
  habitsCount: number;
}

const HabitsHeader: React.FC<HabitsHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onAddHabit,
  habitsCount
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim()) {
      onAddHabit(habitName.trim(), habitDescription.trim() || undefined);
      setHabitName('');
      setHabitDescription('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold">{formatDisplayDate(currentDate)}</h2>
          <span className="text-sm text-gray-500">
            {habitsCount} active habit{habitsCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToday}
            className="btn btn-secondary text-sm"
          >
            <Calendar size={16} className="mr-2" />
            Today
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary text-sm"
          >
            <Plus size={16} className="mr-2" />
            Add Habit
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          Click on any day to view and manage your habits
        </div>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                className="input"
                autoFocus
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
                placeholder="Any additional details..."
                className="input"
              />
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn btn-primary">
                Add Habit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setHabitName('');
                  setHabitDescription('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HabitsHeader;