// Validation Utilities
class Validators {
    constructor() {
        this.rules = {
            required: (value) => ({
                isValid: value !== undefined && value !== null && value !== '',
                message: 'Field ini wajib diisi'
            }),

            email: (value) => ({
                isValid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: 'Format email tidak valid'
            }),

            minLength: (min) => (value) => ({
                isValid: !value || value.length >= min,
                message: `Minimal ${min} karakter`
            }),

            maxLength: (max) => (value) => ({
                isValid: !value || value.length <= max,
                message: `Maksimal ${max} karakter`
            }),

            numeric: (value) => ({
                isValid: !value || !isNaN(Number(value)),
                message: 'Harus berupa angka'
            }),

            integer: (value) => ({
                isValid: !value || Number.isInteger(Number(value)),
                message: 'Harus berupa bilangan bulat'
            }),

            minValue: (min) => (value) => ({
                isValid: !value || Number(value) >= min,
                message: `Nilai minimal ${min}`
            }),

            maxValue: (max) => (value) => ({
                isValid: !value || Number(value) <= max,
                message: `Nilai maksimal ${max}`
            }),

            password: (value) => ({
                isValid: !value || value.length >= 6,
                message: 'Password minimal 6 karakter'
            }),

            phone: (value) => ({
                isValid: !value || /^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(value),
                message: 'Format nomor telepon tidak valid'
            }),

            nis: (value) => ({
                isValid: !value || /^\d{6,10}$/.test(value),
                message: 'NIS harus 6-10 digit angka'
            }),

            url: (value) => ({
                isValid: !value || /^https?:\/\/.+\..+/.test(value),
                message: 'Format URL tidak valid'
            }),

            date: (value) => ({
                isValid: !value || !isNaN(Date.parse(value)),
                message: 'Format tanggal tidak valid'
            }),

            futureDate: (value) => ({
                isValid: !value || new Date(value) > new Date(),
                message: 'Tanggal harus di masa depan'
            }),

            pastDate: (value) => ({
                isValid: !value || new Date(value) < new Date(),
                message: 'Tanggal harus di masa lalu'
            })
        };
    }

    validate(value, ruleNames, ruleParams = {}) {
        const errors = [];

        for (const ruleName of ruleNames) {
            let rule = this.rules[ruleName];
            
            if (ruleParams[ruleName] !== undefined) {
                rule = rule(ruleParams[ruleName]);
            }

            if (rule && !rule(value).isValid) {
                errors.push(rule(value).message);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateForm(formData, validationSchema) {
        const errors = {};
        let isValid = true;

        for (const [field, rules] of Object.entries(validationSchema)) {
            const value = formData[field];
            const fieldErrors = [];

            for (const rule of rules) {
                let ruleName, ruleParam;
                
                if (typeof rule === 'string') {
                    ruleName = rule;
                } else if (Array.isArray(rule)) {
                    [ruleName, ruleParam] = rule;
                }

                const ruleFunction = ruleParam ? 
                    this.rules[ruleName](ruleParam) : 
                    this.rules[ruleName];

                if (ruleFunction && !ruleFunction(value).isValid) {
                    fieldErrors.push(ruleFunction(value).message);
                }
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }

        return {
            isValid,
            errors
        };
    }

    // Specific validators for our app
    validateUserData(userData) {
        return this.validateForm(userData, {
            name: [['required'], ['minLength', 2]],
            user_id: [['required'], ['minLength', 3]],
            password: [['required'], ['password']],
            role: [['required']],
            email: [['email']]
        });
    }

    validateAssignmentData(assignmentData) {
        return this.validateForm(assignmentData, {
            title: [['required'], ['minLength', 5]],
            description: [['required'], ['minLength', 10]],
            deadline: [['required'], ['futureDate']],
            subject: [['required']],
            max_score: [['required'], ['numeric'], ['minValue', 1], ['maxValue', 100]],
            assignment_type: [['required']]
        });
    }

    validateQuestionData(questionData) {
        return this.validateForm(questionData, {
            question_text: [['required'], ['minLength', 5]],
            correct_answer: [['required']],
            max_score: [['required'], ['numeric'], ['minValue', 1]]
        });
    }

    // Real-time validation for form fields
    setupRealTimeValidation(form, validationSchema) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateFieldInRealTime(input, validationSchema);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateFieldInRealTime(input, validationSchema) {
        const fieldName = input.name || input.id;
        const rules = validationSchema[fieldName];
        
        if (!rules) return;

        const value = input.value;
        const validation = this.validate(value, rules.map(rule => 
            Array.isArray(rule) ? rule[0] : rule
        ));

        if (!validation.isValid) {
            this.showFieldError(input, validation.errors[0]);
        } else {
            this.clearFieldError(input);
        }
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        
        input.classList.add('border-red-500', 'focus:ring-red-500');
        input.classList.remove('border-gray-300', 'focus:ring-primary');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-xs mt-1 flex items-center gap-1';
        errorDiv.innerHTML = `<i data-lucide="alert-circle" class="w-3 h-3"></i> ${message}`;
        
        input.parentNode.appendChild(errorDiv);
        lucide.createIcons();
    }

    clearFieldError(input) {
        input.classList.remove('border-red-500', 'focus:ring-red-500');
        input.classList.add('border-gray-300', 'focus:ring-primary');

        const errorDiv = input.parentNode.querySelector('.text-red-500');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Bulk validation
    validateBulkData(data, validator) {
        const results = {
            valid: [],
            invalid: []
        };

        data.forEach((item, index) => {
            const validation = validator(item);
            
            if (validation.isValid) {
                results.valid.push(item);
            } else {
                results.invalid.push({
                    data: item,
                    errors: validation.errors,
                    index: index
                });
            }
        });

        return results;
    }

    // Custom validator creator
    createCustomValidator(name, validateFunction, errorMessage) {
        this.rules[name] = (value) => ({
            isValid: validateFunction(value),
            message: errorMessage
        });
    }

    // Remove validator
    removeValidator(name) {
        delete this.rules[name];
    }

    // Get all available validators
    getAvailableValidators() {
        return Object.keys(this.rules);
    }
}

// Initialize validators
window.validators = new Validators();