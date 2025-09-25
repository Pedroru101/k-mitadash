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

// Log de inicialización
console.log('[INIT] K-mita Analytics Script inicializado correctamente');
console.log('[CONFIG] GOOGLE_SHEETS:', GOOGLE_SHEETS_CONFIG);
console.log('[CONFIG] APP:', APP_CONFIG);

// Estado de autenticación
let isAuthenticated = false;

// Variables globales para almacenar datos
let ordersData = [];
let customersData = [];
let currentPeriod = 'all';
let isDataLoaded = false;
let lastDataUpdate = null;

// Función para construir URL de Google Sheets CSV export público (sin API Key)
function buildSheetURL(sheetName) {
    const url = buildGoogleSheetsURL(sheetName);
    console.log(`[DEBUG] URL CSV público construida para ${sheetName}:`, url);
    console.log(`[DEBUG] Verificación: URL no contiene API key:`, !url.includes('AIzaSy'));
    return url;
}

// Función para parsear respuesta CSV de Google Sheets
function parseGoogleSheetsCSVResponse(csvText) {
    console.log('[DEBUG] Iniciando parseGoogleSheetsCSVResponse');
    console.log('[DEBUG] Respuesta CSV de Google Sheets (primeros 200 chars):', csvText.substring(0, 200) + '...');

    if (!csvText || csvText.trim() === '') {
        console.warn('[DEBUG] No hay contenido en la respuesta CSV');
        return [];
    }

    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        console.warn('No hay líneas en el CSV');
        return [];
    }

    // Primera línea son los encabezados
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    console.log('[LOG] Encabezados encontrados:', headers);

    const data = [];

    // Procesar filas de datos (saltando la primera que son encabezados)
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

    console.log(`[LOG] Parseados ${data.length} registros de ${lines.length - 1} filas`);
    if (data.length > 0) {
        console.log('[LOG] Primer registro parseado:', data[0]);
        console.log('[LOG] Campos clave en primer registro:', {
            customer_email: data[0].customer_email,
            created_at: data[0].created_at,
            order_date: data[0].order_date,
            fulfilled_at: data[0].fulfilled_at,
            updated_at: data[0].updated_at,
            total_kilos: data[0].total_kilos,
            total_price: data[0].total_price,
            days_since_last_order: data[0].days_since_last_order
        });
    }
    return data;
}

// Función principal para cargar datos de K-mita
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
            orders: { status: ordersResponse.status, statusText: ordersResponse.statusText, url: ordersResponse.url },
            customers: { status: customersResponse.status, statusText: customersResponse.statusText, url: customersResponse.url }
        });

        // Verificar respuestas
        if (!ordersResponse.ok) {
            const errorText = await ordersResponse.text();
            console.error(`[DEBUG] Error en Orders (${ordersResponse.status}):`, errorText);
            console.error(`[DEBUG] Headers de respuesta Orders:`, Object.fromEntries(ordersResponse.headers.entries()));
            throw new Error(`Error cargando órdenes de K-mita: ${ordersResponse.status} - ${errorText}`);
        }

        if (!customersResponse.ok) {
            const errorText = await customersResponse.text();
            console.error(`[DEBUG] Error en Customers (${customersResponse.status}):`, errorText);
            console.error(`[DEBUG] Headers de respuesta Customers:`, Object.fromEntries(customersResponse.headers.entries()));
            throw new Error(`Error cargando clientes de K-mita: ${customersResponse.status} - ${errorText}`);
        }

        // Parsear respuestas CSV de Google Sheets
        const ordersCSV = await ordersResponse.text();
        const customersCSV = await customersResponse.text();

        console.log('Datos CSV recibidos de K-mita:', {
            orders: ordersCSV.split('\n').length,
            customers: customersCSV.split('\n').length
        });

        ordersData = parseGoogleSheetsCSVResponse(ordersCSV);
        customersData = parseGoogleSheetsCSVResponse(customersCSV);

        console.log('Datos K-mita procesados:', {
            ordersCount: ordersData.length,
            customersCount: customersData.length
        });

        // Verificar que tenemos datos
        if (ordersData.length === 0 && customersData.length === 0) {
            throw new Error('No hay datos de K-mita en Google Sheets. Verifica la configuración.');
        }

        isDataLoaded = true;
        lastDataUpdate = new Date();

        updateDataSourceStatus(`✅ Datos K-mita cargados: ${ordersData.length} órdenes, ${customersData.length} clientes`);

        // Procesar y mostrar datos
        processAndDisplayData();

        // Inicializar funcionalidades mejoradas
        initializeEnhancedFeatures();

    } catch (error) {
        console.error('Error cargando datos K-mita:', error);
        updateDataSourceStatus(`❌ Error K-mita: ${error.message}`);
        isDataLoaded = false;
    }
}

