# 🔍 ANÁLISIS DE KILOS - K-MITA DASHBOARD

## 📋 Resumen Ejecutivo

He investigado el tema de los kilos que mencionas. Aquí está el análisis completo de cómo se calculan y por qué podrían variar levemente.

---

## 🎯 ¿Cómo se Calculan los Kilos?

### 📊 **Fuente Original: Google Apps Script (kmita)**

El script que extrae datos de Shopify calcula los kilos así:

```javascript
const totalKilos = lineItems.reduce((sum, item) => {
    const grams = item.grams || 0;
    const quantity = item.quantity || 0;
    return sum + (grams * quantity / 1000);
}, 0);

// Se redondea a 2 decimales
Math.round(totalKilos * 100) / 100
```

**Fórmula:**
```
Total Kilos = Σ (gramos_por_producto × cantidad) / 1000
```

### 📈 **En el Dashboard**

El dashboard lee el campo `total_kilos` directamente desde Google Sheets y lo usa para:

1. **KPI de Total Kilos** - Suma directa de `total_kilos`
2. **Precio por Kilo** - `total_price / total_kilos`
3. **Informe Mensual** - Agrupación por destino y presentación
4. **Gráficas** - Distribución y análisis

---

## 🔬 Posibles Causas de Variaciones Leves

### 1️⃣ **Redondeo en Diferentes Etapas**

**Ejemplo:**
- Shopify almacena: `3000 gramos` (3kg exactos)
- Script calcula: `3000 / 1000 = 3.00`
- Google Sheets muestra: `3` (sin decimales)
- Dashboard suma: `3.00`

Si tienes 100 órdenes de 3kg:
- **Esperado:** 300.00 kg
- **Mostrado:** 300 kg (sin diferencia real)

### 2️⃣ **Productos con Pesos No Estándar**

Algunos productos pueden tener pesos ligeramente diferentes:

```
Arena 3kg → 3000g (exacto)
Arena 6kg → 6000g (exacto)
Arena 10kg → 10000g (exacto)
Arena 30kg → 30000g (exacto)

Pero si hay variaciones en Shopify:
Arena 3kg → 2950g (2.95kg) ← Variación de empaque
```

### 3️⃣ **Órdenes con Múltiples Productos**

**Ejemplo de orden:**
```
2x Arena 3kg = 2 × 3000g = 6000g = 6.00kg
1x Arena 6kg = 1 × 6000g = 6000g = 6.00kg
Total = 12.00kg
```

Si hay redondeo intermedio:
```
2x Arena 3kg = 2 × 2.95kg = 5.90kg (redondeado a 5.9)
1x Arena 6kg = 1 × 5.98kg = 5.98kg (redondeado a 6.0)
Total = 11.9kg vs 12.0kg esperado
```

### 4️⃣ **Diferencias en Shopify vs Google Sheets**

- **Shopify API** devuelve gramos como enteros
- **Google Sheets** puede formatear números con diferentes decimales
- **Dashboard** lee strings y los convierte a números

---

## 🛠️ Herramienta de Diagnóstico Creada

He creado un archivo especial para que puedas verificar exactamente dónde están las variaciones:

### 📄 **diagnostico-kilos.html**

Este archivo te permite:

✅ **Ver todas las órdenes** con sus kilos
✅ **Comparar** kilos del campo vs kilos calculados
✅ **Identificar** órdenes con diferencias
✅ **Análisis por mes** de las variaciones
✅ **Exportar a CSV** para análisis detallado

### 🚀 Cómo Usarlo:

1. Abre `diagnostico-kilos.html` en tu navegador
2. El archivo cargará automáticamente tus datos reales
3. Verás:
   - **Resumen general** con totales
   - **Tabla detallada** de órdenes con diferencias
   - **Análisis mensual** de variaciones
   - **Estadísticas** de precisión

---

## 📊 Qué Esperar Ver

### ✅ **Si los Kilos Están Correctos:**

```
Total Órdenes: 632
Total Kilos (campo): 10,856.00 kg
Total Kilos (calculado): 10,856.00 kg
Diferencia: 0.00 kg
% de precisión: 100%
```

