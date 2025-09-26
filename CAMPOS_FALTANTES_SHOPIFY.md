# 🛒 CAMPOS FALTANTES QUE SHOPIFY SÍ PUEDE PROPORCIONAR

## 🎯 ANÁLISIS DE CAMPOS CRÍTICOS FALTANTES

Basado en el análisis de estructura de datos, estos son los campos importantes que están **VACÍOS** en Google Sheets pero que **SÍ están disponibles** en Shopify:

---

## 📊 CAMPOS CRÍTICOS FALTANTES

### 👥 **1. DATOS DE CLIENTES AGREGADOS**

#### ❌ **Campos Vacíos Actualmente:**
```javascript
customer_orders_count     // VACÍO - Número total de órdenes del cliente
customer_total_spent      // VACÍO - Total gastado por el cliente histórico
```

#### ✅ **Disponible en Shopify API:**
```javascript
// Shopify Customer API
{
  "customer": {
    "id": 207119551,
    "orders_count": 5,           // ← ESTE CAMPO FALTA
    "total_spent": "2500.00",    // ← ESTE CAMPO FALTA
    "created_at": "2021-01-01T00:00:00-05:00",
    "updated_at": "2021-12-01T00:00:00-05:00",
    "last_order_id": 450789469,
    "last_order_name": "#1001",
    "currency": "MXN",
    "accepts_marketing": true,
    "marketing_opt_in_level": "confirmed_opt_in"
  }
}
```

### 🚚 **2. DATOS DE FULFILLMENT DETALLADOS**

#### ❌ **Campos Vacíos Actualmente:**
```javascript
fulfillment_days          // VACÍO - Días entre orden y fulfillment
tracking_company          // VACÍO - Empresa de envío
tracking_number           // VACÍO - Número de rastreo
tracking_url              // VACÍO - URL de rastreo
shipment_status           // VACÍO - Estado del envío
fulfillment_created_at    // VACÍO - Fecha real de fulfillment
```

#### ✅ **Disponible en Shopify Fulfillment API:**
```javascript
// Shopify Fulfillment API
{
  "fulfillment": {
    "id": 255858046,
    "order_id": 450789469,
    "status": "success",
    "created_at": "2021-01-01T11:00:00-05:00",    // ← FECHA REAL DE FULFILLMENT
    "updated_at": "2021-01-01T11:00:00-05:00",
    "tracking_company": "FedEx",                   // ← EMPRESA DE ENVÍO
    "tracking_number": "1234567890",               // ← NÚMERO DE RASTREO
    "tracking_url": "https://fedex.com/track/...", // ← URL DE RASTREO
    "shipment_status": "delivered",                // ← ESTADO DEL ENVÍO
    "location_id": 905684977,
    "line_items": [...]
  }
}
```

### 💰 **3. DATOS FINANCIEROS DETALLADOS**

#### ❌ **Campos Vacíos Actualmente:**
```javascript
discount_percentage       // VACÍO - Porcentaje de descuento aplicado
price_per_kilo           // VACÍO - Precio por kilo calculado
discount_codes           // VACÍO - Códigos de descuento usados
discount_codes_count     // VACÍO - Cantidad de códigos aplicados
```

#### ✅ **Disponible en Shopify Order API:**
```javascript
// Shopify Order API - Discount Applications
{
  "order": {
    "discount_applications": [
      {
        "type": "discount_code",
        "value": "10.0",
        "value_type": "percentage",        // ← PORCENTAJE DE DESCUENTO
        "allocation_method": "across",
        "target_selection": "all",
        "target_type": "line_item",
        "code": "WELCOME10"                // ← CÓDIGO DE DESCUENTO
      }
    ],
    "discount_codes": [
      {
        "code": "WELCOME10",               // ← CÓDIGOS APLICADOS
        "amount": "99.50",
        "type": "percentage"
      }
    ]
  }
}
```

### 📧 **4. DATOS DE MARKETING AVANZADOS**

#### ❌ **Campos Vacíos Actualmente:**
```javascript
email_marketing_state           // VACÍO - Estado de email marketing
email_marketing_opt_in_level    // VACÍO - Nivel de opt-in
email_marketing_consent_date    // VACÍO - Fecha de consentimiento
sms_marketing_state             // VACÍO - Estado de SMS marketing
sms_marketing_opt_in_level      // VACÍO - Nivel de opt-in SMS
sms_marketing_consent_date      // VACÍO - Fecha de consentimiento SMS
```

#### ✅ **Disponible en Shopify Customer API:**
```javascript
// Shopify Customer API - Marketing
{
  "customer": {
    "email_marketing_consent": {
      "state": "subscribed",                    // ← ESTADO EMAIL MARKETING
      "opt_in_level": "confirmed_opt_in",       // ← NIVEL DE OPT-IN
      "consent_updated_at": "2021-01-01T00:00:00-05:00"  // ← FECHA CONSENTIMIENTO
    },
    "sms_marketing_consent": {
      "state": "subscribed",                    // ← ESTADO SMS MARKETING
      "opt_in_level": "confirmed_opt_in",       // ← NIVEL DE OPT-IN SMS
      "consent_updated_at": "2021-01-01T00:00:00-05:00"  // ← FECHA CONSENTIMIENTO SMS
    }
  }
}
```

### 📦 **5. DATOS DE PRODUCTOS DETALLADOS**

#### ❌ **Campos Vacíos Actualmente:**
```javascript
product_titles            // VACÍO - Títulos de productos
vendors                   // VACÍO - Proveedores
skus                      // VACÍO - SKUs de productos
line_items_detailed       // VACÍO - Detalles de líneas de productos
```

