import { CONFIG } from '../../Config/Config.js';
import { supabaseService } from './Supabase.js';
import { uiService } from './Ui.js';
import { utils } from './Utils.js';
import { appState } from './Main.js';

export const adminService = {
    // Handle add user
    async handleAddUser(e) {
        const name = document.getElementById('new-user-name').value;
        const userid = document.getElementById('new-user-id').value;
        const password = document.getElementById('new-user-password').value;
        const role = document.getElementById('new-user-role').value;
        
        try {
            if (!name || !userid || !password || !role) {
                throw new Error('Semua field harus diisi');
            }
            
            // Insert to Supabase
            const { data, error } = await supabaseService.createUser({
                name: name,
                user_id: userid,
                password: password,
                role: role
            });

            if (error) throw error;

            uiService.showAlert('Pengguna berhasil ditambahkan!', 'success');
            e.target.reset();
            uiService.closeAllModals();
            this.loadUsers(); // Refresh user list
        } catch (error) {
            console.error('Add user error:', error);
            uiService.showAlert('Gagal menambah pengguna: ' + error.message, 'error');
        }
    },
    
    // Load users
    async loadUsers() {
        const usersTableBody = document.getElementById('users-table-body');
        usersTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500"><i data-lucide="loader" class="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin"></i>Memuat data pengguna...</td></tr>';
        lucide.createIcons();
        
        try {
            const { data: users, error } = await supabaseService.getUsers();

            if (error) throw error;

            if (users.length === 0) {
                usersTableBody.innerHTML = `
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

            usersTableBody.innerHTML = users.map(user => `
                <tr class="hover:bg-gray-50 transition-colors duration-300">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">${user.user_id}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-dark">${user.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">${user.email || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">${user.role}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Aktif</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex gap-2">
                            <button class="border-2 border-primary text-primary px-3 py-1 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 text-sm">
                                <i data-lucide="edit" class="icon"></i>
                            </button>
                            <button class="border-2 border-danger text-danger px-3 py-1 rounded-lg font-semibold hover:bg-danger hover:text-white transition-all duration-300 text-sm" onclick="adminService.deleteUser('${user.user_id}')">
                                <i data-lucide="trash-2" class="icon"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            lucide.createIcons();
        } catch (error) {
            console.error('Load users error:', error);
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <i data-lucide="alert-circle" class="w-6 h-6 text-red-500 mx-auto mb-2"></i>
                        <p>Gagal memuat data pengguna</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
        }
    },
    
    // Delete user
    async deleteUser(userId) {
        if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
        
        try {
            const { error } = await supabaseService.deleteUser(userId);

            if (error) throw error;

            uiService.showAlert('Pengguna berhasil dihapus!', 'success');
            this.loadUsers(); // Refresh list
        } catch (error) {
            console.error('Delete user error:', error);
            uiService.showAlert('Gagal menghapus pengguna', 'error');
        }
    },
    
    // Load subjects
    async loadSubjects() {
        const subjectsTableBody = document.getElementById('subjects-table-body');
        subjectsTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500"><i data-lucide="loader" class="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin"></i>Memuat data mata pelajaran...</td></tr>';
        lucide.createIcons();
        
        // Simulate loading (replace with actual API call)
        setTimeout(() => {
            subjectsTableBody.innerHTML = `
                <tr class="hover:bg-gray-50 transition-colors duration-300">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">MAT-10</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-dark">Matematika</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">Budi Santoso</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">30</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex gap-2">
                            <button class="border-2 border-primary text-primary px-3 py-1 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 text-sm">
                                <i data-lucide="edit" class="icon"></i>
                            </button>
                            <button class="border-2 border-danger text-danger px-3 py-1 rounded-lg font-semibold hover:bg-danger hover:text-white transition-all duration-300 text-sm">
                                <i data-lucide="trash-2" class="icon"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            lucide.createIcons();
        }, 1000);
    },
    
    // Handle CSV import
    async handleImportCSV(e) {
        const fileInput = document.getElementById('csv-file');
        if (fileInput.files.length > 0) {
            uiService.showAlert('Data siswa berhasil diimport!', 'success');
            fileInput.value = '';
        } else {
            uiService.showAlert('Pilih file CSV terlebih dahulu', 'error');
        }
    },
    
    // Download template
    downloadTemplate() {
        utils.downloadCSVTemplate();
    },
    
    // Show add subject modal
    showAddSubjectModal() {
        uiService.showAlert('Fitur tambah mata pelajaran akan segera tersedia', 'warning');
    },
    
    // Load statistics
    async loadStats() {
        try {
            const stats = await supabaseService.getStats();
            
            document.getElementById('total-users').textContent = stats.users;
            document.getElementById('total-assignments').textContent = stats.assignments;
            document.getElementById('total-submissions').textContent = stats.submissions;
            document.getElementById('active-courses').textContent = stats.subjects;
        } catch (error) {
            console.error('Load stats error:', error);
        }
    }
};