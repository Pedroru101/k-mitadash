// Monthly Report Script - K-mita Analytics
// Versión simplificada basada en el script principal

// Validar que CONFIG esté disponible
if (typeof CONFIG === 'undefined') {
    console.error('[ERROR] CONFIG no está definido. Asegúrate de que config.js se cargue antes de este script.');
    throw new Error('CONFIG no definido. Verifica la carga de config.js');
}

// Usar configuración centralizada de K-mita
const GOOGLE_SHEETS_CONFIG = CONFIG.GOOGLE_SHEETS;
const APP_CONFIG = CONFIG.APP;
const DATA_CONFIG = CONFIG.DATA;

// Credenciales K-mita desde configuración centralizada
const validCredentials = {
    [CONFIG.AUTH.USERNAME]: CONFIG.AUTH.PASSWORD
};

// Estado de autenticación y variables globales
let isAuthenticated = false;
let ordersData = [];
let customersData = [];
let isDataLoaded = false;

// ===========================================
// FUNCIONES DE AUTENTICACIÓN
// ===========================================

// Función para manejar el login
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    // Limpiar errores previos
    if (errorElement) errorElement.style.display = 'none';

    // Validar que hay credenciales
    if (!username || !password) {
        if (errorElement) {
            errorElement.textContent = '❌ Por favor ingresa usuario y contraseña';
            errorElement.style.display = 'block';
        }
        return;
    }

    // Validar credenciales
    const isValid = validCredentials[username] && validCredentials[username] === password;

    if (isValid) {
        isAuthenticated = true;
        sessionStorage.setItem('kmita_authenticated', 'true');
        sessionStorage.setItem('kmita_username', username);

        // Ocultar pantalla de login
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) loginScreen.style.display = 'none';

        // Mostrar dashboard
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (dashboardContainer) dashboardContainer.style.display = 'block';

        // Cargar datos después del login
        setTimeout(() => {
            loadMonthlyReportData();
        }, 500);

    } else {
        if (errorElement) {
            errorElement.textContent = '❌ Usuario o contraseña incorrectos';
            errorElement.style.display = 'block';
        }
        document.getElementById('password').value = '';
    }
}

// Función para cerrar sesión
function handleLogout() {
    isAuthenticated = false;
    sessionStorage.removeItem('kmita_authenticated');
    sessionStorage.removeItem('kmita_username');

    // Mostrar pantalla de login
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.style.display = 'flex';

    // Ocultar dashboard
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) dashboardContainer.style.display = 'none';

    // Limpiar formulario
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
    const loginError = document.getElementById('loginError');
    if (loginError) loginError.style.display = 'none';

    ordersData = [];
    customersData = [];
    isDataLoaded = false;
}

// ===========================================
// FUNCIONES DE CARGA DE DATOS
// ===========================================

// Función para actualizar el estado de la fuente de datos
function updateDataSourceStatus(message) {
    const statusElement = document.getElementById('dataSourceStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Función para cargar datos del informe mensual
async function loadMonthlyReportData() {
    updateDataSourceStatus('🔄 Cargando datos del informe mensual...');

    try {
        // Cargar datos de las dos hojas principales
        const ordersURL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(GOOGLE_SHEETS_CONFIG.ORDERS_SHEET)}`;
        const customersURL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(GOOGLE_SHEETS_CONFIG.CUSTOMERS_SHEET)}`;

        const [ordersResponse, customersResponse] = await Promise.all([
            fetch(ordersURL),
            fetch(customersURL)
        ]);

        if (!ordersResponse.ok || !customersResponse.ok) {
            throw new Error('Error cargando datos');
        }

        const ordersCSV = await ordersResponse.text();
        const customersCSV = await customersResponse.text();

        ordersData = parseCSV(ordersCSV);
        customersData = parseCSV(customersCSV);

        isDataLoaded = true;
        updateDataSourceStatus(`✅ Datos cargados: ${ordersData.length} órdenes, ${customersData.length} clientes`);

        // Mostrar mensaje del informe
        displayMonthlyReportMessage();

    } catch (error) {
        console.error('Error cargando datos:', error);
        updateDataSourceStatus('❌ Error cargando datos');
    }
}

// Función para parsear CSV
function parseCSV(csvText) {
    if (!csvText || csvText.trim() === '') return [];

    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        if (values.length > 0 && values.some(v => v !== '')) {
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index] || '';
            });
            data.push(rowData);
        }
    }

    return data;
}

// ===========================================
// FUNCIONES DEL INFORME MENSUAL
// ===========================================

// Mostrar el mensaje del informe mensual
function displayMonthlyReportMessage() {
    const reportContent = document.querySelector('.report-content');
    if (!reportContent) return;

    // El mensaje ya está en el HTML, solo aseguramos que esté visible
    console.log('Mensaje del informe mensual mostrado');
}

// Función para generar el informe mensual
function generateMonthlyReport() {
    if (!isDataLoaded) {
        alert('Los datos aún no están cargados. Por favor espera.');
        return;
    }

    // Filtrar datos del año 2025
    const year2025Orders = ordersData.filter(order => {
        const date = new Date(order.created_at);
        return !isNaN(date.getTime()) && date.getFullYear() === 2025;
    });

    if (year2025Orders.length === 0) {
        alert('No hay datos disponibles para el año 2025.');
        return;
    }

    // Procesar datos por mes, destino y presentación
    const monthlyReport = processMonthlyReportData(year2025Orders);

    // Mostrar el informe
    displayMonthlyReport(monthlyReport);
}

