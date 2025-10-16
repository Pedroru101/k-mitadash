# 📊 Extracción Completa de Datos de Shopify

## 🎯 Resumen

Este script extrae **TODOS** los datos disponibles de Shopify, organizados en **6 hojas** diferentes en Google Sheets.

---

## 📋 Hojas de Datos Creadas

### 1. **Orders_Data** (Órdenes Completas)
**Total de campos: 73**

#### Información Básica
- `order_id`, `order_name`, `order_number`
- `created_at`, `updated_at`, `processed_at`, `cancelled_at`, `closed_at`
- `financial_status`, `fulfillment_status`, `fulfilled_at`, `fulfillment_days`

#### Montos y Precios
- `total_price`, `subtotal_price`, `total_tax`, `total_discounts`
- `total_shipping`, `total_weight`, `total_line_items_price`
- `total_bags`, `total_kilos`, `currency`

#### Información del Cliente
- `customer_id`, `customer_email`, `customer_first_name`, `customer_last_name`
- `customer_phone`, `customer_accepts_marketing`

#### Dirección de Envío (Shipping)
- `shipping_first_name`, `shipping_last_name`, `shipping_company`
- `shipping_address1`, `shipping_address2`, `shipping_city`
- `shipping_province`, `shipping_province_code`
- `shipping_country`, `shipping_country_code`, `shipping_zip`, `shipping_phone`

#### Dirección de Facturación (Billing)
- `billing_first_name`, `billing_last_name`, `billing_company`
- `billing_address1`, `billing_address2`, `billing_city`
- `billing_province`, `billing_province_code`
- `billing_country`, `billing_country_code`, `billing_zip`, `billing_phone`

#### Información de Pago
- `payment_method`, `payment_gateway`

#### Marketing y Origen
- `source_name`, `referring_site`, `landing_site`
- `tags`, `note`

#### Descuentos y Envío
- `discount_codes`, `discount_applications`
- `shipping_lines`, `tax_lines`

#### Información Técnica
- `confirmed`, `test`, `browser_ip`, `buyer_accepts_marketing`
- `cancel_reason`, `cart_token`, `checkout_token`
- `client_details_browser_ip`, `client_details_user_agent`
- `contact_email`, `month_key`

---

### 2. **Line_Items_Data** (Productos Individuales por Orden)
**Total de campos: 26**

#### Identificación
- `line_item_id`, `order_id`, `order_name`, `order_created_at`
- `product_id`, `variant_id`

#### Información del Producto
- `title`, `variant_title`, `sku`, `vendor`, `name`

#### Cantidades y Precios
- `quantity`, `price`, `total_discount`
- `grams`, `kilos`

#### Características
- `requires_shipping`, `taxable`, `gift_card`, `product_exists`
- `fulfillment_status`, `fulfillment_service`

#### Datos Adicionales
- `properties` (JSON), `tax_lines` (JSON)
- `discount_allocations` (JSON), `duties` (JSON)

---

### 3. **Customers_Data** (Clientes Completos)
**Total de campos: 43**

#### Información Básica
- `customer_id`, `email`, `first_name`, `last_name`, `phone`
- `created_at`, `updated_at`

#### Estadísticas
- `orders_count`, `total_spent`, `customer_segment`
- `state`, `verified_email`, `tax_exempt`

#### Marketing
- `tags`, `currency`, `accepts_marketing`
- `accepts_marketing_updated_at`, `marketing_opt_in_level`

#### Consentimiento de Email Marketing
- `email_marketing_consent_state`
- `email_marketing_consent_opt_in_level`
- `email_marketing_consent_updated_at`

#### Consentimiento de SMS Marketing
- `sms_marketing_consent_state`
- `sms_marketing_consent_opt_in_level`
- `sms_marketing_consent_updated_at`

#### Dirección Principal
- `default_address_id`, `default_address_first_name`, `default_address_last_name`
- `default_address_company`, `default_address_address1`, `default_address_address2`
- `default_address_city`, `default_address_province`, `default_address_province_code`
- `default_address_country`, `default_address_country_code`
- `default_address_zip`, `default_address_phone`, `default_address_name`

#### Información Adicional
- `all_addresses` (JSON con todas las direcciones)
- `last_order_id`, `last_order_name`
- `note`, `tax_exemptions`
- `admin_graphql_api_id`, `multipass_identifier`

---

### 4. **Products_Data** (Catálogo de Productos)
**Total de campos: 15**

#### Información Básica
- `product_id`, `title`, `body_html`
- `vendor`, `product_type`

#### Fechas
- `created_at`, `updated_at`, `published_at`

#### Estado y Organización
- `status`, `tags`

#### Variantes e Imágenes
- `variants_count`, `images_count`
- `options` (JSON), `image_src`

#### Técnico
- `admin_graphql_api_id`

---

### 5. **Abandoned_Checkouts_Data** (Carritos Abandonados)
**Total de campos: 30**

#### Identificación
- `checkout_id`, `token`, `cart_token`

