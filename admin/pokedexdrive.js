/**
 * Pokedex Drive Engine v2.0
 * Generador de Aplicaciones Monolíticas (Single-File)
 */

const PokedexDrive = {
    
    /**
     * Compila la base de datos y la configuración en un archivo HTML autónomo.
     * @param {Array} products - Lista plana de productos.
     * @param {Object} schemas - Mapa de esquemas { key: [groups] }.
     * @param {Object} config - Configuración { title, version, introText }.
     * @returns {Blob} - Archivo HTML listo para descargar.
     */
    compile: function(products, schemas, config) {
        
        // 1. INYECTAR DATOS (BOOTLOADER OFFLINE)
        const dataScript = `
            window.APP_DATA = {
                config: ${JSON.stringify(config)},
                products: ${JSON.stringify(products)},
                schemas: ${JSON.stringify(schemas)}
            };
        `;

        // 2. CSS DEL VISOR (Incrustado)
        const cssContent = `
            :root {
                --bg-dark: #0D1117; --bg-panel: #161B22;
                --border: #30363d; --text-main: #c9d1d9; --text-dim: #8b949e;
                --accent: #06b6d4; --accent-glow: rgba(6,182,212,0.15);
                --font-main: 'Inter', system-ui, sans-serif;
                --font-mono: 'ui-monospace', monospace;
            }
            body { background: var(--bg-dark); color: var(--text-main); font-family: var(--font-main); margin: 0; padding: 0; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
            * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: var(--accent) var(--bg-panel); }
            
            /* HEADER */
            header { background: var(--bg-panel); border-bottom: 1px solid var(--border); padding: 0.8rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
            h1 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.5rem; }
            .version-badge { background: var(--accent-glow); color: var(--accent); font-size: 0.75rem; padding: 0.1rem 0.5rem; border: 1px solid var(--accent); border-radius: 4px; font-family: var(--font-mono); }
            .info-btn { background: none; border: 1px solid var(--border); color: var(--text-dim); width: 32px; height: 32px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
            .info-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }

            /* LAYOUT */
            .main-container { display: flex; flex-grow: 1; overflow: hidden; position: relative; }
            .sidebar { width: 320px; border-right: 1px solid var(--border); background: #0f1319; display: flex; flex-direction: column; flex-shrink: 0; transition: transform 0.3s ease; }
            .content-area { flex-grow: 1; padding: 2rem; overflow-y: auto; background-image: radial-gradient(circle at center, #161b22 1px, transparent 1px); background-size: 24px 24px; position: relative; }
            
            /* SEARCH & FILTERS */
            .search-box { padding: 1rem; border-bottom: 1px solid var(--border); background: var(--bg-panel); }
            .search-input { width: 100%; background: #0d1117; border: 1px solid var(--border); color: #fff; padding: 0.6rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9rem; }
            .search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); }
            
            .model-list { flex-grow: 1; overflow-y: auto; padding: 0.5rem 0; }
            .model-item { padding: 0.8rem 1.5rem; border-bottom: 1px dashed var(--border); cursor: pointer; transition: all 0.1s; font-family: var(--font-mono); font-size: 0.85rem; display: flex; justify-content: space-between; }
            .model-item:hover { background: var(--bg-panel); color: var(--accent); padding-left: 1.8rem; }
            .model-item.active { background: var(--accent-glow); color: var(--accent); border-left: 3px solid var(--accent); font-weight: bold; }
            .model-schema-tag { font-size: 0.7em; opacity: 0.5; text-transform: uppercase; border: 1px solid var(--border); padding: 0 4px; border-radius: 3px; }

            /* PRODUCT CARD */
            .product-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; max-width: 800px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: slideUp 0.3s ease-out; }
            .card-header { background: linear-gradient(90deg, var(--bg-panel), #1c2128); padding: 1.5rem; border-bottom: 1px solid var(--border); border-left: 4px solid var(--accent); }
            .card-title { margin: 0; font-size: 1.5rem; color: #fff; font-family: var(--font-mono); }
            
            .specs-container { padding: 0; }
            details { border-bottom: 1px solid var(--border); }
            details:last-child { border-bottom: none; }
            summary { padding: 1rem 1.5rem; cursor: pointer; font-weight: 600; font-size: 0.9rem; list-style: none; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s; }
            summary:hover { background: rgba(255,255,255,0.02); }
            summary::after { content: '+'; font-family: monospace; font-size: 1.2rem; color: var(--text-dim); }
            details[open] summary { color: var(--accent); border-bottom: 1px dashed var(--border); }
            details[open] summary::after { content: '-'; color: var(--accent); }
            
            .group-content { padding: 1rem 1.5rem; background: rgba(0,0,0,0.2); display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
            .spec-item { margin-bottom: 0.5rem; }
            .label { display: block; font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.2rem; }
            .value { font-family: var(--font-mono); font-size: 0.9rem; color: #e6edf3; word-break: break-word; }

            /* WELCOME STATE */
            .welcome-state { text-align: center; color: var(--text-dim); margin-top: 10vh; max-width: 500px; margin-left: auto; margin-right: auto; }
            .welcome-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.2; }
            .intro-text { background: var(--bg-panel); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); margin-top: 2rem; text-align: left; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap; }

            /* MODAL */
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100; display: none; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
            .modal-box { background: var(--bg-panel); width: 90%; max-width: 500px; border-radius: 8px; border: 1px solid var(--border); padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border-top: 3px solid var(--accent); }
            .close-modal { float: right; cursor: pointer; font-size: 1.5rem; line-height: 1; color: var(--text-dim); }
            
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            
            /* MOBILE */
            @media (max-width: 768px) {
                .main-container { flex-direction: column; }
                .sidebar { width: 100%; height: 40%; border-right: none; border-bottom: 1px solid var(--border); }
                .model-list { display: flex; flex-direction: row; overflow-x: auto; padding: 0; }
                .model-item { flex-shrink: 0; border-right: 1px solid var(--border); border-bottom: none; width: 160px; padding: 1rem; flex-direction: column; justify-content: center; text-align: center; }
                .content-area { height: 60%; }
            }
        `;

        // 3. LÓGICA DEL VISOR (Incrustada)
        const jsContent = `
            document.addEventListener('DOMContentLoaded', () => {
                // Estado
                const DB = window.APP_DATA.products;
                const SCHEMAS = window.APP_DATA.schemas;
                const CONFIG = window.APP_DATA.config;

                // DOM
                const listEl = document.getElementById('model-list');
                const contentEl = document.getElementById('content-area');
                const searchInput = document.getElementById('search-input');
                const countBadge = document.getElementById('count-badge');
                const infoModal = document.getElementById('info-modal');
                
                // Init
                document.title = CONFIG.title;
                document.getElementById('app-title-text').textContent = CONFIG.title;
                document.getElementById('app-version-text').textContent = CONFIG.version;
                document.getElementById('intro-text-content').textContent = CONFIG.introText;
                
                renderList(DB);

                // Eventos
                searchInput.addEventListener('input', (e) => {
                    const q = e.target.value.toLowerCase();
                    const filtered = DB.filter(p => p.model.toLowerCase().includes(q));
                    renderList(filtered);
                });

                document.getElementById('info-btn').addEventListener('click', () => infoModal.style.display = 'flex');
                document.getElementById('close-modal').addEventListener('click', () => infoModal.style.display = 'none');
                infoModal.addEventListener('click', (e) => { if(e.target === infoModal) infoModal.style.display = 'none'; });

                // Funciones
                function renderList(items) {
                    listEl.innerHTML = '';
                    countBadge.textContent = items.length;
                    
                    if(items.length === 0) {
                        listEl.innerHTML = '<div style="padding:1rem;text-align:center;color:#666">Sin resultados</div>';
                        return;
                    }

                    const frag = document.createDocumentFragment();
                    items.forEach(p => {
                        const div = document.createElement('div');
                        div.className = 'model-item';
                        div.innerHTML = '<span>' + p.model + '</span> <span class="model-schema-tag">' + p.schema_key + '</span>';
                        div.onclick = () => loadProduct(p);
                        frag.appendChild(div);
                    });
                    listEl.appendChild(frag);
                }

                function loadProduct(p) {
                    // UI Active State
                    document.querySelectorAll('.model-item').forEach(el => el.classList.remove('active'));
                    // Nota: En lista muy larga esto es lento, pero para offline sirve.
                    
                    const schema = SCHEMAS[p.schema_key];
                    if(!schema) return alert("Error: Estructura de gama no encontrada");

                    let html = '<div class="product-card"><div class="card-header"><h2 class="card-title">' + p.model + '</h2></div><div class="specs-container">';
                    
                    schema.forEach(group => {
                        let groupHtml = '<details open><summary>' + group.group + '</summary><div class="group-content">';
                        let hasContent = false;
                        
                        group.attrs.forEach(attr => {
                            const val = p.attributes[attr.code];
                            if(val) {
                                hasContent = true;
                                groupHtml += '<div class="spec-item"><span class="label">' + attr.desc + '</span><div class="value">' + val + '</div></div>';
                            }
                        });
                        
                        groupHtml += '</div></details>';
                        if(hasContent) html += groupHtml;
                    });
                    
                    html += '</div></div>';
                    contentEl.innerHTML = html;
                }
            });
        `;

        // 4. ESTRUCTURA HTML FINAL
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokedex Drive</title>
    <style>${cssContent}</style>
</head>
<body>
    <header>
        <h1>
            <span id="app-title-text">Cargando...</span> 
            <span id="app-version-text" class="version-badge">vX.X</span>
        </h1>
        <button id="info-btn" class="info-btn" title="Información">i</button>
    </header>

    <div class="main-container">
        <aside class="sidebar">
            <div class="search-box">
                <input type="text" id="search-input" class="search-input" placeholder="Buscar modelo...">
                <div style="margin-top:0.5rem; font-size:0.75rem; color:var(--text-dim); text-align:right">
                    <span id="count-badge">0</span> elementos
                </div>
            </div>
            <div id="model-list" class="model-list"></div>
        </aside>
        
        <main id="content-area" class="content-area">
            <div class="welcome-state">
                <div class="welcome-icon">💾</div>
                <h2>Selecciona un modelo</h2>
                <p>Navega por la lista lateral para ver las especificaciones.</p>
                
            </div>
        </main>
    </div>

    <div id="info-modal" class="modal">
        <div class="modal-box">
            <span id="close-modal" class="close-modal">&times;</span>
            <h2 style="margin-top:0; color:var(--accent)">Acerca de</h2>
            <div id="intro-text-content" style="white-space: pre-wrap; line-height:1.6; color:var(--text-dim)"></div>
            <hr style="border:0; border-top:1px solid var(--border); margin:1.5rem 0;">
            <p style="font-size:0.8rem; text-align:center; opacity:0.5">Generado con Pokedex Drive Engine</p>
        </div>
    </div>

    <script>${dataScript}<\/script>
    <script>${jsContent}<\/script>
</body>
</html>`;

        return new Blob([html], { type: 'text/html' });
    }
};