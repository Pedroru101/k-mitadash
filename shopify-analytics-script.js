// K-mita Analytics Dashboard - Script Principal Limpio
// Versión depurada sin código duplicado

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

// DEBUG: Verificar configuración de autenticación
console.log('[DEBUG CONFIG] CONFIG.AUTH:', CONFIG.AUTH);
console.log('[DEBUG CONFIG] validCredentials:', validCredentials);
console.log('[DEBUG CONFIG] validateCredentials function:', typeof validateCredentials);

// Log de inicialización
console.log('[INIT] K-mita Analytics Script inicializado correctamente');
console.log('[CONFIG] GOOGLE_SHEETS:', GOOGLE_SHEETS_CONFIG);
console.log('[CONFIG] APP:', APP_CONFIG);

// Estado de autenticación y variables globales
let isAuthenticated = false;
let ordersData = [];
let customersData = [];
let currentPeriod = 'all';
let isDataLoaded = false;
let lastDataUpdate = null;

// ===========================================
// FUNCIONES DE AUTENTICACIÓN
// ===========================================

// Función única para manejar el login con debug
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    // DEBUG: Logs detallados para depuración
    console.log('[DEBUG LOGIN] Intentando login con usuario:', username);
    console.log('[DEBUG LOGIN] CONFIG disponible:', typeof CONFIG !== 'undefined');
    console.log('[DEBUG LOGIN] validCredentials:', validCredentials);
    console.log('[DEBUG LOGIN] validateCredentials disponible:', typeof validateCredentials === 'function');
    console.log('[DEBUG LOGIN] Credenciales ingresadas - username:', username, 'password length:', password.length);

    // Limpiar errores previos
    if (errorElement) errorElement.style.display = 'none';

    // Validar que hay credenciales
    if (!username || !password) {
        if (errorElement) {
            errorElement.textContent = '❌ Por favor ingresa usuario y contraseña';
            errorElement.style.display = 'block';
        }
        console.log('[DEBUG LOGIN] Error: Campos vacíos');
        return;
    }

    // Validar credenciales usando validCredentials
    const isValid = validCredentials[username] && validCredentials[username] === password;
    console.log('[DEBUG LOGIN] Validación - isValid:', isValid, 'Expected password for', username, ':', validCredentials[username]);

    if (isValid) {
        // Login exitoso
        isAuthenticated = true;
        console.log('[DEBUG LOGIN] Login exitoso para usuario:', username);

        // Guardar en sessionStorage para persistencia
        sessionStorage.setItem('kmita_authenticated', 'true');
        sessionStorage.setItem('kmita_username', username);

        // Ocultar pantalla de login
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) loginScreen.style.display = 'none';

        // Mostrar dashboard
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (dashboardContainer) dashboardContainer.style.display = 'block';

        // Limpiar formulario
        document.getElementById('loginForm').reset();

        // Cargar datos después del login
        setTimeout(() => {
            testGoogleSheetsConnection();
        }, 500);

    } else {
        // Login fallido
        if (errorElement) {
            errorElement.textContent = '❌ Usuario o contraseña incorrectos';
            errorElement.style.display = 'block';
        }

        // Limpiar contraseña por seguridad
        document.getElementById('password').value = '';

        console.log('[DEBUG LOGIN] Login fallido para usuario:', username);
        console.log('[DEBUG LOGIN] Credenciales esperadas:', Object.keys(validCredentials));
        console.log('[DEBUG LOGIN] Contraseña coincide:', validCredentials[username] === password);
    }
}

// Función única para cerrar sesión
function handleLogout() {
    isAuthenticated = false;

    // Limpiar sessionStorage
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

    // Limpiar datos sensibles
    ordersData = [];
    customersData = [];
    isDataLoaded = false;

    console.log('[DEBUG LOGOUT] Sesión cerrada correctamente');
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

// Mostrar ayuda de conexión
function showConnectionHelp() {
    const helpHTML = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 10px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">🔧 Configuración Requerida para CSV Público:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #374151;">
                <li><strong>Hacer el documento público:</strong><br>
                      • Abre tu Google Sheets<br>
                      • Clic en "Compartir" (botón azul arriba a la derecha)<br>
                      • Selecciona "Cambiar a cualquier persona con el enlace puede ver"<br>
                      • Copia el enlace y verifica que se pueda acceder sin login
                </li>
                <li><strong>Verificar configuración:</strong><br>
                      • Asegurarse de que los nombres de las hojas coincidan exactamente<br>
                      • Verificar que SHEET_ID en config.js sea correcto<br>
                      • El dashboard usa CSV export público, NO requiere API key
                </li>
                <li><strong>Probar conexión:</strong><br>
                      • Una vez público, haz clic en "Reintentar Conexión"<br>
                      • Revisa la consola del navegador (F12) para logs detallados
                </li>
            </ol>
            <button onclick="testGoogleSheetsConnection()" style="margin-top: 10px; padding: 8px 15px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                🔄 Reintentar Conexión
            </button>
        </div>
    `;

    const container = document.querySelector('.data-source-info');
    if (container) {
        container.insertAdjacentHTML('afterend', helpHTML);
    }
}

// Función para probar la conexión a Google Sheets
async function testGoogleSheetsConnection() {
    console.log('[DEBUG] Iniciando testGoogleSheetsConnection - probando CSV público');
    updateDataSourceStatus('🔍 Probando conexión a Google Sheets...');

    try {
        // Probar con una hoja simple primero
        const testURL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(GOOGLE_SHEETS_CONFIG.ORDERS_SHEET)}`;
        console.log('[DEBUG] URL de prueba (CSV público):', testURL);
        console.log('[DEBUG] Verificación: No usa API key, solo CSV export público');

        const response = await fetch(testURL);
        console.log('[DEBUG] Respuesta de prueba:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de conexión:', errorText);

            if (response.status === 403) {
                updateDataSourceStatus('❌ Error 403: Documento privado o sin permisos');
                showConnectionHelp();
                return;
            } else if (response.status === 404) {
                updateDataSourceStatus('❌ Error 404: Documento no encontrado');
                return;
            } else {
                updateDataSourceStatus(`❌ Error ${response.status}: ${errorText}`);
                return;
            }
        }

        const csvText = await response.text();
        console.log('CSV de prueba recibido, primeras líneas:', csvText.split('\n').slice(0, 3));

        updateDataSourceStatus('✅ Conexión exitosa, cargando datos...');
        loadShopifyData();

    } catch (error) {
        console.error('Error probando conexión:', error);
        updateDataSourceStatus('❌ Error de red o CORS');
        showConnectionHelp();
    }
}

