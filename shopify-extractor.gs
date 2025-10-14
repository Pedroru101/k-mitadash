// ═══════════════════════════════════════════════════════════════════════════════════
// 🐈 K-MITA SHOPIFY DATA EXTRACTOR - GOOGLE APPS SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════════
// Script para replicar el flujo de n8n: extracción automática de datos de Shopify
// a Google Sheets cada 6 horas
//
// Funcionalidades:
// - Extrae órdenes de Shopify mes por mes para 2025
// - Procesa métricas calculadas (kilos, bolsas, etc.)
// - Extrae datos de clientes
// - Maneja paginación automática
// - Actualiza Google Sheets sin duplicados
//
// ═══════════════════════════════════════════════════════════════════════════════════

// ===========================================
// CONFIGURACIÓN Y CONSTANTES
// ===========================================

/**
 * Función principal que orquesta todo el proceso de sincronización
 */
function runShopifySync() {
  console.log('[K-MITA SYNC] Iniciando sincronización de datos Shopify...');

  try {
    // 1. Cargar configuración
    const config = getConfiguration();
    console.log('[K-MITA SYNC] Configuración cargada para tienda:', config.storeName);

    // 2. Generar rangos de fechas mensuales para 2025
    const dateRanges = generateMonthlyDateRanges();
    console.log(`[K-MITA SYNC] Procesando ${dateRanges.length} meses de 2025`);

    // 3. Procesar órdenes para cada mes
    for (const range of dateRanges) {
      console.log(`[K-MITA SYNC] Procesando órdenes para ${range.monthName}...`);
      fetchAndProcessOrdersForMonth(config, range);
    }

    // 4. Procesar clientes de 2025
    console.log('[K-MITA SYNC] Órdenes completadas. Iniciando extracción de clientes...');
    fetchAndProcessCustomers(config);

    console.log('[K-MITA SYNC] ✅ Sincronización completada exitosamente');

  } catch (error) {
    console.error('[K-MITA SYNC] ❌ Error en sincronización:', error);
    throw error;
  }
}

/**
 * Obtiene la configuración desde Properties del script
 */
function getConfiguration() {
  const scriptProperties = PropertiesService.getScriptProperties();

  const config = {
    storeName: scriptProperties.getProperty('SHOPIFY_STORE_NAME'),
    apiToken: scriptProperties.getProperty('SHOPIFY_API_TOKEN'),
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    apiVersion: '2024-10'
  };

  // Validar configuración
  if (!config.storeName || !config.apiToken) {
    throw new Error('Configuración incompleta. Verifica SHOPIFY_STORE_NAME y SHOPIFY_API_TOKEN en Properties');
  }

  return config;
}

// ===========================================
// GENERACIÓN DE RANGOS DE FECHAS
// ===========================================

/**
 * Genera rangos de fechas mensuales para 2025 hasta el mes actual
 */
function generateMonthlyDateRanges() {
  const months = [];
  const year = 2025;
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Enero, 11 = Diciembre
  const currentYear = now.getFullYear();

  // Si aún no es 2025, no procesar nada
  if (currentYear < year) {
    console.log('[K-MITA SYNC] Aún no es 2025, omitiendo procesamiento');
    return [];
  }

  // Procesar desde enero hasta el mes actual
  const maxMonth = (currentYear === year) ? currentMonth : 11;

  for (let month = 0; month <= maxMonth; month++) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // Ajustar fecha fin si es el mes actual
    const actualEndDate = (endDate > now) ? now : endDate;

    months.push({
      start: startDate.toISOString(),
      end: actualEndDate.toISOString(),
      monthKey: `${year}-${(month + 1).toString().padStart(2, '0')}`,
      monthName: startDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    });
  }

  return months;
}

// ===========================================
// UTILIDADES PARA API DE SHOPIFY
// ===========================================

/**
 * Función genérica para obtener todos los resultados paginados de Shopify
 */
function fetchAllPaginatedResults(initialUrl, config) {
  let allItems = [];
  let nextUrl = initialUrl;

  const options = {
    'method': 'get',
    'headers': {
      'X-Shopify-Access-Token': config.apiToken,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions': true
  };

  let pageCount = 0;

  while (nextUrl) {
    pageCount++;
    console.log(`[K-MITA SYNC] Procesando página ${pageCount}...`);

    const response = UrlFetchApp.fetch(nextUrl, options);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      throw new Error(`Error API Shopify (${responseCode}): ${response.getContentText()}`);
    }

    const data = JSON.parse(response.getContentText());

    // Determinar el tipo de recurso (orders o customers)
    const resourceKey = Object.keys(data).find(key => Array.isArray(data[key]));
    if (resourceKey && data[resourceKey].length > 0) {
      allItems = allItems.concat(data[resourceKey]);
      console.log(`[K-MITA SYNC] Página ${pageCount}: ${data[resourceKey].length} items encontrados`);
    }

    // Extraer URL de siguiente página del header Link
    nextUrl = null;
    const linkHeader = response.getHeaders().Link || response.getHeaders().link;

    if (linkHeader) {
      const links = linkHeader.split(',');
      const nextLink = links.find(link => link.includes('rel="next"'));

      if (nextLink) {
        const match = nextLink.match(/<([^>]+)>/);
        if (match) {
          nextUrl = match[1];
        }
      }
    }

    // Pausa para respetar límites de API
    if (nextUrl) {
      Utilities.sleep(500); // 500ms entre páginas
    }
  }

  console.log(`[K-MITA SYNC] Total items obtenidos: ${allItems.length} en ${pageCount} páginas`);
  return allItems;
}