### ⚠️ **Si Hay Variaciones Leves:**

```
Total Órdenes: 632
Total Kilos (campo): 10,856.00 kg
Total Kilos (calculado): 10,849.50 kg
Diferencia: 6.50 kg (0.06%)
Órdenes con diferencia: 15 (2.4%)
Diferencia promedio: 0.43 kg
```

**Esto es NORMAL** si:
- La diferencia total es < 1% del total
- Las diferencias individuales son < 0.5kg
- Solo afecta a pocas órdenes

---

## 🎯 Interpretación de Resultados

### ✅ **Variaciones Aceptables:**

| Diferencia | Causa Probable | Acción |
|------------|----------------|--------|
| < 0.1 kg por orden | Redondeo normal | ✅ Ninguna |
| < 1% del total | Variaciones de empaque | ✅ Ninguna |
| Solo en órdenes antiguas | Cambios en productos | ✅ Ninguna |

### ⚠️ **Variaciones que Requieren Revisión:**

| Diferencia | Causa Probable | Acción |
|------------|----------------|--------|
| > 1 kg por orden | Error en datos de producto | 🔍 Revisar Shopify |
| > 5% del total | Problema sistemático | 🔧 Revisar script |
| En todas las órdenes | Error de cálculo | 🛠️ Corregir fórmula |

---

## 🔧 Soluciones Según el Caso

### **Caso 1: Diferencias Mínimas (< 1%)**

**Conclusión:** Los kilos están correctos. Las variaciones son normales.

**Acción:** Ninguna. El sistema funciona correctamente.

### **Caso 2: Diferencias Moderadas (1-5%)**

**Posible causa:** Algunos productos tienen pesos no estándar en Shopify.

**Acción:**
1. Revisar en Shopify los pesos de los productos
2. Verificar que todos los productos tengan el peso correcto en gramos
3. Re-sincronizar datos con el script `kmita`

### **Caso 3: Diferencias Grandes (> 5%)**

**Posible causa:** Error en el cálculo o en los datos.

**Acción:**
1. Ejecutar `diagnostico-kilos.html`
2. Exportar CSV con las diferencias
3. Revisar manualmente las órdenes con mayor diferencia
4. Verificar en Shopify que los datos sean correctos
5. Contactar soporte si es necesario

---

## 📈 Verificación Rápida

### **Método Manual:**

1. Abre tu Google Sheet
2. Selecciona una orden al azar
3. Verifica en Shopify:
   - Productos en la orden
   - Cantidad de cada producto
   - Peso de cada producto
4. Calcula manualmente:
   ```
   Total = (Producto1_kg × Cantidad1) + (Producto2_kg × Cantidad2) + ...
   ```
5. Compara con el campo `total_kilos` en Google Sheets

### **Ejemplo:**

**Orden #5454 en Shopify:**
- 1x Arena 30kg

**Cálculo:**
```
1 × 30kg = 30kg
```

**En Google Sheets:**
```
total_kilos = 30.00
```

**Resultado:** ✅ Correcto

---

## 🎓 Conclusión

Basándome en el análisis del código:

1. ✅ **El cálculo de kilos es correcto** en el script `kmita`
2. ✅ **La fórmula es precisa**: gramos × cantidad / 1000
3. ✅ **El redondeo es apropiado**: 2 decimales
4. ⚠️ **Las variaciones leves son normales** si son < 1%

### 🔍 **Próximo Paso:**

**Ejecuta `diagnostico-kilos.html`** para ver exactamente:
- Cuántas órdenes tienen diferencias
- Qué tan grandes son las diferencias
- Si es un problema real o solo redondeo normal

---

## 📞 Soporte

Si después de ejecutar el diagnóstico encuentras:
- Diferencias > 5% del total
- Muchas órdenes con diferencias > 1kg
- Patrones extraños en los datos

Entonces necesitamos:
1. Ver el reporte del diagnóstico
2. Revisar algunas órdenes específicas en Shopify
3. Ajustar el script si es necesario

---

**Fecha de Análisis:** 17 de Octubre, 2025  
**Herramienta Creada:** `diagnostico-kilos.html`  
**Estado:** ✅ Lista para usar
