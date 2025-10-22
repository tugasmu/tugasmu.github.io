import { showAlert } from './Ui.js';

// Utility functions
export const utils = {
    // Generate avatar initials
    getAvatarInitials(name) {
        if (!name) return 'U';
        
        const names = name.split(' ');
        let initials = '';
        
        if (names.length === 1) {
            initials = names[0].substring(0, 2).toUpperCase();
        } else {
            initials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        
        return initials;
    },

    // Format date
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Debounce function
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
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Download CSV template
    downloadCSVTemplate() {
        const csvContent = "name,class,nis\nJohn Doe,10A,12345\nJane Smith,10B,12346";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'template_siswa.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showAlert('Template berhasil didownload!', 'success');
    }
};