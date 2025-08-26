import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const formatDayOfMonth = (date: Date): string => {
  return format(date, 'd');
};

export const formatDayOfWeek = (date: Date): string => {
  return format(date, 'EEE');
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getCalendarDays = (date: Date): Date[] => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 }); // Start week on Monday
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};

export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + months);
  return newDate;
};

export const getDayProgress = (date: Date, habits: any[], habitEntries: any[]): number => {
  const dateStr = formatDate(date);
  const activeHabits = habits.filter(h => h.isActive);
  
  if (activeHabits.length === 0) return 0;
  
  const completedCount = activeHabits.filter(habit => {
    const entry = habitEntries.find(e => e.habitId === habit.id && e.date === dateStr);
    return entry?.completed;
  }).length;
  
  return Math.round((completedCount / activeHabits.length) * 100);
};