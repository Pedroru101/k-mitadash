// ═══════════════════════════════════════════════════════════════════════════════════
// 🐈 K-MITA ANALYTICS - INFORME MENSUAL SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════════

// Variable global para el mes seleccionado
let selectedMonth = 10; // Octubre por defecto

document.addEventListener('DOMContentLoaded', function () {
    console.log('[INFORME MENSUAL] Inicializando...');

    // Elementos del DOM
    const backBtn = document.getElementById('backBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const reportContent = document.getElementById('reportContent');
    const reportPlaceholder = document.getElementById('reportPlaceholder');

    // Event Listeners
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'shopify-analytics-dashboard.html';
        });
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateMonthlyReport);
    }

    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReport);
    }

    // Configurar filtros de mes
    setupMonthFilters();

    console.log('[INFORME MENSUAL] Inicialización completada');
});

// Función para configurar los filtros de mes
function setupMonthFilters() {
    const monthButtons = document.querySelectorAll('.month-btn:not(.disabled)');
    const selectedMonthText = document.getElementById('selectedMonthText');

    monthButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            monthButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase active al botón clickeado
            button.classList.add('active');

            // Actualizar mes seleccionado
            selectedMonth = parseInt(button.dataset.month);

            // Actualizar texto del mes seleccionado
            const monthNames = [
                '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];

            if (selectedMonthText) {
                selectedMonthText.innerHTML = `Mes seleccionado: <strong>${monthNames[selectedMonth]} 2025</strong>`;
            }

            console.log(`[FILTRO MES] Mes seleccionado: ${monthNames[selectedMonth]} (${selectedMonth})`);
        });
    });
}

// Función para generar el informe mensual
function generateMonthlyReport() {
    console.log(`[INFORME MENSUAL] Generando reporte para mes ${selectedMonth}...`);

    // Mostrar contenido del reporte
    const reportContent = document.getElementById('reportContent');

    if (reportContent) reportContent.classList.remove('hidden');

    // Generar datos del reporte para el mes seleccionado
    const reportData = generateReportData(selectedMonth);

    // Mostrar el reporte
    displayReport(reportData);
}

// Función para generar datos del reporte para un mes específico
function generateReportData(monthNumber) {
    const meses = [
        '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const presentaciones = [
        'Arena Biodegradable 3kg',
        'Arena Biodegradable 6kg',
        'Arena Biodegradable 10kg',
        'Arena Biodegradable 20kg',
        'Arena Biodegradable 30kg'
    ];

    const destinos = [
        'Ciudad de México',
        'Jalisco',
        'Nuevo León',
        'Puebla',
        'Veracruz'
    ];

    // Generar datos para el mes seleccionado
    const mesData = {
        nombre: meses[monthNumber],
        numero: monthNumber,
        destinos: [],
        totalesMes: {
            bolsas: 0,
            kilos: 0,
            ingresos: 0
        }
    };

    // Generar datos por destino
    destinos.forEach(destino => {
        const destinoData = {
            nombre: destino,
            presentaciones: [],
            totalesDestino: {
                bolsas: 0,
                kilos: 0,
                ingresos: 0
            }
        };

        // Generar datos por presentación
        presentaciones.forEach(presentacion => {
            // Generar datos más realistas basados en el mes
            const baseAmount = Math.floor(Math.random() * 80) + 20;
            const seasonalFactor = monthNumber <= 10 ? 1 : 0.7; // Menos datos para meses futuros
            const bolsas = Math.floor(baseAmount * seasonalFactor);
            const pesoUnitario = parseInt(presentacion.match(/\d+/)[0]);
            const kilos = bolsas * pesoUnitario;
            
            // Calcular ingresos basados en precio por kilo (varía según presentación)
            const preciosPorKilo = {
                3: 45,   // $45 por kilo para 3kg
                6: 42,   // $42 por kilo para 6kg
                10: 40,  // $40 por kilo para 10kg
                20: 38,  // $38 por kilo para 20kg
                30: 35   // $35 por kilo para 30kg
            };
            const precioPorKilo = preciosPorKilo[pesoUnitario] || 40;
            const ingresos = kilos * precioPorKilo;

            destinoData.presentaciones.push({
                nombre: presentacion,
                bolsas: bolsas,
                kilos: kilos,
                ingresos: ingresos,
                precioPorKilo: precioPorKilo
            });

            destinoData.totalesDestino.bolsas += bolsas;
            destinoData.totalesDestino.kilos += kilos;
            destinoData.totalesDestino.ingresos += ingresos;
        });

        mesData.destinos.push(destinoData);
        mesData.totalesMes.bolsas += destinoData.totalesDestino.bolsas;
        mesData.totalesMes.kilos += destinoData.totalesDestino.kilos;
        mesData.totalesMes.ingresos += destinoData.totalesDestino.ingresos;
    });

    const reportData = {
        año: 2025,
        mesSeleccionado: mesData,
        totalesMes: mesData.totalesMes
    };

    return reportData;
}

