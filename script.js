// Cargar y procesar datos
let productsData = [];

async function loadData() {
    try {
        // Intentar cargar desde archivo primero
        try {
            const response = await fetch('shopify.jon.json');
            if (response.ok) {
                productsData = await response.json();
            } else {
                throw new Error('No se pudo cargar el archivo');
            }
        } catch (fetchError) {
            console.log('Cargando datos embebidos...');
            // Si falla, usar datos embebidos
            await loadEmbeddedData();
        }
        
        // Procesar datos y generar gráficas
        processData();
        generateCharts();
        populateTable();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        showErrorMessage();
    }
}

async function loadEmbeddedData() {
    // Datos embebidos directamente en el código
    productsData = [
        {
            "id": 7882790404335,
            "title": "a) 3 kg de arena biodegradable",
            "vendor": "k-mita",
            "status": "active",
            "tags": "",
            "variants": [{"price": "176.00", "inventory_quantity": 1041, "weight": 3}]
        },
        {
            "id": 7677679173871,
            "title": "b) 6 kg de arena biodegradable",
            "vendor": "k-mita",
            "status": "active",
            "tags": "",
            "variants": [{"price": "319.00", "inventory_quantity": 902, "weight": 6}]
        },
        {
            "id": 6893270302873,
            "title": "c) 10 kg de arena biodegradable",
            "vendor": "k-mita",
            "status": "active",
            "tags": "Promo",
            "variants": [{"price": "494.00", "inventory_quantity": 683, "weight": 12}]
        },
        {
            "id": 7830254452975,
            "title": "d) 20 kilos de arena biodegradable",
            "vendor": "k-mita",
            "status": "active",
            "tags": "Promo",
            "variants": [{"price": "868.00", "inventory_quantity": 958, "weight": 26}]
        },
        {
            "id": 5633343094937,
            "title": "e) 30 kilos de arena biodegradable",
            "vendor": "k-mita",
            "status": "active",
            "tags": "Promo",
            "variants": [{"price": "1095.00", "inventory_quantity": 390, "weight": 30}]
        },
        {
            "id": 7677686022383,
            "title": "f) 60 kg arena biodegradable Kmita",
            "vendor": "k-mita",
            "status": "active",
            "tags": "",
            "variants": [{"price": "2095.00", "inventory_quantity": -133, "weight": 60}]
        },
        {
            "id": 7677703880943,
            "title": "g) 120 kg de arena biodegradable",
            "vendor": "k-mita",
            "status": "active",
            "tags": "",
            "variants": [{"price": "3550.00", "inventory_quantity": -15, "weight": 120}]
        },
        {
            "id": 7677711319279,
            "title": "h) Paquete Gold 18 Bolsas de 10 kg de arena biodegradable",
            "vendor": "k-mita",
            "status": "active",
            "tags": "",
            "variants": [{"price": "4990.00", "inventory_quantity": -10, "weight": 180}]
        },
        {
            "id": 8704129499375,
            "title": "Suscripción Mensual / 30 kilos de arena biodegradable",
            "vendor": "k-mita",
            "status": "archived",
            "tags": "Plan a suscripción",
            "variants": [{"price": "385.00", "inventory_quantity": 18, "weight": 30}]
        },
        {
            "id": 8704134709487,
            "title": "Suscripción Mensual / 60 kilos de arena biodegradable",
            "vendor": "k-mita",
            "status": "archived",
            "tags": "Plan a suscripción",
            "variants": [{"price": "565.00", "inventory_quantity": 78, "weight": 60}]
        },
        {
            "id": 8704143753455,
            "title": "Suscripción Mensual / 80 kilos de arena biodegradable",
            "vendor": "k-mita",
            "status": "archived",
            "tags": "Plan a suscripción",
            "variants": [{"price": "0.00", "inventory_quantity": 0, "weight": 80}]
        },
        {
            "id": 5554860785817,
            "title": "x) Arena Biodegradable para Gato 10 kg",
            "vendor": "k-mita",
            "status": "active",
            "tags": "",
            "variants": [{"price": "494.00", "inventory_quantity": 0, "weight": 10}]
        },
        {
            "id": 7466183557359,
            "title": "x) Arena Biodegradable para Gato 2 bolsas de 10kg",
            "vendor": "k-mita",
            "status": "active",
            "tags": "",
            "variants": [{"price": "868.00", "inventory_quantity": 0, "weight": 20}]
        }
    ];
}

