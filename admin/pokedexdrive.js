/**
 * Pokedex Drive Meta-Constructor v8.1 (Title Fix)
 * Genera un archivo HTML 'Viewer-Only' con:
 * 1. Reemplazo GLOBAL de título (Header + Title tag).
 * 2. Versión dinámica por fecha.
 * 3. Base de datos filtrada.
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
        log("Iniciando constructor Pokedex Drive v8.1...", "active");
        generatedBlobUrl = null;

        try {
            // --- PASO 1: Obtener Recursos Base ---
            await wait(300);
            log("Leyendo código fuente del visor...");
            
            const [htmlRaw, cssRaw, jsRaw] = await Promise.all([
                fetchText('../index.html'),
                fetchText('../style.css'),
                fetchText('../main.js')
            ]);
            
            updateProgress(30);

            // --- PASO 2: Procesar HTML (Limpieza) ---
            log("Limpiando dependencias externas...");
            let htmlContent = htmlRaw;

            htmlContent = htmlContent.replace(/<link rel="stylesheet" href="style.css">/, '');
            htmlContent = htmlContent.replace(/<script>[\s\S]*?manifest\.json[\s\S]*?<\/script>/, '');
            htmlContent = htmlContent.replace(/<script src="main.js" defer><\/script>/, '');
            htmlContent = htmlContent.replace(/<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/, '');

            updateProgress(50);

            // --- PASO 3: Filtrado y Serialización de Datos ---
            await wait(200);
            log("Empaquetando gamas activas...", "active");

            const activeCheckboxes = document.querySelectorAll('.gama-checkbox:checked');
            const activeKeys = new Set();
            activeCheckboxes.forEach(cb => activeKeys.add(cb.dataset.key));

            const sourceSchemas = window.APP_DB.schemas;
            const sourceProducts = window.APP_DB.products;
            const filteredSchemas = {};
            const filteredProducts = [];

            activeKeys.forEach(key => { if (sourceSchemas[key]) filteredSchemas[key] = sourceSchemas[key]; });
            sourceProducts.forEach(p => { if (activeKeys.has(p.schema_key)) filteredProducts.push(p); });

            log(`> Objetos empaquetados: ${filteredProducts.length}`);

            const staticBootloader = `
    <style>
        ${cssRaw}
    </style>
    <script>
        /** * Pokedex Drive - Offline Data Layer */
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

            // --- PASO 4: Personalización e Inyección ---
            log("Personalizando UI y versión...");

            // 4.1 Calcular Fecha (v.dd.mm.aa)
            const date = new Date();
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yy = String(date.getFullYear()).slice(-2);
            const versionString = `v.${dd}.${mm}.${yy}`;

            // 4.2 Reemplazo GLOBAL de Título (FIX v8.1)
            // Usamos la bandera /g para reemplazar TANTO el <title> como el <h1>
            htmlContent = htmlContent.replace(/Pokedex LG/g, 'Pokedex Drive');

            // 4.3 Reemplazar Versión en Header
            htmlContent = htmlContent.replace(
                /<span class="app-version">.*?<\/span>/, 
                `<span class="app-version">${versionString}</span>`
            );

            // 4.4 Inyección de Texto Info
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

            let jsModified = jsRaw;
            const fetchLogicRegex = /if\s*\(dom\.readmeContent\.textContent\s*===\s*""[\s\S]*?catch\s*\(error\)\s*\{[\s\S]*?\}\s*?\}/;
            jsModified = jsModified.replace(fetchLogicRegex, `dom.readmeContent.textContent = ${JSON.stringify(infoText)};`);

            const safeJs = jsModified.replace(/<\/script>/g, '<\\/script>');
            const mainJsBlock = `<script>\n${safeJs}\n</script>`;

            // 4.5 Ensamblaje HTML final
            htmlContent = htmlContent.replace('</head>', `${staticBootloader}\n</head>`);
            htmlContent = htmlContent.replace('</body>', `${mainJsBlock}\n</body>`);
            
            // Reforzar título de pestaña con versión
            htmlContent = htmlContent.replace(/<title>.*?<\/title>/, `<title>Pokedex Drive (${versionString})</title>`);

            updateProgress(90);

            // --- PASO 5: Generación y Descarga ---
            await wait(400);
            log("Generando binario .html...", "success");

            const blob = new Blob([htmlContent], { type: 'text/html' });
            generatedBlobUrl = URL.createObjectURL(blob);

            updateProgress(100);

            ui.closeBtn.style.display = 'block';
            ui.actions.style.display = 'block';
            triggerDownload(generatedBlobUrl, versionString);

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

    function triggerDownload(url, versionTag) {
        const a = document.createElement('a');
        a.href = url;
        const safeVer = versionTag.replace(/\./g, '-');
        a.download = `PokedexDrive_${safeVer}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});