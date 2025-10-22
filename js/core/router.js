// Client-side Router
class Router {
    constructor() {
        this.routes = {
            'home': {
                title: 'Beranda - Tugasmu',
                auth: false
            },
            'assignments': {
                title: 'Tugas - Tugasmu',
                auth: true
            },
            'admin': {
                title: 'Admin - Tugasmu',
                auth: true,
                role: 'admin'
            }
        };
        
        this.init();
    }

    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            this.handleRouteChange();
        });

        // Handle initial route
        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1) || 'home';
        this.navigate(hash, false);
    }

    async navigate(route, pushState = true) {
        const routeConfig = this.routes[route] || this.routes['home'];
        
        // Check authentication
        const authCheck = window.authModule.requireAuth(routeConfig.role);
        if (!authCheck.allowed && routeConfig.auth) {
            if (authCheck.reason === 'not_logged_in') {
                window.tugasmuApp.showModal('auth-modal');
                return;
            } else {
                window.tugasmuApp.showAlert('Anda tidak memiliki akses ke halaman ini', 'error');
                this.navigate('home');
                return;
            }
        }

        // Update browser history
        if (pushState) {
            history.pushState({ route }, '', `#${route}`);
        }

        // Update page title
        document.title = routeConfig.title;

        // Load page content
        await window.tugasmuApp.loadPage(route);
    }

    getCurrentRoute() {
        return window.location.hash.substring(1) || 'home';
    }

    addRoute(route, config) {
        this.routes[route] = config;
    }
}

// Initialize router
window.router = new Router();