/**
 * Pokedex Drive Compiler Engine v4.0
 * Genera una aplicación Single-File (HTML) con el diseño "v4.9 Consolidated"
 */

const PokedexDrive = {

    compile: function(products, schemas, config) {
        
        // 1. SERIALIZACIÓN SEGURA DE DATOS
        // Evitamos que cadenas dentro de los datos rompan el script </script>
        const safeProducts = JSON.stringify(products).replace(/<\/script>/g, '<\\/script>');
        const safeSchemas = JSON.stringify(schemas).replace(/<\/script>/g, '<\\/script>');
        const safeConfig = JSON.stringify(config).replace(/<\/script>/g, '<\\/script>');

        // 2. CSS DEL VISOR (Tu estilo v4.9 completo)
        const cssContent = `
:root {
    --color-bg-dark: #0D1117; --color-bg-medium: #161B22;
    --color-border: #21262D; --color-border-light: #2a3038;
    --color-text-primary: #e2e8f0; --color-text-secondary: #9ca3af; --color-text-dim: #6b7280;
    --color-cyan-accent: #06b6d4; --color-cyan-glow: rgba(6, 182, 212, 0.25);
    --font-primary: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-secondary: 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', monospace;
}
body { background-color: var(--color-bg-dark); color: var(--color-text-secondary); font-family: var(--font-primary); line-height: 1.5; margin: 0; transition: background-color 0.3s, color 0.3s; }
button, input, select, textarea { font-family: var(--font-primary); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-medium); border-radius: 3px; }
::-webkit-scrollbar-thumb { background: var(--color-cyan-accent); border-radius: 3px; }

.container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0.75rem; box-sizing: border-box; position: relative; }
.main-layout { display: flex; flex-direction: column; gap: 1rem; transition: all 0.3s ease-in-out; }
body.model-is-selected .sidebar-column { display: none; }
body.model-is-selected .main-column { width: 100%; }
body.model-is-selected #smart-filter-system, body.model-is-selected #active-filters-bar { display: none; }
body.model-is-selected #selected-model-display { display: block; }
.sticky-panel { position: sticky; top: 1rem; }
.w-full { width: 100%; }
.text-gray-400 { color: var(--color-text-secondary); }
.overflow-y-auto { overflow-y: auto; }
.max-h-64 { max-height: 16rem; }

/* HEADER */
.app-header { position: relative; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); gap: 0.75rem; min-height: 40px; }
.header-left { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding-right: 50px; }
.app-title { font-family: var(--font-secondary); font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; letter-spacing: -0.5px; }
.app-version { font-size: 0.75rem; padding: 0 0.3rem; font-family: var(--font-secondary); color: var(--color-cyan-accent); background-color: var(--color-bg-medium); border-radius: 4px; border: 1px solid var(--color-border); position: relative; top: -2px; white-space: nowrap; }
#selected-model-display.model-chip-hidden { display: none; }
.model-chip-button { font-family: var(--font-secondary); font-size: 0.85rem; font-weight: 600; color: var(--color-cyan-accent); background-color: var(--color-cyan-glow); border: 1px solid var(--color-cyan-accent); border-radius: 1rem; padding: 0.35rem 0.6rem 0.35rem 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.model-chip-button span { font-family: var(--font-primary); font-weight: 900; font-size: 1rem; color: var(--color-text-primary); }
.header-right-controls { display: flex; width: 100%; }

/* SETTINGS */
.settings-menu-wrapper { position: relative; }
.settings-menu-wrapper.absolute-top-right { position: absolute; top: 0; right: 0; z-index: 60; }
.settings-button { background-color: var(--color-bg-medium); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 1.2rem; line-height: 1; border-radius: 4px; cursor: pointer; padding: 0.4rem 0.6rem; height: 38px; width: 38px; }
.settings-menu-panel-hidden { display: none; }
.settings-menu-panel-open { display: block; position: absolute; z-index: 50; top: calc(100% + 0.25rem); right: 0; width: 200px; background: var(--color-bg-medium); border: 1px solid var(--color-border-light); border-radius: 0.5rem; padding: 0.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.settings-menu-item { background-color: var(--color-bg-dark); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 0.85rem; font-weight: 600; border-radius: 4px; padding: 0.6rem 0.8rem; width: 100%; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; box-sizing: border-box; margin-top: 0.25rem; font-family: var(--font-primary); }
.settings-menu-item:hover { border-color: var(--color-cyan-accent); color: var(--color-cyan-accent); }

/* FILTROS */
.smart-filter-wrapper-v2 { position: relative; width: 100%; flex-grow: 1; }
.smart-filter-summary { font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary); background-color: var(--color-bg-medium); border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 0.6rem 0.9rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; width: 100%; }
.smart-filter-summary::after { content: '[■]'; font-family: var(--font-secondary); color: var(--color-cyan-accent); margin-left: 0.5rem; }
.smart-filter-summary.active::after { content: '[-]'; }
.smart-filter-content-hidden { display: none; }
.smart-filter-content-open { display: block; position: absolute; z-index: 50; top: calc(100% + 0.25rem); box-sizing: border-box; left: 0; right: 0; width: 100%; min-width: 280px; background: var(--color-bg-medium); border: 1px solid var(--color-border-light); border-radius: 0.5rem; padding: 0.75rem; max-height: 70vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.smart-filters-list { display: flex; flex-direction: column; gap: 0.25rem; }
.filter-group-wrapper { border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; }
.filter-group-title { font-family: var(--font-secondary); font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); padding: 0.5rem 0.75rem; background: var(--color-border); display: flex; align-items: center; cursor: pointer; margin: 0; }
.filter-toggle-btn { width: 12px; height: 12px; border: none; border-radius: 3px; margin-right: 0.5rem; padding: 0; }
.filter-toggle-btn.gray { background-color: var(--color-text-dim); }
.filter-toggle-btn.blue { background-color: var(--color-cyan-accent); }
.filter-rows-container { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
.filter-rows-container.collapsed { display: none; }
.filter-rows-container.expanded { display: flex; }
.filter-row { display: grid; grid-template-columns: 1fr; gap: 0.3rem; }
@media (min-width: 480px) { .filter-row { grid-template-columns: 1fr 1fr; align-items: center; } }
.filter-row label { font-size: 0.8rem; color: var(--color-text-secondary); padding-right: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--font-primary); }
.overlay-visible { display: block; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); z-index: 49; }
.overlay-hidden { display: none; }

/* CHIPS */
.active-filters-bar-hidden { display: none; }
.active-filters-bar-visible { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-bg-medium); border: 1px solid var(--color-border); border-radius: 0.5rem; margin-bottom: 1rem; height: auto; max-height: none; overflow: visible; }
.active-filter-chip { display: flex; align-items: center; gap: 0.5rem; background: var(--color-cyan-glow); border: 1px solid var(--color-cyan-accent); border-radius: 4px; padding: 0.35rem 0.6rem; font-family: var(--font-secondary); font-size: 0.8rem; color: var(--color-text-primary); max-width: 100%; height: auto; }
.schema-chip { border-color: var(--color-text-secondary); background: var(--color-border); }
.chip-label { display: flex; flex-wrap: wrap; gap: 0.3rem; white-space: normal; word-break: break-word; line-height: 1.3; }
.chip-label .filter-name { white-space: normal; font-weight: 400; color: var(--color-text-secondary); font-family: var(--font-primary); }
.chip-label .filter-value { color: var(--color-text-primary); font-weight: 700; white-space: normal; overflow: visible; text-overflow: clip; }
.chip-remove-btn { background: none; border: none; color: var(--color-cyan-accent); font-weight: 700; cursor: pointer; padding: 0 0.25rem; min-width: 24px; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chip-remove-btn:hover { color: #fff; background-color: rgba(255,255,255,0.1); border-radius: 4px; }

/* TARJETAS & INPUTS */
.futuristic-card { background-color: var(--color-bg-medium); border: 1px solid var(--color-border); border-left: 3px solid var(--color-cyan-accent); border-radius: 0.5rem; padding: 1rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
.search-panel { display: flex; flex-direction: column; }
.futuristic-title { font-family: var(--font-secondary); font-size: 1.15rem; font-weight: 600; color: var(--color-text-primary); margin: 0; margin-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.4rem; }
.futuristic-input, .futuristic-select { background-color: var(--color-bg-dark); border: 1px solid var(--color-border); color: var(--color-text-primary); border-radius: 4px; padding: 0.6rem 0.8rem; font-size: 0.85rem; width: 100%; box-sizing: border-box; font-family: var(--font-primary); }
.futuristic-input:focus, .futuristic-select:focus { outline: none; border-color: var(--color-cyan-accent); }
.futuristic-list { background-color: var(--color-bg-dark); border: 1px solid var(--color-border-light); border-radius: 4px; }
.full-list-visible { margin-top: 0.75rem; flex-grow: 1; overflow-y: auto; border-radius: 4px; background-color: var(--color-bg-dark); }
.futuristic-list .list-item { padding: 0.45rem 0.75rem; border-bottom: 1px dashed var(--color-border); cursor: pointer; font-size: 0.85rem; font-family: var(--font-secondary); }
.futuristic-list .list-item:hover { background-color: var(--color-border); color: var(--color-cyan-accent); }
.futuristic-list .list-item.active { background-color: var(--color-cyan-glow); color: var(--color-cyan-accent); font-weight: 600; border-left: 3px solid var(--color-cyan-accent); }
.search-wrapper { position: relative; width: 100%; }
.search-clear-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-text-secondary); font-size: 1.2rem; cursor: pointer; padding: 0; line-height: 1; z-index: 2; }
.futuristic-input.has-text { border-color: var(--color-cyan-accent); box-shadow: 0 0 0 1px var(--color-cyan-glow); }

/* SPECS */
.spec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.4rem; }
.spec-title { font-family: var(--font-secondary); font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.spec-controls-hidden { display: none; }
body.model-is-selected .spec-controls-visible { display: flex; gap: 0.5rem; }
.spec-button { background-color: var(--color-bg-medium); border: 1px solid var(--color-border-light); color: var(--color-text-secondary); font-family: var(--font-secondary); font-size: 0.8rem; font-weight: 600; border-radius: 4px; cursor: pointer; padding: 0.2rem 0.4rem; }
details.spec-group { border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; }
details.spec-group summary { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); font-family: var(--font-secondary); padding: 0.5rem 0.75rem; background: var(--color-border); display: flex; align-items: center; cursor: pointer; list-style: none; }
details.spec-group summary::before { content: ''; width: 12px; height: 12px; border-radius: 3px; margin-right: 0.5rem; background-color: var(--color-text-dim); }
details[open].spec-group summary::before { background-color: var(--color-cyan-accent); }
.spec-group-content { padding: 0.75rem 1.25rem; border-top: 1px solid var(--color-border-light); background-color: var(--color-bg-dark); }
.spec-row { display: flex; flex-direction: column; justify-content: space-between; padding: 0.45rem 0; font-size: 0.85rem; border-bottom: 1px dotted var(--color-border-light); }
@media (min-width: 768px) { .spec-row { flex-direction: row; } }
.spec-row .attr-desc { color: var(--color-text-secondary); margin-right: 0.75rem; font-family: var(--font-primary); }
.spec-row .attr-value { color: var(--color-text-primary); font-weight: 500; font-family: var(--font-secondary); text-align: right; }

/* MODALS */
.modal-hidden { display: none; }
.modal-visible { display: flex; position: fixed; z-index: 99; left: 0; top: 0; width: 100%; height: 100%; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); }
.modal-content { background: var(--color-bg-medium); border: 1px solid var(--color-border-light); border-left: 3px solid var(--color-cyan-accent); border-radius: 0.5rem; width: 90%; max-width: 800px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border); }
.modal-close-btn { background: none; border: none; font-size: 1.75rem; color: var(--color-text-secondary); cursor: pointer; }
.modal-body { padding: 1rem; overflow-y: auto; font-family: var(--font-primary); font-size: 0.8rem; color: var(--color-text-secondary); white-space: pre-wrap; }

/* RESPONSIVE */
@media (min-width: 768px) {
    .main-layout { flex-direction: row; align-items: flex-start; }
    .sidebar-column { width: 300px; flex-shrink: 0; }
    .main-column { flex-grow: 1; width: calc(100% - 316px); }
    body.model-is-selected .sidebar-column { display: block; }
    body.model-is-selected #selected-model-display { display: none; }
    .app-header { flex-direction: row; align-items: center; }
    .header-right-controls { width: auto; }
}
        `;

        // 3. JS LÓGICO DEL VISOR (Inyectando datos de APP_DB)
        // La lógica JS será una cadena que se ejecutará en el cliente.
        const jsContent = `
document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO INICIAL ---
    // Recuperamos los datos inyectados en window.APP_DB por el compilador
    let masterDatabase = window.APP_DB.products;
    let masterSchemaMap = window.APP_DB.schemas;
    let config = window.APP_DB.config || {};
    let activeSchemas = new Set(Object.keys(masterSchemaMap)); // En modo Drive, todo lo incluido es activo
    let attrCodeToDescMap = {};

    // --- DOM CACHE ---
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
        smartFilterToggle: document.getElementById('smart-filter-toggle'),
        smartFilterPanel: document.getElementById('smart-filter-panel'),
        smartFilterContainer: document.getElementById('smart-filters-container'),
        schemaFilterSelect: document.getElementById('schema-filter-select'),
        activeFiltersBar: document.getElementById('active-filters-bar'),
        filterOverlay: document.getElementById('filter-overlay'),
        settingsMenuToggle: document.getElementById('settings-menu-toggle'),
        settingsMenuPanel: document.getElementById('settings-menu-panel'),
        readmeModal: document.getElementById('readme-modal'),
        readmeContent: document.getElementById('readme-content'),
        readmeCloseButton: document.getElementById('readme-close-btn'),
        infoToggleButton: document.getElementById('info-toggle-btn'),
        paletteToggleButton: document.getElementById('palette-toggle-btn'),
        libraryMenuToggle: document.getElementById('library-menu-toggle')
    };

    // Variables de estado UI
    let isLightMode = false;
    const darkPaletteHSL = { accent: { h: 188, s: 96, l: 41 }, dark: { h: 210, s: 29, l: 8 }, medium: { h: 210, s: 19, l: 11 }, border: { h: 210, s: 16, l: 15 }, textP: { h: 210, s: 29, l: 92 }, textS: { h: 210, s: 12, l: 67 } };
    const lightPaletteHSL = { accent: { h: 188, s: 86, l: 40 }, dark: { h: 210, s: 20, l: 98 }, medium: { h: 210, s: 19, l: 94 }, border: { h: 210, s: 16, l: 85 }, textP: { h: 210, s: 29, l: 10 }, textS: { h: 210, s: 12, l: 40 } };

    // --- INICIALIZACIÓN ---
    function initialize() {
        // Ordenar DB
        masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
        
        buildAttributeCache();
        populateSchemaSelector();
        populateSmartFilters('all');
        renderSearchResults(masterDatabase, dom.modelSearchResults);
        
        setupEventListeners();
        
        // Aplicar Tema Random al inicio
        updatePaletteCSS(darkPaletteHSL, Math.floor(Math.random() * 360));
    }

    function setupEventListeners() {
        dom.modelSearchInput.addEventListener('input', (e) => { handleSearchInputUI(e.target); applyFiltersAndSearch(); });
        dom.searchClearBtn.addEventListener('click', () => { dom.modelSearchInput.value = ''; handleSearchInputUI(dom.modelSearchInput); applyFiltersAndSearch(); dom.modelSearchInput.focus(); });
        
        dom.schemaFilterSelect.addEventListener('change', () => { populateSmartFilters(dom.schemaFilterSelect.value); applyFiltersAndSearch(); });
        dom.smartFilterContainer.addEventListener('change', applyFiltersAndSearch);
        
        // Delegación de eventos para filtros
        dom.smartFilterContainer.addEventListener('click', (e) => { 
            const title = e.target.closest('.filter-group-title');
            if(title) toggleFilterGroup(title);
        });
        
        if(dom.activeFiltersBar) {
            dom.activeFiltersBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.chip-remove-btn');
                if(btn) {
                    const action = btn.dataset.action;
                    action === 'remove-schema' ? removeSchemaFilter() : removeActiveFilter(btn.dataset.attrCode);
                }
            });
        }

        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.smartFilterToggle.addEventListener('click', toggleFilterPanel);
        dom.settingsMenuToggle.addEventListener('click', toggleSettingsMenu);
        dom.filterOverlay.addEventListener('click', closeAllOverlays);
        
        dom.readmeCloseButton.addEventListener('click', closeReadmeModal);
        document.getElementById('expand-all-btn').addEventListener('click', expandAllSpecs);
        document.getElementById('collapse-all-btn').addEventListener('click', collapseAllSpecs);
        
        dom.paletteToggleButton.addEventListener('click', handleThemeToggle);
        dom.infoToggleButton.addEventListener('click', showReadmeInfo);
        
        if(dom.libraryMenuToggle) {
            dom.libraryMenuToggle.addEventListener('click', () => alert("Modo Lectura: La biblioteca es estática en esta versión."));
        }
    }

    // --- LOGICA DE NEGOCIO ---
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
            dom.smartFilterContainer.innerHTML = '<p style="padding:1rem; color:var(--color-text-dim); text-align:center; font-size:0.8rem;">Selecciona una gama para ver filtros.</p>';
            return;
        }
        
        const products = masterDatabase.filter(p => p.schema_key === schemaKey);
        const schema = masterSchemaMap[schemaKey];
        
        schema.forEach(group => {
            let hasFilters = false;
            const wrapper = document.createElement('div');
            wrapper.className = 'filter-group-wrapper';
            wrapper.innerHTML = '<div class="filter-group-title"><button class="filter-toggle-btn gray"></button>'+group.group+'</div>';
            
            const rows = document.createElement('div');
            rows.className = 'filter-rows-container collapsed';
            
            group.attrs.forEach(attr => {
                const values = [...new Set(products.map(p => p.attributes[attr.code]).filter(v => v))].sort();
                if(values.length > 0) {
                    hasFilters = true;
                    const row = document.createElement('div');
                    row.className = 'filter-row';
                    row.innerHTML = '<label>'+attr.desc+'</label>';
                    
                    const select = document.createElement('select');
                    select.className = 'futuristic-select';
                    select.dataset.attribute = attr.code;
                    select.innerHTML = '<option value="">---</option>' + values.map(v => '<option value="'+v+'">'+v+'</option>').join('');
                    
                    row.appendChild(select);
                    rows.appendChild(row);
                }
            });
            
            if(hasFilters) {
                wrapper.appendChild(rows);
                dom.smartFilterContainer.appendChild(wrapper);
            }
        });
    }

    function applyFiltersAndSearch() {
        const q = dom.modelSearchInput.value.toLowerCase().trim();
        const schema = dom.schemaFilterSelect.value;
        const filters = {};
        
        dom.smartFilterContainer.querySelectorAll('select').forEach(s => {
            if(s.value) filters[s.dataset.attribute] = s.value;
        });

        const filtered = masterDatabase.filter(p => {
            if(schema !== 'all' && p.schema_key !== schema) return false;
            if(q && !p.model.toLowerCase().includes(q)) return false;
            for(let key in filters) {
                if(p.attributes[key] !== filters[key]) return false;
            }
            return true;
        });

        renderSearchResults(filtered);
        renderActiveFilters(filters, schema);
    }

    function renderSearchResults(list) {
        dom.modelSearchResults.innerHTML = '';
        dom.modelListHeader.textContent = 'Modelos ('+list.length+')';
        
        if(list.length === 0) {
            dom.modelSearchResults.innerHTML = '<div class="list-item" style="cursor:default">Sin resultados</div>';
            return;
        }
        
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
        dom.activeFiltersBar.className = (schema === 'all' && Object.keys(filters).length === 0) ? 'active-filters-bar-hidden' : 'active-filters-bar-visible';
        
        if(schema !== 'all') {
            const div = document.createElement('div');
            div.className = 'active-filter-chip schema-chip';
            div.innerHTML = '<span class="chip-label">Gama: <b>'+schema.toUpperCase()+'</b></span><button class="chip-remove-btn" data-action="remove-schema">×</button>';
            dom.activeFiltersBar.appendChild(div);
        }
        
        Object.entries(filters).forEach(([code, val]) => {
            const div = document.createElement('div');
            div.className = 'active-filter-chip';
            div.innerHTML = '<span class="chip-label">'+(attrCodeToDescMap[code]||code)+': <b>'+val+'</b></span><button class="chip-remove-btn" data-attr-code="'+code+'">×</button>';
            dom.activeFiltersBar.appendChild(div);
        });
    }

    function handleResultClick(e) {
        const item = e.target.closest('.list-item');
        if(!item) return;
        
        document.querySelectorAll('.list-item.active').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const product = masterDatabase.find(p => p.model === item.dataset.model);
        if(product) {
            displayProduct(product);
            expandAllSpecs();
            if(window.innerWidth < 768) {
                dom.body.classList.add('model-is-selected');
                showSelectedModelChip(product.model);
            }
        }
        closeAllOverlays();
    }

    function displayProduct(p) {
        dom.productPlaceholder.style.display = 'none';
        dom.specControls.className = 'spec-controls-visible';
        dom.productTitle.textContent = p.model;
        dom.productSpecsContainer.innerHTML = '';
        
        const schema = masterSchemaMap[p.schema_key];
        if(!schema) return;
        
        schema.forEach(group => {
            const details = document.createElement('details');
            details.className = 'spec-group';
            const summary = document.createElement('summary');
            summary.textContent = group.group;
            details.appendChild(summary);
            
            const content = document.createElement('div');
            content.className = 'spec-group-content';
            let hasData = false;
            
            group.attrs.forEach(attr => {
                const val = p.attributes[attr.code];
                if(val && val !== 'unknown') {
                    hasData = true;
                    const row = document.createElement('div');
                    row.className = 'spec-row';
                    row.innerHTML = '<span class="attr-desc">'+attr.desc+'</span><span class="attr-value">'+val+'</span>';
                    content.appendChild(row);
                }
            });
            
            if(hasData) {
                details.appendChild(content);
                dom.productSpecsContainer.appendChild(details);
            }
        });
    }

    // --- UI HELPERS ---
    function handleSearchInputUI(input) {
        dom.searchClearBtn.style.display = input.value.length > 0 ? 'block' : 'none';
    }
    
    function showSelectedModelChip(name) {
        dom.selectedModelDisplay.innerHTML = '<button class="model-chip-button">Modelo: '+name+' <span onclick="clearSelection()">×</span></button>';
    }
    
    window.clearSelection = function() {
        dom.body.classList.remove('model-is-selected');
        dom.selectedModelDisplay.innerHTML = '';
        dom.productTitle.textContent = 'Selecciona un producto';
        dom.productSpecsContainer.innerHTML = '';
        dom.productPlaceholder.style.display = 'block';
        dom.specControls.className = 'spec-controls-hidden';
    };

    function toggleFilterGroup(title) {
        const rows = title.nextElementSibling;
        const btn = title.querySelector('.filter-toggle-btn');
        if(rows.classList.contains('collapsed')) {
            rows.className = 'filter-rows-container expanded';
            btn.className = 'filter-toggle-btn blue';
        } else {
            rows.className = 'filter-rows-container collapsed';
            btn.className = 'filter-toggle-btn gray';
        }
    }

    function togglePanel(panel) {
        const isOpen = panel.className.includes('open');
        closeAllOverlays();
        if(!isOpen) {
            panel.className = panel.className.replace('hidden', 'open');
            dom.filterOverlay.className = 'overlay-visible';
        }
    }

    function closeAllOverlays() {
        dom.smartFilterPanel.className = 'smart-filter-content-hidden';
        dom.settingsMenuPanel.className = 'settings-menu-panel-hidden';
        dom.filterOverlay.className = 'overlay-hidden';
        dom.readmeModal.className = 'modal-hidden';
    }

    function showReadmeInfo() {
        closeAllOverlays();
        dom.readmeContent.textContent = config.introText || "Pokedex Drive Offline";
        dom.readmeModal.className = 'modal-visible';
        dom.filterOverlay.className = 'overlay-visible';
    }
    
    function closeReadmeModal() { dom.readmeModal.className = 'modal-hidden'; dom.filterOverlay.className = 'overlay-hidden'; }
    function expandAllSpecs() { dom.productSpecsContainer.querySelectorAll('details').forEach(d => d.open = true); }
    function collapseAllSpecs() { dom.productSpecsContainer.querySelectorAll('details').forEach(d => d.open = false); }
    
    function removeSchemaFilter() { dom.schemaFilterSelect.value = 'all'; populateSmartFilters('all'); applyFiltersAndSearch(); }
    function removeActiveFilter(code) { 
        const sel = dom.smartFilterContainer.querySelector('select[data-attribute="'+code+'"]'); 
        if(sel) sel.value = ""; 
        applyFiltersAndSearch(); 
    }

    function handleThemeToggle(e) {
        e.stopPropagation();
        isLightMode = !isLightMode;
        const palette = isLightMode ? lightPaletteHSL : darkPaletteHSL;
        updatePaletteCSS(palette, Math.floor(Math.random()*360));
    }

    function updatePaletteCSS(p, hue) {
        const root = document.documentElement;
        const hsl = (h,s,l) => 'hsl('+h+','+s+'%,'+l+'%)';
        const rgb = (h,s,l) => {
            s/=100; l/=100;
            const k=n=>(n+h/30)%12; const a=s*Math.min(l,1-l); const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
            return Math.round(255*f(0))+','+Math.round(255*f(8))+','+Math.round(255*f(4));
        };
        const c = rgb(hue,p.accent.s,p.accent.l);
        const bgHue = (hue + 200) % 360; 
        
        root.style.setProperty('--color-cyan-accent', hsl(hue, p.accent.s, p.accent.l));
        root.style.setProperty('--color-cyan-glow', 'rgba('+c+',0.25)');
        root.style.setProperty('--color-bg-dark', hsl(bgHue, p.dark.s, p.dark.l));
        root.style.setProperty('--color-bg-medium', hsl(bgHue, p.medium.s, p.medium.l));
        root.style.setProperty('--color-border', hsl(bgHue, p.border.s, p.border.l));
        root.style.setProperty('--color-text-primary', hsl(bgHue, p.textP.s, p.textP.l));
        root.style.setProperty('--color-text-secondary', hsl(bgHue, p.textS.s, p.textS.l));
    }

    initialize();
});
`;

        // 4. CONSTRUCCIÓN HTML FINAL
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title || 'Pokedex Drive'}</title>
    <!-- Bootloader -->
    <script>
        window.APP_DB = {
            products: ${safeProducts},
            schemas: ${safeSchemas},
            config: ${safeConfig}
        };
    <\/script>
    <style>${cssContent}</style>
</head>
<body>
    <!-- HEADER -->
    <div class="container">
        <header class="app-header">
            <div class="header-left">
                <h1 class="app-title">${config.title} 📟 <span class="app-version">${config.version}</span></h1>
                <div id="selected-model-display" class="model-chip-hidden"></div>
            </div>
            <div class="settings-menu-wrapper absolute-top-right">
                <button id="settings-menu-toggle" class="settings-button" title="Ajustes">⚙️</button>
                <div id="settings-menu-panel" class="settings-menu-panel-hidden">
                    <button id="library-menu-toggle" class="settings-menu-item">📚 Biblioteca</button>
                    <button id="palette-toggle-btn" class="settings-menu-item">🎨 Tema</button>
                    <button id="info-toggle-btn" class="settings-menu-item">ℹ️ Info</button>
                </div>
            </div>
            <div class="header-right-controls">
                <div id="smart-filter-system" class="smart-filter-wrapper-v2">
                    <button id="smart-filter-toggle" class="smart-filter-summary">Filtros</button>
                    <div id="smart-filter-panel" class="smart-filter-content-hidden">
                        <div class="filter-schema-selector"><label>Gama:</label><select id="schema-filter-select" class="futuristic-select"></select></div>
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

    <!-- JS OFFLINE ENGINE -->
    <script>${jsContent}<\/script>
</body>
</html>`;

        // GENERAR BLOB FINAL
        return new Blob([html], { type: 'text/html' });
    }
};