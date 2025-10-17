// ═══════════════════════════════════════════════════════════════════════════════════
// 🐈 K-MITA ANALYTICS - INFORME MENSUAL SCRIPT (DATOS REALES)
// ═══════════════════════════════════════════════════════════════════════════════════

// Variable global para el mes seleccionado
let selectedMonth = 1; // Enero por defecto
let ordersDataGlobal = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log('[INFORME MENSUAL] Inicializando con datos REALES...');

    // Elementos del DOM
    const backBtn = document.getElementById('backBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');

    // Event Listeners
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async () => {
            await generateMonthlyReport();
        });
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
            monthButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedMonth = parseInt(button.dataset.month);

            const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            if (selectedMonthText) {
                selectedMonthText.innerHTML = `Mes seleccionado: <strong>${monthNames[selectedMonth]} 2025</strong>`;
            }

            console.log(`[FILTRO MES] Mes seleccionado: ${monthNames[selectedMonth]} (${selectedMonth})`);
        });
    });
}

// Función para generar el informe mensual
async function generateMonthlyReport() {
    console.log(`[INFORME MENSUAL] Generando reporte REAL para mes ${selectedMonth}...`);

    const reportContent = document.getElementById('reportContent');
    if (reportContent) reportContent.classList.remove('hidden');

    // Cargar y generar datos del reporte
    const reportData = await generateReportData(selectedMonth);

    // Mostrar el reporte
    displayReport(reportData);
}

// Función para cargar datos reales de Google Sheets
async function loadRealOrdersData() {
    try {
        const ordersURL = `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEETS.SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(CONFIG.GOOGLE_SHEETS.ORDERS_SHEET)}`;
        
        console.log('[INFORME MENSUAL] Cargando datos reales desde Google Sheets...');
        
        const response = await fetch(ordersURL);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const csvText = await response.text();
        const ordersData = parseCSV(csvText);

        console.log(`[INFORME MENSUAL] ✅ Datos cargados: ${ordersData.length} órdenes`);

        return ordersData;

    } catch (error) {
        console.error('[INFORME MENSUAL] ❌ Error cargando datos:', error);
        return null;
    }
}

// Parser CSV
function parseCSV(csvText) {
    if (!csvText || csvText.trim() === '') return [];
    
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    const headers = parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length > 0 && values.some(v => v !== '')) {
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index] || '';
            });
            data.push(rowData);
        }
    }

    return data;
}

