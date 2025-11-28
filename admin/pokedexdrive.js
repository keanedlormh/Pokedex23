/**
 * Pokedex Drive Engine v2.0
 * Módulo de compilación para generar versiones monolíticas offline.
 * * Funcionalidad:
 * 1. Lee los archivos fuente (index, style, main).
 * 2. Inyecta la base de datos actual de la memoria (RAM) al HTML.
 * 3. Elimina dependencias externas (XHR) y accesos de administrador.
 * 4. Genera un único archivo .html descargable.
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
            // Efecto visual al descargar
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
            log("Iniciando motor Pokedex Drive v2.0...", "info");
            
            // PASO 1: Obtener Recursos Fuente
            updateProgress(10, "Leyendo estructura fuente (../index.html)...");
            const indexHtml = await fetchResource('../index.html');
            
            updateProgress(25, "Leyendo estilos visuales (../style.css)...");
            const cssContent = await fetchResource('../style.css');
            
            updateProgress(40, "Leyendo núcleo lógico (../main.js)...");
            const jsContent = await fetchResource('../main.js');

            // PASO 2: Preparar Datos de la RAM
            updateProgress(55, "Volcando base de datos de memoria RAM...");
            if (!window.APP_DB || !window.APP_DB.products) {
                throw new Error("No hay datos cargados en la memoria del Administrador.");
            }

            // Datos actuales en memoria
            const activeProducts = window.APP_DB.products;
            const activeSchemas = window.APP_DB.schemas;
            
            log(`Datos volcados: ${activeProducts.length} productos, ${Object.keys(activeSchemas).length} gamas.`, "success");

            // PASO 3: Construcción del Monolito
            updateProgress(70, "Ensamblando monolito HTML...");
            
            let finalHtml = indexHtml;

            // 3.1 Inyectar CSS (Reemplazar <link>)
            const styleTag = `<style>\n${cssContent}\n</style>`;
            finalHtml = finalHtml.replace(/<link rel="stylesheet" href="style.css">/, styleTag);
            log("Estilos CSS inyectados.", "info");

            // 3.2 Inyectar Bootloader Offline (Reemplazar primer script)
            // Creamos un script que define APP_DB con los datos ya cargados, sin XHR.
            const offlineBootloader = `
    <script>
        /** BOOTLOADER OFFLINE GENERADO POR POKEDEX DRIVE **/
        window.APP_DB = {
            products: ${JSON.stringify(activeProducts)},
            schemas: ${JSON.stringify(activeSchemas)},
            registerProduct: function(p) { this.products.push(p); },
            registerSchema: function(k, s) { this.schemas[k] = s; }
        };
        console.log("Pokedex Offline: Base de datos cargada desde memoria interna.");
    </script>`;

            // Buscamos el bloque del bootloader original (aprox) para reemplazarlo
            // Usamos una Regex que busca desde window.APP_DB hasta el cierre del script
            const bootloaderRegex = /<script>\s*window\.APP_DB[\s\S]*?<\/script>/;
            if (bootloaderRegex.test(finalHtml)) {
                finalHtml = finalHtml.replace(bootloaderRegex, offlineBootloader);
                log("Bootloader XHR reemplazado por Bootloader Estático.", "success");
            } else {
                log("ADVERTENCIA: No se pudo reemplazar el Bootloader automáticamente.", "warning");
            }

            // 3.3 Inyectar Main JS (Reemplazar <script src="main.js">)
            const scriptTag = `<script>\n${jsContent}\n</script>`;
            finalHtml = finalHtml.replace(/<script src="main.js" defer><\/script>/, scriptTag);
            log("Núcleo JS inyectado.", "info");

            // 3.4 Limpieza de Seguridad (Remover acceso Admin)
            updateProgress(85, "Aplicando protocolos de seguridad...");
            
            // Eliminamos el botón de admin del menú usando Regex sobre el ID
            const adminBtnRegex = /<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/;
            finalHtml = finalHtml.replace(adminBtnRegex, '<!-- Admin Access Removed for Offline Version -->');
            
            // Cambiar título para diferenciar
            finalHtml = finalHtml.replace(/<title>.*?<\/title>/, `<title>${window.driveConfig.title || 'Pokedex Offline'} (Drive)</title>`);

            // PASO 4: Finalización
            updateProgress(100, "Compilación completada.");
            log("Archivo monolítico generado con éxito.", "success");

            // Preparar descarga
            prepareDownload(finalHtml);

        } catch (error) {
            log(`ERROR CRÍTICO: ${error.message}`, "error");
            UI.progressBar.style.backgroundColor = "var(--color-red-accent)";
        } finally {
            isCompiling = false;
        }
    }

    // --- Funciones Auxiliares ---

    async function fetchResource(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fallo al leer ${url}`);
        return await response.text();
    }

    function prepareDownload(content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const filename = `Pokedex_Offline_${new Date().toISOString().slice(0,10)}.html`;
        
        UI.downloadBtn.onclick = null; // Limpiar listeners anteriores
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
        if (type === 'warning') line.style.color = 'orange';
        
        UI.console.appendChild(line);
        UI.console.scrollTop = UI.console.scrollHeight;
    }
});