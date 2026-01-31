const config = {
    // API Configuration
    // In browser, relative path works for both localhost:3000 and production origin
    // API Configuration
    // Pointing to Production as requested by User
    API_URL: 'https://fd-dashboard-web.onrender.com/api',

    // Game Constants
    SALARY_CAP: 60000,

    // Defaults
    DEFAULT_YEAR: 2025,
    DEFAULT_WEEK: 16,

    // Helper Methods
    getApiUrl() {
        return this.API_URL;
    },

    getSalaryCap() {
        return this.SALARY_CAP;
    }
};

export default config;
