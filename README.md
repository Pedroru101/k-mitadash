# 📊 K-mita Dashboard

Dashboard interactivo para análisis de productos de arena biodegradable K-mita. Una aplicación web moderna que transforma datos de Shopify en visualizaciones comprensibles y actionables.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Características Principales

### 📈 **Visualizaciones Interactivas**
- **Precio vs Peso**: Análisis de correlación entre precio y peso de productos
- **Inventario por Producto**: Monitoreo de stock con código de colores
- **Distribución de Precios**: Segmentación por rangos de precios
- **Estado de Productos**: Productos activos vs archivados
- **Precio por Kilogramo**: Análisis de eficiencia de precios
- **Productos con Promociones**: Identificación de ofertas especiales
- **Distribución por Peso**: Categorización por rangos de peso
- **Análisis Temporal**: Productos creados por año
- **Análisis de Inventario**: Niveles de stock categorizados
- **Segmentación Premium**: Clasificación económico/medio/premium/luxury

### 🔍 **Sistema de Filtros Avanzado**
- **Búsqueda en tiempo real** por nombre de producto
- **Filtro por estado**: Activos/Archivados
- **Rango de precios**: 5 categorías predefinidas
- **Filtro por peso**: Desde 1kg hasta 61kg+
- **Nivel de inventario**: Stock bajo/medio/alto/negativo
- **Tipo de producto**: Promociones vs regulares
- **Filtro temporal**: Por año de creación
- **Limpieza rápida**: Botón para resetear todos los filtros

### 📊 **Panel de Estadísticas**
- Total de productos en catálogo
- Inventario total disponible
- Precio promedio de productos
- Cantidad de productos activos

## 🚀 Instalación y Uso

### Opción 1: Servidor Python (Recomendado)
```bash
# Clonar el repositorio
git clone https://github.com/Pedroru101/k-mitadash.git
cd k-mitadash

# Ejecutar servidor local
python server.py
```

### Opción 2: Servidor Web Local
```bash
# Con Node.js
npx http-server

# Con PHP
php -S localhost:8000

# Con Python 3
python -m http.server 8000
```

### Opción 3: Abrir directamente
Simplemente abre `index.html` en tu navegador (funcionalidad limitada por CORS)

## 📁 Estructura del Proyecto

```
k-mitadash/
├── index.html          # Página principal del dashboard
├── styles.css          # Estilos y diseño responsivo
├── script.js           # Lógica de aplicación y gráficas
├── server.py           # Servidor Python con CORS
├── shopify.jon.json    # Datos de productos de Shopify
└── README.md           # Documentación del proyecto
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Visualizaciones**: Chart.js 3.x
- **Servidor**: Python HTTP Server
- **Diseño**: CSS Grid, Flexbox, Responsive Design
- **Datos**: JSON de API Shopify

## 📊 Tipos de Gráficas Implementadas

| Gráfica | Tipo | Propósito |
|---------|------|-----------|
| Precio vs Peso | Scatter | Correlación precio-peso |
| Inventario | Bar | Niveles de stock |
| Distribución Precios | Doughnut | Rangos de precios |
| Estado Productos | Pie | Activos vs archivados |
| Precio/kg | Bar | Eficiencia de precios |
| Promociones | Doughnut | Productos en oferta |
| Distribución Peso | Bar | Categorías por peso |
| Creación Temporal | Line | Tendencia de creación |
| Análisis Inventario | Doughnut | Niveles de stock |
| Segmentación Premium | Polar Area | Categorías de precio |

## 🎨 Características de Diseño

- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Tema Moderno**: Gradientes y sombras suaves
- **Código de Colores**: Intuitivo para diferentes estados
- **Animaciones**: Transiciones suaves y efectos hover
- **Accesibilidad**: Contraste adecuado y navegación por teclado

## 📈 Insights de Negocio

El dashboard permite identificar:

- **Productos con mejor relación precio/peso**
- **Niveles críticos de inventario**
- **Efectividad de promociones**
- **Tendencias de creación de productos**
- **Distribución de precios en el catálogo**
- **Productos premium vs económicos**

## 🔧 Personalización

### Agregar Nuevos Filtros
```javascript
// En script.js, función applyFilters()
const newFilter = document.getElementById('newFilter');
const newFilterValue = newFilter.value;
// Agregar lógica de filtrado
```

### Crear Nueva Gráfica
```javascript
function generateNewChart() {
    const ctx = document.getElementById('newChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // o line, pie, doughnut, etc.
        data: {
            // Configuración de datos
        },
        options: {
            // Opciones de la gráfica
        }
    });
}
```

## 🐛 Solución de Problemas

### Las gráficas no cargan
- Verificar que el servidor esté ejecutándose
- Comprobar la consola del navegador para errores
- Asegurar que `shopify.jon.json` esté en el directorio correcto

### Filtros no funcionan
- Verificar que todos los elementos HTML tengan los IDs correctos
- Comprobar que los event listeners estén configurados

### Problemas de CORS
- Usar el servidor Python incluido (`python server.py`)
- O cualquier servidor web local

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Exportar gráficas como imágenes
- [ ] Filtros por rango de fechas personalizado
- [ ] Comparación entre productos
- [ ] Alertas de stock bajo
- [ ] Integración con API de Shopify en tiempo real
- [ ] Dashboard de métricas de ventas
- [ ] Modo oscuro/claro

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Pedro Ruiz** - [Pedroru101](https://github.com/Pedroru101)

## 🙏 Agradecimientos

- Chart.js por las excelentes librerías de visualización
- K-mita por los datos de productos
- Comunidad de desarrolladores por inspiración y feedback

---

⭐ Si este proyecto te fue útil, ¡dale una estrella en GitHub!

📧 Para soporte o consultas: [Crear un Issue](https://github.com/Pedroru101/k-mitadash/issues)