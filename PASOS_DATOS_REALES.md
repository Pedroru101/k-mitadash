# 🎯 Pasos para Conectar Datos Reales - AHORA

## ✅ Buenas Noticias

**¡Ya tienes datos reales en tu Google Sheet!**

Acabo de verificar y encontré:
```
✅ Google Sheet ID: 1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0
✅ Hoja Orders_Data existe
✅ Tiene datos reales de Shopify
✅ Primera orden: #5454 del 31 de enero de 2025
```

---

## 🔧 Problema Actual

El dashboard está configurado correctamente PERO puede estar usando datos de muestra como fallback. Necesitamos verificar y forzar el uso de datos reales.

---

## 🚀 Solución Inmediata (3 Pasos)

### Paso 1: Verificar que Google Sheet sea Público

1. **Abre tu Google Sheet:**
   ```
   https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/edit
   ```

2. **Haz clic en "Compartir"** (botón azul arriba a la derecha)

3. **Verifica que diga:**
   ```
   "Cualquiera con el enlace puede ver"
   ```

4. **Si no es así:**
   - Cambia a "Cualquiera con el enlace"
   - Selecciona "Lector" o "Puede ver"
   - Guarda

---

### Paso 2: Verificar Conexión desde el Dashboard

1. **Abre la herramienta de verificación:**
   ```
   https://k-mitadash-new.netlify.app/verificar-datos.html
   ```

2. **Haz clic en:**
   ```
   🔄 Verificar Conexión a Google Sheets
   ```

3. **Deberías ver:**
   ```
   ✅ Conexión exitosa!
   📊 Órdenes encontradas: [número de órdenes]
   ```

4. **Si ves un error:**
   - Anota el código de error (403, 404, etc.)
   - Sigue las instrucciones que aparezcan

---

### Paso 3: Abrir el Dashboard y Verificar

1. **Abre el dashboard:**
   ```
   https://k-mitadash-new.netlify.app
   ```

2. **Login:**
   ```
   Usuario: kmita
   Contraseña: analytics2024
   ```

3. **Abre la consola del navegador:**
   ```
   Presiona F12
   Ve a la pestaña "Console"
   ```

4. **Busca estos mensajes:**
   ```
   ✅ CORRECTO:
   [DEBUG] Datos cargados: X órdenes, Y clientes
   [DEBUG] Datos K-mita cargados desde Google Sheets
   
   ❌ INCORRECTO:
   [FALLBACK] Cargando datos de muestra
   [ERROR] No se pudo conectar a Google Sheets
   ```

---

## 🔍 Diagnóstico Rápido

### Si los gráficos muestran solo 10 órdenes:
❌ **Está usando datos de muestra**

**Solución:**
1. Verifica que Google Sheet sea público
2. Limpia caché del navegador (Ctrl+Shift+R)
3. Recarga el dashboard

### Si los gráficos muestran más de 10 órdenes:
✅ **Está usando datos reales**

**Verifica:**
- Los números coinciden con tu Google Sheet
- Los gráficos muestran tus estados reales
- Los métodos de pago son los correctos

---

## 📊 Datos Actuales en tu Google Sheet

Según la verificación que hice:

```
✅ Hoja: Orders_Data
✅ Campos: order_id, order_name, created_at, financial_status, 
          fulfillment_status, total_price, shipping_province, 
          payment_method, etc.
✅ Primera orden: #5454
✅ Fecha: 2025-01-31
✅ Cliente: danmon16700@gmail.com
✅ Estado: Querétaro
✅ Método de pago: stripe
```

**Estos son datos REALES de Shopify** ✅

---

## 🛠️ Si Necesitas Forzar Datos Reales

Si después de los pasos anteriores sigue usando datos de muestra, necesitamos modificar el código:

### Opción 1: Eliminar Datos de Muestra (Temporal)

1. **Renombra el archivo:**
   ```bash
   cd k-mitadash
   mv sample-data.json sample-data.json.backup
   ```

2. **Redespliega:**
   ```bash
   netlify deploy --prod
   ```

3. **Ahora el dashboard DEBE usar Google Sheets**

### Opción 2: Verificar config.js

1. **Abre:** `k-mitadash/config.js`

2. **Verifica que tenga:**
   ```javascript
   GOOGLE_SHEETS: {
       SHEET_ID: '1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0',
       ORDERS_SHEET: 'Orders_Data',
       CUSTOMERS_SHEET: 'Customers_Data'
   }
   ```

3. **Si es correcto, el problema es de permisos del Sheet**

---

## 🎯 Checklist de Verificación

Marca cada paso que completes:

- [ ] Google Sheet es público ("Cualquiera con el enlace puede ver")
- [ ] Herramienta de verificación muestra conexión exitosa
- [ ] Dashboard abre correctamente
- [ ] Consola del navegador (F12) no muestra errores
- [ ] Gráficos muestran más de 10 órdenes
- [ ] Estados mostrados coinciden con tus datos reales
- [ ] Métodos de pago coinciden con tus datos reales

---

## 📞 Comandos Útiles

### Verificar datos en Google Sheet:
```bash
curl "https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/export?format=csv&sheet=Orders_Data" | head -5
```

### Contar órdenes en Google Sheet:
```bash
curl -s "https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/export?format=csv&sheet=Orders_Data" | wc -l
```

### Redesplegar dashboard:
```bash
cd k-mitadash
netlify deploy --prod
```

---

## 🚨 Errores Comunes y Soluciones

### Error 403: Forbidden
**Causa:** Google Sheet no es público  
**Solución:** Compartir → "Cualquiera con el enlace puede ver"

### Error 404: Not Found
**Causa:** SHEET_ID incorrecto o hoja no existe  
**Solución:** Verificar SHEET_ID en config.js

### Gráficos vacíos
**Causa:** Datos no se están parseando correctamente  
**Solución:** Verificar que las columnas existan: shipping_province, payment_method

### Sigue mostrando 10 órdenes
**Causa:** Usando datos de muestra como fallback  
**Solución:** Renombrar sample-data.json temporalmente

---

## ✅ Resultado Esperado

Después de seguir estos pasos, deberías ver:

```
📊 Dashboard con Datos Reales:
- Órdenes: [Tu número real de órdenes]
- Clientes: [Tu número real de clientes]
- Estados: [Tus estados reales]
- Métodos de pago: [Tus métodos reales]
- Gráficos actualizados con información real
```

---

## 🎉 Próximo Paso

**AHORA MISMO:**

1. Abre: https://k-mitadash-new.netlify.app/verificar-datos.html
2. Haz clic en "Verificar Conexión a Google Sheets"
3. Si dice "✅ Conexión exitosa" → Abre el dashboard
4. Si dice "❌ Error" → Sigue las instrucciones del error

---

**¿Necesitas ayuda?** Dime qué mensaje ves en la herramienta de verificación y te ayudo a solucionarlo.

---

**Última actualización:** 16 de octubre de 2025  
**Tu Google Sheet:** https://docs.google.com/spreadsheets/d/1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0/edit
