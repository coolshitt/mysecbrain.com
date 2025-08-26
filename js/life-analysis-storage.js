// Life Analysis Storage Manager
class LifeAnalysisStorageManager {
    constructor() {
        this.storageKeys = {
            activities: 'life_analysis_activities',
            progress: 'life_analysis_progress',
            settings: 'life_analysis_settings',
            theme: 'life_analysis_theme'
        };
    }

    // Get data from localStorage
    getData(key) {
        try {
            const data = localStorage.getItem(this.storageKeys[key]);
            return data ? JSON.parse(data) : this.getDefaultData(key);
        } catch (error) {
            console.error(`Error getting ${key} data:`, error);
            return this.getDefaultData(key);
        }
    }

    // Save data to localStorage
    saveData(key, data) {
        try {
            localStorage.setItem(this.storageKeys[key], JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} data:`, error);
            return false;
        }
    }

    // Get default data for each type
    getDefaultData(key) {
        switch (key) {
            case 'activities':
                return [];
            case 'progress':
                return {
                    habits: { completed: 0, total: 0, percentage: 0 },
                    projects: { completed: 0, total: 0, percentage: 0 },
                    finances: { balance: 0, percentage: 0 },
                    goals: { completed: 0, total: 0, percentage: 0 }
                };
            case 'settings':
                return {
                    autoTrack: true,
                    trackMood: true,
                    trackDuration: true,
                    defaultTimePeriod: 'daily'
                };
            case 'theme':
                return 'light';
            default:
                return null;
        }
    }

    // Clear all life analysis data
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing life analysis data:', error);
            return false;
        }
    }

    // Export all life analysis data
    exportAllData() {
        try {
            const data = {
                exportInfo: {
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                    description: 'MySecBrain Life Analysis backup'
                },
                activities: this.getData('activities'),
                progress: this.getData('progress'),
                settings: this.getData('settings'),
                theme: this.getData('theme')
            };
            return data;
        } catch (error) {
            console.error('Error exporting life analysis data:', error);
            return null;
        }
    }

    // Import life analysis data
    importData(data) {
        try {
            if (data.activities) {
                this.saveData('activities', data.activities);
            }
            if (data.progress) {
                this.saveData('progress', data.progress);
            }
            if (data.settings) {
                this.saveData('settings', data.settings);
            }
            if (data.theme) {
                this.saveData('theme', data.theme);
            }
            return true;
        } catch (error) {
            console.error('Error importing life analysis data:', error);
            return false;
        }
    }

    // Get activities by time period
    getActivitiesByPeriod(period, date) {
        const activities = this.getData('activities');
        const targetDate = new Date(date);
        
        switch (period) {
            case 'daily':
                return activities.filter(activity => {
                    const activityDate = new Date(activity.date);
                    return activityDate.toDateString() === targetDate.toDateString();
                });
            case 'weekly':
                const weekStart = new Date(targetDate);
                weekStart.setDate(targetDate.getDate() - targetDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                
                return activities.filter(activity => {
                    const activityDate = new Date(activity.date);
                    return activityDate >= weekStart && activityDate <= weekEnd;
                });
            case 'monthly':
                return activities.filter(activity => {
                    const activityDate = new Date(activity.date);
                    return activityDate.getMonth() === targetDate.getMonth() && 
                           activityDate.getFullYear() === targetDate.getFullYear();
                });
            case 'yearly':
                return activities.filter(activity => {
                    const activityDate = new Date(activity.date);
                    return activityDate.getFullYear() === targetDate.getFullYear();
                });
            default:
                return activities;
        }
    }

    // Get activities by category
    getActivitiesByCategory(category, period = 'all', date = new Date()) {
        let activities = this.getData('activities');
        
        if (period !== 'all') {
            activities = this.getActivitiesByPeriod(period, date);
        }
        
        return activities.filter(activity => activity.category === category);
    }

    // Get mood trends
    getMoodTrends(period, date) {
        const activities = this.getActivitiesByPeriod(period, date);
        const moodData = activities
            .filter(activity => activity.mood)
            .map(activity => ({
                date: new Date(activity.date),
                mood: parseInt(activity.mood),
                category: activity.category
            }));
        
        return moodData;
    }

    // Get productivity trends
    getProductivityTrends(period, date) {
        const activities = this.getActivitiesByPeriod(period, date);
        const productivityData = activities
            .filter(activity => activity.duration)
            .map(activity => ({
                date: new Date(activity.date),
                duration: parseInt(activity.duration),
                category: activity.category,
                title: activity.title
            }));
        
        return productivityData;
    }
}

// Create global storage instance
const lifeAnalysisStorage = new LifeAnalysisStorageManager();
window.lifeAnalysisStorage = lifeAnalysisStorage;
