/**
 * Habits Module - Habit tracking and streak management
 * Helps users build and maintain productive habits
 */

class HabitsModule {
    constructor() {
        this.selectedHabit = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHabits();
    }

    setupEventListeners() {
        // Add habit button
        const addHabitBtn = document.getElementById('addHabit');
        if (addHabitBtn) {
            addHabitBtn.addEventListener('click', () => {
                this.showAddHabitModal();
            });
        }
    }

    loadHabits() {
        const habits = dataManager.getItems('habits', 'habits');
        this.renderHabits(habits);
    }

    renderHabits(habits) {
        const container = document.getElementById('habitsGrid');
        
        if (habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No habits yet</h3>
                    <p>Start building better habits to improve your life!</p>
                    <button class="add-btn" onclick="window.app.modules.habits.showAddHabitModal()">+ Add Habit</button>
                </div>
            `;
            return;
        }

        container.innerHTML = habits.map(habit => {
            const streak = this.calculateStreak(habit);
            const todayCompleted = this.isCompletedToday(habit);
            
            return `
                <div class="habit-card" data-id="${habit.id}">
                    <div class="habit-header">
                        <h3>${app.sanitizeHTML(habit.name)}</h3>
                        <div class="habit-streak">${streak} day streak</div>
                    </div>
                    
                    <div class="habit-description">
                        ${app.sanitizeHTML(habit.description || '')}
                    </div>
                    
                    <div class="habit-actions">
                        <button class="action-btn ${todayCompleted ? 'completed' : ''}" 
                                onclick="window.app.modules.habits.toggleHabitToday('${habit.id}')"
                                ${todayCompleted ? 'style="background-color: var(--color-black); color: var(--color-white);"' : ''}>
                            ${todayCompleted ? '✓ Completed Today' : 'Mark Complete'}
                        </button>
                        <button class="action-btn" onclick="window.app.modules.habits.editHabit('${habit.id}')">Edit</button>
                    </div>
                    
                    <div class="habit-calendar">
                        ${this.renderHabitCalendar(habit)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderHabitCalendar(habit) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 13); // Show last 14 days
        
        let calendarHTML = '';
        
        for (let i = 0; i < 14; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateStr = currentDate.toISOString().split('T')[0];
            const isCompleted = habit.completions && habit.completions.includes(dateStr);
            const isToday = dateStr === today.toISOString().split('T')[0];
            
            calendarHTML += `
                <div class="habit-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}"
                     data-date="${dateStr}"
                     onclick="window.app.modules.habits.toggleHabitDate('${habit.id}', '${dateStr}')"
                     title="${currentDate.toLocaleDateString()}">
                    ${currentDate.getDate()}
                </div>
            `;
        }
        
        return calendarHTML;
    }

    showAddHabitModal() {
        const modalContent = `
            <form id="habitForm">
                <div class="form-group">
                    <label class="form-label">Habit Name</label>
                    <input type="text" id="habitName" name="name" placeholder="e.g., Read for 30 minutes" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="habitDescription" name="description" rows="3" placeholder="Why is this habit important to you?"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Frequency</label>
                    <select id="habitFrequency" name="frequency" required>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target (optional)</label>
                    <input type="text" id="habitTarget" name="target" placeholder="e.g., 10,000 steps, 1 chapter">
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                    <button type="submit" class="save-btn action-btn">Create Habit</button>
                </div>
            </form>
        `;

        app.openModal('Add New Habit', modalContent);

        // Handle form submission
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHabit();
        });
    }

    editHabit(habitId) {
        const habits = dataManager.getItems('habits', 'habits');
        const habit = habits.find(h => h.id === habitId);
        
        if (!habit) return;

        const modalContent = `
            <form id="habitForm">
                <div class="form-group">
                    <label class="form-label">Habit Name</label>
                    <input type="text" id="habitName" name="name" value="${app.sanitizeHTML(habit.name)}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="habitDescription" name="description" rows="3">${app.sanitizeHTML(habit.description || '')}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Frequency</label>
                    <select id="habitFrequency" name="frequency" required>
                        <option value="daily" ${habit.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${habit.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="custom" ${habit.frequency === 'custom' ? 'selected' : ''}>Custom</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target (optional)</label>
                    <input type="text" id="habitTarget" name="target" value="${app.sanitizeHTML(habit.target || '')}" placeholder="e.g., 10,000 steps, 1 chapter">
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.modules.habits.deleteHabit('${habit.id}')">Delete</button>
                    <div>
                        <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                        <button type="submit" class="save-btn action-btn">Update Habit</button>
                    </div>
                </div>
            </form>
        `;

        app.openModal('Edit Habit', modalContent);

        // Store current habit being edited
        this.selectedHabit = habit;

        // Handle form submission
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateHabit();
        });
    }

    saveHabit() {
        const form = document.getElementById('habitForm');
        const formData = new FormData(form);
        
        const habitData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            frequency: formData.get('frequency'),
            target: formData.get('target').trim(),
            completions: []
        };

        if (!habitData.name) {
            app.showNotification('Please enter a habit name', 'error');
            return;
        }

        if (dataManager.addItem('habits', 'habits', habitData)) {
            app.showNotification('Habit created successfully!', 'success');
            app.closeModal();
            this.loadHabits();
        } else {
            app.showNotification('Failed to create habit', 'error');
        }
    }

    updateHabit() {
        if (!this.selectedHabit) return;

        const form = document.getElementById('habitForm');
        const formData = new FormData(form);
        
        const updates = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            frequency: formData.get('frequency'),
            target: formData.get('target').trim()
        };

        if (!updates.name) {
            app.showNotification('Please enter a habit name', 'error');
            return;
        }

        if (dataManager.updateItem('habits', 'habits', this.selectedHabit.id, updates)) {
            app.showNotification('Habit updated successfully!', 'success');
            app.closeModal();
            this.loadHabits();
            this.selectedHabit = null;
        } else {
            app.showNotification('Failed to update habit', 'error');
        }
    }

    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit? All progress will be lost.')) {
            if (dataManager.deleteItem('habits', 'habits', habitId)) {
                app.showNotification('Habit deleted successfully!', 'success');
                app.closeModal();
                this.loadHabits();
                this.selectedHabit = null;
            } else {
                app.showNotification('Failed to delete habit', 'error');
            }
        }
    }

    toggleHabitToday(habitId) {
        const today = new Date().toISOString().split('T')[0];
        this.toggleHabitDate(habitId, today);
    }

    toggleHabitDate(habitId, dateStr) {
        const habits = dataManager.getItems('habits', 'habits');
        const habit = habits.find(h => h.id === habitId);
        
        if (!habit) return;

        // Initialize completions array if it doesn't exist
        if (!habit.completions) {
            habit.completions = [];
        }

        // Toggle completion for the date
        const completionIndex = habit.completions.indexOf(dateStr);
        if (completionIndex > -1) {
            // Remove completion
            habit.completions.splice(completionIndex, 1);
        } else {
            // Add completion
            habit.completions.push(dateStr);
            habit.completions.sort(); // Keep dates sorted
        }

        // Update in storage
        if (dataManager.updateItem('habits', 'habits', habitId, { completions: habit.completions })) {
            this.loadHabits();
            
            // Show motivational message for completions
            if (completionIndex === -1) {
                const streak = this.calculateStreak(habit);
                if (streak > 1) {
                    app.showNotification(`Great job! ${streak} day streak!`, 'success');
                } else {
                    app.showNotification('Habit completed!', 'success');
                }
            }
        }
    }

    calculateStreak(habit) {
        if (!habit.completions || habit.completions.length === 0) {
            return 0;
        }

        const today = new Date().toISOString().split('T')[0];
        const sortedCompletions = [...habit.completions].sort().reverse();
        
        let streak = 0;
        let currentDate = new Date();
        
        // Check if today is completed
        if (sortedCompletions.includes(today)) {
            streak = 1;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            // Check if yesterday was completed (streak continues if missed today)
            currentDate.setDate(currentDate.getDate() - 1);
            const yesterday = currentDate.toISOString().split('T')[0];
            if (!sortedCompletions.includes(yesterday)) {
                return 0;
            }
        }

        // Count consecutive days backwards
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (sortedCompletions.includes(dateStr)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    isCompletedToday(habit) {
        const today = new Date().toISOString().split('T')[0];
        return habit.completions && habit.completions.includes(today);
    }

    // Get habit statistics
    getStats() {
        const habits = dataManager.getItems('habits', 'habits');
        const totalHabits = habits.length;
        const completedToday = habits.filter(h => this.isCompletedToday(h)).length;
        const totalStreaks = habits.reduce((sum, h) => sum + this.calculateStreak(h), 0);
        const longestStreak = Math.max(...habits.map(h => this.calculateStreak(h)), 0);

        return {
            total: totalHabits,
            completedToday,
            averageStreak: totalHabits > 0 ? Math.round(totalStreaks / totalHabits) : 0,
            longestStreak
        };
    }

    // Export habits data
    exportHabitsData() {
        const habits = dataManager.getItems('habits', 'habits');
        const stats = this.getStats();
        
        const exportData = {
            exportDate: new Date().toISOString(),
            stats,
            habits: habits.map(habit => ({
                ...habit,
                currentStreak: this.calculateStreak(habit),
                completedToday: this.isCompletedToday(habit)
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habits-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Make HabitsModule available globally
window.HabitsModule = HabitsModule;