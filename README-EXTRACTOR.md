# 🐈 K-mita Shopify Data Extractor - Guía de Implementación

## 📋 Descripción

Este script de Google Apps Script replica exactamente el flujo de n8n para extraer datos de Shopify y actualizar Google Sheets automáticamente cada 6 horas.

## 🚀 Funcionalidades

- ✅ **Extracción automática de órdenes** mes por mes para 2025
- ✅ **Cálculo de métricas** (kilos, bolsas, precios, etc.)
- ✅ **Extracción de clientes** creados en 2025
- ✅ **Manejo de paginación** automática de la API de Shopify
- ✅ **Actualización sin duplicados** en Google Sheets
- ✅ **Ejecución programada** cada 6 horas
- ✅ **Logs detallados** para monitoreo

## 📁 Estructura del Proyecto

```
k-mitadash/
├── shopify-extractor.gs      # Script principal de Google Apps Script
├── README-EXTRACTOR.md       # Esta guía
└── [otras dependencias del dashboard]
```

## ⚙️ Configuración Inicial

### 1. Crear Google Sheet

1. Crea una nueva hoja de cálculo en Google Sheets
2. Nómbrala "Dashboard Shopify K-mita"
3. Crea dos pestañas:
   - `Monthly_Analysis - Orders_Data`
   - `Monthly_Analysis - Customers_Data`

### 2. Configurar Apps Script

1. En Google Sheets: **Extensiones > Apps Script**
2. Nombra el proyecto: "Shopify Data Extractor"
3. Copia el contenido del archivo `shopify-extractor.gs`
4. Pégalo en el editor de Apps Script

### 3. Configurar Credenciales Seguras

1. En Apps Script: **Configuración del proyecto** (icono de engranaje)
2. En "Propiedades del script", agrega:

```
SHOPIFY_STORE_NAME: k-mita
SHOPIFY_API_TOKEN: shpat_XXXXXXXXXXXXXXXXXXXXX
```

> **⚠️ Importante**: Nunca escribas las credenciales directamente en el código.

### 4. Obtener Token de API de Shopify

1. Ve a tu tienda Shopify: **Configuración > Usuarios y permisos > Desarrolladores**
2. Crea una nueva app privada
3. Otorga permisos de lectura para:
   - `read_orders`
   - `read_customers`
   - `read_content`
4. Copia el token de acceso (comienza con `shpat_`)

## 📊 Estructura de Datos

### Orders_Data