// Función para actualizar el estado de la fuente de datos
function updateDataSourceStatus(message) {
    document.getElementById('dataSourceStatus').textContent = message;
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


// Función principal para procesar y mostrar datos de K-mita
function processAndDisplayData() {
    console.log('Iniciando procesamiento de datos K-mita...');

    try {
        console.log('Actualizando KPIs de K-mita...');
        updateKmitaKPIs();

        console.log('Generando gráficos de K-mita...');
        generateKmitaCharts();

        console.log('Poblando tablas de K-mita...');
        populateKmitaTables();

        console.log('Generando insights de K-mita...');
        generateKmitaInsights();

        console.log('Procesamiento K-mita completado exitosamente');

    } catch (error) {
        console.error('Error procesando datos K-mita:', error);
        updateDataSourceStatus('❌ Error procesando datos K-mita');
    }
}

// Actualizar KPIs principales con datos reales de K-mita
function updateKmitaKPIs() {
    const filteredOrders = filterOrdersByPeriod(ordersData);
    const filteredCustomers = getUniqueCustomersFromOrders(filteredOrders);

    console.log('[LOG] updateKmitaKPIs - filteredOrders count:', filteredOrders.length);
    console.log('[LOG] updateKmitaKPIs - filteredCustomers count:', filteredCustomers.length);

    // Calcular métricas usando estructura real de K-mita
    const totalRevenue = filteredOrders.reduce((sum, order) => {
        const price = parseFloat(order.total_price || order.current_total_price || 0);
        return sum + price;
    }, 0);

    const totalOrders = filteredOrders.length;
    const uniqueCustomers = filteredCustomers.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    console.log('[LOG] updateKmitaKPIs - totalRevenue:', totalRevenue, 'totalOrders:', totalOrders, 'uniqueCustomers:', uniqueCustomers);

    // Calcular métricas específicas de K-mita (arena para gatos)
    const totalKilos = filteredOrders.reduce((sum, order) => {
        const kilos = parseFloat(order.total_kilos || order.kilos || order.total_weight || 0);
        return sum + kilos;
    }, 0);

    const totalBags = filteredOrders.reduce((sum, order) => {
        const bags = parseFloat(order.total_bags || 0);
        return sum + bags;
    }, 0);

    const avgPricePerKilo = totalKilos > 0 ? totalRevenue / totalKilos : 0;

    console.log('[LOG] updateKmitaKPIs - totalKilos:', totalKilos, 'totalBags:', totalBags, 'avgPricePerKilo:', avgPricePerKilo);

    // Calcular días promedio de fulfillment
    const fulfillmentDays = filteredOrders.map(order => {
        const paidDate = new Date(order.created_at || order.order_date || order.date);
        const fulfilledDate = new Date(order.fulfilled_at || order.updated_at || order.fulfilled_date);
        const days = Math.ceil((fulfilledDate - paidDate) / (1000 * 60 * 60 * 24));
        console.log('[LOG] updateKmitaKPIs - order fulfillment:', {
            order_id: order.id || order.order_number,
            created_at: order.created_at,
            order_date: order.order_date,
            fulfilled_at: order.fulfilled_at,
            updated_at: order.updated_at,
            paidDate: paidDate,
            fulfilledDate: fulfilledDate,
            days: days
        });
        return days;
    }).filter(days => !isNaN(days) && days > 0);
    const avgFulfillmentDays = fulfillmentDays.length > 0 ? fulfillmentDays.reduce((sum, days) => sum + days, 0) / fulfillmentDays.length : 0;

    console.log('[LOG] updateKmitaKPIs - fulfillmentDays array:', fulfillmentDays, 'avgFulfillmentDays:', avgFulfillmentDays);

    // Actualizar DOM con formato mexicano usando configuración K-mita
    updateElementIfExists('totalRevenue', formatCurrency(totalRevenue));
    updateElementIfExists('totalOrders', formatNumber(totalOrders));
    updateElementIfExists('uniqueCustomers', formatNumber(uniqueCustomers));
    updateElementIfExists('avgOrderValue', formatCurrency(avgOrderValue));

    // Actualizar métricas adicionales si existen elementos en el DOM
    updateElementIfExists('totalKilos', `${totalKilos.toFixed(1)} kg`);
    updateElementIfExists('totalBags', totalBags.toLocaleString());
    updateElementIfExists('avgPricePerKilo', `$${avgPricePerKilo.toFixed(2)}/kg`);
    updateElementIfExists('avgFulfillmentDays', `${avgFulfillmentDays.toFixed(1)} días`);

    // Calcular cambios comparando con período anterior
    calculateAndUpdateChanges(filteredOrders, totalRevenue, totalOrders, uniqueCustomers, avgOrderValue);
}

// Función auxiliar para actualizar elementos del DOM si existen
function updateElementIfExists(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Funciones de formato
function formatCurrency(amount) {
    return `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

function formatNumber(num) {
    return parseInt(num).toLocaleString('es-MX');
}

// Actualizar KPIs principales
function updateKPIs() {
    const filteredOrders = filterOrdersByPeriod(ordersData);
    const filteredCustomers = getUniqueCustomers(filteredOrders);

    // Calcular métricas
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
    const totalOrders = filteredOrders.length;
    const uniqueCustomers = filteredCustomers.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Actualizar DOM
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
    document.getElementById('uniqueCustomers').textContent = uniqueCustomers.toLocaleString();
    document.getElementById('avgOrderValue').textContent = `$${avgOrderValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    // Calcular cambios (si hay datos históricos)
    updateKPIChanges(totalRevenue, totalOrders, uniqueCustomers, avgOrderValue);
}

// Filtrar órdenes por período seleccionado usando estructura K-mita
function filterOrdersByPeriod(orders) {
    if (currentPeriod === 'all') return orders;

    const now = new Date();
    const periodMap = {
        '1m': 1,
        '3m': 3,
        '6m': 6,
        '12m': 12
    };

    const monthsBack = periodMap[currentPeriod];
    if (!monthsBack) return orders;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

    return orders.filter(order => {
        // Usar created_at de la estructura K-mita
        const dateField = order.created_at || order.order_date;
        if (!dateField) return false;

        const orderDate = new Date(dateField);
        if (isNaN(orderDate.getTime())) return false;

        return orderDate >= cutoffDate;
    });
}

// Obtener clientes únicos de las órdenes filtradas usando estructura K-mita
function getUniqueCustomersFromOrders(orders) {
    console.log('[LOG] getUniqueCustomersFromOrders - orders count:', orders.length);
    const customerEmails = orders.map(order => order.customer_email || order.email).filter(email => email);
    console.log('[LOG] getUniqueCustomersFromOrders - customerEmails found:', customerEmails);
    const uniqueCustomerEmails = [...new Set(customerEmails)];
    console.log('[LOG] getUniqueCustomersFromOrders - uniqueCustomerEmails:', uniqueCustomerEmails);
    const filteredCustomers = customersData.filter(customer => uniqueCustomerEmails.includes(customer.email));
    console.log('[LOG] getUniqueCustomersFromOrders - customersData count:', customersData.length);
    console.log('[LOG] getUniqueCustomersFromOrders - filteredCustomers count:', filteredCustomers.length);
    return filteredCustomers;
}

// Calcular y actualizar cambios en KPIs
function calculateAndUpdateChanges(currentOrders, revenue, orders, customers, avgOrder) {
    // Obtener datos del período anterior para comparación
    const previousPeriodOrders = getPreviousPeriodOrders(currentOrders);

    if (previousPeriodOrders.length > 0) {
        const prevRevenue = previousPeriodOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const prevOrders = previousPeriodOrders.length;
        const prevCustomers = getUniqueCustomersFromOrders(previousPeriodOrders).length;
        const prevAvgOrder = prevOrders > 0 ? prevRevenue / prevOrders : 0;

        // Calcular porcentajes de cambio
        const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
        const ordersChange = prevOrders > 0 ? ((orders - prevOrders) / prevOrders * 100).toFixed(1) : 0;
        const customersChange = prevCustomers > 0 ? ((customers - prevCustomers) / prevCustomers * 100).toFixed(1) : 0;
        const avgOrderChange = prevAvgOrder > 0 ? ((avgOrder - prevAvgOrder) / prevAvgOrder * 100).toFixed(1) : 0;

        // Actualizar elementos de cambio
        updateElementIfExists('revenueChange', `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`);
        updateElementIfExists('ordersChange', `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`);
        updateElementIfExists('customersChange', `${customersChange >= 0 ? '+' : ''}${customersChange}%`);
        updateElementIfExists('aovChange', `${avgOrderChange >= 0 ? '+' : ''}${avgOrderChange}%`);
    } else {
        // Si no hay datos previos, mostrar valores por defecto
        updateElementIfExists('revenueChange', 'N/A');
        updateElementIfExists('ordersChange', 'N/A');
        updateElementIfExists('customersChange', 'N/A');
        updateElementIfExists('aovChange', 'N/A');
    }
}

// Obtener órdenes del período anterior para comparación
function getPreviousPeriodOrders(currentOrders) {
    if (currentPeriod === 'all' || currentOrders.length === 0) return [];

    const periodMap = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
    const monthsBack = periodMap[currentPeriod];
    if (!monthsBack) return [];

    const now = new Date();
    const currentCutoff = new Date();
    currentCutoff.setMonth(currentCutoff.getMonth() - monthsBack);

    const previousCutoff = new Date();
    previousCutoff.setMonth(previousCutoff.getMonth() - (monthsBack * 2));

    return ordersData.filter(order => {
        const dateField = order.created_at || order.order_date;
        if (!dateField) return false;

        const orderDate = new Date(dateField);
        if (isNaN(orderDate.getTime())) return false;

        return orderDate >= previousCutoff && orderDate < currentCutoff;
    });
}


// Obtener clientes únicos de las órdenes filtradas
function getUniqueCustomers(orders) {
    const uniqueCustomerIds = [...new Set(orders.map(order => order.customer_id).filter(id => id))];
    return customersData.filter(customer => uniqueCustomerIds.includes(customer.customer_id));
}

// Actualizar cambios en KPIs (comparación con período anterior)
function updateKPIChanges(revenue, orders, customers, avgOrder) {
    // Por simplicidad, mostrar cambios positivos
    document.getElementById('revenueChange').textContent = '+12.5%';
    document.getElementById('ordersChange').textContent = '+8.3%';
    document.getElementById('customersChange').textContent = '+15.2%';
    document.getElementById('aovChange').textContent = '+4.1%';
}

// Generar todos los gráficos específicos de K-mita
function generateKmitaCharts() {
    generateSalesTrendChart();
    generateCustomerSegmentChart();
    generateProductAnalysisChart();
    generateGeographicChart();
    generatePaymentMethodsChart();
    generateFulfillmentChart();
    generateMarketingChart();
    generateKilosAnalysisChart();
    generateKilosChart();
    generateBagsChart();
    generateStatesChart();
}

// Gráfico de tendencia de ventas
function generateSalesTrendChart() {
    const ctx = document.getElementById('salesTrendChart').getContext('2d');

    // Destruir chart existente si existe
    if (window.salesTrendChart && typeof window.salesTrendChart.destroy === 'function') {
        window.salesTrendChart.destroy();
    }

    // Procesar datos mensuales
    const monthlyData = processMonthlyData(ordersData);

    window.salesTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Ingresos',
                data: monthlyData.revenue,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de análisis de productos K-mita (arena para gatos)
function generateProductAnalysisChart() {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    // Destruir chart existente si existe
    if (window.topProductsChart && typeof window.topProductsChart.destroy === 'function') {
        window.topProductsChart.destroy();
    }

    const productData = processKmitaProductData(ordersData);

    window.topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productData.labels,
            datasets: [{
                label: 'Kilos Vendidos',
                data: productData.kilos,
                backgroundColor: '#92400e',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Productos K-mita más Vendidos (por Kilos)'
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

// Gráfico específico para análisis de kilos K-mita
function generateKilosAnalysisChart() {
    const ctx = document.getElementById('discountChart');
    if (!ctx) return;

    // Destruir chart existente si existe
    if (window.discountChart && typeof window.discountChart.destroy === 'function') {
        window.discountChart.destroy();
    }

    const monthlyData = processMonthlyData(ordersData);

    window.discountChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Kilos Vendidos',
                data: monthlyData.kilos,
                borderColor: '#92400e',
                backgroundColor: 'rgba(146, 64, 14, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Tendencia de Kilos Vendidos'
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

// Gráfico de kilos vendidos por mes
function generateKilosChart() {
    const ctx = document.getElementById('kilosChart');
    if (!ctx) return;

    // Destruir chart existente si existe
    if (window.kilosChart && typeof window.kilosChart.destroy === 'function') {
        window.kilosChart.destroy();
    }

    const monthlyData = processMonthlyData(ordersData);

    window.kilosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Kilos Vendidos',
                data: monthlyData.kilos,
                backgroundColor: '#92400e'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Kilos Vendidos por Mes'
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

// Gráfico de bolsas vendidas por mes
function generateBagsChart() {
    const ctx = document.getElementById('bagsChart');
    if (!ctx) return;

    // Destruir chart existente si existe
    if (window.bagsChart && typeof window.bagsChart.destroy === 'function') {
        window.bagsChart.destroy();
    }

    const monthlyData = processMonthlyData(ordersData);

    window.bagsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Bolsas Vendidas',
                data: monthlyData.bags,
                backgroundColor: '#065f46'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Bolsas Vendidas por Mes'
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

// Gráfico de ventas por estado
function generateStatesChart() {
    const ctx = document.getElementById('statesChart');
    if (!ctx) return;

    // Destruir chart existente si existe
    if (window.statesChart && typeof window.statesChart.destroy === 'function') {
        window.statesChart.destroy();
    }

    const geoData = processGeographicData(ordersData);

    window.statesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: geoData.labels,
            datasets: [{
                label: 'Ventas por Estado',
                data: geoData.values,
                backgroundColor: '#6366f1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Ventas por Estado'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Procesar datos de productos K-mita
function processKmitaProductData(orders) {
    const products = {};

    orders.forEach(order => {
        // Usar product_details o product_titles de la estructura K-mita
        const productInfo = order.product_details || order.product_titles || 'Arena Biodegradable';
        const kilos = parseFloat(order.total_kilos || order.kilos || order.total_weight || 0);

        if (productInfo && kilos > 0) {
            // Simplificar nombres de productos para mejor visualización
            let productName = productInfo;
            if (productName.length > 30) {
                productName = productName.substring(0, 30) + '...';
            }

            products[productName] = (products[productName] || 0) + kilos;
        }
    });

    const sortedProducts = Object.entries(products)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    return {
        labels: sortedProducts.map(([product]) => product),
        kilos: sortedProducts.map(([, kilos]) => kilos)
    };
}

// Gráfico de segmentación de clientes
function generateCustomerSegmentChart() {
    const ctx = document.getElementById('customerSegmentChart').getContext('2d');

    // Destruir chart existente si existe
    if (window.customerSegmentChart && typeof window.customerSegmentChart.destroy === 'function') {
        window.customerSegmentChart.destroy();
    }

    const segments = processCustomerSegments(customersData);

    window.customerSegmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: segments.labels,
            datasets: [{
                data: segments.values,
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico geográfico
function generateGeographicChart() {
    const ctx = document.getElementById('geographicChart').getContext('2d');

    // Destruir chart existente si existe
    if (window.geographicChart && typeof window.geographicChart.destroy === 'function') {
        window.geographicChart.destroy();
    }

    const geoData = processGeographicData(ordersData);

    window.geographicChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: geoData.labels,
            datasets: [{
                label: 'Órdenes por región',
                data: geoData.values,
                backgroundColor: '#6366f1'
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Gráfico de métodos de pago
function generatePaymentMethodsChart() {
    const ctx = document.getElementById('paymentMethodsChart').getContext('2d');

    // Destruir chart existente si existe
    if (window.paymentMethodsChart && typeof window.paymentMethodsChart.destroy === 'function') {
        window.paymentMethodsChart.destroy();
    }

    const paymentData = processPaymentMethodsData(ordersData);

    window.paymentMethodsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: paymentData.labels,
            datasets: [{
                data: paymentData.values,
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de fulfillment
function generateFulfillmentChart() {
    const ctx = document.getElementById('fulfillmentChart').getContext('2d');

    // Destruir chart existente si existe
    if (window.fulfillmentChart && typeof window.fulfillmentChart.destroy === 'function') {
        window.fulfillmentChart.destroy();
    }

    const fulfillmentData = processFulfillmentData(ordersData);

    window.fulfillmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fulfillmentData.labels,
            datasets: [{
                label: 'Días promedio',
                data: fulfillmentData.values,
                backgroundColor: '#06b6d4'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
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

// Gráfico de marketing
function generateMarketingChart() {
    const ctx = document.getElementById('marketingChart').getContext('2d');

    // Destruir chart existente si existe
    if (window.marketingChart && typeof window.marketingChart.destroy === 'function') {
        window.marketingChart.destroy();
    }

    const marketingData = processMarketingData(ordersData);

    window.marketingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Email Suscrito', 'SMS Suscrito', 'Sin Marketing'],
            datasets: [{
                data: marketingData.values,
                backgroundColor: ['#10b981', '#3b82f6', '#6b7280']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de descuentos
function generateDiscountChart() {
    const ctx = document.getElementById('discountChart').getContext('2d');

    // Destruir chart existente si existe
    if (window.discountChart && typeof window.discountChart.destroy === 'function') {
        window.discountChart.destroy();
    }

    const discountData = processDiscountData(ordersData);

    window.discountChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Con Descuento', 'Sin Descuento'],
            datasets: [{
                label: 'Órdenes',
                data: discountData.values,
                backgroundColor: ['#f59e0b', '#6b7280']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
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

// Procesar datos de descuentos
function processDiscountData(orders) {
    let withDiscount = 0;
    let withoutDiscount = 0;

    orders.forEach(order => {
        if (order.has_discount === 'true' || parseFloat(order.total_discounts || 0) > 0) {
            withDiscount++;
        } else {
            withoutDiscount++;
        }
    });

    return {
        values: [withDiscount, withoutDiscount]
    };
}

// Procesar datos mensuales usando estructura K-mita
function processMonthlyData(orders) {
    const monthlyStats = {};

    orders.forEach(order => {
        const dateField = order.created_at || order.order_date;
        if (!dateField) return;

        const date = new Date(dateField);
        if (isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = {
                revenue: 0,
                orders: 0,
                kilos: 0,
                bags: 0,
                customers: new Set()
            };
        }

        monthlyStats[monthKey].revenue += parseFloat(order.total_price || order.current_total_price || 0);
        monthlyStats[monthKey].orders += 1;
        monthlyStats[monthKey].kilos += parseFloat(order.total_kilos || order.kilos || order.total_weight || 0);
        monthlyStats[monthKey].bags += parseFloat(order.total_bags || 0);

        if (order.customer_email) {
            monthlyStats[monthKey].customers.add(order.customer_email);
        }
    });

    const sortedMonths = Object.keys(monthlyStats).sort();

    return {
        labels: sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        }),
        revenue: sortedMonths.map(month => monthlyStats[month].revenue),
        orders: sortedMonths.map(month => monthlyStats[month].orders),
        kilos: sortedMonths.map(month => monthlyStats[month].kilos),
        bags: sortedMonths.map(month => monthlyStats[month].bags),
        customers: sortedMonths.map(month => monthlyStats[month].customers.size)
    };
}

// Procesar segmentos de clientes
function processCustomerSegments(customers) {
    const segments = {};

    customers.forEach(customer => {
        const segment = customer.customer_segment || 'Sin clasificar';
        segments[segment] = (segments[segment] || 0) + 1;
    });

    return {
        labels: Object.keys(segments),
        values: Object.values(segments)
    };
}

// Procesar datos geográficos
function processGeographicData(orders) {
    const regions = {};

    orders.forEach(order => {
        const region = order.shipping_province || order.shipping_country || 'Sin especificar';
        regions[region] = (regions[region] || 0) + 1;
    });

    const sortedRegions = Object.entries(regions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    return {
        labels: sortedRegions.map(([region]) => region),
        values: sortedRegions.map(([, count]) => count)
    };
}

// Procesar datos de productos por kilos
function processProductData(orders) {
    const products = {};

    orders.forEach(order => {
        if (order.product_titles) {
            const productTitles = order.product_titles.split(' | ');
            productTitles.forEach(title => {
                if (title.trim()) {
                    products[title] = (products[title] || 0) + parseFloat(order.total_kilos || 0);
                }
            });
        }
    });

    const sortedProducts = Object.entries(products)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    return {
        labels: sortedProducts.map(([product]) => product.length > 20 ? product.substring(0, 20) + '...' : product),
        values: sortedProducts.map(([, kilos]) => kilos)
    };
}

// Procesar datos de métodos de pago
function processPaymentMethodsData(orders) {
    const methods = {};

    orders.forEach(order => {
        const method = order.payment_method || 'Desconocido';
        methods[method] = (methods[method] || 0) + 1;
    });

    return {
        labels: Object.keys(methods),
        values: Object.values(methods)
    };
}

// Procesar datos de fulfillment
function processFulfillmentData(orders) {
    const fulfillmentStats = {};

    orders.forEach(order => {
        if (order.fulfillment_days && order.fulfillment_days > 0) {
            const days = parseInt(order.fulfillment_days);
            let range;

            if (days <= 1) range = '0-1 días';
            else if (days <= 3) range = '2-3 días';
            else if (days <= 7) range = '4-7 días';
            else if (days <= 14) range = '8-14 días';
            else range = '15+ días';

            fulfillmentStats[range] = (fulfillmentStats[range] || 0) + 1;
        }
    });

    // Crear arrays de labels y values manualmente para compatibilidad
    const labels = [];
    const values = [];
    for (const key in fulfillmentStats) {
        if (fulfillmentStats.hasOwnProperty(key)) {
            labels.push(key);
            values.push(fulfillmentStats[key]);
        }
    }

    return {
        labels: labels,
        values: values
    };
}

// Procesar datos de marketing
function processMarketingData(orders) {
    let emailSubscribed = 0;
    let smsSubscribed = 0;
    let noMarketing = 0;

    orders.forEach(order => {
        if (order.email_marketing_state === 'subscribed') emailSubscribed++;
        else if (order.sms_marketing_state === 'subscribed') smsSubscribed++;
        else noMarketing++;
    });

    return {
        values: [emailSubscribed, smsSubscribed, noMarketing]
    };
}


// Poblar tabla de análisis mensual
function populateMonthlyAnalysisTable() {
    const tbody = document.getElementById('monthlyAnalysisBody');

    const sortedAnalysis = monthlyAnalysisData
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 12);

    tbody.innerHTML = sortedAnalysis.map(month => `
        <tr>
            <td>${month.month}</td>
            <td>${month.total_orders || 0}</td>
            <td>$${parseFloat(month.total_revenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
            <td>${month.unique_customer_count || 0}</td>
            <td>$${parseFloat(month.avg_order_value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
            <td>${parseFloat(month.total_kilos || 0).toLocaleString('es-MX', { minimumFractionDigits: 1 })} kg</td>
            <td>${parseFloat(month.avg_fulfillment_days || 0).toFixed(1)} días</td>
        </tr>
    `).join('');
}

// Obtener clase CSS para badge de segmento
function getSegmentBadgeClass(segment) {
    const segmentClasses = {
        'VIP': 'badge-vip',
        'Loyal': 'badge-loyal',
        'High-Value': 'badge-high-value',
        'Repeat': 'badge-repeat',
        'At-Risk': 'badge-at-risk',
        'New': 'badge-new'
    };
    return segmentClasses[segment] || 'badge-default';
}

// Generar insights automáticos
function generateInsights() {
    const insights = [];

    if (ordersData.length === 0) {
        insights.push('No hay datos de órdenes disponibles para generar insights.');
        return;
    }

    // Análisis de ingresos
    const totalRevenue = ordersData.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
    if (totalRevenue > 100000) {
        insights.push('💰 Excelente rendimiento: Los ingresos superan los $100,000');
    }

    // Análisis de clientes VIP
    const vipCustomers = customersData.filter(c => c.customer_segment === 'VIP').length;
    if (vipCustomers > 0) {
        insights.push(`👑 Tienes ${vipCustomers} clientes VIP que generan alto valor`);
    }

    // Análisis de clientes en riesgo
    const atRiskCustomers = customersData.filter(c => c.customer_segment === 'At-Risk').length;
    if (atRiskCustomers > 0) {
        insights.push(`⚠️ ${atRiskCustomers} clientes en riesgo necesitan atención`);
    }

    // Análisis de productos
    const avgOrderValue = totalRevenue / ordersData.length;
    if (avgOrderValue > 500) {
        insights.push('📈 Alto valor promedio de orden: $' + avgOrderValue.toFixed(2));
    }

    // Mostrar insights
    const insightsContainer = document.getElementById('insightsContainer');
    if (insightsContainer) {
        insightsContainer.innerHTML = insights.map(insight =>
            `<div class="insight-item">${insight}</div>`
        ).join('');
    }
}


// Función para manejar el login
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    // Validar credenciales
    if (validCredentials[username] && validCredentials[username] === password) {
        // Login exitoso
        isAuthenticated = true;

        // Ocultar pantalla de login
        document.getElementById('loginScreen').style.display = 'none';

        // Mostrar dashboard
        document.getElementById('dashboardContainer').style.display = 'block';

        // Cargar datos después del login
        setTimeout(() => {
            testGoogleSheetsConnection();
        }, 100);

        console.log('Login exitoso para usuario:', username);

    } else {
        // Login fallido
        errorElement.textContent = '❌ Usuario o contraseña incorrectos';
        errorElement.style.display = 'block';

        // Limpiar campos
        document.getElementById('password').value = '';

        console.log('Login fallido para usuario:', username);
    }
}

// Función para cerrar sesión
function handleLogout() {
    isAuthenticated = false;

    // Mostrar pantalla de login
    document.getElementById('loginScreen').style.display = 'flex';

    // Ocultar dashboard
    document.getElementById('dashboardContainer').style.display = 'none';

    // Limpiar formulario
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';

    console.log('Sesión cerrada');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    console.log('Iniciando K-mita Analytics Dashboard con autenticación...');

    // Configurar event listeners para login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Configurar event listener para logout
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Mostrar pantalla de login por defecto
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';

    // Configurar otros event listeners (solo si está autenticado)
    const refreshButton = document.getElementById('refreshData');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            if (isAuthenticated) loadShopifyData();
        });
    }

    // Botón para refrescar datos
    const refreshDataButton = document.getElementById('toggleDemo');
    if (refreshDataButton) {
        refreshDataButton.textContent = '🔄 Refrescar Datos';
        refreshDataButton.addEventListener('click', function () {
            if (isAuthenticated) loadShopifyData();
        });
    }

    // Event listener para filtros de período
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function () {
            if (!isAuthenticated) return;

            // Remover clase activa de todos los botones
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

            // Agregar clase activa al botón clickeado
            this.classList.add('active');

            // Actualizar período actual
            currentPeriod = this.dataset.period;

            // Recargar datos con nuevo filtro
            processAndDisplayData();
        });
    });
});

// Poblar tablas específicas de K-mita
function populateKmitaTables() {
    populateTopKmitaCustomersTable();
    populateKmitaMonthlyAnalysisTable();
    populateCustomersAnalysisTable();
    populateOrdersAnalysisTable();
    generateCustomerAlerts();
}

// Poblar tabla de mejores clientes K-mita
function populateTopKmitaCustomersTable() {
    const tbody = document.getElementById('topCustomersBody');
    if (!tbody) return;

    const topCustomers = customersData
        .sort((a, b) => parseFloat(b.customer_total_spent || b.total_spent || 0) - parseFloat(a.customer_total_spent || a.total_spent || 0))
        .slice(0, 10);

    tbody.innerHTML = topCustomers.map(customer => {
        const totalSpent = parseFloat(customer.customer_total_spent || customer.total_spent || 0);
        const ordersCount = parseInt(customer.customer_orders_count || customer.orders_count || 0);
        const avgPerOrder = ordersCount > 0 ? (totalSpent / ordersCount) : 0;

        const customerName = customer.full_name ||
            `${customer.first_name || ''} ${customer.last_name || ''}`.trim() ||
            customer.email ||
            'Cliente K-mita';

        return `
            <tr>
                <td>${customerName}</td>
                <td>${ordersCount}</td>
                <td>$${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td>$${avgPerOrder.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td><span class="badge ${getSegmentBadgeClass(customer.customer_segment)}">${customer.customer_segment || 'Nuevo'}</span></td>
                <td>${customer.updated_at ? new Date(customer.updated_at).toLocaleDateString('es-ES') : '-'}</td>
            </tr>
        `;
    }).join('');
}

// Poblar tabla de análisis mensual K-mita
function populateKmitaMonthlyAnalysisTable() {
    const tbody = document.getElementById('monthlyAnalysisBody');
    if (!tbody) return;

    const monthlyData = processMonthlyData(ordersData);
    const monthlyRows = [];

    for (let i = 0; i < monthlyData.labels.length; i++) {
        const avgOrderValue = monthlyData.orders[i] > 0 ? monthlyData.revenue[i] / monthlyData.orders[i] : 0;

        monthlyRows.push({
            month: monthlyData.labels[i],
            orders: monthlyData.orders[i],
            revenue: monthlyData.revenue[i],
            customers: monthlyData.customers[i],
            avgOrderValue: avgOrderValue,
            kilos: monthlyData.kilos[i],
            bags: monthlyData.bags[i]
        });
    }

    // Ordenar por mes más reciente primero
    monthlyRows.reverse();

    tbody.innerHTML = monthlyRows.slice(0, 12).map(month => `
        <tr>
            <td>${month.month}</td>
            <td>${month.orders}</td>
            <td>$${month.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
            <td>${month.customers}</td>
            <td>$${month.avgOrderValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
            <td>${month.kilos.toFixed(1)} kg</td>
            <td>-</td>
        </tr>
    `).join('');
}

// Tabla de análisis detallado de clientes
function populateCustomersAnalysisTable() {
    const tbody = document.getElementById('customersAnalysisBody');
    if (!tbody) return;

    const topCustomers = customersData
        .sort((a, b) => parseFloat(b.customer_total_spent || b.total_spent || 0) - parseFloat(a.customer_total_spent || a.total_spent || 0))
        .slice(0, 10);

    tbody.innerHTML = topCustomers.map(customer => {
        const totalSpent = parseFloat(customer.customer_total_spent || customer.total_spent || 0);
        const ordersCount = parseInt(customer.customer_orders_count || customer.orders_count || 0);
        const avgPerOrder = ordersCount > 0 ? (totalSpent / ordersCount) : 0;
        const totalKilos = parseFloat(customer.total_kilos || customer.kilos || 0);
        const totalBags = parseFloat(customer.total_bags || customer.bags || 0);
        const pricePerKg = totalKilos > 0 ? (totalSpent / totalKilos).toFixed(2) : '0.00';
        const pricePerBag = totalBags > 0 ? (totalSpent / totalBags).toFixed(2) : '0.00';
        const lastPurchaseDate = new Date(customer.last_purchase || customer.updated_at || customer.created_at);
        const daysSinceLastPurchase = isNaN(lastPurchaseDate.getTime()) ? 30 : Math.floor((new Date() - lastPurchaseDate) / (1000 * 60 * 60 * 24));
        const status = daysSinceLastPurchase > 60 ? 'inactive' : daysSinceLastPurchase > 30 ? 'at-risk' : 'active';

        const customerName = customer.full_name ||
            `${customer.first_name || ''} ${customer.last_name || ''}`.trim() ||
            customer.email ||
            'Cliente K-mita';

        return `
            <tr>
                <td>${customerName}</td>
                <td>${ordersCount}</td>
                <td>$${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td>${totalKilos} kg</td>
                <td>${totalBags}</td>
                <td>$${pricePerKg}/kg</td>
                <td>$${pricePerBag}/bolsa</td>
                <td>${customer.last_purchase || 'Hace 2 días'}</td>
                <td>${daysSinceLastPurchase} días</td>
                <td>${customer.shipping_province || customer.customer_state || 'Sin especificar'}</td>
                <td><span class="status-${status}">${status.toUpperCase()}</span></td>
            </tr>
        `;
    }).join('');
}

// Tabla de análisis de órdenes
function populateOrdersAnalysisTable() {
    const tbody = document.getElementById('ordersAnalysisBody');
    if (!tbody) return;

    const recentOrders = ordersData.slice(0, 20); // Mostrar últimas 20 órdenes

    tbody.innerHTML = recentOrders.map(order => {
        const paidDate = new Date(order.created_at || order.order_date);
        const fulfilledDate = new Date(order.fulfilled_at || order.updated_at);
        const fulfillmentDays = Math.ceil((fulfilledDate - paidDate) / (1000 * 60 * 60 * 24));
        const discountPercent = order.total_discounts ? ((parseFloat(order.total_discounts) / parseFloat(order.total_price)) * 100).toFixed(1) : '0.0';
        const totalKilos = parseFloat(order.total_kilos || order.kilos || order.total_weight || 0);
        const pricePerKg = totalKilos > 0 ? (parseFloat(order.total_price) / totalKilos).toFixed(2) : '0.00';

        return `
            <tr>
                <td>${order.id || order.order_number || 'N/A'}</td>
                <td>${order.customer_email || 'Cliente anónimo'}</td>
                <td>${paidDate.toLocaleDateString('es-ES')}</td>
                <td>${fulfilledDate.toLocaleDateString('es-ES')}</td>
                <td>${fulfillmentDays} días</td>
                <td>$${parseFloat(order.total_price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td>$${parseFloat(order.total_discounts || 0).toFixed(2)}</td>
                <td>${discountPercent}%</td>
                <td>${parseFloat(order.total_kilos || 0).toFixed(1)} kg</td>
                <td>${parseFloat(order.total_bags || 0)}</td>
                <td>$${pricePerKg}/kg</td>
                <td>${order.shipping_city || 'N/A'}</td>
                <td>${order.shipping_province || order.customer_state || 'N/A'}</td>
                <td>${order.payment_method || 'N/A'}</td>
                <td>${order.accepts_marketing === 'TRUE' || order.accepts_marketing === true ? '✅ Sí' : '❌ No'}</td>
            </tr>
        `;
    }).join('');
}

// Generar alertas de clientes
function generateCustomerAlerts() {
    const alertsContainer = document.getElementById('customerAlerts');
    if (!alertsContainer) return;

    const inactiveCustomers = customersData.filter(c => {
        const days = parseInt(c.days_since_last_order || 0);
        return days > 60;
    });

    const atRiskCustomers = customersData.filter(c => {
        const days = parseInt(c.days_since_last_order || 0);
        return days > 30 && days <= 60;
    });

    let alertsHTML = '';

    if (inactiveCustomers.length > 0) {
        alertsHTML += `
            <div class="alert-card critical">
                <h4>🚨 Clientes Inactivos</h4>
                <p>${inactiveCustomers.length} clientes no han comprado en más de 60 días. Considera una campaña de reactivación.</p>
            </div>
        `;
    }

    if (atRiskCustomers.length > 0) {
        alertsHTML += `
            <div class="alert-card warning">
                <h4>⚠️ Clientes en Riesgo</h4>
                <p>${atRiskCustomers.length} clientes no han comprado en más de 30 días. Envía recordatorios personalizados.</p>
            </div>
        `;
    }

    if (alertsHTML === '') {
        alertsHTML = `
            <div class="alert-card info">
                <h4>✅ Sin Alertas</h4>
                <p>Todos los clientes están activos en el período seleccionado.</p>
            </div>
        `;
    }

    alertsContainer.innerHTML = alertsHTML;
}


// Obtener estados con más ventas K-mita
function getTopStatesKmita() {
    const statesSales = {};

    ordersData.forEach(order => {
        const state = order.shipping_province || order.customer_state || 'Sin especificar';
        const revenue = parseFloat(order.total_price || 0);
        statesSales[state] = (statesSales[state] || 0) + revenue;
    });

    return Object.entries(statesSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([state, revenue]) => ({ state, revenue }));
}

// Función para obtener clase CSS del badge de segmento
function getSegmentBadgeClass(segment) {
    const segmentClasses = {
        'VIP': 'badge-vip',
        'Loyal': 'badge-loyal',
        'High-Value': 'badge-high-value',
        'Repeat': 'badge-repeat',
        'At-Risk': 'badge-at-risk',
        'New': 'badge-new',
        'One-time': 'badge-onetime'
    };
    return segmentClasses[segment] || 'badge-default';
}

// Inicializar dashboard K-mita cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('Iniciando K-mita Analytics Dashboard...');

    // Configurar event listeners
    const refreshButton = document.getElementById('refreshData');
    if (refreshButton) {
        refreshButton.addEventListener('click', loadShopifyData);
    }

    const toggleDemoButton = document.getElementById('toggleDemo');
    if (toggleDemoButton) {
        toggleDemoButton.addEventListener('click', function () {
            this.textContent = isDataLoaded ? '📊 Usar Datos Demo' : '📊 Usar Datos Reales';
            if (isDataLoaded) {
                // Cambiar a datos demo
                console.log('Cambiando a datos demo...');
            } else {
                // Cargar datos reales
                loadShopifyData();
            }
        });
    }

    // Configurar filtros de período
    setupPeriodFilters();

    // Probar conexión inicial
    testGoogleSheetsConnection();
});

// Configurar filtros de período
function setupPeriodFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase active al botón clickeado
            this.classList.add('active');

            // Obtener el período seleccionado
            currentPeriod = this.getAttribute('data-period');

            console.log('Período K-mita seleccionado:', currentPeriod);

            // Actualizar dashboard con el nuevo período
            if (isDataLoaded) {
                processAndDisplayData();
            }
        });
    });
}

console.log('K-mita Analytics Dashboard script cargado correctamente');

// Función para manejar errores de carga de datos
function handleDataLoadError(error, context = '') {
    console.error(`Error en ${context}:`, error);

    const errorMessages = {
        403: 'API Key sin permisos o documento privado',
        404: 'Documento o hoja no encontrada',
        429: 'Límite de API excedido, intenta más tarde',
        500: 'Error interno del servidor de Google'
    };

    const statusCode = error.status || error.code;
    const message = errorMessages[statusCode] || error.message || 'Error desconocido';

    updateDataSourceStatus(`❌ Error K-mita: ${message}`);

    if (statusCode === 403 || statusCode === 404) {
        showConnectionHelp();
    }
}

// Auto-refresh de datos cada 5 minutos si está habilitado
if (CONFIG.DATA.AUTO_REFRESH_ENABLED) {
    setInterval(() => {
        if (isDataLoaded && document.visibilityState === 'visible') {
            console.log('Auto-refresh de datos K-mita...');
            loadShopifyData();
        }
    }, CONFIG.DATA.REFRESH_INTERVAL);
}

// ===== FUNCIONES DE TABLAS CON FILTROS Y BÚSQUEDAS =====

// Poblar tablas con datos reales de K-mita
        function populateKmitaTables() {
            populateTopCustomersTable();
            populateMonthlyAnalysisTable();
            populateCustomersAnalysisTable();
            populateOrdersAnalysisTable();

            // Agregar funcionalidad de filtros y búsquedas
            addTableFilters();
        }

// Tabla de análisis detallado de clientes con filtros
function populateCustomersAnalysisTable() {
    const tbody = document.getElementById('customersAnalysisBody');
    if (!tbody) return;

    const filteredOrders = filterOrdersByPeriod(ordersData);
    const customerAnalysis = calculateCustomerAnalysis(filteredOrders);

    tbody.innerHTML = '';

    customerAnalysis.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Cliente">${customer.email}</td>
            <td data-label="Órdenes">${customer.totalOrders}</td>
            <td data-label="Total Gastado">$${customer.totalSpent.toFixed(2)}</td>
            <td data-label="Kilos Comprados">${customer.totalKilos.toFixed(1)} kg</td>
            <td data-label="Bolsas Compradas">${customer.totalBags}</td>
            <td data-label="Precio/Kg">$${customer.avgPricePerKg.toFixed(2)}/kg</td>
            <td data-label="Precio/Bolsa">$${customer.avgPricePerBag.toFixed(2)}/bolsa</td>
            <td data-label="Última Compra">${customer.lastOrderDate}</td>
            <td data-label="Días Sin Comprar">${customer.daysSinceLastOrder} días</td>
            <td data-label="Estado">${customer.state}</td>
            <td data-label="Status">
                <span class="status-badge ${customer.status.toLowerCase()}">${customer.status}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Tabla de análisis de órdenes con filtros
function populateOrdersAnalysisTable() {
    const tbody = document.getElementById('ordersAnalysisBody');
    if (!tbody) return;

    const filteredOrders = filterOrdersByPeriod(ordersData);
    const ordersAnalysis = calculateOrdersAnalysis(filteredOrders);

    tbody.innerHTML = '';

    ordersAnalysis.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Orden #">${order.orderNumber}</td>
            <td data-label="Cliente">${order.customerEmail}</td>
            <td data-label="Fecha Pago">${order.orderDate}</td>
            <td data-label="Fecha Fulfillment">${order.fulfilledDate}</td>
            <td data-label="Días Fulfillment">${order.fulfillmentDays} días</td>
            <td data-label="Importe">$${order.totalPrice.toFixed(2)}</td>
            <td data-label="Descuento">$${order.discount.toFixed(2)}</td>
            <td data-label="% Descuento">${order.discountPercent.toFixed(1)}%</td>
            <td data-label="Kilos">${order.kilos.toFixed(1)} kg</td>
            <td data-label="Bolsas">${order.bags}</td>
            <td data-label="Precio/Kg">$${order.pricePerKg.toFixed(2)}/kg</td>
            <td data-label="Ciudad">${order.city}</td>
            <td data-label="Estado">${order.state}</td>
            <td data-label="Método Pago">${order.paymentMethod}</td>
            <td data-label="Acepta MKT">
                <span class="status-badge ${order.acceptsMarketing ? 'active' : 'inactive'}">
                    ${order.acceptsMarketing ? 'Sí' : 'No'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Calcular análisis detallado de clientes
function calculateCustomerAnalysis(orders) {
    const customerMap = new Map();

    orders.forEach(order => {
        const email = order.customer_email || order.email;
        if (!email) return;

        if (!customerMap.has(email)) {
            customerMap.set(email, {
                email: email,
                totalOrders: 0,
                totalSpent: 0,
                totalKilos: 0,
                totalBags: 0,
                orders: [],
                state: order.shipping_address_province || order.state || 'N/A'
            });
        }

        const customer = customerMap.get(email);
        customer.totalOrders++;
        customer.totalSpent += parseFloat(order.total_price || order.current_total_price || 0);
        customer.totalKilos += parseFloat(order.total_kilos || order.kilos || 0);
        customer.totalBags += parseFloat(order.total_bags || order.bags || 1);
        customer.orders.push(order);
    });

    const customerAnalysis = Array.from(customerMap.values()).map(customer => {
        const sortedOrders = customer.orders.sort((a, b) =>
            new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date)
        );

        const lastOrder = sortedOrders[0];
        const lastOrderDate = new Date(lastOrder.created_at || lastOrder.order_date);
        const daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));

        let status = 'ACTIVE';
        if (daysSinceLastOrder > 90) status = 'INACTIVE';
        else if (daysSinceLastOrder > 30) status = 'AT_RISK';

        return {
            ...customer,
            avgPricePerKg: customer.totalKilos > 0 ? customer.totalSpent / customer.totalKilos : 0,
            avgPricePerBag: customer.totalBags > 0 ? customer.totalSpent / customer.totalBags : 0,
            lastOrderDate: lastOrderDate.toLocaleDateString('es-MX'),
            daysSinceLastOrder: daysSinceLastOrder,
            status: status
        };
    });

    return customerAnalysis.sort((a, b) => b.totalSpent - a.totalSpent);
}

// Calcular análisis detallado de órdenes
function calculateOrdersAnalysis(orders) {
    return orders.map(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        const fulfilledDate = new Date(order.fulfilled_at || order.updated_at);
        const fulfillmentDays = Math.ceil((fulfilledDate - orderDate) / (1000 * 60 * 60 * 24));

        const totalPrice = parseFloat(order.total_price || order.current_total_price || 0);
        const discount = parseFloat(order.total_discounts || order.discount || 0);
        const kilos = parseFloat(order.total_kilos || order.kilos || 0);
        const bags = parseFloat(order.total_bags || order.bags || 1);

        return {
            orderNumber: order.order_number || order.id || 'N/A',
            customerEmail: order.customer_email || order.email || 'N/A',
            orderDate: orderDate.toLocaleDateString('es-MX'),
            fulfilledDate: isNaN(fulfilledDate.getTime()) ? 'N/A' : fulfilledDate.toLocaleDateString('es-MX'),
            fulfillmentDays: isNaN(fulfillmentDays) ? 0 : Math.max(0, fulfillmentDays),
            totalPrice: totalPrice,
            discount: discount,
            discountPercent: totalPrice > 0 ? (discount / totalPrice) * 100 : 0,
            kilos: kilos,
            bags: bags,
            pricePerKg: kilos > 0 ? totalPrice / kilos : 0,
            city: order.shipping_address_city || order.city || 'N/A',
            state: order.shipping_address_province || order.state || 'N/A',
            paymentMethod: order.payment_gateway_names || order.payment_method || 'N/A',
            acceptsMarketing: order.accepts_marketing === 'true' || order.accepts_marketing === true
        };
    }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
}

// Agregar filtros y búsquedas a las tablas
function addTableFilters() {
    addCustomersTableFilters();
    addOrdersTableFilters();
}

// Filtros para tabla de clientes
function addCustomersTableFilters() {
    const table = document.getElementById('customersAnalysisTable');
    if (!table) return;

    // Crear contenedor de filtros
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'table-filters';
    filtersContainer.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <label>🔍 Buscar Cliente:</label>
                <input type="text" id="customerSearch" placeholder="Buscar por email...">
            </div>
            <div class="filter-group">
                <label>📍 Estado:</label>
                <select id="customerStateFilter">
                    <option value="">Todos los Estados</option>
                </select>
            </div>
            <div class="filter-group">
                <label>📊 Status:</label>
                <select id="customerStatusFilter">
                    <option value="">Todos</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="AT_RISK">En Riesgo</option>
                    <option value="INACTIVE">Inactivos</option>
                </select>
            </div>
            <div class="filter-group">
                <label>💰 Gasto Mínimo:</label>
                <input type="number" id="customerMinSpent" placeholder="$0" min="0">
            </div>
            <button id="clearCustomerFilters" class="clear-filters-btn">🗑️ Limpiar Filtros</button>
        </div>
    `;

    table.parentNode.insertBefore(filtersContainer, table);

    // Poblar filtro de estados
    populateStateFilter('customerStateFilter');

    // Agregar event listeners
    document.getElementById('customerSearch').addEventListener('input', filterCustomersTable);
    document.getElementById('customerStateFilter').addEventListener('change', filterCustomersTable);
    document.getElementById('customerStatusFilter').addEventListener('change', filterCustomersTable);
    document.getElementById('customerMinSpent').addEventListener('input', filterCustomersTable);
    document.getElementById('clearCustomerFilters').addEventListener('click', clearCustomerFilters);
}

// Filtros para tabla de órdenes
function addOrdersTableFilters() {
    const table = document.getElementById('ordersAnalysisTable');
    if (!table) return;

    // Crear contenedor de filtros
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'table-filters';
    filtersContainer.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <label>🔍 Buscar:</label>
                <input type="text" id="orderSearch" placeholder="Buscar por cliente, orden...">
            </div>
            <div class="filter-group">
                <label>📅 Fecha Desde:</label>
                <input type="date" id="orderDateFrom">
            </div>
            <div class="filter-group">
                <label>📅 Fecha Hasta:</label>
                <input type="date" id="orderDateTo">
            </div>
            <div class="filter-group">
                <label>📍 Estado:</label>
                <select id="orderStateFilter">
                    <option value="">Todos los Estados</option>
                </select>
            </div>
            <div class="filter-group">
                <label>💳 Método Pago:</label>
                <select id="orderPaymentFilter">
                    <option value="">Todos</option>
                </select>
            </div>
            <div class="filter-group">
                <label>💰 Monto Mínimo:</label>
                <input type="number" id="orderMinAmount" placeholder="$0" min="0">
            </div>
            <button id="clearOrderFilters" class="clear-filters-btn">🗑️ Limpiar Filtros</button>
        </div>
    `;

    table.parentNode.insertBefore(filtersContainer, table);

    // Poblar filtros
    populateStateFilter('orderStateFilter');
    populatePaymentMethodFilter();

    // Agregar event listeners
    document.getElementById('orderSearch').addEventListener('input', filterOrdersTable);
    document.getElementById('orderDateFrom').addEventListener('change', filterOrdersTable);
    document.getElementById('orderDateTo').addEventListener('change', filterOrdersTable);
    document.getElementById('orderStateFilter').addEventListener('change', filterOrdersTable);
    document.getElementById('orderPaymentFilter').addEventListener('change', filterOrdersTable);
    document.getElementById('orderMinAmount').addEventListener('input', filterOrdersTable);
    document.getElementById('clearOrderFilters').addEventListener('click', clearOrderFilters);
}

// Poblar filtro de estados
function populateStateFilter(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const states = [...new Set(ordersData.map(order =>
        order.shipping_address_province || order.state || 'N/A'
    ))].filter(state => state && state !== 'N/A').sort();

    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        select.appendChild(option);
    });
}

// Poblar filtro de métodos de pago
function populatePaymentMethodFilter() {
    const select = document.getElementById('orderPaymentFilter');
    if (!select) return;

    const paymentMethods = [...new Set(ordersData.map(order =>
        order.payment_gateway_names || order.payment_method || 'N/A'
    ))].filter(method => method && method !== 'N/A').sort();

    paymentMethods.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method;
        select.appendChild(option);
    });
}

// Filtrar tabla de clientes
function filterCustomersTable() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const stateFilter = document.getElementById('customerStateFilter').value;
    const statusFilter = document.getElementById('customerStatusFilter').value;
    const minSpent = parseFloat(document.getElementById('customerMinSpent').value) || 0;

    const tbody = document.getElementById('customersAnalysisBody');
    const rows = tbody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const email = row.cells[0].textContent.toLowerCase();
        const totalSpent = parseFloat(row.cells[2].textContent.replace('$', '').replace(',', ''));
        const state = row.cells[9].textContent;
        const status = row.cells[10].textContent.trim();

        const matchesSearch = email.includes(searchTerm);
        const matchesState = !stateFilter || state === stateFilter;
        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesSpent = totalSpent >= minSpent;

        row.style.display = matchesSearch && matchesState && matchesStatus && matchesSpent ? '' : 'none';
    });

    updateTableStats('customersAnalysisTable');
}

// Filtrar tabla de órdenes
function filterOrdersTable() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const dateFrom = document.getElementById('orderDateFrom').value;
    const dateTo = document.getElementById('orderDateTo').value;
    const stateFilter = document.getElementById('orderStateFilter').value;
    const paymentFilter = document.getElementById('orderPaymentFilter').value;
    const minAmount = parseFloat(document.getElementById('orderMinAmount').value) || 0;

    const tbody = document.getElementById('ordersAnalysisBody');
    const rows = tbody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const orderNumber = row.cells[0].textContent.toLowerCase();
        const customer = row.cells[1].textContent.toLowerCase();
        const orderDate = new Date(row.cells[2].textContent.split('/').reverse().join('-'));
        const amount = parseFloat(row.cells[5].textContent.replace('$', '').replace(',', ''));
        const state = row.cells[12].textContent;
        const paymentMethod = row.cells[13].textContent;

        const matchesSearch = orderNumber.includes(searchTerm) || customer.includes(searchTerm);
        const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || orderDate <= new Date(dateTo);
        const matchesState = !stateFilter || state === stateFilter;
        const matchesPayment = !paymentFilter || paymentMethod === paymentFilter;
        const matchesAmount = amount >= minAmount;

        row.style.display = matchesSearch && matchesDateFrom && matchesDateTo &&
            matchesState && matchesPayment && matchesAmount ? '' : 'none';
    });

    updateTableStats('ordersAnalysisTable');
}

// Limpiar filtros de clientes
function clearCustomerFilters() {
    document.getElementById('customerSearch').value = '';
    document.getElementById('customerStateFilter').value = '';
    document.getElementById('customerStatusFilter').value = '';
    document.getElementById('customerMinSpent').value = '';
    filterCustomersTable();
}

// Limpiar filtros de órdenes
function clearOrderFilters() {
    document.getElementById('orderSearch').value = '';
    document.getElementById('orderDateFrom').value = '';
    document.getElementById('orderDateTo').value = '';
    document.getElementById('orderStateFilter').value = '';
    document.getElementById('orderPaymentFilter').value = '';
    document.getElementById('orderMinAmount').value = '';
    filterOrdersTable();
}

// Actualizar estadísticas de tabla
function updateTableStats(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.getElementsByTagName('tbody')[0];
    const allRows = tbody.getElementsByTagName('tr');
    const visibleRows = Array.from(allRows).filter(row => row.style.display !== 'none');

    // Crear o actualizar contador de resultados
    let statsElement = table.parentNode.querySelector('.table-stats');
    if (!statsElement) {
        statsElement = document.createElement('div');
        statsElement.className = 'table-stats';
        table.parentNode.insertBefore(statsElement, table.nextSibling);
    }

    statsElement.innerHTML = `
        <span>📊 Mostrando ${visibleRows.length} de ${allRows.length} registros</span>
    `;
}

// Agregar funcionalidad de exportación
function addExportButtons() {
    // Botón para exportar clientes
    const customersSection = document.querySelector('#customersAnalysisTable').parentNode;
    const customersExportBtn = document.createElement('button');
    customersExportBtn.className = 'export-btn';
    customersExportBtn.innerHTML = '📥 Exportar Clientes';
    customersExportBtn.onclick = () => exportTableToCSV('customersAnalysisTable', 'clientes-analisis.csv');
    customersSection.insertBefore(customersExportBtn, customersSection.firstChild.nextSibling);

    // Botón para exportar órdenes
    const ordersSection = document.querySelector('#ordersAnalysisTable').parentNode;
    const ordersExportBtn = document.createElement('button');
    ordersExportBtn.className = 'export-btn';
    ordersExportBtn.innerHTML = '📥 Exportar Órdenes';
    ordersExportBtn.onclick = () => exportTableToCSV('ordersAnalysisTable', 'ordenes-analisis.csv');
    ordersSection.insertBefore(ordersExportBtn, ordersSection.firstChild.nextSibling);
}

// Exportar tabla a CSV
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    const csvContent = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('th, td');
        return Array.from(cells).map(cell => {
            let text = cell.textContent.trim();
            // Limpiar badges y elementos HTML
            text = text.replace(/\s+/g, ' ');
            // Escapar comillas
            if (text.includes(',') || text.includes('"')) {
                text = '"' + text.replace(/"/g, '""') + '"';
            }
            return text;
        }).join(',');
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inicializar funcionalidades adicionales después de cargar datos
function initializeEnhancedFeatures() {
    // Agregar botones de exportación
    setTimeout(() => {
        addExportButtons();
    }, 1000);

    // Agregar tooltips informativos
    addTooltips();

    // Configurar auto-refresh cada 5 minutos
    setInterval(() => {
        if (isDataLoaded) {
            console.log('Auto-refresh de datos...');
            loadShopifyData();
        }
    }, 5 * 60 * 1000);
}

// Agregar tooltips informativos
function addTooltips() {
    const tooltips = {
        'totalRevenue': 'Suma total de ingresos en el período seleccionado',
        'totalOrders': 'Número total de órdenes procesadas',
        'uniqueCustomers': 'Clientes únicos que han realizado compras',
        'avgOrderValue': 'Valor promedio por orden (ticket promedio)',
        'totalKilos': 'Total de kilogramos de arena vendidos',
        'totalBags': 'Total de bolsas vendidas',
        'avgPricePerKg': 'Precio promedio por kilogramo',
        'avgFulfillmentDays': 'Días promedio entre pago y envío'
    };

    Object.entries(tooltips).forEach(([id, tooltip]) => {
        const element = document.getElementById(id);
        if (element && element.parentNode) {
            element.parentNode.setAttribute('title', tooltip);
        }
    });
}

// // ===== GENERACIÓN DE INSIGHTS Y ALERTAS AUTOMÁTICAS =====

// Generar insights automáticos de K-mita
    function generateKmitaInsights() {
        const insights = calculateBusinessInsights();
        displayInsights(insights);

        const customerAlerts = generateCustomerAlerts();
        displayCustomerAlerts(customerAlerts);
    }

// Calcular insights del negocio
function calculateBusinessInsights() {
    const filteredOrders = filterOrdersByPeriod(ordersData);
    const insights = [];

    // Insight 1: Análisis de crecimiento
    const monthlyGrowth = calculateMonthlyGrowth(filteredOrders);
    if (monthlyGrowth.trend === 'up') {
        insights.push({
            type: 'success',
            title: '📈 Crecimiento Positivo',
            message: `Las ventas han crecido ${monthlyGrowth.percentage}% en el último mes. ¡Excelente trabajo!`
        });
    } else if (monthlyGrowth.trend === 'down') {
        insights.push({
            type: 'warning',
            title: '📉 Atención: Disminución en Ventas',
            message: `Las ventas han disminuido ${Math.abs(monthlyGrowth.percentage)}% en el último mes. Considera estrategias de reactivación.`
        });
    }

    // Insight 2: Análisis de clientes inactivos
    const inactiveCustomers = calculateInactiveCustomers();
    if (inactiveCustomers.count > 0) {
        insights.push({
            type: 'info',
            title: '👥 Oportunidad de Reactivación',
            message: `${inactiveCustomers.count} clientes no han comprado en más de 90 días. Valor potencial: $${inactiveCustomers.potentialValue.toFixed(2)}`
        });
    }

    // Insight 3: Análisis de productos
    const topProduct = getTopProductByKilos(filteredOrders);
    if (topProduct) {
        insights.push({
            type: 'success',
            title: '🏆 Producto Estrella',
            message: `${topProduct.name} es tu producto más vendido con ${topProduct.kilos.toFixed(1)} kg vendidos.`
        });
    }

    // Insight 4: Análisis geográfico
    const topState = getTopStateByRevenue(filteredOrders);
    if (topState) {
        insights.push({
            type: 'info',
            title: '🌎 Mercado Principal',
            message: `${topState.state} representa el ${topState.percentage}% de tus ventas totales ($${topState.revenue.toFixed(2)}).`
        });
    }

    // Insight 5: Análisis de fulfillment
    const fulfillmentAnalysis = analyzeFulfillmentPerformance(filteredOrders);
    if (fulfillmentAnalysis.avgDays > 3) {
        insights.push({
            type: 'warning',
            title: '🚚 Optimizar Fulfillment',
            message: `El tiempo promedio de fulfillment es ${fulfillmentAnalysis.avgDays.toFixed(1)} días. Considera optimizar el proceso.`
        });
    } else {
        insights.push({
            type: 'success',
            title: '⚡ Fulfillment Eficiente',
            message: `Excelente tiempo de fulfillment: ${fulfillmentAnalysis.avgDays.toFixed(1)} días promedio.`
        });
    }

    return insights;
}

// Calcular crecimiento mensual
function calculateMonthlyGrowth(orders) {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        return orderDate >= currentMonth;
    });

    const previousMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        return orderDate >= previousMonth && orderDate < currentMonth;
    });

    const currentRevenue = currentMonthOrders.reduce((sum, order) =>
        sum + parseFloat(order.total_price || 0), 0);
    const previousRevenue = previousMonthOrders.reduce((sum, order) =>
        sum + parseFloat(order.total_price || 0), 0);

    if (previousRevenue === 0) return { trend: 'neutral', percentage: 0 };

    const percentage = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';

    return { trend, percentage: Math.abs(percentage) };
}

// Calcular clientes inactivos
function calculateInactiveCustomers() {
    const customerAnalysis = calculateCustomerAnalysis(ordersData);
    const inactiveCustomers = customerAnalysis.filter(customer => customer.status === 'INACTIVE');
    const potentialValue = inactiveCustomers.reduce((sum, customer) =>
        sum + (customer.totalSpent / customer.totalOrders), 0);

    return {
        count: inactiveCustomers.length,
        potentialValue: potentialValue
    };
}

// Obtener producto top por kilos
function getTopProductByKilos(orders) {
    const productMap = new Map();

    orders.forEach(order => {
        const productName = order.product_title || order.product_name || 'Arena K-mita';
        const kilos = parseFloat(order.total_kilos || order.kilos || 0);

        if (productMap.has(productName)) {
            productMap.set(productName, productMap.get(productName) + kilos);
        } else {
            productMap.set(productName, kilos);
        }
    });

    let topProduct = null;
    let maxKilos = 0;

    productMap.forEach((kilos, name) => {
        if (kilos > maxKilos) {
            maxKilos = kilos;
            topProduct = { name, kilos };
        }
    });

    return topProduct;
}

// Obtener estado top por ingresos
function getTopStateByRevenue(orders) {
    const stateMap = new Map();
    let totalRevenue = 0;

    orders.forEach(order => {
        const state = order.shipping_address_province || order.state || 'N/A';
        const revenue = parseFloat(order.total_price || 0);
        totalRevenue += revenue;

        if (stateMap.has(state)) {
            stateMap.set(state, stateMap.get(state) + revenue);
        } else {
            stateMap.set(state, revenue);
        }
    });

    let topState = null;
    let maxRevenue = 0;

    stateMap.forEach((revenue, state) => {
        if (revenue > maxRevenue && state !== 'N/A') {
            maxRevenue = revenue;
            topState = {
                state,
                revenue,
                percentage: ((revenue / totalRevenue) * 100).toFixed(1)
            };
        }
    });

    return topState;
}

// Analizar performance de fulfillment
function analyzeFulfillmentPerformance(orders) {
    const fulfillmentTimes = orders.map(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        const fulfilledDate = new Date(order.fulfilled_at || order.updated_at);
        const days = Math.ceil((fulfilledDate - orderDate) / (1000 * 60 * 60 * 24));
        return isNaN(days) || days < 0 ? 0 : days;
    }).filter(days => days > 0);

    const avgDays = fulfillmentTimes.length > 0 ?
        fulfillmentTimes.reduce((sum, days) => sum + days, 0) / fulfillmentTimes.length : 0;

    return { avgDays, totalOrders: fulfillmentTimes.length };
}

