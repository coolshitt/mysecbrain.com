/**
 * Data Manager - Handles all data operations for MySecBrain
 * Provides backup, export, import functionality
 */

class DataManager {
    constructor() {
        this.storageKey = 'mysecbrain_data';
        this.init();
    }

    init() {
        // Initialize data structure if it doesn't exist
        if (!this.getData()) {
            this.resetData();
        }
        
        // Auto-backup every 5 minutes
        setInterval(() => {
            this.autoBackup();
        }, 5 * 60 * 1000);
    }

    // Get all data from localStorage
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading data:', error);
            return null;
        }
    }

    // Save all data to localStorage
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Reset data to initial structure
    resetData() {
        const initialData = {
            version: '1.0.0',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            modules: {
                brain: {
                    notes: [],
                    categories: ['ideas', 'projects', 'learning', 'personal']
                },
                habits: {
                    habits: []
                },
                crm: {
                    tasks: [],
                    projects: []
                },
                wallet: {
                    transactions: [],
                    balance: 0
                }
            }
        };
        
        this.saveData(initialData);
        return initialData;
    }

    // Get data for specific module
    getModuleData(moduleName) {
        const data = this.getData();
        return data ? data.modules[moduleName] : null;
    }

    // Update data for specific module
    updateModuleData(moduleName, moduleData) {
        const data = this.getData();
        if (data) {
            data.modules[moduleName] = { ...data.modules[moduleName], ...moduleData };
            data.lastModified = new Date().toISOString();
            return this.saveData(data);
        }
        return false;
    }

    // Add item to module
    addItem(moduleName, itemType, item) {
        const moduleData = this.getModuleData(moduleName);
        if (moduleData && moduleData[itemType]) {
            item.id = this.generateId();
            item.created = new Date().toISOString();
            item.modified = new Date().toISOString();
            
            moduleData[itemType].push(item);
            return this.updateModuleData(moduleName, moduleData);
        }
        return false;
    }

    // Update item in module
    updateItem(moduleName, itemType, itemId, updates) {
        const moduleData = this.getModuleData(moduleName);
        if (moduleData && moduleData[itemType]) {
            const itemIndex = moduleData[itemType].findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                moduleData[itemType][itemIndex] = {
                    ...moduleData[itemType][itemIndex],
                    ...updates,
                    modified: new Date().toISOString()
                };
                return this.updateModuleData(moduleName, moduleData);
            }
        }
        return false;
    }

    // Delete item from module
    deleteItem(moduleName, itemType, itemId) {
        const moduleData = this.getModuleData(moduleName);
        if (moduleData && moduleData[itemType]) {
            moduleData[itemType] = moduleData[itemType].filter(item => item.id !== itemId);
            return this.updateModuleData(moduleName, moduleData);
        }
        return false;
    }

    // Get items from module with optional filtering
    getItems(moduleName, itemType, filter = null) {
        const moduleData = this.getModuleData(moduleName);
        if (moduleData && moduleData[itemType]) {
            let items = [...moduleData[itemType]];
            
            if (filter) {
                if (filter.category && filter.category !== 'all') {
                    items = items.filter(item => item.category === filter.category);
                }
                if (filter.search) {
                    const searchTerm = filter.search.toLowerCase();
                    items = items.filter(item => 
                        item.title?.toLowerCase().includes(searchTerm) ||
                        item.content?.toLowerCase().includes(searchTerm) ||
                        item.description?.toLowerCase().includes(searchTerm)
                    );
                }
                if (filter.status) {
                    items = items.filter(item => item.status === filter.status);
                }
            }
            
            // Sort by modified date (newest first)
            return items.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        }
        return [];
    }

    // Export data to JSON file
    exportData() {
        const data = this.getData();
        if (data) {
            const exportData = {
                ...data,
                exported: new Date().toISOString(),
                exportVersion: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mysecbrain-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        }
        return false;
    }

    // Import data from JSON file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate imported data structure
                    if (this.validateDataStructure(importedData)) {
                        // Backup current data before import
                        this.createBackup('pre-import');
                        
                        // Import the data
                        importedData.lastModified = new Date().toISOString();
                        
                        if (this.saveData(importedData)) {
                            resolve({
                                success: true,
                                message: 'Data imported successfully!'
                            });
                        } else {
                            reject({
                                success: false,
                                message: 'Failed to save imported data'
                            });
                        }
                    } else {
                        reject({
                            success: false,
                            message: 'Invalid data format'
                        });
                    }
                } catch (error) {
                    reject({
                        success: false,
                        message: 'Invalid JSON file'
                    });
                }
            };
            
            reader.onerror = () => {
                reject({
                    success: false,
                    message: 'Failed to read file'
                });
            };
            
            reader.readAsText(file);
        });
    }

    // Validate data structure
    validateDataStructure(data) {
        return (
            data &&
            typeof data === 'object' &&
            data.modules &&
            data.modules.brain &&
            data.modules.habits &&
            data.modules.crm &&
            data.modules.wallet
        );
    }

    // Create backup
    createBackup(type = 'manual') {
        const data = this.getData();
        if (data) {
            const backupKey = `${this.storageKey}_backup_${type}_${Date.now()}`;
            try {
                localStorage.setItem(backupKey, JSON.stringify({
                    ...data,
                    backupType: type,
                    backupCreated: new Date().toISOString()
                }));
                
                // Keep only last 5 backups
                this.cleanupBackups();
                return true;
            } catch (error) {
                console.error('Backup failed:', error);
                return false;
            }
        }
        return false;
    }

    // Auto backup
    autoBackup() {
        this.createBackup('auto');
    }

    // Cleanup old backups
    cleanupBackups() {
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${this.storageKey}_backup_`)) {
                backupKeys.push(key);
            }
        }
        
        // Sort by timestamp and keep only the last 5
        backupKeys.sort().reverse();
        for (let i = 5; i < backupKeys.length; i++) {
            localStorage.removeItem(backupKeys[i]);
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get data statistics
    getStats() {
        const data = this.getData();
        if (data) {
            return {
                notes: data.modules.brain.notes.length,
                habits: data.modules.habits.habits.length,
                tasks: data.modules.crm.tasks.length,
                transactions: data.modules.wallet.transactions.length,
                totalItems: data.modules.brain.notes.length + 
                           data.modules.habits.habits.length + 
                           data.modules.crm.tasks.length + 
                           data.modules.wallet.transactions.length,
                lastModified: data.lastModified,
                created: data.created
            };
        }
        return null;
    }
}

// Initialize global data manager
window.dataManager = new DataManager();