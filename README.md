# K-mita Analytics Dashboard 🐱

Dashboard especializado para análisis de datos de K-mita, empresa líder en arena biodegradable para gatos en México.

## 🚀 Características Principales

- 📊 **KPIs en Tiempo Real**: Ingresos, órdenes, clientes únicos y ticket promedio
- 📈 **Gráficos Interactivos**: Tendencias de ventas, análisis de productos y geografía
- 👥 **Análisis de Clientes**: Segmentación automática (VIP, Loyal, At-Risk, etc.)
- 🏆 **Métricas Específicas**: Kilos vendidos, bolsas distribuidas, precio por kg
- 🌎 **Análisis Geográfico**: Ventas por estado y ciudad en México
- 📦 **Fulfillment**: Tiempos de entrega y performance logístico
- 💳 **Métodos de Pago**: Análisis de preferencias de pago
- 📧 **Marketing**: Performance de campañas y suscripciones
- 🔒 **Autenticación**: Sistema seguro de acceso

## ⚙️ Configuración Rápida

### 1. Configurar Google Sheets API

```bash
# 1. Ve a Google Cloud Console
# 2. Habilita Google Sheets API
# 3. Crea una API Key
# 4. Haz público tu Google Sheets o configura permisos
```

### 2. Actualizar Configuración

Edita `config.js` con tus credenciales:

```javascript
GOOGLE_SHEETS: {
    SHEET_ID: 'TU_SHEET_ID_AQUI',
    API_KEY: 'TU_API_KEY_AQUI',
    ORDERS_SHEET: 'Monthly_Analysis - Orders_Data',
    CUSTOMERS_SHEET: 'Monthly_Analysis - Customers_Data'
}
```

### 3. Estructura de Datos Requerida

#### 📋 Hoja: Monthly_Analysis - Orders_Data
```
order_id, order_name, created_at, total_price, customer_email, 
customer_first_name, customer_last_name, customer_orders_count,
customer_total_spent, shipping_city, shipping_province, 
shipping_country, total_kilos, total_bags, product_details,
payment_method, fulfillment_status, currency, customer_segment
```

#### 👥 Hoja: Monthly_Analysis - Customers_Data  
```
customer_id, email, first_name, last_name, full_name,
orders_count, total_spent, avg_spent_per_order, created_at,
updated_at, days_since_last_order, customer_segment,
address_city, address_province, address_country
```

## 🎯 URLs de Google Sheets

- **Orders Data**: `https://docs.google.com/spreadsheets/d/1BrEpAFNBYeW-N36_nvlyVivWsrkirTGpTuHy7AnCMi0/edit?gid=0#gid=0`
- **Customers Data**: `https://docs.google.com/spreadsheets/d/1BrEpAFNBYeW-N36_nvlyVivWsrkirTGpTuHy7AnCMi0/edit?gid=1768174200#gid=1768174200`

## 🚀 Uso del Dashboard

### Acceso
1. Abre `index.html` en tu navegador o accede a la URL de Netlify
2. **Usuario**: `kmita`
3. **Contraseña**: `analytics2024`

### Funcionalidades
- **Filtros de Tiempo**: Todo el tiempo, 12m, 6m, 3m, 1m
- **Actualización**: Botón de refresh para datos en tiempo real
- **Gráficos Interactivos**: Hover para detalles
- **Tablas Dinámicas**: Top clientes y análisis mensual
- **Insights Automáticos**: Alertas y recomendaciones

## 📁 Estructura del Proyecto

```
k-mitadash/
├── index.html                         # Dashboard principal
├── shopify-analytics-script.js        # Script principal con toda la lógica
├── shopify-analytics-styles.css       # Estilos compilados
├── config.js                          # Configuración centralizada
├── netlify.toml                       # Configuración de despliegue
├── _redirects                         # Reglas de redireccionamiento
├── package.json                       # Metadatos del proyecto
├── .gitignore                         # Archivos ignorados por git
└── README.md                          # Documentación
```

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficos**: Chart.js v3
- **API**: Google Sheets CSV Export (público, sin API key)
- **Estilos**: Tailwind CSS
- **Diseño**: Responsive, Mobile-first
- **Autenticación**: Sistema propio
- **Despliegue**: Netlify

## 🔧 Arquitectura Optimizada

### Script Principal Integrado
- **Consolidación**: Toda la lógica en `shopify-analytics-script.js`
- **Integración**: Dashboard optimizado integrado directamente
- **Eliminación de Duplicados**: Funciones consolidadas sin repetición
- **Gestión de Estado**: Manejo centralizado de autenticación y datos

### Características de la Organización
- ✅ **Sin Duplicación**: Eliminados archivos redundantes
- ✅ **Carga Optimizada**: Solo scripts necesarios
- ✅ **Fallback Inteligente**: Datos de muestra cuando Google Sheets no está disponible
- ✅ **Debugging Integrado**: Herramientas de validación incluidas
- ✅ **Configuración Centralizada**: Todo en `config.js`

## 📊 Métricas K-mita Específicas

### KPIs Principales
- **Ingresos Totales** (MXN)
- **Total de Órdenes**
- **Clientes Únicos**
- **Ticket Promedio**

### Métricas de Producto
- **Kilos Vendidos** (arena biodegradable)
- **Bolsas Distribuidas**
- **Precio Promedio por Kg**
- **Productos Más Vendidos**

### Análisis de Clientes
- **Segmentación**: New, One-time, Repeat, Loyal, VIP, At-Risk
- **Geografía**: Estados y ciudades de México
- **Comportamiento**: Frecuencia de compra, valor de vida

## 🔧 Solución de Problemas

### Error 403 - API Key
```bash
# Verifica que la API Key tenga permisos
# Asegúrate de que Google Sheets API esté habilitada
# Confirma que el documento sea público
```

### Error 404 - Documento no encontrado
```bash
# Verifica el SHEET_ID en config.js
# Confirma que las hojas existan con los nombres correctos
```

### Sin datos
```bash
# Verifica la estructura de columnas
# Confirma que hay datos en las hojas
# Revisa la consola del navegador para errores
```

## 📈 Próximas Funcionalidades

- [ ] Exportación de reportes PDF
- [ ] Alertas automáticas por email
- [ ] Predicciones de ventas con ML
- [ ] Integración directa con Shopify API
- [ ] Dashboard móvil nativo
- [ ] Análisis de inventario

## 🤝 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@k-mita.com
- 📱 WhatsApp: +52 55 1234 5678
- 🌐 Web: www.k-mita.com

---

**K-mita Analytics Dashboard v1.0.0** - Desarrollado específicamente para el análisis de arena biodegradable para gatos 🐱