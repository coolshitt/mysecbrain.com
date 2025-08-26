// Life Analysis Main Application
class LifeAnalysisApp {
    constructor() {
        this.currentPeriod = 'daily';
        this.currentDate = new Date();
        this.isInitialized = false;
    }

    // Initialize the application
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.loadTheme();
            this.initializeData();
            this.renderAll();
            this.isInitialized = true;
            
            console.log('Life Analysis App initialized successfully');
        } catch (error) {
            console.error('Error initializing Life Analysis App:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Time period selector
        const timeButtons = document.querySelectorAll('.time-selector .btn');
        timeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setTimePeriod(e.target.id.replace('Btn', ''));
            });
        });

        // Add activity button
        const addActivityBtn = document.getElementById('addActivityBtn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => this.openActivityModal());
        }

        // Activity modal
        const activityModalOverlay = document.getElementById('activityModalOverlay');
        const cancelActivityBtn = document.getElementById('cancelActivityBtn');
        const activityForm = document.getElementById('activityForm');

        if (activityModalOverlay) {
            activityModalOverlay.addEventListener('click', (e) => {
                if (e.target === activityModalOverlay) {
                    this.closeActivityModal();
                }
            });
        }

        if (cancelActivityBtn) {
            cancelActivityBtn.addEventListener('click', () => this.closeActivityModal());
        }

        if (activityForm) {
            activityForm.addEventListener('submit', (e) => this.handleActivitySubmit(e));
        }

        // Export report button
        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportLifeReport());
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        // Reset data button
        const resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => this.resetData());
        }

        // Set default date for activity form
        this.setDefaultActivityDate();

        // Add refresh button to actions section
        this.addRefreshButton();
    }

    // Add refresh button
    addRefreshButton() {
        const actionsSection = document.querySelector('.actions-section');
        if (actionsSection) {
            const refreshBtn = document.createElement('button');
            refreshBtn.className = 'btn btn-secondary';
            refreshBtn.id = 'refreshDataBtn';
            refreshBtn.innerHTML = '🔄 Refresh Data';
            refreshBtn.addEventListener('click', () => this.refreshAllData());
            
            // Insert before the last button
            actionsSection.insertBefore(refreshBtn, actionsSection.lastElementChild);
        }
    }

    // Load theme from storage
    loadTheme() {
        try {
            const theme = lifeAnalysisStorage.getData('theme');
            this.applyTheme(theme);
        } catch (error) {
            console.error('Error loading theme:', error);
            this.applyTheme('light');
        }
    }

    // Toggle theme
    toggleTheme() {
        try {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            this.applyTheme(newTheme);
            lifeAnalysisStorage.saveData('theme', newTheme);
            
            // Update theme toggle button
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
            }
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    // Apply theme
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        // Update charts and progress circles for new theme
        if (lifeAnalysisCharts) {
            lifeAnalysisCharts.updateChartThemes();
        }
        if (lifeAnalysisProgress) {
            lifeAnalysisProgress.updateAllProgress();
        }
    }

    // Set time period
    setTimePeriod(period) {
        this.currentPeriod = period;
        
        // Update button states
        const timeButtons = document.querySelectorAll('.time-selector .btn');
        timeButtons.forEach(button => {
            button.classList.remove('active', 'btn-primary');
            button.classList.add('btn-secondary');
        });
        
        const activeButton = document.getElementById(period + 'Btn');
        if (activeButton) {
            activeButton.classList.remove('btn-secondary');
            activeButton.classList.add('btn-primary', 'active');
        }
        
        // Update all components
        this.updateAllComponents();
    }

    // Initialize data
    initializeData() {
        // Set default activity date to current date/time
        this.setDefaultActivityDate();
        
        // Wait a bit for other modules to load, then refresh data
        setTimeout(() => {
            this.refreshAllData();
        }, 1000);
    }

    // Set default activity date
    setDefaultActivityDate() {
        const activityDateInput = document.getElementById('activityDate');
        if (activityDateInput) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            activityDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }

    // Render all components
    renderAll() {
        try {
            // Update progress
            if (lifeAnalysisProgress) {
                lifeAnalysisProgress.updateAllProgress();
            }
            
            // Update activities
            if (lifeAnalysisActivities) {
                lifeAnalysisActivities.renderActivities();
            }
            
            // Update charts
            if (lifeAnalysisCharts) {
                lifeAnalysisCharts.renderAllCharts();
            }
            
            // Update insights
            if (lifeAnalysisInsights) {
                lifeAnalysisInsights.updateAllInsights();
            }
        } catch (error) {
            console.error('Error rendering all components:', error);
        }
    }

    // Update all components for current time period
    updateAllComponents() {
        try {
            // Update progress
            if (lifeAnalysisProgress) {
                lifeAnalysisProgress.setTimePeriod(this.currentPeriod);
            }
            
            // Update activities
            if (lifeAnalysisActivities) {
                lifeAnalysisActivities.setTimePeriod(this.currentPeriod);
            }
            
            // Update charts
            if (lifeAnalysisCharts) {
                lifeAnalysisCharts.setTimePeriod(this.currentPeriod);
            }
            
            // Update insights
            if (lifeAnalysisInsights) {
                lifeAnalysisInsights.setTimePeriod(this.currentPeriod);
            }
        } catch (error) {
            console.error('Error updating components:', error);
        }
    }

    // Refresh all data from modules
    refreshAllData() {
        try {
            console.log('Refreshing all data from modules...');
            
            // Force refresh from all modules
            if (lifeAnalysisProgress) {
                lifeAnalysisProgress.forceRefreshFromModules();
            }
            if (lifeAnalysisCharts) {
                lifeAnalysisCharts.forceRefreshFromModules();
            }
            if (lifeAnalysisInsights) {
                lifeAnalysisInsights.forceRefreshFromModules();
            }
            
            // Show success message
            this.showMessage('Data refreshed successfully!', 'success');
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showMessage('Error refreshing data. Please try again.', 'error');
        }
    }

    // Open activity modal
    openActivityModal() {
        const modal = document.getElementById('activityModalOverlay');
        if (modal) {
            modal.classList.add('active');
            // Focus on first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    // Close activity modal
    closeActivityModal() {
        const modal = document.getElementById('activityModalOverlay');
        if (modal) {
            modal.classList.remove('active');
            // Reset form
            const form = document.getElementById('activityForm');
            if (form) {
                form.reset();
                this.setDefaultActivityDate();
            }
        }
    }

    // Handle activity form submission
    handleActivitySubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const activityData = {
                title: formData.get('activityTitle') || document.getElementById('activityTitle').value,
                category: formData.get('activityCategory') || document.getElementById('activityCategory').value,
                date: formData.get('activityDate') || document.getElementById('activityDate').value,
                duration: formData.get('activityDuration') || document.getElementById('activityDuration').value,
                mood: formData.get('activityMood') || document.getElementById('activityMood').value,
                notes: formData.get('activityNotes') || document.getElementById('activityNotes').value
            };
            
            // Add activity
            if (lifeAnalysisActivities) {
                const newActivity = lifeAnalysisActivities.addActivity(activityData);
                if (newActivity) {
                    // Close modal and refresh
                    this.closeActivityModal();
                    this.renderAll();
                    
                    // Show success message
                    this.showMessage('Activity added successfully!', 'success');
                } else {
                    this.showMessage('Error adding activity. Please try again.', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling activity submission:', error);
            this.showMessage('Error adding activity. Please try again.', 'error');
        }
    }

    // Export life report
    exportLifeReport() {
        try {
            const reportData = {
                exportInfo: {
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                    description: 'MySecBrain Life Analysis Report'
                },
                timePeriod: this.currentPeriod,
                currentDate: this.currentDate.toISOString(),
                progress: lifeAnalysisProgress ? lifeAnalysisProgress.getProgressSummary() : {},
                insights: lifeAnalysisInsights ? lifeAnalysisInsights.getInsightsReport() : {},
                activities: lifeAnalysisStorage.getData('activities'),
                settings: lifeAnalysisStorage.getData('settings')
            };
            
            const dataStr = JSON.stringify(reportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `life-analysis-report-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showMessage('Life report exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting life report:', error);
            this.showMessage('Error exporting report. Please try again.', 'error');
        }
    }

    // Open settings
    openSettings() {
        this.showMessage('Settings feature coming soon!', 'info');
    }

    // Reset data
    resetData() {
        if (confirm('Are you sure you want to reset all Life Analysis data? This action cannot be undone.')) {
            try {
                if (lifeAnalysisStorage) {
                    lifeAnalysisStorage.clearAllData();
                }
                
                this.renderAll();
                this.showMessage('All data has been reset.', 'success');
            } catch (error) {
                console.error('Error resetting data:', error);
                this.showMessage('Error resetting data. Please try again.', 'error');
            }
        }
    }

    // Show message
    showMessage(message, type = 'info') {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: var(--bg-primary);
            background: var(--text-primary);
            border: 2px solid var(--border-color);
            z-index: 1002;
            font-weight: 500;
            box-shadow: var(--shadow);
        `;
        
        document.body.appendChild(messageElement);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }

    // Refresh data from other modules
    refreshFromOtherModules() {
        try {
            // This will be called when data changes in other modules
            this.renderAll();
        } catch (error) {
            console.error('Error refreshing from other modules:', error);
        }
    }

    // Check module availability
    checkModuleAvailability() {
        const modules = {
            'Main App': !!window.app,
            'CRM Module': !!window.crmApp,
            'Wallet Module': !!window.walletApp,
            'Habits Manager': !!(window.app && window.app.habitsManager),
            'CRM Manager': !!(window.crmApp && window.crmApp.crmManager),
            'Wallet Transactions': !!(window.walletApp && window.walletApp.transactionsManager),
            'Wallet Budgets': !!(window.walletApp && window.walletApp.budgetsManager),
            'Wallet Goals': !!(window.walletApp && window.walletApp.goalsManager)
        };
        
        // Check for alternative module structures
        const alternativeModules = {
            'Direct Habits Manager': !!window.habitsManager,
            'Direct CRM Manager': !!window.crmManager,
            'Direct Wallet Transactions': !!window.walletTransactionsManager,
            'Direct Wallet Budgets': !!window.walletBudgetsManager,
            'Direct Wallet Goals': !!window.walletGoalsManager,
            'App Habits': !!(window.app && window.app.habits),
            'App Habit Completions': !!(window.app && window.app.habitCompletions)
        };
        
        // Check localStorage data
        const localStorageData = {
            'habits': localStorage.getItem('habits') ? JSON.parse(localStorage.getItem('habits')).length : 0,
            'habit_completions': localStorage.getItem('habit_completions') ? Object.keys(JSON.parse(localStorage.getItem('habit_completions'))).length : 0,
            'crm_projects': localStorage.getItem('crm_projects') ? JSON.parse(localStorage.getItem('crm_projects')).length : 0,
            'crm_tasks': localStorage.getItem('crm_tasks') ? JSON.parse(localStorage.getItem('crm_tasks')).length : 0,
            'wallet_transactions': localStorage.getItem('wallet_transactions') ? JSON.parse(localStorage.getItem('wallet_transactions')).length : 0,
            'wallet_budgets': localStorage.getItem('wallet_budgets') ? JSON.parse(localStorage.getItem('wallet_budgets')).length : 0,
            'wallet_goals': localStorage.getItem('wallet_goals') ? JSON.parse(localStorage.getItem('wallet_goals')).length : 0
        };
        
        console.log('Module Availability Check:', modules);
        console.log('Alternative Module Check:', alternativeModules);
        console.log('LocalStorage Data Check:', localStorageData);
        
        // Try to get sample data from each possible source
        this.testDataSources();
        
        return { modules, alternativeModules, localStorageData };
    }

    // Test data sources to see what's available
    testDataSources() {
        console.log('=== Testing Data Sources ===');
        
        // Test habits data
        try {
            if (window.app && window.app.habitsManager) {
                const habits = window.app.habitsManager.getHabits();
                console.log('✅ App.habitsManager.getHabits():', habits.length, 'habits');
            }
        } catch (e) {
            console.log('❌ App.habitsManager.getHabits() failed:', e.message);
        }
        
        try {
            if (window.habitsManager) {
                const habits = window.habitsManager.getHabits();
                console.log('✅ window.habitsManager.getHabits():', habits.length, 'habits');
            }
        } catch (e) {
            console.log('❌ window.habitsManager.getHabits() failed:', e.message);
        }
        
        try {
            if (window.app && window.app.habits) {
                const habits = window.app.habits;
                console.log('✅ window.app.habits:', habits.length, 'habits');
            }
        } catch (e) {
            console.log('❌ window.app.habits failed:', e.message);
        }
        
        // Test localStorage
        try {
            const habits = JSON.parse(localStorage.getItem('habits') || '[]');
            console.log('✅ localStorage habits:', habits.length, 'habits');
            
            const completions = JSON.parse(localStorage.getItem('habit_completions') || '{}');
            console.log('✅ localStorage habit_completions:', Object.keys(completions).length, 'days');
        } catch (e) {
            console.log('❌ localStorage test failed:', e.message);
        }
        
        console.log('=== End Data Source Test ===');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create global app instance
        window.lifeAnalysisApp = new LifeAnalysisApp();
        
        // Initialize the app
        window.lifeAnalysisApp.init();
        
        // Check module availability after a delay
        setTimeout(() => {
            window.lifeAnalysisApp.checkModuleAvailability();
        }, 2000);
        
        console.log('Life Analysis App loaded successfully');
    } catch (error) {
        console.error('Error loading Life Analysis App:', error);
    }
});

// Add some additional chart styles
const additionalStyles = `
    <style>
        .chart-content {
            padding: 20px 0;
        }
        
        .chart-header {
            margin-bottom: 20px;
            text-align: center;
        }
        
        .chart-summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 15px;
        }
        
        .chart-stat {
            font-size: 14px;
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .chart-bars {
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            height: 150px;
            gap: 10px;
        }
        
        .chart-bar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }
        
        .chart-bar {
            width: 100%;
            max-width: 40px;
            background: var(--text-primary);
            border-radius: 4px 4px 0 0;
            position: relative;
            min-height: 20px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
        }
        
        .chart-bar-label {
            position: absolute;
            top: -25px;
            font-size: 12px;
            color: var(--text-primary);
            font-weight: 500;
        }
        
        .chart-day-label {
            margin-top: 10px;
            font-size: 12px;
            color: var(--text-secondary);
            text-align: center;
        }
        
        .chart-sections {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .chart-section h4 {
            color: var(--text-primary);
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .chart-progress {
            margin-bottom: 15px;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--border-color);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--text-primary);
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .status-breakdown {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .status-item {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            background: var(--bg-secondary);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
        }
        
        .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
        }
    </style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);
