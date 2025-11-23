/**
 * Pokedex Drive Meta-Constructor v7.1 (Info Update)
 * Genera un archivo HTML 'Viewer-Only' con la BD filtrada e información estática incrustada.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- REFERENCIAS UI ---
    const ui = {
        trigger: document.getElementById('drive-builder-trigger'),
        modal: document.getElementById('drive-modal'),
        closeBtn: document.getElementById('drive-close-btn'),
        progress: document.getElementById('drive-progress-fill'),
        percent: document.getElementById('drive-percent-text'),
        log: document.getElementById('drive-log-console'),
        actions: document.getElementById('drive-action-area'),
        downloadBtn: document.getElementById('drive-download-again-btn')
    };

    let generatedBlobUrl = null;

    // --- LISTENERS ---
    if (ui.trigger) ui.trigger.addEventListener('click', startDriveBuild);
    if (ui.closeBtn) ui.closeBtn.addEventListener('click', () => ui.modal.style.display = 'none');
    if (ui.downloadBtn) ui.downloadBtn.addEventListener('click', () => { if (generatedBlobUrl) triggerDownload(generatedBlobUrl); });

    // --- PROCESO DE CONSTRUCCIÓN ---
    async function startDriveBuild() {
        // Reset UI
        ui.modal.style.display = 'block';
        ui.closeBtn.style.display = 'none';
        ui.actions.style.display = 'none';
        updateProgress(0);
        log("Iniciando constructor Pokedex Drive (Viewer Mode)...", "active");
        generatedBlobUrl = null;

        try {
            // --- PASO 1: Obtener Recursos Base ---
            await wait(300);
            log("Leyendo código fuente del visor...");
            
            // Carga paralela
            const [htmlRaw, cssRaw, jsRaw] = await Promise.all([
                fetchText('../index.html'),
                fetchText('../style.css'),
                fetchText('../main.js')
            ]);
            
            updateProgress(30);

            // --- PASO 2: Procesar HTML (Limpieza) ---
            log("Limpiando dependencias externas...");
            let htmlContent = htmlRaw;

            // Eliminar links y scripts externos
            htmlContent = htmlContent.replace(/<link rel="stylesheet" href="style.css">/, '');
            htmlContent = htmlContent.replace(/<script>[\s\S]*?manifest\.json[\s\S]*?<\/script>/, '');
            htmlContent = htmlContent.replace(/<script src="main.js" defer><\/script>/, '');
            htmlContent = htmlContent.replace(/<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/, '');

            updateProgress(50);

            // --- PASO 3: Filtrado y Serialización de Datos ---
            await wait(200);
            log("Empaquetando gamas activas...", "active");

            // Detectar Gamas Activas desde Checkboxes del Admin
            const activeCheckboxes = document.querySelectorAll('.gama-checkbox:checked');
            const activeKeys = new Set();
            activeCheckboxes.forEach(cb => activeKeys.add(cb.dataset.key));

            // Filtrar DB
            const sourceSchemas = window.APP_DB.schemas;
            const sourceProducts = window.APP_DB.products;
            const filteredSchemas = {};
            const filteredProducts = [];

            activeKeys.forEach(key => { if (sourceSchemas[key]) filteredSchemas[key] = sourceSchemas[key]; });
            sourceProducts.forEach(p => { if (activeKeys.has(p.schema_key)) filteredProducts.push(p); });

            log(`> Objetos empaquetados: ${filteredProducts.length}`);

            // Crear Bootloader Estático
            const staticBootloader = `
    <style>
        ${cssRaw}
    </style>
    <script>
        /** * Pokedex Drive - Offline Data Layer
         * Generated: ${new Date().toLocaleString()}
         */
        window.APP_DB = {
            products: ${JSON.stringify(filteredProducts)},
            schemas: ${JSON.stringify(filteredSchemas)},
            registerProduct: function(p) { this.products.push(p); },
            registerSchema: function(k, s) { this.schemas[k] = s; }
        };
        window.IS_POKEDEX_DRIVE = true;
    </script>
            `;

            updateProgress(75);

            // --- PASO 4: Inyección de Lógica y Texto Info ---
            log("Inyectando documentación y lógica...");

            // Texto literal solicitado por el usuario
            const infoText = `La aplicación Pokedex Drive es un visor web interactivo para un catálogo de modelos, implementado en HTML/CSS/JS como una aplicación offline con un sistema de datos integrados sobre productos y esquemas de atributos.

