# 🔍 Instrucciones para Diagnosticar Datos Inflados

## Problema
El dashboard muestra datos inflados comparados con los datos reales de tu Google Sheet de enero 2025:
- **Datos Reales**: 105 bolsas, 1,826 kg, $63,643 MXN
- **Datos Dashboard**: Inflados (más altos de lo esperado)

## Solución Implementada

He agregado las siguientes mejoras al código:

### 1. **Eliminación de Duplicados**
- El parser CSV ahora elimina automáticamente órdenes duplicadas basándose en `order_id`
- Se agregan logs de advertencia cuando se encuentran duplicados

### 2. **Validación Adicional**
- Después de cargar los datos, se hace una segunda validación para eliminar duplicados
- Se muestra un resumen detallado de datos por mes en la consola

### 3. **Logs Detallados**
- Cada vez que se calculan los KPIs, se muestran los valores en la consola del navegador
- Puedes ver exactamente cuántas órdenes, bolsas, kilos y ventas se están contando

## Cómo Verificar los Datos

### Opción 1: Ver Logs en el Dashboard Principal

1. Abre `index.html` en tu navegador
2. Inicia sesión (usuario: `kmita`, contraseña: `analytics2024`)
3. Abre la **Consola del Navegador** (presiona F12)
4. Busca los siguientes logs:

```
📊 [RESUMEN POR MES] Datos cargados:
  2025-01: X órdenes, X bolsas, X kg, $X
```

5. Compara estos números con tus datos reales de enero 2025

### Opción 2: Usar el Diagnóstico (Requiere Servidor Local)

Para evitar el error de CORS, necesitas ejecutar un servidor local:

#### En Windows:

1. Abre una terminal (CMD o PowerShell) en la carpeta `k-mitadash`
2. Ejecuta uno de estos comandos:

   **Si tienes Python instalado:**
   ```cmd
   python -m http.server 8000
   ```

   **O simplemente ejecuta:**
   ```cmd
   servidor-local.bat
   ```

3. Abre tu navegador en: `http://localhost:8000/diagnostico-datos-enero.html`
4. Haz clic en "🔄 Cargar Datos de Google Sheets"
5. Verás un análisis detallado de:
   - Total de órdenes de enero 2025
   - Total de bolsas, kilos y ventas
   - Diferencia porcentual con los datos esperados
   - Detección de duplicados
   - Tabla con todas las órdenes

## Qué Buscar

### En la Consola del Navegador (F12):

1. **Duplicados Removidos:**
   ```
   ⚠️ [CSV Parser] Se removieron X duplicados
   ⚠️ [DEDUP] Se removieron X órdenes duplicadas
   ```

2. **Resumen por Mes:**
   ```
   📊 [RESUMEN POR MES] Datos cargados:
     2025-01: 105 órdenes, 105 bolsas, 1826 kg, $63643.00
   ```
   ☝️ Estos números deben coincidir con tus datos reales

3. **KPIs Calculados:**
   ```
   💰 [KPIs] Total Revenue: $63643.00
   🛍️ [KPIs] Total Bags: 105
   ⚖️ [KPIs] Total Kilos: 1826
   ```

## Si los Datos Siguen Inflados

Si después de estas mejoras los datos siguen inflados, el problema está en tu Google Sheet. Posibles causas:

1. **Filas Duplicadas en Google Sheets**
   - Revisa tu hoja "Orders_Data" y busca `order_id` duplicados
   - Usa la función de Google Sheets: `=COUNTIF(A:A, A2)` para encontrar duplicados

2. **Datos de Prueba Mezclados**
   - Verifica que no haya órdenes de prueba con el mismo `month_key = "2025-01"`

3. **Script de Sincronización Duplicando Datos**
   - Si tu script de Google Apps Script está corriendo múltiples veces, puede estar duplicando órdenes

## Próximos Pasos

1. Ejecuta el dashboard con las mejoras
2. Revisa los logs en la consola (F12)
3. Compárteme los logs que veas, especialmente:
   - El resumen por mes
   - Si se removieron duplicados
   - Los KPIs calculados

Con esta información podré ayudarte a identificar exactamente dónde está el problema.
