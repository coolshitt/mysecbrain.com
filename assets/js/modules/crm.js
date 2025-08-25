/**
 * CRM Module - Task and Work Management
 * Kanban-style task management for deep work and productivity
 */

class CRMModule {
    constructor() {
        this.selectedTask = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
    }

    setupEventListeners() {
        // Add task button
        const addTaskBtn = document.getElementById('addTask');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.showAddTaskModal();
            });
        }
    }

    loadTasks() {
        const tasks = dataManager.getItems('crm', 'tasks');
        this.renderTasks(tasks);
    }

    renderTasks(tasks) {
        // Clear all columns
        document.getElementById('todoTasks').innerHTML = '';
        document.getElementById('progressTasks').innerHTML = '';
        document.getElementById('completedTasks').innerHTML = '';

        // Group tasks by status
        const tasksByStatus = {
            todo: tasks.filter(t => t.status === 'todo'),
            progress: tasks.filter(t => t.status === 'progress'),
            completed: tasks.filter(t => t.status === 'completed')
        };

        // Render tasks in each column
        Object.keys(tasksByStatus).forEach(status => {
            const container = document.getElementById(`${status}Tasks`);
            
            if (tasksByStatus[status].length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No ${status === 'progress' ? 'in progress' : status} tasks</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = tasksByStatus[status].map(task => `
                <div class="task-item" data-id="${task.id}" draggable="true">
                    <div class="task-title">${app.sanitizeHTML(task.title)}</div>
                    <div class="task-description">${app.truncateText(app.sanitizeHTML(task.description || ''))}</div>
                    <div class="task-meta">
                        <span class="task-priority priority-${task.priority || 'medium'}">${task.priority || 'medium'}</span>
                        <span class="task-date">${task.dueDate ? app.formatDate(task.dueDate) : ''}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn small" onclick="window.app.modules.crm.editTask('${task.id}')">Edit</button>
                        ${status !== 'completed' ? 
                            `<button class="action-btn small" onclick="window.app.modules.crm.moveTaskForward('${task.id}')">
                                ${status === 'todo' ? 'Start' : 'Complete'}
                            </button>` : ''
                        }
                    </div>
                </div>
            `).join('');
        });

        // Add drag and drop functionality
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const taskItems = document.querySelectorAll('.task-item');
        const columns = document.querySelectorAll('.tasks-list');

        taskItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
                e.target.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.backgroundColor = 'var(--color-black)';
                column.style.color = 'var(--color-white)';
            });

            column.addEventListener('dragleave', (e) => {
                column.style.backgroundColor = 'var(--color-white)';
                column.style.color = 'var(--color-black)';
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.backgroundColor = 'var(--color-white)';
                column.style.color = 'var(--color-black)';

                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.parentElement.dataset.status;
                
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    showAddTaskModal() {
        const modalContent = `
            <form id="taskForm">
                <div class="form-group">
                    <label class="form-label">Task Title</label>
                    <input type="text" id="taskTitle" name="title" placeholder="What needs to be done?" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="taskDescription" name="description" rows="4" placeholder="Detailed description of the task..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select id="taskPriority" name="priority" required>
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Due Date</label>
                        <input type="date" id="taskDueDate" name="dueDate">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project/Category</label>
                    <input type="text" id="taskProject" name="project" placeholder="e.g., Website Redesign, Personal">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Estimated Time</label>
                    <input type="text" id="taskEstimate" name="estimate" placeholder="e.g., 2 hours, 30 minutes">
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                    <button type="submit" class="save-btn action-btn">Create Task</button>
                </div>
            </form>
        `;

        app.openModal('Add New Task', modalContent);

        // Handle form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
    }

    editTask(taskId) {
        const tasks = dataManager.getItems('crm', 'tasks');
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;

        const modalContent = `
            <form id="taskForm">
                <div class="form-group">
                    <label class="form-label">Task Title</label>
                    <input type="text" id="taskTitle" name="title" value="${app.sanitizeHTML(task.title)}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="taskDescription" name="description" rows="4">${app.sanitizeHTML(task.description || '')}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select id="taskPriority" name="priority" required>
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Due Date</label>
                        <input type="date" id="taskDueDate" name="dueDate" value="${task.dueDate ? task.dueDate.split('T')[0] : ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select id="taskStatus" name="status" required>
                            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
                            <option value="progress" ${task.status === 'progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Project/Category</label>
                        <input type="text" id="taskProject" name="project" value="${app.sanitizeHTML(task.project || '')}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Estimated Time</label>
                    <input type="text" id="taskEstimate" name="estimate" value="${app.sanitizeHTML(task.estimate || '')}" placeholder="e.g., 2 hours, 30 minutes">
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.modules.crm.deleteTask('${task.id}')">Delete</button>
                    <div>
                        <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                        <button type="submit" class="save-btn action-btn">Update Task</button>
                    </div>
                </div>
            </form>
        `;

        app.openModal('Edit Task', modalContent);

        // Store current task being edited
        this.selectedTask = task;

        // Handle form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask();
        });
    }

    saveTask() {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate') || null,
            project: formData.get('project').trim(),
            estimate: formData.get('estimate').trim(),
            status: 'todo'
        };

        if (!taskData.title) {
            app.showNotification('Please enter a task title', 'error');
            return;
        }

        // Convert due date to ISO string if provided
        if (taskData.dueDate) {
            taskData.dueDate = new Date(taskData.dueDate).toISOString();
        }

        if (dataManager.addItem('crm', 'tasks', taskData)) {
            app.showNotification('Task created successfully!', 'success');
            app.closeModal();
            this.loadTasks();
        } else {
            app.showNotification('Failed to create task', 'error');
        }
    }

    updateTask() {
        if (!this.selectedTask) return;

        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        
        const updates = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            priority: formData.get('priority'),
            status: formData.get('status'),
            dueDate: formData.get('dueDate') || null,
            project: formData.get('project').trim(),
            estimate: formData.get('estimate').trim()
        };

        if (!updates.title) {
            app.showNotification('Please enter a task title', 'error');
            return;
        }

        // Convert due date to ISO string if provided
        if (updates.dueDate) {
            updates.dueDate = new Date(updates.dueDate).toISOString();
        }

        if (dataManager.updateItem('crm', 'tasks', this.selectedTask.id, updates)) {
            app.showNotification('Task updated successfully!', 'success');
            app.closeModal();
            this.loadTasks();
            this.selectedTask = null;
        } else {
            app.showNotification('Failed to update task', 'error');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            if (dataManager.deleteItem('crm', 'tasks', taskId)) {
                app.showNotification('Task deleted successfully!', 'success');
                app.closeModal();
                this.loadTasks();
                this.selectedTask = null;
            } else {
                app.showNotification('Failed to delete task', 'error');
            }
        }
    }

    updateTaskStatus(taskId, newStatus) {
        const updates = { status: newStatus };
        
        // Add completion timestamp if moving to completed
        if (newStatus === 'completed') {
            updates.completedAt = new Date().toISOString();
        }

        if (dataManager.updateItem('crm', 'tasks', taskId, updates)) {
            this.loadTasks();
            
            // Show motivational message for completions
            if (newStatus === 'completed') {
                app.showNotification('Task completed! Great job! 🎉', 'success');
            } else if (newStatus === 'progress') {
                app.showNotification('Task started! Keep going! 💪', 'success');
            }
        } else {
            app.showNotification('Failed to update task status', 'error');
        }
    }

    moveTaskForward(taskId) {
        const tasks = dataManager.getItems('crm', 'tasks');
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;

        let newStatus;
        if (task.status === 'todo') {
            newStatus = 'progress';
        } else if (task.status === 'progress') {
            newStatus = 'completed';
        }

        if (newStatus) {
            this.updateTaskStatus(taskId, newStatus);
        }
    }

    // Get task statistics
    getStats() {
        const tasks = dataManager.getItems('crm', 'tasks');
        const todoTasks = tasks.filter(t => t.status === 'todo').length;
        const progressTasks = tasks.filter(t => t.status === 'progress').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        
        // Calculate overdue tasks
        const today = new Date().toISOString().split('T')[0];
        const overdueTasks = tasks.filter(t => 
            t.status !== 'completed' && 
            t.dueDate && 
            t.dueDate.split('T')[0] < today
        ).length;

        // Group by priority
        const priorityCount = {
            low: tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length,
            medium: tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length,
            high: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
            urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
        };

        return {
            total: tasks.length,
            todo: todoTasks,
            progress: progressTasks,
            completed: completedTasks,
            overdue: overdueTasks,
            priorityCount,
            completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
        };
    }

    // Filter tasks by project
    filterByProject(project) {
        const tasks = dataManager.getItems('crm', 'tasks');
        const filteredTasks = project === 'all' ? tasks : tasks.filter(t => t.project === project);
        this.renderTasks(filteredTasks);
    }

    // Get unique projects
    getProjects() {
        const tasks = dataManager.getItems('crm', 'tasks');
        const projects = [...new Set(tasks.map(t => t.project).filter(p => p))];
        return projects.sort();
    }
}

// Make CRMModule available globally
window.CRMModule = CRMModule;