// Función para mostrar el reporte
function displayReport(data) {
    const reportContent = document.getElementById('reportContent');
    const mes = data.mesSeleccionado;

    let html = `
        <div class="monthly-report">
            <h2>📊 Reporte de Volúmenes - ${mes.nombre} ${data.año}</h2>
            <p class="report-subtitle">Volúmenes en bolsas y kilos por tipo de presentación por destino</p>
            
            <div class="report-summary">
                <div class="summary-card">
                    <h3>Totales ${mes.nombre} ${data.año}</h3>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="stat-label">Total Bolsas:</span>
                            <span class="stat-value">${data.totalesMes.bolsas.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total Kilos:</span>
                            <span class="stat-value">${data.totalesMes.kilos.toLocaleString()} kg</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total de Ingresos:</span>
                            <span class="stat-value">$${data.totalesMes.ingresos.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="month-section">
                <h3>📅 Detalle por Destino - ${mes.nombre} ${data.año}</h3>
                
                <div class="table-wrapper-extended">
                    <table class="report-table-extended">
                        <thead>
                            <tr>
                                <th>Destino</th>
                                <th>Presentación</th>
                                <th>Bolsas</th>
                                <th>Ingresos</th>
                                <th>Kilos</th>
                                <th>Precio por Kilo</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    // Generar tabla para el mes seleccionado
    mes.destinos.forEach(destino => {
        destino.presentaciones.forEach((presentacion, index) => {
            html += `
                <tr>
                    ${index === 0 ? `<td rowspan="${destino.presentaciones.length + 1}" class="destino-cell">${destino.nombre}</td>` : ''}
                    <td>${presentacion.nombre}</td>
                    <td class="number-cell">${presentacion.bolsas.toLocaleString()}</td>
                    <td class="number-cell">$${presentacion.ingresos.toLocaleString()}</td>
                    <td class="number-cell">${presentacion.kilos.toLocaleString()}</td>
                    <td class="number-cell">$${presentacion.precioPorKilo.toFixed(2)}</td>
                </tr>
            `;
        });

        // Fila de totales por destino
        const precioPromedioDestino = destino.totalesDestino.kilos > 0 
            ? (destino.totalesDestino.ingresos / destino.totalesDestino.kilos).toFixed(2) 
            : 0;
        
        html += `
            <tr class="subtotal-row">
                <td><strong>Total ${destino.nombre}</strong></td>
                <td class="number-cell"><strong>${destino.totalesDestino.bolsas.toLocaleString()}</strong></td>
                <td class="number-cell"><strong>$${destino.totalesDestino.ingresos.toLocaleString()}</strong></td>
                <td class="number-cell"><strong>${destino.totalesDestino.kilos.toLocaleString()}</strong></td>
                <td class="number-cell"><strong>$${precioPromedioDestino}</strong></td>
            </tr>
        `;
    });

    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    reportContent.innerHTML = html;
}

// Función para exportar el reporte
function exportReport() {
    alert('Función de exportación en desarrollo. El reporte se exportaría a Excel con todos los datos mostrados.');
}