/**
 * Pokedex Drive Meta-Constructor v6.0 (Mathematical Core)
 * * NOVEDADES v6.0:
 * 1. Kernel Inteligente: Implementa lógica de conjuntos (Set Theory) para evitar duplicados.
 * 2. Algoritmo Upsert: Si importas un CSV, actualiza los datos existentes en lugar de duplicarlos.
 * 3. Sanitización Profunda: Limpieza mejorada de scripts residuales.
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

    // Constante de seguridad para evitar romper el parser del navegador
    const SCRIPT_CLOSE_TAG = '<' + '/script>'; 
    let generatedBlobUrl = null;

    // --- LISTENERS ---
    if (ui.trigger) ui.trigger.addEventListener('click', runMathematicalBuild);
    if (ui.closeBtn) ui.closeBtn.addEventListener('click', () => ui.modal.style.display = 'none');
    if (ui.downloadBtn) ui.downloadBtn.addEventListener('click', () => { if (generatedBlobUrl) downloadFile(generatedBlobUrl); });

    // --- PROCESO PRINCIPAL ---
    async function runMathematicalBuild() {
        // 1. Reset UI
        ui.modal.style.display = 'block';
        ui.closeBtn.style.display = 'none';
        ui.actions.style.display = 'none';
        updateProgress(0);
        ui.log.innerHTML = '<div class="log-line active">> Iniciando Arquitectura Matemática v6.0...</div>';

        try {
            const isInception = window.IS_POKEDEX_DRIVE === true;
            let src = { vHtml: '', vCss: '', vJs: '', aHtml: '', aCss: '', aJs: '', builderJs: '' };

            // --- FASE 1: RECOLECCIÓN DE MATERIA PRIMA ---
            
            if (!isInception) {
                log("MODO: File System (Origen)", "active");
                
                // Carga paralela para mayor velocidad
                const [vH, vC, vJ, aH, aC, aJ, bJ] = await Promise.all([
                    fetchText('../index.html'), fetchText('../style.css'), fetchText('../main.js'),
                    fetchText('index.html'), fetchText('admin.css'), fetchText('admin.js'),
                    fetchText('pokedexdrive.js')
                ]);

                src = { vHtml: vH, vCss: vC, vJs: vJ, aHtml: aH, aCss: aC, aJs: aJ, builderJs: bJ };
                updateProgress(30);

            } else {
                log("MODO: Inception (Auto-Replicación)", "active");
                await wait(300);

                // Extracción DOM quirúrgica
                const styleTags = Array.from(document.querySelectorAll('style'));
                src.vCss = styleTags.map(s => s.textContent).join('\n'); // CSS unificado
                
                src.vHtml = document.getElementById('app-viewer-container').innerHTML;
                src.aHtml = document.getElementById('app-admin-container').innerHTML;
                
                src.vJs = document.getElementById('core-logic-viewer').textContent;
                src.aJs = document.getElementById('core-logic-admin').textContent;
                src.builderJs = document.getElementById('core-logic-builder').textContent;
                updateProgress(30);
            }

            // --- FASE 2: PURIFICACIÓN Y ENRUTADO ---
            log("Sanitizando Estructuras DOM...");
            await wait(100);

            // 2.1 Viewer: Inyectar botón Admin y limpiar
            let cleanV = isInception ? src.vHtml : extractBody(src.vHtml);
            cleanV = stripScripts(cleanV);
            cleanV = cleanV.replace(
                /<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/g, 
                `<button id="admin-link-btn" class="settings-menu-item" onclick="window.DriveRouter.toAdmin()">☣️ Admin Mode</button>`
            );

            // 2.2 Admin: Inyectar botón Viewer y limpiar
            let cleanA = isInception ? src.aHtml : extractBody(src.aHtml);
            cleanA = stripScripts(cleanA);
            cleanA = cleanA.replace(
                /<a href="\.\.\/index\.html".*?>.*?<\/a>/g,
                `<button class="settings-dropdown-btn" onclick="window.DriveRouter.toViewer()">📖 Volver a Pokedex</button>`
            );

            updateProgress(50);

            // --- FASE 3: KERNEL MATEMÁTICO (SOLUCIÓN DUPLICADOS) ---
            log("Calculando Snapshot de Memoria...");
            
            // Capturamos el estado actual
            const dbSnapshot = { 
                products: window.APP_DB.products, 
                schemas: window.APP_DB.schemas 
            };

            // Definimos el Kernel Inteligente con lógica UPSERT (Update/Insert)
            const kernelScript = `
        /* POKEDEX DRIVE KERNEL v6.0 (Mathematical) */
        window.APP_DB = {
            // Carga inicial estática
            products: ${JSON.stringify(dbSnapshot.products)},
            schemas: ${JSON.stringify(dbSnapshot.schemas)},

            // MÉTODO ALGORÍTMICO: UPSERT DE PRODUCTOS
            // Evita duplicados verificando si el modelo ya existe.
            registerProduct: function(newProduct) { 
                if (!newProduct || !newProduct.model) return;
                
                // Normalizar ID para comparación estricta
                const targetId = newProduct.model;
                
                // Búsqueda lineal O(n) - Suficiente para <10k elementos
                const existingIndex = this.products.findIndex(p => p.model === targetId);
                
                if (existingIndex !== -1) {
                    // Actualización (Update) - Reemplaza datos antiguos
                    // console.log('[DB] Update:', targetId);
                    this.products[existingIndex] = newProduct;
                } else {
                    // Inserción (Insert)
                    // console.log('[DB] Insert:', targetId);
                    this.products.push(newProduct);
                }
            },

            // MÉTODO ALGORÍTMICO: UPSERT DE ESQUEMAS
            registerSchema: function(key, schemaGroups) {
                // Sobrescribe directamente (O(1) en Hash Map)
                this.schemas[key] = schemaGroups;
            }
        };

        // Flag de entorno
        window.IS_POKEDEX_DRIVE = true;
        
        // Enrutador Virtual
        window.DriveRouter = {
            toAdmin: function() {
                document.getElementById('app-viewer-container').style.display = 'none';
                document.getElementById('app-admin-container').style.display = 'block';
                document.body.classList.add('admin-mode');
                window.scrollTo(0,0);
            },
            toViewer: function() {
                document.getElementById('app-admin-container').style.display = 'none';
                document.getElementById('app-viewer-container').style.display = 'block';
                document.body.classList.remove('admin-mode');
                window.scrollTo(0,0);
            }
        };
            `;
            updateProgress(75);

            // --- FASE 4: ENSAMBLAJE ATÓMICO ---
            log("Compilando Binario Único...");
            await wait(200);

            // Función de escape para evitar "Inception Recursion Error"
            const esc = (code) => code.replace(/<\/script>/gi, '<\\/script>');

            const finalHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokedex Drive (Offline v${new Date().toISOString().slice(0,10)})</title>
    
    <!-- ESTILOS UNIFICADOS -->
    <style>
        ${src.vCss}
        ${src.aCss}
        /* Ajustes Drive */
        #app-admin-container { display: none; }
        body.admin-mode { background-color: var(--color-bg-dark); }
    </style>
    
    <!-- KERNEL -->
    <script>${esc(kernelScript)}${SCRIPT_CLOSE_TAG}

    <!-- META-CONSTRUCTOR (Semilla de Replicación) -->
    <script id="core-logic-builder">${esc(src.builderJs)}${SCRIPT_CLOSE_TAG}
</head>
<body>
    <!-- CAPA VISUAL -->
    <div id="app-viewer-container">${cleanV}</div>
    <div id="app-admin-container">${cleanA}</div>

    <!-- CAPA LÓGICA -->
    <script id="core-logic-viewer">
        (function(){ ${esc(src.vJs)} })();
    ${SCRIPT_CLOSE_TAG}
    
    <script id="core-logic-admin">
        (function(){ ${esc(src.aJs)} })();
    ${SCRIPT_CLOSE_TAG}
</body>
</html>`;

            // Generar Blob
            const blob = new Blob([finalHtml], { type: 'text/html' });
            if (generatedBlobUrl) URL.revokeObjectURL(generatedBlobUrl); // GC
            generatedBlobUrl = URL.createObjectURL(blob);

            updateProgress(100);
            log("¡Compilación Exitosa!", "success");

            // UX Final
            ui.closeBtn.style.display = 'block';
            ui.actions.style.display = 'block';
            downloadFile(generatedBlobUrl);

        } catch (e) {
            console.error(e);
            log(`ERROR CRÍTICO: ${e.message}`, "error");
            ui.progress.style.backgroundColor = 'var(--color-red-accent)';
            ui.closeBtn.style.display = 'block';
        }
    }

    // --- FUNCIONES AUXILIARES (HELPERS) ---

    async function fetchText(url) {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`404: ${url}`);
        return await r.text();
    }

    function extractBody(html) {
        const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        return m ? m[1] : '';
    }

    function stripScripts(html) {
        // Elimina tags scripts normales y self-closing para evitar ejecución fantasma
        return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                   .replace(/<script\b[^>]*\/>/gim, "");
    }

    function log(msg, type='') {
        const prev = ui.log.querySelector('.active');
        if(prev) prev.classList.remove('active');
        
        const div = document.createElement('div');
        div.className = `log-line ${type}`;
        div.textContent = `> ${msg}`;
        ui.log.appendChild(div);
        ui.log.scrollTop = ui.log.scrollHeight;
    }

    function updateProgress(p) {
        ui.progress.style.width = `${p}%`;
        ui.percent.textContent = `${p}%`;
    }

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function downloadFile(url) {
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
        a.download = `PokedexDrive_v${date}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});