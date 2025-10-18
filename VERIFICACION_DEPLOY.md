# ✅ Verificación de Deploy y Scripts - K-mita Analytics

## 📋 Estado de la Configuración

### 1. ✅ Config.js
- **SHEET_ID**: `1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0`
- **Hojas configuradas**:
  - Orders_Data ✅
  - Customers_Data ✅
- **Método de carga**: CSV Export directo (sin API key)
- **Estado**: ✅ CORRECTO

### 2. ✅ Netlify.toml
- **Publish directory**: `.` (raíz del proyecto)
- **Redirects**: Configurados correctamente
- **Headers de seguridad**: Implementados
- **Cache control**: Configurado
- **Estado**: ✅ CORRECTO

### 3. ✅ Adaptador de Datos (adapter-real-data.js)
- **Campos mapeados**:
  - ✅ order_id, order_name, order_number
  - ✅ created_at, processed_at, month_key
  - ✅ financial_status, fulfillment_status
  - ✅ total_price, total_kilos, total_bags
  - ✅ customer_email, customer_id
  - ✅ shipping_province, shipping_city
  - ✅ payment_gateway (NUEVO)
  - ✅ fulfillment_days (DIRECTO desde Google Sheets)
  - ✅ customer_segment (DIRECTO desde Google Sheets)
- **Estado**: ✅ CORRECTO

### 4. ✅ Script Principal (shopify-analytics-script.js)
- **Funciones de carga**: Implementadas
- **Gráficos**: 8 gráficos configurados
- **Tablas**: 5 tablas configuradas
- **Logs de depuración**: Agregados
- **Estado**: ✅ CORRECTO

## 🔍 Posibles Problemas y Soluciones

### Problema 1: Datos no aparecen en gráficos
**Causa**: Los campos en Google Sheets pueden estar vacíos o con nombres diferentes

**Solución**:
1. Abre `diagnostico-simple.html` en tu navegador
2. Haz clic en "Cargar Datos de Google Sheets"
3. Verifica que los campos existan:
   - `shipping_province` (para gráfico de estados)
   - `fulfillment_days` (para gráfico de fulfillment)
   - `payment_gateway` (para gráfico de métodos de pago)

### Problema 2: Gráfico de Estados muestra "No especificado"
**Causa**: El campo `shipping_province` está vacío en Google Sheets

**Verificar**:
```javascript
// En la consola del navegador (F12):
ordersData.slice(0, 10).map(o => o.shipping_province)
```

**Solución**: Asegúrate de que la columna `shipping_province` en Google Sheets tenga datos

### Problema 3: Gráfico de Fulfillment muestra 0 días
**Causa**: El campo `fulfillment_days` está vacío o es 0

**Verificar**:
```javascript
// En la consola del navegador (F12):
ordersData.slice(0, 10).map(o => o.fulfillment_days)
```

**Solución**: Asegúrate de que la columna `fulfillment_days` en Google Sheets tenga valores numéricos

### Problema 4: Caché del navegador
**Causa**: El navegador está usando archivos antiguos

**Solución**:
1. Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. O limpia el caché del navegador:
   - Chrome: `Ctrl + Shift + Delete`
   - Selecciona "Imágenes y archivos en caché"
   - Haz clic en "Borrar datos"

## 🚀 Pasos para Deploy en Netlify

### Opción 1: Deploy Manual
```bash
# En la carpeta k-mitadash
netlify deploy --prod
```

### Opción 2: Deploy desde Git
1. Sube los cambios a GitHub:
```bash
git add .
git commit -m "Actualización de datos reales"
git push origin main
```
2. Netlify detectará automáticamente los cambios y hará deploy

### Opción 3: Drag & Drop
1. Ve a https://app.netlify.com/drop
2. Arrastra la carpeta `k-mitadash` completa
3. Espera a que termine el deploy

## 📊 Verificación Post-Deploy

Después del deploy, verifica:

1. **URL del sitio**: https://tu-sitio.netlify.app
2. **Login funciona**: Usuario `kmita`, Password `analytics2024`
3. **Datos se cargan**: Abre la consola (F12) y busca:
   - `✅ Datos cargados: XXX órdenes`
   - `✅ [ADAPTER] Datos adaptados correctamente`
4. **Gráficos muestran datos**: Verifica que no estén vacíos
5. **Tablas muestran datos**: Verifica que tengan filas

## 🐛 Logs de Depuración

Para ver qué está pasando, abre la consola del navegador (F12) y busca:

```
[SEGMENTOS] Segmentos encontrados en los datos
[GEO] Estados encontrados
[FULFILLMENT] Datos mensuales
[PAYMENT] Métodos de pago encontrados
```

## 📞 Contacto y Soporte

Si los problemas persisten:
1. Abre `diagnostico-simple.html`
2. Toma capturas de pantalla de los resultados
3. Comparte los logs de la consola del navegador

## ✅ Checklist Final

- [ ] Config.js tiene el SHEET_ID correcto
- [ ] Google Sheets es público (cualquiera con el enlace puede ver)
- [ ] Las columnas en Google Sheets tienen los nombres correctos
- [ ] El navegador no tiene caché antiguo
- [ ] Los archivos están en Netlify
- [ ] El sitio carga sin errores en la consola
- [ ] Los datos aparecen en las tablas
- [ ] Los gráficos muestran información

---

**Última actualización**: $(date)
**Versión**: 1.0.0
