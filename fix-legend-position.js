// ═══════════════════════════════════════════════════════════════════════════════════
// 🎨 FIX: Mover leyendas de gráficos de dona al lado derecho
// ═══════════════════════════════════════════════════════════════════════════════════

(function () {
    console.log('🎨 [LEGEND FIX] Script de corrección de leyendas cargado');

    // Esperar a que Chart.js y el DOM estén listos
    function waitForChartJS() {
        if (typeof window.Chart === 'undefined') {
            setTimeout(waitForChartJS, 100);
            return;
        }
        console.log('✅ [LEGEND FIX] Chart.js detectado');
        applyLegendFix();
    }

    function applyLegendFix() {
        // Verificar gráficos existentes después de un delay
        setTimeout(() => {
            const canvases = document.querySelectorAll('canvas');
            console.log(`🔍 [LEGEND FIX] Encontrados ${canvases.length} canvas`);
            canvases.forEach(checkAndFixChart);
        }, 2000);

        // Observar nuevos gráficos
        if (document.body) {
            const observer = new window.MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.tagName === 'CANVAS') {
                                checkAndFixChart(node);
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    function checkAndFixChart(canvas) {
        if (!canvas || !canvas.id) return;

        const chartId = canvas.id;
        const isDoughnutChart = chartId.includes('Segment') ||
            chartId.includes('segment') ||
            chartId.includes('payment') ||
            chartId.includes('Payment') ||
            chartId.includes('customer') ||
            chartId.includes('Customer');

        if (isDoughnutChart && typeof window.Chart !== 'undefined') {
            const chart = window.Chart.getChart(canvas);
            if (chart && chart.config && chart.config.type === 'doughnut') {
                if (chart.options && chart.options.plugins && chart.options.plugins.legend) {
                    // Posición de la leyenda a la derecha
                    chart.options.plugins.legend.position = 'right';
                    
                    // Ajustes estéticos: más separación y mejor alineación
                    chart.options.plugins.legend.align = 'center';
                    chart.options.plugins.legend.labels = {
                        ...chart.options.plugins.legend.labels,
                        padding: 20,        // Más espacio entre items de la leyenda
                        boxWidth: 15,       // Tamaño de los cuadrados de color
                        boxHeight: 15,
                        font: {
                            size: 12
                        }
                    };
                    
                    // Ajustar layout para MUCHA más separación entre gráfico y leyenda
                    chart.options.layout = {
                        ...chart.options.layout,
                        padding: {
                            left: 10,
                            right: 80,      // MUCHO más espacio a la derecha para separar la leyenda
                            top: 20,
                            bottom: 20
                        }
                    };
                    
                    chart.update();
                    console.log(`✅ [LEGEND FIX] Leyenda ajustada: ${chartId}`);
                }
            }
        }
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForChartJS);
    } else {
        waitForChartJS();
    }
})();