#### Información del Cliente
- `email`, `customer_id`, `customer_email`
- `customer_first_name`, `customer_last_name`, `customer_phone`

#### Fechas
- `created_at`, `updated_at`, `completed_at`

#### Montos
- `total_price`, `subtotal_price`, `total_tax`, `total_discounts`
- `currency`

#### Productos
- `line_items_count`, `line_items` (JSON)

#### Direcciones
- `shipping_address_city`, `shipping_address_province`, `shipping_address_country`
- `billing_address_city`, `billing_address_province`, `billing_address_country`

#### Marketing
- `source_name`, `referring_site`, `landing_site`

#### Adicional
- `abandoned_checkout_url`, `note`

---

## 🔄 Proceso de Sincronización

### Orden de Extracción:
1. **Órdenes** → Por mes desde enero 2025 hasta hoy
2. **Line Items** → Extraídos de todas las órdenes
3. **Clientes** → Todos desde enero 2025
4. **Productos** → Catálogo completo
5. **Carritos Abandonados** → Desde enero 2025

### Características:
- ✅ **No duplica datos** - Solo actualiza o agrega nuevos
- ✅ **Paginación automática** - Obtiene todos los registros
- ✅ **Manejo de errores** - Continúa si falla alguna sección
- ✅ **Logs detallados** - Seguimiento completo del proceso

---

## 📊 Campos Calculados

### En Orders_Data:
- **`fulfillment_days`**: Días entre `created_at` y `fulfilled_at`
- **`total_kilos`**: Suma de gramos de line items / 1000
- **`total_bags`**: Suma de cantidades de line items
- **`total_shipping`**: Suma de precios de shipping_lines

### En Line_Items_Data:
- **`kilos`**: (grams × quantity) / 1000

### En Customers_Data:
- **`customer_segment`**: 
  - "New" = 0 órdenes
  - "One-time" = 1 orden
  - "Repeat" = 2 órdenes
  - "Loyal" = 3+ órdenes

---

## 🎯 Casos de Uso

### Análisis de Ventas
- Tendencias por mes, estado, producto
- Análisis de descuentos y promociones
- Rendimiento por canal de origen

### Análisis de Clientes
- Segmentación por comportamiento
- Análisis geográfico
- Efectividad de marketing

### Análisis de Productos
- Productos más vendidos
- Análisis de inventario
- Rendimiento por categoría

### Recuperación de Carritos
- Identificar patrones de abandono
- Segmentar por valor del carrito
- Análisis de fricción en checkout

### Logística y Fulfillment
- Tiempos de entrega por región
- Análisis de costos de envío
- Identificar cuellos de botella

---

## 🚀 Cómo Usar

### 1. Ejecutar Sincronización
```
En Google Sheets:
🛒 Shopify Sync → ▶️ Ejecutar sincronización
```

### 2. Verificar Datos
Revisa que se hayan creado las 6 hojas:
- Orders_Data
- Line_Items_Data
- Customers_Data
- Products_Data
- Abandoned_Checkouts_Data

### 3. Conectar al Dashboard
El dashboard automáticamente leerá los datos de Orders_Data y Customers_Data.

---

## 📝 Notas Importantes

### Límites de Shopify API:
- **Rate limit**: 2 requests/segundo (el script maneja esto automáticamente)
- **Paginación**: 250 registros por página máximo

### Campos JSON:
Algunos campos contienen JSON para preservar estructuras complejas:
- `discount_applications`
- `shipping_lines`
- `tax_lines`
- `line_items` (en abandoned checkouts)
- `all_addresses` (en customers)
- `properties` (en line items)

Estos pueden parsearse en el dashboard o en análisis posteriores.

### Datos Sensibles:
El script extrae:
- ✅ Direcciones completas
- ✅ Teléfonos
- ✅ IPs de navegador
- ✅ Tokens de carrito

**Asegúrate de que tu Google Sheet tenga permisos adecuados.**

---

## 🔧 Personalización

### Para agregar más campos:
1. Consulta la [Shopify API Documentation](https://shopify.dev/api/admin-rest)
2. Agrega el campo al array `headers`
3. Agrega la extracción en el array de datos

### Para agregar más recursos:
Shopify tiene más endpoints disponibles:
- `/admin/api/2024-10/draft_orders.json`
- `/admin/api/2024-10/inventory_items.json`
- `/admin/api/2024-10/locations.json`
- `/admin/api/2024-10/price_rules.json`
- `/admin/api/2024-10/discounts.json`

---

## ✅ Verificación de Datos

### Campos que SIEMPRE deben tener datos:
- `order_id`, `order_name`, `created_at`
- `customer_email` (si el cliente proporcionó email)
- `total_price`, `currency`

### Campos que pueden estar vacíos:
- `cancelled_at`, `closed_at` (solo si aplica)
- `billing_*` (si es igual a shipping)
- `tags`, `note` (opcionales)
- `referring_site`, `landing_site` (si es tráfico directo)

---

**Última actualización:** 16 de octubre de 2025  
**Versión del script:** 2.0 - Extracción Completa
