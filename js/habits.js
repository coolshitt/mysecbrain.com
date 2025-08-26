/* Habits Management for MySecBrain */

class HabitsManager {
    constructor() {
        this.habits = [];
        this.completions = {};
        this.selectedDate = null;
        this.onHabitChange = null;
    }

    /**
     * Set callback for habit changes
     * @param {Function} callback - Function to call when habits change
     */
    setHabitChangeCallback(callback) {
        this.onHabitChange = callback;
    }

    /**
     * Load habits from storage
     */
    loadHabits() {
        this.habits = storage.load('habits', DEFAULT_HABITS);
        this.completions = storage.load('completions', {});
    }

    /**
     * Save habits to storage
     */
    saveHabits() {
        storage.save('habits', this.habits);
    }

    /**
     * Save completions to storage
     */
    saveCompletions() {
        storage.save('completions', this.completions);
    }

    /**
     * Get all habits
     * @returns {Array} Array of habit strings
     */
    getHabits() {
        return [...this.habits];
    }

    /**
     * Add a new habit
     * @param {string} habit - Habit description
     */
    addHabit(habit) {
        if (habit && !this.habits.includes(habit)) {
            this.habits.push(habit);
            this.saveHabits();
            if (this.onHabitChange) {
                this.onHabitChange();
            }
        }
    }

    /**
     * Remove a habit
     * @param {number} index - Index of habit to remove
     */
    removeHabit(index) {
        if (index >= 0 && index < this.habits.length) {
            this.habits.splice(index, 1);
            this.saveHabits();
            
            // Update completions for all dates
            Object.keys(this.completions).forEach(dateKey => {
                if (this.completions[dateKey].length > index) {
                    this.completions[dateKey].splice(index, 1);
                }
            });
            this.saveCompletions();
            
            if (this.onHabitChange) {
                this.onHabitChange();
            }
        }
    }

    /**
     * Set selected date
     * @param {Date} date - Date to select
     */
    setSelectedDate(date) {
        this.selectedDate = date;
    }

    /**
     * Check if a habit is completed for selected date
     * @param {number} index - Habit index
     * @returns {boolean} True if habit is completed
     */
    isHabitCompleted(index) {
        if (!this.selectedDate) return false;
        const dateKey = Utils.formatDate(this.selectedDate);
        const completion = this.completions[dateKey];
        return completion && completion[index];
    }

    /**
     * Toggle habit completion for selected date
     * @param {number} index - Habit index
     * @param {boolean} completed - Whether habit is completed
     */
    toggleHabit(index, completed) {
        if (!this.selectedDate) return;
        
        const dateKey = Utils.formatDate(this.selectedDate);
        if (!this.completions[dateKey]) {
            this.completions[dateKey] = new Array(this.habits.length).fill(false);
        }
        
        this.completions[dateKey][index] = completed;
        this.saveCompletions();
        
        // Update progress display immediately
        this.updateProgress();
        
        // Trigger callback for calendar update
        if (this.onHabitChange) {
            this.onHabitChange();
        }
    }

    /**
     * Get completion data for a specific date
     * @param {Date} date - Date to get completions for
     * @returns {Array} Array of completion booleans
     */
    getCompletionsForDate(date) {
        const dateKey = Utils.formatDate(date);
        return this.completions[dateKey] || new Array(this.habits.length).fill(false);
    }

    /**
     * Calculate progress for a specific date
     * @param {Date} date - Date to calculate progress for
     * @returns {number} Progress percentage (0-100)
     */
    calculateProgressForDate(date) {
        const completions = this.getCompletionsForDate(date);
        return Utils.calculateProgress(completions);
    }

    /**
     * Render habits in the modal
     */
    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        if (!habitsList) return;
        
        habitsList.innerHTML = '';
        
        this.habits.forEach((habit, index) => {
            const habitItem = this.createHabitItem(habit, index);
            habitsList.appendChild(habitItem);
        });
        