// Función para construir URL de Google Sheets CSV
function buildSheetURL(sheetName) {
    return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;
}

// Función principal para cargar datos de K-mita (versión simplificada)
async function loadShopifyData() {
    console.log('[LOG] Iniciando loadShopifyData - usando CSV público');
    updateDataSourceStatus('🔄 Cargando datos de K-mita desde Google Sheets...');

    try {
        // Cargar datos de las dos hojas principales
        const ordersURL = buildSheetURL(GOOGLE_SHEETS_CONFIG.ORDERS_SHEET);
        const customersURL = buildSheetURL(GOOGLE_SHEETS_CONFIG.CUSTOMERS_SHEET);

        console.log('[DEBUG] URLs a fetch:', { ordersURL, customersURL });

        const [ordersResponse, customersResponse] = await Promise.all([
            fetch(ordersURL),
            fetch(customersURL)
        ]);

        console.log('[DEBUG] Respuestas de Google Sheets K-mita:', {
            orders: { status: ordersResponse.status, statusText: ordersResponse.statusText },
            customers: { status: customersResponse.status, statusText: customersResponse.statusText }
        });

        // Verificar respuestas
        if (!ordersResponse.ok) {
            const errorText = await ordersResponse.text();
            console.error(`[DEBUG] Error en Orders (${ordersResponse.status}):`, errorText);
            throw new Error(`Error cargando órdenes: ${ordersResponse.status}`);
        }

        if (!customersResponse.ok) {
            const errorText = await customersResponse.text();
            console.error(`[DEBUG] Error en Customers (${customersResponse.status}):`, errorText);
            throw new Error(`Error cargando clientes: ${customersResponse.status}`);
        }

        // Parsear respuestas CSV
        const ordersCSV = await ordersResponse.text();
        const customersCSV = await customersResponse.text();

        ordersData = parseGoogleSheetsCSVResponse(ordersCSV);
        customersData = parseGoogleSheetsCSVResponse(customersCSV);

        console.log('Datos K-mita cargados:', {
            ordersCount: ordersData.length,
            customersCount: customersData.length
        });

        isDataLoaded = true;
        lastDataUpdate = new Date();

        updateDataSourceStatus(`✅ Datos cargados: ${ordersData.length} de tabla órdenes, ${customersData.length} de tabla clientes`);

        // Procesar datos
        processAndDisplayData();

    } catch (error) {
        console.error('Error cargando datos K-mita:', error);
        console.log('[FALLBACK] Intentando cargar datos de muestra...');
        
        try {
            await loadSampleData();
        } catch (fallbackError) {
            console.error('Error cargando datos de muestra:', fallbackError);
            updateDataSourceStatus(`❌ Error: ${error.message} - Sin datos de respaldo`);
            isDataLoaded = false;
        }
    }
}

// Función para cargar datos de muestra como fallback
async function loadSampleData() {
    console.log('[FALLBACK] Cargando datos de muestra desde sample-data.json');
    updateDataSourceStatus('🔄 Cargando datos de muestra...');

    try {
        const response = await fetch('sample-data.json');
        if (!response.ok) {
            throw new Error(`Error cargando sample-data.json: ${response.status}`);
        }

        const sampleData = await response.json();
        
        ordersData = sampleData.orders || [];
        customersData = sampleData.customers || [];

        console.log('Datos de muestra cargados:', {
            ordersCount: ordersData.length,
            customersCount: customersData.length
        });

        isDataLoaded = true;
        lastDataUpdate = new Date();

        updateDataSourceStatus(`✅ Datos de muestra cargados: ${ordersData.length} órdenes, ${customersData.length} clientes`);

        // Procesar datos
        processAndDisplayData();

    } catch (error) {
        console.error('Error cargando datos de muestra:', error);
        throw error;
    }
}

