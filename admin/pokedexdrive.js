/**
 * Pokedex Drive Meta-Constructor v10.0 (Fetch & Patch Engine)
 * Estrategia: Leer archivos fuente reales -> Inyectar RAM DB -> Exportar.
 * Garantiza que la versión offline sea IDÉNTICA a la versión online.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Referencias UI (Deben coincidir con admin.html)
    const ui = {
        trigger: document.getElementById('drive-builder-trigger'),
        modal: document.getElementById('drive-modal'),
        closeBtn: document.getElementById('drive-close-btn'),
        progress: document.getElementById('drive-progress-fill'),
        percent: document.getElementById('drive-percent-text'),
        log: document.getElementById('drive-log-console'),
        actions: document.getElementById('drive-action-area'),
        downloadBtn: document.getElementById('drive-download-final-btn') // ID corregido
    };

    let generatedBlobUrl = null;

    // Inicializar listeners si los elementos existen
    if (ui.trigger) ui.trigger.addEventListener('click', startDriveBuild);
    if (ui.closeBtn) ui.closeBtn.addEventListener('click', () => ui.modal.style.display = 'none');
    if (ui.downloadBtn) ui.downloadBtn.addEventListener('click', () => { if (generatedBlobUrl) triggerDownload(generatedBlobUrl); });

    // --- MOTOR DE CONSTRUCCIÓN ---
    async function startDriveBuild() {
        // 1. Preparar UI
        ui.modal.style.display = 'block';
        ui.actions.style.display = 'none';
        ui.closeBtn.style.display = 'none';
        updateProgress(0);
        clearLog();
        log("Iniciando Motor Pokedex Drive v10...", "active");

        try {
            // 2. Obtener Configuración (desde admin.js o defaults)
            const config = window.driveConfig || { 
                title: "Pokedex Drive", 
                version: getAutoVersion(), 
                introText: "Base de datos offline." 
            };
            
            // 3. Obtener Datos de Memoria (RAM)
            // Filtramos solo lo que esté activo en la biblioteca visual
            log("Analizando memoria RAM...");
            
            // Detectar gamas activas (buscando en los checkboxes de la biblioteca)
            // Si no hay checkboxes renderizados, usamos todas las activas en memoria
            const sourceSchemas = window.APP_DB.schemas;
            const sourceProducts = window.APP_DB.products;
            
            // Identificar qué gamas exportar
            let activeKeys = new Set();
            const domCheckboxes = document.querySelectorAll('.gama-checkbox:checked');
            if (domCheckboxes.length > 0) {
                domCheckboxes.forEach(cb => activeKeys.add(cb.dataset.key));
            } else {
                // Fallback: si no se abrió la biblioteca, exportar todo lo cargado
                activeKeys = new Set(Object.keys(sourceSchemas));
            }

            const filteredSchemas = {};
            const filteredProducts = [];

            activeKeys.forEach(key => { if (sourceSchemas[key]) filteredSchemas[key] = sourceSchemas[key]; });
            sourceProducts.forEach(p => { if (activeKeys.has(p.schema_key)) filteredProducts.push(p); });

            log(`> Datos: ${filteredProducts.length} modelos en ${activeKeys.size} gamas.`);
            updateProgress(20);

            // 4. FETCH DE ARCHIVOS FUENTE (La clave del éxito)
            log("Leyendo código fuente original (../)...");
            
            // Intentamos leer los archivos de la raíz
            const [htmlRaw, cssRaw, jsRaw] = await Promise.all([
                fetchText('../index.html'),
                fetchText('../style.css'),
                fetchText('../main.js')
            ]);

            updateProgress(50);

            // 5. PROCESAMIENTO Y PARCHEO (The Magic)
            log("Inyectando núcleo y estilos...");

            let finalHtml = htmlRaw;

            // 5.1 Eliminar CSS externo e inyectar CSS inline
            finalHtml = finalHtml.replace(/<link rel="stylesheet" href="style.css">/, `<style>\n${cssRaw}\n</style>`);

            // 5.2 Eliminar Scripts externos (Bootloader viejo, main.js externo)
            // Borramos el bloque <script> del bootloader original
            finalHtml = finalHtml.replace(/<script>[\s\S]*?manifest\.json[\s\S]*?<\/script>/, '');
            // Borramos la llamada a main.js
            finalHtml = finalHtml.replace(/<script src="main.js" defer><\/script>/, '');

            // 5.3 Inyectar Nuevo Bootloader (Datos RAM)
            const offlineBootloader = `
    <script>
        /* POKEDEX DRIVE BOOTLOADER (OFFLINE) */
        window.APP_DB = {
            products: ${JSON.stringify(filteredProducts)},
            schemas: ${JSON.stringify(filteredSchemas)},
            registerProduct: function(){},
            registerSchema: function(){}
        };
        window.IS_POKEDEX_DRIVE = true;
        console.log("Pokedex Drive Loaded: ${filteredProducts.length} items.");
    </script>`;
            
            // Inyectamos el bootloader antes del cierre de head
            finalHtml = finalHtml.replace('</head>', `${offlineBootloader}\n</head>`);

            updateProgress(70);

            // 6. MODIFICACIÓN DEL JAVASCRIPT PRINCIPAL
            log("Adaptando lógica de negocio...");
            let finalJs = jsRaw;

            // 6.1 Inyectar texto de README personalizado
            // Buscamos donde main.js intenta hacer fetch('README.md') y lo reemplazamos
            const infoTextClean = JSON.stringify(config.introText);
            // Regex flexible para encontrar el bloque de fetch readme
            // Busca: dom.readmeContent.textContent = "Cargando..."; ... fetch('README.md')
            // Reemplazo radical: Sobreescribimos la función showReadmeInfo o la parte del fetch
            
            // Estrategia más segura: Inyectar una variable global y modificar main.js para que la use si existe?
            // Mejor: Reemplazo directo si encontramos el patrón conocido.
            if (finalJs.includes("fetch('README.md')")) {
                 finalJs = finalJs.replace(
                    /if\s*\(dom\.readmeContent\.textContent\s*===\s*""[\s\S]*?catch\s*\(error\)\s*\{[\s\S]*?\}\s*?\}/,
                    `dom.readmeContent.textContent = ${infoTextClean};`
                );
            }

            // 6.2 Eliminar botón de Admin del HTML (Ajustes -> Admin)
            finalHtml = finalHtml.replace(/<a[^>]*admin\/index\.html[^>]*>.*?<\/a>/i, '');

            // 6.3 Actualizar Títulos en HTML
            finalHtml = finalHtml.replace(/<title>.*?<\/title>/, `<title>${config.title}</title>`);
            finalHtml = finalHtml.replace(
                /<h1 class="app-title">.*?<span class="app-version">.*?<\/span><\/h1>/, 
                `<h1 class="app-title">${config.title} 📟 <span class="app-version">${config.version}</span></h1>`
            );

            // 6.4 Inyectar JS procesado al final del body
            // Escapamos </script> dentro del string JS para no romper el HTML
            const safeJs = finalJs.replace(/<\/script>/g, '<\\/script>');
            finalHtml = finalHtml.replace('</body>', `<script>\n${safeJs}\n</script>\n</body>`);

            updateProgress(90);

            // 7. GENERACIÓN FINAL
            log("Compilando binario...", "success");
            await wait(500);

            const blob = new Blob([finalHtml], { type: 'text/html' });
            generatedBlobUrl = URL.createObjectURL(blob);

            // 8. FINALIZAR UI
            updateProgress(100);
            ui.actions.style.display = 'block';
            ui.closeBtn.style.display = 'block';
            
            // Autodescarga opcional (descomentar si se desea)
            // triggerDownload(generatedBlobUrl);

        } catch (error) {
            console.error(error);
            log(`ERROR FATAL: ${error.message}`, "error");
            ui.progress.style.backgroundColor = '#f43f5e'; // Red
            ui.closeBtn.style.display = 'block';
        }
    }

    // --- UTILIDADES ---

    async function fetchText(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`No se pudo leer ${url} (${response.status})`);
        return await response.text();
    }

    function log(msg, type = '') {
        const div = document.createElement('div');
        div.className = `log-line ${type}`;
        div.textContent = `> ${msg}`;
        ui.log.appendChild(div);
        ui.log.scrollTop = ui.log.scrollHeight;
        
        // Efecto visual active
        const oldActive = ui.log.querySelector('.active');
        if(oldActive) oldActive.classList.remove('active');
        div.classList.add('active');
    }

    function clearLog() {
        ui.log.innerHTML = '';
    }

    function updateProgress(pct) {
        ui.progress.style.width = `${pct}%`;
        ui.percent.textContent = `${pct}%`;
    }

    function wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function triggerDownload(url) {
        const a = document.createElement('a');
        a.href = url;
        // Nombre del archivo basado en configuración o fecha
        const conf = window.driveConfig || {};
        const safeName = (conf.title || "PokedexDrive").replace(/[^a-z0-9]/gi, '_');
        a.download = `${safeName}_Offline.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function getAutoVersion() {
        const d = new Date();
        return `v.${d.getDate()}.${d.getMonth()+1}.${d.getFullYear().toString().substr(-2)}`;
    }

});