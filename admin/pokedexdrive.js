/**
 * Pokedex Drive Compiler Engine v3.0
 * Genera un archivo HTML único con toda la lógica y estilos de la aplicación original.
 */

const PokedexDrive = {

    compile: function(products, schemas, config) {
        
        // 1. PREPARAR DATOS (JSON Seguro)
        // Escapamos caracteres que puedan romper el script inyectado
        const safeProducts = JSON.stringify(products).replace(/<\/script>/g, '<\\/script>');
        const safeSchemas = JSON.stringify(schemas).replace(/<\/script>/g, '<\\/script>');

        // 2. CSS COMPLETO (Tu estilo visual exacto)
        const cssContent = `
:root {
    --color-bg-dark: #0D1117; --color-bg-medium: #161B22;
    --color-border: #21262D; --color-border-light: #2a3038;
    --color-text-primary: #e2e8f0; --color-text-secondary: #9ca3af; --color-text-dim: #6b7280;
    --color-cyan-accent: #06b6d4; --color-cyan-glow: rgba(6, 182, 212, 0.25);
    --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
    --font-secondary: 'ui-monospace', 'SFMono-Regular', monospace;
}
body { background-color: var(--color-bg-dark); color: var(--color-text-secondary); font-family: var(--font-primary); margin: 0; transition: all 0.3s ease; }
button, input, select, textarea { font-family: var(--font-primary); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-medium); }
::-webkit-scrollbar-thumb { background: var(--color-cyan-accent); border-radius: 3px; }

.container { max-width: 1280px; margin: 0 auto; padding: 0.75rem; }
.main-layout { display: flex; flex-direction: column; gap: 1rem; }
body.model-is-selected .sidebar-column { display: none; }
body.model-is-selected .main-column { width: 100%; }
body.model-is-selected .smart-filter-wrapper-v2 { display: none; }

.app-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); margin-bottom: 0.75rem; }
.app-title { font-family: var(--font-secondary); font-size: 1.25rem; color: var(--color-text-primary); margin: 0; }
.app-version { color: var(--color-cyan-accent); font-size: 0.75rem; border: 1px solid var(--color-border); padding: 0 4px; border-radius: 4px; background: var(--color-bg-medium); }

.settings-menu-wrapper { position: relative; }
.settings-button { background: var(--color-bg-medium); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 1.2rem; border-radius: 4px; padding: 0.4rem; cursor: pointer; }
.settings-menu-panel-hidden { display: none; }
.settings-menu-panel-open { display: block; position: absolute; top: 100%; right: 0; background: var(--color-bg-medium); border: 1px solid var(--color-border-light); z-index: 50; border-radius: 0.5rem; padding: 0.5rem; min-width: 160px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.settings-menu-item { display: block; width: 100%; text-align: left; padding: 0.6rem; background: transparent; border: none; color: var(--color-text-secondary); cursor: pointer; }
.settings-menu-item:hover { color: var(--color-cyan-accent); }

.futuristic-card { background: var(--color-bg-medium); border: 1px solid var(--color-border); border-left: 3px solid var(--color-cyan-accent); border-radius: 0.5rem; padding: 1rem; }
.futuristic-title { font-family: var(--font-secondary); font-size: 1.1rem; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); margin-bottom: 0.75rem; padding-bottom: 0.4rem; margin-top:0; }
.futuristic-input, .futuristic-select { background: var(--color-bg-dark); border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 0.6rem; width: 100%; box-sizing: border-box; border-radius: 4px; }
.futuristic-input:focus { outline: none; border-color: var(--color-cyan-accent); }

.futuristic-list { background: var(--color-bg-dark); border: 1px solid var(--color-border-light); border-radius: 4px; max-height: 60vh; overflow-y: auto; }
.list-item { padding: 0.5rem 0.75rem; border-bottom: 1px dashed var(--color-border); cursor: pointer; font-family: var(--font-secondary); font-size: 0.85rem; }
.list-item:hover { color: var(--color-cyan-accent); background: var(--color-border); }
.list-item.active { background: var(--color-cyan-glow); color: var(--color-cyan-accent); border-left: 3px solid var(--color-cyan-accent); font-weight: bold; }

.spec-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); margin-bottom: 1rem; padding-bottom: 0.5rem; }
.spec-title { font-family: var(--font-secondary); font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.spec-controls-hidden { display: none; }
.spec-controls-visible { display: flex; gap: 0.5rem; }
.spec-button { background: var(--color-bg-medium); border: 1px solid var(--color-border); color: var(--color-text-secondary); cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 4px; }

details.spec-group { border: 1px solid var(--color-border); border-radius: 4px; margin-bottom: 0.5rem; overflow: hidden; }
summary { background: var(--color-border); padding: 0.5rem 0.75rem; cursor: pointer; font-family: var(--font-secondary); font-weight: 600; color: var(--color-text-primary); list-style: none; }
.spec-group-content { padding: 0.75rem; background: var(--color-bg-dark); }
.spec-row { display: flex; justify-content: space-between; border-bottom: 1px dotted var(--color-border); padding: 0.4rem 0; font-size: 0.85rem; }
.attr-desc { color: var(--color-text-secondary); }
.attr-value { color: var(--color-text-primary); font-family: var(--font-secondary); font-weight: 500; text-align: right; }

.modal-hidden { display: none; }
.modal-visible { display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100; align-items: center; justify-content: center; }
.modal-content { background: var(--color-bg-medium); border: 1px solid var(--color-border); border-left: 3px solid var(--color-cyan-accent); width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; border-radius: 0.5rem; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--color-border); }
.modal-body { padding: 1.5rem; white-space: pre-wrap; font-family: var(--font-primary); color: var(--color-text-secondary); }
.modal-close-btn { background: none; border: none; font-size: 1.5rem; color: var(--color-text-secondary); cursor: pointer; }

/* Filter Styles */
.smart-filter-wrapper-v2 { position: relative; margin-top: 0.5rem; }
.smart-filter-summary { width: 100%; background: var(--color-bg-medium); border: 1px solid var(--color-border); color: var(--color-text-secondary); padding: 0.5rem; border-radius: 4px; text-align: left; cursor: pointer; display: flex; justify-content: space-between; }
.smart-filter-content-hidden { display: none; }
.smart-filter-content-open { display: block; position: absolute; top: 100%; left: 0; width: 100%; background: var(--color-bg-medium); border: 1px solid var(--color-border); z-index: 40; padding: 1rem; border-radius: 4px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); box-sizing: border-box; }
.filter-group-title { background: var(--color-border); padding: 0.4rem; font-size: 0.9rem; font-weight: bold; color: var(--color-text-primary); margin-top: 0.5rem; border-radius: 4px; }
.active-filters-bar-visible { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; padding: 0.5rem; background: var(--color-bg-medium); border: 1px solid var(--color-border); border-radius: 4px; }
.active-filter-chip { background: var(--color-cyan-glow); border: 1px solid var(--color-cyan-accent); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 0.5rem; }
.chip-remove-btn { background: none; border: none; color: var(--color-cyan-accent); font-weight: bold; cursor: pointer; }

/* Search & Selected */
.search-wrapper { position: relative; }
.search-clear-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-text-dim); cursor: pointer; font-size: 1.2rem; }
#selected-model-display { margin-top: 0.5rem; }
.model-chip-button { background: var(--color-cyan-glow); border: 1px solid var(--color-cyan-accent); color: var(--color-cyan-accent); padding: 0.4rem 0.8rem; border-radius: 20px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-secondary); }

/* Responsive */
@media (min-width: 768px) {
    .main-layout { flex-direction: row; align-items: flex-start; }
    .sidebar-column { width: 300px; flex-shrink: 0; }
    .main-column { flex-grow: 1; }
    body.model-is-selected .sidebar-column { display: block; } /* En escritorio se ve siempre */
}
        `;

        // 3. JS LÓGICO (Adaptado para Offline)
        // Eliminamos XHR y usamos window.APP_DB directamente
        const jsContent = `
document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO Y REFERENCIAS ---
    let masterDatabase = window.APP_DB.products;
    let masterSchemaMap = window.APP_DB.schemas;
    let activeSchemas = new Set(Object.keys(masterSchemaMap));
    let attrCodeToDescMap = {};

    const dom = {
        body: document.body,
        modelSearchInput: document.getElementById('search-model'),
        searchClearBtn: document.getElementById('clear-search-btn'),
        modelSearchResults: document.getElementById('model-results-list'),
        modelListHeader: document.getElementById('model-list-header'),
        productTitle: document.getElementById('product-title'),
        productSpecsContainer: document.getElementById('product-specs'),
        specControls: document.getElementById('spec-controls'),
        selectedModelDisplay: document.getElementById('selected-model-display'),
        productPlaceholder: document.getElementById('product-placeholder'),
        
        // Filtros y Menus
        smartFilterToggle: document.getElementById('smart-filter-toggle'),
        smartFilterPanel: document.getElementById('smart-filter-panel'),
        smartFilterContainer: document.getElementById('smart-filters-container'),
        schemaFilterSelect: document.getElementById('schema-filter-select'),
        activeFiltersBar: document.getElementById('active-filters-bar'),
        filterOverlay: document.getElementById('filter-overlay'),
        settingsMenuToggle: document.getElementById('settings-menu-toggle'),
        settingsMenuPanel: document.getElementById('settings-menu-panel'),
        
        // Modales
        readmeModal: document.getElementById('readme-modal'),
        readmeContent: document.getElementById('readme-content'),
        infoBtn: document.getElementById('info-toggle-btn'),
        modalCloseBtns: document.querySelectorAll('.modal-close-btn'),
        paletteBtn: document.getElementById('palette-toggle-btn')
    };

    // --- INIT ---
    function initialize() {
        buildAttributeCache();
        populateSchemaSelector();
        populateSmartFilters('all');
        renderSearchResults(masterDatabase);
        
        // Listeners
        dom.modelSearchInput.addEventListener('input', applyFiltersAndSearch);
        dom.searchClearBtn.addEventListener('click', () => { dom.modelSearchInput.value = ''; applyFiltersAndSearch(); });
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        
        dom.smartFilterToggle.addEventListener('click', () => togglePanel(dom.smartFilterPanel));
        dom.settingsMenuToggle.addEventListener('click', () => togglePanel(dom.settingsMenuPanel));
        dom.filterOverlay.addEventListener('click', closeAllPanels);
        
        dom.schemaFilterSelect.addEventListener('change', () => { populateSmartFilters(dom.schemaFilterSelect.value); applyFiltersAndSearch(); });
        dom.smartFilterContainer.addEventListener('change', applyFiltersAndSearch);
        
        dom.infoBtn.addEventListener('click', showInfo);
        dom.paletteBtn.addEventListener('click', toggleTheme);
        
        dom.modalCloseBtns.forEach(b => b.addEventListener('click', closeAllPanels));
        
        document.getElementById('expand-all-btn').addEventListener('click', () => toggleSpecs(true));
        document.getElementById('collapse-all-btn').addEventListener('click', () => toggleSpecs(false));
        
        // Delegación para eliminar filtros
        if(dom.activeFiltersBar) {
            dom.activeFiltersBar.addEventListener('click', (e) => {
                if(e.target.closest('.chip-remove-btn')) {
                    const btn = e.target.closest('.chip-remove-btn');
                    if(btn.dataset.action === 'remove-schema') {
                        dom.schemaFilterSelect.value = 'all'; 
                        populateSmartFilters('all');
                    } else {
                        const select = dom.smartFilterContainer.querySelector('select[data-attribute="'+btn.dataset.attrCode+'"]');
                        if(select) select.value = "";
                    }
                    applyFiltersAndSearch();
                }
            });
        }
    }

    // --- CORE LOGIC ---
    function buildAttributeCache() {
        Object.values(masterSchemaMap).forEach(schema => schema.forEach(g => g.attrs.forEach(a => attrCodeToDescMap[a.code] = a.desc)));
    }

    function populateSchemaSelector() {
        dom.schemaFilterSelect.innerHTML = '<option value="all">Todas</option>';
        Object.keys(masterSchemaMap).forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = k.charAt(0).toUpperCase() + k.slice(1);
            dom.schemaFilterSelect.appendChild(opt);
        });
    }

    function populateSmartFilters(schemaKey) {
        dom.smartFilterContainer.innerHTML = '';
        if(schemaKey === 'all') {
            dom.smartFilterContainer.innerHTML = '<p style="color:var(--color-text-dim); font-size:0.8rem; padding:0.5rem;">Selecciona una gama para ver filtros.</p>';
            return;
        }
        
        const products = masterDatabase.filter(p => p.schema_key === schemaKey);
        const schema = masterSchemaMap[schemaKey];
        
        schema.forEach(group => {
            let hasFilters = false;
            const groupContainer = document.createElement('div');
            groupContainer.className = 'filter-group-wrapper';
            groupContainer.innerHTML = '<div class="filter-group-title">'+group.group+'</div>';
            const rows = document.createElement('div');
            rows.className = 'filter-rows-container expanded';
            
            group.attrs.forEach(attr => {
                const values = [...new Set(products.map(p => p.attributes[attr.code]).filter(v => v))].sort();
                if(values.length > 0) {
                    hasFilters = true;
                    const row = document.createElement('div');
                    row.style.marginBottom = "0.5rem";
                    row.innerHTML = '<label style="font-size:0.8rem; display:block; color:var(--color-text-secondary);">'+attr.desc+'</label>';
                    const select = document.createElement('select');
                    select.className = 'futuristic-select';
                    select.dataset.attribute = attr.code;
                    select.innerHTML = '<option value="">-- Cualquiera --</option>' + values.map(v => '<option value="'+v+'">'+v+'</option>').join('');
                    row.appendChild(select);
                    rows.appendChild(row);
                }
            });
            
            if(hasFilters) {
                groupContainer.appendChild(rows);
                dom.smartFilterContainer.appendChild(groupContainer);
            }
        });
    }

    function applyFiltersAndSearch() {
        const q = dom.modelSearchInput.value.toLowerCase().trim();
        const schema = dom.schemaFilterSelect.value;
        const activeFilters = {};
        
        dom.smartFilterContainer.querySelectorAll('select').forEach(s => {
            if(s.value) activeFilters[s.dataset.attribute] = s.value;
        });

        const filtered = masterDatabase.filter(p => {
            if(schema !== 'all' && p.schema_key !== schema) return false;
            if(q && !p.model.toLowerCase().includes(q)) return false;
            for(let key in activeFilters) {
                if(p.attributes[key] !== activeFilters[key]) return false;
            }
            return true;
        });

        renderSearchResults(filtered);
        renderActiveFilters(activeFilters, schema);
        
        // UI Search Clear
        dom.searchClearBtn.style.display = q ? 'block' : 'none';
    }

    function renderSearchResults(list) {
        dom.modelSearchResults.innerHTML = '';
        dom.modelListHeader.textContent = 'Modelos (' + list.length + ')';
        if(list.length === 0) {
            dom.modelSearchResults.innerHTML = '<div class="list-item" style="cursor:default">Sin resultados</div>';
            return;
        }
        
        // Optimización con Fragment
        const frag = document.createDocumentFragment();
        list.forEach(p => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.textContent = p.model;
            div.dataset.model = p.model;
            frag.appendChild(div);
        });
        dom.modelSearchResults.appendChild(frag);
    }

    function renderActiveFilters(filters, schema) {
        dom.activeFiltersBar.innerHTML = '';
        if(schema === 'all' && Object.keys(filters).length === 0) {
            dom.activeFiltersBar.className = 'active-filters-bar-hidden';
            return;
        }
        dom.activeFiltersBar.className = 'active-filters-bar-visible';
        
        if(schema !== 'all') {
            const div = document.createElement('div');
            div.className = 'active-filter-chip schema-chip';
            div.innerHTML = '<span>Gama: <b>'+schema.toUpperCase()+'</b></span> <button class="chip-remove-btn" data-action="remove-schema">×</button>';
            dom.activeFiltersBar.appendChild(div);
        }
        
        Object.entries(filters).forEach(([code, val]) => {
            const div = document.createElement('div');
            div.className = 'active-filter-chip';
            div.innerHTML = '<span>'+(attrCodeToDescMap[code]||code)+': <b>'+val+'</b></span> <button class="chip-remove-btn" data-attr-code="'+code+'">×</button>';
            dom.activeFiltersBar.appendChild(div);
        });
    }

    function handleResultClick(e) {
        const item = e.target.closest('.list-item');
        if(!item) return;
        
        // UI Selection
        document.querySelectorAll('.list-item.active').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Load Product
        const p = masterDatabase.find(x => x.model === item.dataset.model);
        if(p) displayProduct(p);
        
        // Mobile UX
        if(window.innerWidth < 768) {
            dom.body.classList.add('model-is-selected');
            closeAllPanels();
        }
    }

    function displayProduct(p) {
        dom.productPlaceholder.style.display = 'none';
        dom.specControls.className = 'spec-controls-visible';
        dom.productTitle.textContent = p.model;
        dom.productSpecsContainer.innerHTML = '';
        
        // Selected Chip Logic
        dom.selectedModelDisplay.innerHTML = '<button class="model-chip-button">Modelo: '+p.model+' <span onclick="clearSelection()">×</span></button>';
        
        const schema = masterSchemaMap[p.schema_key];
        if(!schema) return;

        schema.forEach(group => {
            const details = document.createElement('details');
            details.className = 'spec-group';
            details.open = true; // Default open
            const summary = document.createElement('summary');
            summary.textContent = group.group;
            details.appendChild(summary);
            
            const content = document.createElement('div');
            content.className = 'spec-group-content';
            let hasContent = false;
            
            group.attrs.forEach(attr => {
                const val = p.attributes[attr.code];
                if(val && val !== 'unknown') {
                    hasContent = true;
                    const row = document.createElement('div');
                    row.className = 'spec-row';
                    row.innerHTML = '<span class="attr-desc">'+attr.desc+'</span><span class="attr-value">'+val+'</span>';
                    content.appendChild(row);
                }
            });
            
            if(hasContent) {
                details.appendChild(content);
                dom.productSpecsContainer.appendChild(details);
            }
        });
    }

    // --- UI HELPERS ---
    window.clearSelection = function() {
        dom.body.classList.remove('model-is-selected');
        dom.selectedModelDisplay.innerHTML = '';
        dom.productTitle.textContent = 'Selecciona un producto';
        dom.productSpecsContainer.innerHTML = '';
        dom.productPlaceholder.style.display = 'block';
        dom.specControls.className = 'spec-controls-hidden';
    };

    function togglePanel(panel) {
        const isOpen = panel.className.includes('open');
        closeAllPanels();
        if(!isOpen) {
            panel.className = panel.className.replace('hidden', 'open');
            dom.filterOverlay.className = 'overlay-visible';
        }
    }

    function closeAllPanels() {
        dom.smartFilterPanel.className = 'smart-filter-content-hidden';
        dom.settingsMenuPanel.className = 'settings-menu-panel-hidden';
        dom.filterOverlay.className = 'overlay-hidden';
        dom.readmeModal.className = 'modal-hidden';
    }

    function showInfo() {
        closeAllPanels();
        dom.readmeContent.textContent = window.APP_CONFIG ? window.APP_CONFIG.introText : "Info Pokedex Drive";
        dom.readmeModal.className = 'modal-visible';
        dom.filterOverlay.className = 'overlay-visible';
    }

    function toggleSpecs(open) {
        dom.productSpecsContainer.querySelectorAll('details').forEach(d => d.open = open);
    }
    
    function toggleTheme() {
       // Simple Toggle para offline (Solo cambia variables CSS si es necesario)
       // Aquí asumimos que el CSS hace el trabajo con variables.
       alert("Cambio de tema no persistente en modo Offline.");
    }

    initialize();
});
`;

        // 4. CONSTRUIR HTML FINAL
        const finalHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title || 'Pokedex Drive'}</title>
    <style>${cssContent}</style>
    <script>
        /* BOOTLOADER OFFLINE */
        window.APP_DB = {
            products: ${safeProducts},
            schemas: ${safeSchemas}
        };
        window.APP_CONFIG = ${JSON.stringify(config)};
        window.IS_POKEDEX_DRIVE = true;
    <\/script>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <header class="app-header">
            <div class="header-left">
                <h1 class="app-title">${config.title || 'Pokedex Drive'} 📟 <span class="app-version">${config.version || 'v1.0'}</span></h1>
                <div id="selected-model-display" class="model-chip-hidden"></div>
            </div>

            <div class="settings-menu-wrapper absolute-top-right">
                <button id="settings-menu-toggle" class="settings-button" title="Ajustes">⚙️</button>
                <div id="settings-menu-panel" class="settings-menu-panel-hidden">
                    <button id="palette-toggle-btn" class="settings-menu-item">🎨 Tema</button>
                    <button id="info-toggle-btn" class="settings-menu-item">ℹ️ Info</button>
                </div>
            </div>

            <div class="header-right-controls">
                <div id="smart-filter-system" class="smart-filter-wrapper-v2">
                    <button id="smart-filter-toggle" class="smart-filter-summary">Filtros</button>
                    <div id="smart-filter-panel" class="smart-filter-content-hidden">
                        <div class="filter-schema-selector">
                            <label for="schema-filter-select">Gama:</label>
                            <select id="schema-filter-select" class="futuristic-select">
                                <option value="all">Todas</option>
                            </select>
                        </div>
                        <div id="smart-filters-container" class="smart-filters-list"></div>
                    </div>
                </div>
            </div> 
        </header>

        <div id="active-filters-bar" class="active-filters-bar-hidden"></div>

        <div class="main-layout">
            <aside class="sidebar-column">
                <div class="futuristic-card search-panel">
                    <h2 id="model-list-header" class="futuristic-title">Modelos (...)</h2>
                    <div class="search-wrapper">
                        <input type="text" id="search-model" placeholder="..." class="futuristic-input w-full">
                        <button id="clear-search-btn" class="search-clear-btn" style="display: none;">&times;</button>
                    </div>
                    <div id="model-results-list" class="futuristic-list full-list-visible"></div>
                </div>
            </aside>
            <main class="main-column">
                <div class="futuristic-card sticky-panel">
                    <div class="spec-header">
                        <h2 id="product-title" class="spec-title">Selecciona un producto</h2>
                        <div id="spec-controls" class="spec-controls-hidden">
                            <button id="expand-all-btn" class="spec-button">[■]</button>
                            <button id="collapse-all-btn" class="spec-button">[-]</button>
                        </div>
                    </div>
                    <div id="product-specs" class="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        <p id="product-placeholder" class="text-gray-400">...</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
    
    <div id="filter-overlay" class="overlay-hidden"></div>
    
    <div id="readme-modal" class="modal-hidden">
        <div class="modal-content">
            <div class="modal-header"><h2>Info</h2><button id="readme-close-btn" class="modal-close-btn modal-close-btn">&times;</button></div>
            <pre id="readme-content" class="modal-body"></pre>
        </div>
    </div>

    <script>${jsContent}<\/script>
</body>
</html>`;

        // Generar Blob
        return new Blob([finalHTML], { type: 'text/html' });
    }
};