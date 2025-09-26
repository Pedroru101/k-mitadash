# 🛠️ GUÍA DE SOLUCIÓN: MÉTRICAS Y GRÁFICAS FALTANTES

## 🎯 OBJETIVO
Generar las métricas y gráficas faltantes utilizando los campos disponibles en Google Sheets.

---

## 📊 CAMPOS DISPONIBLES PARA ANÁLISIS REGIONAL

### 🗺️ **Campos de Ubicación Identificados:**
```javascript
// Campos principales para análisis geográfico
shipping_province     // Estado/Provincia (ej: "Querétaro", "México", "CDMX")
shipping_city        // Ciudad (ej: "Querétaro", "Tlalnepantla de Baz")
shipping_country     // País (siempre "Mexico")
billing_province     // Estado de facturación
billing_city         // Ciudad de facturación
```

### 📍 **Ejemplos de Datos Reales:**
```
Estado: "Querétaro" → Ciudad: "Querétaro"
Estado: "México" → Ciudad: "Tlalnepantla de Baz, Estado de México"  
Estado: "Ciudad de México" → Ciudad: "CDMX"
Estado: "Veracruz" → Ciudad: "Minatitlán"
```

---

## 🧮 SOLUCIONES PARA MÉTRICAS FALTANTES

### 👥 **1. Clientes Únicos**
```javascript
function calculateUniqueCustomers(ordersData) {
    const uniqueEmails = new Set();
    
    ordersData.forEach(order => {
        if (order.customer_email && order.customer_email.trim() !== '') {
            uniqueEmails.add(order.customer_email.toLowerCase());
        }
    });
    
    return uniqueEmails.size;
}

// Uso: 
const uniqueCustomers = calculateUniqueCustomers(ordersData);
document.getElementById('uniqueCustomers').textContent = uniqueCustomers;
```

### 💰 **2. Precio Promedio por Kg**
```javascript
function calculateAvgPricePerKilo(ordersData) {
    let totalRevenue = 0;
    let totalKilos = 0;
    
    ordersData.forEach(order => {
        const price = parseFloat(order.total_price || 0);
        const kilos = parseFloat(order.total_kilos || 0);
        
        if (price > 0 && kilos > 0) {
            totalRevenue += price;
            totalKilos += kilos;
        }
    });
    
    return totalKilos > 0 ? (totalRevenue / totalKilos).toFixed(2) : 0;
}

// Uso:
const avgPricePerKilo = calculateAvgPricePerKilo(ordersData);
document.getElementById('avgPricePerKilo').textContent = `$${avgPricePerKilo}/kg`;
```

### 🚚 **3. Días Promedio de Fulfillment**
```javascript
function calculateAvgFulfillmentDays(ordersData) {
    const fulfillmentDays = [];
    
    ordersData.forEach(order => {
        const createdDate = new Date(order.created_at);
        const processedDate = new Date(order.processed_at);
        
        // Validar que ambas fechas sean válidas
        if (!isNaN(createdDate.getTime()) && !isNaN(processedDate.getTime())) {
            const diffTime = processedDate - createdDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0) {
                fulfillmentDays.push(diffDays);
            }
        }
    });
    
    if (fulfillmentDays.length === 0) return 0;
    
    const avgDays = fulfillmentDays.reduce((sum, days) => sum + days, 0) / fulfillmentDays.length;
    return avgDays.toFixed(1);
}

// Uso:
const avgFulfillmentDays = calculateAvgFulfillmentDays(ordersData);
document.getElementById('avgFulfillmentDays').textContent = `${avgFulfillmentDays} días`;
```

---

## 📈 SOLUCIONES PARA GRÁFICAS FALTANTES

### 💳 **1. Gráfica de Métodos de Pago**
```javascript
function generatePaymentMethodsChart(ordersData) {
    // Extraer métodos de pago (campo: payment_method)
    const paymentMethods = {};
    
    ordersData.forEach(order => {
        const method = order.payment_method || 'No especificado';
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });
    
    // Configuración del gráfico
    const ctx = document.getElementById('paymentMethodsChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(paymentMethods),
            datasets: [{
                data: Object.values(paymentMethods),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '💳 Métodos de Pago'
                }
            }
        }
    });
}
```

