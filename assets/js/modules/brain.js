/**
 * Brain Module - Second Brain functionality
 * Handles notes, categories, search, and organization
 */

class BrainModule {
    constructor() {
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.selectedNote = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNotes();
    }

    setupEventListeners() {
        // Add note button
        const addNoteBtn = document.getElementById('addNote');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                this.showAddNoteModal();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchNotes');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.loadNotes();
            });
        }

        // Category filtering
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active from all categories
                document.querySelectorAll('.category-item').forEach(cat => {
                    cat.classList.remove('active');
                });
                
                // Add active to clicked category
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.loadNotes();
            });
        });
    }

    loadNotes() {
        const filter = {
            category: this.currentCategory,
            search: this.searchTerm
        };

        const notes = dataManager.getItems('brain', 'notes', filter);
        this.renderNotes(notes);
    }

    renderNotes(notes) {
        const container = document.getElementById('notesContainer');
        
        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No notes found</h3>
                    <p>Start building your second brain by adding your first note!</p>
                    <button class="add-btn" onclick="window.app.modules.brain.showAddNoteModal()">+ Add Note</button>
                </div>
            `;
            return;
        }

        container.innerHTML = notes.map(note => `
            <div class="note-item" data-id="${note.id}" onclick="window.app.modules.brain.editNote('${note.id}')">
                <div class="note-title">${app.sanitizeHTML(note.title)}</div>
                <div class="note-preview">${app.truncateText(app.sanitizeHTML(note.content))}</div>
                <div class="note-meta">
                    <span class="note-category">${note.category}</span>
                    <span class="note-date">${app.formatDate(note.modified)}</span>
                </div>
            </div>
        `).join('');
    }

    showAddNoteModal() {
        const categories = dataManager.getModuleData('brain').categories;
        
        const modalContent = `
            <form id="noteForm">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" id="noteTitle" name="title" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="noteCategory" name="category" required>
                        ${categories.map(cat => `
                            <option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <textarea id="noteContent" name="content" rows="10" placeholder="Write your thoughts, ideas, or knowledge here..."></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tags (comma-separated)</label>
                    <input type="text" id="noteTags" name="tags" placeholder="productivity, ideas, project">
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                    <button type="submit" class="save-btn action-btn">Save Note</button>
                </div>
            </form>
        `;

        app.openModal('Add New Note', modalContent);

        // Handle form submission
        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNote();
        });
    }

    editNote(noteId) {
        const notes = dataManager.getItems('brain', 'notes');
        const note = notes.find(n => n.id === noteId);
        
        if (!note) return;

        const categories = dataManager.getModuleData('brain').categories;
        
        const modalContent = `
            <form id="noteForm">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" id="noteTitle" name="title" value="${app.sanitizeHTML(note.title)}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="noteCategory" name="category" required>
                        ${categories.map(cat => `
                            <option value="${cat}" ${cat === note.category ? 'selected' : ''}>${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <textarea id="noteContent" name="content" rows="10">${app.sanitizeHTML(note.content)}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tags (comma-separated)</label>
                    <input type="text" id="noteTags" name="tags" value="${note.tags ? note.tags.join(', ') : ''}" placeholder="productivity, ideas, project">
                </div>
                
                <div class="form-row">
                    <button type="button" class="action-btn" onclick="window.app.modules.brain.deleteNote('${note.id}')">Delete</button>
                    <div>
                        <button type="button" class="action-btn" onclick="window.app.closeModal()">Cancel</button>
                        <button type="submit" class="save-btn action-btn">Update Note</button>
                    </div>
                </div>
            </form>
        `;

        app.openModal('Edit Note', modalContent);

        // Store current note being edited
        this.selectedNote = note;

        // Handle form submission
        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateNote();
        });
    }

    saveNote() {
        const form = document.getElementById('noteForm');
        const formData = new FormData(form);
        
        const noteData = {
            title: formData.get('title').trim(),
            content: formData.get('content').trim(),
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (!noteData.title || !noteData.content) {
            app.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (dataManager.addItem('brain', 'notes', noteData)) {
            app.showNotification('Note saved successfully!', 'success');
            app.closeModal();
            this.loadNotes();
        } else {
            app.showNotification('Failed to save note', 'error');
        }
    }

    updateNote() {
        if (!this.selectedNote) return;

        const form = document.getElementById('noteForm');
        const formData = new FormData(form);
        
        const updates = {
            title: formData.get('title').trim(),
            content: formData.get('content').trim(),
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (!updates.title || !updates.content) {
            app.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (dataManager.updateItem('brain', 'notes', this.selectedNote.id, updates)) {
            app.showNotification('Note updated successfully!', 'success');
            app.closeModal();
            this.loadNotes();
            this.selectedNote = null;
        } else {
            app.showNotification('Failed to update note', 'error');
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            if (dataManager.deleteItem('brain', 'notes', noteId)) {
                app.showNotification('Note deleted successfully!', 'success');
                app.closeModal();
                this.loadNotes();
                this.selectedNote = null;
            } else {
                app.showNotification('Failed to delete note', 'error');
            }
        }
    }

    // Search and filter utilities
    searchNotes(term) {
        this.searchTerm = term;
        this.loadNotes();
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.loadNotes();
    }

    // Export notes as markdown
    exportNotesAsMarkdown() {
        const notes = dataManager.getItems('brain', 'notes');
        
        let markdown = '# MySecBrain Notes Export\n\n';
        markdown += `Exported on: ${new Date().toLocaleDateString()}\n\n`;
        
        const categories = [...new Set(notes.map(note => note.category))];
        
        categories.forEach(category => {
            markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
            
            const categoryNotes = notes.filter(note => note.category === category);
            
            categoryNotes.forEach(note => {
                markdown += `### ${note.title}\n\n`;
                markdown += `${note.content}\n\n`;
                
                if (note.tags && note.tags.length > 0) {
                    markdown += `**Tags:** ${note.tags.join(', ')}\n\n`;
                }
                
                markdown += `**Created:** ${app.formatDate(note.created)}\n\n`;
                markdown += `---\n\n`;
            });
        });

        // Create and download file
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mysecbrain-notes-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Get note statistics
    getStats() {
        const notes = dataManager.getItems('brain', 'notes');
        const categories = {};
        
        notes.forEach(note => {
            categories[note.category] = (categories[note.category] || 0) + 1;
        });

        return {
            total: notes.length,
            categories,
            totalWords: notes.reduce((total, note) => total + note.content.split(' ').length, 0)
        };
    }
}

// Make BrainModule available globally
window.BrainModule = BrainModule;