// Configuración centralizada para K-mita Analytics Dashboard
// Este archivo maneja todas las configuraciones y credenciales

const CONFIG = {
    // Credenciales de autenticación
    AUTH: {
        USERNAME: '__DASHBOARD_USERNAME__',
        PASSWORD: '__DASHBOARD_PASSWORD__'
    },

    // Configuración de Google Sheets (CSV público - no requiere API key)
    GOOGLE_SHEETS: {
        SHEET_ID: '1BrEpAFNBYeW-N36_nvlyVivWsrkirTGpTuHy7AnCMi0',
        // Nota: Se usa CSV export público, no API key
        ORDERS_SHEET: 'Monthly_Analysis - Orders_Data',
        CUSTOMERS_SHEET: 'Monthly_Analysis - Customers_Data'
    },

    // Configuración de la aplicación
    APP: {
        NAME: 'K-mita Analytics Dashboard',
        VERSION: '1.0.0',
        ENVIRONMENT: 'production',
        CURRENCY: 'MXN',
        LOCALE: 'es-MX',
        TIMEZONE: 'America/Mexico_City'
    },

    // Configuración de actualización de datos
    DATA: {
        REFRESH_INTERVAL: 300000, // 5 minutos
        AUTO_REFRESH_ENABLED: true,
        MAX_RETRIES: 3,
        TIMEOUT: 30000 // 30 segundos
    },

    // URLs y endpoints
    URLS: {
        GOOGLE_SHEETS_API_BASE: 'https://docs.google.com/spreadsheets/d',
        BACKUP_DATA_URL: 'sample-data.json'
    },

    // Configuración de gráficos
    CHARTS: {
        DEFAULT_COLORS: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ],
        ANIMATION_DURATION: 750,
        RESPONSIVE: true
    },

    // Configuración de métricas K-mita específicas
    KMITA: {
        PRODUCT_TYPES: [
            'Arena Biodegradable 3kg',
            'Arena Biodegradable 6kg', 
            'Arena Biodegradable 10kg',
            'Arena Biodegradable 20kg',
            'Arena Biodegradable 30kg',
            'Arena Biodegradable 60kg',
            'Arena Biodegradable 120kg'
        ],
        CUSTOMER_SEGMENTS: [
            'New', 'One-time', 'Repeat', 'Loyal', 'VIP', 'At-Risk'
        ],
        MAIN_STATES: [
            'Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 
            'Veracruz', 'Guanajuato', 'Chihuahua', 'Baja California'
        ]
    }
};

// Función para construir URL de Google Sheets CSV export público (sin autenticación)
function buildGoogleSheetsURL(sheetName) {
    const url = `${CONFIG.URLS.GOOGLE_SHEETS_API_BASE}/${CONFIG.GOOGLE_SHEETS.SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;
    console.log(`[CONFIG] URL CSV público generada para ${sheetName}: ${url}`);
    return url;
}

// Función para obtener configuración formateada de moneda
function getCurrencyFormat() {
    return {
        style: 'currency',
        currency: CONFIG.APP.CURRENCY,
        minimumFractionDigits: 2
    };
}

// Función para formatear números según la configuración
function formatNumber(number, options = {}) {
    const defaultOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    };
    
    return number.toLocaleString(CONFIG.APP.LOCALE, { ...defaultOptions, ...options });
}

// Función para formatear moneda
function formatCurrency(amount) {
    return amount.toLocaleString(CONFIG.APP.LOCALE, getCurrencyFormat());
}

// Función para validar credenciales
function validateCredentials(username, password) {
    return CONFIG.AUTH.USERNAME === username && CONFIG.AUTH.PASSWORD === password;
}

// Exportar configuración para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
    window.buildGoogleSheetsURL = buildGoogleSheetsURL;
    window.getCurrencyFormat = getCurrencyFormat;
    window.formatNumber = formatNumber;
    window.formatCurrency = formatCurrency;
    window.validateCredentials = validateCredentials;
}