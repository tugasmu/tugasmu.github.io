// API Utilities Module
class APIModule {
    constructor() {
        this.supabase = window.supabase;
        this.baseURL = SUPABASE_URL;
        this.apiKey = SUPABASE_ANON_KEY;
    }

    // Generic API call method
    async callAPI(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}`
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    // Supabase specific methods
    async supabaseQuery(table, query = '*', filters = {}, orderBy = 'created_at', ascending = false) {
        try {
            let queryBuilder = this.supabase
                .from(table)
                .select(query);

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryBuilder = queryBuilder.eq(key, value);
                }
            });

            // Apply ordering
            if (orderBy) {
                queryBuilder = queryBuilder.order(orderBy, { ascending });
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error(`Supabase query failed for table ${table}:`, error);
            throw error;
        }
    }

    async supabaseInsert(table, data) {
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .insert(data)
                .select();

            if (error) throw error;
            return result;

        } catch (error) {
            console.error(`Supabase insert failed for table ${table}:`, error);
            throw error;
        }
    }

    async supabaseUpdate(table, data, match) {
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .update(data)
                .match(match)
                .select();

            if (error) throw error;
            return result;

        } catch (error) {
            console.error(`Supabase update failed for table ${table}:`, error);
            throw error;
        }
    }

    async supabaseDelete(table, match) {
        try {
            const { error } = await this.supabase
                .from(table)
                .delete()
                .match(match);

            if (error) throw error;
            return { success: true };

        } catch (error) {
            console.error(`Supabase delete failed for table ${table}:`, error);
            throw error;
        }
    }

    // File upload
    async uploadFile(file, bucket = 'assignments') {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return {
                success: true,
                fileName: data.path,
                publicUrl
            };

        } catch (error) {
            console.error('File upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Batch operations
    async batchInsert(table, items, batchSize = 50) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            
            try {
                const result = await this.supabaseInsert(table, batch);
                results.push(...result);
            } catch (error) {
                console.error(`Batch insert failed at batch ${i / batchSize + 1}:`, error);
                throw error;
            }
        }
        
        return results;
    }

    // Real-time subscriptions
    subscribeToTable(table, event, callback) {
        return this.supabase
            .channel('table-changes')
            .on(
                'postgres_changes',
                {
                    event: event,
                    schema: 'public',
                    table: table
                },
                callback
            )
            .subscribe();
    }

    // Data validation
    validateData(schema, data) {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // Required check
            if (rules.required && (!value || value.toString().trim() === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // Type check
            if (rules.type && value) {
                if (rules.type === 'email' && !this.isValidEmail(value)) {
                    errors.push(`${field} must be a valid email`);
                }
                if (rules.type === 'number' && isNaN(Number(value))) {
                    errors.push(`${field} must be a number`);
                }
            }

            // Length check
            if (rules.minLength && value && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength && value && value.length > rules.maxLength) {
                errors.push(`${field} must be at most ${rules.maxLength} characters`);
            }
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

    // Error handling
    handleAPIError(error, defaultMessage = 'Terjadi kesalahan') {
        console.error('API Error:', error);

        if (error.message.includes('Network Error')) {
            return 'Koneksi internet terputus';
        }

        if (error.message.includes('JWT')) {
            return 'Sesi telah berakhir, silakan login kembali';
        }

        if (error.message.includes('row-level security')) {
            return 'Anda tidak memiliki akses untuk operasi ini';
        }

        return error.message || defaultMessage;
    }

    // Cache management
    async withCache(key, apiCall, ttl = 5 * 60 * 1000) { // 5 minutes default
        const cached = this.getCache(key);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }

        const data = await apiCall();
        this.setCache(key, data);
        return data;
    }

    setCache(key, data) {
        const cache = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cache));
    }

    getCache(key) {
        const cached = localStorage.getItem(`cache_${key}`);
        return cached ? JSON.parse(cached) : null;
    }

    clearCache(key = null) {
        if (key) {
            localStorage.removeItem(`cache_${key}`);
        } else {
            // Clear all cache
            Object.keys(localStorage)
                .filter(k => k.startsWith('cache_'))
                .forEach(k => localStorage.removeItem(k));
        }
    }
}

// Initialize API module
window.apiModule = new APIModule();