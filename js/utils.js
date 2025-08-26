/* Utility Functions for MySecBrain */

class Utils {
    /**
     * Format date to YYYY-MM-DD format
     * @param {Date} date - Date object to format
     * @returns {string} Formatted date string
     */
    static formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Calculate progress percentage from completion array
     * @param {Array} completion - Array of boolean values
     * @returns {number} Progress percentage (0-100)
     */
    static calculateProgress(completion) {
        if (!completion || completion.length === 0) return 0;
        const completed = completion.filter(Boolean).length;
        return Math.round((completed / completion.length) * 100);
    }

    /**
     * Check if a date is today
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is today
     */
    static isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    /**
     * Get month name and year for display
     * @param {Date} date - Date object
     * @returns {string} Formatted month and year
     */
    static getMonthYear(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    /**
     * Get full date string for display
     * @param {Date} date - Date object
     * @returns {string} Formatted full date
     */
    static getFullDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    /**
     * Create and download a file
     * @param {string} content - File content
     * @param {string} filename - Name of the file
     * @param {string} type - MIME type
     */
    static downloadFile(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Show alert message
     * @param {string} message - Message to show
     * @param {string} type - Type of alert (success, error, warning)
     */
    static showAlert(message, type = 'info') {
        // For now, using simple alert. Can be enhanced with custom toast notifications
        alert(message);
    }

    /**
     * Confirm action with user
     * @param {string} message - Confirmation message
     * @returns {boolean} True if user confirms
     */
    static confirm(message) {
        return confirm(message);
    }
}
