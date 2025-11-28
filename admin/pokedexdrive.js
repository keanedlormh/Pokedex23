/**
 * Pokedex Drive Engine v2.1
 * Módulo de compilación para generar versiones monolíticas offline.
 * * NOVEDADES v2.1:
 * - Filtrado Inteligente: Ahora respeta la "Biblioteca Virtual". Solo exporta
 * las gamas (schemas) y productos que estén activos en el panel de administración
 * en el momento de la compilación.
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
        // Referencia para leer el estado de las gamas activas
        activeSchemaList: document.getElementById('schema-results-list') 
    };

    // Estado del sistema
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
            log("Iniciando motor Pokedex Drive v2.1 (Filtered)...", "info");
            
            // PASO 1: Obtener Recursos Fuente
            updateProgress(10, "Leyendo estructura fuente (../index.html)...");
            const indexHtml = await fetchResource('../index.html');
            
            updateProgress(25, "Leyendo estilos visuales (../style.css)...");
            const cssContent = await fetchResource('../style.css');
            
            updateProgress(40, "Leyendo núcleo lógico (../main.js)...");
            const jsContent = await fetchResource('../main.js');

            // PASO 2: Filtrado de Datos (NUEVA LÓGICA)
            updateProgress(50, "Analizando Biblioteca Virtual...");
            
            if (!window.APP_DB || !window.APP_DB.products) {
                throw new Error("No hay datos cargados en la memoria del Administrador.");
            }

            // 2.1 Detectar qué gamas están activas leyendo la UI del Admin
            // admin.js rellena #schema-results-list solo con las gamas activas.
            const activeKeys = new Set();
            if (UI.activeSchemaList) {
                const schemaNodes = UI.activeSchemaList.querySelectorAll('.list-item');
                schemaNodes.forEach(node => {
                    if (node.dataset.key) activeKeys.add(node.dataset.key);
                });
            }

            // Fallback de seguridad: si la lista está vacía (raro), activamos todo.
            if (activeKeys.size === 0) {
                log("AVISO: No se detectaron filtros activos. Exportando TODAS las gamas.", "warning");
                Object.keys(window.APP_DB.schemas).forEach(k => activeKeys.add(k));
            } else {
                log(`Filtro detectado: ${activeKeys.size} gamas activas.`, "info");
            }

            // 2.2 Filtrar Productos
            const rawProducts = window.APP_DB.products;
            const filteredProducts = rawProducts.filter(p => activeKeys.has(p.schema_key));
            
            // 2.3 Filtrar Esquemas
            const rawSchemas = window.APP_DB.schemas;
            const filteredSchemas = {};
            Object.keys(rawSchemas).forEach(key => {
                if (activeKeys.has(key)) {
                    filteredSchemas[key] = rawSchemas[key];
                }
            });

            const excludedCount = rawProducts.length - filteredProducts.length;
            log(`Datos procesados: ${filteredProducts.length} productos incluidos.`, "success");
            if (excludedCount > 0) {
                log(`(Omitidos ${excludedCount} productos de gamas desactivadas)`, "normal");
            }

            // PASO 3: Construcción del Monolito
            updateProgress(70, "Ensamblando monolito HTML...");
            
            let finalHtml = indexHtml;

            // 3.1 Inyectar CSS
            const styleTag = `<style>\n${cssContent}\n</style>`;
            finalHtml = finalHtml.replace(/<link rel="stylesheet" href="style.css">/, styleTag);

            // 3.2 Inyectar Bootloader Offline con DATOS FILTRADOS
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
                // Fallback si la regex falla (ej: minificación diferente)
                finalHtml = finalHtml.replace('<!-- Bootloader v2.9.9 -->', '<!-- Bootloader Replaced -->\n' + offlineBootloader);
                log("Bootloader inyectado por fallback.", "warning");
            }

            // 3.3 Inyectar Main JS
            const scriptTag = `<script>\n${jsContent}\n</script>`;
            finalHtml = finalHtml.replace(/<script src="main.js" defer><\/script>/, scriptTag);

            // 3.4 Limpieza de Seguridad
            updateProgress(85, "Finalizando...");
            
            // Quitar botón admin
            const adminBtnRegex = /<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/;
            finalHtml = finalHtml.replace(adminBtnRegex, '');
            
            // Título
            const appTitle = window.driveConfig && window.driveConfig.title ? window.driveConfig.title : 'Pokedex Offline';
            finalHtml = finalHtml.replace(/<title>.*?<\/title>/, `<title>${appTitle} (Drive)</title>`);

            // PASO 4: Finalización
            updateProgress(100, "Compilación lista.");
            log("Archivo generado correctamente.", "success");

            prepareDownload(finalHtml);

        } catch (error) {
            log(`ERROR CRÍTICO: ${error.message}`, "error");
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

    // --- UI Logic ---

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
        if (type === 'warning') line.style.color = '#fbbf24'; // Orange-ish
        
        UI.console.appendChild(line);
        UI.console.scrollTop = UI.console.scrollHeight;
    }
});