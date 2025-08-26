/* Calendar Management for MySecBrain */

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.onDateSelect = null;
    }

    /**
     * Set callback for date selection
     * @param {Function} callback - Function to call when date is selected
     */
    setDateSelectCallback(callback) {
        this.onDateSelect = callback;
    }

    /**
     * Change month by delta
     * @param {number} delta - Number of months to change (-1 for previous, 1 for next)
     */
    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    /**
     * Go to specific date
     * @param {Date} date - Date to go to
     */
    goToDate(date) {
        this.currentDate = new Date(date);
        this.render();
    }

    /**
     * Go to today
     */
    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    /**
     * Render the calendar
     */
    render() {
        const monthYear = document.getElementById('monthYear');
        const calendarGrid = document.getElementById('calendarGrid');
        
        if (!monthYear || !calendarGrid) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthYear.textContent = Utils.getMonthYear(this.currentDate);
        calendarGrid.innerHTML = '';

        // Add day headers
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Calculate calendar grid dates
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Render 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = this.createDayElement(currentDate, month);
            calendarGrid.appendChild(dayElement);
        }
    }

    /**
     * Create a calendar day element
     * @param {Date} date - Date for the day
     * @param {number} currentMonth - Current month being displayed
     * @returns {HTMLElement} Day element
     */
    createDayElement(date, currentMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Add classes for styling
        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (Utils.isToday(date)) {
            dayElement.classList.add('today');
        }
        
        dayElement.textContent = date.getDate();
        
        // Store the date as a data attribute for easy access
        dayElement.setAttribute('data-date', Utils.formatDate(date));
        
        // Add click event
        dayElement.addEventListener('click', () => {
            this.selectDate(date);
        });
        
        return dayElement;
    }

    /**
     * Select a date
     * @param {Date} date - Date to select
     */
    selectDate(date) {
        this.selectedDate = date;
        if (this.onDateSelect) {
            this.onDateSelect(date);
        }
    }

    /**
     * Add progress indicator to a day
     * @param {Date} date - Date to add indicator to
     * @param {number} progress - Progress percentage (0-100)
     */
    addProgressIndicator(date, progress) {
        const dateKey = Utils.formatDate(date);
        const dayElement = document.querySelector(`[data-date="${dateKey}"]`);
        
        if (dayElement) {
            // Remove existing progress classes
            dayElement.classList.remove('progress-0', 'progress-10', 'progress-20', 'progress-30', 'progress-40', 'progress-50', 'progress-60', 'progress-70', 'progress-80', 'progress-90', 'progress-100');
            
            // Round progress to nearest 10%
            const roundedProgress = Math.round(progress / 10) * 10;
            
            // Add appropriate progress class based on rounded percentage
            dayElement.classList.add(`progress-${roundedProgress}`);
        }
    }

    /**
     * Get current date
     * @returns {Date} Current date
     */
    getCurrentDate() {
        return new Date(this.currentDate);
    }

    /**
     * Get selected date
     * @returns {Date|null} Selected date or null
     */
    getSelectedDate() {
        return this.selectedDate;
    }
}
