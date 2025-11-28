/**
 * Pokedex Drive Engine v2.2
 * Módulo de compilación para generar versiones monolíticas offline.
 * * ACTUALIZACIÓN CRÍTICA:
 * - Filtra usando window.ADMIN_CONTEXT.activeSchemas para precisión absoluta.
 * - Evita exportar gamas desactivadas en la biblioteca.
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
        overlay: document.getElementById('modal-overlay')
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
            log("Iniciando motor Pokedex Drive v2.2...", "info");
            
            // PASO 1: Recursos
            updateProgress(10, "Leyendo estructura fuente (../index.html)...");
            const indexHtml = await fetchResource('../index.html');
            
            updateProgress(25, "Leyendo estilos visuales (../style.css)...");
            const cssContent = await fetchResource('../style.css');
            
            updateProgress(40, "Leyendo núcleo lógico (../main.js)...");
            const jsContent = await fetchResource('../main.js');

            // PASO 2: Filtrado Robusto de Datos
            updateProgress(50, "Analizando Biblioteca Virtual (Bridge Mode)...");
            
            if (!window.APP_DB || !window.APP_DB.products) {
                throw new Error("No hay datos cargados en la memoria del Administrador.");
            }

            // >>>> PUNTO CLAVE <<<<
            // Leemos el Set directamente del puente que creamos en admin.js
            let activeKeys;
            if (window.ADMIN_CONTEXT && window.ADMIN_CONTEXT.activeSchemas) {
                activeKeys = window.ADMIN_CONTEXT.activeSchemas;
                log(`Puente ADMIN_CONTEXT detectado. Filtros activos: ${activeKeys.size}`, "success");
            } else {
                // Fallback si admin.js no se actualizó (exportar todo)
                log("ADVERTENCIA: Puente no detectado. Exportando todo.", "warning");
                activeKeys = new Set(Object.keys(window.APP_DB.schemas));
            }

            // Filtrar Productos
            const rawProducts = window.APP_DB.products;
            const filteredProducts = rawProducts.filter(p => activeKeys.has(p.schema_key));
            
            // Filtrar Esquemas
            const rawSchemas = window.APP_DB.schemas;
            const filteredSchemas = {};
            Object.keys(rawSchemas).forEach(key => {
                if (activeKeys.has(key)) {
                    filteredSchemas[key] = rawSchemas[key];
                }
            });

            const excludedCount = rawProducts.length - filteredProducts.length;
            log(`Datos procesados: ${filteredProducts.length} productos incluidos.`, "success");
            if (excludedCount > 0) log(`(Omitidos ${excludedCount} productos ocultos)`, "normal");

            // PASO 3: Construcción
            updateProgress(70, "Ensamblando monolito HTML...");
            
            let finalHtml = indexHtml;

            // 3.1 CSS
            const styleTag = `<style>\n${cssContent}\n</style>`;
            finalHtml = finalHtml.replace(/<link rel="stylesheet" href="style.css">/, styleTag);

            // 3.2 Bootloader Filtrado
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

            // 3.3 JS
            const scriptTag = `<script>\n${jsContent}\n</script>`;
            finalHtml = finalHtml.replace(/<script src="main.js" defer><\/script>/, scriptTag);

            // 3.4 Limpieza
            updateProgress(85, "Limpiando accesos...");
            const adminBtnRegex = /<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/;
            finalHtml = finalHtml.replace(adminBtnRegex, '');
            
            const appTitle = window.driveConfig && window.driveConfig.title ? window.driveConfig.title : 'Pokedex Offline';
            finalHtml = finalHtml.replace(/<title>.*?<\/title>/, `<title>${appTitle} (Drive)</title>`);

            updateProgress(100, "¡Listo!");
            log("Monolito generado.", "success");

            prepareDownload(finalHtml);

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

    function prepareDownload(content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const filename = `Pokedex_Drive_${new Date().toISOString().slice(0,10)}.html`;
        
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
        if (type === 'warning') line.style.color = '#fbbf24';
        UI.console.appendChild(line);
        UI.console.scrollTop = UI.console.scrollHeight;
    }
});