# 🔄 Actualizar Datos con Campos Corregidos

## ✅ Cambios Realizados

He actualizado el script de sincronización (`kmita`) para:

### 1. **Fulfillment Days:**
- ✅ Ahora usa `processed_at` en lugar de `fulfilled_at`
- ✅ Calcula correctamente: `processed_at - created_at`
- ✅ Usa `Math.abs()` para evitar números negativos

### 2. **Payment Method:**
- ✅ Busca en múltiples campos: `payment_gateway_names`, `gateway`, `payment_method`, `processing_method`
- ✅ Si no encuentra nada, usa el `financial_status` para inferir
- ✅ Ya no dejará "No especificado" si hay información disponible

---

## 📋 Pasos para Actualizar

### Paso 1: Abrir Google Apps Script

1. Abre tu Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/edit
   ```

2. Ve a: **Extensiones → Apps Script**

---

### Paso 2: Actualizar el Código

1. En Apps Script, busca estas líneas (alrededor de la línea 280-310):

```javascript
// Calcular fecha de fulfillment y días
```

2. Reemplaza TODO el bloque de cálculo de fulfillment con:

```javascript
// Calcular fecha de fulfillment y días
let fulfilledAt = '';
let fulfillmentDays = '';

// Intentar obtener la fecha de fulfillment de diferentes fuentes
// Prioridad: processed_at > fulfillments > closed_at
if (order.processed_at) {
    fulfilledAt = order.processed_at;
} else if (order.fulfillments && order.fulfillments.length > 0) {
    fulfilledAt = order.fulfillments[0].created_at || '';
} else if (order.closed_at) {
    fulfilledAt = order.closed_at;
}

// Calcular días de fulfillment si tenemos ambas fechas
if (order.created_at && fulfilledAt) {
    try {
        const createdDate = new Date(order.created_at);
        const fulfilledDate = new Date(fulfilledAt);
        const diffTime = Math.abs(fulfilledDate - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        fulfillmentDays = diffDays >= 0 ? diffDays : '';
    } catch (e) {
        fulfillmentDays = '';
    }
}
```

3. Busca el bloque de payment_method y reemplázalo con:

```javascript
// Extraer método de pago - buscar en múltiples campos posibles
let paymentMethod = '';

if (order.payment_gateway_names && order.payment_gateway_names.length > 0) {
    paymentMethod = order.payment_gateway_names.join(', ');
} else if (order.gateway) {
    paymentMethod = order.gateway;
} else if (order.payment_method) {
    paymentMethod = order.payment_method;
} else if (order.processing_method) {
    paymentMethod = order.processing_method;
}

// Si aún está vacío, intentar inferir del financial_status
if (!paymentMethod || paymentMethod === '') {
    if (order.financial_status === 'paid') {
        paymentMethod = 'Pagado (método no especificado)';
    } else {
        paymentMethod = 'No especificado';
    }
}
```

---

### Paso 3: Guardar y Ejecutar

1. **Guardar:** Ctrl + S o ícono de disquete

2. **Ejecutar:** 
   - En el menú de tu Google Sheet: **🛒 Shopify Sync → ▶️ Ejecutar sincronización**
   - O en Apps Script: Selecciona `runShopifySync` y haz clic en ▶️

3. **Esperar:** La sincronización tomará unos minutos

---

### Paso 4: Verificar Resultados

Después de la sincronización, verifica en tu Google Sheet:

1. **Columna `fulfillment_days`:**
   - Debería tener números (1, 2, 3, etc.)
   - No debería estar vacía

2. **Columna `payment_method`:**
   - Debería tener valores reales
   - Menos "No especificado"

---

### Paso 5: Recargar Dashboard

1. Abre: https://k-mitadash-new.netlify.app

2. Presiona: **Ctrl + Shift + R** (recarga forzada)

3. Login: kmita / analytics2024

4. Verifica:
   - ✅ Gráfico de Métodos de Pago debe mostrar diferentes colores
   - ✅ Gráfico de Fulfillment debe mostrar una línea con datos reales

---

## 🎯 Resultado Esperado

### Antes:
- ❌ Métodos de Pago: Todo "No especificado" (círculo rosa completo)
- ❌ Fulfillment: Línea plana en 0

### Después:
- ✅ Métodos de Pago: Diferentes métodos con colores variados
- ✅ Fulfillment: Línea con variaciones mostrando días reales (1-5 días típicamente)

---

## 💡 Nota Importante

Si después de actualizar el código y ejecutar la sincronización, los gráficos siguen igual:

1. Verifica que la columna `processed_at` exista en tu Sheet
2. Verifica que tenga fechas válidas
3. Usa la herramienta de diagnóstico: https://k-mitadash-new.netlify.app/diagnostico-campos.html

---

**¿Necesitas ayuda con algún paso?** Dime en cuál y te guío.
