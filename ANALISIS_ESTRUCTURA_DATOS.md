# 📊 ANÁLISIS DE ESTRUCTURA DE DATOS - K-MITA DASHBOARD

## 🔍 RESUMEN EJECUTIVO

**Fecha de Análisis:** 25 de Septiembre, 2025  
**Analista:** Kiro AI Assistant  
**Objetivo:** Identificar por qué ciertas gráficas no muestran datos y documentar la estructura actual

---

## 📋 CONFIGURACIÓN ACTUAL

- **Google Sheets ID:** `1BrEpAFNBYeW-N36_nvlyVivWsrkirTGpTuHy7AnCMi0`
- **Hoja de Órdenes:** `Monthly_Analysis - Orders_Data`
- **Hoja de Clientes:** `Monthly_Analysis - Customers_Data`
- **Método de Acceso:** CSV Export Público (sin API Key)

---

## 🚨 PROBLEMA PRINCIPAL IDENTIFICADO

### ❌ **AMBAS HOJAS CONTIENEN LOS MISMOS DATOS**

**Descubrimiento crítico:** Las dos hojas (`Orders_Data` y `Customers_Data`) tienen exactamente:
- **Mismos encabezados** (107 columnas idénticas)
- **Mismo contenido** (556 filas de órdenes)
- **Misma estructura** (datos de órdenes, no de clientes agregados)

### 🔍 **Evidencia:**
```
Hoja Orders_Data:    557 líneas (556 órdenes + 1 encabezado)
Hoja Customers_Data: 557 líneas (556 órdenes + 1 encabezado)
Encabezados: IDÉNTICOS en ambas hojas
```

---

## 📊 ESTRUCTURA DE DATOS ACTUAL

### 🛒 **Campos Disponibles (107 columnas)**

#### **Campos Críticos para Gráficas:**
✅ **Disponibles y Funcionales:**
- `order_id` - ID único de orden
- `created_at` - Fecha de creación (formato ISO)
- `total_price` - Precio total (numérico)
- `customer_email` - Email del cliente
- `total_kilos` - Kilos totales (numérico)
- `total_bags` - Bolsas totales (numérico)
- `shipping_province` - Estado/Provincia
- `shipping_city` - Ciudad

#### **Campos con Problemas:**
⚠️ **Campos Vacíos o Inconsistentes:**
- `customer_orders_count` - **VACÍO** (crítico para análisis de clientes)
- `customer_total_spent` - **VACÍO** (crítico para análisis de clientes)
- `fulfillment_days` - **VACÍO** (crítico para análisis de fulfillment)
- `price_per_kilo` - **VACÍO** (debe calcularse)
- `discount_percentage` - **VACÍO**

---

## 🎯 IMPACTO EN LAS GRÁFICAS

### 📈 **Gráficas que NO Funcionan (y por qué):**

1. **📊 Análisis de Clientes Recurrentes**
   - **Problema:** No hay datos agregados por cliente
   - **Causa:** `customer_orders_count` y `customer_total_spent` están vacíos
   - **Solución:** Calcular en JavaScript desde datos de órdenes

2. **⏱️ Análisis de Días de Fulfillment**
   - **Problema:** `fulfillment_days` está vacío
   - **Causa:** Campo no calculado en Google Sheets
   - **Solución:** Calcular diferencia entre `created_at` y `processed_at`

3. **💰 Precio por Kilo**
   - **Problema:** `price_per_kilo` está vacío
   - **Causa:** Campo no calculado
   - **Solución:** Calcular `total_price / total_kilos`

4. **🎯 Segmentación de Clientes**
   - **Problema:** No hay hoja separada con datos agregados de clientes
   - **Causa:** Ambas hojas contienen datos de órdenes
   - **Solución:** Crear agregación en JavaScript

### ✅ **Gráficas que SÍ Funcionan:**

1. **📈 Ventas por Mes** - `created_at` + `total_price`
2. **🗺️ Ventas por Estado** - `shipping_province` + `total_price`
3. **📦 Distribución de Kilos** - `total_kilos`
4. **💵 Distribución de Precios** - `total_price`

---

## 🛠️ SOLUCIONES RECOMENDADAS

### 🚀 **Solución Inmediata (JavaScript)**