| Columna | Tipo | Descripción |
|---------|------|-------------|
| order_id | number | ID único de la orden |
| order_name | string | Nombre de la orden (#1234) |
| created_at | datetime | Fecha de creación |
| updated_at | datetime | Fecha de última actualización |
| processed_at | datetime | Fecha de procesamiento |
| fulfillment_created_at | datetime | Fecha de fulfillment |
| financial_status | string | Estado financiero |
| fulfillment_status | string | Estado de fulfillment |
| total_price | number | Precio total |
| total_discounts | number | Descuentos totales |
| total_tax | number | Impuestos totales |
| total_bags | number | Total de bolsas |
| total_kilos | number | Total de kilos |
| customer_id | number | ID del cliente |
| customer_email | string | Email del cliente |
| accepts_marketing | boolean | Acepta marketing |
| shipping_city | string | Ciudad de envío |
| shipping_province | string | Provincia de envío |
| shipping_country | string | País de envío |
| payment_method | string | Método de pago |
| month_key | string | Clave del mes (YYYY-MM) |

### Customers_Data

| Columna | Tipo | Descripción |
|---------|------|-------------|
| customer_id | number | ID único del cliente |
| email | string | Email del cliente |
| first_name | string | Nombre |
| last_name | string | Apellido |
| phone | string | Teléfono |
| created_at | datetime | Fecha de creación |
| updated_at | datetime | Fecha de actualización |
| orders_count | number | Número de órdenes |
| total_spent | number | Total gastado |
| customer_segment | string | Segmento (New/One-time/Repeat/Loyal/VIP) |
| accepts_marketing | boolean | Acepta marketing |
| marketing_opt_in_level | string | Nivel de opt-in |
| address_city | string | Ciudad |
| address_province | string | Provincia |
| address_country | string | País |
| last_order_date | datetime | Fecha del último pedido |
| days_since_last_order | number | Días desde último pedido |

## 🔄 Configurar Ejecución Automática

### Crear Disparador (Trigger)

1. En Apps Script: **Disparadores** (icono del reloj)
2. **+ Añadir disparador**
3. Configurar:
   - **Función**: `runShopifySync`
   - **Origen del evento**: Basado en tiempo
   - **Tipo de temporizador**: Temporizador personalizado
   - **Intervalo**: Cada 6 horas
4. **Guardar**

### Autorizaciones

La primera vez que se ejecute, Google pedirá autorizaciones para:
- Acceder a Google Sheets
- Hacer peticiones HTTP externas

## 🧪 Testing y Debugging

### Probar Conexión

```javascript
// Ejecuta esta función en Apps Script
testShopifyConnection();
```

### Ejecutar Sincronización Manual

```javascript
// Ejecuta esta función para probar
runShopifySync();
```

### Ver Logs

Los logs aparecen en: **Ejecuciones** en Apps Script

## 📈 Métricas Calculadas

### Para Órdenes
- **total_bags**: Suma de cantidades de todos los line items
- **total_kilos**: Suma de (grams × quantity) / 1000 para todos los line items
- **month_key**: Formato YYYY-MM para agrupación mensual

### Para Clientes
- **customer_segment**: Basado en orders_count:
  - `New`: 0 órdenes
  - `One-time`: 1 orden
  - `Repeat`: 2 órdenes
  - `Loyal`: 3-9 órdenes
  - `VIP`: 10+ órdenes
- **days_since_last_order**: Días desde el último pedido

## 🔧 Personalización

### Cambiar Intervalo de Ejecución

En el disparador, puedes cambiar:
- Cada 6 horas (recomendado)
- Cada 1 hora (desarrollo)
- Diariamente

### Modificar Columnas

Para agregar/quitar columnas:
1. Edita los arrays `headers` en `processShopifyOrders()` o `processShopifyCustomers()`
2. Actualiza la lógica de transformación de datos
3. Asegúrate de que coincida con tu dashboard

### Filtrar Datos

Para filtrar órdenes por estado:
```javascript
// En fetchAndProcessOrdersForMonth()
const initialUrl = `https://${config.storeName}.myshopify.com/admin/api/${config.apiVersion}/orders.json?status=any&financial_status=paid&limit=250&...`;
```

## 🚨 Solución de Problemas

### Error: "Configuración incompleta"
- Verifica que las propiedades del script estén configuradas correctamente

### Error: "API Shopify (401)"
- Verifica que el token de API sea válido y tenga permisos correctos

### Error: "Pestaña no existe"
- Crea las pestañas `Monthly_Analysis - Orders_Data` y `Monthly_Analysis - Customers_Data`

### Sin datos en algunas fechas
- Verifica que haya órdenes/clientes en los rangos de fechas consultados

### Timeout de ejecución
- Apps Script tiene límite de 6 minutos por ejecución
- Si hay muchos datos, considera procesar menos meses por ejecución

## 📊 Monitoreo

### Logs Automáticos
El script genera logs detallados en cada ejecución:
- Número de páginas procesadas
- Registros encontrados por mes
- Errores de API
- Tiempo de procesamiento

### Dashboard de Ejecuciones
En Apps Script > **Ejecuciones** puedes ver:
- Historial de todas las ejecuciones
- Tiempos de ejecución
- Errores y logs

## 🔗 Integración con Dashboard

Este script mantiene actualizadas las pestañas que lee tu dashboard HTML:
- `Monthly_Analysis - Orders_Data`
- `Monthly_Analysis - Customers_Data`

El dashboard se refresca automáticamente cada 6 horas gracias a la configuración implementada.

## 📝 Notas de Desarrollo

- El script maneja automáticamente la paginación de la API de Shopify
- Incluye pausas de 500ms entre peticiones para respetar límites de API
- Es idempotente: puede ejecutarse múltiples veces sin duplicar datos
- Los datos se reemplazan completamente en cada ejecución (estrategia simple pero efectiva)

---

**🐈 K-mita Analytics Team**