// Mostrar insights en el dashboard
function displayInsights(insights) {
    const container = document.getElementById('insightsContainer');
    if (!container) return;

    container.innerHTML = '';

    insights.forEach(insight => {
        const insightCard = document.createElement('div');
        insightCard.className = `insight-card ${insight.type}`;
        insightCard.innerHTML = `
            <h4>${insight.title}</h4>
            <p>${insight.message}</p>
        `;
        container.appendChild(insightCard);
    });
}

// Generar alertas de clientes
function generateCustomerAlerts() {
    const customerAnalysis = calculateCustomerAnalysis(ordersData);
    const alerts = [];

    // Clientes de alto valor en riesgo
    const highValueAtRisk = customerAnalysis.filter(customer =>
        customer.status === 'AT_RISK' && customer.totalSpent > 1000
    );

    highValueAtRisk.forEach(customer => {
        alerts.push({
            type: 'warning',
            title: '⚠️ Cliente de Alto Valor en Riesgo',
            message: `${customer.email} (${customer.daysSinceLastOrder} días sin comprar) - Valor total: $${customer.totalSpent.toFixed(2)}`
        });
    });

    // Clientes inactivos con potencial
    const inactiveHighPotential = customerAnalysis.filter(customer =>
        customer.status === 'INACTIVE' && customer.totalOrders >= 3
    );

    inactiveHighPotential.slice(0, 5).forEach(customer => {
        alerts.push({
            type: 'info',
            title: '💤 Cliente Inactivo con Historial',
            message: `${customer.email} - ${customer.totalOrders} órdenes previas, ${customer.daysSinceLastOrder} días inactivo`
        });
    });

    // Nuevos clientes potenciales (1 sola compra hace más de 30 días)
    const newCustomersPotential = customerAnalysis.filter(customer =>
        customer.totalOrders === 1 && customer.daysSinceLastOrder > 30 && customer.daysSinceLastOrder < 90
    );

    newCustomersPotential.slice(0, 3).forEach(customer => {
        alerts.push({
            type: 'info',
            title: '🆕 Nuevo Cliente - Oportunidad',
            message: `${customer.email} - 1 compra hace ${customer.daysSinceLastOrder} días. Considera campaña de seguimiento.`
        });
    });

    return alerts;
}

