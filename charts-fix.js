// Archivo de corrección para las funciones de gráficas de K-mita Dashboard

// Gráfico de tendencia de ventas
function generateSalesTrendChart() {
    const ctx = document.getElementById('salesTrendChart');
    if (!ctx) return;

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

// Gráfico de segmentación de clientes
function generateCustomerSegmentChart() {
    const ctx = document.getElementById('customerSegmentChart');
    if (!ctx) return;

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

// Gráfico geográfico
function generateGeographicChart() {
    const ctx = document.getElementById('geographicChart');
    if (!ctx) return;

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
                label: 'Ventas por región',
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
            },
            scales: {
                x: {
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

// Gráfico de métodos de pago
function generatePaymentMethodsChart() {
    const ctx = document.getElementById('paymentMethodsChart');
    if (!ctx) return;

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
    const ctx = document.getElementById('fulfillmentChart');
    if (!ctx) return;

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
                label: 'Órdenes',
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
                        text: 'Número de Órdenes'
                    }
                }
            }
        }
    });
}

// Gráfico de marketing
function generateMarketingChart() {
    const ctx = document.getElementById('marketingChart');
    if (!ctx) return;

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

console.log('✅ Funciones de gráficas corregidas cargadas');