// ===========================================
// PROCESAMIENTO DE ÓRDENES
// ===========================================

/**
 * Procesa órdenes para un mes específico
 */
function fetchAndProcessOrdersForMonth(config, range) {
  const initialUrl = `https://${config.storeName}.myshopify.com/admin/api/${config.apiVersion}/orders.json?status=any&limit=250&created_at_min=${range.start}&created_at_max=${range.end}`;

  console.log(`[K-MITA SYNC] Consultando órdenes: ${range.start} - ${range.end}`);

  const orders = fetchAllPaginatedResults(initialUrl, config);

  if (orders.length === 0) {
    console.log(`[K-MITA SYNC] No se encontraron órdenes para ${range.monthName}`);
    return;
  }

  console.log(`[K-MITA SYNC] Procesando ${orders.length} órdenes para ${range.monthName}`);

  const processedData = processShopifyOrders(orders, range.monthKey);
  writeDataToSheet('Monthly_Analysis - Orders_Data', processedData, 0);

  console.log(`[K-MITA SYNC] Órdenes de ${range.monthName} procesadas: ${orders.length} registros`);
}

/**
 * Procesa datos de órdenes de Shopify al formato de Google Sheets
 */
function processShopifyOrders(orders, monthKey) {
  console.log('[K-MITA SYNC] Transformando datos de órdenes...');

  const headers = [
    'order_id', 'order_name', 'created_at', 'updated_at', 'processed_at',
    'fulfillment_created_at', 'financial_status', 'fulfillment_status',
    'total_price', 'total_discounts', 'total_tax', 'total_bags', 'total_kilos',
    'customer_id', 'customer_email', 'accepts_marketing',
    'shipping_city', 'shipping_province', 'shipping_country',
    'payment_method', 'month_key'
  ];

  const dataRows = orders.map(order => {
    // Calcular métricas de productos
    const lineItems = order.line_items || [];
    const totalBags = lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalKilos = lineItems.reduce((sum, item) => {
      const grams = item.grams || 0;
      const quantity = item.quantity || 0;
      return sum + (grams * quantity / 1000);
    }, 0);

    // Información de envío
    const shippingAddress = order.shipping_address || {};
    const billingAddress = order.billing_address || {};

    // Método de pago (de transacciones)
    const transactions = order.transactions || [];
    const paymentTransaction = transactions.find(t => t.kind === 'sale' || t.kind === 'capture');
    const paymentMethod = paymentTransaction ? paymentTransaction.gateway : null;

    return [
      order.id,
      order.name,
      order.created_at,
      order.updated_at,
      order.processed_at,
      order.fulfillment_created_at || order.processed_at,
      order.financial_status,
      order.fulfillment_status,
      parseFloat(order.total_price || 0),
      parseFloat(order.total_discounts || 0),
      parseFloat(order.total_tax || 0),
      totalBags,
      Math.round(totalKilos * 100) / 100, // Redondear a 2 decimales
      order.customer ? order.customer.id : null,
      order.customer ? order.customer.email : null,
      order.customer ? order.customer.accepts_marketing : null,
      shippingAddress.city || billingAddress.city,
      shippingAddress.province || billingAddress.province,
      shippingAddress.country || billingAddress.country,
      paymentMethod,
      monthKey
    ];
  });

  return [headers, ...dataRows];
}

// ===========================================
// PROCESAMIENTO DE CLIENTES
// ===========================================

/**
 * Procesa todos los clientes creados en 2025
 */
function fetchAndProcessCustomers(config) {
  const startDate = '2025-01-01T00:00:00Z';
  const initialUrl = `https://${config.storeName}.myshopify.com/admin/api/${config.apiVersion}/customers.json?limit=250&created_at_min=${startDate}`;

  console.log('[K-MITA SYNC] Consultando clientes creados desde 2025...');

  const customers = fetchAllPaginatedResults(initialUrl, config);

  if (customers.length === 0) {
    console.log('[K-MITA SYNC] No se encontraron clientes nuevos en 2025');
    return;
  }

  console.log(`[K-MITA SYNC] Procesando ${customers.length} clientes`);

  const processedData = processShopifyCustomers(customers);
  writeDataToSheet('Monthly_Analysis - Customers_Data', processedData, 0);

  console.log(`[K-MITA SYNC] Clientes procesados: ${customers.length} registros`);
}

