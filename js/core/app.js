// Main Application Controller
class TugasmuApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.components = {};
        this.init();
    }

    async init() {
        try {
            // Initialize Lucide Icons
            lucide.createIcons();

            // Load essential components first
            await this.loadComponents();
            
            // Initialize core modules
            this.initAuth();
            this.initRouter();
            this.initEventListeners();

            // Check authentication status
            await this.checkAuth();

            // Load initial page
            await this.loadPage('home');

            console.log('Tugasmu App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showAlert('Gagal memuat aplikasi', 'error');
        }
    }

    async loadComponents() {
        const components = {
            'header': 'components/layout/header.html',
            'footer': 'components/layout/footer.html',
            'login-modal': 'components/modals/login-modal.html',
            'add-user-modal': 'components/modals/add-user-modal.html',
            'create-assignment-modal': 'components/modals/create-assignment-modal.html',
            'add-subject-modal': 'components/modals/add-subject-modal.html'
        };

        for (const [name, path] of Object.entries(components)) {
            try {
                const response = await fetch(path);
                const html = await response.text();
                this.components[name] = html;
            } catch (error) {
                console.error(`Failed to load component ${name}:`, error);
            }
        }

        // Render static components
        this.renderComponent('header-container', 'header');
        this.renderComponent('modal-container', 'login-modal');
        this.renderComponent('modal-container', 'add-user-modal');
        this.renderComponent('modal-container', 'create-assignment-modal');
        this.renderComponent('modal-container', 'add-subject-modal');
        
        // Footer is rendered in main HTML
    }

    renderComponent(containerId, componentName) {
        const container = document.getElementById(containerId);
        if (container && this.components[componentName]) {
            if (containerId === 'modal-container') {
                container.innerHTML += this.components[componentName];
            } else {
                container.innerHTML = this.components[componentName];
            }
        }
    }

    initAuth() {
        // Auth will be handled by auth.js module
        console.log('Auth system initialized');
    }

    initRouter() {
        // Simple client-side routing
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.loadPage(event.state.page);
            }
        });
    }

    initEventListeners() {
        // Global event delegation
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });

        document.addEventListener('submit', (e) => {
            this.handleGlobalSubmit(e);
        });

        document.addEventListener('change', (e) => {
            this.handleGlobalChange(e);
        });
    }

    handleGlobalClick(e) {
        // Navigation
        if (e.target.closest('.nav-link')) {
            e.preventDefault();
            const link = e.target.closest('.nav-link');
            const page = link.dataset.page;
            this.navigateTo(page);
        }

        // Modal handling
        if (e.target.closest('.close-modal')) {
            const button = e.target.closest('.close-modal');
            const modalId = button.dataset.modal;
            this.hideModal(modalId);
        }

        if (e.target.closest('[data-toggle-modal]')) {
            const button = e.target.closest('[data-toggle-modal]');
            const modalId = button.dataset.toggleModal;
            this.showModal(modalId);
        }

        // Login buttons
        if (e.target.closest('#login-btn') || e.target.closest('#hero-login-btn')) {
            e.preventDefault();
            this.showModal('auth-modal');
        }

        // Logout
        if (e.target.closest('#logout-dropdown-btn')) {
            e.preventDefault();
            this.logout();
        }

        // User dropdown
        if (e.target.closest('#user-dropdown-btn')) {
            e.preventDefault();
            this.toggleUserDropdown();
        }
    }

    handleGlobalSubmit(e) {
        // Login form
        if (e.target.id === 'login-form') {
            e.preventDefault();
            this.handleLogin(e);
        }

        // Add user form
        if (e.target.id === 'add-user-form') {
            e.preventDefault();
            this.handleAddUser(e);
        }

        // Create assignment form
        if (e.target.id === 'create-assignment-form') {
            e.preventDefault();
            this.handleCreateAssignment(e);
        }
    }

    handleGlobalChange(e) {
        // Assignment type change
        if (e.target.id === 'assignment-type') {
            this.handleAssignmentTypeChange(e.target.value);
        }
    }

    async navigateTo(page) {
        if (!this.currentUser && page !== 'home') {
            this.showModal('auth-modal');
            return;
        }

        this.currentPage = page;
        history.pushState({ page }, '', `#${page}`);
        await this.loadPage(page);
    }

    async loadPage(page) {
        try {
            this.showLoading();
            this.hideHeroSection();

            let pagePath;
            switch (page) {
                case 'home':
                    pagePath = 'pages/home/home.html';
                    break;
                case 'assignments':
                    pagePath = 'pages/assignments/assignments.html';
                    break;
                case 'admin':
                    pagePath = 'pages/admin/admin.html';
                    break;
                default:
                    pagePath = 'pages/home/home.html';
            }

            const response = await fetch(pagePath);
            const html = await response.text();
            document.getElementById('page-container').innerHTML = html;

            // Initialize page-specific functionality
            await this.initializePage(page);

            this.hideLoading();
            this.updateActiveNav(page);

        } catch (error) {
            console.error('Failed to load page:', error);
            this.showAlert('Gagal memuat halaman', 'error');
            this.hideLoading();
        }
    }

    async initializePage(page) {
        switch (page) {
            case 'home':
                await this.initializeHomePage();
                break;
            case 'assignments':
                await this.initializeAssignmentsPage();
                break;
            case 'admin':
                await this.initializeAdminPage();
                break;
        }
    }

    async initializeHomePage() {
        // Load default tab
        await this.loadHomeTab('info');
        
        // Add tab event listeners
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', async () => {
                const tabId = tab.dataset.tab;
                await this.loadHomeTab(tabId);
            });
        });
    }

    async loadHomeTab(tabId) {
        try {
            const response = await fetch(`pages/home/${tabId}.html`);
            const html = await response.text();
            document.getElementById('home-content').innerHTML = html;

            // Update active tab
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active', 'border-primary', 'text-primary');
                tab.classList.add('border-transparent', 'text-gray-500');
            });

            const activeTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
            if (activeTab) {
                activeTab.classList.add('active', 'border-primary', 'text-primary');
                activeTab.classList.remove('border-transparent', 'text-gray-500');
            }

            // Load stats if stats tab
            if (tabId === 'stats') {
                await this.loadStats();
            }

            lucide.createIcons();

        } catch (error) {
            console.error('Failed to load home tab:', error);
        }
    }

    async initializeAssignmentsPage() {
        if (!this.currentUser) return;

        let viewPath;
        if (this.currentUser.role === 'teacher') {
            viewPath = 'pages/assignments/teacher-view.html';
        } else if (this.currentUser.role === 'student') {
            viewPath = 'pages/assignments/student-view.html';
        } else {
            viewPath = 'pages/assignments/teacher-view.html'; // Default for admin
        }

        try {
            const response = await fetch(viewPath);
            const html = await response.text();
            document.getElementById('assignments-content').innerHTML = html;

            // Initialize assignments functionality
            if (typeof window.assignmentsModule !== 'undefined') {
                await window.assignmentsModule.initialize();
            }

            lucide.createIcons();

        } catch (error) {
            console.error('Failed to load assignments view:', error);
        }
    }

    async initializeAdminPage() {
        if (this.currentUser?.role !== 'admin') return;

        // Load default admin tab
        await this.loadAdminTab('users');
        
        // Add admin tab event listeners
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', async () => {
                const tabId = tab.dataset.tab;
                await this.loadAdminTab(tabId);
            });
        });
    }

    async loadAdminTab(tabId) {
        try {
            const response = await fetch(`pages/admin/${tabId}.html`);
            const html = await response.text();
            document.getElementById('admin-content').innerHTML = html;

            // Update active admin tab
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.classList.remove('active', 'border-primary', 'text-primary');
                tab.classList.add('border-transparent', 'text-gray-500');
            });

            const activeTab = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
            if (activeTab) {
                activeTab.classList.add('active', 'border-primary', 'text-primary');
                activeTab.classList.remove('border-transparent', 'text-gray-500');
            }

            // Initialize admin functionality
            if (typeof window.adminModule !== 'undefined') {
                await window.adminModule.initializeTab(tabId);
            }

            lucide.createIcons();

        } catch (error) {
            console.error('Failed to load admin tab:', error);
        }
    }

    // Auth methods
    async checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                await this.validateCurrentUser();
                this.updateUI();
            } catch (error) {
                console.error('Auth validation failed:', error);
                this.logout();
            }
        }
    }

    async validateCurrentUser() {
        // Verify user still exists in database
        const { data, error } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', this.currentUser.id)
            .single();

        if (error || !data) {
            throw new Error('User no longer exists');
        }
    }

    async handleLogin(e) {
        const form = e.target;
        const userid = form.querySelector('#login-userid').value;
        const password = form.querySelector('#login-password').value;

        try {
            this.showLoading('Sedang masuk...');

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', userid)
                .eq('password', password)
                .single();

            if (error || !data) {
                throw new Error('User ID atau password salah');
            }

            this.currentUser = {
                id: data.user_id,
                name: data.name,
                role: data.role,
                email: data.email
            };

            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // Update UI
            this.updateUI();
            this.hideModal('auth-modal');
            form.reset();

            // Navigate to assignments page
            await this.navigateTo('assignments');

            this.showAlert(`Login berhasil! Selamat datang ${data.name}`, 'success');
            this.hideLoading();

        } catch (error) {
            console.error('Login error:', error);
            this.showAlert(error.message, 'error');
            this.hideLoading();
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateUI();
        this.navigateTo('home');
        this.showAlert('Anda telah logout', 'info');
    }

    updateUI() {
        const loginSection = document.getElementById('login-section');
        const userInfo = document.getElementById('user-info');
        const adminNav = document.getElementById('admin-nav');

        if (this.currentUser) {
            // User logged in
            if (loginSection) loginSection.classList.add('hidden');
            if (userInfo) userInfo.classList.remove('hidden');

            // Update user info
            this.updateUserInfo();

            // Show admin nav if admin
            if (adminNav) {
                adminNav.classList.toggle('hidden', this.currentUser.role !== 'admin');
            }

        } else {
            // User not logged in
            if (loginSection) loginSection.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (adminNav) adminNav.classList.add('hidden');
        }

        lucide.createIcons();
    }

    updateUserInfo() {
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const userAvatar = document.getElementById('user-avatar');
        const dropdownUserName = document.getElementById('dropdown-user-name');
        const dropdownUserRole = document.getElementById('dropdown-user-role');

        if (this.currentUser) {
            const displayName = this.currentUser.name;
            const displayRole = this.getRoleDisplay(this.currentUser.role);
            const avatarInitials = this.getAvatarInitials(this.currentUser.name);

            if (userName) userName.textContent = displayName;
            if (userRole) userRole.textContent = displayRole;
            if (userAvatar) userAvatar.textContent = avatarInitials;
            if (dropdownUserName) dropdownUserName.textContent = displayName;
            if (dropdownUserRole) dropdownUserRole.textContent = displayRole;
        }
    }

    getRoleDisplay(role) {
        const roles = {
            'admin': 'Developer',
            'teacher': 'Guru',
            'student': 'Siswa'
        };
        return roles[role] || role;
    }

    getAvatarInitials(name) {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    // Modal methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown-menu');
        const button = document.getElementById('user-dropdown-btn');
        const chevron = button?.querySelector('i[data-lucide="chevron-down"]');

        if (dropdown && dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        } else {
            dropdown?.classList.add('hidden');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
    }

    // UI helper methods
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

    hideHeroSection() {
        const hero = document.getElementById('hero-section');
        if (hero) hero.classList.add('hidden');
    }

    updateActiveNav(page) {
        document.querySelectorAll('.nav-link').forEach(nav => {
            nav.classList.remove('active');
            if (nav.dataset.page === page) {
                nav.classList.add('active');
            }
        });
    }

    showAlert(message, type = 'info') {
        if (typeof window.uiModule !== 'undefined') {
            window.uiModule.showAlert(message, type);
        } else {
            // Fallback simple alert
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Additional methods will be implemented in specific modules
    async handleAddUser(e) {
        if (typeof window.adminModule !== 'undefined') {
            await window.adminModule.handleAddUser(e);
        }
    }

    async handleCreateAssignment(e) {
        if (typeof window.assignmentsModule !== 'undefined') {
            await window.assignmentsModule.handleCreateAssignment(e);
        }
    }

    handleAssignmentTypeChange(type) {
        if (typeof window.assignmentsModule !== 'undefined') {
            window.assignmentsModule.handleAssignmentTypeChange(type);
        }
    }

    async loadStats() {
        if (typeof window.adminModule !== 'undefined') {
            await window.adminModule.loadStats();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tugasmuApp = new TugasmuApp();
});