/**
 * CRM Manager - Handles projects, tasks, and earnings
 */
class CRMManager {
    constructor() {
        this.projects = this.loadProjects();
        this.tasks = this.loadTasks();
        this.earnings = this.loadEarnings();
        this.currentProjectId = null;
        this.currentTaskId = null;
    }

    /**
     * Load projects from localStorage
     * @returns {Array} Array of projects
     */
    loadProjects() {
        const stored = localStorage.getItem('crm_projects');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Load tasks from localStorage
     * @returns {Array} Array of tasks
     */
    loadTasks() {
        const stored = localStorage.getItem('crm_tasks');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Load earnings from localStorage
     * @returns {Array} Array of earnings
     */
    loadEarnings() {
        const stored = localStorage.getItem('crm_earnings');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save projects to localStorage
     */
    saveProjects() {
        localStorage.setItem('crm_projects', JSON.stringify(this.projects));
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        localStorage.setItem('crm_tasks', JSON.stringify(this.tasks));
    }

    /**
     * Save earnings to localStorage
     */
    saveEarnings() {
        localStorage.setItem('crm_earnings', JSON.stringify(this.earnings));
    }

    /**
     * Add new project
     * @param {Object} projectData - Project data
     * @returns {Object} Created project
     */
    addProject(projectData) {
        const project = {
            id: Date.now().toString(),
            name: projectData.name,
            client: projectData.client,
            budget: parseFloat(projectData.budget) || 0,
            deadline: projectData.deadline,
            status: projectData.status,
            description: projectData.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveProjects();
        return project;
    }

    /**
     * Update existing project
     * @param {string} projectId - Project ID
     * @param {Object} projectData - Updated project data
     * @returns {Object|null} Updated project or null if not found
     */
    updateProject(projectId, projectData) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return null;

        this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...projectData,
            updatedAt: new Date().toISOString()
        };

        this.saveProjects();
        return this.projects[projectIndex];
    }

    /**
     * Remove project (internal method)
     * @param {string} projectId - Project ID
     * @returns {boolean} Success status
     */
    removeProject(projectId) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return false;

        // Remove all tasks associated with this project
        this.tasks = this.tasks.filter(task => task.projectId !== projectId);
        this.saveTasks();

        // Remove project
        this.projects.splice(projectIndex, 1);
        this.saveProjects();

        return true;
    }

    /**
     * Add new task
     * @param {Object} taskData - Task data
     * @returns {Object} Created task
     */
    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            projectId: taskData.projectId,
            name: taskData.name,
            description: taskData.description,
            priority: taskData.priority,
            deadline: taskData.deadline,
            status: taskData.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    /**
     * Update existing task
     * @param {string} taskId - Task ID
     * @param {Object} taskData - Updated task data
     * @returns {Object|null} Updated task or null if not found
     */
    updateTask(taskId, taskData) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return null;

        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            ...taskData,
            updatedAt: new Date().toISOString()
        };

