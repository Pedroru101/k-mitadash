# 🚀 Despliegue Rápido en Netlify

## ⚡ 3 Formas de Desplegar

### 🎯 Opción 1: Netlify Drop (Más Fácil - 2 minutos)

1. **Ve a:** https://app.netlify.com/drop
2. **Arrastra** la carpeta `k-mitadash` completa
3. **¡Listo!** Tu sitio estará en línea

**URL resultante:** `https://random-name-123456.netlify.app`

---

### 🎯 Opción 2: Con Script Automatizado (Recomendado)

#### Windows:
```cmd
cd k-mitadash
deploy.bat
```

#### Mac/Linux:
```bash
cd k-mitadash
chmod +x deploy.sh
./deploy.sh
```

El script verificará todo y te guiará paso a paso.

---

### 🎯 Opción 3: Netlify CLI Manual

```bash
# 1. Instalar Netlify CLI (solo primera vez)
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Desplegar
cd k-mitadash
netlify deploy --prod
```

---

## ⚙️ Configuración Previa

### 1. Actualizar `config.js`

Abre `config.js` y actualiza:

```javascript
GOOGLE_SHEETS: {
    SHEET_ID: 'TU_GOOGLE_SHEET_ID_AQUI',  // ← Cambiar esto
    // ...
}
```

**¿Dónde encontrar el SHEET_ID?**

En la URL de tu Google Sheet:
```
https://docs.google.com/spreadsheets/d/ESTE_ES_EL_SHEET_ID/edit
                                        ^^^^^^^^^^^^^^^^^^^^
```

### 2. Hacer Google Sheet Público

1. Abre tu Google Sheet
2. **Compartir** → **Cambiar a "Cualquiera con el enlace puede ver"**
3. Guardar

---

## 📋 Archivos Necesarios (Ya Incluidos)

✅ `netlify.toml` - Configuración de Netlify  
✅ `_redirects` - Reglas de redirección  
✅ `package.json` - Metadatos del proyecto  
✅ `index.html` - Página principal  
✅ `shopify-analytics-dashboard.html` - Dashboard  
✅ `config.js` - Configuración  
✅ `sample-data.json` - Datos de respaldo  

---

## 🎨 Personalizar URL

Después de desplegar:

1. Ve a tu sitio en Netlify
2. **Site settings** → **Change site name**
3. Elige: `k-mita-analytics`
4. Tu URL será: `https://k-mita-analytics.netlify.app`

---

## 🔒 Seguridad

### Credenciales de Login

Por defecto:
- **Usuario:** `kmita`
- **Contraseña:** `kmita2025`

**Para cambiar:**

Edita `config.js`:
```javascript
AUTH: {
    USERNAME: 'tu_usuario',
    PASSWORD: 'tu_contraseña_segura'
}
```

---

## 🔄 Actualizar el Sitio

### Con GitHub (Automático):

```bash
git add .
git commit -m "Actualización"
git push
```

Netlify desplegará automáticamente.

### Con CLI:

```bash
netlify deploy --prod
```

### Con Drop:

Arrastra la carpeta actualizada de nuevo.

---

## 🐛 Solución de Problemas

### "Page not found"
- Verifica que `_redirects` esté en la raíz
- Contenido: `/* /index.html 200`

### "Failed to load data"
- Verifica que Google Sheet sea público
- Verifica SHEET_ID en `config.js`
- Abre consola (F12) para ver errores

### "Login no funciona"
- Verifica credenciales en `config.js`
- Limpia caché del navegador (Ctrl+Shift+R)

---

## 📊 Verificar Despliegue

Después de desplegar, verifica:

1. ✅ Sitio carga correctamente
2. ✅ Login funciona
3. ✅ Dashboard muestra datos
4. ✅ Gráficos se renderizan
5. ✅ No hay errores en consola (F12)

---

## 🎉 URLs de Ejemplo

Después del despliegue tendrás:

- **Dashboard:** `https://tu-sitio.netlify.app/`
- **Analytics:** `https://tu-sitio.netlify.app/dashboard`
- **Informe Mensual:** `https://tu-sitio.netlify.app/informe-mensual.html`

---

## 📞 Recursos

- **Guía Completa:** `DESPLIEGUE_NETLIFY.md`
- **Netlify Docs:** https://docs.netlify.com/
- **Netlify Drop:** https://app.netlify.com/drop
- **Netlify CLI:** https://cli.netlify.com/

---

## ⏱️ Tiempo Estimado

- **Netlify Drop:** 2 minutos
- **Con Script:** 3 minutos
- **CLI Manual:** 5 minutos
- **Con GitHub:** 10 minutos (primera vez)

---

**¡Tu dashboard estará en línea en minutos! 🐈**
