/* Main Application for MySecBrain */

class MySecBrainApp {
    constructor() {
        this.theme = 'light';
        this.calendar = new CalendarManager();
        this.habits = new HabitsManager();
        
        this.habits.onHabitChange = () => {
            this.render();
            this.updateDataStats(); // Update stats when habits change
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadTheme();
        this.applyTheme();
        this.setupEventListeners();
        this.setupCallbacks();
        this.loadData();
        this.render();
        
        // Update data stats after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.updateDataStats();
        }, 100);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.calendar.changeMonth(-1);
            this.updateCalendarProgress();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.calendar.changeMonth(1);
            this.updateCalendarProgress();
        });

        // Export/Import buttons
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e);
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetData();
        });

        // Universal Import/Export
        document.getElementById('universalExportBtn').addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('universalImportBtn').addEventListener('click', () => {
            document.getElementById('universalImportFile').click();
        });

        document.getElementById('universalImportFile').addEventListener('change', (e) => {
            this.importAllData(e);
        });

        // Habits management
        document.getElementById('manageHabitsBtn').addEventListener('click', () => {
            this.habits.openManageModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.habits.closeModal();
        });

        document.getElementById('closeManageHabitsModal').addEventListener('click', () => {
            this.habits.closeManageModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.habits.closeModal();
            }
        });

        document.getElementById('manageHabitsModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.habits.closeManageModal();
            }
        });

        // Add new habit
        document.getElementById('addHabitBtn').addEventListener('click', () => {
            this.addNewHabit();
        });

        // Enter key for new habit input
        document.getElementById('newHabitInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewHabit();
            }
        });
    }

    /**
     * Setup callback functions between modules
     */
    setupCallbacks() {
        // Calendar date selection callback
        this.calendar.setDateSelectCallback((date) => {
            this.habits.openModal(date);
        });

        // Habits change callback
        this.habits.setHabitChangeCallback(() => {
            this.updateCalendarProgress();
        });
    }

    /**
     * Load data from storage
     */
    loadData() {
        this.habits.loadHabits();
    }

    /**
     * Render the application
     */
    render() {
        this.calendar.render();
        this.habits.render();
        this.updateCalendarProgress();
        this.updateDataStats();
    }

    /**
     * Update data statistics display
     */
    updateDataStats() {
        try {
            // Check if elements exist before updating
            const habitsCountElement = document.getElementById('habitsCount');
            const projectsCountElement = document.getElementById('projectsCount');
            const tasksCountElement = document.getElementById('tasksCount');
            const transactionsCountElement = document.getElementById('transactionsCount');
            const budgetsCountElement = document.getElementById('budgetsCount');
            
            if (!habitsCountElement || !projectsCountElement || !tasksCountElement || 
                !transactionsCountElement || !budgetsCountElement) {
                console.log('Data stats elements not found yet, skipping update');
                return;
            }
            
            // Get habits count
            const habitsCount = this.habits.getHabits().length;
            
            // Get CRM data counts
            const projectsCount = JSON.parse(localStorage.getItem('crm_projects') || '[]').length;
            const tasksCount = JSON.parse(localStorage.getItem('crm_tasks') || '[]').length;
            
            // Get wallet data counts
            const transactionsCount = JSON.parse(localStorage.getItem('wallet_transactions') || '[]').length;
            const budgetsCount = JSON.parse(localStorage.getItem('wallet_budgets') || '[]').length;
            
            // Update display
            habitsCountElement.textContent = habitsCount;
            projectsCountElement.textContent = projectsCount;
            tasksCountElement.textContent = tasksCount;
            transactionsCountElement.textContent = transactionsCount;
            budgetsCountElement.textContent = budgetsCount;
            
            console.log('Data stats updated:', { habitsCount, projectsCount, tasksCount, transactionsCount, budgetsCount });
            
        } catch (error) {
            console.error('Error updating data stats:', error);
        }
    }

    /**
     * Update calendar progress indicators
     */
    updateCalendarProgress() {
        const dates = Object.keys(this.habits.completions);
        dates.forEach(dateStr => {
            const date = new Date(dateStr);
            const progress = this.habits.calculateProgressForDate(date);
            this.calendar.addProgressIndicator(date, progress);
        });
    }

    /**
     * Load theme from storage
     */
    loadTheme() {
        this.theme = storage.load('theme', 'light');
    }

    /**
     * Save theme to storage
     */
    saveTheme() {
        storage.save('theme', this.theme);
    }

    /**
     * Apply current theme
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    /**
     * Export all data
     */
    exportData() {
        const data = this.habits.exportData();
        const filename = `mysecbrain_habits_${new Date().toISOString().split('T')[0]}.json`;
        Utils.downloadFile(JSON.stringify(data, null, 2), filename);
    }

    /**
     * Export all data (habits + CRM)
     */
    exportAllData() {
        try {
            // Get habits data
            const habitsData = this.habits.exportData();
            
            // Get CRM data from localStorage
            const crmProjects = JSON.parse(localStorage.getItem('crm_projects') || '[]');
            const crmTasks = JSON.parse(localStorage.getItem('crm_tasks') || '[]');
            const crmTheme = localStorage.getItem('crm_theme') || 'light';
            
            // Get wallet data from localStorage
            const walletTransactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
            const walletBudgets = JSON.parse(localStorage.getItem('wallet_budgets') || '[]');
            const walletGoals = JSON.parse(localStorage.getItem('wallet_goals') || '[]');
            const walletTheme = localStorage.getItem('wallet_theme') || 'light';
            
            // Get main app theme
            const mainTheme = localStorage.getItem('mysecbrain_theme') || 'light';
            
            // Combine all data
            const allData = {
                exportInfo: {
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                    description: 'Complete MySecBrain backup including habits, CRM, and wallet data'
                },
                habits: habitsData,
                crm: {
                    projects: crmProjects,
                    tasks: crmTasks,
                    theme: crmTheme
                },
                wallet: {
                    transactions: walletTransactions,
                    budgets: walletBudgets,
                    goals: walletGoals,
                    theme: walletTheme
                },
                mainApp: {
                    theme: mainTheme
                }
            };

            const filename = `mysecbrain_complete_backup_${new Date().toISOString().split('T')[0]}.json`;
            Utils.downloadFile(JSON.stringify(allData, null, 2), filename);
            
            Utils.showAlert('Complete backup exported successfully!');
        } catch (error) {
            console.error('Error exporting all data:', error);
            Utils.showAlert('Error exporting data: ' + error.message);
        }
    }

    /**
     * Import all data (habits + CRM)
     */
    importAllData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Check if this is a complete backup or just habits
                if (data.habits && data.crm) {
                    // Complete backup - import everything
                    this.importCompleteBackup(data);
                } else if (data.habits) {
                    // Just habits data - use existing import
                    if (this.habits.importData(data)) {
                        Utils.showAlert('Habits data imported successfully!');
                        this.render();
                    } else {
                        Utils.showAlert('Invalid habits file format');
                    }
                } else {
                    Utils.showAlert('Unsupported file format');
                }
                
                // Reset file input
                event.target.value = '';
                document.getElementById('selectedFileName').textContent = '';
                
            } catch (error) {
                console.error('Error importing data:', error);
                Utils.showAlert('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Show selected filename
        document.getElementById('selectedFileName').textContent = file.name;
    }

    /**
     * Import complete backup data
     */
    importCompleteBackup(data) {
        try {
            // Import habits data
            if (data.habits) {
                this.habits.importData(data.habits);
            }
            
            // Import CRM data
            if (data.crm) {
                if (data.crm.projects) {
                    localStorage.setItem('crm_projects', JSON.stringify(data.crm.projects));
                }
                if (data.crm.tasks) {
                    localStorage.setItem('crm_tasks', JSON.stringify(data.crm.tasks));
                }
                if (data.crm.theme) {
                    localStorage.setItem('crm_theme', data.crm.theme);
                }
            }
            
            // Import wallet data
            if (data.wallet) {
                if (data.wallet.transactions) {
                    localStorage.setItem('wallet_transactions', JSON.stringify(data.wallet.transactions));
                }
                if (data.wallet.budgets) {
                    localStorage.setItem('wallet_budgets', JSON.stringify(data.wallet.budgets));
                }
                if (data.wallet.goals) {
                    localStorage.setItem('wallet_goals', JSON.stringify(data.wallet.goals));
                }
                if (data.wallet.theme) {
                    localStorage.setItem('wallet_theme', data.wallet.theme);
                }
            }
            
            // Import main app theme
            if (data.mainApp && data.mainApp.theme) {
                localStorage.setItem('mysecbrain_theme', data.mainApp.theme);
                this.theme = data.mainApp.theme;
                this.applyTheme();
            }
            
            this.render();
            Utils.showAlert('Complete backup imported successfully! All data has been restored.');
            
        } catch (error) {
            console.error('Error importing complete backup:', error);
            Utils.showAlert('Error importing backup: ' + error.message);
        }
    }

    /**
     * Import data from file
     * @param {Event} event - File input change event
     */
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (this.habits.importData(data)) {
                    Utils.showAlert('Data imported successfully!');
                    this.render();
                } else {
                    Utils.showAlert('Invalid file format');
                }
            } catch (error) {
                Utils.showAlert('Error reading file');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Reset all data
     */
    resetData() {
        if (Utils.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            this.habits.resetData();
            Utils.showAlert('Data reset successfully!');
            this.render();
        }
    }

    /**
     * Add new habit
     */
    addNewHabit() {
        const input = document.getElementById('newHabitInput');
        const habitText = input.value.trim();
        
        if (habitText) {
            this.habits.addHabit(habitText);
            input.value = '';
            Utils.showAlert('Habit added successfully!');
            this.render();
        } else {
            Utils.showAlert('Please enter a habit description');
        }
    }

    /**
     * Get app statistics
     * @returns {Object} App statistics
     */
    getStats() {
        const totalDays = Object.keys(this.habits.completions).length;
        const totalHabits = this.habits.getHabits().length;
        const totalCompletions = Object.values(this.habits.completions)
            .flat()
            .filter(Boolean).length;
        
        return {
            totalDays,
            totalHabits,
            totalCompletions,
            averageCompletion: totalDays > 0 ? (totalCompletions / (totalDays * totalHabits) * 100).toFixed(1) : 0
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if localStorage is available
    if (!storage.isAvailable()) {
        alert('localStorage is not available. The app may not work properly.');
    }
    
    // Create and initialize the app
    window.mySecBrainApp = new MySecBrainApp();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MySecBrainApp, CalendarManager, HabitsManager, StorageManager, Utils };
}
