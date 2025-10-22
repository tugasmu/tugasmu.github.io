// Simple State Management
class Store {
    constructor() {
        this.state = {
            user: null,
            assignments: [],
            users: [],
            subjects: [],
            currentPage: 'home',
            loading: false,
            notifications: []
        };
        
        this.subscribers = [];
        this.init();
    }

    init() {
        // Load initial state from localStorage
        this.loadState();
        
        // Auto-save state to localStorage on changes
        this.subscribe((state) => {
            this.saveState(state);
        });
    }

    getState() {
        return { ...this.state };
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifySubscribers();
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.state));
    }

    // Specific state updaters
    setUser(user) {
        this.setState({ user });
    }

    setAssignments(assignments) {
        this.setState({ assignments });
    }

    setUsers(users) {
        this.setState({ users });
    }

    setLoading(loading) {
        this.setState({ loading });
    }

    addNotification(notification) {
        const notifications = [...this.state.notifications, {
            id: Date.now(),
            ...notification
        }];
        this.setState({ notifications });
    }

    removeNotification(id) {
        const notifications = this.state.notifications.filter(n => n.id !== id);
        this.setState({ notifications });
    }

    // Persistence
    saveState(state) {
        try {
            const persistableState = {
                user: state.user,
                currentPage: state.currentPage
            };
            localStorage.setItem('tugasmu_state', JSON.stringify(persistableState));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('tugasmu_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.setState(state);
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    // Selectors
    getAssignmentsByTeacher(teacherId) {
        return this.state.assignments.filter(assignment => 
            assignment.created_by === teacherId
        );
    }

    getUserById(userId) {
        return this.state.users.find(user => user.user_id === userId);
    }

    getActiveAssignments() {
        const now = new Date();
        return this.state.assignments.filter(assignment => 
            new Date(assignment.deadline) > now
        );
    }
}

// Initialize store
window.store = new Store();