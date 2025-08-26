'use client';

import { useState } from 'react';
import { useHabitStore, type Habit } from '@/lib/store';

export default function HabitManager() {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabitStore();
  const [newHabitName, setNewHabitName] = useState('');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editName, setEditName] = useState('');
  
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName('');
    }
  };
  
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditName(habit.name);
  };
  
  const handleSaveEdit = () => {
    if (editingHabit && editName.trim()) {
      updateHabit(editingHabit.id, editName.trim());
      setEditingHabit(null);
      setEditName('');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingHabit(null);
    setEditName('');
  };
  
  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit? This will also remove all its tracking data.')) {
      deleteHabit(habitId);
    }
  };
  
  return (
    <div className="bg-white dark:bg-primary-900 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-4">
        Manage Habits
      </h3>
      
      {/* Add New Habit Form */}
      <form onSubmit={handleAddHabit} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Enter habit name..."
            className="flex-1 px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-100"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Add Habit
          </button>
        </div>
      </form>
      
      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <p className="text-primary-600 dark:text-primary-400 text-center py-4">
            No habits created yet. Add your first habit above!
          </p>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 border border-primary-200 dark:border-primary-700 rounded-lg"
            >
              {editingHabit?.id === habit.id ? (
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-primary-300 dark:border-primary-600 rounded bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-100"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-primary-900 dark:text-primary-100 font-medium">
                    {habit.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