```javascript
// 1. Calcular métricas faltantes en tiempo real
function calculateMissingMetrics(ordersData) {
    return ordersData.map(order => ({
        ...order,
        // Calcular precio por kilo
        price_per_kilo: order.total_kilos > 0 ? 
            (parseFloat(order.total_price) / parseFloat(order.total_kilos)).toFixed(2) : 0,
        
        // Calcular días de fulfillment
        fulfillment_days: calculateFulfillmentDays(order.created_at, order.processed_at),
        
        // Calcular porcentaje de descuento
        discount_percentage: order.total_price > 0 ? 
            ((parseFloat(order.total_discounts) / parseFloat(order.total_price)) * 100).toFixed(1) : 0
    }));
}

// 2. Agregar datos por cliente
function aggregateCustomerData(ordersData) {
    const customerMap = new Map();
    
    ordersData.forEach(order => {
        const email = order.customer_email;
        if (!customerMap.has(email)) {
            customerMap.set(email, {
                email,
                orders: [],
                totalSpent: 0,
                totalOrders: 0,
                totalKilos: 0,
                firstOrder: null,
                lastOrder: null
            });
        }
        
        const customer = customerMap.get(email);
        customer.orders.push(order);
        customer.totalSpent += parseFloat(order.total_price);
        customer.totalOrders += 1;
        customer.totalKilos += parseFloat(order.total_kilos);
        
        const orderDate = new Date(order.created_at);
        if (!customer.firstOrder || orderDate < customer.firstOrder) {
            customer.firstOrder = orderDate;
        }
        if (!customer.lastOrder || orderDate > customer.lastOrder) {
            customer.lastOrder = orderDate;
        }
    });
    
    return Array.from(customerMap.values());
}
```

### 📊 **Solución Óptima (Google Sheets)**

**Crear hoja separada de clientes agregados:**

```sql
-- Ejemplo de consulta para crear datos agregados
SELECT 
    customer_email,
    COUNT(*) as total_orders,
    SUM(total_price) as total_spent,
    SUM(total_kilos) as total_kilos,
    AVG(total_price) as avg_order_value,
    MIN(created_at) as first_order_date,
    MAX(created_at) as last_order_date,
    shipping_province as primary_state
FROM Orders_Data 
GROUP BY customer_email, shipping_province
```

---

## 📈 MÉTRICAS ACTUALES DISPONIBLES

### ✅ **Datos Completos y Confiables:**
- **556 órdenes** totales
- **Rango de fechas:** 2025-01-30 a 2025-01-31 (datos recientes)
- **Moneda:** MXN (Pesos Mexicanos)
- **Estados cubiertos:** Querétaro, México, CDMX, Veracruz, etc.
- **Productos:** Arena biodegradable para gatos (3kg, 6kg, 10kg, 12kg, 30kg)

### 📊 **Ejemplos de Datos Válidos:**
```
Orden #5454: $995 MXN, 30kg, Querétaro
Orden #5453: $995 MXN, 30kg, Estado de México  
Orden #5452: $319 MXN, 6kg, CDMX
Orden #5451: $469 MXN, 12kg, CDMX
Orden #5450: $169 MXN, 3kg, Veracruz
```

---

## 🎯 PLAN DE ACCIÓN

### 🚀 **Fase 1: Correcciones Inmediatas (JavaScript)**
1. ✅ Implementar cálculo de métricas faltantes
2. ✅ Crear agregación de datos de clientes en tiempo real
3. ✅ Actualizar gráficas para usar datos calculados
4. ✅ Agregar validación de datos

### 📊 **Fase 2: Optimización (Google Sheets)**
1. 🔄 Crear hoja separada "Customer_Analysis" con datos agregados
2. 🔄 Agregar fórmulas para calcular métricas automáticamente
3. 🔄 Implementar actualización automática de métricas

### 🔍 **Fase 3: Monitoreo**
1. 📈 Implementar alertas para datos faltantes
2. 📊 Crear dashboard de calidad de datos
3. 🔄 Automatizar validación de estructura

---

## 🏆 CONCLUSIONES

### ✅ **Fortalezas Actuales:**
- Datos de órdenes completos y consistentes
- Estructura bien definida con 107 campos
- Acceso público funcionando correctamente
- Datos recientes y actualizados

### ⚠️ **Áreas de Mejora:**
- **Crítico:** Crear hoja separada para datos de clientes agregados
- **Importante:** Calcular métricas faltantes (fulfillment_days, price_per_kilo)
- **Recomendado:** Implementar validación automática de datos

### 🎯 **Impacto Esperado:**
- **100% de gráficas funcionando** después de implementar soluciones
- **Mejor rendimiento** con datos pre-calculados
- **Mayor confiabilidad** con validación automática

---

**📝 Nota:** Este análisis se basa en los datos extraídos el 25/09/2025. Se recomienda ejecutar este análisis periódicamente para mantener la calidad del dashboard.