### 📧 **2. Performance de Marketing**
```javascript
function generateMarketingPerformanceChart(ordersData) {
    // Usar campo: accepts_marketing
    let acceptsMarketing = 0;
    let totalOrders = 0;
    
    ordersData.forEach(order => {
        totalOrders++;
        if (order.accepts_marketing === true || order.accepts_marketing === 'true') {
            acceptsMarketing++;
        }
    });
    
    const marketingRate = totalOrders > 0 ? (acceptsMarketing / totalOrders * 100).toFixed(1) : 0;
    
    const ctx = document.getElementById('marketingPerformanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Acepta Marketing', 'No Acepta Marketing'],
            datasets: [{
                label: 'Número de Clientes',
                data: [acceptsMarketing, totalOrders - acceptsMarketing],
                backgroundColor: ['#4CAF50', '#FF5722']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `📧 Performance de Marketing (${marketingRate}% aceptación)`
                }
            }
        }
    });
}
```

### 🌎 **3. Ventas por Estado**
```javascript
function generateSalesByStateChart(ordersData) {
    // Usar campo: shipping_province
    const statesSales = {};
    
    ordersData.forEach(order => {
        const state = order.shipping_province || 'No especificado';
        const revenue = parseFloat(order.total_price || 0);
        
        statesSales[state] = (statesSales[state] || 0) + revenue;
    });
    
    // Ordenar por ventas descendente
    const sortedStates = Object.entries(statesSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 estados
    
    const ctx = document.getElementById('salesByStateChart').getContext('2d');
    new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: sortedStates.map(([state]) => state),
            datasets: [{
                label: 'Ventas (MXN)',
                data: sortedStates.map(([, sales]) => sales),
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🌎 Ventas por Estado'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-MX');
                        }
                    }
                }
            }
        }
    });
}
```

### 🚚 **4. Fulfillment Promedio por Período**
```javascript
function generateFulfillmentChart(ordersData) {
    // Agrupar por mes y calcular promedio de fulfillment
    const monthlyFulfillment = {};
    
    ordersData.forEach(order => {
        const createdDate = new Date(order.created_at);
        const processedDate = new Date(order.processed_at);
        
        if (!isNaN(createdDate.getTime()) && !isNaN(processedDate.getTime())) {
            const month = createdDate.toISOString().substring(0, 7); // YYYY-MM
            const diffDays = Math.ceil((processedDate - createdDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0) {
                if (!monthlyFulfillment[month]) {
                    monthlyFulfillment[month] = { total: 0, count: 0 };
                }
                monthlyFulfillment[month].total += diffDays;
                monthlyFulfillment[month].count += 1;
            }
        }
    });
    
    // Calcular promedios
    const chartData = Object.entries(monthlyFulfillment).map(([month, data]) => ({
        month,
        avgDays: (data.total / data.count).toFixed(1)
    }));
    
    const ctx = document.getElementById('fulfillmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(d => d.month),
            datasets: [{
                label: 'Días Promedio',
                data: chartData.map(d => d.avgDays),
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🚚 Fulfillment Promedio por Mes'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Días'
                    }
                }
            }
        }
    });
}
```

---

## 📋 TABLA DE ANÁLISIS DETALLADO

### 🏙️ **Tabla: Ciudad, Estado, Método Pago, Fulfillment**
```javascript
function populateDetailedAnalysisTable(ordersData) {
    const tbody = document.getElementById('detailedAnalysisBody');
    tbody.innerHTML = '';
    
    ordersData.forEach(order => {
        const createdDate = new Date(order.created_at);
        const processedDate = new Date(order.processed_at);
        const fulfillmentDays = !isNaN(createdDate.getTime()) && !isNaN(processedDate.getTime()) 
            ? Math.ceil((processedDate - createdDate) / (1000 * 60 * 60 * 24))
            : 'N/A';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_number || 'N/A'}</td>
            <td>${order.shipping_city || 'N/A'}</td>
            <td>${order.shipping_province || 'N/A'}</td>
            <td>${order.payment_method || 'N/A'}</td>
            <td>${processedDate.toLocaleDateString('es-MX')}</td>
            <td>${fulfillmentDays !== 'N/A' ? fulfillmentDays + ' días' : 'N/A'}</td>
            <td>$${parseFloat(order.total_price || 0).toFixed(2)}</td>
            <td>${order.total_kilos || 0} kg</td>
        `;
        tbody.appendChild(row);
    });
}

