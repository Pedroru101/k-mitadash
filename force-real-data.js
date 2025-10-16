// ═══════════════════════════════════════════════════════════════════════════════════
// 🔧 FORZAR DATOS REALES - Sin Fallback a sample-data.json
// ═══════════════════════════════════════════════════════════════════════════════════

// Configuración
const SHEET_ID = '1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0';
const ORDERS_SHEET = 'Orders_Data';
const CUSTOMERS_SHEET = 'Customers_Data';

// Variables globales
let ordersData = [];
let customersData = [];
let isDataLoaded = false;

// ═══════════════════════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL: CARGAR DATOS REALES (SIN FALLBACK)
// ═══════════════════════════════════════════════════════════════════════════════════

async function loadRealDataOnly() {
    console.log('🔄 [REAL DATA] Cargando SOLO datos reales de Google Sheets...');
    console.log(`📋 [REAL DATA] SHEET_ID: ${SHEET_ID}`);
    
    try {
        // Construir URLs
        const ordersURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(ORDERS_SHEET)}`;
        const customersURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(CUSTOMERS_SHEET)}`;
        
        console.log(`🌐 [REAL DATA] Orders URL: ${ordersURL}`);
        console.log(`🌐 [REAL DATA] Customers URL: ${customersURL}`);
        
        // Cargar órdenes
        console.log('📊 [REAL DATA] Cargando órdenes...');
        const ordersResponse = await fetch(ordersURL);
        
        if (!ordersResponse.ok) {
            throw new Error(`❌ Error ${ordersResponse.status}: No se pudo cargar Orders_Data. 
            
            SOLUCIÓN:
            1. Abre: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit
            2. Haz clic en "Compartir"
            3. Cambia a "Cualquiera con el enlace puede ver"
            4. Guarda y recarga esta página
            `);
        }
        
        const ordersCSV = await ordersResponse.text();
        ordersData = parseCSV(ordersCSV);
        
        console.log(`✅ [REAL DATA] Órdenes cargadas: ${ordersData.length}`);
        
        // Cargar clientes
        console.log('👥 [REAL DATA] Cargando clientes...');
        const customersResponse = await fetch(customersURL);
        
        if (!customersResponse.ok) {
            console.warn(`⚠️ [REAL DATA] No se pudo cargar Customers_Data (${customersResponse.status})`);
            console.log('ℹ️ [REAL DATA] Calculando clientes desde órdenes...');
            customersData = calculateCustomersFromOrders(ordersData);
        } else {
            const customersCSV = await customersResponse.text();
            customersData = parseCSV(customersCSV);
            console.log(`✅ [REAL DATA] Clientes cargados: ${customersData.length}`);
        }
        
        isDataLoaded = true;
        
        console.log('🎉 [REAL DATA] Datos reales cargados exitosamente!');
        console.log(`📊 [REAL DATA] Total: ${ordersData.length} órdenes, ${customersData.length} clientes`);
        
        // Mostrar primeras órdenes para verificar
        if (ordersData.length > 0) {
            console.log('📋 [REAL DATA] Primera orden:', ordersData[0]);
        }
        
        return { ordersData, customersData };
        
    } catch (error) {
        console.error('❌ [REAL DATA] Error cargando datos:', error);
        
        // Mostrar mensaje de error al usuario
        showErrorMessage(`
            <h2>❌ No se pudieron cargar los datos reales</h2>
            <p><strong>Error:</strong> ${error.message}</p>
            <h3>Soluciones:</h3>
            <ol>
                <li>Verifica que tu Google Sheet sea público:
                    <br><a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit" target="_blank">Abrir Google Sheet</a>
                </li>
                <li>Haz clic en "Compartir" → "Cualquiera con el enlace puede ver"</li>
                <li>Recarga esta página (Ctrl+Shift+R)</li>
            </ol>
            <h3>Herramientas de diagnóstico:</h3>
            <ul>
                <li><a href="/test-connection.html">Test de Conexión</a></li>
                <li><a href="/verificar-datos.html">Verificar Datos</a></li>
                <li><a href="/extraer-segmentacion.html">Ver Segmentación Real</a></li>
            </ul>
        `);
        
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════════

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });
        data.push(row);
    }
    
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result;
}

function calculateCustomersFromOrders(orders) {
    const customersMap = new Map();
    
    orders.forEach(order => {
        const email = order.customer_email;
        if (!email) return;
        
        if (!customersMap.has(email)) {
            customersMap.set(email, {
                customer_id: order.customer_id || '',
                email: email,
                orders_count: 0,
                total_spent: 0,
                first_order: order.created_at,
                last_order: order.created_at
            });
        }
        
        const customer = customersMap.get(email);
        customer.orders_count++;
        customer.total_spent += parseFloat(order.total_price || 0);
        
        if (order.created_at < customer.first_order) {
            customer.first_order = order.created_at;
        }
        if (order.created_at > customer.last_order) {
            customer.last_order = order.created_at;
        }
    });
    
    // Calcular segmento
    return Array.from(customersMap.values()).map(customer => {
        let segment = 'New';
        if (customer.orders_count === 1) segment = 'One-time';
        else if (customer.orders_count === 2) segment = 'Repeat';
        else if (customer.orders_count >= 3) segment = 'Loyal';
        
        return {
            ...customer,
            customer_segment: segment
        };
    });
}

function showErrorMessage(html) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        max-width: 600px;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = html;
    document.body.appendChild(errorDiv);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// EXPORTAR
// ═══════════════════════════════════════════════════════════════════════════════════

window.loadRealDataOnly = loadRealDataOnly;
window.getRealOrders = () => ordersData;
window.getRealCustomers = () => customersData;
window.isRealDataLoaded = () => isDataLoaded;

console.log('✅ [REAL DATA] Módulo de datos reales cargado');
console.log('📋 [REAL DATA] Usa loadRealDataOnly() para cargar datos');
