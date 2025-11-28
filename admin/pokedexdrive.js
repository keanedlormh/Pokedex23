/**
 * Pokedex Drive Engine v3.0
 * Módulo de compilación para generar versiones monolíticas offline.
 * * NOVEDADES v3.0:
 * - Personalización Total: Utiliza window.driveConfig (Título, Versión, Info).
 * - Parche "Readme Offline": Inyecta el texto de Info directamente en el HTML
 * para evitar el error de fetch('README.md').
 * - Filtrado Inteligente: Respeta las gamas activas/ocultas.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Configuración y Referencias DOM
    const UI = {
        triggerBtn: document.getElementById('drive-builder-trigger'),
        modal: document.getElementById('drive-modal'),
        closeBtn: document.getElementById('drive-close-btn'),
        progressBar: document.getElementById('drive-progress-fill'),
        progressText: document.getElementById('drive-percent-text'),
        console: document.getElementById('drive-log-console'),
        actionArea: document.getElementById('drive-action-area'),
        downloadBtn: document.getElementById('drive-download-final-btn'),
        overlay: document.getElementById('modal-overlay'),
        activeSchemaList: document.getElementById('schema-results-list') 
    };

    let isCompiling = false;

    // --- Event Listeners ---
    if (UI.triggerBtn) {
        UI.triggerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openDriveModal();
            startCompilationProcess();
        });
    }

    if (UI.downloadBtn) {
        UI.downloadBtn.addEventListener('click', () => {
            UI.downloadBtn.textContent = "¡Descarga iniciada!";
            setTimeout(() => {
                UI.downloadBtn.textContent = "Descargar HTML Offline";
                closeDriveModal();
            }, 2000);
        });
    }

    // --- Lógica Principal del Motor ---
    async function startCompilationProcess() {
        if (isCompiling) return;
        isCompiling = true;
        resetUI();
        
        try {
            log("Iniciando motor Pokedex Drive v3.0 (Custom & Filtered)...", "info");
            
            // 0. CARGAR CONFIGURACIÓN DE USUARIO
            // Obtenemos los datos del formulario "Configurar Info"
            const userConfig = window.driveConfig || { 
                title: "Pokedex Offline", 
                version: "v1.0", 
                introText: "Versión generada automáticamente." 
            };
            log(`Configuración cargada: ${userConfig.title} - ${userConfig.version}`, "info");

            // PASO 1: Recursos
            updateProgress(10, "Leyendo estructura fuente (../index.html)...");
            const indexHtml = await fetchResource('../index.html');
            
            updateProgress(25, "Leyendo estilos visuales (../style.css)...");
            const cssContent = await fetchResource('../style.css');
            
            updateProgress(40, "Leyendo núcleo lógico (../main.js)...");
            const jsContent = await fetchResource('../main.js');

            // PASO 2: Filtrado Robusto de Datos (Bridge Mode)
            updateProgress(50, "Analizando Biblioteca Virtual...");
            
            if (!window.APP_DB || !window.APP_DB.products) {
                throw new Error("No hay datos cargados en la memoria del Administrador.");
            }

            let activeKeys;
            if (window.ADMIN_CONTEXT && window.ADMIN_CONTEXT.activeSchemas) {
                activeKeys = window.ADMIN_CONTEXT.activeSchemas;
                log(`Puente ADMIN_CONTEXT detectado. Filtros activos: ${activeKeys.size}`, "success");
            } else {
                log("ADVERTENCIA: Puente no detectado. Exportando todo.", "warning");
                activeKeys = new Set(Object.keys(window.APP_DB.schemas));
            }

            // Filtrar Productos y Esquemas
            const rawProducts = window.APP_DB.products;
            const filteredProducts = rawProducts.filter(p => activeKeys.has(p.schema_key));
            
            const rawSchemas = window.APP_DB.schemas;
            const filteredSchemas = {};
            Object.keys(rawSchemas).forEach(key => {
                if (activeKeys.has(key)) {
                    filteredSchemas[key] = rawSchemas[key];
                }
            });

            const excludedCount = rawProducts.length - filteredProducts.length;
            log(`Datos procesados: ${filteredProducts.length} productos incluidos.`, "success");

            // PASO 3: Construcción y Personalización
            updateProgress(70, "Ensamblando e inyectando Info...");
            
            let finalHtml = indexHtml;

            // 3.1 Personalización Visual (Header)
            // Reemplazamos el título de la pestaña del navegador
            finalHtml = finalHtml.replace(/<title>.*?<\/title>/, `<title>${userConfig.title} (Drive)</title>`);
            
            // Reemplazamos el H1 y la versión en el HTML visual
            // Buscamos: <h1 class="app-title">...</h1> y lo reemplazamos completamente
            const newHeaderHtml = `<h1 class="app-title">${userConfig.title} <span class="app-version">${userConfig.version}</span></h1>`;
            finalHtml = finalHtml.replace(/<h1 class="app-title">[\s\S]*?<\/h1>/, newHeaderHtml);
            log("Cabecera personalizada aplicada.", "info");

            // 3.2 Inyección del Texto INFO (Parche README)
            // Inyectamos el texto directamente en el contenedor <pre>. 
            // main.js detectará que no está vacío y no intentará hacer fetch.
            const escapedInfoText = userConfig.introText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const infoInjection = `<pre id="readme-content" class="modal-body">${escapedInfoText}</pre>`;
            finalHtml = finalHtml.replace(/<pre id="readme-content" class="modal-body"><\/pre>/, infoInjection);
            log("Texto de Información inyectado (Offline fix).", "success");

            // 3.3 CSS
            const styleTag = `<style>\n${cssContent}\n</style>`;
            finalHtml = finalHtml.replace(/<link rel="stylesheet" href="style.css">/, styleTag);

            // 3.4 Bootloader Filtrado
            const offlineBootloader = `
    <script>
        /** BOOTLOADER OFFLINE (Generado por Pokedex Drive) **/
        window.APP_DB = {
            products: ${JSON.stringify(filteredProducts)},
            schemas: ${JSON.stringify(filteredSchemas)},
            registerProduct: function(p) { this.products.push(p); },
            registerSchema: function(k, s) { this.schemas[k] = s; }
        };
        console.log("Pokedex Offline: Base de datos filtrada cargada.");
    </script>`;

            const bootloaderRegex = /<script>\s*window\.APP_DB[\s\S]*?<\/script>/;
            if (bootloaderRegex.test(finalHtml)) {
                finalHtml = finalHtml.replace(bootloaderRegex, offlineBootloader);
            } else {
                finalHtml = finalHtml.replace('<!-- Bootloader v2.9.9 -->', '<!-- Bootloader Replaced -->\n' + offlineBootloader);
            }

            // 3.5 JS
            const scriptTag = `<script>\n${jsContent}\n</script>`;
            finalHtml = finalHtml.replace(/<script src="main.js" defer><\/script>/, scriptTag);

            // 3.6 Limpieza
            updateProgress(85, "Limpiando accesos...");
            const adminBtnRegex = /<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/;
            finalHtml = finalHtml.replace(adminBtnRegex, '');
            
            updateProgress(100, "¡Listo!");
            log("Monolito generado exitosamente.", "success");

            prepareDownload(finalHtml, userConfig.title);

        } catch (error) {
            log(`ERROR: ${error.message}`, "error");
            console.error(error);
            UI.progressBar.style.backgroundColor = "var(--color-red-accent)";
        } finally {
            isCompiling = false;
        }
    }

    // --- Funciones Auxiliares ---
    async function fetchResource(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error 404: No se encuentra ${url}`);
        return await response.text();
    }

    function prepareDownload(content, appTitle) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        // Limpiamos el nombre para que sea seguro en el archivo
        const safeTitle = appTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTitle}_drive_${new Date().toISOString().slice(0,10)}.html`;
        
        UI.downloadBtn.onclick = null; 
        UI.downloadBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });

        UI.actionArea.style.display = 'block';
    }

    function openDriveModal() {
        if (UI.modal) UI.modal.style.display = 'block';
        if (UI.overlay) UI.overlay.style.display = 'block';
    }

    function closeDriveModal() {
        if (UI.modal) UI.modal.style.display = 'none';
        if (UI.overlay) UI.overlay.style.display = 'none';
        isCompiling = false;
    }

    function resetUI() {
        UI.progressBar.style.width = '0%';
        UI.progressBar.style.backgroundColor = 'var(--color-green-accent)';
        UI.progressText.textContent = '0%';
        UI.console.innerHTML = '';
        UI.actionArea.style.display = 'none';
    }

    function updateProgress(percent, text) {
        UI.progressBar.style.width = `${percent}%`;
        UI.progressText.textContent = `${percent}%`;
        if (text) log(text);
    }

    function log(message, type = 'normal') {
        const line = document.createElement('div');
        line.className = 'log-line';
        line.textContent = `> ${message}`;
        if (type === 'error') line.style.color = 'var(--color-red-accent)';
        if (type === 'success') line.style.color = 'var(--color-green-accent)';
        if (type === 'info') line.style.color = 'var(--color-cyan-accent)';
        if (type === 'warning') line.style.color = '#fbbf24';
        UI.console.appendChild(line);
        UI.console.scrollTop = UI.console.scrollHeight;
    }
});