// Función para generar datos del reporte usando datos REALES
async function generateReportData(monthNumber) {
    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    console.log(`[INFORME MENSUAL] Procesando datos reales para ${meses[monthNumber]} 2025...`);

    // Cargar datos reales
    const ordersData = await loadRealOrdersData();
    
    if (!ordersData || ordersData.length === 0) {
        console.error('[INFORME MENSUAL] No se pudieron cargar datos reales');
        alert('Error: No se pudieron cargar los datos de Google Sheets');
        return generateEmptyReport(monthNumber);
    }

    ordersDataGlobal = ordersData;

    // Filtrar órdenes del mes seleccionado
    const monthKey = `2025-${String(monthNumber).padStart(2, '0')}`;
    const monthOrders = ordersData.filter(order => order.month_key === monthKey);

    console.log(`[INFORME MENSUAL] Órdenes encontradas para ${meses[monthNumber]}: ${monthOrders.length}`);

    // Agrupar datos por destino y presentación
    const dataByDestino = {};

    monthOrders.forEach(order => {
        const destino = order.shipping_province || 'Sin especificar';
        const kilos = parseFloat(order.total_kilos || 0);
        const bolsas = parseFloat(order.total_bags || 0);
        const ingresos = parseFloat(order.total_price || 0);

        // Determinar presentación basada en el título del producto
        const productTitles = order.product_titles || '';
        let presentacion = 'Otro';
        
        if (productTitles.includes('3kg') || productTitles.includes('3 kg')) {
            presentacion = 'Arena Biodegradable 3kg';
        } else if (productTitles.includes('6kg') || productTitles.includes('6 kg')) {
            presentacion = 'Arena Biodegradable 6kg';
        } else if (productTitles.includes('10kg') || productTitles.includes('10 kg')) {
            presentacion = 'Arena Biodegradable 10kg';
        } else if (productTitles.includes('20kg') || productTitles.includes('20 kg')) {
            presentacion = 'Arena Biodegradable 20kg';
        } else if (productTitles.includes('30kg') || productTitles.includes('30 kg')) {
            presentacion = 'Arena Biodegradable 30kg';
        } else if (productTitles.includes('60kg') || productTitles.includes('60 kg')) {
            presentacion = 'Arena Biodegradable 60kg';
        } else if (productTitles.includes('120kg') || productTitles.includes('120 kg')) {
            presentacion = 'Arena Biodegradable 120kg';
        }

        if (!dataByDestino[destino]) {
            dataByDestino[destino] = {};
        }

        if (!dataByDestino[destino][presentacion]) {
            dataByDestino[destino][presentacion] = {
                bolsas: 0,
                kilos: 0,
                ingresos: 0
            };
        }

        dataByDestino[destino][presentacion].bolsas += bolsas;
        dataByDestino[destino][presentacion].kilos += kilos;
        dataByDestino[destino][presentacion].ingresos += ingresos;
    });

    // Construir estructura del reporte
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

    // Convertir datos agrupados a estructura del reporte
    Object.keys(dataByDestino).sort().forEach(destino => {
        const destinoData = {
            nombre: destino,
            presentaciones: [],
            totalesDestino: {
                bolsas: 0,
                kilos: 0,
                ingresos: 0
            }
        };

        Object.keys(dataByDestino[destino]).sort().forEach(presentacion => {
            const data = dataByDestino[destino][presentacion];
            const precioPorKilo = data.kilos > 0 ? data.ingresos / data.kilos : 0;

            destinoData.presentaciones.push({
                nombre: presentacion,
                bolsas: Math.round(data.bolsas),
                kilos: Math.round(data.kilos),
                ingresos: Math.round(data.ingresos),
                precioPorKilo: precioPorKilo
            });

            destinoData.totalesDestino.bolsas += data.bolsas;
            destinoData.totalesDestino.kilos += data.kilos;
            destinoData.totalesDestino.ingresos += data.ingresos;
        });

        mesData.destinos.push(destinoData);
        mesData.totalesMes.bolsas += destinoData.totalesDestino.bolsas;
        mesData.totalesMes.kilos += destinoData.totalesDestino.kilos;
        mesData.totalesMes.ingresos += destinoData.totalesDestino.ingresos;
    });

    console.log(`[INFORME MENSUAL] ✅ Totales calculados:`, {
        bolsas: Math.round(mesData.totalesMes.bolsas),
        kilos: Math.round(mesData.totalesMes.kilos),
        ingresos: Math.round(mesData.totalesMes.ingresos)
    });

    return {
        año: 2025,
        mesSeleccionado: mesData,
        totalesMes: mesData.totalesMes
    };
}

// Función para generar reporte vacío
function generateEmptyReport(monthNumber) {
    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return {
        año: 2025,
        mesSeleccionado: {
            nombre: meses[monthNumber],
            numero: monthNumber,
            destinos: [],
            totalesMes: {
                bolsas: 0,
                kilos: 0,
                ingresos: 0
            }
        },
        totalesMes: {
            bolsas: 0,
            kilos: 0,
            ingresos: 0
        }
    };
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
                            <span class="stat-label">TOTAL BOLSAS:</span>
                            <span class="stat-value">${Math.round(data.totalesMes.bolsas).toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">TOTAL KILOS:</span>
                            <span class="stat-value">${Math.round(data.totalesMes.kilos).toLocaleString()} kg</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">TOTAL DE INGRESOS:</span>
                            <span class="stat-value">$${Math.round(data.totalesMes.ingresos).toLocaleString()}</span>
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
                                <th>DESTINO</th>
                                <th>PRESENTACIÓN</th>
                                <th>BOLSAS</th>
                                <th>INGRESOS</th>
                                <th>KILOS</th>
                                <th>PRECIO POR KILO</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    if (mes.destinos.length === 0) {
        html += `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    No hay datos disponibles para ${mes.nombre} ${data.año}
                </td>
            </tr>
        `;
    } else {
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
                    <td class="number-cell"><strong>${Math.round(destino.totalesDestino.bolsas).toLocaleString()}</strong></td>
                    <td class="number-cell"><strong>$${Math.round(destino.totalesDestino.ingresos).toLocaleString()}</strong></td>
                    <td class="number-cell"><strong>${Math.round(destino.totalesDestino.kilos).toLocaleString()}</strong></td>
                    <td class="number-cell"><strong>$${precioPromedioDestino}</strong></td>
                </tr>
            `;
        });
    }

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
