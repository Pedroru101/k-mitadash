// Script de validación para K-mita Analytics Dashboard
// Ejecutar en la consola del navegador para verificar configuración

console.log('🔍 Iniciando validación de configuración K-mita...');

// Validar que CONFIG esté disponible
if (typeof CONFIG === 'undefined') {
    console.error('❌ CONFIG no está definido. Asegúrate de incluir config.js');
} else {
    console.log('✅ Configuración cargada correctamente');
}

// Validar configuración de Google Sheets (CSV público)
function validateGoogleSheetsConfig() {
    console.log('\n📊 Validando configuración de Google Sheets (CSV público)...');

    const config = CONFIG.GOOGLE_SHEETS;

    if (!config.SHEET_ID) {
        console.error('❌ SHEET_ID no configurado');
        return false;
    }

    // Nota: Ya no se valida API_KEY ya que se usa CSV público
    console.log('ℹ️ Usando CSV export público - no se requiere API key');

    if (!config.ORDERS_SHEET || !config.CUSTOMERS_SHEET) {
        console.error('❌ Nombres de hojas no configurados');
        return false;
    }

    console.log('✅ Configuración de Google Sheets válida');
    console.log(`   Sheet ID: ${config.SHEET_ID}`);
    console.log(`   Orders Sheet: ${config.ORDERS_SHEET}`);
    console.log(`   Customers Sheet: ${config.CUSTOMERS_SHEET}`);

    return true;
}

// Probar conexión a Google Sheets (CSV público)
async function testConnection() {
    console.log('\n🌐 Probando conexión a Google Sheets (CSV público)...');

    try {
        const testURL = buildGoogleSheetsURL(CONFIG.GOOGLE_SHEETS.ORDERS_SHEET);
        console.log(`   URL de prueba: ${testURL}`);

        const response = await fetch(testURL);
        console.log(`   Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            console.log('✅ Conexión exitosa a Google Sheets CSV público');
            return true;
        } else {
            console.error(`❌ Error de conexión: ${response.status}`);

            if (response.status === 403) {
                console.log('💡 Sugerencia: Comparte el documento públicamente en Google Sheets');
                console.log('   Ve a "Compartir" → "Cambiar a cualquier persona con el enlace puede ver"');
            } else if (response.status === 404) {
                console.log('💡 Sugerencia: Verifica el SHEET_ID y nombres de hojas en config.js');
            } else if (response.status === 400) {
                console.log('💡 Sugerencia: El documento puede no estar público o el SHEET_ID es incorrecto');
            }

            return false;
        }
    } catch (error) {
        console.error('❌ Error de red:', error.message);
        return false;
    }
}

// Validar estructura de datos (CSV)
async function validateDataStructure() {
    console.log('\n📋 Validando estructura de datos CSV...');

    try {
        // Probar carga de órdenes
        const ordersURL = buildGoogleSheetsURL(CONFIG.GOOGLE_SHEETS.ORDERS_SHEET);
        const ordersResponse = await fetch(ordersURL);

        if (ordersResponse.ok) {
            const ordersCSV = await ordersResponse.text();
            const lines = ordersCSV.split('\n').filter(line => line.trim());
            const headers = lines[0]?.split(',') || [];

            console.log('✅ Hoja de órdenes encontrada');
            console.log(`   Columnas: ${headers.length}`);
            console.log(`   Filas de datos: ${lines.length - 1}`);

            // Verificar columnas críticas
            const requiredOrderColumns = ['order_id', 'total_price', 'created_at', 'customer_email'];
            const missingColumns = requiredOrderColumns.filter(col => !headers.includes(col));

            if (missingColumns.length > 0) {
                console.warn(`⚠️ Columnas faltantes en órdenes: ${missingColumns.join(', ')}`);
            } else {
                console.log('✅ Todas las columnas críticas de órdenes presentes');
            }
        }

        // Probar carga de clientes
        const customersURL = buildGoogleSheetsURL(CONFIG.GOOGLE_SHEETS.CUSTOMERS_SHEET);
        const customersResponse = await fetch(customersURL);

        if (customersResponse.ok) {
            const customersCSV = await customersResponse.text();
            const lines = customersCSV.split('\n').filter(line => line.trim());
            const headers = lines[0]?.split(',') || [];

            console.log('✅ Hoja de clientes encontrada');
            console.log(`   Columnas: ${headers.length}`);
            console.log(`   Filas de datos: ${lines.length - 1}`);

            // Verificar columnas críticas
            const requiredCustomerColumns = ['customer_id', 'email', 'total_spent', 'orders_count'];
            const missingColumns = requiredCustomerColumns.filter(col => !headers.includes(col));

            if (missingColumns.length > 0) {
                console.warn(`⚠️ Columnas faltantes en clientes: ${missingColumns.join(', ')}`);
            } else {
                console.log('✅ Todas las columnas críticas de clientes presentes');
            }
        }

    } catch (error) {
        console.error('❌ Error validando estructura:', error);
    }
}

// Ejecutar validación completa
async function runFullValidation() {
    console.log('🚀 Ejecutando validación completa de K-mita Dashboard...\n');
    
    const configValid = validateGoogleSheetsConfig();
    
    if (configValid) {
        const connectionOk = await testConnection();
        
        if (connectionOk) {
            await validateDataStructure();
        }
    }
    
    console.log('\n🏁 Validación completada. Revisa los mensajes arriba para cualquier problema.');
    console.log('\n💡 Para ejecutar esta validación, copia y pega en la consola:');
    console.log('   runFullValidation()');
}

// Función de ayuda para debugging
function debugKmitaData() {
    console.log('\n🔍 Debug de datos K-mita:');
    console.log('Orders Data:', ordersData?.slice(0, 3));
    console.log('Customers Data:', customersData?.slice(0, 3));
    console.log('Data Loaded:', isDataLoaded);
    console.log('Last Update:', lastDataUpdate);
}

// Exportar funciones para uso en consola
window.validateKmitaSetup = runFullValidation;
window.debugKmitaData = debugKmitaData;
window.testKmitaConnection = testConnection;

console.log('✅ Script de validación K-mita cargado');
console.log('💡 Ejecuta validateKmitaSetup() para validar la configuración');