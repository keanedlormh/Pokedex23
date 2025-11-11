Enciclopedia Técnica - Admin Panel v3.2.0
Panel de administración integral para la gestión de la base de datos de la Enciclopedia Técnica. Esta herramienta permite a los administradores crear, editar y exportar tanto la estructura de datos (esquemas) como los productos individuales (modelos) sin necesidad de editar código manualmente.
🚀 Novedades en v3.2.0
Creación de Modelos desde Cero: Ahora es posible crear un nuevo producto seleccionando una gama existente (ej: TVs, Monitores) e introduciendo un nuevo Model ID. El sistema genera una plantilla vacía lista para rellenar.
Interfaz de Gestor de Modelos: El panel de búsqueda se ha rediseñado para acomodar tanto la búsqueda como la creación de nuevos items.
Soporte de Temas: Inclusión de un selector de tema Claro/Oscuro (Light/Dark Mode) persistente.
📋 Características Principales
1. Gestión de Modelos (Product Data)
Buscador en Tiempo Real: Filtra la base de datos cargada por nombre de modelo.
Edición Dinámica: Al cargar un modelo, el formulario se genera automáticamente basándose en su "Esquema" (Schema) asociado.
Creación de Nuevos Modelos: Genera nuevos archivos JSON para productos que no existen en la base de datos.
Exportación Individual: Descarga el archivo .json del producto editado listo para subir a la carpeta /db/products/.
2. Gestión de Esquemas (Data Structure)
Editor Visual: Crea o modifica la estructura de atributos de una categoría (ej: qué campos tiene un "TV").
Grupos y Atributos: Organiza los datos en secciones (ej: "Imagen", "Sonido", "Conectividad").
Exportación de Módulos: Genera el archivo .js del esquema listo para incluir en el manifest.json.
3. Herramientas de Gama
Exportación Masiva: Permite descargar un único archivo JSON (bulk_gama.json) que contiene todos los productos de una categoría específica.
4. Sistema (Core)
Bootloader Inteligente: Carga síncrona de la base de datos distribuida (manifiesto + esquemas + productos sueltos + gamas bulk) al iniciar la aplicación.
Interfaz Futurista: Diseño responsivo con efectos visuales, transiciones suaves y adaptabilidad móvil.
🛠️ Instalación y Uso
Debido a que la aplicación utiliza XMLHttpRequest para cargar módulos y archivos JSON locales, debe ejecutarse en un servidor web (no funcionará abriendo directamente el index.html por protocolo file:// debido a políticas de seguridad CORS).
Opción A: Visual Studio Code (Recomendado)
Instala la extensión "Live Server".
Haz clic derecho en admin/index.html y selecciona "Open with Live Server".
Opción B: Python
Si tienes Python instalado, abre una terminal en la raíz del proyecto y ejecuta:
python -m http.server 8000


Luego abre http://localhost:8000/admin/ en tu navegador.
📂 Estructura del Proyecto
/
├── admin/                  # Panel de Administración
│   ├── index.html          # Punto de entrada (v3.2.0)
│   ├── admin.js            # Lógica de la aplicación (Controladores, UI, Exportación)
│   └── admin.css           # Estilos (Tema Claro/Oscuro)
│
├── db/                     # Base de Datos (Simulada como sistema de archivos)
│   ├── manifest.json       # Índice maestro (lista de esquemas y archivos a cargar)
│   ├── schemas/            # Definiciones de estructura (.js)
│   │   ├── moduloTvs.js
│   │   └── ...
│   └── products/           # Datos de productos (.json)
│       ├── oled65c4.json
│       └── ...
│
└── index.html              # (Opcional) Frontend público de la enciclopedia


📖 Guía de Flujo de Trabajo
Cómo añadir un NUEVO producto (v3.2.0)
Ve al Gestor de Modelos.
En la sección "2. Crear Nuevo Modelo", selecciona la Gama (ej: TVs).
Escribe el Model ID (ej: OLED55G4).
Pulsa Crear y Editar.
Rellena los campos en el formulario que aparecerá.
Pulsa Guardar (arriba a la derecha) para descargar el .json.
Mueve ese archivo a /db/products/ y regístralo en /db/manifest.json.
Cómo crear una NUEVA categoría (Gama)
Ve a Editar Módulo de Gama.
En "Crear Nuevo Esquema", escribe una clave única (ej: barras_sonido).
Pulsa Crear y Editar.
Añade grupos (ej: "Audio") y atributos (ej: "Potencia", "Canales").
Pulsa Guardar para descargar el .js.
Mueve el archivo a /db/schemas/ y regístralo en /db/manifest.json.
📜 Historial de Versiones (Changelog)
v3.2.0 (Actual)
NEW: Implementada la creación de modelos vacíos desde el panel.
UI: Rediseño del panel "Hub de Modelos" para separar búsqueda y creación.
FIX: Unificación de la lógica de selectores de gama.
v3.1.5
UI: Sistema de temas Light/Dark persistente (localStorage).
DOC: Modal de información actualizado.
v3.1.4
UI: Menú de ajustes desplegable en la cabecera.
UX: Movido el enlace "Ver Enciclopedia" al menú de ajustes.
v3.1.2
CORE: Bootloader para carga síncrona de dependencias.
FIX: Corrección en la exportación de JSON (Model ID ahora es editable).
FIX: Corrección en la generación de módulos JS de esquemas.
v3.1.0
NEW: Panel General con tarjetas de navegación.
NEW: Diseño "Futuristic" inicial.

⚠️ Notas Técnicas
Persistencia: Este panel NO escribe directamente en el servidor (es una aplicación client-side). Al "Guardar", se genera una descarga de archivo. El administrador debe mover manualmente los archivos descargados a las carpetas correspondientes.
Base de Datos Global: La aplicación expone window.APP_DB como punto de acceso a todos los datos cargados en memoria.
