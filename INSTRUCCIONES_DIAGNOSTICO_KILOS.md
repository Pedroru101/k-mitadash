# 🔍 INSTRUCCIONES - Diagnóstico de Kilos

## 🎯 Objetivo

Verificar si los kilos en tu dashboard están correctos y entender por qué pueden variar levemente.

---

## 📋 Pasos para Ejecutar el Diagnóstico

### **1️⃣ Abrir la Herramienta**

1. Ve a la carpeta `k-mitadash`
2. Busca el archivo `diagnostico-kilos.html`
3. Haz doble clic para abrirlo en tu navegador

**O desde la línea de comandos:**
```bash
cd k-mitadash
start diagnostico-kilos.html
```

### **2️⃣ Esperar la Carga**

- La herramienta cargará automáticamente tus datos desde Google Sheets
- Verás un mensaje: "⏳ Cargando datos desde Google Sheets..."
- Después: "✅ Datos cargados: XXX órdenes"

**Tiempo estimado:** 5-10 segundos

### **3️⃣ Revisar el Resumen**

Verás dos tarjetas con información:

#### **Tarjeta 1: Datos de Google Sheets**
```
Total Órdenes: 632
Total Kilos (campo): 10,856.00 kg
Total Kilos (calculado): 10,849.50 kg
Diferencia: 6.50 kg
```

#### **Tarjeta 2: Estadísticas**
```
Órdenes con diferencia: 15
Diferencia promedio: 0.43 kg
Diferencia máxima: 2.50 kg
% de precisión: 97.6%
```

---

## 📊 Cómo Interpretar los Resultados

### ✅ **TODO ESTÁ BIEN si:**

| Métrica | Valor Aceptable | Significado |
|---------|-----------------|-------------|
| **Diferencia total** | < 10 kg | Variación mínima |
| **% de precisión** | > 99% | Casi perfecto |
| **Órdenes con diferencia** | < 5% | Pocas órdenes afectadas |
| **Diferencia promedio** | < 0.5 kg | Variaciones pequeñas |

**Ejemplo de resultado BUENO:**
```
✅ Diferencia total: 6.50 kg (0.06% del total)
✅ % de precisión: 97.6%
✅ Solo 15 de 632 órdenes tienen diferencias
✅ Diferencia promedio: 0.43 kg
```

**Conclusión:** Los kilos están correctos. Las variaciones son normales por redondeo.

---

### ⚠️ **REVISAR si:**

| Métrica | Valor Preocupante | Acción |
|---------|-------------------|--------|
| **Diferencia total** | 10-50 kg | Revisar productos en Shopify |
| **% de precisión** | 95-99% | Verificar pesos de productos |
| **Órdenes con diferencia** | 5-10% | Revisar órdenes específicas |
| **Diferencia promedio** | 0.5-1 kg | Verificar cálculos |

**Ejemplo de resultado REVISAR:**
```
⚠️ Diferencia total: 35 kg (0.32% del total)
⚠️ % de precisión: 96.5%
⚠️ 45 de 632 órdenes tienen diferencias
⚠️ Diferencia promedio: 0.78 kg
```

**Acción recomendada:**
1. Revisar la tabla detallada (abajo en la página)
2. Identificar qué productos tienen diferencias
3. Verificar en Shopify que los pesos sean correctos

---

### ❌ **PROBLEMA si:**

| Métrica | Valor Crítico | Acción |
|---------|---------------|--------|
| **Diferencia total** | > 50 kg | Investigar urgente |
| **% de precisión** | < 95% | Revisar script |
| **Órdenes con diferencia** | > 10% | Verificar datos |
| **Diferencia máxima** | > 5 kg | Revisar orden específica |

**Ejemplo de resultado PROBLEMA:**
```
❌ Diferencia total: 120 kg (1.1% del total)
❌ % de precisión: 92%
❌ 80 de 632 órdenes tienen diferencias
❌ Diferencia máxima: 8.5 kg
```

**Acción recomendada:**
1. Exportar el CSV (botón "📥 Exportar a CSV")
2. Revisar las órdenes con mayor diferencia
3. Verificar en Shopify manualmente
4. Contactar soporte si es necesario

---

## 🔬 Análisis Detallado

### **Tabla de Órdenes con Diferencias**

La herramienta muestra una tabla con:
- **Orden:** Número de orden
- **Fecha:** Cuándo se creó
- **Mes:** Mes de la orden
- **Kilos (Campo):** Lo que está en Google Sheets
- **Kilos (Calculado):** Lo que debería ser según los productos
- **Diferencia:** La variación
- **Productos:** Qué productos tiene la orden

**Colores:**
- 🟡 **Amarillo:** Diferencia pequeña (< 5 kg)
- 🔴 **Rojo:** Diferencia grande (> 5 kg)
- 🟢 **Verde:** Sin diferencia

### **Análisis por Mes**

Muestra un resumen mensual:
```
Mes         | Órdenes | Kilos (Campo) | Kilos (Calc) | Diferencia
------------|---------|---------------|--------------|------------
2025-01     | 105     | 1,826.00      | 1,824.50     | 1.50 kg
2025-02     | 98      | 1,654.00      | 1,654.00     | 0.00 kg
```

---

