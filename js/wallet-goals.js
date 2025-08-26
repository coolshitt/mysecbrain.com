// Wallet Goals Manager
class WalletGoalsManager {
    constructor() {
        this.goals = walletStorage.getData('goals');
    }

    // Add a new financial goal
    addGoal(goalData) {
        const goal = {
            id: Date.now().toString(),
            title: goalData.title,
            targetAmount: parseFloat(goalData.targetAmount),
            currentAmount: parseFloat(goalData.currentAmount) || 0,
            deadline: goalData.deadline || null,
            notes: goalData.notes || '',
            createdAt: new Date().toISOString()
        };

        this.goals.push(goal);
        this.saveGoals();
        return goal;
    }

    // Delete a financial goal
    deleteGoal(id) {
        this.goals = this.goals.filter(g => g.id !== id);
        this.saveGoals();
        return true;
    }

    // Update goal progress
    updateGoalProgress(id, newAmount) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.currentAmount = parseFloat(newAmount);
            this.saveGoals();
            return true;
        }
        return false;
    }

    // Get all goals
    getGoals() {
        return this.goals;
    }

    // Get goal by ID
    getGoalById(id) {
        return this.goals.find(g => g.id === id);
    }

    // Calculate goal progress percentage
    calculateGoalProgress(goal) {
        return (goal.currentAmount / goal.targetAmount) * 100;
    }

    // Get goal status
    getGoalStatus(goal) {
        const percentage = this.calculateGoalProgress(goal);
        
        if (percentage >= 100) return 'completed';
        if (percentage >= 75) return 'near-completion';
        if (percentage >= 50) return 'halfway';
        if (percentage >= 25) return 'quarter-way';
        return 'just-started';
    }

    // Check if goal is overdue
    isGoalOverdue(goal) {
        if (!goal.deadline) return false;
        return new Date() > new Date(goal.deadline);
    }

    // Get days remaining for goal
    getDaysRemaining(goal) {
        if (!goal.deadline) return null;
        
        const today = new Date();
        const deadline = new Date(goal.deadline);
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // Save goals to storage
    saveGoals() {
        walletStorage.saveData('goals', this.goals);
    }

    // Render goals list
    renderGoals(containerId) {
        const container = document.getElementById(containerId);
        
        if (this.goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No financial goals yet</h4>
                    <p>Set savings goals to stay motivated!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.goals.map(goal => {
            const percentage = this.calculateGoalProgress(goal);
            const status = this.getGoalStatus(goal);
            const deadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline';
            const daysRemaining = this.getDaysRemaining(goal);
            const isOverdue = this.isGoalOverdue(goal);
            
            let deadlineText = `Target: ${deadline}`;
            if (daysRemaining !== null) {
                if (isOverdue) {
                    deadlineText += ` (Overdue by ${Math.abs(daysRemaining)} days)`;
                } else if (daysRemaining > 0) {
                    deadlineText += ` (${daysRemaining} days remaining)`;
                } else {
                    deadlineText += ` (Due today!)`;
                }
            }
            
            return `
                <div class="goal-item">
                    <div class="goal-header">
                        <div class="goal-title">${goal.title}</div>
                        <span class="goal-category">Goal</span>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-bar">
                            <div class="goal-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <div class="goal-stats">
                            <span>$${goal.currentAmount.toFixed(2)} / $${goal.targetAmount.toFixed(2)}</span>
                            <span>${percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                    <p class="goal-deadline">
                        ${deadlineText}
                    </p>
                    ${goal.notes ? `<p style="color: var(--text-secondary); margin-bottom: 10px;">${goal.notes}</p>` : ''}
                    <button class="btn btn-danger" onclick="wallet.deleteGoal('${goal.id}')">Delete</button>
                </div>
            `;
        }).join('');
    }

    // Get goals summary
    getGoalsSummary() {
        const summary = {
            totalGoals: this.goals.length,
            totalTargetAmount: 0,
            totalCurrentAmount: 0,
            completedGoals: 0,
            overdueGoals: 0,
            averageProgress: 0
        };

        if (this.goals.length > 0) {
            this.goals.forEach(goal => {
                summary.totalTargetAmount += goal.targetAmount;
                summary.totalCurrentAmount += goal.currentAmount;
                
                if (this.calculateGoalProgress(goal) >= 100) {
                    summary.completedGoals++;
                }
                
                if (this.isGoalOverdue(goal)) {
                    summary.overdueGoals++;
                }
            });
            
            summary.averageProgress = (summary.totalCurrentAmount / summary.totalTargetAmount) * 100;
        }

        return summary;
    }
}
