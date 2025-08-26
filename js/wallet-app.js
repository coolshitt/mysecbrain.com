// Main Wallet Application
class WalletApp {
    constructor() {
        this.transactions = new WalletTransactionsManager();
        this.budgets = new WalletBudgetsManager();
        this.goals = new WalletGoalsManager();
        this.theme = walletStorage.getData('theme');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.render();
        this.updateFinancialOverview();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Income form
        document.getElementById('addIncomeBtn').addEventListener('click', () => {
            this.openIncomeModal();
        });

        document.getElementById('incomeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncome();
        });

        document.getElementById('cancelIncomeBtn').addEventListener('click', () => {
            this.closeIncomeModal();
        });

        // Expense form
        document.getElementById('addExpenseBtn').addEventListener('click', () => {
            this.openExpenseModal();
        });

        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        document.getElementById('cancelExpenseBtn').addEventListener('click', () => {
            this.closeExpenseModal();
        });

        // Budget form
        document.getElementById('addBudgetBtn').addEventListener('click', () => {
            this.openBudgetModal();
        });

        document.getElementById('budgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBudget();
        });

        document.getElementById('cancelBudgetBtn').addEventListener('click', () => {
            this.closeBudgetModal();
        });

        // Goal form
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            this.openGoalModal();
        });

        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGoal();
        });

        document.getElementById('cancelGoalBtn').addEventListener('click', () => {
            this.closeGoalModal();
        });

        // Export and Reset
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetData();
        });

        // Modal overlays
        document.getElementById('incomeModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeIncomeModal();
        });

        document.getElementById('expenseModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeExpenseModal();
        });

        document.getElementById('budgetModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeBudgetModal();
        });

        document.getElementById('goalModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeGoalModal();
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        walletStorage.saveData('theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    // Modal Management
    openIncomeModal() {
        document.getElementById('incomeModalOverlay').classList.add('active');
        document.getElementById('incomeForm').reset();
        document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
    }

    closeIncomeModal() {
        document.getElementById('incomeModalOverlay').classList.remove('active');
    }

    openExpenseModal() {
        document.getElementById('expenseModalOverlay').classList.add('active');
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    }

    closeExpenseModal() {
        document.getElementById('expenseModalOverlay').classList.remove('active');
    }

    openBudgetModal() {
        document.getElementById('budgetModalOverlay').classList.add('active');
        document.getElementById('budgetForm').reset();
    }

    closeBudgetModal() {
        document.getElementById('budgetModalOverlay').classList.remove('active');
    }

    openGoalModal() {
        document.getElementById('goalModalOverlay').classList.add('active');
        document.getElementById('goalForm').reset();
        document.getElementById('goalCurrent').value = '0';
    }

    closeGoalModal() {
        document.getElementById('goalModalOverlay').classList.remove('active');
    }

    // Data Management
    addIncome() {
        const title = document.getElementById('incomeTitle').value.trim();
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        const category = document.getElementById('incomeCategory').value;
        const date = document.getElementById('incomeDate').value;
        const notes = document.getElementById('incomeNotes').value.trim();

        if (!title || isNaN(amount) || amount <= 0) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        this.transactions.addTransaction({
            type: 'income',
            title,
            amount,
            category,
            date,
            notes
        });

        this.closeIncomeModal();
        this.render();
        this.updateFinancialOverview();
        alert('Income added successfully!');
    }

    addExpense() {
        const title = document.getElementById('expenseTitle').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const date = document.getElementById('expenseDate').value;
        const notes = document.getElementById('expenseNotes').value.trim();

        if (!title || isNaN(amount) || amount <= 0) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        this.transactions.addTransaction({
            type: 'expense',
            title,
            amount,
            category,
            date,
            notes
        });

        this.closeExpenseModal();
        this.render();
        this.updateFinancialOverview();
        alert('Expense added successfully!');
    }

    addBudget() {
        const title = document.getElementById('budgetTitle').value.trim();
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        const category = document.getElementById('budgetCategory').value;
        const notes = document.getElementById('budgetNotes').value.trim();

        if (!title || isNaN(amount) || amount <= 0) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        this.budgets.addBudget({
            title,
            monthlyLimit: amount,
            category,
            notes
        });

        this.closeBudgetModal();
        this.render();
        alert('Budget category added successfully!');
    }

    addGoal() {
        const title = document.getElementById('goalTitle').value.trim();
        const target = parseFloat(document.getElementById('goalTarget').value);
        const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
        const deadline = document.getElementById('goalDeadline').value;
        const notes = document.getElementById('goalNotes').value.trim();

        if (!title || isNaN(target) || target <= 0) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        this.goals.addGoal({
            title,
            targetAmount: target,
            currentAmount: current,
            deadline,
            notes
        });

        this.closeGoalModal();
        this.render();
        alert('Financial goal added successfully!');
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions.deleteTransaction(id);
            this.render();
            this.updateFinancialOverview();
        }
    }

    deleteBudget(id) {
        if (confirm('Are you sure you want to delete this budget category?')) {
            this.budgets.deleteBudget(id);
            this.render();
        }
    }

    deleteGoal(id) {
        if (confirm('Are you sure you want to delete this financial goal?')) {
            this.goals.deleteGoal(id);
            this.render();
        }
    }

    render() {
        this.transactions.renderTransactions('transactionsList');
        this.budgets.renderBudgets('budgetsList');
        this.goals.renderGoals('goalsList');
    }

    updateFinancialOverview() {
        const totalIncome = this.transactions.getTotalIncome();
        const totalExpenses = this.transactions.getTotalExpenses();
        const currentBalance = this.transactions.getCurrentBalance();
        const netSavings = currentBalance;

        document.getElementById('currentBalance').textContent = `$${currentBalance.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('netSavings').textContent = `$${netSavings.toFixed(2)}`;

        // Update balance color based on value
        const balanceElement = document.getElementById('currentBalance');
        balanceElement.className = 'financial-amount ' + (currentBalance > 0 ? 'positive' : currentBalance < 0 ? 'negative' : 'neutral');
    }

    exportData() {
        try {
            const data = walletStorage.exportAllData();
            if (data) {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mysecbrain_wallet_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);

                alert('Wallet data exported successfully!');
            } else {
                alert('Error exporting data');
            }
        } catch (error) {
            console.error('Error exporting wallet data:', error);
            alert('Error exporting data: ' + error.message);
        }
    }

    resetData() {
        if (confirm('Are you sure you want to reset all wallet data? This action cannot be undone.')) {
            walletStorage.clearAllData();
            this.transactions = new WalletTransactionsManager();
            this.budgets = new WalletBudgetsManager();
            this.goals = new WalletGoalsManager();
            this.render();
            this.updateFinancialOverview();
            alert('All wallet data has been reset!');
        }
    }
}

// Initialize Wallet when page loads
let wallet;
document.addEventListener('DOMContentLoaded', () => {
    wallet = new WalletApp();
    console.log('Wallet initialized successfully!');
});
