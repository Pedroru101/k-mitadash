# 🚀 Guía de Despliegue - K-mita Analytics Dashboard

## 📋 Pre-requisitos

### 1. Google Sheets API Setup
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita **Google Sheets API**
4. Ve a **Credenciales** → **Crear Credenciales** → **Clave de API**
5. Copia la API Key generada

### 2. Configurar Google Sheets
1. Abre tu Google Sheets: `https://docs.google.com/spreadsheets/d/1BrEpAFNBYeW-N36_nvlyVivWsrkirTGpTuHy7AnCMi0`
2. Verifica que tengas las hojas:
   - `Monthly_Analysis - Orders_Data`
   - `Monthly_Analysis - Customers_Data`
3. **Hacer público el documento**:
   - Clic en **Compartir**
   - **Cambiar a "Cualquier persona con el enlace puede ver"**
   - Copiar el enlace

## ⚙️ Configuración del Dashboard

### 1. Actualizar API Key
Edita `k-mitadash/config.js`:

```javascript
GOOGLE_SHEETS: {
    SHEET_ID: '1BrEpAFNBYeW-N36_nvlyVivWsrkirTGpTuHy7AnCMi0',
    API_KEY: 'TU_API_KEY_REAL_AQUI', // ⚠️ REEMPLAZAR
    ORDERS_SHEET: 'Monthly_Analysis - Orders_Data',
    CUSTOMERS_SHEET: 'Monthly_Analysis - Customers_Data'
}
```

### 2. Verificar Credenciales de Acceso
En `config.js`:
```javascript
AUTH: {
    USERNAME: 'kmita',
    PASSWORD: 'analytics2024'
}
```

## 🌐 Despliegue

### Opción 1: Servidor Web Local
```bash
# Usando Python
cd k-mitadash
python -m http.server 8000

# Usando Node.js
npx http-server -p 8000

# Acceder en: http://localhost:8000
```

### Opción 2: Netlify (Recomendado)
1. Sube la carpeta `k-mitadash` a tu repositorio Git
2. Conecta Netlify a tu repositorio
3. Configura las variables de entorno en Netlify:
   - `GOOGLE_SHEETS_API_KEY`
   - `GOOGLE_SHEETS_SHEET_ID`

### Opción 3: Vercel
```bash
cd k-mitadash
npx vercel --prod
```

### Opción 4: GitHub Pages
1. Sube a GitHub
2. Ve a Settings → Pages
3. Selecciona la rama y carpeta
4. Accede a `https://tu-usuario.github.io/tu-repo`

## 🔧 Verificación Post-Despliegue

### 1. Prueba de Conexión
1. Abre el dashboard desplegado
2. Abre **Consola del Navegador** (F12)
3. Busca mensajes de error o éxito
4. Verifica que aparezca: `✅ Datos K-mita cargados: X órdenes, Y clientes`

### 2. Prueba de Funcionalidades
- [ ] Login con credenciales `kmita` / `analytics2024`
- [ ] Carga de KPIs (ingresos, órdenes, clientes)
- [ ] Gráficos se renderizan correctamente
- [ ] Tablas muestran datos reales
- [ ] Filtros de tiempo funcionan
- [ ] Botón de refresh actualiza datos

### 3. Verificación de Datos
- [ ] Los números coinciden con Google Sheets
- [ ] Los nombres de clientes aparecen correctamente
- [ ] Las fechas se muestran en formato correcto
- [ ] Los montos están en pesos mexicanos (MXN)

## 🚨 Solución de Problemas Comunes

### Error 403 - Forbidden
```
❌ Problema: API Key sin permisos
✅ Solución: 
   1. Verifica que Google Sheets API esté habilitada
   2. Haz el documento público
   3. Regenera la API Key si es necesario
```

### Error 404 - Not Found
```
❌ Problema: Documento o hoja no encontrada
✅ Solución:
   1. Verifica el SHEET_ID en config.js
   2. Confirma nombres exactos de las hojas
   3. Asegúrate de que las hojas tengan datos
```

### Error CORS
```
❌ Problema: Blocked by CORS policy
✅ Solución:
   1. Usa un servidor web (no abrir archivo directamente)
   2. Configura headers CORS si usas servidor propio
   3. Usa servicios como Netlify/Vercel
```

### Sin datos en gráficos
```
❌ Problema: Gráficos vacíos
✅ Solución:
   1. Verifica estructura de columnas en Google Sheets
   2. Confirma que hay datos en las hojas
   3. Revisa consola para errores de parsing
```

## 📊 Estructura de Datos Esperada

### Orders Data (Campos Críticos)
```
✅ Requeridos:
- order_id
- total_price
- created_at
- customer_email

✅ Opcionales pero Recomendados:
- total_kilos
- total_bags
- shipping_province
- customer_segment
- product_details
```

### Customers Data (Campos Críticos)
```
✅ Requeridos:
- customer_id
- email
- total_spent
- orders_count

✅ Opcionales pero Recomendados:
- first_name, last_name
- customer_segment
- address_province
- days_since_last_order
```

## 🔄 Mantenimiento

### Actualización de Datos
- Los datos se actualizan automáticamente cada 5 minutos
- Usa el botón "🔄 Actualizar Datos" para refresh manual
- Los datos se cachean para mejor performance

### Monitoreo
- Revisa logs en la consola del navegador
- Monitorea el status en la parte superior del dashboard
- Configura alertas si los datos no se actualizan

### Backup
- Mantén una copia de `config.js` con las credenciales
- Respalda el archivo `.env` de forma segura
- Documenta cualquier cambio en la estructura de datos

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo de K-mita 🐱