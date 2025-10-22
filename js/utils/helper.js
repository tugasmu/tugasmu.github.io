// General Helper Functions
class Helpers {
    constructor() {
        this.init();
    }

    init() {
        // Initialize any helper functionality
    }

    // String utilities
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    capitalizeWords(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, txt => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    truncateText(str, length = 50) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substr(0, length) + '...';
    }

    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }

    // Number utilities
    formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    }

    formatCurrency(amount, currency = 'IDR') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    percentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    }

    // Date utilities
    getCurrentSemester() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        
        if (month >= 1 && month <= 6) {
            return `Genap ${year}`;
        } else {
            return `Ganjil ${year}`;
        }
    }

    getAcademicYear() {
        const now = new Date();
        const year = now.getFullYear();
        return `${year}/${year + 1}`;
    }

    isDateInPast(dateString) {
        return new Date(dateString) < new Date();
    }

    daysUntil(dateString) {
        const target = new Date(dateString);
        const now = new Date();
        const diff = target - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // Array utilities
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffched[j], shuffled[i]];
        }
        return shuffled;
    }

    uniqueArray(array, key = null) {
        if (key) {
            return array.filter((item, index, self) =>
                index === self.findIndex(t => t[key] === item[key])
            );
        }
        return [...new Set(array)];
    }

    // Object utilities
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    isEmpty(obj) {
        if (obj == null) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return !obj;
    }

    getNestedValue(obj, path, defaultValue = null) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            result = result?.[key];
            if (result === undefined) return defaultValue;
        }
        
        return result ?? defaultValue;
    }

    // File utilities
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    getFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    isValidFileType(file, allowedTypes) {
        const extension = this.getFileExtension(file.name).toLowerCase();
        return allowedTypes.includes(extension);
    }

    // Validation utilities
    isValidIndonesianPhone(phone) {
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
        return phoneRegex.test(phone);
    }

    isValidNIS(nis) {
        // NIS typically 6-10 digits
        const nisRegex = /^\d{6,10}$/;
        return nisRegex.test(nis);
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Color utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return '#000000';
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    // DOM utilities
    injectCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    removeElement(selector) {
        const element = document.querySelector(selector);
        if (element) element.remove();
    }

    toggleClass(element, className) {
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        } else {
            element.classList.add(className);
        }
    }

    // Localization
    formatGrade(grade) {
        const grades = {
            '10': 'X',
            '11': 'XI', 
            '12': 'XII'
        };
        return grades[grade] || grade;
    }

    formatSubject(subject) {
        const subjects = {
            'matematika': 'Matematika',
            'bahasa-indonesia': 'Bahasa Indonesia',
            'ipa': 'Ilmu Pengetahuan Alam',
            'ips': 'Ilmu Pengetahuan Sosial',
            'bahasa-inggris': 'Bahasa Inggris',
            'pjok': 'PJOK',
            'seni-budaya': 'Seni Budaya'
        };
        return subjects[subject] || this.capitalizeWords(subject);
    }

    // Performance utilities
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    memoize(func) {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    // Random generators
    generateRandomId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    // Storage helpers
    sessionStorage = {
        set: (key, value) => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Session storage set failed:', error);
                return false;
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Session storage get failed:', error);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Session storage remove failed:', error);
                return false;
            }
        }
    };

    // Export utilities
    exportToCSV(data, filename = 'data.csv') {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    `"${String(row[header] || '').replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportToJSON(data, filename = 'data.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize helpers
window.helpers = new Helpers();