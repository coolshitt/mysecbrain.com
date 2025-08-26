// Life Analysis Charts Manager
class LifeAnalysisChartsManager {
    constructor() {
        this.currentPeriod = 'daily';
        this.currentDate = new Date();
    }

    // Render all charts
    renderAllCharts() {
        this.renderLifeChart();
        this.renderProjectsChart();
    }

    // Render life consistency chart (formerly habits)
    renderLifeChart() {
        const chartElement = document.getElementById('lifeChart');
        if (!chartElement) return;

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
                chartElement.innerHTML = '<div class="chart-placeholder">No life activities found. Add some habits to see your consistency!</div>';
                return;
            }

            // Get last 7 days of data
            const last7Days = this.getLast7Days();
            const chartData = this.getLifeChartData(habits, habitCompletions, last7Days);
            
            const chartHTML = this.createLifeChartHTML(chartData, habits);
            chartElement.innerHTML = chartHTML;
            
        } catch (error) {
            console.error('Error rendering life chart:', error);
            chartElement.innerHTML = '<div class="chart-placeholder">Error loading life chart</div>';
        }
    }

    // Render projects completion chart
    renderProjectsChart() {
        const chartElement = document.getElementById('projectsChart');
        if (!chartElement) return;

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
                chartElement.innerHTML = '<div class="chart-placeholder">No projects or tasks found. Start managing your work!</div>';
                return;
            }

            const chartData = this.getProjectsChartData(projects, tasks);
            const chartHTML = this.createProjectsChartHTML(chartData);
            chartElement.innerHTML = chartHTML;
            
        } catch (error) {
            console.error('Error rendering projects chart:', error);
            chartElement.innerHTML = '<div class="chart-placeholder">Error loading projects chart</div>';
        }
    }

    // Get last 7 days
    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    // Get life chart data (formerly habits)
    getLifeChartData(habits, habitCompletions, days) {
        const data = [];
        
        days.forEach(day => {
            const dayCompletions = habitCompletions[day] || {};
            const completedCount = Object.keys(dayCompletions).filter(habitId => 
                dayCompletions[habitId] === true
            ).length;
            
            const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
            
            data.push({
                day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
                percentage: percentage,
                completed: completedCount,
                total: habits.length
            });
        });
        
        return data;
    }

    // Get projects chart data
    getProjectsChartData(projects, tasks) {
        const data = {
            projects: {
                total: projects.length,
                completed: projects.filter(p => p.status === 'completed').length,
                inProgress: projects.filter(p => p.status === 'in-progress').length,
                pending: projects.filter(p => p.status === 'pending').length
            },
            tasks: {
                total: tasks.length,
                completed: tasks.filter(t => t.status === 'completed').length,
                inProgress: tasks.filter(t => t.status === 'in-progress').length,
                pending: tasks.filter(t => t.status === 'pending').length
            }
        };
        
        return data;
    }

    // Create life chart HTML (formerly habits)
    createLifeChartHTML(chartData, habits) {
        const maxPercentage = Math.max(...chartData.map(d => d.percentage));
        const maxHeight = 120; // Maximum height in pixels
        
        const barsHTML = chartData.map(day => {
            const height = maxPercentage > 0 ? (day.percentage / maxPercentage) * maxHeight : 0;
            const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
            const barColor = isDarkTheme ? 'var(--text-primary)' : 'var(--text-primary)';
            
            return `
                <div class="chart-bar-container">
                    <div class="chart-bar" style="height: ${height}px; background: ${barColor};">
                        <span class="chart-bar-label">${day.percentage}%</span>
                    </div>
                    <div class="chart-day-label">${day.day}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="chart-content">
                <div class="chart-header">
                    <div class="chart-summary">
                        <span class="chart-stat">${habits.length} Total Life Activities</span>
                        <span class="chart-stat">${this.getAverageCompletion(chartData)}% Avg Completion</span>
                    </div>
                </div>
                <div class="chart-bars">
                    ${barsHTML}
                </div>
            </div>
        `;
    }

    // Create projects chart HTML
    createProjectsChartHTML(chartData) {
        const { projects, tasks } = chartData;
        const totalItems = projects.total + tasks.total;
        const totalCompleted = projects.completed + tasks.completed;
        const completionRate = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
        
        const projectsHTML = `
            <div class="chart-section">
                <h4>Projects</h4>
                <div class="chart-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${projects.total > 0 ? (projects.completed / projects.total) * 100 : 0}%"></div>
                    </div>
                    <span class="progress-text">${projects.completed}/${projects.total} completed</span>
                </div>
                <div class="status-breakdown">
                    <span class="status-item completed">${projects.completed} completed</span>
                    <span class="status-item in-progress">${projects.inProgress} in progress</span>
                    <span class="status-item pending">${projects.pending} pending</span>
                </div>
            </div>
        `;
        
        const tasksHTML = `
            <div class="chart-section">
                <h4>Tasks</h4>
                <div class="chart-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0}%"></div>
                    </div>
                    <span class="progress-text">${tasks.completed}/${tasks.total} completed</span>
                </div>
                <div class="status-breakdown">
                    <span class="status-item completed">${tasks.completed} completed</span>
                    <span class="status-item in-progress">${tasks.inProgress} in progress</span>
                    <span class="status-item pending">${tasks.pending} pending</span>
                </div>
            </div>
        `;
        
        return `
            <div class="chart-content">
                <div class="chart-header">
                    <div class="chart-summary">
                        <span class="chart-stat">${totalItems} Total Items</span>
                        <span class="chart-stat">${completionRate}% Completion Rate</span>
                    </div>
                </div>
                <div class="chart-sections">
                    ${projectsHTML}
                    ${tasksHTML}
                </div>
            </div>
        `;
    }

    // Get average completion percentage
    getAverageCompletion(chartData) {
        if (chartData.length === 0) return 0;
        const total = chartData.reduce((sum, day) => sum + day.percentage, 0);
        return Math.round(total / chartData.length);
    }

    // Set time period
    setTimePeriod(period) {
        this.currentPeriod = period;
        this.renderAllCharts();
    }

    // Set current date
    setCurrentDate(date) {
        this.currentDate = new Date(date);
        this.renderAllCharts();
    }

    // Update chart themes
    updateChartThemes() {
        // Re-render charts with current theme
        this.renderAllCharts();
    }

    // Force refresh from all modules
    forceRefreshFromModules() {
        console.log('Forcing charts refresh from all modules...');
        this.renderAllCharts();
    }
}

// Create global charts instance
const lifeAnalysisCharts = new LifeAnalysisChartsManager();
window.lifeAnalysisCharts = lifeAnalysisCharts;
