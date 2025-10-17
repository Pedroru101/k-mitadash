# 🔍 Instrucciones de Verificación - Dashboard K-mita

**Fecha:** 16 de octubre de 2025  
**Versión:** 1.0

---

## 📋 Resumen de tu Solicitud

Has solicitado:

1. ✅ **Verificar la fuente de datos** - Confirmar que los datos vienen del Google Sheets
2. ✅ **Agregar métricas de ingresos** - Mostrar ingresos totales
3. ✅ **Agregar precio por kilo** - Mostrar precio promedio por kilo
4. ✅ **Mantener desglose por estado** - Conservar el gráfico de ventas por estado

---

## ✅ Estado Actual

### Buenas Noticias:

**TODAS las métricas solicitadas YA ESTÁN IMPLEMENTADAS en el dashboard:**

1. 💰 **Ingresos Totales** - Primera tarjeta de métricas
2. 💵 **Precio/kg** - Séptima tarjeta de métricas  
3. 🌎 **Ventas por Estado** - Gráfico en la sección de análisis de clientes

### El Problema:

**"Las cifras están muy infladas"** - Necesitamos verificar si:
- Hay datos duplicados en Google Sheets
- Los datos del Sheet son correctos
- Hay órdenes de prueba o canceladas incluidas

---

## 🛠️ Herramientas de Verificación Creadas

He creado 3 herramientas para ayudarte a diagnosticar el problema:

### 1. 📊 Diagnóstico de Datos Reales
**Archivo:** `diagnostico-datos-reales.html`

**Qué hace:**
- Carga datos directamente desde tu Google Sheet
- Calcula todas las métricas (ingresos, kilos, bolsas, precio/kg)
- Muestra análisis por estado
- Verifica integridad de datos
- Detecta problemas comunes

**Cómo usar:**
```bash
# Opción 1: Abrir directamente en el navegador
# Haz doble clic en: diagnostico-datos-reales.html

# Opción 2: Con servidor local
cd k-mitadash
python -m http.server 8000
# Luego abre: http://localhost:8000/diagnostico-datos-reales.html
```

### 2. 🔍 Verificador de Fuente de Datos
**Archivo:** `verify-data-source.js`

**Qué hace:**
- Se ejecuta automáticamente al cargar el dashboard
- Muestra logs detallados en la consola del navegador
- Detecta duplicados
- Verifica rangos de valores
- Analiza distribución por estado

**Cómo ver los logs:**
1. Abre el dashboard: https://k-mitadash-new.netlify.app
2. Presiona F12 para abrir la consola
3. Busca los logs con el prefijo `[VERIFY]`

### 3. 📄 Informe de Verificación
**Archivo:** `INFORME_VERIFICACION_DATOS.md`

**Qué contiene:**
- Análisis completo de la configuración actual
- Explicación de cómo funcionan las métricas
- Posibles causas de datos inflados
- Checklist de verificación paso a paso

---

## 🚀 Pasos para Verificar los Datos

### Paso 1: Ejecutar Diagnóstico Local

1. Abre `diagnostico-datos-reales.html` en tu navegador
2. Espera a que cargue los datos
3. Revisa las métricas mostradas:
   - Total Órdenes
   - Ingresos Totales
   - Total Kilos
   - Total Bolsas
   - Precio Promedio/kg
   - Clientes Únicos

4. **Compara estos números con tus datos reales de Shopify**

### Paso 2: Verificar Google Sheets

