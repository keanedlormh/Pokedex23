/**
 * Pokedex Drive Meta-Constructor v7.0 (Filtered Viewer Edition)
 * Genera un archivo HTML 'Viewer-Only' (sin admin) que contiene
 * ÚNICAMENTE los datos de las gamas activas en la biblioteca actual.
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
            // --- PASO 1: Obtener Recursos Base (Archivos Físicos) ---
            await wait(300);
            log("Leyendo código fuente del visor...");
            
            // Carga paralela para eficiencia
            const [htmlRaw, cssRaw, jsRaw] = await Promise.all([
                fetchText('../index.html'),
                fetchText('../style.css'),
                fetchText('../main.js')
            ]);
            
            updateProgress(30);

            // --- PASO 2: Procesar HTML (Limpieza) ---
            log("Limpiando dependencias externas...");
            let htmlContent = htmlRaw;

            // 2.1 Eliminar link CSS externo (lo inyectaremos inline)
            htmlContent = htmlContent.replace(/<link rel="stylesheet" href="style.css">/, '');

            // 2.2 Eliminar Bootloader AJAX original
            // Elimina el bloque <script> que carga manifest.json y hace los XHR
            htmlContent = htmlContent.replace(/<script>[\s\S]*?manifest\.json[\s\S]*?<\/script>/, '');

            // 2.3 Eliminar referencia externa a main.js (lo inyectaremos inline)
            htmlContent = htmlContent.replace(/<script src="main.js" defer><\/script>/, '');

            // 2.4 Eliminar acceso al Admin (Seguridad y Limpieza)
            // Busca el botón/enlace al admin y lo elimina del HTML
            htmlContent = htmlContent.replace(/<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/, '');

            updateProgress(50);

            // --- PASO 3: Filtrado y Serialización de Datos (Lógica Nueva) ---
            await wait(200);
            log("Analizando gamas activas en biblioteca...", "active");

            // 3.1 Detectar Gamas Activas desde el DOM (Checkboxes)
            // admin.js renderiza esto al inicio, así que el DOM existe aunque el modal esté cerrado.
            const activeCheckboxes = document.querySelectorAll('.gama-checkbox:checked');
            const activeKeys = new Set();
            
            activeCheckboxes.forEach(cb => {
                activeKeys.add(cb.dataset.key);
            });

            log(`> Gamas seleccionadas: ${activeKeys.size}`);

            // 3.2 Filtrar Base de Datos Global (APP_DB)
            const sourceSchemas = window.APP_DB.schemas;
            const sourceProducts = window.APP_DB.products;

            const filteredSchemas = {};
            const filteredProducts = [];

            // Solo copiamos esquemas activos
            activeKeys.forEach(key => {
                if (sourceSchemas[key]) {
                    filteredSchemas[key] = sourceSchemas[key];
                }
            });

            // Solo copiamos productos cuya gama esté activa
            sourceProducts.forEach(p => {
                if (activeKeys.has(p.schema_key)) {
                    filteredProducts.push(p);
                }
            });

            log(`> Productos empaquetados: ${filteredProducts.length}`);

            // 3.3 Crear Bootloader Estático
            const staticBootloader = `
    <style>
        ${cssRaw}
    </style>
    <script>
        /** * Pokedex Drive - Offline Data Layer
         * Generated: ${new Date().toLocaleString()}
         * Gamas: ${Array.from(activeKeys).join(', ') || 'Ninguna'}
         */
        window.APP_DB = {
            products: ${JSON.stringify(filteredProducts)},
            schemas: ${JSON.stringify(filteredSchemas)},
            // Métodos dummy para compatibilidad (Read-Only)
            registerProduct: function(p) { this.products.push(p); },
            registerSchema: function(k, s) { this.schemas[k] = s; }
        };
        // Flag de entorno
        window.IS_POKEDEX_DRIVE = true;
    </script>
            `;

            updateProgress(75);

            // --- PASO 4: Ensamblaje Final ---
            log("Inyectando código y estilos...");

            // Inyectar CSS + Datos en el HEAD
            htmlContent = htmlContent.replace('</head>', `${staticBootloader}\n</head>`);

            // Inyectar Lógica Main.js en el BODY (evitando cierre prematuro de script)
            const safeJs = jsRaw.replace(/<\/script>/g, '<\\/script>');
            const mainJsBlock = `<script>\n${safeJs}\n</script>`;
            
            htmlContent = htmlContent.replace('</body>', `${mainJsBlock}\n</body>`);

            // Cambiar Título para diferenciar
            htmlContent = htmlContent.replace(/<title>.*?<\/title>/, '<title>Pokedex Drive (Viewer)</title>');

            updateProgress(90);

            // --- PASO 5: Generación y Descarga ---
            await wait(400);
            log("Generando binario .html...", "success");

            const blob = new Blob([htmlContent], { type: 'text/html' });
            generatedBlobUrl = URL.createObjectURL(blob);

            updateProgress(100);

            // Activar UI final
            ui.closeBtn.style.display = 'block';
            ui.actions.style.display = 'block';

            // Descarga automática
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

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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