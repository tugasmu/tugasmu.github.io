// Admin Module
class AdminModule {
    constructor() {
        this.supabase = window.supabase;
        this.currentTab = 'users';
    }

    async initializeTab(tabId) {
        this.currentTab = tabId;
        
        switch (tabId) {
            case 'users':
                await this.initializeUsersTab();
                break;
            case 'subjects':
                await this.initializeSubjectsTab();
                break;
            case 'import':
                await this.initializeImportTab();
                break;
        }
    }

    async initializeUsersTab() {
        await this.loadUsers();
        this.setupUsersEventListeners();
    }

    async initializeSubjectsTab() {
        await this.loadSubjects();
        this.setupSubjectsEventListeners();
    }

    async initializeImportTab() {
        this.setupImportEventListeners();
    }

    setupUsersEventListeners() {
        document.addEventListener('click', (e) => {
            // Add user button
            if (e.target.closest('#add-user-btn')) {
                e.preventDefault();
                this.showAddUserModal();
            }

            // Refresh users
            if (e.target.closest('#refresh-users-btn')) {
                e.preventDefault();
                this.loadUsers();
            }

            // Edit user
            if (e.target.closest('.edit-user')) {
                e.preventDefault();
                const button = e.target.closest('.edit-user');
                const userId = button.dataset.userId;
                this.editUser(userId);
            }

            // Delete user
            if (e.target.closest('.delete-user')) {
                e.preventDefault();
                const button = e.target.closest('.delete-user');
                const userId = button.dataset.userId;
                this.deleteUser(userId);
            }
        });
    }

    setupSubjectsEventListeners() {
        document.addEventListener('click', (e) => {
            // Add subject button
            if (e.target.closest('#add-subject-btn')) {
                e.preventDefault();
                this.showAddSubjectModal();
            }

            // Refresh subjects
            if (e.target.closest('#refresh-subjects-btn')) {
                e.preventDefault();
                this.loadSubjects();
            }

            // Edit subject
            if (e.target.closest('.edit-subject')) {
                e.preventDefault();
                const button = e.target.closest('.edit-subject');
                const subjectId = button.dataset.subjectId;
                this.editSubject(subjectId);
            }

            // Delete subject
            if (e.target.closest('.delete-subject')) {
                e.preventDefault();
                const button = e.target.closest('.delete-subject');
                const subjectId = button.dataset.subjectId;
                this.deleteSubject(subjectId);
            }
        });
    }