// Función para parsear CSV (versión simplificada)
function parseGoogleSheetsCSVResponse(csvText) {
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
// FUNCIONES DE PROCESAMIENTO Y VISUALIZACIÓN
// ===========================================

// Función principal para procesar y mostrar datos
function processAndDisplayData() {
    console.log('Procesando datos K-mita...');

    try {
        updateKmitaKPIs();
        generateKmitaCharts();
        populateKmitaTables();
        generateKmitaInsights();
        console.log('Procesamiento completado');
    } catch (error) {
        console.error('Error procesando datos:', error);
    }
}

// Función auxiliar para calcular días de fulfillment
function calculateFulfillmentDays(createdAt, processedAt) {
    if (!createdAt || !processedAt) return null;

    try {
        const created = new Date(createdAt);
        const processed = new Date(processedAt);

        if (isNaN(created.getTime()) || isNaN(processed.getTime())) return null;

        const diffTime = processed.getTime() - created.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : null;
    } catch (error) {
        console.warn('Error calculando días de fulfillment:', error);
        return null;
    }
}

// Actualizar KPIs (versión completa con métricas K-mita)
function updateKmitaKPIs() {
    const filteredOrders = filterDataByPeriod(ordersData);

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
    const totalOrders = filteredOrders.length;
    const uniqueCustomers = new Set(filteredOrders.map(order => order.customer_email)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calcular métricas K-mita
    const totalKilos = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_kilos || 0), 0);
    const totalBags = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_bags || 0), 0);

    // Calcular precio promedio por kilo
    const validKiloOrders = filteredOrders.filter(order =>
        parseFloat(order.total_kilos) > 0 && parseFloat(order.total_price) > 0
    );
    const avgPricePerKilo = validKiloOrders.length > 0 ?
        validKiloOrders.reduce((sum, order) =>
            sum + (parseFloat(order.total_price) / parseFloat(order.total_kilos)), 0
        ) / validKiloOrders.length : 0;

    // Calcular días promedio de fulfillment
    console.log('[DEBUG] Calculando fulfillment days. Primeras órdenes:', filteredOrders.slice(0, 3).map(o => ({
        created_at: o.created_at,
        processed_at: o.processed_at,
        fulfillment_created_at: o.fulfillment_created_at,
        updated_at: o.updated_at,
        fulfillment_status: o.fulfillment_status
    })));

    const fulfillmentDays = filteredOrders
        .map(order => {
            // Usar fulfillment_created_at si existe, sino processed_at
            const fulfillmentDate = order.fulfillment_created_at || order.processed_at;
            return calculateFulfillmentDays(order.created_at, fulfillmentDate);
        })
        .filter(days => days !== null && days >= 0);

    console.log('[DEBUG] Días de fulfillment calculados:', fulfillmentDays.slice(0, 10));

    const avgFulfillmentDays = fulfillmentDays.length > 0 ?
        fulfillmentDays.reduce((sum, days) => sum + days, 0) / fulfillmentDays.length : 0;

    // Actualizar DOM
    const elements = {
        totalRevenue: formatCurrency(totalRevenue),
        totalOrders: totalOrders.toLocaleString(),
        uniqueCustomers: uniqueCustomers.toLocaleString(),
        avgOrderValue: formatCurrency(avgOrderValue),
        totalKilos: totalKilos.toLocaleString() + ' kg',
        totalBags: totalBags.toLocaleString(),
        avgPricePerKilo: formatCurrency(avgPricePerKilo),
        avgFulfillmentDays: avgFulfillmentDays.toFixed(1) + ' días'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    console.log('KPIs K-mita actualizados:', {
        totalKilos,
        totalBags,
        avgPricePerKilo,
        avgFulfillmentDays,
        fulfillmentDaysCount: fulfillmentDays.length
    });
}

// Función de formato de moneda
function formatCurrency(amount) {
    return `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

// ===========================================
// FUNCIONES AUXILIARES PARA CÁLCULOS
// ===========================================

// Función para agregar datos por cliente
function aggregateCustomerData(ordersData) {
    const customerMap = new Map();

    ordersData.forEach(order => {
        const email = order.customer_email?.toLowerCase().trim();
        if (!email) return;

        if (!customerMap.has(email)) {
            customerMap.set(email, {
                email,
                orders: [],
                totalSpent: 0,
                totalOrders: 0,
                totalKilos: 0,
                totalBags: 0,
                firstOrder: null,
                lastOrder: null,
                states: new Set(),
                paymentMethods: new Set(),
                acceptsMarketing: order.accepts_marketing
            });
        }

        const customer = customerMap.get(email);
        customer.orders.push(order);
        customer.totalSpent += parseFloat(order.total_price || 0);
        customer.totalOrders += 1;
        customer.totalKilos += parseFloat(order.total_kilos || 0);
        customer.totalBags += parseFloat(order.total_bags || 0);

        if (order.shipping_province) customer.states.add(order.shipping_province);
        if (order.payment_method) customer.paymentMethods.add(order.payment_method);

        const orderDate = new Date(order.created_at);
        if (!isNaN(orderDate.getTime())) {
            if (!customer.firstOrder || orderDate < customer.firstOrder) {
                customer.firstOrder = orderDate;
            }
            if (!customer.lastOrder || orderDate > customer.lastOrder) {
                customer.lastOrder = orderDate;
            }
        }
    });

    return Array.from(customerMap.values()).map(customer => ({
        ...customer,
        avgOrderValue: customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0,
        avgPricePerKilo: customer.totalKilos > 0 ? customer.totalSpent / customer.totalKilos : 0,
        avgPricePerBag: customer.totalBags > 0 ? customer.totalSpent / customer.totalBags : 0,
        primaryState: Array.from(customer.states)[0] || 'N/A',
        daysSinceLastOrder: customer.lastOrder ? Math.floor((new Date() - customer.lastOrder) / (1000 * 60 * 60 * 24)) : null,
        segment: getCustomerSegment(customer)
    }));
}

// Función para determinar segmento de cliente
function getCustomerSegment(customer) {
    if (customer.totalOrders >= 10) return 'VIP';
    if (customer.totalOrders >= 5) return 'Frecuente';
    if (customer.totalOrders >= 2) return 'Regular';
    return 'Nuevo';
}

// Función para calcular ventas mensuales
function calculateMonthlySales(ordersData) {
    const monthlyData = {};

    ordersData.forEach(order => {
        const date = new Date(order.created_at);
        if (isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const revenue = parseFloat(order.total_price || 0);
        const kilos = parseFloat(order.total_kilos || 0);
        const bags = parseFloat(order.total_bags || 0);

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                revenue: 0,
                orders: 0,
                kilos: 0,
                bags: 0,
                customers: new Set()
            };
        }

        monthlyData[monthKey].revenue += revenue;
        monthlyData[monthKey].orders += 1;
        monthlyData[monthKey].kilos += kilos;
        monthlyData[monthKey].bags += bags;
        if (order.customer_email) monthlyData[monthKey].customers.add(order.customer_email.toLowerCase());
    });

    return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
            month,
            revenue: data.revenue,
            orders: data.orders,
            kilos: data.kilos,
            bags: data.bags,
            customers: data.customers.size,
            avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
            avgFulfillmentDays: calculateAvgFulfillmentForMonth(ordersData, month)
        }));
}

// Función para calcular fulfillment promedio por mes
function calculateAvgFulfillmentForMonth(ordersData, month) {
    const monthOrders = ordersData.filter(order => {
        const date = new Date(order.created_at);
        return !isNaN(date.getTime()) &&
               `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === month;
    });

    const fulfillmentDays = monthOrders
        .map(order => calculateFulfillmentDays(order.created_at, order.processed_at || order.fulfillment_created_at))
        .filter(days => days !== null && days >= 0);

    return fulfillmentDays.length > 0 ? fulfillmentDays.reduce((sum, days) => sum + days, 0) / fulfillmentDays.length : 0;
}