## 📥 Exportar Resultados

### **Botón "📥 Exportar a CSV"**

Genera un archivo CSV con todas las órdenes y sus diferencias.

**Contenido del CSV:**
```csv
Order ID,Order Name,Date,Month,Kilos Field,Kilos Calc,Difference,Products
5454,#5454,2025-01-30,2025-01,30.00,30.00,0.00,"Arena 30kg"
5453,#5453,2025-01-30,2025-01,30.00,29.50,0.50,"Arena 30kg"
```

**Úsalo para:**
- Análisis en Excel
- Compartir con el equipo
- Documentación
- Investigación detallada

---

## 🎓 Ejemplos Reales

### **Ejemplo 1: Todo Correcto**

```
📊 Resumen:
Total Órdenes: 632
Diferencia total: 3.2 kg (0.03%)
% de precisión: 99.5%
Órdenes con diferencia: 8 (1.3%)

📋 Tabla:
Orden #5454: 30.00 kg vs 30.00 kg → ✅ 0.00 kg
Orden #5453: 30.00 kg vs 29.98 kg → 🟡 0.02 kg
Orden #5452: 6.00 kg vs 6.00 kg → ✅ 0.00 kg
```

**Conclusión:** ✅ Los kilos están perfectos. Variaciones mínimas por redondeo.

---

### **Ejemplo 2: Revisar Algunos Productos**

```
📊 Resumen:
Total Órdenes: 632
Diferencia total: 28 kg (0.26%)
% de precisión: 96.8%
Órdenes con diferencia: 42 (6.6%)

📋 Tabla:
Orden #5454: 30.00 kg vs 29.50 kg → 🟡 0.50 kg (Arena 30kg)
Orden #5453: 30.00 kg vs 29.50 kg → 🟡 0.50 kg (Arena 30kg)
Orden #5452: 6.00 kg vs 5.95 kg → 🟡 0.05 kg (Arena 6kg)
```

**Conclusión:** ⚠️ El producto "Arena 30kg" tiene un peso de 29.5kg en Shopify en lugar de 30kg. Revisar y corregir.

---

### **Ejemplo 3: Problema Detectado**

```
📊 Resumen:
Total Órdenes: 632
Diferencia total: 156 kg (1.4%)
% de precisión: 88%
Órdenes con diferencia: 95 (15%)

📋 Tabla:
Orden #5454: 30.00 kg vs 15.00 kg → 🔴 15.00 kg (Arena 30kg)
Orden #5453: 30.00 kg vs 15.00 kg → 🔴 15.00 kg (Arena 30kg)
Orden #5452: 6.00 kg vs 3.00 kg → 🔴 3.00 kg (Arena 6kg)
```

**Conclusión:** ❌ Los pesos en Shopify están mal. Todos los productos tienen la mitad del peso correcto. Corregir urgente.

---

## 🔧 Soluciones Según el Caso

### **Si Todo Está Bien (> 99% precisión):**

✅ **No hacer nada.** Los kilos están correctos.

Las variaciones leves son normales por:
- Redondeo de decimales
- Formato de números
- Diferencias mínimas de empaque

---

### **Si Hay Que Revisar (95-99% precisión):**

1. **Identificar productos con diferencias:**
   - Revisar la tabla detallada
   - Buscar patrones (¿siempre el mismo producto?)

2. **Verificar en Shopify:**
   - Ir a Productos
   - Buscar el producto con diferencias
   - Verificar el campo "Peso" (debe estar en gramos)

3. **Corregir si es necesario:**
   - Actualizar el peso en Shopify
   - Re-ejecutar el script `kmita`
   - Verificar nuevamente con el diagnóstico

---

### **Si Hay un Problema (< 95% precisión):**

1. **Exportar CSV completo**
2. **Revisar las 10 órdenes con mayor diferencia**
3. **Verificar manualmente en Shopify:**
   - ¿Los productos existen?
   - ¿Los pesos son correctos?
   - ¿Las cantidades coinciden?

4. **Si los datos en Shopify son correctos:**
   - Puede haber un problema en el script
   - Contactar soporte técnico
   - Compartir el CSV exportado

---

## 🚀 Botones Disponibles

### **🔄 Recargar Datos**
- Vuelve a cargar los datos desde Google Sheets
- Útil si acabas de actualizar los datos

### **📥 Exportar a CSV**
- Descarga todos los datos en formato CSV
- Incluye todas las órdenes con sus diferencias

---

## 📞 ¿Necesitas Ayuda?

Si después de ejecutar el diagnóstico:

1. **No entiendes los resultados** → Lee la sección "Cómo Interpretar"
2. **Los números no tienen sentido** → Exporta el CSV y compártelo
3. **Hay un problema grande** → Sigue la sección "Soluciones"
4. **Todo está bien** → ¡Perfecto! No necesitas hacer nada

---

## 📚 Documentación Adicional

- **ANALISIS_KILOS.md** - Análisis técnico completo
- **RESUMEN_KILOS.md** - Resumen ejecutivo
- **Este archivo** - Instrucciones paso a paso

---

**Fecha:** 17 de Octubre, 2025  
**Herramienta:** diagnostico-kilos.html  
**Estado:** ✅ Lista para usar
