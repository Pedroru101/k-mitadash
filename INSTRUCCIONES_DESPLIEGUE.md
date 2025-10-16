# 🎯 Instrucciones Paso a Paso - Despliegue en Netlify

## 📋 Método Recomendado: Netlify Drop (Sin Código)

### ✅ Paso 1: Preparar el Proyecto

**Ya está listo** ✓ No necesitas hacer nada, todos los archivos están configurados.

---

### ✅ Paso 2: Ir a Netlify Drop

1. Abre tu navegador
2. Ve a: **https://app.netlify.com/drop**
3. Si no tienes cuenta, crea una (es gratis)

---

### ✅ Paso 3: Arrastrar la Carpeta

1. Abre el explorador de archivos
2. Busca la carpeta **`k-mitadash`**
3. **Arrastra toda la carpeta** a la zona que dice "Drag & Drop"

```
┌─────────────────────────────────────┐
│                                     │
│     📁 Arrastra tu carpeta aquí    │
│                                     │
│     k-mitadash/                     │
│                                     │
└─────────────────────────────────────┘
```

---

### ✅ Paso 4: Esperar el Despliegue

Netlify procesará los archivos (toma 30-60 segundos):

```
⏳ Uploading files...
⏳ Processing...
✅ Site is live!
```

---

### ✅ Paso 5: Obtener tu URL

Netlify te dará una URL como:

```
https://random-name-123456.netlify.app
```

**¡Tu dashboard ya está en línea!** 🎉

---

## 🎨 Personalizar el Nombre del Sitio

### Paso 1: Ir a Site Settings

1. En Netlify, haz clic en tu sitio
2. Ve a **Site settings**

### Paso 2: Cambiar el Nombre

1. En la sección **Site information**
2. Haz clic en **Change site name**
3. Escribe: `k-mita-analytics`
4. Guarda

**Nueva URL:** `https://k-mita-analytics.netlify.app`

---

## 🔧 Configuración Importante

### Antes de Desplegar: Actualizar config.js

**⚠️ IMPORTANTE:** Debes actualizar el SHEET_ID en `config.js`

#### Paso 1: Obtener tu SHEET_ID

1. Abre tu Google Sheet
2. Mira la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_SHEET_ID/edit
   ```
3. Copia el SHEET_ID (la parte entre `/d/` y `/edit`)

#### Paso 2: Actualizar config.js

1. Abre el archivo `config.js`
2. Busca la línea:
   ```javascript
   SHEET_ID: '1fWJxqNKv7Fm0uldTh7RhxwgVXpdWnp7dR4HsXn8bfZ0',
   ```
3. Reemplaza con tu SHEET_ID:
   ```javascript
   SHEET_ID: 'TU_SHEET_ID_AQUI',
   ```
4. Guarda el archivo

#### Paso 3: Hacer Google Sheet Público

1. Abre tu Google Sheet
2. Haz clic en **Compartir** (botón azul arriba a la derecha)
3. Cambia a: **"Cualquiera con el enlace puede ver"**
4. Copia el enlace
5. Guarda

---

## 🔐 Configurar Credenciales de Login

Por defecto, las credenciales son:
- **Usuario:** `kmita`
- **Contraseña:** `analytics2024`

### Para Cambiar las Credenciales:

1. Abre `config.js`
2. Busca:
   ```javascript
   AUTH: {
       USERNAME: 'kmita',
       PASSWORD: 'analytics2024'
   }
   ```
3. Cambia a tus credenciales:
   ```javascript
   AUTH: {
       USERNAME: 'tu_usuario',
       PASSWORD: 'tu_contraseña_segura'
   }
   ```
4. Guarda

---

## 🔄 Actualizar el Sitio Después de Cambios

### Opción 1: Netlify Drop (Más Fácil)

1. Haz tus cambios en los archivos
2. Ve a: https://app.netlify.com/drop
3. Arrastra la carpeta actualizada de nuevo
4. Netlify actualizará el sitio

### Opción 2: Desde el Dashboard de Netlify

1. Ve a tu sitio en Netlify
2. **Deploys** → **Drag and drop**
3. Arrastra la carpeta actualizada

---

## ✅ Verificar que Todo Funciona

Después de desplegar, verifica:

### 1. Sitio Carga
- [ ] Abre la URL de tu sitio
- [ ] La página principal carga correctamente

### 2. Login Funciona
- [ ] Ingresa usuario y contraseña
- [ ] Puedes acceder al dashboard

### 3. Datos se Cargan
- [ ] El dashboard muestra métricas
- [ ] Los gráficos se renderizan
- [ ] Las tablas tienen datos

### 4. No Hay Errores
- [ ] Abre la consola del navegador (F12)
- [ ] No hay errores en rojo
- [ ] Los datos se cargan correctamente

---

## 🐛 Solución de Problemas Comunes

### Problema: "Page not found"

**Solución:**
1. Verifica que el archivo `_redirects` esté en la carpeta
2. Contenido debe ser:
   ```
   /* /index.html 200
   ```

### Problema: "Failed to load data"

**Solución:**
1. Verifica que Google Sheet sea público
2. Verifica SHEET_ID en `config.js`
3. Abre consola (F12) para ver el error exacto

### Problema: Login no funciona

**Solución:**
1. Verifica credenciales en `config.js`
2. Limpia caché del navegador (Ctrl+Shift+R)
3. Verifica que no haya errores en consola

### Problema: Gráficos no se muestran

**Solución:**
1. Verifica que los datos se carguen (consola F12)
2. Verifica que Google Sheet tenga datos
3. Verifica columnas: `shipping_province`, `payment_method`

---

## 📊 Estructura de URLs

Después del despliegue:

| Página | URL |
|--------|-----|
| **Inicio** | `https://tu-sitio.netlify.app/` |
| **Dashboard** | `https://tu-sitio.netlify.app/dashboard` |
| **Informe Mensual** | `https://tu-sitio.netlify.app/informe` |
| **Debug** | `https://tu-sitio.netlify.app/debug.html` |

---

## 🎉 ¡Listo!

Tu dashboard K-mita Analytics está ahora:

✅ **En línea 24/7**  
✅ **Con HTTPS automático** (seguro)  
✅ **En CDN global** (rápido en todo el mundo)  
✅ **Sin costo** (plan gratuito de Netlify)  

---

## 📞 Recursos Adicionales

- **Guía Completa:** `DESPLIEGUE_NETLIFY.md`
- **Guía Rápida:** `README_DESPLIEGUE.md`
- **Netlify Docs:** https://docs.netlify.com/
- **Soporte Netlify:** https://answers.netlify.com/

---

## ⏱️ Resumen de Tiempos

| Método | Tiempo |
|--------|--------|
| Netlify Drop | 2-3 minutos |
| Con Script | 3-5 minutos |
| CLI Manual | 5-10 minutos |
| Con GitHub | 10-15 minutos (primera vez) |

---

**¿Necesitas ayuda?** Revisa los archivos de documentación o contacta al equipo de soporte.

**Fecha:** 16 de octubre de 2025  
**Versión:** 2.0
