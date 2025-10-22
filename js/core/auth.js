// Authentication Module
class AuthModule {
    constructor() {
        this.supabase = window.supabase;
    }

    async login(userId, password) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('user_id', userId)
                .eq('password', password)
                .single();

            if (error) throw error;
            if (!data) throw new Error('User tidak ditemukan');

            return {
                success: true,
                user: {
                    id: data.user_id,
                    name: data.name,
                    role: data.role,
                    email: data.email
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async validateSession(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('user_id, name, role')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return { valid: true, user: data };

        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        return { success: true };
    }

    hasPermission(user, permission) {
        const permissions = {
            'admin': ['manage_users', 'manage_subjects', 'view_reports', 'create_assignments'],
            'teacher': ['create_assignments', 'grade_assignments', 'view_students'],
            'student': ['submit_assignments', 'view_grades']
        };

        return permissions[user?.role]?.includes(permission) || false;
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    requireAuth(requiredRole = null) {
        const user = this.getCurrentUser();
        
        if (!user) {
            return { allowed: false, reason: 'not_logged_in' };
        }

        if (requiredRole && user.role !== requiredRole) {
            return { allowed: false, reason: 'insufficient_permissions' };
        }

        return { allowed: true, user };
    }
}

// Initialize auth module
window.authModule = new AuthModule();