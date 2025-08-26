// Life Analysis Progress Manager
class LifeAnalysisProgressManager {
    constructor() {
        this.currentPeriod = 'daily';
        this.currentDate = new Date();
    }

    // Update all progress indicators
    updateAllProgress() {
        this.updateLifeProgress();
        this.updateProjectsProgress();
        this.updateFinancesProgress();
        this.updateGoalsProgress();
    }

    // Update life progress (formerly habits)
    updateLifeProgress() {
        try {
            // Try to get habits from the main app first
            let habits = [];
            let habitCompletions = {};
            
            // Check multiple possible module structures
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
                                console.log(`Found habits data in localStorage key: ${key}`, habits);
                                break;
                            }
                        } catch (e) {
                            console.log(`Failed to parse ${key}:`, e.message);
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
                                console.log(`Found habit completions in localStorage key: ${key}`, habitCompletions);
                                break;
                            }
                        } catch (e) {
                            console.log(`Failed to parse ${key}:`, e.message);
                        }
                    }
                }
                
                // If still no habits found, try to find any data that looks like habits
                if (habits.length === 0) {
                    this.searchForHabitsData();
                }
            }
            
            if (habits.length === 0) {
                this.updateProgressCard('lifeProgress', 0, 0, 0);
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const todayCompletions = habitCompletions[today] || {};
            
            const completedToday = Object.keys(todayCompletions).filter(habitId => 
                todayCompletions[habitId] === true
            ).length;
            
            const totalHabits = habits.length;
            const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
            
            this.updateProgressCard('lifeProgress', completedToday, totalHabits, percentage);
            
        } catch (error) {
            console.error('Error updating life progress:', error);
            this.updateProgressCard('lifeProgress', 0, 0, 0);
        }
    }

    // Search for habits data in localStorage
    searchForHabitsData() {
        console.log('🔍 Searching for habits data in localStorage...');
        
        const allKeys = Object.keys(localStorage);
        const potentialHabitKeys = [];
        
        allKeys.forEach(key => {
            if (key.toLowerCase().includes('habit') || 
                key.toLowerCase().includes('daily') || 
                key.toLowerCase().includes('routine') ||
                key.toLowerCase().includes('task') ||
                key.toLowerCase().includes('activity')) {
                
                try {
                    const data = localStorage.getItem(key);
                    const parsed = JSON.parse(data);
                    
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Check if this looks like habits data
                        const firstItem = parsed[0];
                        if (firstItem && (firstItem.name || firstItem.title || firstItem.habit)) {
                            potentialHabitKeys.push({
                                key: key,
                                count: parsed.length,
                                sample: firstItem
                            });
                        }
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }
        });
        
        if (potentialHabitKeys.length > 0) {
            console.log('🎯 Potential habits data found:', potentialHabitKeys);
        } else {
            console.log('❌ No potential habits data found in localStorage');
        }
        
        return potentialHabitKeys;
    }

    // Update projects progress
    updateProjectsProgress() {
        try {
            let projects = [];
            let tasks = [];
            
            // Try to get data from CRM module first
            if (window.crmApp && window.crmApp.crmManager) {
                projects = window.crmApp.crmManager.getProjects();
                tasks = window.crmApp.crmManager.getTasks();
            } else if (window.crmManager) {
                projects = window.crmManager.getProjects();
                tasks = window.crmManager.getTasks();
            } else {
                // Fallback to localStorage
                projects = JSON.parse(localStorage.getItem('crm_projects') || '[]');
                tasks = JSON.parse(localStorage.getItem('crm_tasks') || '[]');
            }
            
            if (projects.length === 0 && tasks.length === 0) {
                this.updateProgressCard('projectsProgress', 0, 0, 0);
                return;
            }

            let completedProjects = 0;
            let totalProjects = projects.length;
            
            // Count completed projects
            projects.forEach(project => {
                if (project.status === 'completed') {
                    completedProjects++;
                }
            });
            
            // Count completed tasks
            let completedTasks = 0;
            let totalTasks = tasks.length;
            
            tasks.forEach(task => {
                if (task.status === 'completed') {
                    completedTasks++;
                }
            });
            
            const totalCompleted = completedProjects + completedTasks;
            const totalItems = totalProjects + totalTasks;
            const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
            
            this.updateProgressCard('projectsProgress', totalCompleted, totalItems, percentage);
            
        } catch (error) {
            console.error('Error updating projects progress:', error);
            this.updateProgressCard('projectsProgress', 0, 0, 0);
        }
    }

    // Update finances progress
    updateFinancesProgress() {
        try {
            let transactions = [];
            let budgets = [];
            
            // Try to get data from Wallet module first
            if (window.walletApp && window.walletApp.transactionsManager) {
                transactions = window.walletApp.transactionsManager.getTransactions();
                budgets = window.walletApp.budgetsManager.getBudgets();
            } else if (window.walletTransactionsManager) {
                transactions = window.walletTransactionsManager.getTransactions();
                budgets = window.walletBudgetsManager ? window.walletBudgetsManager.getBudgets() : [];
            } else {
                // Fallback to localStorage
                transactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
                budgets = JSON.parse(localStorage.getItem('wallet_budgets') || '[]');
            }
            
            if (transactions.length === 0) {
                this.updateProgressCard('financesProgress', 0, 0, 0);
                return;
            }

            // Calculate current balance
            let balance = 0;
            transactions.forEach(transaction => {
                if (transaction.type === 'income') {
                    balance += parseFloat(transaction.amount);
                } else {
                    balance -= parseFloat(transaction.amount);
                }
            });
            
            // Calculate budget adherence
            let budgetScore = 0;
            if (budgets.length > 0) {
                let totalBudgetScore = 0;
                budgets.forEach(budget => {
                    const spending = parseFloat(budget.spent || 0);
                    const limit = parseFloat(budget.limit);
                    if (limit > 0) {
                        const adherence = Math.max(0, Math.min(100, ((limit - spending) / limit) * 100));
                        totalBudgetScore += adherence;
                    }
                });
                budgetScore = Math.round(totalBudgetScore / budgets.length);
            }
            
            // Use budget score as progress percentage
            this.updateProgressCard('financesProgress', balance.toFixed(2), 0, budgetScore);
            
        } catch (error) {
            console.error('Error updating finances progress:', error);
            this.updateProgressCard('financesProgress', 0, 0, 0);
        }
    }

    // Update goals progress
    updateGoalsProgress() {
        try {
            let goals = [];
            
            // Try to get data from Wallet module first
            if (window.walletApp && window.walletApp.goalsManager) {
                goals = window.walletApp.goalsManager.getGoals();
            } else if (window.walletGoalsManager) {
                goals = window.walletGoalsManager.getGoals();
            } else {
                // Fallback to localStorage
                goals = JSON.parse(localStorage.getItem('wallet_goals') || '[]');
            }
            
            if (goals.length === 0) {
                this.updateProgressCard('goalsProgress', 0, 0, 0);
                return;
            }

            let completedGoals = 0;
            let totalProgress = 0;
            
            goals.forEach(goal => {
                if (goal.status === 'achieved') {
                    completedGoals++;
                }
                totalProgress += parseFloat(goal.progress || 0);
            });
            
            const averageProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;
            const percentage = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;
            
            this.updateProgressCard('goalsProgress', completedGoals, goals.length, percentage);
            
        } catch (error) {
            console.error('Error updating goals progress:', error);
            this.updateProgressCard('goalsProgress', 0, 0, 0);
        }
    }

    // Update progress card display
    updateProgressCard(elementId, completed, total, percentage) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Update progress number
        const progressNumber = element.querySelector('.progress-number');
        if (progressNumber) {
            progressNumber.textContent = `${percentage}%`;
        }

        // Update progress stats
        const progressStats = element.closest('.progress-card').querySelector('.progress-stats');
        if (progressStats) {
            if (elementId === 'financesProgress') {
                // For finances, show balance
                const balanceElement = progressStats.querySelector('.balance');
                if (balanceElement) {
                    balanceElement.textContent = `$${completed}`;
                }
            } else {
                // For other progress cards, show completed/total
                const completedElement = progressStats.querySelector('.completed');
                const totalElement = progressStats.querySelector('.total');
                if (completedElement && totalElement) {
                    completedElement.textContent = completed;
                    totalElement.textContent = total;
                }
            }
        }

        // Update progress circle visual
        this.updateProgressCircle(element, percentage);
    }

    // Update progress circle visual
    updateProgressCircle(element, percentage) {
        const circle = element.querySelector('.progress-circle');
        if (!circle) return;

        // Remove existing progress styling
        circle.style.background = '';
        circle.style.backgroundImage = '';

        if (percentage > 0) {
            // Create circular progress using conic-gradient
            const angle = (percentage / 100) * 360;
            const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
            
            if (isDarkTheme) {
                // Dark theme: white progress on black background
                circle.style.background = `conic-gradient(var(--text-primary) 0deg ${angle}deg, var(--border-color) ${angle}deg 360deg)`;
            } else {
                // Light theme: black progress on white background
                circle.style.background = `conic-gradient(var(--text-primary) 0deg ${angle}deg, var(--border-color) ${angle}deg 360deg)`;
            }
        }
    }

    // Set time period
    setTimePeriod(period) {
        this.currentPeriod = period;
        this.updateAllProgress();
    }

    // Set current date
    setCurrentDate(date) {
        this.currentDate = new Date(date);
        this.updateAllProgress();
    }

    // Get progress summary for current period
    getProgressSummary() {
        return {
            life: this.getLifeSummary(),
            projects: this.getProjectsSummary(),
            finances: this.getFinancesSummary(),
            goals: this.getGoalsSummary()
        };
    }

    // Get life summary (formerly habits)
    getLifeSummary() {
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
            
            const today = new Date().toISOString().split('T')[0];
            const todayCompletions = habitCompletions[today] || {};
            
            const completedToday = Object.keys(todayCompletions).filter(habitId => 
                todayCompletions[habitId] === true
            ).length;
            
            return {
                total: habits.length,
                completed: completedToday,
                percentage: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting life summary:', error);
            return { total: 0, completed: 0, percentage: 0 };
        }
    }

    // Get projects summary
    getProjectsSummary() {
        try {
            let projects = [];
            let tasks = [];
            
            // Try to get data from CRM module first
            if (window.crmApp && window.crmApp.crmManager) {
                projects = window.crmApp.crmManager.getProjects();
                tasks = window.crmApp.crmManager.getTasks();
            } else if (window.crmManager) {
                projects = window.crmManager.getProjects();
                tasks = window.crmManager.getTasks();
            } else {
                // Fallback to localStorage
                projects = JSON.parse(localStorage.getItem('crm_projects') || '[]');
                tasks = JSON.parse(localStorage.getItem('crm_tasks') || '[]');
            }
            
            let completedProjects = 0;
            projects.forEach(project => {
                if (project.status === 'completed') completedProjects++;
            });
            
            let completedTasks = 0;
            tasks.forEach(task => {
                if (task.status === 'completed') completedTasks++;
            });
            
            const totalItems = projects.length + tasks.length;
            const totalCompleted = completedProjects + completedTasks;
            
            return {
                total: totalItems,
                completed: totalCompleted,
                percentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting projects summary:', error);
            return { total: 0, completed: 0, percentage: 0 };
        }
    }

    // Get finances summary
    getFinancesSummary() {
        try {
            let transactions = [];
            let budgets = [];
            
            // Try to get data from Wallet module first
            if (window.walletApp && window.walletApp.transactionsManager) {
                transactions = window.walletApp.transactionsManager.getTransactions();
                budgets = window.walletApp.budgetsManager.getBudgets();
            } else if (window.walletTransactionsManager) {
                transactions = window.walletTransactionsManager.getTransactions();
                budgets = window.walletBudgetsManager ? window.walletBudgetsManager.getBudgets() : [];
            } else {
                // Fallback to localStorage
                transactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
                budgets = JSON.parse(localStorage.getItem('wallet_budgets') || '[]');
            }
            
            let balance = 0;
            transactions.forEach(transaction => {
                if (transaction.type === 'income') {
                    balance += parseFloat(transaction.amount);
                } else {
                    balance -= parseFloat(transaction.amount);
                }
            });
            
            let budgetScore = 0;
            if (budgets.length > 0) {
                let totalBudgetScore = 0;
                budgets.forEach(budget => {
                    const spending = parseFloat(budget.spent || 0);
                    const limit = parseFloat(budget.limit);
                    if (limit > 0) {
                        const adherence = Math.max(0, Math.min(100, ((limit - spending) / limit) * 100));
                        totalBudgetScore += adherence;
                    }
                });
                budgetScore = Math.round(totalBudgetScore / budgets.length);
            }
            
            return {
                balance: balance.toFixed(2),
                percentage: budgetScore
            };
        } catch (error) {
            console.error('Error getting finances summary:', error);
            return { balance: '0.00', percentage: 0 };
        }
    }

    // Get goals summary
    getGoalsSummary() {
        try {
            let goals = [];
            
            // Try to get data from Wallet module first
            if (window.walletApp && window.walletApp.goalsManager) {
                goals = window.walletApp.goalsManager.getGoals();
            } else if (window.walletGoalsManager) {
                goals = window.walletGoalsManager.getGoals();
            } else {
                // Fallback to localStorage
                goals = JSON.parse(localStorage.getItem('wallet_goals') || '[]');
            }
            
            let completedGoals = 0;
            goals.forEach(goal => {
                if (goal.status === 'achieved') {
                    completedGoals++;
                }
            });
            
            return {
                total: goals.length,
                completed: completedGoals,
                percentage: goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting goals summary:', error);
            return { total: 0, completed: 0, percentage: 0 };
        }
    }

    // Force refresh from all modules
    forceRefreshFromModules() {
        console.log('Forcing refresh from all modules...');
        this.updateAllProgress();
    }
}

// Create global progress instance
const lifeAnalysisProgress = new LifeAnalysisProgressManager();
window.lifeAnalysisProgress = lifeAnalysisProgress;
