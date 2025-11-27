/**
 * Pokedex Drive Builder v3.5
 * Generador de aplicaciones Single-File Offline.
 */

document.addEventListener('DOMContentLoaded', () => {
    const triggerBtn = document.getElementById('drive-builder-trigger');
    const modal = document.getElementById('drive-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('drive-close-btn');
    const progressBar = document.getElementById('drive-progress-fill');
    const percentText = document.getElementById('drive-percent-text');
    const logConsole = document.getElementById('drive-log-console');
    const actionArea = document.getElementById('drive-action-area');
    const downloadBtn = document.getElementById('drive-download-again-btn');

    let compiledHtmlBlob = null;

    if (triggerBtn) {
        triggerBtn.addEventListener('click', startBuildProcess);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (compiledHtmlBlob) downloadBlob(compiledHtmlBlob, 'pokedex_drive_offline.html');
        });
    }

    function log(msg, type = 'info') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = `> ${msg}`;
        logConsole.appendChild(line);
        logConsole.scrollTop = logConsole.scrollHeight;
        
        // Efecto visual de actividad en la última línea
        document.querySelectorAll('.log-line').forEach(l => l.classList.remove('active'));
        line.classList.add('active');
    }

    async function startBuildProcess() {
        modal.style.display = 'block';
        overlay.style.display = 'block';
        actionArea.style.display = 'none';
        closeBtn.style.display = 'none'; // Bloquear cierre durante compilación
        progressBar.style.width = '0%';
        percentText.textContent = '0%';
        logConsole.innerHTML = '';
        
        log("Inicializando Motor Pokedex Drive...", "info");

        try {
            // Paso 1: Recolectar datos en memoria (RamDB)
            await updateProgress(10, "Analizando memoria (RAM DB)...");
            const allProducts = window.APP_DB.products;
            const allSchemas = window.APP_DB.schemas;
            
            if (allProducts.length === 0) {
                log("Advertencia: Base de datos vacía.", "error");
            } else {
                log(`Encontrados ${allProducts.length} modelos en memoria.`);
            }

            // Paso 2: Generar Bootloader interno
            await updateProgress(30, "Construyendo Bootloader Offline...");
            const bootloaderScript = `
                window.APP_DB = { 
                    products: ${JSON.stringify(allProducts)}, 
                    schemas: ${JSON.stringify(allSchemas)},
                    registerProduct: function(){}, 
                    registerSchema: function(){} 
                };
                console.log("Pokedex Drive: Modo Offline cargado.");
            `;

            // Paso 3: Simular lectura de Core (Pokedex Index)
            // Nota: En un entorno real, haríamos fetch al index.html original.
            // Aquí simularemos una plantilla base mínima para demostración.
            await updateProgress(50, "Leyendo Core Templates...");
            
            const coreTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokedex Drive Offline</title>
    <style>
        body { font-family: sans-serif; background: #0D1117; color: #fff; padding: 2rem; text-align: center; }
        .card { background: #161B22; border: 1px solid #30363d; padding: 1rem; margin: 1rem auto; max-width: 600px; border-radius: 8px; text-align: left; }
        h1 { color: #06b6d4; }
        .badge { background: #238636; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; }
    </style>
</head>
<body>
    <h1>Pokedex Drive (Offline Viewer)</h1>
    <p>Generado automáticamente. ${allProducts.length} modelos indexados.</p>
    <div id="container"></div>
    <script>
        ${bootloaderScript}
        
        const container = document.getElementById('container');
        window.APP_DB.products.forEach(p => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = '<h3>' + p.model + ' <span class="badge">' + p.schema_key + '</span></h3>';
            // Renderizado simple de atributos
            Object.keys(p.attributes).forEach(k => {
                div.innerHTML += '<div style="font-size:0.9em; color:#8b949e;"><b>' + k + ':</b> ' + p.attributes[k] + '</div>';
            });
            container.appendChild(div);
        });
    </script>
</body>
</html>`;

            await updateProgress(80, "Inyectando Datos y Scripts...");
            await new Promise(r => setTimeout(r, 800)); // Delay dramático

            // Paso 4: Finalizar
            compiledHtmlBlob = new Blob([coreTemplate], { type: 'text/html' });
            
            await updateProgress(100, "Compilación Finalizada.");
            log("Archivo listo para descarga.", "success");
            
            actionArea.style.display = 'block';
            closeBtn.style.display = 'block';

        } catch (error) {
            log("Error Crítico: " + error.message, "error");
            closeBtn.style.display = 'block';
        }
    }

    async function updateProgress(percent, msg) {
        progressBar.style.width = percent + '%';
        percentText.textContent = percent + '%';
        log(msg);
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    function downloadBlob(blob, filename) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});