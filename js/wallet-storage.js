// Wallet Storage Manager
class WalletStorageManager {
    constructor() {
        this.storageKeys = {
            transactions: 'wallet_transactions',
            budgets: 'wallet_budgets',
            goals: 'wallet_goals',
            theme: 'wallet_theme'
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
            case 'transactions':
                return [];
            case 'budgets':
                return [];
            case 'goals':
                return [];
            case 'theme':
                return 'light';
            default:
                return null;
        }
    }

    // Clear all wallet data
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing wallet data:', error);
            return false;
        }
    }

    // Export all wallet data
    exportAllData() {
        try {
            const data = {
                exportInfo: {
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                    description: 'MySecBrain Wallet backup'
                },
                transactions: this.getData('transactions'),
                budgets: this.getData('budgets'),
                goals: this.getData('goals'),
                theme: this.getData('theme')
            };
            return data;
        } catch (error) {
            console.error('Error exporting wallet data:', error);
            return null;
        }
    }

    // Import wallet data
    importData(data) {
        try {
            if (data.transactions) {
                this.saveData('transactions', data.transactions);
            }
            if (data.budgets) {
                this.saveData('budgets', data.budgets);
            }
            if (data.goals) {
                this.saveData('goals', data.goals);
            }
            if (data.theme) {
                this.saveData('theme', data.theme);
            }
            return true;
        } catch (error) {
            console.error('Error importing wallet data:', error);
            return false;
        }
    }
}

// Create global storage instance
const walletStorage = new WalletStorageManager();
window.walletStorage = walletStorage;
