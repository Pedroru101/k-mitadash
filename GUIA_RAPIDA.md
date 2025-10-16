# 🚀 Guía Rápida - Configuración y Uso

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Configurar Credenciales de Shopify

En Google Apps Script, ve a **Propiedades del Script**:

```
1. Abre tu Google Sheet
2. Extensiones → Apps Script
3. Configuración (⚙️) → Propiedades del script
4. Agregar propiedades:
```

| Propiedad | Valor | Ejemplo |
|-----------|-------|---------|
| `SHOPIFY_STORE_NAME` | Tu tienda sin .myshopify.com | `k-mita` |
| `SHOPIFY_API_TOKEN` | Tu token de API | `shpat_xxxxx...` |

### 2️⃣ Ejecutar Primera Sincronización

```
En Google Sheets:
🛒 Shopify Sync → 🔧 Probar conexión
```

Si todo está bien:
```
🛒 Shopify Sync → ▶️ Ejecutar sincronización
```

⏱️ **Tiempo estimado:** 5-15 minutos (primera vez)

### 3️⃣ Verificar Datos

Deberías ver **6 hojas nuevas**:
- ✅ Orders_Data
- ✅ Line_Items_Data
- ✅ Customers_Data
- ✅ Products_Data
- ✅ Abandoned_Checkouts_Data

### 4️⃣ Abrir Dashboard

```
Abre: shopify-analytics-dashboard.html
Usuario: kmita
Contraseña: kmita2025
```

---

## 🔑 Obtener Token de Shopify

### Opción 1: App Personalizada (Recomendado)

1. **En tu Admin de Shopify:**
   ```
   Configuración → Apps y canales de ventas → Desarrollar apps
   ```

2. **Crear app:**
   ```
   Nombre: "K-mita Analytics"
   ```

3. **Configurar permisos (Admin API):**
   ```
   ✅ read_orders
   ✅ read_customers
   ✅ read_products
   ✅ read_checkouts
   ```

4. **Instalar app y copiar:**
   ```
   Admin API access token → shpat_xxxxx...
   ```

### Opción 2: App Privada (Legacy)

Si tu tienda lo permite:
```
Configuración → Apps → Desarrollar apps para tu tienda
→ Crear app privada
```

---

## 📊 Datos Extraídos

### Resumen Rápido:

| Hoja | Campos | Qué Contiene |
|------|--------|--------------|
| **Orders_Data** | 73 | Todas las órdenes con información completa |
| **Line_Items_Data** | 26 | Cada producto de cada orden |
| **Customers_Data** | 43 | Perfil completo de clientes |
| **Products_Data** | 15 | Catálogo de productos |
| **Abandoned_Checkouts_Data** | 30 | Carritos abandonados |

**Total: 187 campos de información** 🎯

---

## 🎨 Dashboard

### Gráficos Disponibles:

#### 📈 Análisis de Ventas
- Tendencia de ventas mensuales
- Kilos vendidos por mes
- Bolsas vendidas por mes
- Top productos

#### 👥 Análisis de Clientes
- Segmentación (Nuevo, Regular, Frecuente, VIP)
- Métodos de pago
- Ventas por estado
- Fulfillment (tiempo de entrega)

#### 📋 Tablas Detalladas
- Top clientes
- Resumen mensual

---

## 🔄 Actualización de Datos

### Automática (Recomendado)
Configura un trigger en Apps Script:
```
1. Apps Script → Activadores (⏰)
2. Agregar activador
3. Función: runShopifySync
4. Tipo: Controlado por tiempo
5. Frecuencia: Diariamente (elige hora)
```

### Manual
```
🛒 Shopify Sync → ▶️ Ejecutar sincronización
```

---

## ⚠️ Solución de Problemas

### Error 403: Documento privado
```
Solución:
1. Abre tu Google Sheet
2. Compartir → Cambiar a "Cualquiera con el enlace puede ver"
3. Reintentar conexión
```

