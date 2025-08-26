// Life Analysis Activities Manager
class LifeAnalysisActivitiesManager {
    constructor() {
        this.currentPeriod = 'daily';
        this.currentDate = new Date();
    }

    // Add new activity
    addActivity(activityData) {
        try {
            const activities = lifeAnalysisStorage.getData('activities');
            const newActivity = {
                id: Date.now().toString(),
                title: activityData.title,
                category: activityData.category,
                date: activityData.date || new Date().toISOString(),
                duration: parseInt(activityData.duration) || 0,
                mood: parseInt(activityData.mood) || 3,
                notes: activityData.notes || '',
                createdAt: new Date().toISOString()
            };
            
            activities.unshift(newActivity);
            lifeAnalysisStorage.saveData('activities', activities);
            
            // Auto-track to other modules if enabled
            this.autoTrackToModules(newActivity);
            
            return newActivity;
        } catch (error) {
            console.error('Error adding activity:', error);
            return null;
        }
    }

    // Delete activity
    deleteActivity(activityId) {
        try {
            const activities = lifeAnalysisStorage.getData('activities');
            const filteredActivities = activities.filter(activity => activity.id !== activityId);
            lifeAnalysisStorage.saveData('activities', filteredActivities);
            return true;
        } catch (error) {
            console.error('Error deleting activity:', error);
            return false;
        }
    }

    // Get activities for current period
    getCurrentActivities() {
        return lifeAnalysisStorage.getActivitiesByPeriod(this.currentPeriod, this.currentDate);
    }

    // Set time period
    setTimePeriod(period) {
        this.currentPeriod = period;
        this.renderActivities();
    }

    // Set current date
    setCurrentDate(date) {
        this.currentDate = new Date(date);
        this.renderActivities();
    }

    // Render activities timeline
    renderActivities() {
        const timelineElement = document.getElementById('activityTimeline');
        if (!timelineElement) return;

        const activities = this.getCurrentActivities();
        
        if (activities.length === 0) {
            timelineElement.innerHTML = `
                <div class="empty-state">
                    <h4>No activities for ${this.currentPeriod} view</h4>
                    <p>Start tracking your activities to see your progress!</p>
                </div>
            `;
            return;
        }

        const activitiesHTML = activities.map(activity => this.renderActivityItem(activity)).join('');
        timelineElement.innerHTML = activitiesHTML;
    }

    // Render individual activity item
    renderActivityItem(activity) {
        const date = new Date(activity.date);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const durationText = activity.duration > 0 ? `${activity.duration} min` : '';
        const moodEmoji = this.getMoodEmoji(activity.mood);
        
        return `
            <div class="activity-item" data-id="${activity.id}">
                <div class="activity-header">
                    <h4 class="activity-title">${activity.title}</h4>
                    <span class="activity-category">${this.getCategoryLabel(activity.category)}</span>
                </div>
                
                <div class="activity-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>🕐 ${formattedTime}</span>
                    ${durationText ? `<span>⏱️ ${durationText}</span>` : ''}
                    <span>${moodEmoji} Mood: ${activity.mood}/5</span>
                </div>
                
                ${activity.notes ? `<div class="activity-notes">💭 ${activity.notes}</div>` : ''}
                
                <button class="btn btn-danger btn-sm" onclick="lifeAnalysisActivities.deleteActivity('${activity.id}')" style="margin-top: 10px;">
                    Delete
                </button>
            </div>
        `;
    }

    // Get mood emoji
    getMoodEmoji(mood) {
        const emojis = ['😞', '😕', '😐', '🙂', '😊'];
        return emojis[mood - 1] || '😐';
    }

    // Get category label
    getCategoryLabel(category) {
        const labels = {
            'habits': 'Habits & Personal',
            'work': 'Work & Projects',
            'finance': 'Finance & Money',
            'health': 'Health & Fitness',
            'learning': 'Learning & Growth',
            'social': 'Social & Relationships',
            'other': 'Other'
        };
        return labels[category] || category;
    }

