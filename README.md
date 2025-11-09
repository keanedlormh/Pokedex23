Enciclopedia Técnica v2.9.7

​Bienvenido a la Enciclopedia Técnica, una aplicación web estática diseñada para gestionar, buscar y comparar especificaciones de productos.

​Esta aplicación se divide en dos componentes principales:

​La Aplicación Pública (index.html): Una interfaz de solo lectura para que los usuarios puedan buscar, filtrar y ver las especificaciones de los productos.

​El Panel de Administración (admin/index.html): Una interfaz para cargar, editar y exportar los datos de los productos.

​La versión 2.9.7 estandariza el formato de datos en JSON. El sistema carga la base de datos a partir de dos fuentes definidas en manifest.json:

​Ficheros JSON de Gama Completa (ej. db/gamas/tvs.json): Para una carga masiva y eficiente.
​Ficheros JSON Individuales (ej. db/products/S95TR.json): Para añadir o sobrescribir modelos específicos fácilmente.

​Estructura de Ficheros
​La estructura del proyecto es fundamental, ya que manifest.json es el encargado de cargar todos los datos.

/
├── admin/
│   ├── index.html         # Interfaz del panel de administración
│   ├── admin.js           # Lógica del panel de administración
│   └── admin.css          # Estilos del panel de administración
│
├── db/
│   ├── manifest.json      # ¡El fichero más importante! Define qué cargar
│   │
│   ├── gamas/
│   │   ├── soundbars.json # Datos a granel para la gama "soundbars"
│   │   └── tvs.json       # Datos a granel para la gama "tvs"
│   │
│   ├── schemas/
│   │   ├── moduloSoundbars.js # Define la ESTRUCTURA de "soundbars"
│   │   └── moduloTVs.js       # Define la ESTRUCTURA de "tvs"
│   │
│   └── products/
│       │                    # Directorio para ficheros .json individuales
│       └── (ej: S95TR.json)
│
├── index.html             # Aplicación pública principal
├── main.js                # Lógica de la aplicación pública
├── style.css              # Estilos de la aplicación pública
└── README.md              # Este fichero


🚀 Cómo Ejecutar el Proyecto