1. Abre tu Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/edit
   ```

2. Ve a la hoja `Orders_Data`

3. Verifica:
   - [ ] ¿Cuántas filas hay? (debería coincidir con "Total Órdenes")
   - [ ] ¿Hay `order_id` duplicados? (usa filtros o busca duplicados)
   - [ ] ¿Los valores de `total_price` son correctos?
   - [ ] ¿Los valores de `total_kilos` son correctos?
   - [ ] ¿Hay órdenes de prueba o canceladas?

### Paso 3: Verificar en Shopify Admin

1. Ve a tu panel de Shopify
2. Navega a **Orders**
3. Aplica los mismos filtros de fecha que en el dashboard
4. Exporta un reporte de ventas
5. **Compara los totales:**
   - Total de órdenes
   - Ingresos totales
   - Productos vendidos

### Paso 4: Revisar Logs del Dashboard

1. Abre el dashboard: https://k-mitadash-new.netlify.app
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Busca los logs del verificador:
   ```
   🔍 [VERIFY] INICIANDO VERIFICACIÓN DE FUENTE DE DATOS
   📊 [VERIFY] ANÁLISIS DE DATOS CARGADOS
   💰 [VERIFY] MÉTRICAS CALCULADAS
   🌎 [VERIFY] ANÁLISIS POR ESTADO
   ```

5. Revisa especialmente:
   - ¿Hay duplicados detectados?
   - ¿Los rangos de precios son normales?
   - ¿Las fechas son correctas?

---

## 🔍 Qué Buscar

### ✅ Señales de que los datos son correctos:

- ✅ No hay duplicados detectados
- ✅ Los totales coinciden con Shopify
- ✅ Los rangos de precios son razonables
- ✅ Las fechas están en el rango esperado
- ✅ Los estados tienen sentido geográficamente

### ⚠️ Señales de que hay un problema:

- ❌ Se detectan duplicados en los logs
- ❌ Los totales son el doble o triple de lo esperado
- ❌ Hay precios muy altos o muy bajos inusuales
- ❌ Hay fechas fuera de rango
- ❌ Hay muchas órdenes "Sin estado"

---

## 🛠️ Soluciones Según el Problema

### Problema 1: Datos Duplicados en Google Sheets

**Síntoma:** El verificador muestra "Se encontraron X órdenes duplicadas"

**Solución:**
1. Abre el Google Sheet
2. En la hoja `Orders_Data`, selecciona la columna `order_id`
3. Ve a **Datos > Crear un filtro**
4. Busca valores duplicados
5. Elimina las filas duplicadas (conserva solo una copia de cada orden)
6. Recarga el dashboard

### Problema 2: Órdenes de Prueba o Canceladas

**Síntoma:** Hay órdenes con precios muy bajos o estados inusuales

**Solución:**
Necesitamos filtrar estas órdenes. Puedo ayudarte a:
1. Modificar el script kmita para excluir órdenes canceladas
2. O agregar filtros en el adaptador del dashboard

### Problema 3: Conversión de Moneda Incorrecta

**Síntoma:** Los precios están multiplicados por un factor (ej: x20)

**Solución:**
Verificar que todas las órdenes estén en MXN y no en otra moneda.

### Problema 4: El Script kmita Genera Duplicados

**Síntoma:** Cada vez que se ejecuta el script, se agregan más filas

**Solución:**
El script kmita debería limpiar la hoja antes de escribir nuevos datos.
Puedo ayudarte a revisar el script.

---

## 📊 Métricas del Dashboard (Confirmación)

### KPIs Visibles (8 tarjetas):

1. 💰 **Ingresos Totales** ✅
   - Ubicación: Primera fila, primera tarjeta
   - Cálculo: Suma de `total_price` de todas las órdenes
   - Formato: $X,XXX.XX

2. 📦 **Total Órdenes** ✅
   - Ubicación: Primera fila, segunda tarjeta
   - Cálculo: Conteo de órdenes
   - Formato: X,XXX

3. 👥 **Clientes Únicos** ✅
   - Ubicación: Primera fila, tercera tarjeta
   - Cálculo: Conteo de emails únicos
   - Formato: X,XXX

4. 📊 **Valor Promedio** ✅
   - Ubicación: Primera fila, cuarta tarjeta
   - Cálculo: Ingresos totales / Total órdenes
   - Formato: $X,XXX.XX

5. ⚖️ **Total Kilos** ✅
   - Ubicación: Segunda fila, primera tarjeta
   - Cálculo: Suma de `total_kilos`
   - Formato: X,XXX kg

6. 🛍️ **Total Bolsas** ✅
   - Ubicación: Segunda fila, segunda tarjeta
   - Cálculo: Suma de `total_bags`
   - Formato: X,XXX

7. 💵 **Precio/kg** ✅ ← **MÉTRICA SOLICITADA**
   - Ubicación: Segunda fila, tercera tarjeta
   - Cálculo: Promedio de (total_price / total_kilos) por orden
   - Formato: $X,XXX.XX

8. ⏱️ **Fulfillment** ✅
   - Ubicación: Segunda fila, cuarta tarjeta
   - Cálculo: Promedio de días entre created_at y processed_at
   - Formato: X.X días

### Gráficos Visibles (8 visualizaciones):

1. 📈 **Tendencia de Ventas** - Ingresos por mes
2. 🐈 **Kilos Vendidos** - Kilos por mes
3. 🛍️ **Bolsas Vendidas** - Bolsas por mes
4. 🏆 **Top Productos** - Productos más vendidos
5. 👥 **Segmentación** - Distribución de clientes
6. 💳 **Métodos de Pago** - Distribución de pagos
7. 🌎 **Ventas por Estado** ✅ ← **GRÁFICO A MANTENER**
8. 📦 **Fulfillment** - Distribución de días de procesamiento

---

## 📝 Checklist de Verificación

### Antes de reportar un problema:

- [ ] Ejecuté `diagnostico-datos-reales.html`
- [ ] Revisé los logs en la consola del navegador (F12)
- [ ] Verifiqué el Google Sheet por duplicados
- [ ] Comparé con los datos de Shopify Admin
- [ ] Revisé el rango de fechas de las órdenes
- [ ] Verifiqué que no haya órdenes de prueba

### Información a proporcionar si hay un problema:

- [ ] Número de órdenes en el dashboard: _______
- [ ] Número de órdenes en Shopify: _______
- [ ] Ingresos en el dashboard: $_______
- [ ] Ingresos en Shopify: $_______
- [ ] ¿Hay duplicados detectados? Sí / No
- [ ] Captura de pantalla de `diagnostico-datos-reales.html`
- [ ] Captura de pantalla de los logs de la consola

---

## 🔗 Enlaces Útiles

- **Dashboard en producción:** https://k-mitadash-new.netlify.app
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/edit
- **Diagnóstico local:** `diagnostico-datos-reales.html`
- **Informe completo:** `INFORME_VERIFICACION_DATOS.md`

---

## 💡 Próximos Pasos

1. **Ejecuta el diagnóstico** usando `diagnostico-datos-reales.html`
2. **Compara los números** con tus datos reales de Shopify
3. **Si los números coinciden:** ¡Perfecto! El dashboard ya tiene todo lo que necesitas
4. **Si los números están inflados:** Sigue el checklist de verificación y reporta los hallazgos

---

## 🆘 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes dudas o encuentras problemas, proporciona:

1. Captura de pantalla de `diagnostico-datos-reales.html`
2. Logs de la consola (F12) con el prefijo `[VERIFY]`
3. Comparación de números: Dashboard vs Shopify
4. Confirmación de si hay duplicados en Google Sheets

---

**Última actualización:** 16 de octubre de 2025  
**Versión:** 1.0  
**Autor:** Kiro AI Assistant
