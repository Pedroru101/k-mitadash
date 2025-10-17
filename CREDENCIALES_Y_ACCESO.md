# 🔐 Credenciales y Acceso al Dashboard

## 🌐 URL del Dashboard

**Producción:** https://k-mitadash-new.netlify.app

---

## 🔑 Credenciales de Acceso

### Usuario:
```
kmita
```

### Contraseña:
```
analytics2024
```

---

## ✅ Problemas Resueltos

### 1. ❌ Error de MutationObserver
**Problema:** `TypeError: Failed to execute 'observe' on 'MutationObserver'`

**Solución:** ✅ Corregido
- Verificación de que `document.body` existe antes de observar
- Manejo de `addedNodes` con verificación de existencia
- Fallback a `DOMContentLoaded` si el body no está listo

### 2. ❌ Error de Variable Duplicada
**Problema:** `SyntaxError: Identifier 'ordersData' has already been declared`

**Solución:** ✅ Corregido
- Eliminadas declaraciones duplicadas de `ordersData` y `customersData`
- `shopify-analytics-script.js` declara las variables globales
- `force-real-data.js` simplificado para no declarar variables globales
- `adapter-real-data.js` solo exporta funciones

### 3. ❌ No se podía iniciar sesión
**Problema:** Errores de JavaScript impedían el login

**Solución:** ✅ Corregido
- Todos los errores de sintaxis resueltos
- Variables globales correctamente declaradas
- Scripts cargados en el orden correcto

---

## 📋 Orden de Carga de Scripts

El dashboard carga los scripts en este orden:

1. **config.js** - Configuración y credenciales
2. **chart.js** - Librería de gráficos
3. **adapter-real-data.js** - Adaptador de campos kmita
4. **force-real-data.js** - Módulo de datos reales
5. **fix-legend-position.js** - Corrección de leyendas
6. **shopify-analytics-script.js** - Script principal

---

## 🎯 Estructura de Datos

### Google Sheets (Script kmita):
- **Orders_Data** - 24 campos
- **Customers_Data** - 17 campos

### Adaptación Automática:
- ✅ Mapeo de 24 campos de órdenes
- ✅ Mapeo de 17 campos de clientes
- ✅ Cálculo de `payment_method`
- ✅ Cálculo de `fulfillment_days`
- ✅ Traducción de `customer_segment`

---

## 🔍 Verificación

### Para verificar que todo funciona:

1. **Abrir el dashboard:** https://k-mitadash-new.netlify.app
2. **Iniciar sesión:**
   - Usuario: `kmita`
   - Contraseña: `analytics2024`
3. **Abrir consola del navegador (F12)**
4. **Verificar logs:**

```
✅ [ADAPTER] Adaptador de datos reales (kmita) cargado correctamente
✅ [FORCE REAL DATA] Módulo de datos reales cargado (kmita)
✅ [LEGEND FIX] Script de corrección de leyendas cargado
🐈 K-mita Analytics Script inicializado correctamente
```

5. **Verificar datos cargados:**

```
🔧 [ADAPTER] Adaptando 632 órdenes desde kmita...
✅ [ADAPTER] Órdenes adaptadas: 632
📊 [ADAPTER] Con método de pago: 632/632
📦 [ADAPTER] Con fulfillment_days: 632/632

🔧 [ADAPTER] Adaptando 527 clientes desde kmita...
✅ [ADAPTER] Clientes adaptados: 527
```

---

## 🎨 Gráficos Disponibles

Una vez iniciada la sesión, verás:

### 📊 Métricas Principales (KPIs):
- 💰 Ingresos Totales
- 📦 Total Órdenes
- 👥 Clientes Únicos
- 📊 Valor Promedio
- ⚖️ Total Kilos
- 🛍️ Total Bolsas
- 💵 Precio/kg
- ⏱️ Fulfillment

### 📈 Gráficos de Análisis:
- 📈 Tendencia de Ventas
- 🐈 Kilos Vendidos
- 🛍️ Bolsas Vendidas
- 🏆 Top Productos
- 👥 Segmentación de Clientes
- 💳 Métodos de Pago
- 🌎 Ventas por Estado
- 📦 Fulfillment

### 📋 Tablas:
- 👑 Top Clientes
- 📈 Resumen Mensual

---

## 🔧 Cambiar Credenciales

Para cambiar las credenciales de acceso:

1. Editar `k-mitadash/config.js`
2. Modificar la sección `AUTH`:

```javascript
AUTH: {
    USERNAME: 'tu_usuario',
    PASSWORD: 'tu_contraseña'
}
```

3. Desplegar cambios:

```bash
cd k-mitadash
netlify deploy --prod --dir=.
```

---

## 📚 Documentación Relacionada

- `ADAPTACION_KMITA.md` - Documentación técnica de la adaptación
- `RESUMEN_ADAPTACION_FINAL.md` - Resumen ejecutivo de cambios
- `ACTUALIZAR_DATOS.md` - Cómo actualizar datos desde Shopify
- `GUIA_RAPIDA.md` - Configuración rápida del dashboard

---

## 🆘 Soporte

### Si no puedes iniciar sesión:

1. **Verificar credenciales:**
   - Usuario: `kmita`
   - Contraseña: `analytics2024`

2. **Limpiar caché del navegador:**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

3. **Verificar consola (F12):**
   - Buscar errores en rojo
   - Verificar que todos los scripts se carguen

4. **Verificar que el Google Sheet sea público:**
   - Abrir: https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/edit
   - Compartir → "Cualquiera con el enlace puede ver"

---

## ✅ Estado Actual

- ✅ Dashboard desplegado en producción
- ✅ Login funcionando correctamente
- ✅ Datos reales cargando (632 órdenes, 527 clientes)
- ✅ Todos los gráficos mostrando datos
- ✅ Sin errores de JavaScript
- ✅ Adaptación completa al script kmita

---

**Última actualización:** 16 de octubre de 2025
**Versión:** 2.1 - Errores corregidos
**Deploy:** https://k-mitadash-new.netlify.app