    // Auto-track to other modules
    autoTrackToModules(activity) {
        try {
            // Track to habits if it's a habit-related activity
            if (activity.category === 'habits') {
                this.trackToHabits(activity);
            }
            
            // Track to CRM if it's work-related
            if (activity.category === 'work') {
                this.trackToCRM(activity);
            }
            
            // Track to wallet if it's finance-related
            if (activity.category === 'finance') {
                this.trackToWallet(activity);
            }
        } catch (error) {
            console.error('Error auto-tracking to modules:', error);
        }
    }

    // Track to habits module
    trackToHabits(activity) {
        try {
            const habits = JSON.parse(localStorage.getItem('habits') || '[]');
            const habitCompletions = JSON.parse(localStorage.getItem('habit_completions') || '{}');
            
            // Find matching habit by title
            const matchingHabit = habits.find(habit => 
                habit.name.toLowerCase().includes(activity.title.toLowerCase()) ||
                activity.title.toLowerCase().includes(habit.name.toLowerCase())
            );
            
            if (matchingHabit) {
                const today = new Date().toISOString().split('T')[0];
                if (!habitCompletions[today]) {
                    habitCompletions[today] = {};
                }
                habitCompletions[today][matchingHabit.id] = true;
                localStorage.setItem('habit_completions', JSON.stringify(habitCompletions));
            }
        } catch (error) {
            console.error('Error tracking to habits:', error);
        }
    }

    // Track to CRM module
    trackToCRM(activity) {
        try {
            const crmProjects = JSON.parse(localStorage.getItem('crm_projects') || '[]');
            const crmTasks = JSON.parse(localStorage.getItem('crm_tasks') || '[]');
            
            // Find matching project or task by title
            const matchingProject = crmProjects.find(project => 
                project.name.toLowerCase().includes(activity.title.toLowerCase()) ||
                activity.title.toLowerCase().includes(project.name.toLowerCase())
            );
            
            if (matchingProject) {
                // Update project progress or create completion log
                console.log('Activity tracked to CRM project:', matchingProject.name);
            }
        } catch (error) {
            console.error('Error tracking to CRM:', error);
        }
    }

    // Track to wallet module
    trackToWallet(activity) {
        try {
            const walletTransactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
            
            // Check if this activity might be a financial transaction
            if (activity.title.toLowerCase().includes('earned') || 
                activity.title.toLowerCase().includes('spent') ||
                activity.title.toLowerCase().includes('income') ||
                activity.title.toLowerCase().includes('expense')) {
                console.log('Activity might be financial - consider adding to wallet');
            }
        } catch (error) {
            console.error('Error tracking to wallet:', error);
        }
    }

    // Get activity statistics
    getActivityStats(period = 'daily', date = new Date()) {
        const activities = lifeAnalysisStorage.getActivitiesByPeriod(period, date);
        
        const stats = {
            total: activities.length,
            byCategory: {},
            totalDuration: 0,
            averageMood: 0,
            mostActiveHour: null
        };
        
        if (activities.length === 0) return stats;
        
        // Calculate category breakdown
        activities.forEach(activity => {
            if (!stats.byCategory[activity.category]) {
                stats.byCategory[activity.category] = 0;
            }
            stats.byCategory[activity.category]++;
            
            if (activity.duration) {
                stats.totalDuration += activity.duration;
            }
        });
        
        // Calculate average mood
        const moodActivities = activities.filter(a => a.mood);
        if (moodActivities.length > 0) {
            const totalMood = moodActivities.reduce((sum, a) => sum + a.mood, 0);
            stats.averageMood = Math.round(totalMood / moodActivities.length * 10) / 10;
        }
        
        return stats;
    }
}

// Create global activities instance
const lifeAnalysisActivities = new LifeAnalysisActivitiesManager();
window.lifeAnalysisActivities = lifeAnalysisActivities;
