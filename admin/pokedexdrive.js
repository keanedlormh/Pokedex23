/**
 * Pokedex Drive Meta-Constructor
 * Genera un archivo HTML monolítico (Single-File) con la BD actual incrustada.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Referencias DOM
    const driveTrigger = document.getElementById('drive-builder-trigger');
    const driveModal = document.getElementById('drive-modal');
    const driveCloseBtn = document.getElementById('drive-close-btn');
    const progressFill = document.getElementById('drive-progress-fill');
    const percentText = document.getElementById('drive-percent-text');
    const consoleLog = document.getElementById('drive-log-console');
    const actionArea = document.getElementById('drive-action-area');
    const downloadAgainBtn = document.getElementById('drive-download-again-btn');

    let generatedBlobUrl = null;

    if (driveTrigger) {
        driveTrigger.addEventListener('click', startDriveBuild);
    }

    if (driveCloseBtn) {
        driveCloseBtn.addEventListener('click', () => {
            driveModal.style.display = 'none';
        });
    }

    if (downloadAgainBtn) {
        downloadAgainBtn.addEventListener('click', () => {
            if (generatedBlobUrl) triggerDownload(generatedBlobUrl);
        });
    }

    async function startDriveBuild() {
        // Reset UI
        driveModal.style.display = 'block';
        driveCloseBtn.style.display = 'none'; // Bloquear cierre durante proceso
        actionArea.style.display = 'none';
        progressFill.style.width = '0%';
        percentText.textContent = '0%';
        consoleLog.innerHTML = '<div class="log-line active">> Iniciando secuencia de construcción...</div>';
        generatedBlobUrl = null;

        try {
            // --- PASO 1: Obtener Recursos Base (20%) ---
            await wait(500);
            log("Leyendo estructura HTML base...", "active");
            const htmlResponse = await fetch('../index.html');
            let htmlContent = await htmlResponse.text();
            updateProgress(10);

            log("Leyendo hoja de estilos (style.css)...", "active");
            const cssResponse = await fetch('../style.css');
            const cssContent = await cssResponse.text();
            updateProgress(20);

            log("Leyendo lógica principal (main.js)...", "active");
            const jsResponse = await fetch('../main.js');
            const jsContent = await jsResponse.text();
            updateProgress(30);


            // --- PASO 2: Procesar HTML (Limpieza) (50%) ---
            await wait(500);
            log("Limpiando dependencias externas...", "active");
            
            // Eliminar link CSS externo
            htmlContent = htmlContent.replace(/<link rel="stylesheet" href="style.css">/, '');
            
            // Eliminar Bootloader original (El bloque de script que carga manifest.json)
            // Usamos un regex no avaricioso que busca el script que contiene 'APP_DB' y 'manifest.json'
            htmlContent = htmlContent.replace(/<script>[\s\S]*?manifest\.json[\s\S]*?<\/script>/, '');

            // Eliminar referencia externa a main.js
            htmlContent = htmlContent.replace(/<script src="main.js" defer><\/script>/, '');

            // Eliminar Botón de Admin (Seguridad por oscuridad/UX)
            // Buscamos el enlace al admin y lo quitamos
            htmlContent = htmlContent.replace(/<a href="admin\/index\.html".*?id="admin-link-btn".*?>.*?<\/a>/, '');

            updateProgress(50);


            // --- PASO 3: Serializar Datos (Base de Datos) (70%) ---
            await wait(500);
            log("Serializando Base de Datos (In-Memory)...", "active");

            // Creamos un Bootloader Estático
            const dbData = {
                products: window.APP_DB.products, // Los datos actuales del admin
                schemas: window.APP_DB.schemas
            };

            const staticBootloader = `
    <style>
        ${cssContent}
    </style>
    <script>
        /** * Pokedex Drive - Offline Data Layer
         * Generated: ${new Date().toLocaleString()}
         */
        window.APP_DB = {
            products: ${JSON.stringify(dbData.products)},
            schemas: ${JSON.stringify(dbData.schemas)},
            // Métodos dummy para compatibilidad si main.js los llama, 
            // aunque en modo lectura no deberían usarse.
            registerProduct: function(p) { this.products.push(p); },
            registerSchema: function(k, s) { this.schemas[k] = s; }
        };
        // Flag para indicar modo Drive
        window.IS_POKEDEX_DRIVE = true;
    </script>
            `;

            updateProgress(70);


            // --- PASO 4: Ensamblaje (90%) ---
            await wait(400);
            log("Inyectando código y estilos...", "active");

            // Inyectamos CSS y Data en el Head
            htmlContent = htmlContent.replace('</head>', `${staticBootloader}\n</head>`);

            // Inyectamos Main JS al final del body (como defer)
            const mainJsBlock = `<script>\n${jsContent}\n</script>`;
            htmlContent = htmlContent.replace('</body>', `${mainJsBlock}\n</body>`);

            // Cambiar Título
            htmlContent = htmlContent.replace(/<title>.*?<\/title>/, '<title>Pokedex Drive (Offline)</title>');

            updateProgress(90);


            // --- PASO 5: Finalización y Descarga (100%) ---
            await wait(600);
            log("Generando binario .html...", "active");
            
            const blob = new Blob([htmlContent], { type: 'text/html' });
            generatedBlobUrl = URL.createObjectURL(blob);

            updateProgress(100);
            log("¡Construcción exitosa!", "success");

            // UI Final
            driveCloseBtn.style.display = 'block';
            actionArea.style.display = 'block';
            
            // Descarga automática
            triggerDownload(generatedBlobUrl);

        } catch (error) {
            console.error(error);
            log(`ERROR CRÍTICO: ${error.message}`, "error");
            progressFill.style.backgroundColor = 'var(--color-red-accent)';
            driveCloseBtn.style.display = 'block';
        }
    }

    // --- Helpers ---

    function log(message, type = '') {
        // Quitar clase active de la línea anterior
        const prev = consoleLog.querySelector('.active');
        if (prev) prev.classList.remove('active');

        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = `> ${message}`;
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    function updateProgress(percent) {
        progressFill.style.width = `${percent}%`;
        percentText.textContent = `${percent}%`;
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function triggerDownload(url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `PokedexDrive_v${new Date().toISOString().slice(0,10)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});