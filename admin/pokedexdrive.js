/**
 * Pokedex Drive Compiler Engine v5.1 (Fix Importación)
 * Genera una aplicación Single-File (HTML) con Biblioteca Virtual plenamente funcional.
 * Corrección: Escape de Regex para el parser CSV incrustado.
 */

const PokedexDrive = {

    compile: function(products, schemas, config) {
        
        // 1. SERIALIZACIÓN SEGURA DE DATOS
        const safeProducts = JSON.stringify(products).replace(/<\/script>/g, '<\\/script>');
        const safeSchemas = JSON.stringify(schemas).replace(/<\/script>/g, '<\\/script>');
        const safeConfig = JSON.stringify(config).replace(/<\/script>/g, '<\\/script>');

        // 2. CSS COMPLETO
        const cssContent = `
:root {
    --color-bg-dark: #0D1117; --color-bg-medium: #161B22;
    --color-border: #21262D; --color-border-light: #2a3038;
    --color-text-primary: #e2e8f0; --color-text-secondary: #9ca3af; --color-text-dim: #6b7280;
    --color-cyan-accent: #06b6d4; --color-cyan-glow: rgba(6, 182, 212, 0.25);
    --color-green-accent: #10b981; --color-red-accent: #f43f5e;
    --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
    --font-secondary: 'ui-monospace', 'SFMono-Regular', monospace;
}
body { background-color: var(--color-bg-dark); color: var(--color-text-secondary); font-family: var(--font-primary); line-height: 1.5; margin: 0; transition: background-color 0.3s; }
button, input, select, textarea { font-family: var(--font-primary); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-medium); }
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
.header-right-controls { display: flex; width: 100%; }

/* SETTINGS */
.settings-menu-wrapper { position: relative; }
.settings-menu-wrapper.absolute-top-right { position: absolute; top: 0; right: 0; z-index: 60; }
.settings-button { background-color: var(--color-bg-medium); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 1.2rem; line-height: 1; border-radius: 4px; cursor: pointer; padding: 0.4rem 0.6rem; height: 38px; width: 38px; }
.settings-menu-panel-hidden { display: none; }
.settings-menu-panel-open { display: block; position: absolute; top: 100%; right: 0; background: var(--color-bg-medium); border: 1px solid var(--color-border-light); z-index: 50; border-radius: 0.5rem; padding: 0.5rem; min-width: 160px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.settings-menu-item { display: block; width: 100%; text-align: left; padding: 0.6rem; background: transparent; border: none; color: var(--color-text-secondary); cursor: pointer; font-family: var(--font-primary); font-size: 0.85rem; font-weight: 600; border-radius: 4px; text-decoration: none; }
.settings-menu-item:hover { color: var(--color-cyan-accent); background: var(--color-bg-dark); }

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
.chip-remove-btn { background: none; border: none; color: var(--color-cyan-accent); font-weight: 700; cursor: pointer; padding: 0 0.25rem; min-width: 24px; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chip-remove-btn:hover { color: #fff; background-color: rgba(255,255,255,0.1); border-radius: 4px; }

/* TARJETAS & INPUTS */
.futuristic-card { background-color: var(--color-bg-medium); border: 1px solid var(--color-border); border-left: 3px solid var(--color-cyan-accent); border-radius: 0.5rem; padding: 1rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
.search-panel { display: flex; flex-direction: column; }
.futuristic-title { font-family: var(--font-secondary); font-size: 1.15rem; font-weight: 600; color: var(--color-text-primary); margin: 0; margin-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.4rem; }
.futuristic-subtitle { font-family: var(--font-secondary); font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 0.5rem 0; }
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
details.spec-group { border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
details.spec-group summary { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); font-family: var(--font-secondary); padding: 0.5rem 0.75rem; background: var(--color-border); display: flex; align-items: center; cursor: pointer; list-style: none; justify-content: space-between; }
details.spec-group summary::before { content: ''; width: 12px; height: 12px; border-radius: 3px; margin-right: 0.5rem; background-color: var(--color-text-dim); }
details[open].spec-group summary::before { background-color: var(--color-cyan-accent); }
.spec-group-content { padding: 0.75rem 1.25rem; background-color: var(--color-bg-dark); }
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

/* LIBRARY & UPLOAD */
.library-modal-content { max-width: 450px; }
.compact-body { padding: 0.75rem 1rem; }
.compact-header { padding: 0.5rem 1rem; }
.library-section { margin: 0; }
.lib-sec-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; }
.library-desc { font-family: var(--font-primary); font-size: 0.75rem; color: var(--color-text-dim); margin: 0; }
.library-list { display: flex; flex-direction: column; background-color: var(--color-bg-dark); border: 1px solid var(--color-border-light); border-radius: 4px; max-height: 250px; overflow-y: auto; }
.gama-toggle-item { display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.6rem; border-bottom: 1px dashed var(--color-border); transition: background-color 0.2s; }
.gama-toggle-item:hover { background-color: var(--color-border); }
.gama-toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; flex-grow: 1; overflow: hidden; }
.gama-checkbox { accent-color: var(--color-cyan-accent); width: 14px; height: 14px; cursor: pointer; }
.gama-name { font-weight: 600; font-family: var(--font-mono); color: var(--color-text-primary); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gama-actions-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.gama-status { font-size: 0.65rem; font-weight: bold; text-transform: uppercase; color: var(--color-text-dim); min-width: 40px; text-align: right; }
.gama-download-btn { background: none; border: 1px solid var(--color-border); color: var(--color-text-secondary); border-radius: 4px; padding: 0.1rem 0.4rem; font-size: 0.7rem; cursor: pointer; transition: all 0.2s; line-height: 1.2; }
.gama-download-btn:hover { border-color: var(--color-cyan-accent); color: var(--color-cyan-accent); background-color: rgba(6, 182, 212, 0.1); }
.upload-area { display: flex; align-items: center; gap: 0.5rem; background-color: var(--color-bg-dark); border: 1px solid var(--color-border); border-radius: 4px; padding: 0.5rem; }
.upload-label { font-size: 0.75rem; padding: 0.4rem 0.8rem; margin: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--color-bg-medium); border: 1px solid var(--color-border-light); color: var(--color-text-primary); border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: var(--font-primary); white-space: nowrap; }
.upload-label:hover { border-color: var(--color-cyan-accent); color: var(--color-cyan-accent); }
.upload-status { font-size: 0.7rem; color: var(--color-text-dim); font-family: var(--font-secondary); text-align: right; width: 100%; margin-top: 0.25rem;}
.futuristic-textarea-mini { background-color: var(--color-bg-medium); border: 1px solid var(--color-border-light); color: var(--color-text-primary); border-radius: 4px; padding: 0.4rem; font-family: var(--font-mono); font-size: 0.7rem; resize: none; overflow: hidden; flex-grow: 1; height: 32px; box-sizing: border-box; white-space: pre; }
.futuristic-textarea-mini:focus { outline: none; border-color: var(--color-cyan-accent); }

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

        // 3. LOGICA JS DEL VISOR (Corrección de Regex y eventos)
        const jsContent = `
document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO INICIAL ---
    let masterDatabase = window.APP_DB.products || [];
    let masterSchemaMap = window.APP_DB.schemas || {};
    let config = window.APP_DB.config || {};
    let activeSchemas = new Set(Object.keys(masterSchemaMap)); 
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
        libraryMenuToggle: document.getElementById('library-menu-toggle'),
        expandAllButton: document.getElementById('expand-all-btn'),
        collapseAllButton: document.getElementById('collapse-all-btn'),
        
        // Library DOM
        libraryModal: document.getElementById('library-modal'),
        libraryCloseBtn: document.getElementById('library-close-btn'),
        libraryGamaList: document.getElementById('library-gama-list'),
        csvUploadInput: document.getElementById('csv-upload-input'),
        csvTextInput: document.getElementById('csv-text-input'),
        csvTextBtn: document.getElementById('csv-text-btn'),
        uploadStatusText: document.getElementById('upload-status-text')
    };

    // Paletas
    let isLightMode = false;
    const darkPaletteHSL = { accent: { h: 188, s: 96, l: 41 }, dark: { h: 210, s: 29, l: 8 }, medium: { h: 210, s: 19, l: 11 }, border: { h: 210, s: 16, l: 15 }, textP: { h: 210, s: 29, l: 92 }, textS: { h: 210, s: 12, l: 67 } };
    const lightPaletteHSL = { accent: { h: 188, s: 86, l: 40 }, dark: { h: 210, s: 20, l: 98 }, medium: { h: 210, s: 19, l: 94 }, border: { h: 210, s: 16, l: 85 }, textP: { h: 210, s: 29, l: 10 }, textS: { h: 210, s: 12, l: 40 } };

    // --- INICIALIZACIÓN ---
    function initialize() {
        masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
        buildAttributeCache();
        populateSchemaSelector();
        populateSmartFilters('all');
        applyFiltersAndSearch(); 
        setupEventListeners();
        updatePaletteCSS(darkPaletteHSL, Math.floor(Math.random() * 360));
    }

    function setupEventListeners() {
        // Buscador
        dom.modelSearchInput.addEventListener('input', (e) => { handleSearchInputUI(e.target); applyFiltersAndSearch(); });
        dom.searchClearBtn.addEventListener('click', () => { dom.modelSearchInput.value = ''; handleSearchInputUI(dom.modelSearchInput); applyFiltersAndSearch(); dom.modelSearchInput.focus(); });
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        
        // Filtros
        dom.schemaFilterSelect.addEventListener('change', () => { populateSmartFilters(dom.schemaFilterSelect.value); applyFiltersAndSearch(); });
        dom.smartFilterContainer.addEventListener('change', applyFiltersAndSearch);
        dom.smartFilterContainer.addEventListener('click', (e) => { const t = e.target.closest('.filter-group-title'); if(t) toggleFilterGroup(t); });
        
        // Chips
        if(dom.activeFiltersBar) {
            dom.activeFiltersBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.chip-remove-btn');
                if(btn) {
                    const action = btn.dataset.action;
                    action === 'remove-schema' ? removeSchemaFilter() : removeActiveFilter(btn.dataset.attrCode);
                }
            });
        }

        // Menus & Modals
        dom.smartFilterToggle.addEventListener('click', () => togglePanel(dom.smartFilterPanel, dom.smartFilterToggle));
        dom.settingsMenuToggle.addEventListener('click', () => togglePanel(dom.settingsMenuPanel, dom.settingsMenuToggle));
        dom.filterOverlay.addEventListener('click', closeAllPanels);
        
        dom.expandAllButton.addEventListener('click', expandAllSpecs);
        dom.collapseAllButton.addEventListener('click', collapseAllSpecs);
        
        dom.infoToggleButton.addEventListener('click', showInfo);
        dom.readmeCloseButton.addEventListener('click', closeAllPanels);
        dom.paletteToggleButton.addEventListener('click', toggleTheme);
        
        // BIBLIOTECA
        if(dom.libraryMenuToggle) dom.libraryMenuToggle.addEventListener('click', openLibraryModal);
        if(dom.libraryCloseBtn) dom.libraryCloseBtn.addEventListener('click', closeAllPanels);
        
        if(dom.libraryGamaList) {
            dom.libraryGamaList.addEventListener('change', (e) => {
                if(e.target.matches('.gama-checkbox')) {
                    const key = e.target.dataset.key;
                    if(e.target.checked) activeSchemas.add(key); else activeSchemas.delete(key);
                    updateLibraryStatus(e.target);
                    populateSchemaSelector();
                    populateSmartFilters(dom.schemaFilterSelect.value);
                    applyFiltersAndSearch();
                }
            });
            dom.libraryGamaList.addEventListener('click', (e) => {
                if(e.target.matches('.gama-download-btn')) {
                    e.preventDefault();
                    exportGamaToCSV(e.target.dataset.key);
                }
            });
        }
        
        // Importación (Revisado)
        if(dom.csvTextBtn) dom.csvTextBtn.addEventListener('click', handleTextImport);
        if(dom.csvUploadInput) dom.csvUploadInput.addEventListener('change', handleCsvUpload);
    }

    // --- CORE LOGIC ---
    function buildAttributeCache() {
        attrCodeToDescMap = {};
        Object.values(masterSchemaMap).forEach(schema => schema.forEach(g => g.attrs.forEach(a => attrCodeToDescMap[a.code] = a.desc)));
    }

    function populateSchemaSelector() {
        const current = dom.schemaFilterSelect.value;
        dom.schemaFilterSelect.innerHTML = '<option value="all">Todas</option>';
        Object.keys(masterSchemaMap).filter(k => activeSchemas.has(k)).forEach(k => {
            const opt = document.createElement('option'); opt.value = k; opt.textContent = k.charAt(0).toUpperCase() + k.slice(1);
            dom.schemaFilterSelect.appendChild(opt);
        });
        if(activeSchemas.has(current)) dom.schemaFilterSelect.value = current; else dom.schemaFilterSelect.value = 'all';
    }

    function populateSmartFilters(schemaKey) {
        dom.smartFilterContainer.innerHTML = '';
        if(schemaKey === 'all') {
            dom.smartFilterContainer.innerHTML = '<p style="padding:1rem;color:var(--color-text-dim);font-size:0.8rem;text-align:center">Selecciona una gama para ver filtros.</p>';
            return;
        }
        const products = masterDatabase.filter(p => p.schema_key === schemaKey);
        const schema = masterSchemaMap[schemaKey];
        if(!schema) return;

        schema.forEach(group => {
            let hasFilters = false;
            const wrapper = document.createElement('div'); wrapper.className = 'filter-group-wrapper';
            wrapper.innerHTML = '<div class="filter-group-title"><button class="filter-toggle-btn gray"></button>'+group.group+'</div>';
            const rows = document.createElement('div'); rows.className = 'filter-rows-container collapsed';
            
            group.attrs.forEach(attr => {
                const values = [...new Set(products.map(p => p.attributes[attr.code]).filter(v => v))].sort();
                if(values.length > 0) {
                    hasFilters = true;
                    const row = document.createElement('div'); row.className = 'filter-row';
                    row.innerHTML = '<label>'+attr.desc+'</label>';
                    const select = document.createElement('select'); select.className = 'futuristic-select';
                    select.dataset.attribute = attr.code;
                    select.innerHTML = '<option value="">---</option>' + values.map(v => '<option value="'+v+'">'+v+'</option>').join('');
                    row.appendChild(select); rows.appendChild(row);
                }
            });
            if(hasFilters) { wrapper.appendChild(rows); dom.smartFilterContainer.appendChild(wrapper); }
        });
    }

    function applyFiltersAndSearch() {
        const q = dom.modelSearchInput.value.toLowerCase().trim();
        const schema = dom.schemaFilterSelect.value;
        const filters = {};
        dom.smartFilterContainer.querySelectorAll('select').forEach(s => { if(s.value) filters[s.dataset.attribute] = s.value; });

        const filtered = masterDatabase.filter(p => {
            if(!activeSchemas.has(p.schema_key)) return false;
            if(schema !== 'all' && p.schema_key !== schema) return false;
            if(q && !p.model.toLowerCase().includes(q)) return false;
            for(let key in filters) { if(p.attributes[key] !== filters[key]) return false; }
            return true;
        });

        renderSearchResults(filtered);
        renderActiveFilters(filters, schema);
        dom.searchClearBtn.style.display = q ? 'block' : 'none';
    }

    function renderSearchResults(list) {
        dom.modelSearchResults.innerHTML = '';
        dom.modelListHeader.textContent = 'Modelos ('+list.length+')';
        if(list.length === 0) { dom.modelSearchResults.innerHTML = '<div class="list-item" style="cursor:default">Sin resultados</div>'; return; }
        const frag = document.createDocumentFragment();
        list.forEach(p => {
            const div = document.createElement('div'); div.className = 'list-item'; div.textContent = p.model; div.dataset.model = p.model;
            frag.appendChild(div);
        });
        dom.modelSearchResults.appendChild(frag);
    }

    function renderActiveFilters(filters, schema) {
        dom.activeFiltersBar.innerHTML = '';
        if(schema === 'all' && Object.keys(filters).length === 0) { dom.activeFiltersBar.className = 'active-filters-bar-hidden'; return; }
        dom.activeFiltersBar.className = 'active-filters-bar-visible';
        
        if(schema !== 'all') {
            const div = document.createElement('div'); div.className = 'active-filter-chip schema-chip';
            div.innerHTML = '<span class="chip-label">Gama: <b>'+schema.toUpperCase()+'</b></span><button class="chip-remove-btn" data-action="remove-schema">×</button>';
            dom.activeFiltersBar.appendChild(div);
        }
        Object.entries(filters).forEach(([code, val]) => {
            const div = document.createElement('div'); div.className = 'active-filter-chip';
            div.innerHTML = '<span class="chip-label">'+(attrCodeToDescMap[code]||code)+': <b>'+val+'</b></span><button class="chip-remove-btn" data-attr-code="'+code+'">×</button>';
            dom.activeFiltersBar.appendChild(div);
        });
    }

    function handleResultClick(e) {
        const item = e.target.closest('.list-item'); if(!item) return;
        document.querySelectorAll('.list-item.active').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const product = masterDatabase.find(p => p.model === item.dataset.model);
        if(product) {
            displayProduct(product);
            expandAllSpecs();
            if(window.innerWidth < 768) { dom.body.classList.add('model-is-selected'); showSelectedModelChip(product.model); }
        }
        closeAllPanels();
    }

    function displayProduct(p) {
        dom.productPlaceholder.style.display = 'none';
        dom.specControls.className = 'spec-controls-visible';
        dom.productTitle.textContent = p.model;
        dom.productSpecsContainer.innerHTML = '';
        dom.selectedModelDisplay.innerHTML = '<button class="model-chip-button">Modelo: '+p.model+' <span onclick="clearSelection()">×</span></button>';
        
        const schema = masterSchemaMap[p.schema_key];
        if(!schema) return;
        schema.forEach(group => {
            const details = document.createElement('details'); details.className = 'spec-group'; details.open = true;
            const summary = document.createElement('summary'); summary.textContent = group.group; details.appendChild(summary);
            const content = document.createElement('div'); content.className = 'spec-group-content';
            let hasData = false;
            group.attrs.forEach(attr => {
                const val = p.attributes[attr.code];
                if(val && val !== 'unknown') {
                    hasData = true;
                    const row = document.createElement('div'); row.className = 'spec-row';
                    row.innerHTML = '<span class="attr-desc">'+attr.desc+'</span><span class="attr-value">'+val+'</span>';
                    content.appendChild(row);
                }
            });
            if(hasData) { details.appendChild(content); dom.productSpecsContainer.appendChild(details); }
        });
    }

    // --- BIBLIOTECA VIRTUAL ---
    function openLibraryModal() {
        closeAllPanels();
        dom.libraryGamaList.innerHTML = '';
        Object.keys(masterSchemaMap).forEach(key => {
            const isActive = activeSchemas.has(key);
            const div = document.createElement('div'); div.className = 'gama-toggle-item';
            div.innerHTML = '<label class="gama-toggle-label"><input type="checkbox" class="gama-checkbox" data-key="'+key+'" '+(isActive?'checked':'')+'><span class="gama-name">'+key.toUpperCase()+'</span></label><div class="gama-actions-right"><button class="gama-download-btn" data-key="'+key+'">⬇</button><span class="gama-status" style="color:'+(isActive?'var(--color-cyan-accent)':'var(--color-text-dim)')+'">'+(isActive?'ACTIVA':'OCULTA')+'</span></div>';
            dom.libraryGamaList.appendChild(div);
        });
        dom.libraryModal.className = 'modal-visible';
        dom.filterOverlay.className = 'overlay-visible';
    }

    function updateLibraryStatus(checkbox) {
        const item = checkbox.closest('.gama-toggle-item');
        const statusSpan = item.querySelector('.gama-status');
        const isChecked = checkbox.checked;
        statusSpan.textContent = isChecked ? 'ACTIVA' : 'OCULTA';
        statusSpan.style.color = isChecked ? 'var(--color-cyan-accent)' : 'var(--color-text-dim)';
    }

    // --- CSV PARSER (Escape Fix) ---
    function parseCSVLine(text) {
        const result = []; let current = ''; let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i]; const nextChar = text[i + 1];
            if (inQuotes) { if (char === '"' && nextChar === '"') { current += '"'; i++; } else if (char === '"') { inQuotes = false; } else { current += char; } } 
            else { if (char === ';') { result.push(current); current = ''; } else if (char === '"') { inQuotes = true; } else { current += char; } }
        }
        result.push(current); return result;
    }

    function parseAndImportCsv(csvText) {
        let cleanText = csvText; if (cleanText.charCodeAt(0) === 0xFEFF) cleanText = cleanText.slice(1);
        const lines = cleanText.split(/\\r?\\n/).filter(l => l.trim() !== ''); // FIX REGEX
        if (lines.length < 4) throw new Error("CSV muy corto");
        const rowGroups = parseCSVLine(lines[0]); const schemaKey = rowGroups[0].toLowerCase().trim();
        if (!schemaKey) throw new Error("Falta clave gama (A1)");
        const rowCodes = parseCSVLine(lines[1]); const rowDescs = parseCSVLine(lines[2]);
        const startIndex = 2; const tempSchema = {}; const groupOrder = [];
        for (let i = startIndex; i < rowCodes.length; i++) {
            const groupName = rowGroups[i] || "Otros"; const code = rowCodes[i]; const desc = rowDescs[i] || code;
            if (code) { if (!tempSchema[groupName]) { tempSchema[groupName] = []; groupOrder.push(groupName); } tempSchema[groupName].push({ code, desc }); }
        }
        const newSchemaGroup = groupOrder.map(gName => ({ group: gName, attrs: tempSchema[gName] }));
        masterSchemaMap[schemaKey] = newSchemaGroup; activeSchemas.add(schemaKey);
        let count = 0;
        for (let i = 3; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]); const modelId = cols[1]; if (!modelId) continue;
            const attributes = {}; for (let j = startIndex; j < rowCodes.length; j++) { const code = rowCodes[j]; if (code && cols[j]) attributes[code] = cols[j]; }
            const existingIdx = masterDatabase.findIndex(p => p.model === modelId);
            const newProd = { model: modelId, schema_key: schemaKey, attributes: attributes };
            if (existingIdx >= 0) masterDatabase[existingIdx] = newProd; else masterDatabase.push(newProd);
            count++;
        }
        buildAttributeCache();
        populateSchemaSelector();
        populateSmartFilters(dom.schemaFilterSelect.value);
        applyFiltersAndSearch();
        openLibraryModal(); 
        return count;
    }

    function handleTextImport() {
        const text = dom.csvTextInput.value.trim(); if(!text) return;
        try { const c = parseAndImportCsv(text); alert("Importados: " + c); dom.csvTextInput.value=''; } catch(e) { alert("Error: "+e.message); }
    }
    
    function handleCsvUpload(e) {
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = ev => { try { parseAndImportCsv(ev.target.result); dom.uploadStatusText.textContent = "¡Éxito!"; dom.uploadStatusText.style.color = "var(--color-cyan-accent)"; } catch(err) { alert(err.message); } };
        reader.readAsText(file, 'UTF-8'); e.target.value='';
    }

    function exportGamaToCSV(selectedSchema) {
        const products = masterDatabase.filter(p => p.schema_key === selectedSchema);
        if (products.length === 0) return alert("Gama vacía.");
        const schemaDef = masterSchemaMap[selectedSchema];
        let row1 = [selectedSchema, "Identificación"]; let row2 = ["", "model"]; let row3 = ["", "Modelo"]; let attrKeys = [];
        schemaDef.forEach(group => { group.attrs.forEach(attr => { row1.push(group.group); row2.push(attr.code); row3.push(attr.desc); attrKeys.push(attr.code); }); });
        const sanitize = v => { if (v===null||v===undefined) return ""; v=String(v).replace(/"/g, '""'); if(v.search(/("|\;|:|\n|\r)/g)>=0) v='"'+v+'"'; return v; };
        const data = products.map(p => { let r = ["", sanitize(p.model)]; attrKeys.forEach(k => r.push(sanitize(p.attributes[k]||""))); return r.join(";"); });
        const csv = "\\uFEFF" + row1.map(sanitize).join(";") + "\\n" + row2.map(sanitize).join(";") + "\\n" + row3.map(sanitize).join(";") + "\\n" + data.join("\\n");
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = 'GAMA_'+selectedSchema.toUpperCase()+'.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

    // --- HELPER UI ---
    window.clearSelection = function() {
        dom.body.classList.remove('model-is-selected');
        dom.selectedModelDisplay.innerHTML = '';
        dom.productTitle.textContent = 'Selecciona un producto';
        dom.productSpecsContainer.innerHTML = '';
        dom.productPlaceholder.style.display = 'block';
        dom.specControls.className = 'spec-controls-hidden';
    };

    function togglePanel(panel, btn) {
        const isOpen = panel.className.includes('open');
        closeAllPanels();
        if(!isOpen) {
            panel.className = panel.className.replace('hidden', 'open');
            dom.filterOverlay.className = 'overlay-visible';
            if(btn) btn.classList.add('active');
        }
    }

    function closeAllPanels() {
        dom.smartFilterPanel.className = 'smart-filter-content-hidden';
        dom.settingsMenuPanel.className = 'settings-menu-panel-hidden';
        dom.filterOverlay.className = 'overlay-hidden';
        dom.readmeModal.className = 'modal-hidden';
        dom.libraryModal.className = 'modal-hidden';
        if(dom.smartFilterToggle) dom.smartFilterToggle.classList.remove('active');
        if(dom.settingsMenuToggle) dom.settingsMenuToggle.classList.remove('active');
    }

    function toggleFilterGroup(title) {
        const rows = title.nextElementSibling;
        const btn = title.querySelector('.filter-toggle-btn');
        if(rows.classList.contains('collapsed')) { rows.className = 'filter-rows-container expanded'; btn.className = 'filter-toggle-btn blue'; }
        else { rows.className = 'filter-rows-container collapsed'; btn.className = 'filter-toggle-btn gray'; }
    }

    function expandAllSpecs() { dom.productSpecsContainer.querySelectorAll('details').forEach(d => d.open = true); }
    function collapseAllSpecs() { dom.productSpecsContainer.querySelectorAll('details').forEach(d => d.open = false); }
    function removeSchemaFilter() { dom.schemaFilterSelect.value = 'all'; populateSmartFilters('all'); applyFiltersAndSearch(); }
    function removeActiveFilter(code) { const sel = dom.smartFilterContainer.querySelector('select[data-attribute="'+code+'"]'); if(sel) sel.value = ""; applyFiltersAndSearch(); }
    function showInfo() { closeAllPanels(); dom.readmeContent.textContent = config.introText || "Pokedex Drive Offline"; dom.readmeModal.className = 'modal-visible'; dom.filterOverlay.className = 'overlay-visible'; }
    function handleSearchInputUI(input) { dom.searchClearBtn.style.display = input.value.length > 0 ? 'block' : 'none'; }
    function toggleTheme() { isLightMode = !isLightMode; updatePaletteCSS(isLightMode ? lightPaletteHSL : darkPaletteHSL, Math.floor(Math.random()*360)); }
    function handleDualFontToggle() { /* Simplificado para offline */ }
    
    function updatePaletteCSS(p, hue) {
        const root = document.documentElement;
        const hsl = (h,s,l) => 'hsl('+h+','+s+'%,'+l+'%)';
        const rgb = (h,s,l) => { s/=100; l/=100; const k=n=>(n+h/30)%12; const a=s*Math.min(l,1-l); const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))); return Math.round(255*f(0))+','+Math.round(255*f(8))+','+Math.round(255*f(4)); };
        const c = rgb(hue,p.accent.s,p.accent.l); const bgHue = (hue + 200) % 360;
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

        // 4. ESTRUCTURA HTML FINAL
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
    <div class="container">
        <!-- HEADER -->
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

    <!-- LIBRARY MODAL (INTEGRAL) -->
    <div id="library-modal" class="modal-hidden">
        <div class="modal-content library-modal-content">
            <div class="modal-header compact-header">
                <h2 class="spec-title" style="margin:0; font-size: 1.1rem;">Biblioteca Virtual</h2>
                <button id="library-close-btn" class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body compact-body">
                <div class="library-section">
                    <div class="lib-sec-header">
                        <h3 class="futuristic-subtitle" style="margin:0;">Gamas Cargadas</h3>
                    </div>
                    <div id="library-gama-list" class="library-list"></div>
                </div>
                <div class="library-section" style="border-top: 1px dashed var(--color-border); padding-top: 1rem;">
                    <h3 class="futuristic-subtitle" style="margin-bottom: 0.5rem;">Importar Datos</h3>
                    <div class="upload-area">
                        <label for="csv-upload-input" class="upload-label" title="Cargar archivo .csv">📂 Archivo</label>
                        <input type="file" id="csv-upload-input" accept=".csv" style="display: none;">
                        <textarea id="csv-text-input" class="futuristic-textarea-mini" placeholder="Pegar CSV..." rows="1"></textarea>
                        <button id="csv-text-btn" class="upload-label">📥 TXT</button>
                    </div>
                    <div id="upload-status-text" class="upload-status">Formato Admin (;)</div>
                </div>
            </div>
        </div>
    </div>

    <!-- JS ENGINE -->
    <script>${jsContent}<\/script>
</body>
</html>`;

        // GENERAR BLOB
        return new Blob([html], { type: 'text/html' });
    }
};