### Error 401: Credenciales inválidas
```
Solución:
1. Verifica SHOPIFY_STORE_NAME (sin .myshopify.com)
2. Verifica SHOPIFY_API_TOKEN (debe empezar con shpat_)
3. Verifica permisos de la app en Shopify
```

### No se ven datos en el dashboard
```
Solución:
1. Verifica que Google Sheets tenga datos
2. Abre consola del navegador (F12)
3. Busca errores en rojo
4. Verifica config.js (SHEET_ID correcto)
```

### Gráficos vacíos
```
Solución:
1. Verifica que Orders_Data tenga datos
2. Verifica columnas: shipping_province, payment_method
3. Recarga el dashboard (Ctrl+F5)
```

---

## 📝 Configuración del Dashboard

### Archivo: `config.js`

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        SHEET_ID: 'TU_SHEET_ID_AQUI',  // ← Cambiar esto
        ORDERS_SHEET: 'Orders_Data',
        CUSTOMERS_SHEET: 'Customers_Data'
    },
    AUTH: {
        USERNAME: 'kmita',
        PASSWORD: 'kmita2025'
    }
};
```

### Obtener SHEET_ID:
```
URL de tu Google Sheet:
https://docs.google.com/spreadsheets/d/ESTE_ES_EL_SHEET_ID/edit
                                        ^^^^^^^^^^^^^^^^^^^^
```

---

## 🎯 Casos de Uso

### 1. Análisis de Ventas por Estado
```
Hoja: Orders_Data
Campo: shipping_province
Gráfico: 🌎 Ventas por Estado
```

### 2. Análisis de Métodos de Pago
```
Hoja: Orders_Data
Campo: payment_method
Gráfico: 💳 Métodos de Pago
```

### 3. Productos Más Vendidos
```
Hoja: Line_Items_Data
Campos: title, quantity, kilos
Análisis: Agrupar por producto
```

### 4. Recuperación de Carritos
```
Hoja: Abandoned_Checkouts_Data
Campos: email, total_price, line_items
Acción: Enviar emails de recuperación
```

### 5. Análisis de Fulfillment
```
Hoja: Orders_Data
Campo: fulfillment_days
Análisis: Promedio por estado/mes
```

---

## 📞 Recursos

### Documentación Completa:
- `DATOS_COMPLETOS_SHOPIFY.md` - Todos los campos disponibles
- `SOLUCION_GRAFICOS_CLIENTES.md` - Solución de problemas específicos
- `RESUMEN_ACTUALIZACION.md` - Qué cambió en esta versión

### Shopify API:
- [Documentación oficial](https://shopify.dev/api/admin-rest)
- [Referencia de Orders](https://shopify.dev/api/admin-rest/2024-10/resources/order)
- [Referencia de Customers](https://shopify.dev/api/admin-rest/2024-10/resources/customer)

---

## ✅ Checklist de Verificación

Después de configurar, verifica:

- [ ] Credenciales configuradas en Apps Script
- [ ] Prueba de conexión exitosa
- [ ] 6 hojas creadas en Google Sheets
- [ ] Orders_Data tiene columnas: shipping_province, payment_method
- [ ] Dashboard abre correctamente
- [ ] Login funciona (kmita / kmita2025)
- [ ] Gráficos muestran datos
- [ ] No hay errores en consola (F12)

---

## 🎉 ¡Listo!

Tu sistema de analytics está completamente configurado y extrayendo **TODOS** los datos disponibles de Shopify.

**Próximos pasos sugeridos:**
1. Configurar sincronización automática diaria
2. Crear reportes personalizados en Google Sheets
3. Agregar gráficos adicionales al dashboard
4. Configurar alertas para métricas importantes

---

**¿Necesitas ayuda?** Revisa los archivos de documentación o los logs en Apps Script.

**Fecha:** 16 de octubre de 2025  
**Versión:** 2.0
