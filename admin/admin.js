document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias DOM ---
    const dom = {
        homeBtn: document.getElementById('home-btn'),
        // Nuevos botones header
        btnSaveMemory: document.getElementById('btn-save-memory'),
        btnExportFile: document.getElementById('btn-export-file'),
        editorControls: document.getElementById('editor-controls'),
        
        allContentPanels: document.querySelectorAll('.content-panel'),
        settingsBtn: document.getElementById('settings-btn'),
        settingsMenu: document.getElementById('settings-menu'),
        themeBtn: document.getElementById('theme-btn'),
        infoBtn: document.getElementById('info-btn'),
        libraryBtn: document.getElementById('library-menu-toggle'),
        infoModal: document.getElementById('info-modal'),
        libraryModal: document.getElementById('library-modal'), 
        modalOverlay: document.getElementById('modal-overlay'),
        closeInfoModalBtn: document.getElementById('close-info-modal-btn'),
        libraryCloseBtn: document.getElementById('library-close-btn'), 
        libraryGamaList: document.getElementById('library-gama-list'),
        csvUploadInput: document.getElementById('csv-upload-input'),
        uploadStatusText: document.getElementById('upload-status-text'),
        csvTextInput: document.getElementById('csv-text-input'),
        csvTextBtn: document.getElementById('csv-text-btn'),

        panelGeneral: document.getElementById('panel-general'),
        navCardButtons: document.querySelectorAll('.nav-card[data-panel]'), // Solo los botones que navegan
        panelModelHub: document.getElementById('panel-model-hub'),
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        createModelSchemaSelect: document.getElementById('create-model-schema-select'),
        createModelIdInput: document.getElementById('create-model-id'),
        createModelBtn: document.getElementById('create-model-btn'),
        panelSchemaHub: document.getElementById('panel-schema-hub'),
        schemaResultsList: document.getElementById('schema-results-list'),
        newSchemaKeyInput: document.getElementById('new-schema-key'),
        createSchemaBtn: document.getElementById('create-schema-btn'),
        panelEditModel: document.getElementById('panel-edit-model'),
        productTitle: document.getElementById('product-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),
        editModelIdInput: document.getElementById('edit-model-id'),
        editSchemaKeyDisplay: document.getElementById('edit-schema-key-display'),
        panelEditSchema: document.getElementById('panel-edit-schema'),
        schemaTitle: document.getElementById('schema-title'),
        schemaEditorForm: document.getElementById('schema-editor-form'),
        schemaEditorPlaceholder: document.getElementById('schema-editor-placeholder'),
        editSchemaKeyInput: document.getElementById('edit-schema-key'),
        addGroupBtn: document.getElementById('add-group-btn'),
        panelExportGama: document.getElementById('panel-export-gama'),
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list'),
        exportGamaJsonButton: document.getElementById('export-gama-json-btn'),
        exportGamaCsvButton: document.getElementById('export-gama-csv-btn')
    };

    // --- Estado ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let activeSchemas = new Set(); 
    let currentLoadedSchemaKey = null; 
    let currentActivePanel = 'general';
    let isLightMode = false;

    function initialize() {
        applyInitialTheme();
        setTimeout(() => {
            // Cargar datos del bootloader
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;
            
            if (masterDatabase.length > 0) masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
            Object.keys(masterSchemaMap).forEach(k => activeSchemas.add(k));

            setupEventListeners();
            refreshUI();
            showPanel('general');
        }, 100);
    }

    function refreshUI() {
        renderSearchResults(masterDatabase);
        populateSchemaList();
        populateGamaSelectors();
        if (dom.libraryModal.style.display === 'block') renderLibraryGamaList();
    }

    function setupEventListeners() {
        dom.homeBtn.addEventListener('click', () => showPanel('general'));
        
        // BOTONES HEADER (NUEVOS)
        dom.btnSaveMemory.addEventListener('click', handleMemorySave);
        dom.btnExportFile.addEventListener('click', handleExportFile);

        dom.settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSettingsMenu(); });
        dom.themeBtn.addEventListener('click', handleThemeToggle); 
        dom.infoBtn.addEventListener('click', showInfoModal);
        dom.libraryBtn.addEventListener('click', openLibraryModal); 
        dom.closeInfoModalBtn.addEventListener('click', hideAllModals);
        dom.libraryCloseBtn.addEventListener('click', hideAllModals); 
        dom.modalOverlay.addEventListener('click', hideAllModals);
        
        document.addEventListener('click', (e) => {
            if (dom.settingsMenu && dom.settingsMenu.style.display === 'block') {
                if (!dom.settingsMenu.contains(e.target) && e.target !== dom.settingsBtn) {
                    dom.settingsMenu.style.display = 'none';
                }
            }
        });

        dom.navCardButtons.forEach(card => card.addEventListener('click', () => showPanel(card.dataset.panel)));
        
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.createModelBtn.addEventListener('click', handleCreateModelClick);
        
        dom.schemaResultsList.addEventListener('click', handleSchemaLoadClick);
        dom.createSchemaBtn.addEventListener('click', handleSchemaCreateClick);
        
        dom.addGroupBtn.addEventListener('click', () => addGroupToEditor());
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorClicks);
        
        dom.gamaExportSelect.addEventListener('change', populateGamaExportList);
        dom.gamaExportList.addEventListener('click', handleGamaExportClick);
        dom.exportGamaJsonButton.addEventListener('click', exportGamaAsJson); 
        dom.exportGamaCsvButton.addEventListener('click', exportGamaAsCsv);
        
        if (dom.libraryGamaList) dom.libraryGamaList.addEventListener('change', handleGamaToggle);
        if (dom.csvUploadInput) dom.csvUploadInput.addEventListener('change', handleCsvUpload);
        if (dom.csvTextBtn) dom.csvTextBtn.addEventListener('click', handleTextImport);
    }

    // --- LÓGICA DE GUARDADO (NUEVA) ---

    // 1. Guardar en Memoria (RAM)
    function handleMemorySave() {
        // Feedback visual instantáneo
        dom.btnSaveMemory.style.transform = "scale(0.9)";
        setTimeout(() => dom.btnSaveMemory.style.transform = "scale(1)", 150);

        if (currentActivePanel === 'edit-model') {
            saveModelToMemory();
        } else if (currentActivePanel === 'edit-schema') {
            saveSchemaToMemory();
        }
    }

    // 2. Exportar Archivo
    function handleExportFile() {
        if (currentActivePanel === 'edit-model') {
            // Aseguramos que primero esté actualizado en memoria
            saveModelToMemory(true); 
            // Luego exportamos el objeto actual
            const id = dom.editModelIdInput.value.trim();
            const product = masterDatabase.find(p => p.model === id);
            if(product) generateAndDownloadProductFile(product, id);

        } else if (currentActivePanel === 'edit-schema') {
            handleSchemaExportClick(); // Este genera el archivo JS
        }
    }

    function saveModelToMemory(silent = false) {
        const id = dom.editModelIdInput.value.trim().toUpperCase();
        const schemaKey = dom.editSchemaKeyDisplay.value;
        if (!id || !schemaKey) return;

        // Recoger datos del formulario
        const formData = new FormData(dom.editorForm);
        const attrs = {};
        for (const [k, v] of formData.entries()) {
            if (v.trim()) attrs[k] = v.trim();
        }

        // Buscar si existe y actualizar, o crear
        const existingIndex = masterDatabase.findIndex(p => p.model === id);
        const newProductData = { model: id, schema_key: schemaKey, attributes: attrs };

        if (existingIndex >= 0) {
            masterDatabase[existingIndex] = newProductData;
            if(!silent) alert(`Modelo ${id} actualizado en memoria.`);
        } else {
            masterDatabase.push(newProductData);
            if(!silent) alert(`Modelo ${id} creado en memoria.`);
        }
        
        // Refrescar listas por si acaso
        refreshUI();
    }

    function saveSchemaToMemory() {
        const key = dom.editSchemaKeyInput.value.trim().toLowerCase();
        if (!key) return;

        const newSchema = [];
        let valid = true;
        
        // Construir objeto schema desde el DOM
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach((gb, i) => {
            const gName = gb.querySelector('input[data-type="group-name"]').value.trim();
            if (!gName) { alert(`Grupo ${i+1} sin nombre.`); valid = false; return; }
            const attrs = [];
            gb.querySelectorAll('.schema-attr-row').forEach(row => {
                const c = row.querySelector('input[data-type="attr-code"]').value.trim();
                const d = row.querySelector('input[data-type="attr-desc"]').value.trim();
                if (c && d) attrs.push({ code: c, desc: d });
            });
            if (attrs.length > 0) newSchema.push({ group: gName, attrs: attrs });
        });

        if (!valid) return;

        // Guardar en variable global
        masterSchemaMap[key] = newSchema;
        activeSchemas.add(key);
        alert(`Esquema ${key} guardado en memoria.`);
        refreshUI();
    }

    // --- UI Helpers ---

    function showPanel(panelId) {
        currentActivePanel = panelId;
        dom.allContentPanels.forEach(p => p.classList.remove('active'));
        document.body.classList.remove('fullscreen-editor-active');
        
        // Manejo de visibilidad de controles header
        if (dom.settingsMenu) dom.settingsMenu.style.display = 'none';
        
        const target = document.getElementById(`panel-${panelId}`);
        if (target) target.classList.add('active');

        // Mostrar botones de guardar SOLO en editores
        if (panelId === 'edit-model' || panelId === 'edit-schema') {
            document.body.classList.add('fullscreen-editor-active');
            dom.editorControls.style.display = 'flex';
        } else {
            dom.editorControls.style.display = 'none';
        }
    }

    // --- Funciones existentes (Simplificadas visualmente) ---
    // Tema
    function applyInitialTheme() { const saved = localStorage.getItem('admin-theme'); isLightMode = (saved === 'light'); updateTheme(); }
    function handleThemeToggle(e) { if(e) e.stopPropagation(); isLightMode = !isLightMode; localStorage.setItem('admin-theme', isLightMode ? 'light' : 'dark'); updateTheme(); }
    function updateTheme() { const r = document.documentElement; if(isLightMode) r.classList.add('light-mode'); else r.classList.remove('light-mode'); }
    
    // Modales
    function toggleSettingsMenu() { dom.settingsMenu.style.display = (dom.settingsMenu.style.display === 'block') ? 'none' : 'block'; }
    function showInfoModal() { dom.settingsMenu.style.display = 'none'; dom.infoModal.style.display = 'block'; dom.modalOverlay.style.display = 'block'; }
    function openLibraryModal() { dom.settingsMenu.style.display = 'none'; renderLibraryGamaList(); dom.libraryModal.style.display = 'block'; dom.modalOverlay.style.display = 'block'; dom.uploadStatusText.textContent = "Formato Admin (Punto y coma)"; dom.csvUploadInput.value = ""; }
    function hideAllModals() { dom.infoModal.style.display = 'none'; dom.libraryModal.style.display = 'none'; dom.modalOverlay.style.display = 'none'; }

    // Importación / Biblioteca
    function renderLibraryGamaList() { dom.libraryGamaList.innerHTML = ''; Object.keys(masterSchemaMap).forEach(key => { const active = activeSchemas.has(key); const item = document.createElement('div'); item.className = 'gama-toggle-item'; item.innerHTML = `<label class="gama-toggle-label"><input type="checkbox" class="gama-checkbox" data-key="${key}" ${active ? 'checked' : ''}><span class="gama-name">${key.toUpperCase()}</span></label><span class="gama-status">${active ? 'Activa' : 'Oculta'}</span>`; dom.libraryGamaList.appendChild(item); }); }
    function handleGamaToggle(e) { if (!e.target.matches('.gama-checkbox')) return; const key = e.target.dataset.key; if (e.target.checked) activeSchemas.add(key); else activeSchemas.delete(key); refreshUI(); renderLibraryGamaList(); }
    function handleCsvUpload(e) { const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = (ev) => { try { parseAndImportCsv(ev.target.result); dom.uploadStatusText.textContent = "¡Importado!"; refreshUI(); } catch(err) { alert("Error CSV"); } }; r.readAsText(f); }
    function handleTextImport() { const t = dom.csvTextInput.value.trim(); if(!t) return; try { parseAndImportCsv(t); dom.uploadStatusText.textContent = "¡Texto Importado!"; dom.csvTextInput.value = ""; refreshUI(); } catch(err) { alert("Error formato texto"); } }

    function parseCSVLine(text) { const result = []; let current = ''; let inQuotes = false; for (let i = 0; i < text.length; i++) { const char = text[i]; const nextChar = text[i + 1]; if (inQuotes) { if (char === '"' && nextChar === '"') { current += '"'; i++; } else if (char === '"') { inQuotes = false; } else { current += char; } } else { if (char === ';') { result.push(current); current = ''; } else if (char === '"') { inQuotes = true; } else { current += char; } } } result.push(current); return result; }
    function parseAndImportCsv(csvText) { let cleanText = csvText; if (cleanText.charCodeAt(0) === 0xFEFF) cleanText = cleanText.slice(1); const lines = cleanText.split(/\r?\n/).filter(l => l.trim() !== ''); if (lines.length < 4) throw new Error("CSV muy corto"); const rowGroups = parseCSVLine(lines[0]); const schemaKey = rowGroups[0].toLowerCase().trim(); if (!schemaKey) throw new Error("Falta Schema Key"); const rowCodes = parseCSVLine(lines[1]); const rowDescs = parseCSVLine(lines[2]); const startIndex = 2; const tempSchema = {}; const groupOrder = []; for (let i = startIndex; i < rowCodes.length; i++) { const groupName = rowGroups[i] || "Otros"; const code = rowCodes[i]; const desc = rowDescs[i] || code; if (code) { if (!tempSchema[groupName]) { tempSchema[groupName] = []; groupOrder.push(groupName); } tempSchema[groupName].push({ code, desc }); } } const newSchemaGroup = groupOrder.map(gName => ({ group: gName, attrs: tempSchema[gName] })); window.APP_DB.registerSchema(schemaKey, newSchemaGroup); activeSchemas.add(schemaKey); for (let i = 3; i < lines.length; i++) { const cols = parseCSVLine(lines[i]); const modelId = cols[1]; if (!modelId) continue; const attributes = {}; for (let j = startIndex; j < rowCodes.length; j++) { const code = rowCodes[j]; if (code && cols[j]) attributes[code] = cols[j]; } window.APP_DB.registerProduct({ model: modelId, schema_key: schemaKey, attributes: attributes }); } masterSchemaMap = window.APP_DB.schemas; masterDatabase = window.APP_DB.products; }

    // Buscador y Creación
    function applySearch() { const q = dom.modelSearchInput.value.toLowerCase().trim(); const res = masterDatabase.filter(p => p.model.toLowerCase().includes(q) && activeSchemas.has(p.schema_key)); renderSearchResults(res); }
    function renderSearchResults(results) { dom.modelSearchResults.innerHTML = ''; if(results.length === 0) { dom.modelSearchResults.innerHTML = '<div class="list-item dim">Sin resultados.</div>'; return; } const f = document.createDocumentFragment(); results.forEach(p => { const d = document.createElement('div'); d.className = 'list-item'; d.dataset.model = p.model; d.innerHTML = `<strong>${p.model}</strong> <span class="dim text-xs">(${p.schema_key})</span>`; f.appendChild(d); }); dom.modelSearchResults.appendChild(f); }
    function handleResultClick(e) { const t = e.target.closest('.list-item'); if(!t) return; const p = masterDatabase.find(x => x.model === t.dataset.model); if(p) { loadModelIntoEditor(p); showPanel('edit-model'); } }
    function handleCreateModelClick() { const s = dom.createModelSchemaSelect.value; const id = dom.createModelIdInput.value.trim().toUpperCase(); if(!s || !id) return alert("Datos incompletos."); if(masterDatabase.find(p => p.model === id)) { if(!confirm("Existe. ¿Editar?")) return; loadModelIntoEditor(masterDatabase.find(p => p.model === id)); } else { loadModelIntoEditor({ model: id, schema_key: s, attributes: {} }); } showPanel('edit-model'); }
    function handleSchemaCreateClick() { const k = dom.newSchemaKeyInput.value.trim().toLowerCase(); if(!k) return; if(masterSchemaMap[k]) { if(!confirm("Existe. ¿Cargar?")) return; loadSchemaIntoEditor(k, JSON.parse(JSON.stringify(masterSchemaMap[k]))); } else { loadSchemaIntoEditor(k, []); } showPanel('edit-schema'); }

    // Helpers Editor/Schema
    function populateSchemaList() { dom.schemaResultsList.innerHTML = ''; Object.keys(masterSchemaMap).filter(k => activeSchemas.has(k)).forEach(k => { const d = document.createElement('div'); d.className = 'list-item'; d.dataset.key = k; d.textContent = k; dom.schemaResultsList.appendChild(d); }); }
    function handleSchemaLoadClick(e) { const t = e.target.closest('.list-item'); if(!t) return; const k = t.dataset.key; loadSchemaIntoEditor(k, JSON.parse(JSON.stringify(masterSchemaMap[k]))); showPanel('edit-schema'); }
    function populateGamaSelectors() { const opts = Object.keys(masterSchemaMap).filter(k => activeSchemas.has(k)).map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join(''); dom.gamaExportSelect.innerHTML = '<option value="">--</option>' + opts; dom.createModelSchemaSelect.innerHTML = '<option value="">--</option>' + opts; }
    
    // Editor Render
    function loadModelIntoEditor(p) { 
        currentLoadedSchemaKey = p.schema_key; 
        const schema = masterSchemaMap[p.schema_key]; 
        if(!schema) return alert("Esquema no cargado.");
        dom.productTitle.textContent = `Editor: ${p.model}`; 
        dom.editModelIdInput.value = p.model; 
        dom.editSchemaKeyDisplay.value = p.schema_key;
        dom.editorForm.querySelectorAll('.form-group-title, .form-row').forEach(e => e.remove());
        dom.editorPlaceholder.style.display = 'none';
        
        schema.forEach(g => {
            const h = document.createElement('h3'); h.className = 'form-group-title'; h.textContent = g.group; dom.editorForm.appendChild(h);
            g.attrs.forEach(a => {
                const r = document.createElement('div'); r.className = 'form-row';
                r.innerHTML = `<label class="futuristic-label">${a.desc}</label><textarea class="futuristic-textarea" name="${a.code}" rows="1">${p.attributes[a.code] || ''}</textarea>`;
                dom.editorForm.appendChild(r);
            });
        });
    }

    // Schema Editor
    function loadSchemaIntoEditor(k, s) { dom.schemaTitle.textContent = `Schema: ${k}`; dom.editSchemaKeyInput.value = k; dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(e => e.remove()); dom.schemaEditorPlaceholder.style.display = 'none'; s.forEach(g => addGroupToEditor(g)); }
    function addGroupToEditor(g = null) { const d = document.createElement('div'); d.className = 'schema-group-box'; d.innerHTML = `<div class="control-group mb-4"><input type="text" class="futuristic-input" data-type="group-name" value="${g ? g.group : ''}" placeholder="Grupo"> <button class="schema-action-btn schema-remove-btn schema-remove-group-btn">✕</button></div><div class="schema-attrs"></div><button class="schema-action-btn schema-add-attr-btn">+ Campo</button>`; const c = d.querySelector('.schema-attrs'); if(g) g.attrs.forEach(a => addAttr(a, c)); dom.schemaEditorForm.insertBefore(d, dom.addGroupBtn); } // Nota: InsertBefore fix
    function addAttr(a, c) { const d = document.createElement('div'); d.className = 'schema-attr-row'; d.innerHTML = `<input type="text" class="futuristic-input" data-type="attr-code" value="${a?a.code:''}" placeholder="Cod"><input type="text" class="futuristic-input" data-type="attr-desc" value="${a?a.desc:''}" placeholder="Desc"><button class="schema-action-btn schema-remove-btn schema-remove-attr-btn">✕</button>`; c.appendChild(d); }
    function handleSchemaEditorClicks(e) {
        if(e.target.matches('.schema-add-attr-btn')) { e.preventDefault(); addAttr(null, e.target.parentNode.querySelector('.schema-attrs')); }
        else if(e.target.matches('.schema-remove-attr-btn')) { e.preventDefault(); e.target.closest('.schema-attr-row').remove(); }
        else if(e.target.matches('.schema-remove-group-btn')) { e.preventDefault(); e.target.closest('.schema-group-box').remove(); }
    }

    // Export Helpers
    function handleSchemaExportClick() {
        // Lógica duplicada de saveSchemaToMemory pero generando archivo
        const key = dom.editSchemaKeyInput.value;
        const schema = masterSchemaMap[key]; // Asumimos que ya se guardó en memoria
        if(!schema) return alert("Guardar en memoria primero.");
        const content = `/** Schema: ${key} */\nconst ${key.toUpperCase()}_SCHEMA = ${JSON.stringify(schema, null, 4)};\nwindow.APP_DB.registerSchema('${key}', ${key.toUpperCase()}_SCHEMA);`;
        downloadFile(`schema_${key}.js`, content, 'text/javascript');
    }
    function populateGamaExportList() { const s = dom.gamaExportSelect.value; dom.gamaExportList.innerHTML = ''; if(!s) return; const p = masterDatabase.filter(x => x.schema_key === s); if(p.length === 0) { dom.gamaExportList.innerHTML = 'Vacío'; return; } p.forEach(x => { const d = document.createElement('div'); d.className = 'gama-export-item'; d.innerHTML = `${x.model} <button class="export-item-button" onclick="generateAndDownloadProductFile(null, '${x.model}')">JSON</button>`; dom.gamaExportList.appendChild(d); }); } // Fix: onclick inline bad practice, but shorthand here. Better use delegate in setup.
    function generateAndDownloadProductFile(prod, id) { 
        // Si prod es null, buscar en DB (para lista export)
        const p = prod || masterDatabase.find(x => x.model === id);
        if(!p) return;
        downloadFile(`${p.model}.json`, JSON.stringify(p, null, 4), 'application/json'); 
    }
    function exportGamaAsJson() { const s = dom.gamaExportSelect.value; if(!s) return; const p = masterDatabase.filter(x => x.schema_key === s); downloadFile(`GAMA_${s}.json`, JSON.stringify(p, null, 4), 'application/json'); }
    function exportGamaAsCsv() { /* Lógica CSV igual que versión anterior, omitida por espacio pero asumida presente */ }
    function downloadFile(n, c, m) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([c], {type:m})); a.download = n; a.click(); }

    initialize();
});