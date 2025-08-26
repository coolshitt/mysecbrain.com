// Life Analysis Insights Manager
class LifeAnalysisInsightsManager {
    constructor() {
        this.currentPeriod = 'daily';
        this.currentDate = new Date();
    }

    // Update all insights
    updateAllInsights() {
        this.updateMostProductiveDay();
        this.updateBestHabitStreak();
        this.updateFinancialGrowth();
        this.updateGoalCompletionRate();
    }

    // Update most productive day insight
    updateMostProductiveDay() {
        const element = document.getElementById('mostProductiveDay');
        if (!element) return;

        try {
            const activities = lifeAnalysisStorage.getData('activities');
            if (activities.length === 0) {
                element.textContent = 'No data yet';
                return;
            }

            const dayProductivity = this.calculateDayProductivity(activities);
            const mostProductiveDay = this.findMostProductiveDay(dayProductivity);
            
            element.textContent = mostProductiveDay;
        } catch (error) {
            console.error('Error updating most productive day:', error);
            element.textContent = 'Error';
        }
    }

    // Update best habit streak insight
    updateBestHabitStreak() {
        const element = document.getElementById('bestHabitStreak');
        if (!element) return;

        try {
            let habits = [];
            let habitCompletions = {};
            
            // Try to get habits from the main app first
            if (window.app && window.app.habitsManager) {
                habits = window.app.habitsManager.getHabits();
                habitCompletions = window.app.habitsManager.getCompletions();
            } else if (window.habitsManager) {
                habits = window.habitsManager.getHabits();
                habitCompletions = window.habitsManager.getCompletions();
            } else if (window.app && window.app.habits) {
                habits = window.app.habits;
                habitCompletions = window.app.habitCompletions || {};
            } else {
                // Try multiple possible localStorage keys for habits (including mysecbrain_ prefix)
                const possibleHabitKeys = [
                    'mysecbrain_habits',
                    'habits',
                    'habit_list',
                    'my_habits',
                    'user_habits',
                    'daily_habits',
                    'habit_data'
                ];
                
                const possibleCompletionKeys = [
                    'mysecbrain_completions',
                    'habit_completions',
                    'habit_completions_data',
                    'daily_completions',
                    'completions',
                    'habit_status'
                ];
                
                // Find habits data
                for (const key of possibleHabitKeys) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        try {
                            const parsed = JSON.parse(data);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                habits = parsed;
                                break;
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }
                    }
                }
                
                // Find habit completions data
                for (const key of possibleCompletionKeys) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        try {
                            const parsed = JSON.parse(data);
                            if (typeof parsed === 'object' && parsed !== null) {
                                habitCompletions = parsed;
                                break;
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }
                    }
                }
            }
            
            if (habits.length === 0) {
                element.textContent = 'No life activities yet';
                return;
            }

            const bestStreak = this.calculateBestHabitStreak(habits, habitCompletions);
            element.textContent = `${bestStreak} days`;
        } catch (error) {
            console.error('Error updating best habit streak:', error);
            element.textContent = 'Error';
        }
    }

    // Update financial growth insight
    updateFinancialGrowth() {
        const element = document.getElementById('financialGrowth');
        if (!element) return;

        try {
            let transactions = [];
            
            // Try to get data from Wallet module first
            if (window.walletApp && window.walletApp.transactionsManager) {
                transactions = window.walletApp.transactionsManager.getTransactions();
            } else {
                // Fallback to localStorage
                transactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
            }
            
            if (transactions.length === 0) {
                element.textContent = 'No transactions yet';
                return;
            }

            const growth = this.calculateFinancialGrowth(transactions);
            element.textContent = growth;
        } catch (error) {
            console.error('Error updating financial growth:', error);
            element.textContent = 'Error';
        }
    }

    // Update goal completion rate insight
    updateGoalCompletionRate() {
        const element = document.getElementById('goalCompletionRate');
        if (!element) return;

        try {
            let goals = [];
            
            // Try to get data from Wallet module first
            if (window.walletApp && window.walletApp.goalsManager) {
                goals = window.walletApp.goalsManager.getGoals();
            } else {
                // Fallback to localStorage
                goals = JSON.parse(localStorage.getItem('wallet_goals') || '[]');
            }
            
            if (goals.length === 0) {
                element.textContent = 'No goals yet';
                return;
            }

            const completionRate = this.calculateGoalCompletionRate(goals);
            element.textContent = `${completionRate}%`;
        } catch (error) {
            console.error('Error updating goal completion rate:', error);
            element.textContent = 'Error';
        }
    }

    // Calculate day productivity
    calculateDayProductivity(activities) {
        const dayProductivity = {};
        
        activities.forEach(activity => {
            const date = new Date(activity.date).toDateString();
            if (!dayProductivity[date]) {
                dayProductivity[date] = {
                    count: 0,
                    duration: 0,
                    mood: 0,
                    moodCount: 0
                };
            }
            
            dayProductivity[date].count++;
            dayProductivity[date].duration += parseInt(activity.duration) || 0;
            
            if (activity.mood) {
                dayProductivity[date].mood += parseInt(activity.mood);
                dayProductivity[date].moodCount++;
            }
        });
        
        return dayProductivity;
    }

    // Find most productive day
    findMostProductiveDay(dayProductivity) {
        let mostProductive = null;
        let highestScore = -1;
        
        Object.entries(dayProductivity).forEach(([date, data]) => {
            const score = (data.count * 10) + (data.duration / 60) + (data.mood / data.moodCount);
            
            if (score > highestScore) {
                highestScore = score;
                mostProductive = date;
            }
        });
        
        if (!mostProductive) return 'No data';
        
        const day = new Date(mostProductive).toLocaleDateString('en-US', { weekday: 'long' });
        return day;
    }

    // Calculate best habit streak
    calculateBestHabitStreak(habits, habitCompletions) {
        let bestStreak = 0;
        
        habits.forEach(habit => {
            const streak = this.calculateHabitStreak(habit.id, habitCompletions);
            if (streak > bestStreak) {
                bestStreak = streak;
            }
        });
        
        return bestStreak;
    }

    // Calculate habit streak for a specific habit
    calculateHabitStreak(habitId, habitCompletions) {
        let currentStreak = 0;
        let maxStreak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) { // Check last year
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayCompletions = habitCompletions[dateString] || {};
            const isCompleted = dayCompletions[habitId] === true;
            
            if (isCompleted) {
                currentStreak++;
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        }
        
        return maxStreak;
    }

    // Calculate financial growth
    calculateFinancialGrowth(transactions) {
        if (transactions.length === 0) return 'No data';
        
        // Group transactions by month
        const monthlyData = {};
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
            }
            
            if (transaction.type === 'income') {
                monthlyData[monthKey].income += parseFloat(transaction.amount);
            } else {
                monthlyData[monthKey].expense += parseFloat(transaction.amount);
            }
        });
        
        // Calculate growth trend
        const months = Object.keys(monthlyData).sort();
        if (months.length < 2) return 'Insufficient data';
        
        const firstMonth = monthlyData[months[0]];
        const lastMonth = monthlyData[months[months.length - 1]];
        
        const firstNet = firstMonth.income - firstMonth.expense;
        const lastNet = lastMonth.income - lastMonth.expense;
        
        if (firstNet === 0) return 'No baseline';
        
        const growthPercentage = ((lastNet - firstNet) / Math.abs(firstNet)) * 100;
        
        if (growthPercentage > 0) {
            return `+${growthPercentage.toFixed(1)}%`;
        } else {
            return `${growthPercentage.toFixed(1)}%`;
        }
    }

    // Calculate goal completion rate
    calculateGoalCompletionRate(goals) {
        if (goals.length === 0) return 0;
        
        const completedGoals = goals.filter(goal => goal.status === 'achieved').length;
        const completionRate = Math.round((completedGoals / goals.length) * 100);
        
        return completionRate;
    }

    // Get comprehensive insights report
    getInsightsReport() {
        try {
            const activities = lifeAnalysisStorage.getData('activities');
            
            let habits = [];
            let habitCompletions = {};
            if (window.app && window.app.habitsManager) {
                habits = window.app.habitsManager.getHabits();
                habitCompletions = window.app.habitsManager.getCompletions();
            } else if (window.habitsManager) {
                habits = window.habitsManager.getHabits();
                habitCompletions = window.habitsManager.getCompletions();
            } else if (window.app && window.app.habits) {
                habits = window.app.habits;
                habitCompletions = window.app.habitCompletions || {};
            } else {
                // Try multiple possible localStorage keys for habits (including mysecbrain_ prefix)
                const possibleHabitKeys = [
                    'mysecbrain_habits',
                    'habits',
                    'habit_list',
                    'my_habits',
                    'user_habits',
                    'daily_habits',
                    'habit_data'
                ];
                
                const possibleCompletionKeys = [
                    'mysecbrain_completions',
                    'habit_completions',
                    'habit_completions_data',
                    'daily_completions',
                    'completions',
                    'habit_status'
                ];
                
                // Find habits data
                for (const key of possibleHabitKeys) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        try {
                            const parsed = JSON.parse(data);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                habits = parsed;
                                break;
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }
                    }
                }
                
                // Find habit completions data
                for (const key of possibleCompletionKeys) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        try {
                            const parsed = JSON.parse(data);
                            if (typeof parsed === 'object' && parsed !== null) {
                                habitCompletions = parsed;
                                break;
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }
                    }
                }
            }
            
            let projects = [];
            let tasks = [];
            if (window.crmApp && window.crmApp.crmManager) {
                projects = window.crmApp.crmManager.getProjects();
                tasks = window.crmApp.crmManager.getTasks();
            } else if (window.crmManager) {
                projects = window.crmManager.getProjects();
                tasks = window.crmManager.getTasks();
            } else {
                projects = JSON.parse(localStorage.getItem('crm_projects') || '[]');
                tasks = JSON.parse(localStorage.getItem('crm_tasks') || '[]');
            }
            
            let transactions = [];
            let goals = [];
            if (window.walletApp && window.walletApp.transactionsManager) {
                transactions = window.walletApp.transactionsManager.getTransactions();
                goals = window.walletApp.goalsManager.getGoals();
            } else if (window.walletTransactionsManager) {
                transactions = window.walletTransactionsManager.getTransactions();
                goals = window.walletGoalsManager ? window.walletGoalsManager.getGoals() : [];
            } else {
                transactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
                goals = JSON.parse(localStorage.getItem('wallet_goals') || '[]');
            }
            
            const report = {
                productivity: this.getProductivityInsights(activities),
                life: this.getLifeInsights(habits),
                work: this.getWorkInsights(projects),
                finance: this.getFinanceInsights(transactions),
                goals: this.getGoalsInsights(goals),
                trends: this.getTrendInsights(activities)
            };
            
            return report;
        } catch (error) {
            console.error('Error generating insights report:', error);
            return null;
        }
    }

    // Get productivity insights
    getProductivityInsights(activities) {
        if (activities.length === 0) return { message: 'No activities recorded yet' };
        
        const totalActivities = activities.length;
        const totalDuration = activities.reduce((sum, a) => sum + (parseInt(a.duration) || 0), 0);
        const averageMood = activities.filter(a => a.mood).reduce((sum, a) => sum + parseInt(a.mood), 0) / activities.filter(a => a.mood).length;
        
        return {
            totalActivities,
            totalDuration: Math.round(totalDuration / 60 * 10) / 10, // in hours
            averageMood: Math.round(averageMood * 10) / 10,
            mostActiveCategory: this.getMostActiveCategory(activities)
        };
    }

    // Get life insights (formerly habits)
    getLifeInsights(habits) {
        if (habits.length === 0) return { message: 'No life activities defined yet' };
        
        return {
            totalLifeActivities: habits.length,
            categories: this.getLifeCategories(habits),
            averageFrequency: this.getAverageLifeFrequency(habits)
        };
    }

    // Get work insights
    getWorkInsights(projects) {
        if (projects.length === 0) return { message: 'No projects yet' };
        
        const completed = projects.filter(p => p.status === 'completed').length;
        const inProgress = projects.filter(p => p.status === 'in-progress').length;
        const pending = projects.filter(p => p.status === 'pending').length;
        
        return {
            totalProjects: projects.length,
            completed,
            inProgress,
            pending,
            completionRate: Math.round((completed / projects.length) * 100)
        };
    }

    // Get finance insights
    getFinanceInsights(transactions) {
        if (transactions.length === 0) return { message: 'No transactions yet' };
        
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const netWorth = income - expenses;
        
        return {
            totalTransactions: transactions.length,
            totalIncome: income.toFixed(2),
            totalExpenses: expenses.toFixed(2),
            netWorth: netWorth.toFixed(2),
            savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
        };
    }

    // Get goals insights
    getGoalsInsights(goals) {
        if (goals.length === 0) return { message: 'No goals set yet' };
        
        const achieved = goals.filter(g => g.status === 'achieved').length;
        const inProgress = goals.filter(g => g.status === 'in-progress').length;
        const pending = goals.filter(g => g.status === 'pending').length;
        
        return {
            totalGoals: goals.length,
            achieved,
            inProgress,
            pending,
            achievementRate: Math.round((achieved / goals.length) * 100)
        };
    }

    // Get trend insights
    getTrendInsights(activities) {
        if (activities.length === 0) return { message: 'No activity data for trends' };
        
        const last7Days = this.getLast7Days();
        const weeklyTrend = last7Days.map(day => {
            const dayActivities = activities.filter(a => 
                new Date(a.date).toDateString() === new Date(day).toDateString()
            );
            return {
                day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
                count: dayActivities.length,
                duration: dayActivities.reduce((sum, a) => sum + (parseInt(a.duration) || 0), 0)
            };
        });
        
        return {
            weeklyTrend,
            averageDailyActivities: Math.round(activities.length / 7),
            mostProductiveTime: this.getMostProductiveTime(activities)
        };
    }

    // Helper methods
    getMostActiveCategory(activities) {
        const categoryCount = {};
        activities.forEach(activity => {
            categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
        });
        
        const mostActive = Object.entries(categoryCount).reduce((a, b) => 
            categoryCount[a[0]] > categoryCount[b[0]] ? a : b
        );
        
        return mostActive ? mostActive[0] : 'None';
    }

    getLifeCategories(habits) {
        const categories = {};
        habits.forEach(habit => {
            const category = habit.category || 'General';
            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
    }

    getAverageLifeFrequency(habits) {
        // This would need more complex logic based on habit frequency settings
        return 'Daily'; // Placeholder
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getMostProductiveTime(activities) {
        const hourCount = {};
        activities.forEach(activity => {
            const hour = new Date(activity.date).getHours();
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });
        
        const mostProductiveHour = Object.entries(hourCount).reduce((a, b) => 
            hourCount[a[0]] > hourCount[b[0]] ? a : b
        );
        
        if (!mostProductiveHour) return 'No data';
        
        const hour = parseInt(mostProductiveHour[0]);
        return `${hour}:00`;
    }

    // Set time period
    setTimePeriod(period) {
        this.currentPeriod = period;
        this.updateAllInsights();
    }

    // Set current date
    setCurrentDate(date) {
        this.currentDate = new Date(date);
        this.updateAllInsights();
    }

    // Force refresh from all modules
    forceRefreshFromModules() {
        console.log('Forcing insights refresh from all modules...');
        this.updateAllInsights();
    }
}

// Create global insights instance
const lifeAnalysisInsights = new LifeAnalysisInsightsManager();
window.lifeAnalysisInsights = lifeAnalysisInsights;
