import { CONFIG } from '../../Config/Config.js';
import { supabaseService } from './Supabase.js';
import { uiService } from './Ui.js';
import { appState } from './Main.js';
import { assignmentService } from './Assignment.js';
import { adminService } from './Admin.js';

export const authService = {
    // Check if user has existing session
    async checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                appState.currentUser = JSON.parse(savedUser);
                appState.userRole = appState.currentUser.role;
                
                // Verify user still exists in database
                const { data, error } = await supabaseService.getUserById(appState.currentUser.id);
                
                if (error || !data) {
                    this.handleLogout();
                    return;
                }
                
                uiService.updateUI();
                this.loadContentBasedOnRole();
                uiService.showAlert(`Selamat datang kembali, ${appState.currentUser.name}!`, 'success');
                
            } catch (error) {
                this.handleLogout();
            }
        }
    },
    
    // Handle user login
    async handleLogin(e) {
        const userid = document.getElementById('login-userid').value;
        const password = document.getElementById('login-password').value;
        
        try {
            if (!userid || !password) {
                throw new Error('Semua field harus diisi');
            }
            
            // Try different roles
            const roles = ['admin', 'teacher'];
            let userData = null;
            
            for (const role of roles) {
                const { data, error } = await supabaseService.authenticateUser(userid, password, role);
                
                if (error) {
                    console.error('Supabase error:', error);
                    continue;
                }
                
                if (data && data.length > 0) {
                    userData = data[0];
                    break;
                }
            }
            
            if (!userData) {
                throw new Error('User ID atau password salah');
            }
            
            // Login successful
            appState.currentUser = {
                id: userData.user_id,
                name: userData.name,
                role: userData.role
            };
            appState.userRole = userData.role;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
            
            // Reset form and close modal
            e.target.reset();
            uiService.closeAllModals();
            
            // Update UI and load content
            uiService.updateUI();
            this.loadContentBasedOnRole();
            
            // Redirect to assignments page
            uiService.showPage('assignments');
            uiService.activateNavLink(document.querySelector('[data-page="assignments"]'));
            
            uiService.showAlert(`Login berhasil! Selamat datang ${userData.name}`, 'success');
            
        } catch (error) {
            console.error('Login error:', error);
            uiService.showAlert('Login gagal: ' + error.message, 'error');
        }
    },
    
    // Handle user logout
    async handleLogout() {
        // Close dropdown
        uiService.closeUserDropdown();
        
        // Clear localStorage
        localStorage.removeItem('currentUser');
        
        // Reset app state
        appState.currentUser = null;
        appState.userRole = null;
        
        // Reset UI to initial state
        uiService.updateUI();
        
        // Return to home page
        uiService.showPage('home');
        uiService.activateNavLink(document.querySelector('[data-page="home"]'));
        
        uiService.showAlert('Anda telah logout', 'info');
    },
    
    // Load content based on user role
    loadContentBasedOnRole() {
        // Reset all views first
        document.getElementById('student-view').classList.add('hidden');
        document.getElementById('teacher-view').classList.add('hidden');
        
        if (appState.userRole === 'student') {
            document.getElementById('student-view').classList.remove('hidden');
            assignmentService.loadStudentAssignments();
        } else if (appState.userRole === 'teacher') {
            document.getElementById('teacher-view').classList.remove('hidden');
            assignmentService.loadTeacherAssignments();
        } else if (appState.userRole === 'admin') {
            adminService.loadUsers();
            adminService.loadSubjects();
        }
        
        // Refresh icons
        lucide.createIcons();
    },
    
    // Get current user
    getCurrentUser() {
        return appState.currentUser;
    },
    
    // Get user role
    getUserRole() {
        return appState.userRole;
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return appState.currentUser !== null;
    },
    
    // Check if user has specific role
    hasRole(role) {
        return appState.userRole === role;
    }
};