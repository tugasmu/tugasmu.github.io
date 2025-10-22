// Users Module (Extended user management)
class UsersModule {
    constructor() {
        this.supabase = window.supabase;
    }

    async getUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Failed to get user profile:', error);
            return null;
        }
    }

    async updateUserProfile(userId, updates) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update(updates)
                .eq('user_id', userId);

            if (error) throw error;
            return { success: true };

        } catch (error) {
            console.error('Failed to update user profile:', error);
            return { success: false, error: error.message };
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Verify current password
            const { data: user } = await this.supabase
                .from('users')
                .select('password')
                .eq('user_id', userId)
                .single();

            if (!user || user.password !== currentPassword) {
                throw new Error('Password saat ini salah');
            }

            // Update password
            const { error } = await this.supabase
                .from('users')
                .update({ password: newPassword })
                .eq('user_id', userId);

            if (error) throw error;
            return { success: true };

        } catch (error) {
            console.error('Failed to change password:', error);
            return { success: false, error: error.message };
        }
    }

    async searchUsers(query, role = null) {
        try {
            let queryBuilder = this.supabase
                .from('users')
                .select('*')
                .or(`name.ilike.%${query}%,user_id.ilike.%${query}%,email.ilike.%${query}%`)
                .order('name');

            if (role) {
                queryBuilder = queryBuilder.eq('role', role);
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Failed to search users:', error);
            return [];
        }
    }

    async getUsersByRole(role) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('role', role)
                .order('name');

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Failed to get users by role:', error);
            return [];
        }
    }

    async bulkCreateUsers(usersData) {
        try {
            const { error } = await this.supabase
                .from('users')
                .insert(usersData);

            if (error) throw error;
            return { success: true, count: usersData.length };

        } catch (error) {
            console.error('Failed to bulk create users:', error);
            return { success: false, error: error.message };
        }
    }

    validateUserData(userData) {
        const errors = [];

        if (!userData.name || userData.name.trim().length < 2) {
            errors.push('Nama harus minimal 2 karakter');
        }

        if (!userData.user_id || userData.user_id.length < 3) {
            errors.push('User ID harus minimal 3 karakter');
        }

        if (!userData.password || userData.password.length < 6) {
            errors.push('Password harus minimal 6 karakter');
        }

        if (!userData.role || !['admin', 'teacher', 'student'].includes(userData.role)) {
            errors.push('Role harus admin, teacher, atau student');
        }

        if (userData.email && !this.isValidEmail(userData.email)) {
            errors.push('Format email tidak valid');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateStudentId(grade, sequence) {
        const year = new Date().getFullYear().toString().slice(-2);
        return `S${year}${grade}${sequence.toString().padStart(3, '0')}`;
    }

    async getUsersStats() {
        try {
            const { data: users, error } = await this.supabase
                .from('users')
                .select('role');

            if (error) throw error;

            const stats = {
                total: users.length,
                admin: users.filter(u => u.role === 'admin').length,
                teacher: users.filter(u => u.role === 'teacher').length,
                student: users.filter(u => u.role === 'student').length
            };

            return stats;

        } catch (error) {
            console.error('Failed to get users stats:', error);
            return null;
        }
    }
}

// Initialize users module
window.usersModule = new UsersModule();