// Función para calcular top productos
function calculateTopProducts(ordersData) {
    const productMap = new Map();

    ordersData.forEach(order => {
        const kilos = parseFloat(order.total_kilos || 0);
        if (kilos <= 0) return;

        const productKey = `${kilos}kg`;
        if (!productMap.has(productKey)) {
            productMap.set(productKey, { kilos, totalSold: 0, revenue: 0, orders: 0 });
        }

        const product = productMap.get(productKey);
        product.totalSold += kilos;
        product.revenue += parseFloat(order.total_price || 0);
        product.orders += 1;
    });

    return Array.from(productMap.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .map(product => ({
            ...product,
            avgPricePerKilo: product.totalSold > 0 ? product.revenue / product.totalSold : 0
        }));
}

// ===========================================
// FUNCIONES DE GRÁFICAS
// ===========================================

// Generar todas las gráficas K-mita
function generateKmitaCharts() {
    console.log('Generando gráficas K-mita con datos filtrados...');

    const filteredOrders = filterDataByPeriod(ordersData);

    try {
        generateSalesTrendChart(filteredOrders);
        generateCustomerSegmentChart(filteredOrders);
        generateTopProductsChart(filteredOrders);
        generateGeographicChart(filteredOrders);
        generatePaymentMethodsChart(filteredOrders);
        generateFulfillmentChart(filteredOrders);
        generateMarketingPerformanceChart(filteredOrders);
        generateDiscountChart(filteredOrders);
        generateKilosChart(filteredOrders);
        generateBagsChart(filteredOrders);
        generateSalesByStateChart(filteredOrders);
        generateStatesChart(filteredOrders);

        console.log('Todas las gráficas generadas exitosamente');
    } catch (error) {
        console.error('Error generando gráficas:', error);
    }
}

// Gráfica de tendencia de ventas mensuales
function generateSalesTrendChart(ordersData) {
    const monthlyData = calculateMonthlySales(ordersData);

    const ctx = document.getElementById('salesTrendChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.map(d => d.month),
            datasets: [{
                label: 'Ingresos (MXN)',
                data: monthlyData.map(d => d.revenue),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '📈 Tendencia de Ventas Mensuales'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-MX');
                        }
                    }
                }
            }
        }
    });
}

// Gráfica de segmentación de clientes
function generateCustomerSegmentChart(ordersData) {
    const customers = aggregateCustomerData(ordersData);
    const segments = {};

    customers.forEach(customer => {
        segments[customer.segment] = (segments[customer.segment] || 0) + 1;
    });

    const ctx = document.getElementById('customerSegmentChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(segments),
            datasets: [{
                data: Object.values(segments),
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '👥 Segmentación de Clientes'
                }
            }
        }
    });
}

// Gráfica de top productos
function generateTopProductsChart(ordersData) {
    const topProducts = calculateTopProducts(ordersData).slice(0, 5);

    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topProducts.map(p => `${p.kilos}kg`),
            datasets: [{
                label: 'Kilos Vendidos',
                data: topProducts.map(p => p.totalSold),
                backgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🏆 Top Productos por Kilos'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Gráfica geográfica
function generateGeographicChart(ordersData) {
    const stateSales = {};

    ordersData.forEach(order => {
        const state = order.shipping_province || 'No especificado';
        stateSales[state] = (stateSales[state] || 0) + parseFloat(order.total_price || 0);
    });

    const sortedStates = Object.entries(stateSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

    const ctx = document.getElementById('geographicChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedStates.map(([state]) => state),
            datasets: [{
                label: 'Ventas (MXN)',
                data: sortedStates.map(([, sales]) => sales),
                backgroundColor: '#06b6d4'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🌎 Ventas por Región'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-MX');
                        }
                    }
                }
            }
        }
    });
}

// Gráfica de métodos de pago
function generatePaymentMethodsChart(ordersData) {
    const paymentMethods = {};

    ordersData.forEach(order => {
        const method = order.payment_method || 'No especificado';
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    const ctx = document.getElementById('paymentMethodsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(paymentMethods),
            datasets: [{
                data: Object.values(paymentMethods),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '💳 Métodos de Pago'
                }
            }
        }
    });
}

// Gráfica de tiempo de fulfillment
function generateFulfillmentChart(ordersData) {
    const monthlyData = calculateMonthlySales(ordersData);

    const ctx = document.getElementById('fulfillmentChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.map(d => d.month),
            datasets: [{
                label: 'Días Promedio',
                data: monthlyData.map(d => d.avgFulfillmentDays),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '📦 Tiempo de Fulfillment'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Días'
                    }
                }
            }
        }
    });
}

