import { CONFIG } from '../../Config/Config.js';
import { supabaseService } from './Supabase.js';
import { uiService } from './Ui.js';
import { appState } from './Main.js';
import { utils } from './Utils.js';

export const assignmentService = {
    // Show assignment creation form
    showAssignmentForm() {
        document.getElementById('create-assignment-form').classList.remove('hidden');
        this.hideMultipleChoiceSection();
        document.getElementById('questions-container').innerHTML = '';
    },
    
    // Hide assignment form
    hideAssignmentForm() {
        document.getElementById('create-assignment-form').classList.add('hidden');
        this.hideMultipleChoiceSection();
        document.getElementById('assignment-form').reset();
        document.getElementById('questions-container').innerHTML = '';
    },
    
    // Handle assignment type change
    handleAssignmentTypeChange(type) {
        if (type === 'multiple_choice') {
            this.showMultipleChoiceSection();
            this.addNewQuestion(); // Add first question
        } else {
            this.hideMultipleChoiceSection();
            document.getElementById('questions-container').innerHTML = '';
        }
    },
    
    // Show multiple choice section
    showMultipleChoiceSection() {
        document.getElementById('multiple-choice-section').classList.remove('hidden');
    },
    
    // Hide multiple choice section
    hideMultipleChoiceSection() {
        document.getElementById('multiple-choice-section').classList.add('hidden');
    },
    
    // Add new question
    addNewQuestion() {
        const questionId = 'question_' + Date.now();
        
        const questionHTML = `
            <div class="bg-gray-50 rounded-xl p-4 mb-4 border" data-question-id="${questionId}">
                <div class="flex justify-between items-center mb-3">
                    <h5 class="font-semibold text-dark">Soal Baru</h5>
                    <button type="button" class="text-red-500 hover:text-red-700 delete-question" data-question-id="${questionId}">
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
        
        document.getElementById('questions-container').insertAdjacentHTML('beforeend', questionHTML);
        lucide.createIcons();
    },
    
    // Delete question
    deleteQuestion(questionElement) {
        questionElement.remove();
    },
    
    // Add option to question
    addOptionToQuestion(questionId) {
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        const optionsContainer = questionElement.querySelector('.options-container');
        
        const options = optionsContainer.querySelectorAll('.option-item');
        const nextOption = String.fromCharCode(65 + options.length); // A, B, C, D, etc.
        
        const optionHTML = `
            <div class="flex items-center gap-2 option-item">
                <input type="radio" name="correct_${questionId}" value="${nextOption}" class="correct-option">
                <input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary option-text" 
                       placeholder="Pilihan ${nextOption}" data-option="${nextOption}">
            </div>
        `;
        
        optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
    },
    
    // Handle assignment creation
    async handleCreateAssignment(e) {
        const title = document.getElementById('assignment-title').value;
        const description = document.getElementById('assignment-description').value;
        const deadline = document.getElementById('assignment-deadline').value;
        const subject = document.getElementById('assignment-subject').value;
        const maxScore = document.getElementById('assignment-max-score').value;
        const assignmentType = document.getElementById('assignment-type').value;
        
        try {
            if (!title || !description || !deadline || !subject || !maxScore) {
                throw new Error('Semua field harus diisi');
            }
            
            // Insert assignment to Supabase
            const { data: assignmentData, error: assignmentError } = await supabaseService.createAssignment({
                title: title,
                description: description,
                deadline: deadline,
                subject: subject,
                max_score: parseInt(maxScore),
                created_by: appState.currentUser.id,
                assignment_type: assignmentType
            });

            if (assignmentError) throw assignmentError;

            const assignmentId = assignmentData[0].id;
            
            // If type is multiple choice, insert questions
            if (assignmentType === 'multiple_choice') {
                await this.saveMultipleChoiceQuestions(assignmentId);
            }

            uiService.showAlert('Tugas berhasil dibuat!', 'success');
            this.hideAssignmentForm();
            this.loadTeacherAssignments();
        } catch (error) {
            console.error('Create assignment error:', error);
            uiService.showAlert('Gagal membuat tugas: ' + error.message, 'error');
        }
    },
    
    // Save multiple choice questions
    async saveMultipleChoiceQuestions(assignmentId) {
        const questions = document.querySelectorAll('[data-question-id]');
        const questionsData = [];
        
        for (const questionElement of questions) {
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
                questionsData.push({
                    assignment_id: assignmentId,
                    question_text: questionText,
                    question_type: 'multiple_choice',
                    options: options,
                    correct_answer: correctAnswer,
                    max_score: parseInt(questionScore)
                });
            }
        }
        
        if (questionsData.length > 0) {
            const { error: questionsError } = await supabaseService.createQuestions(questionsData);
            if (questionsError) throw questionsError;
        }
    },
    
    // Load student assignments
    async loadStudentAssignments() {
        const studentAssignmentsList = document.getElementById('student-assignments-list');
        uiService.showLoading(studentAssignmentsList);
        
        // Simulate loading (replace with actual API call)
        setTimeout(() => {
            studentAssignmentsList.innerHTML = `
                <div class="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 border-l-4 border-primary">
                    <h3 class="text-xl font-bold text-dark mb-3">Matematika - Persamaan Kuadrat</h3>
                    <p class="text-gray-600 mb-4">Selesaikan soal-soal persamaan kuadrat pada halaman 45-46 buku paket.</p>
                    <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <span class="flex items-center gap-1"><i data-lucide="calendar" class="icon"></i> Batas: 25 Des 2024, 23:59</span>
                        <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Belum Dikumpulkan</span>
                    </div>
                    <div class="flex gap-3 flex-wrap">
                        <button class="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 text-sm flex items-center gap-2">
                            <i data-lucide="send" class="icon"></i>
                            Kumpulkan Tugas
                        </button>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }, 1000);
    },
    
    // Load teacher assignments
    async loadTeacherAssignments() {
        const teacherAssignmentsList = document.getElementById('teacher-assignments-list');
        uiService.showLoading(teacherAssignmentsList);
        
        try {
            const { data: assignments, error } = await supabaseService.getAssignmentsByTeacher(appState.currentUser.id);

            if (error) throw error;

            if (assignments.length === 0) {
                teacherAssignmentsList.innerHTML = `
                    <div class="bg-white rounded-xl p-8 text-center shadow-lg border">
                        <i data-lucide="clipboard-list" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                        <p class="text-gray-600 mb-4">Belum ada tugas yang dibuat</p>
                        <button id="create-first-assignment" class="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300">
                            Buat Tugas Pertama
                        </button>
                    </div>
                `;
                document.getElementById('create-first-assignment').addEventListener('click', () => {
                    this.showAssignmentForm();
                });
                lucide.createIcons();
                return;
            }

            // Render assignments
            teacherAssignmentsList.innerHTML = assignments.map(assignment => `
                <div class="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 border-l-4 border-primary mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-xl font-bold text-dark">${assignment.subject} - ${assignment.title}</h3>
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold capitalize">${assignment.assignment_type}</span>
                    </div>
                    <p class="text-gray-600 mb-4">${assignment.description}</p>
                    <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <span class="flex items-center gap-1">
                            <i data-lucide="calendar" class="icon"></i> 
                            Batas: ${utils.formatDate(assignment.deadline)}
                        </span>
                        <span class="flex items-center gap-1">
                            <i data-lucide="award" class="icon"></i>
                            Nilai Maks: ${assignment.max_score}
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
                        <button class="border-2 border-danger text-danger px-4 py-2 rounded-lg font-semibold hover:bg-danger hover:text-white transition-all duration-300 text-sm flex items-center gap-2" onclick="assignmentService.deleteAssignment('${assignment.id}')">
                            <i data-lucide="trash-2" class="icon"></i>
                            Hapus
                        </button>
                    </div>
                </div>
            `).join('');
            
            lucide.createIcons();
        } catch (error) {
            console.error('Load assignments error:', error);
            uiService.showErrorState(teacherAssignmentsList, 'Gagal memuat daftar tugas');
        }
    },
    
    // Delete assignment
    async deleteAssignment(assignmentId) {
        if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
        
        try {
            const { error } = await supabaseService.deleteAssignment(assignmentId);

            if (error) throw error;

            uiService.showAlert('Tugas berhasil dihapus!', 'success');
            this.loadTeacherAssignments(); // Refresh list
        } catch (error) {
            console.error('Delete assignment error:', error);
            uiService.showAlert('Gagal menghapus tugas', 'error');
        }
    }
};