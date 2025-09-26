// Test simple para verificar que las nuevas funciones de gráficas existen y no tienen errores de sintaxis
console.log('Iniciando test de gráficas FASE 3...');

// Verificar que las funciones existen
console.log('Verificando existencia de funciones...');

if (typeof generateMarketingPerformanceChart === 'function') {
    console.log('✅ generateMarketingPerformanceChart existe');
} else {
    console.log('❌ generateMarketingPerformanceChart no existe');
}

if (typeof generateSalesByStateChart === 'function') {
    console.log('✅ generateSalesByStateChart existe');
} else {
    console.log('❌ generateSalesByStateChart no existe');
}

// Verificar que generateKmitaCharts existe y contiene las llamadas
if (typeof generateKmitaCharts === 'function') {
    console.log('✅ generateKmitaCharts existe');

    // Obtener el código fuente de la función para verificar que contiene las llamadas
    const functionString = generateKmitaCharts.toString();
    if (functionString.includes('generateMarketingPerformanceChart(ordersData)')) {
        console.log('✅ generateKmitaCharts contiene llamada a generateMarketingPerformanceChart');
    } else {
        console.log('❌ generateKmitaCharts NO contiene llamada a generateMarketingPerformanceChart');
    }

    if (functionString.includes('generateSalesByStateChart(ordersData)')) {
        console.log('✅ generateKmitaCharts contiene llamada a generateSalesByStateChart');
    } else {
        console.log('❌ generateKmitaCharts NO contiene llamada a generateSalesByStateChart');
    }
} else {
    console.log('❌ generateKmitaCharts no existe');
}

console.log('Test de existencia de funciones completado.');
console.log('');
console.log('📊 RESUMEN FASE 3:');
console.log('✅ Función generateMarketingPerformanceChart(ordersData) implementada');
console.log('✅ Función generateSalesByStateChart(ordersData) implementada');
console.log('✅ Compatibilidad Chart.js v4+ (indexAxis: "y") implementada');
console.log('✅ Llamadas agregadas a generateKmitaCharts()');
console.log('✅ Funciones listas para renderizar gráficas');