- **HTML**: Estructura con cabecera (título, ajustes, filtros), capas flexibles (barras laterales para búsqueda/lista de modelos, main para detalles), y modales (info, biblioteca). Incluye superposición para cierres.

- **CSS**: Tema básico con variables, fuentes dual (primaria: sans/serif legible; secundaria: mono/display), estilos para tarjetas, inputs, listas, specs (detalles agrupados), y responsive (media queries para mobile/desktop). Soporta transiciones y hover effects.

- **JavaScript**: Inicializa DB (productos ordenados, caches), listeners para inputs/clicks. Maneja:

  - Búsqueda/filtros: Dinámicos por gama/atributos, chips activos, render resultados.

  - Visualización: Muestra specs en <details>, expande/colapsa.

  - UI: Toggles panels/modales, temas (light/dark con tonos random), fuentes dual random.

  - Biblioteca: Gestión de gamas (activar/ocultar), import CSV (parser personalizado para schemas y datos).

  - Auxiliares: para colores, README para info modal.

🏴‍☠️`;

            // Modificamos el JS para reemplazar la función que busca README.md por este texto estático
            let jsModified = jsRaw;
            
            // Regex para encontrar el bloque condicional donde se intenta cargar el readme
            // Busca: if (dom.readmeContent.textContent === "" ... ) { ... }
            const fetchLogicRegex = /if\s*\(dom\.readmeContent\.textContent\s*===\s*""[\s\S]*?catch\s*\(error\)\s*\{[\s\S]*?\}\s*?\}/;
            
            // Reemplazo: Asignación directa del texto.
            // Usamos JSON.stringify para escapar correctamente saltos de línea y comillas en el string JS generado
            jsModified = jsModified.replace(
                fetchLogicRegex, 
                `dom.readmeContent.textContent = ${JSON.stringify(infoText)};`
            );

            // Escape final para el HTML
            const safeJs = jsModified.replace(/<\/script>/g, '<\\/script>');
            const mainJsBlock = `<script>\n${safeJs}\n</script>`;

            // Ensamblaje HTML final
            htmlContent = htmlContent.replace('</head>', `${staticBootloader}\n</head>`);
            htmlContent = htmlContent.replace('</body>', `${mainJsBlock}\n</body>`);
            htmlContent = htmlContent.replace(/<title>.*?<\/title>/, '<title>Pokedex Drive (Viewer)</title>');

            updateProgress(90);

            // --- PASO 5: Generación y Descarga ---
            await wait(400);
            log("Generando binario .html...", "success");

            const blob = new Blob([htmlContent], { type: 'text/html' });
            generatedBlobUrl = URL.createObjectURL(blob);

            updateProgress(100);

            ui.closeBtn.style.display = 'block';
            ui.actions.style.display = 'block';
            triggerDownload(generatedBlobUrl);

        } catch (error) {
            console.error(error);
            log(`ERROR CRÍTICO: ${error.message}`, "error");
            ui.progress.style.backgroundColor = 'var(--color-red-accent)';
            ui.closeBtn.style.display = 'block';
        }
    }

    // --- Helpers ---

    async function fetchText(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fallo al cargar ${url}`);
        return await res.text();
    }

    function log(message, type = '') {
        const prev = ui.log.querySelector('.active');
        if (prev) prev.classList.remove('active');
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = `> ${message}`;
        ui.log.appendChild(line);
        ui.log.scrollTop = ui.log.scrollHeight;
    }

    function updateProgress(percent) {
        ui.progress.style.width = `${percent}%`;
        ui.percent.textContent = `${percent}%`;
    }

    function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    function triggerDownload(url) {
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
        a.download = `PokedexDrive_Viewer_${date}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});