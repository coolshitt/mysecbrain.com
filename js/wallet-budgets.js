// Wallet Budgets Manager
class WalletBudgetsManager {
    constructor() {
        this.budgets = walletStorage.getData('budgets');
    }

    // Add a new budget category
    addBudget(budgetData) {
        const budget = {
            id: Date.now().toString(),
            title: budgetData.title,
            monthlyLimit: parseFloat(budgetData.monthlyLimit),
            category: budgetData.category,
            notes: budgetData.notes || '',
            createdAt: new Date().toISOString()
        };

        this.budgets.push(budget);
        this.saveBudgets();
        return budget;
    }

    // Delete a budget category
    deleteBudget(id) {
        this.budgets = this.budgets.filter(b => b.id !== id);
        this.saveBudgets();
        return true;
    }

    // Get all budgets
    getBudgets() {
        return this.budgets;
    }

    // Get budget by category
    getBudgetByCategory(category) {
        return this.budgets.find(b => b.category === category);
    }

    // Calculate current spending for a budget category
    calculateCurrentSpending(budget, month, year) {
        const monthlyExpenses = window.walletTransactions.getTransactions()
            .filter(t => t.type === 'expense' && 
                       t.category === budget.category &&
                       new Date(t.date).getMonth() === month &&
                       new Date(t.date).getFullYear() === year);
        
        return monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
    }

    // Calculate spending percentage for a budget
    calculateSpendingPercentage(budget, month, year) {
        const currentSpending = this.calculateCurrentSpending(budget, month, year);
        return (currentSpending / budget.monthlyLimit) * 100;
    }

    // Get budget status (safe, warning, danger)
    getBudgetStatus(budget, month, year) {
        const percentage = this.calculateSpendingPercentage(budget, month, year);
        
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'safe';
    }

    // Save budgets to storage
    saveBudgets() {
        walletStorage.saveData('budgets', this.budgets);
    }

    // Render budgets list
    renderBudgets(containerId) {
        const container = document.getElementById(containerId);
        
        if (this.budgets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No budgets set yet</h4>
                    <p>Create budget categories to track your spending!</p>
                </div>
            `;
            return;
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        container.innerHTML = this.budgets.map(budget => {
            const currentSpending = this.calculateCurrentSpending(budget, currentMonth, currentYear);
            const percentage = this.calculateSpendingPercentage(budget, currentMonth, currentYear);
            const status = this.getBudgetStatus(budget, currentMonth, currentYear);
            
            return `
                <div class="budget-item">
                    <div class="budget-header">
                        <div class="budget-title">${budget.title}</div>
                        <span class="budget-category">${budget.category}</span>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-bar">
                            <div class="budget-fill ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <div class="budget-stats">
                            <span>$${currentSpending.toFixed(2)} / $${budget.monthlyLimit.toFixed(2)}</span>
                            <span>${percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                    ${budget.notes ? `<p style="color: var(--text-secondary); margin-bottom: 10px;">${budget.notes}</p>` : ''}
                    <button class="btn btn-danger" onclick="wallet.deleteBudget('${budget.id}')">Delete</button>
                </div>
            `;
        }).join('');
    }

    // Get budget summary for current month
    getBudgetSummary(month, year) {
        const summary = {
            totalBudget: 0,
            totalSpent: 0,
            remaining: 0,
            categories: []
        };

        this.budgets.forEach(budget => {
            const currentSpending = this.calculateCurrentSpending(budget, month, year);
            const remaining = budget.monthlyLimit - currentSpending;
            
            summary.totalBudget += budget.monthlyLimit;
            summary.totalSpent += currentSpending;
            summary.remaining += remaining;
            
            summary.categories.push({
                title: budget.title,
                category: budget.category,
                limit: budget.monthlyLimit,
                spent: currentSpending,
                remaining: remaining,
                percentage: (currentSpending / budget.monthlyLimit) * 100
            });
        });

        return summary;
    }
}
