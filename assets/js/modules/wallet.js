/**
 * Wallet Module - Finance and Transaction Management
 * Simple personal finance tracking
 */

class WalletModule {
    constructor() {
        this.selectedTransaction = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTransactions();
        this.updateBalance();
    }

    setupEventListeners() {
        // Add transaction button
        const addTransactionBtn = document.getElementById('addTransaction');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                this.showAddTransactionModal();
            });
        }
    }

    loadTransactions() {
        const transactions = dataManager.getItems('wallet', 'transactions');
        this.renderTransactions(transactions);
        this.updateBalance();
    }

    renderTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No transactions yet</h3>
                    <p>Start tracking your finances by adding your first transaction!</p>
                    <button class="add-btn" onclick="window.app.modules.wallet.showAddTransactionModal()">+ Add Transaction</button>
                </div>
            `;
            return;
        }

        // Group transactions by date
        const groupedTransactions = this.groupTransactionsByDate(transactions);

        container.innerHTML = Object.keys(groupedTransactions)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => `
                <div class="transaction-group">
                    <h4 class="transaction-date-header">${this.formatTransactionDate(date)}</h4>
                    ${groupedTransactions[date].map(transaction => `
                        <div class="transaction-item" data-id="${transaction.id}" onclick="window.app.modules.wallet.editTransaction('${transaction.id}')">
                            <div class="transaction-info">
                                <div class="transaction-description">${app.sanitizeHTML(transaction.description)}</div>
                                <div class="transaction-category">${app.sanitizeHTML(transaction.category || 'Uncategorized')}</div>
                            </div>
                            <div class="transaction-amount ${transaction.type}">
                                ${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('');
    }

    groupTransactionsByDate(transactions) {
        const grouped = {};
        
        transactions.forEach(transaction => {
            const date = transaction.date.split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(transaction);
        });

        // Sort transactions within each date group
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => new Date(b.created) - new Date(a.created));
        });

        return grouped;
    }

    formatTransactionDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    updateBalance() {
        const transactions = dataManager.getItems('wallet', 'transactions');
        const balance = transactions.reduce((total, transaction) => {
            return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
        }, 0);

        const balanceElement = document.getElementById('totalBalance');
        if (balanceElement) {
            balanceElement.textContent = `$${balance.toFixed(2)}`;
            balanceElement.className = `balance-amount ${balance >= 0 ? 'positive' : 'negative'}`;
        }

        return balance;
    }

    showAddTransactionModal() {
        const categories = this.getCategories();
        
        const modalContent = `
            <form id="transactionForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select id="transactionType" name="type" required>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Amount</label>
                        <input type="number" id="transactionAmount" name="amount" step="0.01" min="0" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" id="transactionDescription" name="description" placeholder="e.g., Grocery shopping, Salary" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select id="transactionCategory" name="category" required>
                            ${categories.map(cat => `
                                <option value="${cat}">${cat}</option>
                            `).join('')}
                            <option value="custom">+ Add Custom Category</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" id="transactionDate" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                
                <div class="form-group hidden" id="customCategoryGroup">
                    <label class="form-label">Custom Category</label>
                    <input type="text" id="customCategory" name="customCategory" placeholder="Enter category name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notes (optional)</label>
                    <textarea id="transactionNotes" name="notes" rows="3" placeholder="Additional notes about this transaction..."></textarea>
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                    <button type="submit" class="save-btn action-btn">Add Transaction</button>
                </div>
            </form>
        `;

        app.openModal('Add Transaction', modalContent);

        // Handle category change
        document.getElementById('transactionCategory').addEventListener('change', (e) => {
            const customGroup = document.getElementById('customCategoryGroup');
            if (e.target.value === 'custom') {
                customGroup.classList.remove('hidden');
                document.getElementById('customCategory').required = true;
            } else {
                customGroup.classList.add('hidden');
                document.getElementById('customCategory').required = false;
            }
        });

        // Handle form submission
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction();
        });
    }

    editTransaction(transactionId) {
        const transactions = dataManager.getItems('wallet', 'transactions');
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;

        const categories = this.getCategories();
        
        const modalContent = `
            <form id="transactionForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select id="transactionType" name="type" required>
                            <option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>Expense</option>
                            <option value="income" ${transaction.type === 'income' ? 'selected' : ''}>Income</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Amount</label>
                        <input type="number" id="transactionAmount" name="amount" step="0.01" min="0" value="${Math.abs(transaction.amount)}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" id="transactionDescription" name="description" value="${app.sanitizeHTML(transaction.description)}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select id="transactionCategory" name="category" required>
                            ${categories.map(cat => `
                                <option value="${cat}" ${cat === transaction.category ? 'selected' : ''}>${cat}</option>
                            `).join('')}
                            <option value="custom">+ Add Custom Category</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" id="transactionDate" name="date" value="${transaction.date.split('T')[0]}" required>
                    </div>
                </div>
                
                <div class="form-group hidden" id="customCategoryGroup">
                    <label class="form-label">Custom Category</label>
                    <input type="text" id="customCategory" name="customCategory" placeholder="Enter category name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notes (optional)</label>
                    <textarea id="transactionNotes" name="notes" rows="3">${app.sanitizeHTML(transaction.notes || '')}</textarea>
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.modules.wallet.deleteTransaction('${transaction.id}')">Delete</button>
                    <div>
                        <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                        <button type="submit" class="save-btn action-btn">Update Transaction</button>
                    </div>
                </div>
            </form>
        `;

        app.openModal('Edit Transaction', modalContent);

        // Store current transaction being edited
        this.selectedTransaction = transaction;

        // Handle category change
        document.getElementById('transactionCategory').addEventListener('change', (e) => {
            const customGroup = document.getElementById('customCategoryGroup');
            if (e.target.value === 'custom') {
                customGroup.classList.remove('hidden');
                document.getElementById('customCategory').required = true;
            } else {
                customGroup.classList.add('hidden');
                document.getElementById('customCategory').required = false;
            }
        });

        // Handle form submission
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTransaction();
        });
    }

    saveTransaction() {
        const form = document.getElementById('transactionForm');
        const formData = new FormData(form);
        
        let category = formData.get('category');
        if (category === 'custom') {
            category = formData.get('customCategory').trim();
            if (!category) {
                app.showNotification('Please enter a custom category name', 'error');
                return;
            }
        }

        const transactionData = {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description').trim(),
            category: category,
            date: new Date(formData.get('date')).toISOString(),
            notes: formData.get('notes').trim()
        };

        if (!transactionData.description || transactionData.amount <= 0) {
            app.showNotification('Please fill in all required fields with valid values', 'error');
            return;
        }

        if (dataManager.addItem('wallet', 'transactions', transactionData)) {
            app.showNotification('Transaction added successfully!', 'success');
            app.closeModal();
            this.loadTransactions();
        } else {
            app.showNotification('Failed to add transaction', 'error');
        }
    }

    updateTransaction() {
        if (!this.selectedTransaction) return;

        const form = document.getElementById('transactionForm');
        const formData = new FormData(form);
        
        let category = formData.get('category');
        if (category === 'custom') {
            category = formData.get('customCategory').trim();
            if (!category) {
                app.showNotification('Please enter a custom category name', 'error');
                return;
            }
        }

        const updates = {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description').trim(),
            category: category,
            date: new Date(formData.get('date')).toISOString(),
            notes: formData.get('notes').trim()
        };

        if (!updates.description || updates.amount <= 0) {
            app.showNotification('Please fill in all required fields with valid values', 'error');
            return;
        }

        if (dataManager.updateItem('wallet', 'transactions', this.selectedTransaction.id, updates)) {
            app.showNotification('Transaction updated successfully!', 'success');
            app.closeModal();
            this.loadTransactions();
            this.selectedTransaction = null;
        } else {
            app.showNotification('Failed to update transaction', 'error');
        }
    }

    deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            if (dataManager.deleteItem('wallet', 'transactions', transactionId)) {
                app.showNotification('Transaction deleted successfully!', 'success');
                app.closeModal();
                this.loadTransactions();
                this.selectedTransaction = null;
            } else {
                app.showNotification('Failed to delete transaction', 'error');
            }
        }
    }

    getCategories() {
        // Default categories
        const defaultCategories = [
            'Food & Dining',
            'Transportation',
            'Shopping',
            'Entertainment',
            'Bills & Utilities',
            'Healthcare',
            'Education',
            'Travel',
            'Business',
            'Investment',
            'Salary',
            'Freelance',
            'Other Income',
            'Other Expense'
        ];

        // Get unique categories from existing transactions
        const transactions = dataManager.getItems('wallet', 'transactions');
        const existingCategories = [...new Set(transactions.map(t => t.category).filter(c => c))];
        
        // Combine and deduplicate
        const allCategories = [...new Set([...defaultCategories, ...existingCategories])];
        
        return allCategories.sort();
    }

    // Get financial statistics
    getStats() {
        const transactions = dataManager.getItems('wallet', 'transactions');
        const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const monthlyIncome = transactions
            .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
            
        const monthlyExpenses = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);

        // Category breakdown for expenses
        const expensesByCategory = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });

        return {
            balance: totalIncome - totalExpenses,
            totalIncome,
            totalExpenses,
            monthlyIncome,
            monthlyExpenses,
            monthlyBalance: monthlyIncome - monthlyExpenses,
            transactionCount: transactions.length,
            expensesByCategory
        };
    }

    // Generate spending report
    generateReport(period = 'month') {
        const transactions = dataManager.getItems('wallet', 'transactions');
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(0);
        }

        const periodTransactions = transactions.filter(t => new Date(t.date) >= startDate);
        
        const income = periodTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = periodTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const categoryBreakdown = {};
        periodTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
            });

        return {
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            income,
            expenses,
            balance: income - expenses,
            transactionCount: periodTransactions.length,
            categoryBreakdown
        };
    }
}

// Make WalletModule available globally
window.WalletModule = WalletModule;