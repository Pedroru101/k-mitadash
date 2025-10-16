// ═══════════════════════════════════════════════════════════════════════════════════
// 🎨 FIX: Mover leyendas de gráficos de dona al lado derecho
// ═══════════════════════════════════════════════════════════════════════════════════

// Este script se ejecuta después de que se cargan los gráficos
// y actualiza la posición de las leyendas de 'bottom' a 'right'

(function () {
    console.log('🎨 [LEGEND FIX] Aplicando corrección de posición de leyendas...');

    // Esperar a que Chart.js esté disponible
    function waitForChartJS() {
        if (typeof Chart === 'undefined') {
            console.log('⏳ [LEGEND FIX] Esperando Chart.js...');
            setTimeout(waitForChartJS, 100);
            return;
        }

        console.log('✅ [LEGEND FIX] Chart.js detectado');
        applyLegendFix();
    }

    function applyLegendFix() {
        // Configuración global para todos los gráficos de dona
        if (Chart.defaults && Chart.defaults.plugins && Chart.defaults.plugins.legend) {
            const originalPosition = Chart.defaults.plugins.legend.position;
            console.log(`📊 [LEGEND FIX] Posición original: ${originalPosition}`);

            // No cambiar la configuración global, solo para gráficos específicos
        }

        // Interceptar la creación de gráficos
        const originalChartConstructor = Chart;

        // Observar cuando se crean nuevos gráficos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'CANVAS') {
                        checkAndFixChart(node);
                    }
                });
            });
        });

        // Observar el documento
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Verificar gráficos existentes
        setTimeout(() => {
            const canvases = document.querySelectorAll('canvas');
            console.log(`🔍 [LEGEND FIX] Encontrados ${canvases.length} canvas`);

            canvases.forEach(canvas => {
                checkAndFixChart(canvas);
            });
        }, 2000);
    }

    function checkAndFixChart(canvas) {
        // Verificar si es un gráfico de dona (segmentación o métodos de pago)
        const chartId = canvas.id;

        if (chartId.includes('Segment') ||
            chartId.includes('segment') ||
            chartId.includes('payment') ||
            chartId.includes('Payment') ||
            chartId.includes('customer') ||
            chartId.includes('Customer')) {

            console.log(`🎯 [LEGEND FIX] Gráfico de dona detectado: ${chartId}`);

            // Intentar obtener la instancia del gráfico
            const chart = Chart.getChart(canvas);

            if (chart && chart.config.type === 'doughnut') {
                console.log(`🔧 [LEGEND FIX] Actualizando posición de leyenda para: ${chartId}`);

                // Actualizar la configuración
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.position = 'right';
                    chart.update();
                    console.log(`✅ [LEGEND FIX] Leyenda movida a la derecha: ${chartId}`);
                }
            }
        }
    }

    // Iniciar
    waitForChartJS();

    console.log('✅ [LEGEND FIX] Script de corrección de leyendas cargado');
})();
