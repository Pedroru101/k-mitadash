// ═══════════════════════════════════════════════════════════════════════════════════
// 🔍 VERIFICADOR DE FUENTE DE DATOS - K-mita Dashboard
// ═══════════════════════════════════════════════════════════════════════════════════
// 
// Este script agrega logs detallados para verificar:
// 1. De dónde vienen los datos (Google Sheets vs sample-data.json)
// 2. Cuántos registros se cargan
// 3. Si hay duplicados
// 4. Métricas calculadas vs esperadas
// 
// ═══════════════════════════════════════════════════════════════════════════════════

(function() {
    console.log('%c🔍 [VERIFY] Verificador de fuente de datos cargado', 'color: #3b82f6; font-weight: bold; font-size: 14px;');

    // Interceptar la función loadShopifyData original
    const originalLoadShopifyData = window.loadShopifyData;
    
    if (typeof originalLoadShopifyData === 'function') {
        window.loadShopifyData = async function() {
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6;');
            console.log('%c🔍 [VERIFY] INICIANDO VERIFICACIÓN DE FUENTE DE DATOS', 'color: #3b82f6; font-weight: bold; font-size: 16px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6;');
            
            const startTime = Date.now();
            
            try {
                // Llamar a la función original
                await originalLoadShopifyData.call(this);
                
                const endTime = Date.now();
                const loadTime = endTime - startTime;
                
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
                console.log('%c✅ [VERIFY] VERIFICACIÓN COMPLETADA', 'color: #10b981; font-weight: bold; font-size: 16px;');
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
                
                // Verificar datos cargados
                verifyLoadedData(loadTime);
                
            } catch (error) {
                console.error('%c❌ [VERIFY] Error en verificación:', 'color: #ef4444; font-weight: bold;', error);
            }
        };
        
        console.log('✅ [VERIFY] Función loadShopifyData interceptada correctamente');
    } else {
        console.warn('⚠️ [VERIFY] No se pudo interceptar loadShopifyData - función no encontrada');
    }

    // Función para verificar datos cargados
    function verifyLoadedData(loadTime) {
        console.log('\n%c📊 [VERIFY] ANÁLISIS DE DATOS CARGADOS', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Verificar si hay datos
        if (typeof ordersData === 'undefined' || !ordersData) {
            console.error('❌ [VERIFY] ordersData no está definido');
            return;
        }
        
        if (typeof customersData === 'undefined' || !customersData) {
            console.error('❌ [VERIFY] customersData no está definido');
            return;
        }
        
        // 1. Información básica
        console.log(`⏱️  Tiempo de carga: ${loadTime}ms`);
        console.log(`📦 Órdenes cargadas: ${ordersData.length}`);
        console.log(`👥 Clientes cargados: ${customersData.length}`);
        
        // 2. Verificar fuente de datos
        console.log('\n%c🔍 [VERIFY] FUENTE DE DATOS', 'color: #f59e0b; font-weight: bold;');
        
        if (ordersData.length === 0) {
            console.error('❌ [VERIFY] No hay órdenes cargadas - posible error de conexión');
            console.log('💡 [VERIFY] Verifica:');
            console.log('   1. Que el Google Sheet sea público');
            console.log('   2. Que el SHEET_ID sea correcto');
            console.log('   3. Que los nombres de las hojas coincidan');
            return;
        }
        
        // Verificar si son datos de muestra (sample-data.json está vacío)
        if (ordersData.length < 10) {
            console.warn('⚠️ [VERIFY] Muy pocas órdenes - posiblemente datos de muestra');
        } else {
            console.log('✅ [VERIFY] Cantidad de órdenes parece correcta');
        }
        
        // 3. Verificar estructura de datos
        console.log('\n%c📋 [VERIFY] ESTRUCTURA DE DATOS', 'color: #06b6d4; font-weight: bold;');
        
        const firstOrder = ordersData[0];
        const orderFields = Object.keys(firstOrder);
        console.log(`📝 Campos en órdenes: ${orderFields.length}`);
        console.log('📋 Campos:', orderFields.join(', '));
        
        // Verificar campos críticos
        const criticalFields = ['order_id', 'total_price', 'total_kilos', 'total_bags', 'customer_email', 'shipping_province'];
        const missingFields = criticalFields.filter(field => !orderFields.includes(field));
        
        if (missingFields.length > 0) {
            console.warn('⚠️ [VERIFY] Campos críticos faltantes:', missingFields);
        } else {
            console.log('✅ [VERIFY] Todos los campos críticos presentes');
        }
        
        // 4. Verificar duplicados
        console.log('\n%c🔍 [VERIFY] VERIFICACIÓN DE DUPLICADOS', 'color: #ec4899; font-weight: bold;');
        
        const orderIds = ordersData.map(o => o.order_id).filter(id => id);
        const uniqueOrderIds = new Set(orderIds);
        const duplicates = orderIds.length - uniqueOrderIds.size;
        
        if (duplicates > 0) {
            console.error(`❌ [VERIFY] Se encontraron ${duplicates} órdenes duplicadas`);
            console.log('💡 [VERIFY] Esto podría estar inflando las cifras');
            
            // Mostrar algunos duplicados
            const idCounts = {};
            orderIds.forEach(id => {
                idCounts[id] = (idCounts[id] || 0) + 1;
            });
            const duplicatedIds = Object.entries(idCounts)
                .filter(([id, count]) => count > 1)
                .slice(0, 5);
            
            console.log('📋 [VERIFY] Ejemplos de IDs duplicados:', duplicatedIds);
        } else {
            console.log('✅ [VERIFY] No se encontraron duplicados');
        }
        
        // 5. Calcular métricas
        console.log('\n%c💰 [VERIFY] MÉTRICAS CALCULADAS', 'color: #10b981; font-weight: bold;');
        
        const totalRevenue = ordersData.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
        const totalKilos = ordersData.reduce((sum, o) => sum + parseFloat(o.total_kilos || 0), 0);
        const totalBags = ordersData.reduce((sum, o) => sum + parseFloat(o.total_bags || 0), 0);
        const avgPricePerKilo = totalKilos > 0 ? totalRevenue / totalKilos : 0;
        const uniqueCustomers = new Set(ordersData.map(o => o.customer_email).filter(e => e)).size;
        
        console.log(`💰 Ingresos Totales: $${totalRevenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
        console.log(`⚖️  Total Kilos: ${totalKilos.toLocaleString()} kg`);
        console.log(`🛍️  Total Bolsas: ${totalBags.toLocaleString()}`);
        console.log(`💵 Precio/kg: $${avgPricePerKilo.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
        console.log(`👥 Clientes Únicos: ${uniqueCustomers.toLocaleString()}`);
        
        // 6. Verificar rangos de valores
        console.log('\n%c📊 [VERIFY] RANGOS DE VALORES', 'color: #f59e0b; font-weight: bold;');
        
        const prices = ordersData.map(o => parseFloat(o.total_price || 0)).filter(p => p > 0);
        const kilos = ordersData.map(o => parseFloat(o.total_kilos || 0)).filter(k => k > 0);
        
        if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            
            console.log(`💰 Precio mínimo: $${minPrice.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
            console.log(`💰 Precio máximo: $${maxPrice.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
            console.log(`💰 Precio promedio: $${avgPrice.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
            
            // Advertencias
            if (maxPrice > 10000) {
                console.warn('⚠️ [VERIFY] Hay órdenes con precios muy altos (>$10,000)');
            }
            if (minPrice < 50) {
                console.warn('⚠️ [VERIFY] Hay órdenes con precios muy bajos (<$50)');
            }
        }
        
        if (kilos.length > 0) {
            const minKilos = Math.min(...kilos);
            const maxKilos = Math.max(...kilos);
            const avgKilos = kilos.reduce((a, b) => a + b, 0) / kilos.length;
            
            console.log(`⚖️  Kilos mínimo: ${minKilos} kg`);
            console.log(`⚖️  Kilos máximo: ${maxKilos} kg`);
            console.log(`⚖️  Kilos promedio: ${avgKilos.toFixed(2)} kg`);
        }
        
        // 7. Análisis por estado
        console.log('\n%c🌎 [VERIFY] ANÁLISIS POR ESTADO', 'color: #8b5cf6; font-weight: bold;');
        
        const stateStats = {};
        ordersData.forEach(order => {
            const state = order.shipping_province || 'Sin estado';
            if (!stateStats[state]) {
                stateStats[state] = { orders: 0, revenue: 0 };
            }
            stateStats[state].orders++;
            stateStats[state].revenue += parseFloat(order.total_price || 0);
        });
        
        const topStates = Object.entries(stateStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);
        
        console.log('🏆 Top 5 Estados por Ingresos:');
        topStates.forEach(([state, stats], index) => {
            console.log(`   ${index + 1}. ${state}: ${stats.orders} órdenes, $${stats.revenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
        });
        
        // 8. Verificar fechas
        console.log('\n%c📅 [VERIFY] RANGO DE FECHAS', 'color: #06b6d4; font-weight: bold;');
        
        const dates = ordersData
            .map(o => o.created_at)
            .filter(d => d)
            .map(d => new Date(d))
            .filter(d => !isNaN(d.getTime()));
        
        if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            
            console.log(`📅 Fecha más antigua: ${minDate.toLocaleDateString('es-MX')}`);
            console.log(`📅 Fecha más reciente: ${maxDate.toLocaleDateString('es-MX')}`);
            console.log(`📅 Rango: ${Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))} días`);
        }
        
        // 9. Resumen final
        console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
        console.log('%c📋 [VERIFY] RESUMEN DE VERIFICACIÓN', 'color: #10b981; font-weight: bold; font-size: 14px;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
        
        console.log(`✅ Órdenes: ${ordersData.length}`);
        console.log(`✅ Clientes: ${customersData.length}`);
        console.log(`${duplicates > 0 ? '❌' : '✅'} Duplicados: ${duplicates}`);
        console.log(`✅ Ingresos: $${totalRevenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
        console.log(`✅ Precio/kg: $${avgPricePerKilo.toLocaleString('es-MX', {minimumFractionDigits: 2})}`);
        
        if (duplicates > 0) {
            console.log('\n%c⚠️ [VERIFY] ADVERTENCIA: Se encontraron duplicados', 'color: #f59e0b; font-weight: bold;');
            console.log('💡 [VERIFY] Esto podría estar inflando las cifras del dashboard');
            console.log('💡 [VERIFY] Revisa el Google Sheet para eliminar duplicados');
        }
        
        console.log('\n%c🔗 [VERIFY] Para más detalles, abre: diagnostico-datos-reales.html', 'color: #3b82f6; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #10b981;');
    }

    console.log('✅ [VERIFY] Verificador de fuente de datos listo');
})();
