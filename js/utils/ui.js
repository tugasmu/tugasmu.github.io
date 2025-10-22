// UI Utilities Module
class UIModule {
    constructor() {
        this.alertTimeout = 5000; // 5 seconds
        this.init();
    }

    init() {
        this.setupAlertCloseHandlers();
    }

    // Alert System
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;

        const alertId = 'alert-' + Date.now();
        const alertHTML = this.createAlertHTML(message, type, alertId);
        
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto remove after timeout
        setTimeout(() => {
            this.removeAlert(alertId);
        }, this.alertTimeout);

        return alertId;
    }

    createAlertHTML(message, type, alertId) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        return `
            <div id="${alertId}" class="${colors[type]} text-white p-4 rounded-xl shadow-lg animate-slide-in-right flex items-center gap-3">
                <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
                <span class="flex-1">${message}</span>
                <button class="alert-close text-white hover:text-gray-200 transition-colors duration-300" data-alert-id="${alertId}">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    }

    removeAlert(alertId) {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.remove();
        }
    }

    setupAlertCloseHandlers() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.alert-close')) {
                const button = e.target.closest('.alert-close');
                const alertId = button.dataset.alertId;
                this.removeAlert(alertId);
            }
        });
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scroll
        }
    }

    toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (modal.classList.contains('hidden')) {
                this.showModal(modalId);
            } else {
                this.hideModal(modalId);
            }
        }
    }

    // Loading States
    showLoading(message = 'Memuat...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const text = overlay.querySelector('span');
            if (text) text.textContent = message;
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    showButtonLoading(button, text = 'Memproses...') {
        if (!button) return;
        
        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = `
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>${text}</span>
        `;
        
        button.dataset.originalContent = originalText;
    }

    hideButtonLoading(button) {
        if (!button) return;
        
        button.disabled = false;
        if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
        }
    }

    // Form Utilities
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        const errors = [];

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                this.showInputError(input, 'Field ini wajib diisi');
                errors.push(`${input.name || input.id} is required`);
            } else {
                this.hideInputError(input);
            }

            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    this.showInputError(input, 'Format email tidak valid');
                    errors.push('Invalid email format');
                }
            }

            // Password strength
            if (input.type === 'password' && input.value) {
                if (input.value.length < 6) {
                    isValid = false;
                    this.showInputError(input, 'Password harus minimal 6 karakter');
                    errors.push('Password too weak');
                }
            }
        });

        return { isValid, errors };
    }

    showInputError(input, message) {
        input.classList.add('border-red-500', 'focus:ring-red-500');
        input.classList.remove('border-gray-300', 'focus:ring-primary');

        // Remove existing error message
        this.hideInputError(input);

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-xs mt-1 flex items-center gap-1';
        errorDiv.innerHTML = `<i data-lucide="alert-circle" class="w-3 h-3"></i> ${message}`;
        
        input.parentNode.appendChild(errorDiv);
        lucide.createIcons();
    }

    hideInputError(input) {
        input.classList.remove('border-red-500', 'focus:ring-red-500');
        input.classList.add('border-gray-300', 'focus:ring-primary');

        const errorDiv = input.parentNode.querySelector('.text-red-500');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Table Utilities
    sortTable(tableId, columnIndex, sortDirection = 'asc') {
        const table = document.getElementById(tableId);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        // Remove existing rows
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        // Add sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }

    filterTable(tableId, searchTerm) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
    }

    // Pagination
    createPagination(containerId, currentPage, totalPages, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let paginationHTML = '<div class="flex justify-center items-center gap-2">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `
                <button class="pagination-btn px-3 py-1 border border-gray-300 rounded hover:bg-gray-50" data-page="${currentPage - 1}">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
            `;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `
                    <button class="px-3 py-1 bg-primary text-white rounded font-semibold">${i}</button>
                `;
            } else {
                paginationHTML += `
                    <button class="pagination-btn px-3 py-1 border border-gray-300 rounded hover:bg-gray-50" data-page="${i}">${i}</button>
                `;
            }
        }

        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `
                <button class="pagination-btn px-3 py-1 border border-gray-300 rounded hover:bg-gray-50" data-page="${currentPage + 1}">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            `;
        }

        paginationHTML += '</div>';
        
        container.innerHTML = paginationHTML;
        lucide.createIcons();

        // Add event listeners
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                onPageChange(page);
            });
        });
    }

    // Date and Time Formatting
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
        
        return this.formatDate(dateString);
    }

    // Local Storage Utilities
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to set localStorage:', error);
            return false;
        }
    }

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to get localStorage:', error);
            return defaultValue;
        }
    }

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove localStorage:', error);
            return false;
        }
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showAlert('Teks berhasil disalin', 'success');
        }).catch(() => {
            this.showAlert('Gagal menyalin teks', 'error');
        });
    }
}

// Initialize UI module
window.uiModule = new UIModule();