        this.updateProgress();
    }

    /**
     * Create a habit item element
     * @param {string} habit - Habit description
     * @param {number} index - Habit index
     * @returns {HTMLElement} Habit item element
     */
    createHabitItem(habit, index) {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'habit-checkbox';
        checkbox.checked = this.isHabitCompleted(index);
        checkbox.addEventListener('change', (e) => {
            this.toggleHabit(index, e.target.checked);
        });
        
        const label = document.createElement('label');
        label.className = 'habit-label';
        label.textContent = habit;
        
        habitItem.appendChild(checkbox);
        habitItem.appendChild(label);
        
        return habitItem;
    }

    /**
     * Update progress display
     */
    updateProgress() {
        if (!this.selectedDate) return;
        
        const progress = this.calculateProgressForDate(this.selectedDate);
        
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    /**
     * Open modal for a specific date
     * @param {Date} date - Date to open modal for
     */
    openModal(date) {
        this.setSelectedDate(date);
        
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Habits for ${Utils.getFullDate(date)}`;
        }
        
        this.renderHabits();
        document.getElementById('modalOverlay').classList.add('active');
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        this.selectedDate = null;
    }

    /**
     * Export all data
     * @returns {Object} Data object for export
     */
    exportData() {
        return {
            habits: this.habits,
            completions: this.completions,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import data
     * @param {Object} data - Data object to import
     * @returns {boolean} True if import was successful
     */
    importData(data) {
        if (data.habits && data.completions) {
            this.habits = data.habits;
            this.completions = data.completions;
            this.saveHabits();
            this.saveCompletions();
            return true;
        }
        return false;
    }

    /**
     * Reset all data to defaults
     */
    resetData() {
        this.habits = [...DEFAULT_HABITS];
        this.completions = {};
        this.saveHabits();
        this.saveCompletions();
        
        if (this.onHabitChange) {
            this.onHabitChange();
        }
    }

    /**
     * Open habits management modal
     */
    openManageModal() {
        this.renderManageHabits();
        document.getElementById('manageHabitsModalOverlay').classList.add('active');
    }

    /**
     * Close habits management modal
     */
    closeManageModal() {
        document.getElementById('manageHabitsModalOverlay').classList.remove('active');
    }

    /**
     * Render habits management list
     */
    renderManageHabits() {
        const managementList = document.getElementById('habitsManagementList');
        if (!managementList) return;
        
        managementList.innerHTML = '';
        
        this.habits.forEach((habit, index) => {
            const habitItem = this.createHabitManagementItem(habit, index);
            managementList.appendChild(habitItem);
        });
    }

    /**
     * Create a habit management item
     * @param {string} habit - Habit description
     * @param {number} index - Habit index
     * @returns {HTMLElement} Habit management item element
     */
    createHabitManagementItem(habit, index) {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-management-item';
        
        const habitText = document.createElement('div');
        habitText.className = 'habit-management-text';
        habitText.textContent = habit;
        
        const actions = document.createElement('div');
        actions.className = 'habit-management-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-small btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => this.editHabit(index, habitItem, habitText));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-small btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => this.deleteHabit(index));
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        habitItem.appendChild(habitText);
        habitItem.appendChild(actions);
        
        return habitItem;
    }

    /**
     * Edit a habit
     * @param {number} index - Habit index
     * @param {HTMLElement} habitItem - Habit item element
     * @param {HTMLElement} habitText - Habit text element
     */
    editHabit(index, habitItem, habitText) {
        const currentText = habitText.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'habit-edit-input';
        input.value = currentText;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-small btn-primary';
        saveBtn.textContent = 'Save';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-small';
        cancelBtn.textContent = 'Cancel';
        
        // Replace text with input
        habitText.replaceWith(input);
        input.focus();
        
        // Replace actions with save/cancel
        const actions = habitItem.querySelector('.habit-management-actions');
        actions.innerHTML = '';
        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        
        // Save functionality
        saveBtn.addEventListener('click', () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                this.habits[index] = newText;
                this.saveHabits();
                this.renderManageHabits();
                if (this.onHabitChange) {
                    this.onHabitChange();
                }
            }
        });
        
        // Cancel functionality
        cancelBtn.addEventListener('click', () => {
            this.renderManageHabits();
        });
        
        // Enter key to save
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            }
        });
    }

    /**
     * Delete a habit
     * @param {number} index - Habit index
     */
    deleteHabit(index) {
        if (Utils.confirm(`Are you sure you want to delete "${this.habits[index]}"?`)) {
            this.removeHabit(index);
            this.renderManageHabits();
        }
    }
}