        this.saveTasks();
        return this.tasks[taskIndex];
    }

    /**
     * Remove task (internal method)
     * @param {string} taskId - Task ID
     * @returns {boolean} Success status
     */
    removeTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;

        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        return true;
    }

    /**
     * Get tasks for a specific project
     * @param {string} projectId - Project ID
     * @returns {Array} Array of tasks
     */
    getTasksForProject(projectId) {
        return this.tasks.filter(task => task.projectId === projectId);
    }

    /**
     * Get project by ID
     * @param {string} projectId - Project ID
     * @returns {Object|null} Project or null if not found
     */
    getProjectById(projectId) {
        return this.projects.find(p => p.id === projectId) || null;
    }

    /**
     * Get task by ID
     * @param {string} taskId - Task ID
     * @returns {Object|null} Task or null if not found
     */
    getTaskById(taskId) {
        return this.tasks.find(t => t.id === taskId) || null;
    }

    /**
     * Calculate total earnings
     * @returns {number} Total earnings
     */
    calculateTotalEarnings() {
        return this.projects
            .filter(p => p.status === 'completed')
            .reduce((total, p) => total + p.budget, 0);
    }

    /**
     * Calculate monthly earnings
     * @returns {number} Monthly earnings
     */
    calculateMonthlyEarnings() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.projects
            .filter(p => {
                if (p.status !== 'completed') return false;
                const projectDate = new Date(p.updatedAt);
                return projectDate.getMonth() === currentMonth && 
                       projectDate.getFullYear() === currentYear;
            })
            .reduce((total, p) => total + p.budget, 0);
    }

    /**
     * Get active projects count
     * @returns {number} Active projects count
     */
    getActiveProjectsCount() {
        return this.projects.filter(p => p.status === 'active').length;
    }

    /**
     * Render projects list
     */
    renderProjects() {
        const projectsList = document.getElementById('projectsList');
        if (!projectsList) return;

        projectsList.innerHTML = '';

        if (this.projects.length === 0) {
            projectsList.innerHTML = `
                <div class="empty-state">
                    <p>No projects yet. Create your first project to get started!</p>
                </div>
            `;
            return;
        }

        this.projects.forEach(project => {
            const projectElement = this.createProjectElement(project);
            projectsList.appendChild(projectElement);
        });
    }

    /**
     * Create project element
     * @param {Object} project - Project data
     * @returns {HTMLElement} Project element
     */
    createProjectElement(project) {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-item';
        
        const tasks = this.getTasksForProject(project.id);
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(0) : 0;

        projectElement.innerHTML = `
            <div class="project-header">
                <div class="project-info">
                    <h4>${project.name}</h4>
                    <div class="project-meta">
                        <span>👤 ${project.client}</span>
                        <span>💰 $${project.budget.toFixed(2)}</span>
                        <span>📅 ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                        <span>📊 ${completedTasks}/${totalTasks} tasks (${progress}%)</span>
                    </div>
                </div>
                <div class="project-actions">
                    <span class="project-status ${project.status}">${project.status}</span>
                    <button class="btn btn-small" onclick="crm.editProject('${project.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="crm.deleteProject('${project.id}')">Delete</button>
                </div>
            </div>
            ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
            <div class="project-tasks">
                <div class="tasks-header">
                    <h5>Tasks (${totalTasks})</h5>
                    <button class="btn btn-small add-task-btn" onclick="crm.openTaskModal('${project.id}')">+ Add Task</button>
                </div>
                <div class="tasks-list">
                    ${this.renderTasksForProject(project.id)}
                </div>
            </div>
        `;

        return projectElement;
    }

    /**
     * Render tasks for a specific project
     * @param {string} projectId - Project ID
     * @returns {string} HTML string of tasks
     */
    renderTasksForProject(projectId) {
        const tasks = this.getTasksForProject(projectId);
        
        if (tasks.length === 0) {
            return '<div class="empty-state"><p>No tasks yet. Add your first task!</p></div>';
        }

        return tasks.map(task => `
            <div class="task-item">
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span class="task-status ${task.status}">${task.status}</span>
                        ${task.deadline ? `<span>📅 ${new Date(task.deadline).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-small" onclick="crm.editTask('${task.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="crm.deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update earnings display
     */
    updateEarningsDisplay() {
        const totalEarnings = document.getElementById('totalEarnings');
        const monthlyEarnings = document.getElementById('monthlyEarnings');
        const activeProjects = document.getElementById('activeProjects');

        if (totalEarnings) totalEarnings.textContent = `$${this.calculateTotalEarnings().toFixed(2)}`;
        if (monthlyEarnings) monthlyEarnings.textContent = `$${this.calculateMonthlyEarnings().toFixed(2)}`;
        if (activeProjects) activeProjects.textContent = this.getActiveProjectsCount();
    }

    /**
     * Open project modal
     * @param {string} projectId - Project ID for editing (optional)
     */
    openProjectModal(projectId = null) {
        this.currentProjectId = projectId;
        const modal = document.getElementById('projectModalOverlay');
        const title = document.getElementById('projectModalTitle');
        const form = document.querySelector('.project-form');

        if (projectId) {
            const project = this.getProjectById(projectId);
            if (project) {
                title.textContent = 'Edit Project';
                this.populateProjectForm(project);
            }
        } else {
            title.textContent = 'New Project';
            form.reset();
        }

        modal.classList.add('active');
    }

    /**
     * Close project modal
     */
    closeProjectModal() {
        document.getElementById('projectModalOverlay').classList.remove('active');
        this.currentProjectId = null;
    }

    /**
     * Open task modal
     * @param {string} projectId - Project ID for new task
     * @param {string} taskId - Task ID for editing (optional)
     */
    openTaskModal(projectId = null, taskId = null) {
        this.currentProjectId = projectId;
        this.currentTaskId = taskId;
        const modal = document.getElementById('taskModalOverlay');
        const title = document.getElementById('taskModalTitle');
        const form = document.querySelector('.task-form');
        const projectSelect = document.getElementById('taskProject');

        // Populate project select
        projectSelect.innerHTML = '<option value="">Select Project</option>';
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            if (projectId && project.id === projectId) {
                option.selected = true;
            }
            projectSelect.appendChild(option);
        });

        if (taskId) {
            const task = this.getTaskById(taskId);
            if (task) {
                title.textContent = 'Edit Task';
                this.populateTaskForm(task);
            }
        } else {
            title.textContent = 'New Task';
            form.reset();
        }

        modal.classList.add('active');
    }

    /**
     * Close task modal
     */
    closeTaskModal() {
        document.getElementById('taskModalOverlay').classList.remove('active');
        this.currentProjectId = null;
        this.currentTaskId = null;
    }

    /**
     * Populate project form with existing data
     * @param {Object} project - Project data
     */
    populateProjectForm(project) {
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectClient').value = project.client;
        document.getElementById('projectBudget').value = project.budget;
        document.getElementById('projectDeadline').value = project.deadline;
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectDescription').value = project.description;
    }

    /**
     * Populate task form with existing data
     * @param {Object} task - Task data
     */
    populateTaskForm(task) {
        document.getElementById('taskProject').value = task.projectId;
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDeadline').value = task.deadline;
        document.getElementById('taskStatus').value = task.status;
    }

    /**
     * Save project (create or update)
     * @param {Object} formData - Form data
     */
    saveProject(formData) {
        if (this.currentProjectId) {
            this.updateProject(this.currentProjectId, formData);
        } else {
            this.addProject(formData);
        }
        
        this.closeProjectModal();
        this.renderProjects();
        this.updateEarningsDisplay();
    }

    /**
     * Save task (create or update)
     * @param {Object} formData - Form data
     */
    saveTask(formData) {
        if (this.currentTaskId) {
            this.updateTask(this.currentTaskId, formData);
        } else {
            this.addTask(formData);
        }
        
        this.closeTaskModal();
        this.renderProjects();
    }

    /**
     * Edit project
     * @param {string} projectId - Project ID
     */
    editProject(projectId) {
        this.openProjectModal(projectId);
    }

    /**
     * Delete project
     * @param {string} projectId - Project ID
     */
    deleteProject(projectId) {
        if (Utils.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
            this.removeProject(projectId);
            this.renderProjects();
            this.updateEarningsDisplay();
        }
    }

    /**
     * Edit task
     * @param {string} taskId - Task ID
     */
    editTask(taskId) {
        const task = this.getTaskById(taskId);
        if (task) {
            this.openTaskModal(task.projectId, taskId);
        }
    }

    /**
     * Delete task
     * @param {string} taskId - Task ID
     */
    deleteTask(taskId) {
        if (Utils.confirm('Are you sure you want to delete this task?')) {
            this.removeTask(taskId);
            this.renderProjects();
        }
    }

    /**
     * Reset all CRM data
     */
    resetData() {
        this.projects = [];
        this.tasks = [];
        this.earnings = [];
        this.saveProjects();
        this.saveTasks();
        this.saveEarnings();
        this.renderProjects();
        this.updateEarningsDisplay();
    }
}
