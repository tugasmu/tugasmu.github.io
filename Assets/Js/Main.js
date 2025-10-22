import { CONFIG } from '../../Config/Config.js';
import { supabase, supabaseService } from './Supabase.js';
import { authService } from './Auth.js';
import { uiService } from './Ui.js';
import { assignmentService } from './Assignment.js';
import { adminService } from './Admin.js';

// Global state
export const appState = {
    currentUser: null,
    userRole: null,
    dropdownOpen: false,
    currentPage: 'home'
};

// Initialize application
export async function initApp() {
    try {
        // Initialize Lucide icons
        lucide.createIcons();
        
        // Load components
        await loadComponents();
        
        // Check if user is already logged in
        await authService.checkExistingSession();
        
        // Setup event listeners
        setupEventListeners();
        
        // Show initial page
        uiService.showPage('home');
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        uiService.showAlert('Gagal memuat aplikasi', 'error');
    }
}

// Load HTML components
async function loadComponents() {
    try {
        // Load header
        const headerResponse = await fetch('Components/Header.html');
        const headerHTML = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHTML;
        
        // Load footer
        const footerResponse = await fetch('Components/Footer.html');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerHTML;
        
        // Load pages
        const homeResponse = await fetch('Components/Pages/HomePage.html');
        const homeHTML = await homeResponse.text();
        const assignmentsResponse = await fetch('Components/Pages/AssignmentsPage.html');
        const assignmentsHTML = await assignmentsResponse.text();
        const adminResponse = await fetch('Components/Pages/AdminPage.html');
        const adminHTML = await adminResponse.text();
        
        document.getElementById('page-container').innerHTML = 
            homeHTML + assignmentsHTML + adminHTML;
        
        // Load modals separately
        const authModalResponse = await fetch('Components/Modals/AuthModal.html');
        const authModalHTML = await authModalResponse.text();
        document.getElementById('auth-modal-container').innerHTML = authModalHTML;
        
        const addUserModalResponse = await fetch('Components/Modals/AddUserModal.html');
        const addUserModalHTML = await addUserModalResponse.text();
        document.getElementById('add-user-modal-container').innerHTML = addUserModalHTML;
        
        const assignmentModalResponse = await fetch('Components/Modals/AssignmentModal.html');
        const assignmentModalHTML = await assignmentModalResponse.text();
        document.getElementById('assignment-modals-container').innerHTML = assignmentModalHTML;
        
        // Refresh icons after loading components
        setTimeout(() => lucide.createIcons(), 100);
        
    } catch (error) {
        console.error('Error loading components:', error);
        uiService.showAlert('Gagal memuat komponen aplikasi', 'error');
    }
}

// Setup global event listeners
function setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
        // Navigation links
        if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
            e.preventDefault();
            const link = e.target.matches('.nav-link') ? e.target : e.target.closest('.nav-link');
            const page = link.dataset.page;
            
            if (!appState.currentUser && page !== 'home') {
                uiService.showAuthModal();
                return;
            }
            
            uiService.activateNavLink(link);
            uiService.showPage(page);
            appState.currentPage = page;
        }
        
        // Tabs
        if (e.target.matches('.tab') || e.target.closest('.tab')) {
            const tab = e.target.matches('.tab') ? e.target : e.target.closest('.tab');
            const tabId = tab.dataset.tab;
            uiService.activateTab(tabId);
        }
        
        // Login buttons
        if (e.target.matches('#login-btn, #hero-login-btn') || 
            e.target.closest('#login-btn, #hero-login-btn')) {
            e.preventDefault();
            uiService.showAuthModal();
        }
        
        // User dropdown
        if (e.target.matches('#user-dropdown-btn') || e.target.closest('#user-dropdown-btn')) {
            e.preventDefault();
            uiService.toggleUserDropdown();
        }
        
        // Close dropdown when clicking outside
        if (appState.dropdownOpen && 
            !e.target.closest('#user-info') && 
            !e.target.closest('#user-dropdown-menu')) {
            uiService.closeUserDropdown();
        }
        
        // Modal close buttons
        if (e.target.matches('.close, .close-add-user') || e.target.closest('.close, .close-add-user')) {
            e.preventDefault();
            uiService.closeAllModals();
        }
        
        // Cancel buttons
        if (e.target.matches('#cancel-add-user, #cancel-assignment-btn')) {
            e.preventDefault();
            uiService.closeAllModals();
            assignmentService.hideAssignmentForm();
        }
    });
    
    // Form submissions
    document.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (e.target.matches('#login-form')) {
            authService.handleLogin(e);
        } else if (e.target.matches('#add-user-form')) {
            adminService.handleAddUser(e);
        } else if (e.target.matches('#assignment-form')) {
            assignmentService.handleCreateAssignment(e);
        } else if (e.target.matches('#import-form')) {
            adminService.handleImportCSV(e);
        }
    });
    
    // Logout
    document.addEventListener('click', (e) => {
        if (e.target.matches('#logout-dropdown-btn') || e.target.closest('#logout-dropdown-btn')) {
            e.preventDefault();
            authService.handleLogout();
        }
    });
    
    // Admin page buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('#add-user-btn') || e.target.closest('#add-user-btn')) {
            e.preventDefault();
            uiService.showAddUserModal();
        } else if (e.target.matches('#refresh-users-btn') || e.target.closest('#refresh-users-btn')) {
            e.preventDefault();
            adminService.loadUsers();
        } else if (e.target.matches('#download-template-btn') || e.target.closest('#download-template-btn')) {
            e.preventDefault();
            adminService.downloadTemplate();
        }
    });
    
    // Assignment page buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('#create-assignment-btn') || e.target.closest('#create-assignment-btn')) {
            e.preventDefault();
            assignmentService.showAssignmentForm();
        } else if (e.target.matches('#refresh-assignments-btn') || e.target.closest('#refresh-assignments-btn')) {
            e.preventDefault();
            assignmentService.loadStudentAssignments();
        } else if (e.target.matches('#refresh-teacher-assignments-btn') || e.target.closest('#refresh-teacher-assignments-btn')) {
            e.preventDefault();
            assignmentService.loadTeacherAssignments();
        }
    });
    
    // Assignment type change
    document.addEventListener('change', (e) => {
        if (e.target.matches('#assignment-type')) {
            assignmentService.handleAssignmentTypeChange(e.target.value);
        }
    });
    
    // Dynamic question management
    document.addEventListener('click', (e) => {
        if (e.target.matches('#add-question-btn') || e.target.closest('#add-question-btn')) {
            e.preventDefault();
            assignmentService.addNewQuestion();
        } else if (e.target.matches('.delete-question') || e.target.closest('.delete-question')) {
            e.preventDefault();
            const questionElement = e.target.closest('[data-question-id]');
            assignmentService.deleteQuestion(questionElement);
        } else if (e.target.matches('.add-option-btn') || e.target.closest('.add-option-btn')) {
            e.preventDefault();
            const questionId = e.target.dataset.questionId;
            assignmentService.addOptionToQuestion(questionId);
        }
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);