    setupImportEventListeners() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'import-form') {
                e.preventDefault();
                this.handleImportCSV(e);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('#download-template-btn')) {
                e.preventDefault();
                this.downloadTemplate();
            }
        });
    }

    async loadUsers() {
        try {
            window.tugasmuApp.showLoading('Memuat data pengguna...');

            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderUsers(users || []);
            window.store.setUsers(users || []);

            window.tugasmuApp.hideLoading();

        } catch (error) {
            console.error('Failed to load users:', error);
            window.tugasmuApp.showAlert('Gagal memuat data pengguna', 'error');
            window.tugasmuApp.hideLoading();
        }
    }

    renderUsers(users) {
        const container = document.getElementById('users-table-body');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <i data-lucide="users" class="w-8 h-8 text-gray-400 mx-auto mb-2"></i>
                        <p>Belum ada data pengguna</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50 transition-colors duration-300">
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">${user.user_id}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-dark">${user.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${user.email || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="bg-${this.getRoleColor(user.role)} text-white px-3 py-1 rounded-full text-xs font-semibold">
                        ${this.getRoleDisplay(user.role)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Aktif</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex gap-2">
                        <button class="edit-user border-2 border-primary text-primary px-3 py-1 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 text-sm" data-user-id="${user.user_id}">
                            <i data-lucide="edit" class="icon"></i>
                        </button>
                        <button class="delete-user border-2 border-danger text-danger px-3 py-1 rounded-lg font-semibold hover:bg-danger hover:text-white transition-all duration-300 text-sm" data-user-id="${user.user_id}">
                            <i data-lucide="trash-2" class="icon"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    }

    async loadSubjects() {
        try {
            window.tugasmuApp.showLoading('Memuat data mata pelajaran...');

            // In a real app, you'd have a subjects table
            // For now, we'll use mock data
            const mockSubjects = [
                {
                    id: 'MAT-10',
                    name: 'Matematika',
                    teacher: 'Budi Santoso',
                    student_count: 30
                },
                {
                    id: 'BIN-10',
                    name: 'Bahasa Indonesia',
                    teacher: 'Siti Rahayu',
                    student_count: 28
                },
                {
                    id: 'ING-10',
                    name: 'Bahasa Inggris',
                    teacher: 'Budi Santoso',
                    student_count: 30
                }
            ];

            this.renderSubjects(mockSubjects);
            window.tugasmuApp.hideLoading();

        } catch (error) {
            console.error('Failed to load subjects:', error);
            window.tugasmuApp.showAlert('Gagal memuat data mata pelajaran', 'error');
            window.tugasmuApp.hideLoading();
        }
    }

    renderSubjects(subjects) {
        const container = document.getElementById('subjects-table-body');
        if (!container) return;

        if (subjects.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        <i data-lucide="book-open" class="w-8 h-8 text-gray-400 mx-auto mb-2"></i>
                        <p>Belum ada data mata pelajaran</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = subjects.map(subject => `
            <tr class="hover:bg-gray-50 transition-colors duration-300">
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">${subject.id}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-dark">${subject.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${subject.teacher}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${subject.student_count}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex gap-2">
                        <button class="edit-subject border-2 border-primary text-primary px-3 py-1 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 text-sm" data-subject-id="${subject.id}">
                            <i data-lucide="edit" class="icon"></i>
                        </button>
                        <button class="delete-subject border-2 border-danger text-danger px-3 py-1 rounded-lg font-semibold hover:bg-danger hover:text-white transition-all duration-300 text-sm" data-subject-id="${subject.id}">
                            <i data-lucide="trash-2" class="icon"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    }

    async handleAddUser(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const userData = {
            name: formData.get('new-user-name'),
            user_id: formData.get('new-user-id'),
            email: formData.get('new-user-email') || null,
            password: formData.get('new-user-password'),
            role: formData.get('new-user-role')
        };

        try {
            // Validate data
            if (!userData.name || !userData.user_id || !userData.password || !userData.role) {
                throw new Error('Semua field wajib diisi');
            }

            if (userData.user_id.length < 3) {
                throw new Error('User ID harus minimal 3 karakter');
            }

            if (userData.password.length < 6) {
                throw new Error('Password harus minimal 6 karakter');
            }

            window.tugasmuApp.showLoading('Menambah pengguna...');

            // Check if user already exists
            const { data: existingUser } = await this.supabase
                .from('users')
                .select('user_id')
                .eq('user_id', userData.user_id)
                .single();

            if (existingUser) {
                throw new Error('User ID sudah digunakan');
            }

            // Insert user
            const { error } = await this.supabase
                .from('users')
                .insert([userData]);

            if (error) throw error;

            // Success
            window.tugasmuApp.hideModal('add-user-modal');
            form.reset();
            await this.loadUsers();
            
            window.tugasmuApp.showAlert('Pengguna berhasil ditambahkan!', 'success');
            window.tugasmuApp.hideLoading();

        } catch (error) {
            console.error('Failed to add user:', error);
            window.tugasmuApp.showAlert('Gagal menambah pengguna: ' + error.message, 'error');
            window.tugasmuApp.hideLoading();
        }
    }

    async deleteUser(userId) {
        if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
        
        // Prevent deleting current user
        if (userId === window.store.state.user?.id) {
            window.tugasmuApp.showAlert('Tidak dapat menghapus akun sendiri', 'error');
            return;
        }

        try {
            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            window.tugasmuApp.showAlert('Pengguna berhasil dihapus!', 'success');
            await this.loadUsers();

        } catch (error) {
            console.error('Failed to delete user:', error);
            window.tugasmuApp.showAlert('Gagal menghapus pengguna', 'error');
        }
    }

    editUser(userId) {
        // Find user in store
        const user = window.store.state.users.find(u => u.user_id === userId);
        if (!user) return;

        // For now, just show an alert
        // In a real app, you'd open an edit modal
        window.tugasmuApp.showAlert(`Edit pengguna: ${user.name}`, 'info');
    }

    showAddUserModal() {
        window.tugasmuApp.showModal('add-user-modal');
    }

    showAddSubjectModal() {
        window.tugasmuApp.showModal('add-subject-modal');
    }

    editSubject(subjectId) {
        window.tugasmuApp.showAlert(`Edit mata pelajaran: ${subjectId}`, 'info');
    }

    deleteSubject(subjectId) {
        if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;
        window.tugasmuApp.showAlert(`Mata pelajaran ${subjectId} dihapus`, 'success');
        this.loadSubjects(); // Reload to show updated list
    }

    async handleImportCSV(e) {
        const form = e.target;
        const fileInput = document.getElementById('csv-file');
        
        if (!fileInput.files.length) {
            window.tugasmuApp.showAlert('Pilih file CSV terlebih dahulu', 'error');
            return;
        }

        try {
            window.tugasmuApp.showLoading('Mengimport data...');

            // Simulate import process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real app, you'd process the CSV file here
            // For now, we'll just show success message
            form.reset();
            window.tugasmuApp.showAlert('Data siswa berhasil diimport!', 'success');
            window.tugasmuApp.hideLoading();

        } catch (error) {
            console.error('Import failed:', error);
            window.tugasmuApp.showAlert('Gagal mengimport data', 'error');
            window.tugasmuApp.hideLoading();
        }
    }

    downloadTemplate() {
        // Create CSV template
        const csvContent = "nama,kelas,nis\nContoh Siswa,X IPA 1,12345";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-siswa.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.tugasmuApp.showAlert('Template berhasil didownload!', 'success');
    }

    async loadStats() {
        try {
            // Load users count
            const { data: users, error: usersError } = await this.supabase
                .from('users')
                .select('id');
            
            if (!usersError) {
                document.getElementById('total-users').textContent = users.length;
            }

            // Load assignments count
            const { data: assignments, error: assignmentsError } = await this.supabase
                .from('assignments')
                .select('id');
            
            if (!assignmentsError) {
                document.getElementById('total-assignments').textContent = assignments.length;
            }

            // Load submissions count
            const { data: submissions, error: submissionsError } = await this.supabase
                .from('submissions')
                .select('id');
            
            if (!submissionsError) {
                document.getElementById('total-submissions').textContent = submissions?.length || 0;
            }

            // Count unique subjects
            const { data: subjectsData, error: subjectsError } = await this.supabase
                .from('assignments')
                .select('subject');
            
            if (!subjectsError) {
                const uniqueSubjects = [...new Set(subjectsData.map(s => s.subject))];
                document.getElementById('active-courses').textContent = uniqueSubjects.length;
            }

        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    // Utility methods
    getRoleColor(role) {
        const colors = {
            'admin': 'purple',
            'teacher': 'blue',
            'student': 'green'
        };
        return colors[role] || 'gray';
    }

    getRoleDisplay(role) {
        const roles = {
            'admin': 'Developer',
            'teacher': 'Guru',
            'student': 'Siswa'
        };
        return roles[role] || role;
    }
}

// Initialize admin module
window.adminModule = new AdminModule();