// Gráfica de performance de marketing
function generateMarketingPerformanceChart(ordersData) {
    let acceptsMarketing = 0;
    let totalOrders = 0;

    ordersData.forEach(order => {
        totalOrders++;
        if (order.accepts_marketing === true || order.accepts_marketing === 'true' || order.accepts_marketing === 'TRUE') {
            acceptsMarketing++;
        }
    });

    const marketingRate = totalOrders > 0 ? (acceptsMarketing / totalOrders * 100).toFixed(1) : 0;

    const ctx = document.getElementById('marketingPerformanceChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Acepta Marketing', 'No Acepta Marketing'],
            datasets: [{
                label: 'Número de Órdenes',
                data: [acceptsMarketing, totalOrders - acceptsMarketing],
                backgroundColor: ['#10b981', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `📧 Performance de Marketing (${marketingRate}% aceptación)`
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Gráfica de impacto de descuentos
function generateDiscountChart(ordersData) {
    const discountRanges = {
        'Sin descuento': 0,
        '1-10%': 0,
        '11-25%': 0,
        '26-50%': 0,
        '50%+': 0
    };

    ordersData.forEach(order => {
        const total = parseFloat(order.total_price || 0);
        const discount = parseFloat(order.total_discounts || 0);
        const discountPercent = total > 0 ? (discount / total) * 100 : 0;

        if (discountPercent === 0) discountRanges['Sin descuento']++;
        else if (discountPercent <= 10) discountRanges['1-10%']++;
        else if (discountPercent <= 25) discountRanges['11-25%']++;
        else if (discountPercent <= 50) discountRanges['26-50%']++;
        else discountRanges['50%+']++;
    });

    const ctx = document.getElementById('discountChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(discountRanges),
            datasets: [{
                label: 'Número de Órdenes',
                data: Object.values(discountRanges),
                backgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🎯 Impacto de Descuentos'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Gráfica de kilos vendidos por mes
function generateKilosChart(ordersData) {
    const monthlyData = calculateMonthlySales(ordersData);

    const ctx = document.getElementById('kilosChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.map(d => d.month),
            datasets: [{
                label: 'Kilos Vendidos',
                data: monthlyData.map(d => d.kilos),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '☕ Kilos Vendidos por Mes'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kilos'
                    }
                }
            }
        }
    });
}

// Gráfica de bolsas vendidas por mes
function generateBagsChart(ordersData) {
    const monthlyData = calculateMonthlySales(ordersData);

    const ctx = document.getElementById('bagsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.map(d => d.month),
            datasets: [{
                label: 'Bolsas Vendidas',
                data: monthlyData.map(d => d.bags),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🛍️ Bolsas Vendidas por Mes'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Bolsas'
                    }
                }
            }
        }
    });
}

// Gráfica de ventas por estado (top 10)
function generateSalesByStateChart(ordersData) {
    const stateSales = {};

    ordersData.forEach(order => {
        const state = order.shipping_province || 'No especificado';
        stateSales[state] = (stateSales[state] || 0) + parseFloat(order.total_price || 0);
    });

    const sortedStates = Object.entries(stateSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

    const ctx = document.getElementById('salesByStateChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedStates.map(([state]) => state),
            datasets: [{
                label: 'Ventas (MXN)',
                data: sortedStates.map(([, sales]) => sales),
                backgroundColor: '#06b6d4'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🌎 Ventas por Estado (Top 10)'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-MX');
                        }
                    }
                }
            }
        }
    });
}

// Gráfica de distribución de ventas por estado
function generateStatesChart(ordersData) {
    const stateSales = {};

    ordersData.forEach(order => {
        const state = order.shipping_province || 'No especificado';
        stateSales[state] = (stateSales[state] || 0) + parseFloat(order.total_price || 0);
    });

    const ctx = document.getElementById('statesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(stateSales),
            datasets: [{
                data: Object.values(stateSales),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🌎 Distribución de Ventas por Estado'
                }
            }
        }
    });
}

// ===========================================
// FUNCIONES DE TABLAS
// ===========================================

// Poblar todas las tablas K-mita
function populateKmitaTables() {
    console.log('Poblando tablas K-mita con datos filtrados...');

    const filteredOrders = filterDataByPeriod(ordersData);

    try {
        populateTopCustomersTable(filteredOrders);
        populateMonthlyAnalysisTable(filteredOrders);
        populateCustomersAnalysisTable(filteredOrders);
        populateOrdersAnalysisTable(filteredOrders);
        populateDetailedAnalysisTable(filteredOrders);

        console.log('Todas las tablas pobladas exitosamente');
    } catch (error) {
        console.error('Error poblando tablas:', error);
    }
}

