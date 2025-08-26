/* Storage Management for MySecBrain */

class StorageManager {
    constructor() {
        this.storagePrefix = 'mysecbrain_';
    }

    /**
     * Get storage key with prefix
     * @param {string} key - Storage key
     * @returns {string} Prefixed storage key
     */
    getStorageKey(key) {
        return this.storagePrefix + key;
    }

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     */
    save(key, data) {
        try {
            localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Loaded data or default value
     */
    load(key, defaultValue = null) {
        try {
            const saved = localStorage.getItem(this.getStorageKey(key));
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(this.getStorageKey(key));
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    /**
     * Clear all MySecBrain data
     */
    clearAll() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.storagePrefix))
                .forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get storage size in bytes
     * @returns {number} Storage size in bytes
     */
    getStorageSize() {
        let total = 0;
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
        } catch (error) {
            console.error('Error calculating storage size:', error);
        }
        return total;
    }
}

// Default habits data
const DEFAULT_HABITS = [
    'Exercise for 30 minutes',
    'Read for 20 minutes',
    'Drink 8 glasses of water',
    'Practice meditation',
    'Write in journal',
    'Learn something new',
    'Connect with family/friends'
];

// Initialize storage manager
const storage = new StorageManager();

// Make storage globally accessible
window.storage = storage;
