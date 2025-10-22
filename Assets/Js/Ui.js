import { utils } from './Utils.js';
import { appState } from './Main.js';

export const uiService = {
    // Show alert message
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        }[type];
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }[type];
        
        const alert = document.createElement('div');
        alert.className = `${bgColor} text-white p-4 rounded-xl shadow-lg animate-slide-in-right flex items-center gap-3`;
        alert.innerHTML = `
            <span class="text-lg">${icon}</span>
            <span class="flex-1">${message}</span>
            <button class="text-white hover:text-gray-200 transition-colors duration-300" onclick="this.parentElement.remove()">
                <i data-lucide="x" class="icon"></i>
            </button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Refresh icons
        lucide.createIcons();
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    },
    
    // Update UI based on authentication state
    updateUI() {
        const loginSection = document.getElementById('login-section');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const dropdownUserName = document.getElementById('dropdown-user-name');
        const dropdownUserRole = document.getElementById('dropdown-user-role');
        const userAvatar = document.querySelector('#user-info .w-8.h-8');
        const adminNav = document.getElementById('admin-nav');
        
        if (appState.currentUser) {
            // User is logged in
            loginSection.classList.add('hidden');
            userInfo.classList.remove('hidden');
            
            // Update user data
            const displayName = appState.currentUser.name;
            const displayRole = appState.currentUser.role === 'admin' ? 'Developer' : 
                              appState.currentUser.role === 'teacher' ? 'Guru' : 'Siswa';
            
            if (userName) userName.textContent = displayName;
            if (userRole) userRole.textContent = displayRole;
            if (dropdownUserName) dropdownUserName.textContent = displayName;
            if (dropdownUserRole) dropdownUserRole.textContent = displayRole;
            if (userAvatar) {
                userAvatar.textContent = utils.getAvatarInitials(appState.currentUser.name);
            }
            
            // Show admin nav if role is admin
            if (adminNav) {
                adminNav.classList.toggle('hidden', appState.currentUser.role !== 'admin');
            }
            
        } else {
            // User is not logged in
            loginSection.classList.remove('hidden');
            userInfo.classList.add('hidden');
            if (adminNav) adminNav.classList.add('hidden');
            
            // Ensure dropdown is closed
            this.closeUserDropdown();
        }
        
        lucide.createIcons();
    },
    
    // Show specific page
    showPage(pageId) {
        // Hide all pages
        document.getElementById('home-page').classList.add('hidden');
        document.getElementById('assignments-page').classList.add('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        
        // Show selected page
        document.getElementById(`${pageId}-page`).classList.remove('hidden');
        
        // Refresh icons
        lucide.createIcons();
    },
    
    // Activate navigation link
    activateNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    },
    
    // Activate tab
    activateTab(tabId) {
        // Deactivate all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active', 'border-primary', 'text-primary');
            tab.classList.add('border-transparent', 'text-gray-500');
        });
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Activate selected tab
        const activeTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
        activeTab.classList.add('active', 'border-primary', 'text-primary');
        activeTab.classList.remove('border-transparent', 'text-gray-500');
        
        // Show selected tab content
        document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        
        // Refresh icons
        lucide.createIcons();
    },
    
    // Show auth modal
    showAuthModal() {
        document.getElementById('auth-modal').classList.remove('hidden');
        lucide.createIcons();
    },
    
    // Show add user modal
    showAddUserModal() {
        document.getElementById('add-user-modal').classList.remove('hidden');
        lucide.createIcons();
    },
    
    // Close all modals
    closeAllModals() {
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('add-user-modal').classList.add('hidden');
    },
    
    // Toggle user dropdown
    toggleUserDropdown() {
        const dropdownMenu = document.getElementById('user-dropdown-menu');
        const dropdownBtn = document.getElementById('user-dropdown-btn');
        const chevron = dropdownBtn.querySelector('i[data-lucide="chevron-down"]');
        
        appState.dropdownOpen = !appState.dropdownOpen;
        
        if (appState.dropdownOpen) {
            dropdownMenu.classList.remove('hidden');
            // Rotate chevron
            chevron.style.transform = 'rotate(180deg)';
        } else {
            dropdownMenu.classList.add('hidden');
            // Reset chevron
            chevron.style.transform = 'rotate(0deg)';
        }
    },
    
    // Close user dropdown
    closeUserDropdown() {
        const dropdownMenu = document.getElementById('user-dropdown-menu');
        const dropdownBtn = document.getElementById('user-dropdown-btn');
        const chevron = dropdownBtn.querySelector('i[data-lucide="chevron-down"]');
        
        appState.dropdownOpen = false;
        dropdownMenu.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
    },
    
    // Show loading state
    showLoading(element) {
        element.innerHTML = `
            <div class="bg-white rounded-xl p-6 text-center shadow-lg border">
                <i data-lucide="loader" class="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin"></i>
                <p class="text-gray-600">Memuat...</p>
            </div>
        `;
        lucide.createIcons();
    },
    
    // Show empty state
    showEmptyState(element, message, icon = 'inbox') {
        element.innerHTML = `
            <div class="bg-white rounded-xl p-8 text-center shadow-lg border">
                <i data-lucide="${icon}" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 mb-4">${message}</p>
            </div>
        `;
        lucide.createIcons();
    },
    
    // Show error state
    showErrorState(element, message) {
        element.innerHTML = `
            <div class="bg-white rounded-xl p-6 text-center shadow-lg border">
                <i data-lucide="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-3"></i>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        lucide.createIcons();
    }
};