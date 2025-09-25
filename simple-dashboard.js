// Dashboard simplificado para K-mita con autenticación y datos reales
console.log('Iniciando dashboard simplificado con datos reales...');

// Credenciales K-mita desde configuración centralizada
const validCredentials = {
    [CONFIG.AUTH.USERNAME]: CONFIG.AUTH.PASSWORD
};

// Estado de autenticación
let isAuthenticated = false;

// Variable para almacenar datos cargados (ahora datos reales de K-mita)
let sampleData = null;

// Función para cargar datos reales desde Google Sheets
async function loadRealData() {
    try {
        updateElement('dataSourceStatus', '🔄 Cargando datos reales de K-mita...');
        
        // Cargar datos de las dos hojas principales usando el mismo sistema del dashboard principal
        const ordersURL = buildGoogleSheetsURL(CONFIG.GOOGLE_SHEETS.ORDERS_SHEET);
        const customersURL = buildGoogleSheetsURL(CONFIG.GOOGLE_SHEETS.CUSTOMERS_SHEET);

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
            throw new Error(`Error cargando órdenes de K-mita: ${ordersResponse.status}`);
        }

        if (!customersResponse.ok) {
            throw new Error(`Error cargando clientes de K-mita: ${customersResponse.status}`);
        }

        // Parsear respuestas CSV de Google Sheets
        const ordersCSV = await ordersResponse.text();
        const customersCSV = await customersResponse.text();

        const ordersData = parseGoogleSheetsCSVResponse(ordersCSV);
        const customersData = parseGoogleSheetsCSVResponse(customersCSV);

        console.log('Datos K-mita procesados:', {
            ordersCount: ordersData.length,
            customersCount: customersData.length
        });

        // Verificar que tenemos datos
        if (ordersData.length === 0 && customersData.length === 0) {
            throw new Error('No hay datos de K-mita en Google Sheets. Verifica la configuración.');
        }

        // Convertir a formato compatible con el dashboard simple
        sampleData = {
            orders: ordersData.map(order => ({
                id: order.order_number || order.id || 'N/A',
                customer: order.customer_email || order.email || 'N/A',
                total: parseFloat(order.total_price || order.current_total_price || 0),
                kilos: parseFloat(order.total_kilos || order.kilos || 0),
                bags: parseFloat(order.total_bags || order.bags || 1),
                paidAt: order.created_at || order.order_date || new Date().toISOString(),
                fulfilledAt: order.fulfilled_at || order.updated_at || new Date().toISOString(),
                discount: parseFloat(order.total_discounts || order.discount || 0),
                city: order.shipping_address_city || order.city || 'N/A',
                state: order.shipping_address_province || order.state || 'N/A',
                paymentMethod: order.payment_gateway_names || order.payment_method || 'N/A',
                acceptsMarketing: order.accepts_marketing === 'true' || order.accepts_marketing === true
            })),
            customers: customersData.map(customer => ({
                name: customer.email || customer.customer_email || 'N/A',
                orders: parseInt(customer.orders_count || customer.total_orders || 1),
                total: parseFloat(customer.total_spent || customer.lifetime_value || 0),
                kilos: parseFloat(customer.total_kilos || 0),
                bags: parseFloat(customer.total_bags || 0),
                segment: customer.tags || 'regular',
                lastPurchase: customer.last_order_date || customer.updated_at || 'N/A',
                daysSinceLastPurchase: customer.days_since_last_order || 0,
                state: customer.state || customer.default_address_province || 'N/A',
                status: customer.days_since_last_order > 90 ? 'inactive' : 
                       customer.days_since_last_order > 30 ? 'at-risk' : 'active'
            }))
        };

        console.log('Datos reales de K-mita cargados exitosamente');
        updateElement('dataSourceStatus', `✅ Datos reales K-mita: ${sampleData.orders.length} órdenes, ${sampleData.customers.length} clientes`);
        
    } catch (error) {
        console.error('Error cargando datos reales:', error);
        updateElement('dataSourceStatus', `❌ Error K-mita: ${error.message}`);
        throw error;
    }
}

// Función para parsear respuesta CSV de Google Sheets (reutilizada del dashboard principal)
function parseGoogleSheetsCSVResponse(csvText) {
    console.log('[DEBUG] Iniciando parseGoogleSheetsCSVResponse');

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
    return data;
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
        
        // Cargar datos del dashboard mejorado
        setTimeout(async () => {
            await updateDashboardEnhanced();
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

// Función mejorada para actualizar dashboard con métricas específicas
async function updateDashboardEnhanced() {
    console.log('Actualizando dashboard mejorado con datos reales...');

    try {
        if (!sampleData) {
            await loadRealData();
        }
        
        // Calcular métricas básicas
        const totalRevenue = sampleData.orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = sampleData.orders.length;
        const uniqueCustomers = sampleData.customers.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Calcular métricas específicas del café
        const totalKilos = sampleData.orders.reduce((sum, order) => sum + order.kilos, 0);
        const totalBags = sampleData.orders.reduce((sum, order) => sum + order.bags, 0);
        const avgPricePerKg = totalKilos > 0 ? totalRevenue / totalKilos : 0;
        
        // Calcular días promedio de fulfillment
        const fulfillmentDays = sampleData.orders.map(order => {
            const paidDate = new Date(order.paidAt);
            const fulfilledDate = new Date(order.fulfilledAt);
            const days = Math.ceil((fulfilledDate - paidDate) / (1000 * 60 * 60 * 24));
            return isNaN(days) || days < 0 ? 0 : days;
        }).filter(days => days > 0);
        
        const avgFulfillmentDays = fulfillmentDays.length > 0 ? 
            fulfillmentDays.reduce((sum, days) => sum + days, 0) / fulfillmentDays.length : 0;
        
        // Actualizar KPIs básicos
        updateElement('totalRevenue', `$${totalRevenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
        updateElement('totalOrders', totalOrders.toString());
        updateElement('uniqueCustomers', uniqueCustomers.toString());
        updateElement('avgOrderValue', `$${avgOrderValue.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
        
        // Actualizar KPIs específicos del café
        updateElement('totalKilos', `${totalKilos.toFixed(1)} kg`);
        updateElement('totalBags', totalBags.toString());
        updateElement('avgPricePerKg', `$${avgPricePerKg.toFixed(2)}/kg`);
        updateElement('avgFulfillmentDays', `${avgFulfillmentDays.toFixed(1)} días`);
        
        // Calcular cambios (simplificado para datos reales)
        updateElement('revenueChange', 'N/A');
        updateElement('ordersChange', 'N/A');
        updateElement('customersChange', 'N/A');
        updateElement('aovChange', 'N/A');
        updateElement('kilosChange', 'N/A');
        updateElement('bagsChange', 'N/A');
        updateElement('priceKgChange', 'N/A');
        updateElement('fulfillmentChange', 'N/A');
        
        console.log('Dashboard actualizado exitosamente con datos reales');
        
    } catch (error) {
        console.error('Error actualizando dashboard:', error);
        updateElement('dataSourceStatus', '❌ Error cargando datos reales');
    }
}

// Función auxiliar para actualizar elementos
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Elemento ${id} no encontrado`);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando sistema con datos reales...');
    
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
    
    // Configurar event listener para refresh
    const refreshButton = document.getElementById('refreshData');
    if (refreshButton) {
        refreshButton.addEventListener('click', async () => { 
            sampleData = null; // Forzar recarga de datos
            await updateDashboardEnhanced(); 
        });
    }
    
    // Mostrar pantalla de login por defecto
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
});

console.log('Script de dashboard con autenticación y datos reales cargado');