// Tabla de top clientes
function populateTopCustomersTable(ordersData) {
    const customers = aggregateCustomerData(ordersData)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

    const tbody = document.getElementById('topCustomersBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    customers.forEach((customer, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.email}</td>
            <td>${customer.totalOrders}</td>
            <td>${formatCurrency(customer.totalSpent)}</td>
            <td>${formatCurrency(customer.avgOrderValue)}</td>
            <td>${customer.segment}</td>
            <td>${customer.lastOrder ? customer.lastOrder.toLocaleDateString('es-MX') : 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Tabla de análisis mensual
function populateMonthlyAnalysisTable(ordersData) {
    const monthlyData = calculateMonthlySales(ordersData);

    const tbody = document.getElementById('monthlyAnalysisBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    monthlyData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.month}</td>
            <td>${data.orders}</td>
            <td>${formatCurrency(data.revenue)}</td>
            <td>${data.customers}</td>
            <td>${formatCurrency(data.avgOrderValue)}</td>
            <td>${data.kilos.toLocaleString()} kg</td>
            <td>${data.avgFulfillmentDays.toFixed(1)} días</td>
        `;
        tbody.appendChild(row);
    });
}

// Tabla de análisis de clientes
function populateCustomersAnalysisTable(ordersData) {
    const customers = aggregateCustomerData(ordersData)
        .sort((a, b) => b.totalSpent - a.totalSpent);

    const tbody = document.getElementById('customersAnalysisBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.email}</td>
            <td>${customer.totalOrders}</td>
            <td>${formatCurrency(customer.totalSpent)}</td>
            <td>${customer.totalKilos.toFixed(1)} kg</td>
            <td>${customer.totalBags}</td>
            <td>${formatCurrency(customer.avgPricePerKilo)}</td>
            <td>${customer.totalBags > 0 ? formatCurrency(customer.totalSpent / customer.totalBags) : '$0'}</td>
            <td>${customer.lastOrder ? customer.lastOrder.toLocaleDateString('es-MX') : 'N/A'}</td>
            <td>${customer.daysSinceLastOrder || 'N/A'}</td>
            <td>${customer.primaryState}</td>
            <td>${customer.segment}</td>
        `;
        tbody.appendChild(row);
    });
}

// Tabla de análisis de órdenes
function populateOrdersAnalysisTable(ordersData) {
    const tbody = document.getElementById('ordersAnalysisBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    ordersData.slice(0, 100).forEach(order => { // Limitar a 100 órdenes para performance
        const createdDate = new Date(order.created_at);
        const processedDate = new Date(order.processed_at || order.fulfillment_created_at);
        const fulfillmentDays = calculateFulfillmentDays(order.created_at, order.processed_at || order.fulfillment_created_at);
        const total = parseFloat(order.total_price || 0);
        const discount = parseFloat(order.total_discounts || 0);
        const discountPercent = total > 0 ? ((discount / total) * 100).toFixed(1) : '0';
        const kilos = parseFloat(order.total_kilos || 0);
        const bags = parseFloat(order.total_bags || 0);
        const pricePerKilo = kilos > 0 ? total / kilos : 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_number || order.id || 'N/A'}</td>
            <td>${order.customer_email || 'N/A'}</td>
            <td>${!isNaN(createdDate.getTime()) ? createdDate.toLocaleDateString('es-MX') : 'N/A'}</td>
            <td>${!isNaN(processedDate.getTime()) ? processedDate.toLocaleDateString('es-MX') : 'N/A'}</td>
            <td>${fulfillmentDays !== null ? `${fulfillmentDays} días` : 'N/A'}</td>
            <td>${formatCurrency(total)}</td>
            <td>${formatCurrency(discount)}</td>
            <td>${discountPercent}%</td>
            <td>${kilos.toFixed(1)} kg</td>
            <td>${bags}</td>
            <td>${formatCurrency(pricePerKilo)}</td>
            <td>${order.shipping_city || 'N/A'}</td>
            <td>${order.shipping_province || 'N/A'}</td>
            <td>${order.payment_method || 'N/A'}</td>
            <td>${order.accepts_marketing === true || order.accepts_marketing === 'true' ? 'Sí' : 'No'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Tabla de análisis detallado
function populateDetailedAnalysisTable(ordersData) {
    const tbody = document.getElementById('detailedAnalysisBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    ordersData.slice(0, 50).forEach(order => { // Limitar a 50 órdenes para performance
        const processedDate = new Date(order.processed_at || order.fulfillment_created_at);
        const fulfillmentDays = calculateFulfillmentDays(order.created_at, order.processed_at || order.fulfillment_created_at);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_number || order.id || 'N/A'}</td>
            <td>${order.shipping_city || 'N/A'}</td>
            <td>${order.shipping_province || 'N/A'}</td>
            <td>${order.payment_method || 'N/A'}</td>
            <td>${!isNaN(processedDate.getTime()) ? processedDate.toLocaleDateString('es-MX') : 'N/A'}</td>
            <td>${fulfillmentDays !== null ? `${fulfillmentDays} días` : 'N/A'}</td>
            <td>${formatCurrency(parseFloat(order.total_price || 0))}</td>
            <td>${parseFloat(order.total_kilos || 0).toFixed(1)} kg</td>
        `;
        tbody.appendChild(row);
    });
}

// ===========================================
// INICIALIZACIÓN
// ===========================================

// Event listener único para DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[INIT] DOM cargado, configurando dashboard K-mita');

    // Verificar autenticación persistida
    if (sessionStorage.getItem('kmita_authenticated') === 'true') {
        isAuthenticated = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
        testGoogleSheetsConnection();
    } else {
        // Mostrar login por defecto
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

    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (isAuthenticated) loadShopifyData();
        });
    }

    // Configurar filtros de período
    setupPeriodFilters();

    console.log('[INIT] Event listeners configurados');
});

// ===========================================
// FUNCIONES DE FILTROS DE PERÍODO
// ===========================================

// Configurar filtros de período
function setupPeriodFilters() {
    const filterButtons = document.querySelectorAll('.period-btn');
    
    console.log(`[FILTER] Encontrados ${filterButtons.length} botones de período`);

    filterButtons.forEach(button => {
        console.log(`[FILTER] Configurando botón: ${button.textContent} (${button.getAttribute('data-period')})`);
        
        button.addEventListener('click', function() {
            // Remover clase activa de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase activa al botón clickeado
            this.classList.add('active');

            // Actualizar período actual
            const newPeriod = this.getAttribute('data-period');
            console.log(`[FILTER] Cambiando período de '${currentPeriod}' a '${newPeriod}'`);
            currentPeriod = newPeriod;

            // Actualizar indicador de estado del filtro
            updateFilterStatus(this.textContent);

            // Actualizar dashboard con el nuevo filtro
            if (isDataLoaded) {
                console.log('[FILTER] Actualizando dashboard con nuevo filtro...');
                processAndDisplayData();
            } else {
                console.log('[FILTER] Datos no cargados aún, filtro aplicado para próxima carga');
            }
        });
    });

    console.log('[FILTER] Filtros de período configurados correctamente');
}

// Función para actualizar el indicador de estado del filtro
function updateFilterStatus(filterText) {
    const filterStatus = document.getElementById('filterStatus');
    const filterStatusText = document.getElementById('filterStatusText');
    
    if (filterStatus && filterStatusText) {
        filterStatusText.textContent = filterText;
        
        // Mostrar el indicador si no es "Todo el tiempo"
        if (currentPeriod === 'all') {
            filterStatus.style.display = 'none';
        } else {
            filterStatus.style.display = 'inline-flex';
        }
    }
}

// Función para filtrar datos por período
function filterDataByPeriod(data) {
    if (!data) {
        console.log('[FILTER] No hay datos para filtrar');
        return [];
    }
    
    if (currentPeriod === 'all') {
        console.log(`[FILTER] Mostrando todos los datos: ${data.length} registros`);
        return data;
    }

    const now = new Date();
    let cutoffDate;

    switch (currentPeriod) {
        case '1m':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        case '3m':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
        case '6m':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
        case '12m':
            cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        default:
            console.log(`[FILTER] Período desconocido: ${currentPeriod}, mostrando todos los datos`);
            return data;
    }

    const filteredData = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return !isNaN(itemDate.getTime()) && itemDate >= cutoffDate;
    });

    console.log(`[FILTER] Período: ${currentPeriod}, Fecha corte: ${cutoffDate.toLocaleDateString('es-MX')}`);
    console.log(`[FILTER] Datos filtrados: ${filteredData.length} de ${data.length} registros`);

    return filteredData;
}

// ===========================================
// FUNCIONES DE ALERTAS E INSIGHTS
// ===========================================

// Generar alertas de clientes inactivos
function generateCustomerAlerts() {
    const filteredOrders = filterDataByPeriod(ordersData);
    const customers = aggregateCustomerData(filteredOrders);

    const alertsContainer = document.getElementById('customerAlerts');
    if (!alertsContainer) return;

    // Identificar clientes inactivos (sin compras en los últimos 90 días)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const inactiveCustomers = customers.filter(customer =>
        customer.lastOrder && customer.lastOrder < ninetyDaysAgo && customer.totalOrders > 0
    ).sort((a, b) => b.totalSpent - a.totalSpent); // Ordenar por valor gastado

    // Identificar clientes en riesgo (sin compras en los últimos 60 días pero con historial)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const atRiskCustomers = customers.filter(customer =>
        customer.lastOrder && customer.lastOrder < sixtyDaysAgo &&
        customer.lastOrder >= ninetyDaysAgo && customer.totalOrders >= 2
    ).sort((a, b) => b.totalSpent - a.totalSpent); // Ordenar por valor gastado

    let alertsHTML = '';

    if (inactiveCustomers.length > 0) {
        const totalValueLost = inactiveCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
        alertsHTML += `
            <div class="alert-card critical">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <h4>Clientes Inactivos (${inactiveCustomers.length})</h4>
                    <p>Clientes sin compras en los últimos 90 días</p>
                    <small>Valor potencial perdido: $${totalValueLost.toLocaleString('es-MX')}</small>
                    <details class="alert-details" data-type="inactive">
                        <summary>Ver detalles de clientes inactivos</summary>
                        <div class="alert-table-container">
                            <div class="alert-table-section" id="inactive-top">
                                <table class="alert-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Última Compra</th>
                                            <th>Total Gastado</th>
                                            <th>Órdenes</th>
                                            <th>Días Sin Comprar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${inactiveCustomers.slice(0, 10).map(customer => `
                                            <tr>
                                                <td>${customer.email}</td>
                                                <td>${customer.lastOrder ? customer.lastOrder.toLocaleDateString('es-MX') : 'N/A'}</td>
                                                <td>$${customer.totalSpent.toLocaleString('es-MX')}</td>
                                                <td>${customer.totalOrders}</td>
                                                <td>${customer.daysSinceLastOrder || 'N/A'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                ${inactiveCustomers.length > 10 ? `
                                    <div class="alert-actions">
                                        <p class="alert-note">Mostrando 10 de ${inactiveCustomers.length} clientes. Los más valiosos primero.</p>
                                        <button class="show-all-btn" onclick="showAllInactiveCustomers()">Ver todos los clientes inactivos</button>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="alert-table-section" id="inactive-all" style="display: none;">
                                <table class="alert-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Última Compra</th>
                                            <th>Total Gastado</th>
                                            <th>Órdenes</th>
                                            <th>Días Sin Comprar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${inactiveCustomers.map(customer => `
                                            <tr>
                                                <td>${customer.email}</td>
                                                <td>${customer.lastOrder ? customer.lastOrder.toLocaleDateString('es-MX') : 'N/A'}</td>
                                                <td>$${customer.totalSpent.toLocaleString('es-MX')}</td>
                                                <td>${customer.totalOrders}</td>
                                                <td>${customer.daysSinceLastOrder || 'N/A'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                <div class="alert-actions">
                                    <button class="show-top-btn" onclick="showTopInactiveCustomers()">Volver al top 10</button>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    if (atRiskCustomers.length > 0) {
        const totalValueAtRisk = atRiskCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
        alertsHTML += `
            <div class="alert-card warning">
                <div class="alert-icon">🚨</div>
                <div class="alert-content">
                    <h4>Clientes en Riesgo (${atRiskCustomers.length})</h4>
                    <p>Clientes sin compras en los últimos 60 días</p>
                    <small>Valor en riesgo: $${totalValueAtRisk.toLocaleString('es-MX')} - Necesitan atención inmediata</small>
                    <details class="alert-details" data-type="at-risk">
                        <summary>Ver detalles de clientes en riesgo</summary>
                        <div class="alert-table-container">
                            <div class="alert-table-section" id="atrisk-top">
                                <table class="alert-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Última Compra</th>
                                            <th>Total Gastado</th>
                                            <th>Órdenes</th>
                                            <th>Días Sin Comprar</th>
                                            <th>Segmento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${atRiskCustomers.slice(0, 10).map(customer => `
                                            <tr>
                                                <td>${customer.email}</td>
                                                <td>${customer.lastOrder ? customer.lastOrder.toLocaleDateString('es-MX') : 'N/A'}</td>
                                                <td>$${customer.totalSpent.toLocaleString('es-MX')}</td>
                                                <td>${customer.totalOrders}</td>
                                                <td>${customer.daysSinceLastOrder || 'N/A'}</td>
                                                <td>${customer.segment}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                ${atRiskCustomers.length > 10 ? `
                                    <div class="alert-actions">
                                        <p class="alert-note">Mostrando 10 de ${atRiskCustomers.length} clientes. Los más valiosos primero.</p>
                                        <button class="show-all-btn" onclick="showAllAtRiskCustomers()">Ver todos los clientes en riesgo</button>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="alert-table-section" id="atrisk-all" style="display: none;">
                                <table class="alert-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Última Compra</th>
                                            <th>Total Gastado</th>
                                            <th>Órdenes</th>
                                            <th>Días Sin Comprar</th>
                                            <th>Segmento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${atRiskCustomers.map(customer => `
                                            <tr>
                                                <td>${customer.email}</td>
                                                <td>${customer.lastOrder ? customer.lastOrder.toLocaleDateString('es-MX') : 'N/A'}</td>
                                                <td>$${customer.totalSpent.toLocaleString('es-MX')}</td>
                                                <td>${customer.totalOrders}</td>
                                                <td>${customer.daysSinceLastOrder || 'N/A'}</td>
                                                <td>${customer.segment}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                <div class="alert-actions">
                                    <button class="show-top-btn" onclick="showTopAtRiskCustomers()">Volver al top 10</button>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    if (alertsHTML === '') {
        alertsHTML = `
            <div class="alert-card success">
                <div class="alert-icon">✅</div>
                <div class="alert-content">
                    <h4>Todo en Orden</h4>
                    <p>No hay clientes inactivos o en riesgo en este período</p>
                    <small>Mantén el buen trabajo con tus clientes</small>
                </div>
            </div>
        `;
    }

    alertsContainer.innerHTML = alertsHTML;
}

// Funciones para mostrar/ocultar todas las listas de clientes
function showAllInactiveCustomers() {
    document.getElementById('inactive-top').style.display = 'none';
    document.getElementById('inactive-all').style.display = 'block';
}

function showTopInactiveCustomers() {
    document.getElementById('inactive-all').style.display = 'none';
    document.getElementById('inactive-top').style.display = 'block';
}

function showAllAtRiskCustomers() {
    document.getElementById('atrisk-top').style.display = 'none';
    document.getElementById('atrisk-all').style.display = 'block';
}

function showTopAtRiskCustomers() {
    document.getElementById('atrisk-all').style.display = 'none';
    document.getElementById('atrisk-top').style.display = 'block';
}

// Generar insights del negocio
function generateBusinessInsights() {
    const filteredOrders = filterDataByPeriod(ordersData);
    const customers = aggregateCustomerData(filteredOrders);

    const insights = [];

    // Calcular métricas básicas
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Análisis de crecimiento mensual
    const monthlyData = calculateMonthlySales(filteredOrders);
    if (monthlyData.length >= 2) {
        const lastMonth = monthlyData[monthlyData.length - 1];
        const prevMonth = monthlyData[monthlyData.length - 2];

        const revenueGrowth = prevMonth.revenue > 0 ?
            ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;

        if (revenueGrowth > 10) {
            insights.push({
                type: 'success',
                icon: '📈',
                title: 'Crecimiento Excelente',
                message: `Ingresos aumentaron ${revenueGrowth.toFixed(1)}% vs mes anterior`
            });
        } else if (revenueGrowth < -10) {
            insights.push({
                type: 'warning',
                icon: '📉',
                title: 'Descenso en Ventas',
                message: `Ingresos disminuyeron ${Math.abs(revenueGrowth).toFixed(1)}% vs mes anterior`
            });
        }
    }

    // Análisis de clientes
    const vipCustomers = customers.filter(c => c.segment === 'VIP').length;
    const inactiveCustomers = customers.filter(c =>
        c.lastOrder && (new Date() - c.lastOrder) > (90 * 24 * 60 * 60 * 1000)
    ).length;

    if (vipCustomers > 0) {
        insights.push({
            type: 'success',
            icon: '👑',
            title: 'Clientes VIP',
            message: `${vipCustomers} clientes generan alto valor recurrente`
        });
    }

    if (inactiveCustomers > 0) {
        insights.push({
            type: 'info',
            icon: '😴',
            title: 'Clientes Inactivos',
            message: `${inactiveCustomers} clientes necesitan reactivación`
        });
    }

    // Análisis de productos
    const topProducts = calculateTopProducts(filteredOrders);
    if (topProducts.length > 0) {
        const topProduct = topProducts[0];
        insights.push({
            type: 'success',
            icon: '🏆',
            title: 'Producto Estrella',
            message: `${topProduct.kilos}kg es tu producto más vendido`
        });
    }

    // Análisis geográfico
    const stateSales = {};
    filteredOrders.forEach(order => {
        const state = order.shipping_province || 'No especificado';
        stateSales[state] = (stateSales[state] || 0) + parseFloat(order.total_price || 0);
    });

    const topState = Object.entries(stateSales)
        .sort(([,a], [,b]) => b - a)[0];

    if (topState) {
        insights.push({
            type: 'info',
            icon: '📍',
            title: 'Mercado Principal',
            message: `${topState[0]} es tu estado con más ventas`
        });
    }

    // Análisis de fulfillment
    const fulfillmentDays = filteredOrders
        .map(order => calculateFulfillmentDays(order.created_at, order.processed_at || order.fulfillment_created_at))
        .filter(days => days !== null && days >= 0);

    const avgFulfillmentDays = fulfillmentDays.length > 0 ?
        fulfillmentDays.reduce((sum, days) => sum + days, 0) / fulfillmentDays.length : 0;

    if (avgFulfillmentDays > 3) {
        insights.push({
            type: 'warning',
            icon: '⏰',
            title: 'Fulfillment Lento',
            message: `Tiempo promedio de entrega: ${avgFulfillmentDays.toFixed(1)} días`
        });
    } else if (avgFulfillmentDays > 0) {
        insights.push({
            type: 'success',
            icon: '⚡',
            title: 'Fulfillment Eficiente',
            message: `Entregas rápidas: ${avgFulfillmentDays.toFixed(1)} días promedio`
        });
    }

    return insights;
}

// Mostrar insights en el dashboard
function displayInsights(insights) {
    const container = document.getElementById('insightsContainer');
    if (!container) return;

    if (insights.length === 0) {
        container.innerHTML = `
            <div class="insight-card info">
                <div class="insight-icon">💡</div>
                <div class="insight-content">
                    <h4>Procesando Insights</h4>
                    <p>Los insights se generarán cuando haya más datos disponibles</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    insights.forEach(insight => {
        const insightCard = document.createElement('div');
        insightCard.className = `insight-card ${insight.type}`;
        insightCard.innerHTML = `
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.message}</p>
            </div>
        `;
        container.appendChild(insightCard);
    });
}

// Generar insights de K-mita
function generateKmitaInsights() {
    console.log('Generando insights de K-mita...');
    const insights = generateBusinessInsights();
    displayInsights(insights);
    generateCustomerAlerts();
}

console.log('✅ Script K-mita Analytics cargado correctamente');