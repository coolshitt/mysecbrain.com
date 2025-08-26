// Wallet Transactions Manager
class WalletTransactionsManager {
    constructor() {
        this.transactions = walletStorage.getData('transactions');
    }

    // Add a new transaction
    addTransaction(transactionData) {
        const transaction = {
            id: Date.now().toString(),
            type: transactionData.type, // 'income' or 'expense'
            title: transactionData.title,
            amount: parseFloat(transactionData.amount),
            category: transactionData.category,
            date: transactionData.date || new Date().toISOString().split('T')[0],
            notes: transactionData.notes || '',
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveTransactions();
        return transaction;
    }

    // Delete a transaction
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        return true;
    }

    // Get all transactions
    getTransactions() {
        return this.transactions;
    }

    // Get transactions by type
    getTransactionsByType(type) {
        return this.transactions.filter(t => t.type === type);
    }

    // Get transactions by category
    getTransactionsByCategory(category) {
        return this.transactions.filter(t => t.category === category);
    }

    // Get transactions by date range
    getTransactionsByDateRange(startDate, endDate) {
        return this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
        });
    }

    // Calculate total income
    getTotalIncome() {
        return this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    // Calculate total expenses
    getTotalExpenses() {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    // Calculate current balance
    getCurrentBalance() {
        return this.getTotalIncome() - this.getTotalExpenses();
    }

    // Get monthly spending by category
    getMonthlySpendingByCategory(month, year) {
        const monthlyExpenses = this.transactions
            .filter(t => t.type === 'expense' && 
                       t.category && 
                       new Date(t.date).getMonth() === month &&
                       new Date(t.date).getFullYear() === year);

        const categoryTotals = {};
        monthlyExpenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });

        return categoryTotals;
    }

    // Save transactions to storage
    saveTransactions() {
        walletStorage.saveData('transactions', this.transactions);
    }

    // Render transactions list
    renderTransactions(containerId) {
        const container = document.getElementById(containerId);
        
        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No transactions yet</h4>
                    <p>Add your first income or expense to get started!</p>
                </div>
            `;
            return;
        }

        // Sort transactions by date (newest first)
        const sortedTransactions = [...this.transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        container.innerHTML = sortedTransactions.map(transaction => {
            const date = new Date(transaction.date).toLocaleDateString();
            const isIncome = transaction.type === 'income';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-header">
                        <div class="transaction-title">${transaction.title}</div>
                        <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                            ${isIncome ? '+' : '-'}$${transaction.amount.toFixed(2)}
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span class="transaction-category">${transaction.category}</span>
                        <span class="transaction-date">${date}</span>
                    </div>
                    ${transaction.notes ? `<p style="color: var(--text-secondary); margin-bottom: 10px;">${transaction.notes}</p>` : ''}
                    <button class="btn btn-danger" onclick="wallet.deleteTransaction('${transaction.id}')">Delete</button>
                </div>
            `;
        }).join('');
    }
}