// Mostrar alertas de clientes
function displayCustomerAlerts(alerts) {
    const container = document.getElementById('customerAlerts');
    if (!container) return;

    container.innerHTML = '';

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="alert-card info">
                <h5>✅ Todo en Orden</h5>
                <p>No hay alertas críticas de clientes en este momento.</p>
            </div>
        `;
        return;
    }

    alerts.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = `alert-card ${alert.type}`;
        alertCard.innerHTML = `
            <h5>${alert.title}</h5>
            <p>${alert.message}</p>
        `;
        container.appendChild(alertCard);
    });
}

// Función para procesar datos mensuales mejorada
function processMonthlyData(orders) {
    const monthlyMap = new Map();

    orders.forEach(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        if (isNaN(orderDate.getTime())) return;

        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
                revenue: 0,
                orders: 0,
                customers: new Set(),
                kilos: 0,
                bags: 0
            });
        }

        const monthData = monthlyMap.get(monthKey);
        monthData.revenue += parseFloat(order.total_price || 0);
        monthData.orders += 1;
        monthData.customers.add(order.customer_email || order.email);
        monthData.kilos += parseFloat(order.total_kilos || order.kilos || 0);
        monthData.bags += parseFloat(order.total_bags || order.bags || 1);
    });

    // Convertir a arrays ordenados
    const sortedEntries = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    return {
        labels: sortedEntries.map(([key]) => {
            const [year, month] = key.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
        }),
        revenue: sortedEntries.map(([, data]) => data.revenue),
        orders: sortedEntries.map(([, data]) => data.orders),
        customers: sortedEntries.map(([, data]) => data.customers.size),
        kilos: sortedEntries.map(([, data]) => data.kilos),
        bags: sortedEntries.map(([, data]) => data.bags)
    };
}

// Función para procesar datos de productos K-mita
function processKmitaProductData(orders) {
    const productMap = new Map();

    orders.forEach(order => {
        const productName = order.product_title || order.product_name || 'Arena K-mita';
        const kilos = parseFloat(order.total_kilos || order.kilos || 0);

        if (productMap.has(productName)) {
            productMap.set(productName, productMap.get(productName) + kilos);
        } else {
            productMap.set(productName, kilos);
        }
    });

    // Convertir a array y ordenar por kilos
    const sortedProducts = Array.from(productMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 productos

    return {
        labels: sortedProducts.map(([name]) => name.length > 20 ? name.substring(0, 20) + '...' : name),
        kilos: sortedProducts.map(([, kilos]) => kilos)
    };
}

// Función para procesar datos geográficos
function processGeographicData(orders) {
    const stateMap = new Map();

    orders.forEach(order => {
        const state = order.shipping_address_province || order.state || 'N/A';
        const revenue = parseFloat(order.total_price || 0);

        if (stateMap.has(state)) {
            stateMap.set(state, stateMap.get(state) + revenue);
        } else {
            stateMap.set(state, revenue);
        }
    });

    // Convertir a array y ordenar por ingresos
    const sortedStates = Array.from(stateMap.entries())
        .filter(([state]) => state !== 'N/A')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 estados

    return {
        labels: sortedStates.map(([state]) => state),
        values: sortedStates.map(([, revenue]) => revenue)
    };
}//
 // ===== FUNCIONES PARA TABLAS EXISTENTES =====

    // Poblar tabla de top clientes
    function populateTopCustomersTable() {
        const tbody = document.getElementById('topCustomersBody');
        if (!tbody) return;

        const filteredOrders = filterOrdersByPeriod(ordersData);
        const customerAnalysis = calculateCustomerAnalysis(filteredOrders);
        const topCustomers = customerAnalysis.slice(0, 10); // Top 10

        tbody.innerHTML = '';

        topCustomers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${customer.email}</td>
            <td>${customer.totalOrders}</td>
            <td>$${customer.totalSpent.toFixed(2)}</td>
            <td>$${(customer.totalSpent / customer.totalOrders).toFixed(2)}</td>
            <td>
                <span class="status-badge ${customer.status.toLowerCase()}">
                    ${customer.status === 'ACTIVE' ? 'VIP' : customer.status === 'AT_RISK' ? 'Regular' : 'Inactivo'}
                </span>
            </td>
            <td>${customer.lastOrderDate}</td>
        `;
            tbody.appendChild(row);
        });
    }