¡Importante! Este proyecto no funcionará si abres index.html directamente desde el sistema de archivos (ej. file:///...).

Utiliza un servidor web local. Los bootloaders (tanto en index.html como en admin/index.html) usan XMLHttpRequest de forma síncrona para cargar el manifest.json y los ficheros de datos. Los navegadores bloquean estas solicitudes por razones de seguridad (CORS) cuando se ejecutan desde file:///.

La forma más sencilla de iniciarlo es usando la extensión "Live Server" en Visual Studio Code.

📖 Instrucciones de Uso

1. Aplicación Pública (index.html)

La interfaz principal permite a los usuarios encontrar productos:

Buscar: Utiliza la barra "Búsqueda por Modelo" para encontrar un producto específico por su nombre.

Filtrar por Gama: Selecciona una "Gama de Producto" (ej. "TVs") para ver los filtros disponibles para esa categoría.

Filtrar por Atributos: Una vez seleccionada una gama, puedes usar los "Filtros Inteligentes" para acotar la búsqueda por especificaciones.

Ver Detalles: Haz clic en un modelo de la lista de resultados para cargar su ficha técnica completa en el panel principal.

2. Panel de Administración (admin/index.html)

El panel de administración es el centro de control de la base de datos.

Editar un Modelo

Abre el panel de administración (ej. http://localhost:5500/admin/).

En el panel "1. Cargar Modelo", busca el producto que deseas editar (ej. "S95TR").

Haz clic sobre él en la lista. Sus datos se cargarán en el "2. Editor de Producto".

Modifica los valores que necesites en los campos de texto.

Asegúrate de que el campo "Nuevo Model ID" contiene el nombre de modelo correcto (ya sea el original para sobrescribir o uno nuevo para crear una copia).

Haz clic en "Exportar a .json". Esto descargará un fichero individual (ej. S95TR.json).

Exportar una Gama Completa (JSON)

En la barra de menú superior, ve a Exportar > Exportar Gama.

Selecciona la gama que deseas exportar (ej. "soundbars") en el desplegable.

La lista se poblará con todos los modelos de esa gama.

Haz clic en el botón "Exportar Gama a JSON".

Esto descargará un único fichero JSON que contiene todos los productos de esa gama (ej. GAMA_SOUNDBARS.json).

🔄 Flujo de Trabajo: Actualizar la Base de Datos

Existen dos métodos para actualizar la información. El Método A (Bulk JSON) es el recomendado para cambios masivos, mientras que el Método B (Individual JSON) es ideal para añadir o modificar un solo producto.

Método A: Actualización Masiva (Recomendado)

Este método actualiza una gama entera de una sola vez.

Edita: Ve al Admin Panel y edita todos los modelos que necesites usando el editor. (No necesitas exportarlos uno por uno).

Exporta: Ve al panel "Exportar Gama", selecciona la gama y haz clic en "Exportar Gama a JSON".

Renombra: Obtendrás un fichero como GAMA_SOUNDBARS.json. Renómbralo al nombre de fichero correspondiente en la base de datos (ej. soundbars.json).

Reemplaza: Copia este nuevo fichero y reemplaza el antiguo en la carpeta db/gamas/.

¡Listo! El manifest.json ya está configurado para cargar db/gamas/soundbars.json. Simplemente recarga la aplicación pública para ver los cambios.

Método B: Actualización Individual (.json)

Este método es para añadir o actualizar un único fichero .json a la vez.

Edita y Exporta: Sigue los pasos de "Editar un Modelo" y descarga el fichero .json (ej. S95TR.json).

Mueve: Coloca este fichero en la carpeta de productos (ej. db/products/S95TR.json).

Actualiza el Manifest: Este es el paso crucial. Abre db/manifest.json y añade manualmente la ruta a tu nuevo fichero en la lista de products correspondiente.

// db/manifest.json
{
    ...
    "products": {
        "soundbars": [
            "db/products/S95TR.json" // <-- Añadir la ruta aquí
        ],
        "tvs": []
    }
}


Recarga la aplicación. El bootloader ahora cargará tanto los ficheros JSON masivos como este fichero individual. Si un modelo existe en ambos, el fichero individual tendrá prioridad.

🧩 Flujo de Trabajo: Añadir una Nueva Categoría (Schema)

Si quieres añadir una categoría completamente nueva (ej. "Monitores"):

Crear el Schema: Crea un nuevo fichero db/schemas/moduloMonitors.js. Puedes copiar moduloTVs.js y modificar los grupos y atributos ("group", "code", "desc").

Crear el Fichero de Datos: Crea un fichero JSON vacío en db/gamas/monitors.json.

Actualizar el Manifest: Edita db/manifest.json para que el sistema reconozca la nueva categoría.

// db/manifest.json
{
    "schemas": [
        "db/schemas/moduloSoundbars.js",
        "db/schemas/moduloTVs.js",
        "db/schemas/moduloMonitors.js"  // <-- Añadir aquí
    ],
    "bulk_gamas": [
        "db/gamas/soundbars.json",
        "db/gamas/tvs.json",
        "db/gamas/monitors.json"      // <-- Añadir aquí
    ],
    "products": {
        "soundbars": [],
        "tvs": [],
        "monitors": []                  // <-- Añadir aquí
    }
}


Empezar a Añadir Datos:

Ve al Admin Panel. "Monitors" aparecerá ahora en el desplegable de "Exportar Gama".

Carga un modelo existente (de cualquier gama), cambia sus datos y "Nuevo Model ID", y expórtalo como un fichero .json individual (ej. MONITOR_MODELO1.json).

Añade ese fichero al manifest usando el Método B para empezar a poblar tu nueva categoría.