function showErrorMessage() {
    document.querySelector('.container').innerHTML = `
        <div style="text-align: center; color: white; padding: 50px;">
            <h2>⚠️ Error cargando datos</h2>
            <p>Para ver el dashboard completo, ejecuta:</p>
            <code style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; display: inline-block; margin: 10px;">
                python server.py
            </code>
            <p>O abre el archivo desde un servidor web local</p>
        </div>
    `;
}

function processData() {
    // Calcular estadísticas generales
    const totalProducts = productsData.length;
    const totalInventory = productsData.reduce((sum, product) => {
        return sum + (product.variants[0]?.inventory_quantity || 0);
    }, 0);
    
    const avgPrice = productsData.reduce((sum, product) => {
        return sum + parseFloat(product.variants[0]?.price || 0);
    }, 0) / totalProducts;
    
    const activeProducts = productsData.filter(p => p.status === 'active').length;
    
    // Actualizar estadísticas en el DOM
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalInventory').textContent = totalInventory.toLocaleString();
    document.getElementById('avgPrice').textContent = `$${avgPrice.toFixed(2)}`;
    document.getElementById('activeProducts').textContent = activeProducts;
}

function extractWeight(title) {
    // Extraer peso del título (ej: "3 kg", "10 kg", etc.)
    const match = title.match(/(\d+)\s*kg/i);
    return match ? parseInt(match[1]) : 0;
}

function generateCharts() {
    generatePriceWeightChart();
    generateInventoryChart();
    generatePriceDistributionChart();
    generateStatusChart();
    generatePricePerKgChart();
    generatePromoChart();
    generateWeightDistributionChart();
    generateYearCreationChart();
    generateInventoryAnalysisChart();
    generatePremiumEconomicChart();
}