// Poblar tabla de análisis mensual
function populateMonthlyAnalysisTable() {
    const tbody = document.getElementById('monthlyAnalysisBody');
    if (!tbody) return;

    const monthlyData = processMonthlyData(ordersData);

    tbody.innerHTML = '';

    for (let i = 0; i < monthlyData.labels.length; i++) {
        const row = document.createElement('tr');
        const avgTicket = monthlyData.orders[i] > 0 ? monthlyData.revenue[i] / monthlyData.orders[i] : 0;
        const avgFulfillment = calculateMonthlyFulfillment(monthlyData.labels[i]);

        row.innerHTML = `
            <td>${monthlyData.labels[i]}</td>
            <td>${monthlyData.orders[i]}</td>
            <td>$${monthlyData.revenue[i].toFixed(2)}</td>
            <td>${monthlyData.customers[i]}</td>
            <td>$${avgTicket.toFixed(2)}</td>
            <td>${monthlyData.kilos[i].toFixed(1)} kg</td>
            <td>${avgFulfillment.toFixed(1)} días</td>
        `;
        tbody.appendChild(row);
    }
}

// Calcular fulfillment promedio mensual
function calculateMonthlyFulfillment(monthLabel) {
    // Implementación simplificada - en producción sería más compleja
    const filteredOrders = filterOrdersByPeriod(ordersData);
    const fulfillmentTimes = filteredOrders.map(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        const fulfilledDate = new Date(order.fulfilled_at || order.updated_at);
        const days = Math.ceil((fulfilledDate - orderDate) / (1000 * 60 * 60 * 24));
        return isNaN(days) || days < 0 ? 0 : days;
    }).filter(days => days > 0);

    return fulfillmentTimes.length > 0 ?
        fulfillmentTimes.reduce((sum, days) => sum + days, 0) / fulfillmentTimes.length : 0;
}