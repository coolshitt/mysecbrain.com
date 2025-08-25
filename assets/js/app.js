/**
 * Main Application Controller for MySecBrain
 * Handles navigation, modal management, and overall app state
 */

class MySecBrainApp {
    constructor() {
        this.currentModule = 'brain';
        this.modal = null;
        this.modules = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeModal();
        this.loadCurrentModule();
        this.updateStats();
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchModule(e.target.dataset.module);
            });
        });

        // Export/Import buttons
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importData(e.target.files[0]);
            }
        });

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on outside click
        document.getElementById('itemModal').addEventListener('click', (e) => {
            if (e.target.id === 'itemModal') {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Window beforeunload - warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            // Create a final backup before leaving
            dataManager.createBackup('beforeunload');
        });
    }

    handleKeyboard(e) {
        // ESC to close modal
        if (e.key === 'Escape') {
            this.closeModal();
        }

        // Ctrl/Cmd + E for export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            this.exportData();
        }

        // Ctrl/Cmd + I for import
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            document.getElementById('importFile').click();
        }

        // Number keys for module switching
        if (e.key >= '1' && e.key <= '4') {
            const modules = ['brain', 'habits', 'crm', 'wallet'];
            const moduleIndex = parseInt(e.key) - 1;
            if (modules[moduleIndex]) {
                this.switchModule(modules[moduleIndex]);
            }
        }
    }

    switchModule(moduleName) {
        // Hide all modules
        document.querySelectorAll('.module').forEach(module => {
            module.classList.add('hidden');
        });

        // Show selected module
        const targetModule = document.getElementById(`${moduleName}Module`);
        if (targetModule) {
            targetModule.classList.remove('hidden');
        }

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-module="${moduleName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Set current module
        this.currentModule = moduleName;

        // Load module-specific functionality
        this.loadCurrentModule();

        // Update URL hash
        window.location.hash = moduleName;
    }

    loadCurrentModule() {
        // Initialize module-specific functionality
        switch (this.currentModule) {
            case 'brain':
                if (window.BrainModule) {
                    this.modules.brain = new BrainModule();
                }
                break;
            case 'habits':
                if (window.HabitsModule) {
                    this.modules.habits = new HabitsModule();
                }
                break;
            case 'crm':
                if (window.CRMModule) {
                    this.modules.crm = new CRMModule();
                }
                break;
            case 'wallet':
                if (window.WalletModule) {
                    this.modules.wallet = new WalletModule();
                }
                break;
        }
    }

    initializeModal() {
        this.modal = document.getElementById('itemModal');
    }

    openModal(title, content, onSave = null) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        
        this.modal.classList.add('active');
        
        // Focus first input
        const firstInput = this.modal.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        // Handle save button if provided
        if (onSave) {
            const saveBtn = this.modal.querySelector('.save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', onSave);
            }
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
        
        // Clear modal content
        document.getElementById('modalTitle').textContent = '';
        document.getElementById('modalBody').innerHTML = '';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'error' ? 'var(--color-black)' : 'var(--color-white)'};
            color: ${type === 'error' ? 'var(--color-white)' : 'var(--color-black)'};
            border: 1px solid var(--color-black);
            padding: var(--spacing-md);
            z-index: 1001;
            max-width: 300px;
        `;

        // Add to document
        document.body.appendChild(notification);

        // Close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(notification);
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    exportData() {
        try {
            if (dataManager.exportData()) {
                this.showNotification('Data exported successfully!', 'success');
            } else {
                this.showNotification('Failed to export data', 'error');
            }
        } catch (error) {
            this.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    importData(file) {
        dataManager.importData(file)
            .then((result) => {
                this.showNotification(result.message, 'success');
                // Reload current module to reflect imported data
                this.loadCurrentModule();
                this.updateStats();
            })
            .catch((error) => {
                this.showNotification(error.message, 'error');
            });
    }

    updateStats() {
        const stats = dataManager.getStats();
        if (stats) {
            // Update any stat displays if they exist
            console.log('MySecBrain Stats:', stats);
        }
    }

    // Utility method to format dates
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Utility method to truncate text
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Utility method to sanitize HTML
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MySecBrainApp();
    
    // Handle initial hash routing
    const hash = window.location.hash.substring(1);
    if (hash && ['brain', 'habits', 'crm', 'wallet'].includes(hash)) {
        app.switchModule(hash);
    }
});

// Handle hash changes for back/forward navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['brain', 'habits', 'crm', 'wallet'].includes(hash)) {
        app.switchModule(hash);
    }
});