#### ✅ **Disponible en Shopify Order API:**
```javascript
// Shopify Order API - Line Items
{
  "order": {
    "line_items": [
      {
        "id": 466157049,
        "variant_id": 39072856,
        "title": "Arena Biodegradable 30kg",     // ← TÍTULO DEL PRODUCTO
        "quantity": 1,
        "sku": "ARENA-30KG-001",                // ← SKU
        "vendor": "K-mita",                     // ← PROVEEDOR
        "product_id": 632910392,
        "variant_title": "30 kilos",
        "fulfillment_service": "manual",
        "fulfillment_status": "fulfilled",
        "price": "995.00",
        "total_discount": "0.00",
        "fulfillable_quantity": 0,
        "service": "manual"
      }
    ]
  }
}
```

---

## 🔧 SOLUCIÓN: CONSULTAS SHOPIFY NECESARIAS

### 📋 **1. Query para Datos de Clientes Completos**
```graphql
query getCustomerDetails($customerId: ID!) {
  customer(id: $customerId) {
    id
    email
    ordersCount                    # ← CAMPO FALTANTE
    totalSpent                     # ← CAMPO FALTANTE
    createdAt
    updatedAt
    lastOrder {
      id
      name
      createdAt
    }
    emailMarketingConsent {
      state                        # ← CAMPO FALTANTE
      marketingOptInLevel          # ← CAMPO FALTANTE
      consentUpdatedAt             # ← CAMPO FALTANTE
    }
    smsMarketingConsent {
      state                        # ← CAMPO FALTANTE
      marketingOptInLevel          # ← CAMPO FALTANTE
      consentUpdatedAt             # ← CAMPO FALTANTE
    }
  }
}
```

### 📋 **2. Query para Fulfillment Completo**
```graphql
query getOrderFulfillments($orderId: ID!) {
  order(id: $orderId) {
    id
    fulfillments {
      id
      status
      createdAt                    # ← FECHA REAL DE FULFILLMENT
      updatedAt
      trackingCompany              # ← EMPRESA DE ENVÍO
      trackingNumber               # ← NÚMERO DE RASTREO
      trackingUrl                  # ← URL DE RASTREO
      shipmentStatus               # ← ESTADO DEL ENVÍO
      location {
        id
        name
      }
    }
  }
}
```

### 📋 **3. Query para Descuentos Detallados**
```graphql
query getOrderDiscounts($orderId: ID!) {
  order(id: $orderId) {
    id
    discountApplications {
      allocationMethod
      targetSelection
      targetType
      value
      valueType                    # ← TIPO DE DESCUENTO (percentage/fixed)
      ... on DiscountCodeApplication {
        code                       # ← CÓDIGO DE DESCUENTO
      }
    }
    discountCodes {
      code                         # ← CÓDIGOS APLICADOS
      amount
      type
    }
  }
}
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Opción 1: Actualizar Export de Google Sheets**
```javascript
// Agregar estos campos al script de exportación de Shopify a Google Sheets:

// Para cada cliente:
customer_orders_count: customer.orders_count,
customer_total_spent: customer.total_spent,
email_marketing_state: customer.email_marketing_consent?.state,
email_marketing_opt_in_level: customer.email_marketing_consent?.marketing_opt_in_level,

// Para cada orden:
fulfillment_created_at: fulfillment.created_at,
tracking_company: fulfillment.tracking_company,
tracking_number: fulfillment.tracking_number,
tracking_url: fulfillment.tracking_url,
shipment_status: fulfillment.shipment_status,

// Para descuentos:
discount_codes: order.discount_codes.map(dc => dc.code).join(', '),
discount_percentage: calculateDiscountPercentage(order.discount_applications),
```

### **Opción 2: API Calls Directos desde JavaScript**
```javascript
// Hacer llamadas directas a Shopify API para obtener datos faltantes
async function enrichOrderData(orderData) {
    // Obtener datos de cliente
    const customerData = await fetchShopifyCustomer(orderData.customer_id);
    
    // Obtener datos de fulfillment
    const fulfillmentData = await fetchShopifyFulfillments(orderData.order_id);
    
    // Combinar datos
    return {
        ...orderData,
        customer_orders_count: customerData.orders_count,
        customer_total_spent: customerData.total_spent,
        fulfillment_created_at: fulfillmentData[0]?.created_at,
        tracking_company: fulfillmentData[0]?.tracking_company,
        // ... más campos
    };
}
```

---

## 📊 IMPACTO EN MÉTRICAS

### ✅ **Con estos campos, se podrían calcular:**

1. **📈 Análisis de Clientes Recurrentes** - Usando `customer_orders_count`
2. **💰 Lifetime Value Real** - Usando `customer_total_spent`
3. **🚚 Fulfillment Accuracy** - Usando fechas reales de fulfillment
4. **📧 Marketing ROI** - Usando datos de consentimiento detallados
5. **🎯 Segmentación Avanzada** - Combinando todos los campos

### 🎯 **Gráficas Adicionales Posibles:**
- Distribución de códigos de descuento
- Performance por empresa de envío
- Análisis de opt-in de marketing por canal
- Productos más vendidos con detalles
- Análisis de fulfillment por ubicación

---

## 🏆 RECOMENDACIÓN

**La solución más eficiente sería actualizar el proceso de exportación de Shopify a Google Sheets** para incluir estos campos críticos, ya que:

1. ✅ Todos los datos están disponibles en Shopify
2. ✅ No requiere cambios en el frontend
3. ✅ Mantiene la arquitectura actual
4. ✅ Mejora significativamente las capacidades analíticas
5. ✅ Permite análisis histórico completo

Los campos identificados son **fundamentales** para un dashboard de analytics completo y están **100% disponibles** en la API de Shopify.