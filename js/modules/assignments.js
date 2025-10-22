// Assignments Module
class AssignmentsModule {
    constructor() {
        this.supabase = window.supabase;
        this.currentView = 'teacher';
        this.questions = [];
    }

    async initialize() {
        this.setupEventListeners();
        
        if (window.store.state.user) {
            this.currentView = window.store.state.user.role === 'student' ? 'student' : 'teacher';
            await this.loadAssignments();
        }
    }

    setupEventListeners() {
        // Event delegation for dynamic content
        document.addEventListener('click', (e) => {
            this.handleAssignmentsClick(e);
        });

        // Assignment type change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'assignment-type') {
                this.handleAssignmentTypeChange(e.target.value);
            }
        });
    }

    handleAssignmentsClick(e) {
        // Create assignment button
        if (e.target.closest('#create-assignment-btn')) {
            e.preventDefault();
            this.showCreateAssignmentModal();
        }

        // Refresh assignments
        if (e.target.closest('#refresh-teacher-assignments-btn') || 
            e.target.closest('#refresh-assignments-btn')) {
            e.preventDefault();
            this.loadAssignments();
        }

        // Add question button
        if (e.target.closest('#add-question-btn')) {
            e.preventDefault();
            this.addNewQuestion();
        }

        // Delete question
        if (e.target.closest('.delete-question')) {
            e.preventDefault();
            const button = e.target.closest('.delete-question');
            const questionId = button.dataset.questionId;
            this.deleteQuestion(questionId);
        }

        // Add option
        if (e.target.closest('.add-option-btn')) {
            e.preventDefault();
            const button = e.target.closest('.add-option-btn');
            const questionId = button.dataset.questionId;
            this.addOptionToQuestion(questionId);
        }

        // Delete assignment
        if (e.target.closest('.delete-assignment')) {
            e.preventDefault();
            const button = e.target.closest('.delete-assignment');
            const assignmentId = button.dataset.assignmentId;
            this.deleteAssignment(assignmentId);
        }
    }

    async loadAssignments() {
        const user = window.store.state.user;
        if (!user) return;

        try {
            window.tugasmuApp.showLoading('Memuat tugas...');

            let assignments = [];
            
            if (user.role === 'teacher') {
                const { data, error } = await this.supabase
                    .from('assignments')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                assignments = data || [];
            } else if (user.role === 'student') {
                // For students, load all assignments (in real app, filter by class)
                const { data, error } = await this.supabase
                    .from('assignments')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                assignments = data || [];
            }

            // Update store
            window.store.setAssignments(assignments);

            // Render assignments
            this.renderAssignments(assignments);

            window.tugasmuApp.hideLoading();

        } catch (error) {
            console.error('Failed to load assignments:', error);
            window.tugasmuApp.showAlert('Gagal memuat daftar tugas', 'error');
            window.tugasmuApp.hideLoading();
        }
    }

    renderAssignments(assignments) {
        const user = window.store.state.user;
        
        if (user.role === 'teacher') {
            this.renderTeacherAssignments(assignments);
        } else if (user.role === 'student') {
            this.renderStudentAssignments(assignments);
        }
    }

    renderTeacherAssignments(assignments) {
        const container = document.getElementById('teacher-assignments-list');
        if (!container) return;

        if (assignments.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('teacher');
            return;
        }

        container.innerHTML = assignments.map(assignment => `
            <div class="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 border-l-4 border-primary mb-4">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-dark">${assignment.subject} - ${assignment.title}</h3>
                    <div class="flex gap-2">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold capitalize">
                            ${assignment.assignment_type}
                        </span>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            ${this.formatDate(assignment.deadline)}
                        </span>
                    </div>
                </div>
                <p class="text-gray-600 mb-4">${assignment.description}</p>
                <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span class="flex items-center gap-1">
                        <i data-lucide="calendar" class="icon"></i> 
                        Batas: ${this.formatDateTime(assignment.deadline)}
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="award" class="icon"></i>
                        Nilai Maks: ${assignment.max_score}
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="users" class="icon"></i>
                        Dibuat: ${assignment.created_by}
                    </span>
                </div>
                <div class="flex gap-3 flex-wrap">
                    <button class="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 text-sm flex items-center gap-2">
                        <i data-lucide="eye" class="icon"></i>
                        Lihat Pengumpulan
                    </button>
                    <button class="border-2 border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 text-sm flex items-center gap-2">
                        <i data-lucide="edit" class="icon"></i>
                        Edit
                    </button>
                    <button class="delete-assignment border-2 border-danger text-danger px-4 py-2 rounded-lg font-semibold hover:bg-danger hover:text-white transition-all duration-300 text-sm flex items-center gap-2" data-assignment-id="${assignment.id}">
                        <i data-lucide="trash-2" class="icon"></i>
                        Hapus
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    renderStudentAssignments(assignments) {
        const container = document.getElementById('student-assignments-list');
        if (!container) return;

        if (assignments.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('student');
            return;
        }

        container.innerHTML = assignments.map(assignment => `
            <div class="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 border-l-4 border-primary mb-4">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-dark">${assignment.subject} - ${assignment.title}</h3>
                    <div class="flex gap-2">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold capitalize">
                            ${assignment.assignment_type}
                        </span>
                        <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Belum Dikumpulkan
                        </span>
                    </div>
                </div>
                <p class="text-gray-600 mb-4">${assignment.description}</p>
                <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span class="flex items-center gap-1">
                        <i data-lucide="calendar" class="icon"></i> 
                        Batas: ${this.formatDateTime(assignment.deadline)}
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="award" class="icon"></i>
                        Nilai Maks: ${assignment.max_score}
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="user" class="icon"></i>
                        Guru: ${assignment.created_by}
                    </span>
                </div>
                <div class="flex gap-3 flex-wrap">
                    <button class="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 text-sm flex items-center gap-2">
                        <i data-lucide="eye" class="icon"></i>
                        Lihat Detail
                    </button>
                    <button class="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 text-sm flex items-center gap-2">
                        <i data-lucide="send" class="icon"></i>
                        Kumpulkan Tugas
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    getEmptyStateHTML(role) {
        if (role === 'teacher') {
            return `
                <div class="bg-white rounded-xl p-8 text-center shadow-lg border">
                    <i data-lucide="clipboard-list" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-600 mb-4">Belum ada tugas yang dibuat</p>
                    <button id="create-first-assignment" class="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300">
                        Buat Tugas Pertama
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="bg-white rounded-xl p-8 text-center shadow-lg border">
                    <i data-lucide="clipboard-check" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-600 mb-4">Tidak ada tugas yang perlu dikerjakan</p>
                    <p class="text-sm text-gray-500">Semua tugas telah selesai atau belum ada tugas yang diberikan</p>
                </div>
            `;
        }
    }

    showCreateAssignmentModal() {
        window.tugasmuApp.showModal('create-assignment-modal');
        this.questions = []; // Reset questions
    }

    async handleCreateAssignment(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const assignmentData = {
            title: formData.get('assignment-title'),
            description: formData.get('assignment-description'),
            deadline: formData.get('assignment-deadline'),
            subject: formData.get('assignment-subject'),
            max_score: parseInt(formData.get('assignment-max-score')),
            assignment_type: formData.get('assignment-type'),
            created_by: window.store.state.user.id
        };

        try {
            window.tugasmuApp.showLoading('Menyimpan tugas...');

            // Insert assignment
            const { data: assignment, error } = await this.supabase
                .from('assignments')
                .insert([assignmentData])
                .select()
                .single();

            if (error) throw error;

            // Save questions if multiple choice
            if (assignmentData.assignment_type === 'multiple_choice' && this.questions.length > 0) {
                await this.saveQuestions(assignment.id, this.questions);
            }

            // Success
            window.tugasmuApp.hideModal('create-assignment-modal');
            form.reset();
            this.questions = [];
            
            // Reload assignments
            await this.loadAssignments();
            
            window.tugasmuApp.showAlert('Tugas berhasil dibuat!', 'success');
            window.tugasmuApp.hideLoading();

        } catch (error) {
            console.error('Failed to create assignment:', error);
            window.tugasmuApp.showAlert('Gagal membuat tugas: ' + error.message, 'error');
            window.tugasmuApp.hideLoading();
        }
    }

    handleAssignmentTypeChange(type) {
        const mcSection = document.getElementById('multiple-choice-section');
        const questionsContainer = document.getElementById('questions-container');
        
        if (type === 'multiple_choice') {
            mcSection.classList.remove('hidden');
            if (this.questions.length === 0) {
                this.addNewQuestion();
            }
        } else {
            mcSection.classList.add('hidden');
            questionsContainer.innerHTML = '';
            this.questions = [];
        }
    }

    addNewQuestion() {
        const questionId = Date.now();
        const questionsContainer = document.getElementById('questions-container');
        
        const questionHTML = `
            <div class="bg-gray-50 rounded-xl p-4 mb-4 border" data-question-id="${questionId}">
                <div class="flex justify-between items-center mb-3">
                    <h5 class="font-semibold text-dark">Soal ${this.questions.length + 1}</h5>
                    <button type="button" class="delete-question text-red-500 hover:text-red-700" data-question-id="${questionId}">
                        <i data-lucide="trash-2" class="icon"></i>
                    </button>
                </div>
                
                <div class="mb-3">
                    <label class="block text-sm font-medium text-dark mb-2">Pertanyaan</label>
                    <textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary question-text" 
                              placeholder="Tulis pertanyaan di sini..." rows="2"></textarea>
                </div>
                
                <div class="mb-3">
                    <label class="block text-sm font-medium text-dark mb-2">Pilihan Jawaban</label>
                    <div class="space-y-2 options-container">
                        <div class="flex items-center gap-2 option-item">
                            <input type="radio" name="correct_${questionId}" value="A" class="correct-option">
                            <input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary option-text" 
                                   placeholder="Pilihan A" data-option="A">
                        </div>
                        <div class="flex items-center gap-2 option-item">
                            <input type="radio" name="correct_${questionId}" value="B" class="correct-option">
                            <input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary option-text" 
                                   placeholder="Pilihan B" data-option="B">
                        </div>
                    </div>
                    <button type="button" class="add-option-btn text-primary hover:text-primary-dark text-sm flex items-center gap-1 mt-2" data-question-id="${questionId}">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        Tambah Pilihan
                    </button>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-dark mb-2">Nilai Maksimal</label>
                    <input type="number" class="question-score w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                           value="1" min="1">
                </div>
            </div>
        `;
        
        questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
        this.questions.push({ id: questionId, options: {} });
        
        lucide.createIcons();
    }

    deleteQuestion(questionId) {
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        questionElement.remove();
        
        this.questions = this.questions.filter(q => q.id !== questionId);
        this.renumberQuestions();
    }

    renumberQuestions() {
        const questions = document.querySelectorAll('[data-question-id]');
        questions.forEach((question, index) => {
            const title = question.querySelector('h5');
            if (title) title.textContent = `Soal ${index + 1}`;
        });
    }

    addOptionToQuestion(questionId) {
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        const optionsContainer = questionElement.querySelector('.options-container');
        
        const options = optionsContainer.querySelectorAll('.option-item');
        const nextOption = String.fromCharCode(65 + options.length);
        
        const optionHTML = `
            <div class="flex items-center gap-2 option-item">
                <input type="radio" name="correct_${questionId}" value="${nextOption}" class="correct-option">
                <input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary option-text" 
                       placeholder="Pilihan ${nextOption}" data-option="${nextOption}">
            </div>
        `;
        
        optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
    }

    async saveQuestions(assignmentId, questionsData) {
        const questions = [];
        
        questionsData.forEach(questionData => {
            const questionElement = document.querySelector(`[data-question-id="${questionData.id}"]`);
            if (!questionElement) return;
            
            const questionText = questionElement.querySelector('.question-text').value;
            const questionScore = questionElement.querySelector('.question-score').value;
            const correctAnswer = questionElement.querySelector('.correct-option:checked')?.value;
            const options = {};
            
            // Collect options
            questionElement.querySelectorAll('.option-item').forEach(optionItem => {
                const optionKey = optionItem.querySelector('.option-text').dataset.option;
                const optionValue = optionItem.querySelector('.option-text').value;
                if (optionValue) {
                    options[optionKey] = optionValue;
                }
            });
            
            if (questionText && correctAnswer && Object.keys(options).length >= 2) {
                questions.push({
                    assignment_id: assignmentId,
                    question_text: questionText,
                    question_type: 'multiple_choice',
                    options: options,
                    correct_answer: correctAnswer,
                    max_score: parseInt(questionScore)
                });
            }
        });
        
        if (questions.length > 0) {
            const { error } = await this.supabase
                .from('assignment_questions')
                .insert(questions);
                
            if (error) throw error;
        }
    }

    async deleteAssignment(assignmentId) {
        if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
        
        try {
            const { error } = await this.supabase
                .from('assignments')
                .delete()
                .eq('id', assignmentId);

            if (error) throw error;

            window.tugasmuApp.showAlert('Tugas berhasil dihapus!', 'success');
            await this.loadAssignments();

        } catch (error) {
            console.error('Failed to delete assignment:', error);
            window.tugasmuApp.showAlert('Gagal menghapus tugas', 'error');
        }
    }

    // Utility methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID');
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize assignments module
window.assignmentsModule = new AssignmentsModule();