// HTML para la tabla
const tableHTML = `
<table id="detailedAnalysisTable" class="analysis-table">
    <thead>
        <tr>
            <th>Orden #</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th>Método Pago</th>
            <th>Fecha Fulfillment</th>
            <th>Días Fulfillment</th>
            <th>Total</th>
            <th>Kilos</th>
        </tr>
    </thead>
    <tbody id="detailedAnalysisBody">
    </tbody>
</table>
`;
```

---

## 🔧 IMPLEMENTACIÓN PASO A PASO

### **Paso 1: Actualizar KPIs**
```javascript
// En la función updateKmitaKPIs(), agregar:
const uniqueCustomers = calculateUniqueCustomers(filteredOrders);
const avgPricePerKilo = calculateAvgPricePerKilo(filteredOrders);
const avgFulfillmentDays = calculateAvgFulfillmentDays(filteredOrders);

updateElementIfExists('uniqueCustomers', formatNumber(uniqueCustomers));
updateElementIfExists('avgPricePerKilo', `$${avgPricePerKilo}/kg`);
updateElementIfExists('avgFulfillmentDays', `${avgFulfillmentDays} días`);
```

### **Paso 2: Generar Gráficas**
```javascript
// En la función generateKmitaCharts(), agregar:
generatePaymentMethodsChart(filteredOrders);
generateMarketingPerformanceChart(filteredOrders);
generateSalesByStateChart(filteredOrders);
generateFulfillmentChart(filteredOrders);
```

### **Paso 3: Poblar Tablas**
```javascript
// En la función populateKmitaTables(), agregar:
populateDetailedAnalysisTable(filteredOrders);
```

---

## 📊 CAMPOS CLAVE IDENTIFICADOS

### ✅ **Campos Disponibles y Funcionales:**
```javascript
// Para análisis geográfico
shipping_province    // Estados: "Querétaro", "México", "CDMX", "Veracruz"
shipping_city       // Ciudades específicas

// Para análisis de fulfillment  
created_at          // Fecha de creación de orden
processed_at        // Fecha de procesamiento

// Para análisis de pagos
payment_method      // Método de pago utilizado

// Para análisis de marketing
accepts_marketing   // Boolean: acepta marketing o no

// Para cálculos
total_price         // Precio total de la orden
total_kilos         // Kilos totales
customer_email      // Email único del cliente
```

### 🎯 **Resultado Esperado:**
- ✅ Clientes Únicos: Calculado correctamente
- ✅ Precio Promedio/Kg: Calculado en tiempo real
- ✅ Días Promedio Fulfillment: Basado en fechas reales
- ✅ Gráfica Métodos de Pago: Funcional
- ✅ Performance Marketing: Basada en accepts_marketing
- ✅ Ventas por Estado: Usando shipping_province
- ✅ Tabla Detallada: Con todos los campos solicitados

---

## 🚀 NOTAS DE IMPLEMENTACIÓN

1. **Validación de Datos:** Siempre verificar que los campos no estén vacíos antes de calcular
2. **Formato de Fechas:** Usar formato ISO para cálculos de fechas
3. **Manejo de Errores:** Implementar fallbacks para datos faltantes
4. **Performance:** Calcular métricas una sola vez y reutilizar resultados
5. **Actualización:** Recalcular cuando cambien los filtros de período

Esta guía proporciona todas las soluciones necesarias para implementar las métricas y gráficas faltantes usando los datos disponibles en Google Sheets.