function generatePriceWeightChart() {
    const ctx = document.getElementById('priceWeightChart').getContext('2d');
    
    const data = productsData.map(product => {
        const weight = extractWeight(product.title);
        const price = parseFloat(product.variants[0]?.price || 0);
        return {
            x: weight,
            y: price,
            label: product.title.substring(0, 30) + '...'
        };
    }).filter(item => item.x > 0);

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Productos',
                data: data,
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw.label}: ${context.raw.x}kg - $${context.raw.y}`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Peso (kg)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Precio ($)'
                    }
                }
            }
        }
    });
}

function generateInventoryChart() {
    const ctx = document.getElementById('inventoryChart').getContext('2d');
    
    const activeProducts = productsData.filter(p => p.status === 'active');
    const labels = activeProducts.map(p => p.title.substring(0, 20) + '...');
    const inventoryData = activeProducts.map(p => p.variants[0]?.inventory_quantity || 0);
    
    const colors = inventoryData.map(qty => {
        if (qty < 100) return 'rgba(239, 68, 68, 0.8)';
        if (qty < 500) return 'rgba(245, 158, 11, 0.8)';
        return 'rgba(34, 197, 94, 0.8)';
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Inventario',
                data: inventoryData,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        text: 'Cantidad en Stock'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function generatePriceDistributionChart() {
    const ctx = document.getElementById('priceDistributionChart').getContext('2d');
    
    const prices = productsData.map(p => parseFloat(p.variants[0]?.price || 0));
    const ranges = [
        { label: '$0-200', min: 0, max: 200 },
        { label: '$201-500', min: 201, max: 500 },
        { label: '$501-1000', min: 501, max: 1000 },
        { label: '$1001-2000', min: 1001, max: 2000 },
        { label: '$2000+', min: 2001, max: Infinity }
    ];
    
    const distribution = ranges.map(range => {
        return prices.filter(price => price >= range.min && price <= range.max).length;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ranges.map(r => r.label),
            datasets: [{
                data: distribution,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(147, 51, 234, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function generateStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    const statusCount = {
        active: productsData.filter(p => p.status === 'active').length,
        archived: productsData.filter(p => p.status === 'archived').length
    };

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Activos', 'Archivados'],
            datasets: [{
                data: [statusCount.active, statusCount.archived],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function generatePricePerKgChart() {
    const ctx = document.getElementById('pricePerKgChart').getContext('2d');
    
    const activeProducts = productsData.filter(p => p.status === 'active');
    const data = activeProducts.map(product => {
        const weight = extractWeight(product.title);
        const price = parseFloat(product.variants[0]?.price || 0);
        const pricePerKg = weight > 0 ? price / weight : 0;
        return {
            label: product.title.substring(0, 20) + '...',
            pricePerKg: pricePerKg,
            weight: weight
        };
    }).filter(item => item.weight > 0).sort((a, b) => a.pricePerKg - b.pricePerKg);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                label: 'Precio por kg',
                data: data.map(d => d.pricePerKg),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        text: 'Precio por kg ($)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function generatePromoChart() {
    const ctx = document.getElementById('promoChart').getContext('2d');
    
    const promoProducts = productsData.filter(p => 
        p.tags.toLowerCase().includes('promo') || 
        p.title.toLowerCase().includes('promo')
    ).length;
    
    const regularProducts = productsData.length - promoProducts;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Productos Regulares', 'Productos en Promoción'],
            datasets: [{
                data: [regularProducts, promoProducts],
                backgroundColor: [
                    'rgba(107, 114, 128, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function populateTable() {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priceRangeFilter = document.getElementById('priceRangeFilter');
    const weightFilter = document.getElementById('weightFilter');
    const inventoryFilter = document.getElementById('inventoryFilter');
    const promoFilter = document.getElementById('promoFilter');
    const yearFilter = document.getElementById('yearFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const filterSummary = document.getElementById('filterSummary');
    
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilterValue = statusFilter.value;
        const priceRangeValue = priceRangeFilter.value;
        const weightValue = weightFilter.value;
        const inventoryValue = inventoryFilter.value;
        const promoValue = promoFilter.value;
        const yearValue = yearFilter.value;
        
        const filteredProducts = productsData.filter(product => {
            // Filtro de búsqueda
            const matchesSearch = product.title.toLowerCase().includes(searchTerm);
            
            // Filtro de estado
            const matchesStatus = !statusFilterValue || product.status === statusFilterValue;
            
            // Filtro de rango de precios
            const price = parseFloat(product.variants[0]?.price || 0);
            let matchesPrice = true;
            if (priceRangeValue) {
                const [min, max] = priceRangeValue.split('-').map(Number);
                matchesPrice = price >= min && price <= max;
            }
            
            // Filtro de peso
            const weight = extractWeight(product.title);
            let matchesWeight = true;
            if (weightValue) {
                const [minWeight, maxWeight] = weightValue.split('-').map(Number);
                matchesWeight = weight >= minWeight && weight <= maxWeight;
            }
            
            // Filtro de inventario
            const inventory = product.variants[0]?.inventory_quantity || 0;
            let matchesInventory = true;
            if (inventoryValue) {
                if (inventoryValue === 'negative') {
                    matchesInventory = inventory < 0;
                } else {
                    const [minInv, maxInv] = inventoryValue.split('-').map(Number);
                    matchesInventory = inventory >= minInv && inventory <= maxInv;
                }
            }
            
            // Filtro de promociones
            const isPromo = product.tags.toLowerCase().includes('promo') || 
                           product.title.toLowerCase().includes('promo');
            let matchesPromo = true;
            if (promoValue === 'promo') {
                matchesPromo = isPromo;
            } else if (promoValue === 'regular') {
                matchesPromo = !isPromo;
            }
            
            // Filtro de año
            let matchesYear = true;
            if (yearValue) {
                const createdYear = new Date(product.created_at).getFullYear();
                matchesYear = createdYear.toString() === yearValue;
            }
            
            return matchesSearch && matchesStatus && matchesPrice && 
                   matchesWeight && matchesInventory && matchesPromo && matchesYear;
        });
        
        renderTable(filteredProducts);
        updateFilterSummary(filteredProducts.length);
    }
    
    function renderTable(products) {
        tableBody.innerHTML = '';
        
        products.forEach(product => {
            const weight = extractWeight(product.title);
            const price = parseFloat(product.variants[0]?.price || 0);
            const pricePerKg = weight > 0 ? (price / weight).toFixed(2) : 'N/A';
            const inventory = product.variants[0]?.inventory_quantity || 0;
            const isPromo = product.tags.toLowerCase().includes('promo') || 
                           product.title.toLowerCase().includes('promo');
            
            let inventoryClass = 'inventory-high';
            if (inventory < 0) inventoryClass = 'inventory-negative';
            else if (inventory < 100) inventoryClass = 'inventory-low';
            else if (inventory < 500) inventoryClass = 'inventory-medium';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="product-name" title="${product.title}">${product.title}</td>
                <td>${weight || 'N/A'}</td>
                <td class="price">$${price.toFixed(2)}</td>
                <td>$${pricePerKg}</td>
                <td class="${inventoryClass}">${inventory.toLocaleString()}</td>
                <td>
                    <span class="status-badge status-${product.status}">
                        ${product.status}
                    </span>
                </td>
                <td>
                    ${isPromo ? '<span class="promo-badge">PROMO</span>' : '-'}
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function updateFilterSummary(count) {
        const total = productsData.length;
        if (count === total) {
            filterSummary.textContent = `Mostrando todos los ${total} productos`;
        } else {
            filterSummary.textContent = `Mostrando ${count} de ${total} productos`;
        }
    }
    
    function clearAllFilters() {
        searchInput.value = '';
        statusFilter.value = '';
        priceRangeFilter.value = '';
        weightFilter.value = '';
        inventoryFilter.value = '';
        promoFilter.value = '';
        yearFilter.value = '';
        applyFilters();
    }
    
    // Event listeners para todos los filtros
    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    priceRangeFilter.addEventListener('change', applyFilters);
    weightFilter.addEventListener('change', applyFilters);
    inventoryFilter.addEventListener('change', applyFilters);
    promoFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Renderizar tabla inicial
    applyFilters();
}

function generateWeightDistributionChart() {
    const ctx = document.getElementById('weightDistributionChart').getContext('2d');
    
    const weights = productsData.map(p => extractWeight(p.title)).filter(w => w > 0);
    const ranges = [
        { label: '1-5 kg', min: 1, max: 5 },
        { label: '6-15 kg', min: 6, max: 15 },
        { label: '16-30 kg', min: 16, max: 30 },
        { label: '31-60 kg', min: 31, max: 60 },
        { label: '61+ kg', min: 61, max: Infinity }
    ];
    
    const distribution = ranges.map(range => {
        return weights.filter(weight => weight >= range.min && weight <= range.max).length;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranges.map(r => r.label),
            datasets: [{
                label: 'Cantidad de Productos',
                data: distribution,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(147, 51, 234, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        text: 'Número de Productos'
                    }
                }
            }
        }
    });
}

function generateYearCreationChart() {
    const ctx = document.getElementById('yearCreationChart').getContext('2d');
    
    const years = productsData.map(p => new Date(p.created_at).getFullYear());
    const yearCounts = {};
    
    years.forEach(year => {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    const sortedYears = Object.keys(yearCounts).sort();
    const counts = sortedYears.map(year => yearCounts[year]);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: [{
                label: 'Productos Creados',
                data: counts,
                borderColor: 'rgba(79, 70, 229, 1)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        text: 'Número de Productos'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Año de Creación'
                    }
                }
            }
        }
    });
}

function generateInventoryAnalysisChart() {
    const ctx = document.getElementById('inventoryAnalysisChart').getContext('2d');
    
    const inventoryLevels = {
        'Stock Negativo': 0,
        'Stock Bajo (0-99)': 0,
        'Stock Medio (100-499)': 0,
        'Stock Alto (500-999)': 0,
        'Stock Muy Alto (1000+)': 0
    };
    
    productsData.forEach(product => {
        const inventory = product.variants[0]?.inventory_quantity || 0;
        if (inventory < 0) inventoryLevels['Stock Negativo']++;
        else if (inventory <= 99) inventoryLevels['Stock Bajo (0-99)']++;
        else if (inventory <= 499) inventoryLevels['Stock Medio (100-499)']++;
        else if (inventory <= 999) inventoryLevels['Stock Alto (500-999)']++;
        else inventoryLevels['Stock Muy Alto (1000+)']++;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(inventoryLevels),
            datasets: [{
                data: Object.values(inventoryLevels),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        fontSize: 12
                    }
                }
            }
        }
    });
}

function generatePremiumEconomicChart() {
    const ctx = document.getElementById('premiumEconomicChart').getContext('2d');
    
    const priceCategories = {
        'Económico ($0-300)': 0,
        'Medio ($301-800)': 0,
        'Premium ($801-1500)': 0,
        'Luxury ($1501+)': 0
    };
    
    productsData.forEach(product => {
        const price = parseFloat(product.variants[0]?.price || 0);
        if (price <= 300) priceCategories['Económico ($0-300)']++;
        else if (price <= 800) priceCategories['Medio ($301-800)']++;
        else if (price <= 1500) priceCategories['Premium ($801-1500)']++;
        else priceCategories['Luxury ($1501+)']++;
    });

    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(priceCategories),
            datasets: [{
                data: Object.values(priceCategories),
                backgroundColor: [
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(147, 51, 234, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', loadData);