/**
 * Procesa datos de clientes de Shopify al formato de Google Sheets
 */
function processShopifyCustomers(customers) {
  console.log('[K-MITA SYNC] Transformando datos de clientes...');

  const headers = [
    'customer_id', 'email', 'first_name', 'last_name', 'phone',
    'created_at', 'updated_at', 'orders_count', 'total_spent',
    'customer_segment', 'accepts_marketing', 'marketing_opt_in_level',
    'address_city', 'address_province', 'address_country',
    'last_order_date', 'days_since_last_order'
  ];

  const dataRows = customers.map(customer => {
    // Determinar segmento basado en orders_count
    let segment = 'New';
    const ordersCount = customer.orders_count || 0;

    if (ordersCount === 1) segment = 'One-time';
    else if (ordersCount === 2) segment = 'Repeat';
    else if (ordersCount >= 3 && ordersCount < 10) segment = 'Loyal';
    else if (ordersCount >= 10) segment = 'VIP';

    // Dirección principal
    const mainAddress = (customer.addresses && customer.addresses.length > 0) ? customer.addresses[0] : {};

    // Calcular días desde último pedido
    let daysSinceLastOrder = null;
    if (customer.last_order && customer.last_order.created_at) {
      const lastOrderDate = new Date(customer.last_order.created_at);
      const now = new Date();
      daysSinceLastOrder = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24));
    }

    return [
      customer.id,
      customer.email,
      customer.first_name,
      customer.last_name,
      customer.phone,
      customer.created_at,
      customer.updated_at,
      ordersCount,
      parseFloat(customer.total_spent || 0),
      segment,
      customer.accepts_marketing,
      customer.marketing_opt_in_level,
      mainAddress.city,
      mainAddress.province,
      mainAddress.country,
      customer.last_order ? customer.last_order.created_at : null,
      daysSinceLastOrder
    ];
  });

  return [headers, ...dataRows];
}

// ===========================================
// UTILIDADES PARA GOOGLE SHEETS
// ===========================================

/**
 * Escribe datos en una pestaña específica, reemplazando todo el contenido
 */
function writeDataToSheet(sheetName, data, primaryKeyColumnIndex) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  // Crear la pestaña si no existe
  if (!sheet) {
    console.log(`[K-MITA SYNC] Creando nueva pestaña: ${sheetName}`);
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (data.length === 0) {
    console.log(`[K-MITA SYNC] No hay datos para escribir en ${sheetName}`);
    return;
  }

  // Limpiar hoja existente y escribir nuevos datos
  sheet.clear();
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  console.log(`[K-MITA SYNC] ✅ ${data.length - 1} filas escritas en "${sheetName}"`);

  // Auto-resize columns para mejor visualización
  sheet.autoResizeColumns(1, data[0].length);
}

// ===========================================
// FUNCIONES DE TESTING Y DEBUG
// ===========================================

/**
 * Función de prueba para verificar conectividad con Shopify
 */
function testShopifyConnection() {
  console.log('[K-MITA TEST] Probando conexión con Shopify...');

  try {
    const config = getConfiguration();
    const testUrl = `https://${config.storeName}.myshopify.com/admin/api/${config.apiVersion}/shop.json`;

    const options = {
      'method': 'get',
      'headers': {
        'X-Shopify-Access-Token': config.apiToken,
        'Content-Type': 'application/json'
      },
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(testUrl, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 200) {
      const shopData = JSON.parse(response.getContentText());
      console.log('[K-MITA TEST] ✅ Conexión exitosa. Tienda:', shopData.shop.name);
      console.log('[K-MITA TEST] ✅ Plan:', shopData.shop.plan_display_name);
    } else {
      console.error(`[K-MITA TEST] ❌ Error de conexión (${responseCode}):`, response.getContentText());
    }

  } catch (error) {
    console.error('[K-MITA TEST] ❌ Error en prueba de conexión:', error);
  }
}

/**
 * Función para limpiar todas las pestañas (usar con cuidado)
 */
function clearAllData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['Monthly_Analysis - Orders_Data', 'Monthly_Analysis - Customers_Data'];

  sheets.forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      sheet.clear();
      console.log(`[K-MITA CLEANUP] Pestaña "${sheetName}" limpiada`);
    }
  });
}

// ===========================================
// MENÚ PARA EL EDITOR DE APPS SCRIPT
// ===========================================

/**
 * Crea un menú personalizado en la hoja de cálculo
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🐈 K-mita Sync')
    .addItem('🔄 Ejecutar Sincronización', 'runShopifySync')
    .addItem('🔍 Probar Conexión', 'testShopifyConnection')
    .addSeparator()
    .addItem('🧹 Limpiar Datos', 'clearAllData')
    .addToUi();
}

console.log('🐈 K-mita Shopify Extractor loaded successfully');