# Enciclopedia Técnica v2.5

Una aplicación web *frontend* pura diseñada para navegar, buscar y filtrar especificaciones de productos técnicos. El proyecto está construido con HTML, CSS y JavaScript vainilla, y utiliza un sistema de base de datos modular cargado en el cliente.

---

## ✨ Características Principales

* **Búsqueda Rápida:** Filtra por nombre de modelo en tiempo real.
* **Sistema de Gamas:** Soporta múltiples categorías de productos (ej. TVs, Soundbars).
* **Filtros Inteligentes:** Filtra productos por sus atributos específicos. El panel de filtros se actualiza según la gama seleccionada.
* **Vista de Detalles:** Una vista limpia de especificaciones al seleccionar un producto, ocultando los elementos de búsqueda.
* **Personalización de Tema:** Genera una nueva paleta de colores aleatoria (respetando el contraste) con el botón 🎨 en el menú de ajustes (⚙️).
* **Diseño Responsivo:** Funciona en dispositivos móviles y de escritorio.

---

## 📁 Estructura del Proyecto

* **`/` (Raíz):** Contiene los archivos principales de la aplicación (`index.html`, `main.js`, `style.css`).
* **`/db/schemas/`:** Contiene los archivos "esquema" (ej. `moduloTVs.js`). Estos archivos definen la **estructura** de una gama de productos (qué atributos tiene y en qué grupos se muestran).
* **`/db/[gama]/`:** (ej. `/db/tvs/` o `/db/soundbars/`) Contiene los archivos de **datos** de cada producto individual.

---

## 🚀 Cómo Añadir un Nuevo Producto

El flujo de trabajo para añadir un nuevo producto es el siguiente:

1.  **Crear el Archivo de Datos:**
    * Crea un nuevo archivo `.js` (ej. `mi-nuevo-tv.js`) en la carpeta de la gama correspondiente (ej. `/db/tvs/`).
    * Copia la estructura de un archivo existente.
    * Define un `model` (nombre único), un `schema_key` (la gama a la que pertenece, ej. 'tvs') y rellena el objeto `attributes` con los datos del producto.

2.  **Registrar el Archivo:**
    * Abre `index.html`.
    * Añade una nueva etiqueta `<script>` en la sección `<head>` que apunte a tu nuevo archivo.

    ```html
    ...
    <script src="db/tvs/mi-nuevo-tv.js" defer></script>
    ```

La aplicación cargará automáticamente el nuevo producto al iniciar.
