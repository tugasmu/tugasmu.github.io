import { CONFIG } from '../../Config/Config.js';

// Initialize Supabase client
export const supabase = window.supabase.createClient(
    CONFIG.SUPABASE_URL, 
    CONFIG.SUPABASE_ANON_KEY
);

// Supabase utility functions
export const supabaseService = {
    // User management
    async getUserById(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
        return { data, error };
    },

    async authenticateUser(userId, password, role) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .eq('password', password)
            .eq('role', role);

        return { data, error };
    },

    async createUser(userData) {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select();
        return { data, error };
    },

    async getUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async deleteUser(userId) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', userId);
        return { error };
    },

    // Assignment management
    async createAssignment(assignmentData) {
        const { data, error } = await supabase
            .from('assignments')
            .insert([assignmentData])
            .select();
        return { data, error };
    },

    async getAssignmentsByTeacher(teacherId) {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('created_by', teacherId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async deleteAssignment(assignmentId) {
        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', assignmentId);
        return { error };
    },

    // Questions management
    async createQuestions(questionsData) {
        const { error } = await supabase
            .from('assignment_questions')
            .insert(questionsData);
        return { error };
    },

    // Statistics
    async getStats() {
        const [users, assignments, submissions, subjects] = await Promise.all([
            supabase.from('users').select('id'),
            supabase.from('assignments').select('id'),
            supabase.from('submissions').select('id'),
            supabase.from('assignments').select('subject')
        ]);

        return {
            users: users.data?.length || 0,
            assignments: assignments.data?.length || 0,
            submissions: submissions.data?.length || 0,
            subjects: [...new Set(subjects.data?.map(s => s.subject))].length || 0
        };
    }
};