// Procesar datos del informe mensual
function processMonthlyReportData(orders) {
    const report = {};

    orders.forEach(order => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const destination = order.shipping_province || 'No especificado';
        const presentation = order.total_kilos ? `${order.total_kilos}kg` : 'No especificado';

        if (!report[monthKey]) {
            report[monthKey] = {};
        }

        if (!report[monthKey][destination]) {
            report[monthKey][destination] = {};
        }

        if (!report[monthKey][destination][presentation]) {
            report[monthKey][destination][presentation] = {
                kilos: 0,
                bags: 0,
                orders: 0,
                revenue: 0
            };
        }

        const entry = report[monthKey][destination][presentation];
        entry.kilos += parseFloat(order.total_kilos || 0);
        entry.bags += parseFloat(order.total_bags || 0);
        entry.orders += 1;
        entry.revenue += parseFloat(order.total_price || 0);
    });

    return report;
}

// Mostrar el informe mensual
function displayMonthlyReport(report) {
    const previewSection = document.querySelector('.report-preview');
    if (!previewSection) return;

    let html = '<div class="monthly-report-table">';

    // Totales anuales
    const annualTotals = calculateAnnualTotals(report);
    html += generateAnnualTotalsTable(annualTotals);

    // Datos mensuales
    html += '<h3>📅 Datos Mensuales Detallados</h3>';
    html += generateMonthlyDetailsTable(report);

    html += '</div>';

    previewSection.innerHTML = html;
}

// Calcular totales anuales
function calculateAnnualTotals(report) {
    const totals = {};

    Object.values(report).forEach(monthData => {
        Object.entries(monthData).forEach(([destination, presentations]) => {
            if (!totals[destination]) {
                totals[destination] = {};
            }

            Object.entries(presentations).forEach(([presentation, data]) => {
                if (!totals[destination][presentation]) {
                    totals[destination][presentation] = {
                        kilos: 0,
                        bags: 0,
                        orders: 0,
                        revenue: 0
                    };
                }

                const total = totals[destination][presentation];
                total.kilos += data.kilos;
                total.bags += data.bags;
                total.orders += data.orders;
                total.revenue += data.revenue;
            });
        });
    });

    return totals;
}

// Generar tabla de totales anuales
function generateAnnualTotalsTable(totals) {
    let html = '<h3>📊 Totales Anuales 2025</h3>';
    html += '<table class="data-table">';
    html += '<thead><tr><th>Destino</th><th>Presentación</th><th>Kilos Totales</th><th>Bolsas Totales</th><th>Órdenes</th><th>Ingresos</th></tr></thead>';
    html += '<tbody>';

    Object.entries(totals).forEach(([destination, presentations]) => {
        Object.entries(presentations).forEach(([presentation, data]) => {
            html += `<tr>
                <td>${destination}</td>
                <td>${presentation}</td>
                <td>${data.kilos.toLocaleString()} kg</td>
                <td>${data.bags.toLocaleString()}</td>
                <td>${data.orders}</td>
                <td>$${data.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
            </tr>`;
        });
    });

    html += '</tbody></table>';
    return html;
}

// Generar tabla de detalles mensuales
function generateMonthlyDetailsTable(report) {
    let html = '<table class="data-table">';
    html += '<thead><tr><th>Mes</th><th>Destino</th><th>Presentación</th><th>Kilos</th><th>Bolsas</th><th>Órdenes</th><th>Ingresos</th></tr></thead>';
    html += '<tbody>';

    Object.entries(report).sort().forEach(([month, destinations]) => {
        Object.entries(destinations).forEach(([destination, presentations]) => {
            Object.entries(presentations).forEach(([presentation, data]) => {
                html += `<tr>
                    <td>${month}</td>
                    <td>${destination}</td>
                    <td>${presentation}</td>
                    <td>${data.kilos.toLocaleString()} kg</td>
                    <td>${data.bags.toLocaleString()}</td>
                    <td>${data.orders}</td>
                    <td>$${data.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>`;
            });
        });
    });

    html += '</tbody></table>';
    return html;
}

// Función para exportar datos
function exportMonthlyReport() {
    if (!isDataLoaded) {
        alert('Los datos aún no están cargados. Por favor espera.');
        return;
    }

    // Crear contenido CSV
    let csv = 'Mes,Destino,Presentación,Kilos,Bolsas,Órdenes,Ingresos\n';

    const year2025Orders = ordersData.filter(order => {
        const date = new Date(order.created_at);
        return !isNaN(date.getTime()) && date.getFullYear() === 2025;
    });

    const report = processMonthlyReportData(year2025Orders);

    Object.entries(report).sort().forEach(([month, destinations]) => {
        Object.entries(destinations).forEach(([destination, presentations]) => {
            Object.entries(presentations).forEach(([presentation, data]) => {
                csv += `${month},"${destination}","${presentation}",${data.kilos},${data.bags},${data.orders},${data.revenue}\n`;
            });
        });
    });

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'informe_mensual_2025.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===========================================
// INICIALIZACIÓN
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación persistida
    if (sessionStorage.getItem('kmita_authenticated') === 'true') {
        isAuthenticated = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
        loadMonthlyReportData();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboardContainer').style.display = 'none';
    }

    // Configurar event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const backBtn = document.getElementById('backToDashboard');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateMonthlyReport);
    }

    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportMonthlyReport);
    }
});

console.log('✅ Monthly Report Script cargado correctamente');