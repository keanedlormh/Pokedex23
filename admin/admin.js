/*
 * Lógica del Panel de Administración v3.4.2
 * Update: Fix inicialización de modales.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias DOM ---
    const dom = {
        homeBtn: document.getElementById('home-btn'),
        saveBtn: document.getElementById('save-btn'),
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
        panelGeneral: document.getElementById('panel-general'),
        navCardButtons: document.querySelectorAll('.nav-card'),
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

    // --- Variables de Estado ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let activeSchemas = new Set(); 
    let currentLoadedSchemaKey = null; 
    let currentActivePanel = 'general';

    const darkPaletteHSL = { accent: { h: 188, s: 96, l: 41 }, dark: { h: 210, s: 29, l: 8 }, medium: { h: 210, s: 19, l: 11 }, border: { h: 210, s: 16, l: 15 }, textP: { h: 210, s: 29, l: 92 }, textS: { h: 210, s: 12, l: 67 } };
    const lightPaletteHSL = { accent: { h: 188, s: 86, l: 40 }, dark: { h: 210, s: 20, l: 98 }, medium: { h: 210, s: 19, l: 94 }, border: { h: 210, s: 16, l: 85 }, textP: { h: 210, s: 29, l: 10 }, textS: { h: 210, s: 12, l: 40 } };
    let isLightMode = false;
    let currentAccentHue = 188;

    function initialize() {
        applyInitialTheme(); 
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;
            if (masterDatabase.length > 0) masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
            
            Object.keys(masterSchemaMap).forEach(k => activeSchemas.add(k));

            setupEventListeners();
            refreshUI();
            showPanel('general');
            
            // Asegurar que el modal de librería empieza cerrado (redundancia de seguridad)
            if (dom.libraryModal) dom.libraryModal.style.display = 'none';
            if (dom.infoModal) dom.infoModal.style.display = 'none';
            if (dom.modalOverlay) dom.modalOverlay.style.display = 'none';

            if(dom.exportGamaJsonButton) dom.exportGamaJsonButton.disabled = true;
            if(dom.exportGamaCsvButton) dom.exportGamaCsvButton.disabled = true;
            if(dom.addGroupBtn) dom.addGroupBtn.disabled = true; 
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
        dom.saveBtn.addEventListener('click', handleSaveClick);
        dom.settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSettingsMenu(); });
        dom.themeBtn.addEventListener('click', handleThemeToggle);
        dom.infoBtn.addEventListener('click', showInfoModal);
        dom.libraryBtn.addEventListener('click', openLibraryModal); 
        dom.closeInfoModalBtn.addEventListener('click', hideAllModals);
        dom.libraryCloseBtn.addEventListener('click', hideAllModals); 
        dom.modalOverlay.addEventListener('click', hideAllModals);
        document.addEventListener('click', (e) => {
            if (dom.settingsMenu && dom.settingsMenu.style.display === 'block') {
                if (!dom.settingsMenu.contains(e.target) && e.target !== dom.settingsBtn) dom.settingsMenu.style.display = 'none';
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
    }

    // ... (Lógica de Tema, Navegación, Modales y Hubs se mantiene igual) ...
    function applyInitialTheme() {
        const savedMode = localStorage.getItem('admin-theme-mode');
        isLightMode = (savedMode === 'light');
        currentAccentHue = Math.floor(Math.random() * 360);
        if (isLightMode) updatePaletteCSS(lightPaletteHSL, currentAccentHue);
        else updatePaletteCSS(darkPaletteHSL, currentAccentHue);
    }
    function handleThemeToggle() {
        isLightMode = !isLightMode;
        localStorage.setItem('admin-theme-mode', isLightMode ? 'light' : 'dark');
        currentAccentHue = Math.floor(Math.random() * 360);
        if (isLightMode) updatePaletteCSS(lightPaletteHSL, currentAccentHue);
        else updatePaletteCSS(darkPaletteHSL, currentAccentHue);
        dom.settingsMenu.style.display = 'none';
    }
    function updatePaletteCSS(baseHSL, accentHue) {
        const p = baseHSL; const newOtherHue = (accentHue + 0 + 360) % 360; const accentRGB = hslToRgb(accentHue, p.accent.s, p.accent.l); const root = document.documentElement;
        const vars = {
            '--color-cyan-accent': `hsl(${accentHue}, ${p.accent.s}%, ${p.accent.l}%)`,
            '--color-cyan-glow': `rgba(${accentRGB.r}, ${accentRGB.g}, ${accentRGB.b}, 0.25)`,
            '--color-green-accent': `hsl(${ (accentHue + 120) % 360 }, 80%, 45%)`, 
            '--color-red-accent': `hsl(${ (accentHue + 240) % 360 }, 85%, 55%)`,   
            '--color-bg-dark': `hsl(${newOtherHue}, ${p.dark.s}%, ${p.dark.l}%)`,
            '--color-bg-medium': `hsl(${newOtherHue}, ${p.medium.s}%, ${p.medium.l}%)`,
            '--color-border': `hsl(${newOtherHue}, ${p.border.s}%, ${p.border.l}%)`,
            '--color-border-light': `hsl(${newOtherHue}, ${p.border.s}%, ${p.border.l + 5}%)`,
            '--color-text-primary': `hsl(${newOtherHue}, ${p.textP.s}%, ${p.textP.l}%)`,
            '--color-text-secondary': `hsl(${newOtherHue}, ${p.textS.s}%, ${p.textS.l}%)`,
            '--color-text-dim': `hsl(${newOtherHue}, ${p.textS.s}%, ${p.textS.l - 10}%)`
        };
        for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
        if (isLightMode) root.classList.add('light-mode'); else root.classList.remove('light-mode');
    }
    function hslToRgb(h, s, l) {
        s /= 100; l /= 100; const k = n => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
    }

    function handleSaveClick() {
        if (currentActivePanel === 'edit-model') exportDataFromEditor();
        else if (currentActivePanel === 'edit-schema') handleSchemaExportClick();
    }
    function showPanel(panelId) {
        currentActivePanel = panelId; dom.allContentPanels.forEach(p => p.classList.remove('active')); document.body.classList.remove('fullscreen-editor-active'); dom.saveBtn.style.display = 'none';
        if (dom.settingsMenu) dom.settingsMenu.style.display = 'none';
        const target = document.getElementById(`panel-${panelId}`); if (target) target.classList.add('active');
        if (panelId === 'edit-model' || panelId === 'edit-schema') { document.body.classList.add('fullscreen-editor-active'); dom.saveBtn.style.display = 'inline-flex'; }
    }
    function toggleSettingsMenu() { dom.settingsMenu.style.display = (dom.settingsMenu.style.display === 'block') ? 'none' : 'block'; }
    function showInfoModal() { dom.settingsMenu.style.display = 'none'; dom.infoModal.style.display = 'block'; dom.libraryModal.style.display = 'none'; dom.modalOverlay.style.display = 'block'; }
    function openLibraryModal() { dom.settingsMenu.style.display = 'none'; dom.infoModal.style.display = 'none'; renderLibraryGamaList(); dom.libraryModal.style.display = 'block'; dom.modalOverlay.style.display = 'block'; dom.uploadStatusText.textContent = "Formato Admin Requerido (Punto y coma)"; dom.csvUploadInput.value = ""; }
    function hideAllModals() { dom.infoModal.style.display = 'none'; dom.libraryModal.style.display = 'none'; dom.modalOverlay.style.display = 'none'; }

    // --- Biblioteca Logic ---
    function renderLibraryGamaList() {
        dom.libraryGamaList.innerHTML = '';
        Object.keys(masterSchemaMap).forEach(schemaKey => {
            const isActive = activeSchemas.has(schemaKey);
            const friendlyName = schemaKey.charAt(0).toUpperCase() + schemaKey.slice(1);
            const item = document.createElement('div'); item.className = 'gama-toggle-item';
            item.innerHTML = `<label class="gama-toggle-label"><input type="checkbox" class="gama-checkbox" data-key="${schemaKey}" ${isActive ? 'checked' : ''}><span class="gama-name">${friendlyName}</span></label><span class="gama-status">${isActive ? 'Activa' : 'Oculta'}</span>`;
            dom.libraryGamaList.appendChild(item);
        });
    }
    function handleGamaToggle(e) {
        if (!e.target.matches('.gama-checkbox')) return;
        const key = e.target.dataset.key; if (e.target.checked) activeSchemas.add(key); else activeSchemas.delete(key);
        const statusSpan = e.target.closest('.gama-toggle-item').querySelector('.gama-status');
        statusSpan.textContent = e.target.checked ? 'Activa' : 'Oculta'; statusSpan.style.color = e.target.checked ? 'var(--color-cyan-accent)' : 'var(--color-text-dim)';
        refreshUI();
    }
    function handleCsvUpload(e) {
        const file = e.target.files[0]; if (!file) return; dom.uploadStatusText.textContent = `Leyendo: ${file.name}...`;
        const reader = new FileReader();
        reader.onload = (event) => {
            try { parseAndImportCsv(event.target.result); dom.uploadStatusText.textContent = `¡Importado!`; dom.uploadStatusText.style.color = 'var(--color-cyan-accent)'; refreshUI(); } catch (error) { console.error(error); dom.uploadStatusText.textContent = `Error: Formato inválido`; dom.uploadStatusText.style.color = '#ef4444'; alert("Error CSV: Asegúrate de usar el formato 3 filas."); }
        }; reader.readAsText(file, 'UTF-8');
    }
    
    // --- Parser CSV ---
    function parseCSVLine(text) {
        const result = []; let current = ''; let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i]; const nextChar = text[i + 1];
            if (inQuotes) { if (char === '"' && nextChar === '"') { current += '"'; i++; } else if (char === '"') { inQuotes = false; } else { current += char; } } else { if (char === ';') { result.push(current); current = ''; } else if (char === '"') { inQuotes = true; } else { current += char; } }
        } result.push(current); return result;
    }
    function parseAndImportCsv(csvText) {
        let cleanText = csvText; if (cleanText.charCodeAt(0) === 0xFEFF) cleanText = cleanText.slice(1);
        const lines = cleanText.split(/\r?\n/).filter(l => l.trim() !== ''); if (lines.length < 4) throw new Error("CSV muy corto");
        const rowGroups = parseCSVLine(lines[0]); const schemaKey = rowGroups[0].toLowerCase().trim(); if (!schemaKey) throw new Error("Falta Schema Key");
        const rowCodes = parseCSVLine(lines[1]); const rowDescs = parseCSVLine(lines[2]);
        const startIndex = 2; const tempSchema = {}; const groupOrder = []; 
        for (let i = startIndex; i < rowCodes.length; i++) {
            const groupName = rowGroups[i] || "Otros"; const code = rowCodes[i]; const desc = rowDescs[i] || code;
            if (code) { if (!tempSchema[groupName]) { tempSchema[groupName] = []; groupOrder.push(groupName); } tempSchema[groupName].push({ code, desc }); }
        }
        const newSchemaGroup = groupOrder.map(gName => ({ group: gName, attrs: tempSchema[gName] }));
        window.APP_DB.registerSchema(schemaKey, newSchemaGroup); activeSchemas.add(schemaKey);
        let count = 0;
        for (let i = 3; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]); const modelId = cols[1]; if (!modelId) continue;
            const attributes = {}; for (let j = startIndex; j < rowCodes.length; j++) { const code = rowCodes[j]; if (code && cols[j]) attributes[code] = cols[j]; }
            const newProduct = { model: modelId, schema_key: schemaKey, attributes: attributes }; window.APP_DB.registerProduct(newProduct); count++;
        }
        masterSchemaMap = window.APP_DB.schemas; masterDatabase = window.APP_DB.products; masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
        console.log(`Importada gama ${schemaKey} con ${count} modelos.`);
    }

    // --- Filtrado Admin (usando activeSchemas) ---
    function applySearch() {
        const q = dom.modelSearchInput.value.toLowerCase().trim();
        const filtered = masterDatabase.filter(p => p.model.toLowerCase().includes(q) && activeSchemas.has(p.schema_key));
        renderSearchResults(filtered);
    }
    function renderSearchResults(results) {
        dom.modelSearchResults.innerHTML = ''; if (results.length === 0) { dom.modelSearchResults.innerHTML = '<div class="list-item dim">No se encontraron resultados (o gama oculta).</div>'; return; }
        const frag = document.createDocumentFragment(); results.forEach(p => { const item = document.createElement('div'); item.className = 'list-item'; item.dataset.model = p.model; item.innerHTML = `<strong>${p.model}</strong> <span class="dim text-xs">(${p.schema_key})</span>`; frag.appendChild(item); }); dom.modelSearchResults.appendChild(frag);
    }
    function handleResultClick(e) { const t = e.target.closest('.list-item'); if (!t) return; const product = masterDatabase.find(p => p.model === t.dataset.model); if (product) { loadModelIntoEditor(product); showPanel('edit-model'); } }
    function populateSchemaList() {
        dom.schemaResultsList.innerHTML = ''; const frag = document.createDocumentFragment();
        Object.keys(masterSchemaMap).filter(k => activeSchemas.has(k)).forEach(key => { const item = document.createElement('div'); item.className = 'list-item'; item.dataset.schemaKey = key; item.innerHTML = `<strong>${key}</strong>`; frag.appendChild(item); }); dom.schemaResultsList.appendChild(frag);
    }
    function handleSchemaLoadClick(e) { const t = e.target.closest('.list-item'); if (!t) return; const key = t.dataset.schemaKey; loadSchemaIntoEditor(key, JSON.parse(JSON.stringify(masterSchemaMap[key]))); showPanel('edit-schema'); }
    function handleCreateModelClick() {
        const schema = dom.createModelSchemaSelect.value; const id = dom.createModelIdInput.value.trim().toUpperCase();
        if (!schema) return alert("Selecciona una gama."); if (!id) return alert("Introduce un Model ID.");
        if (/\s/.test(id)) return alert("El ID no puede tener espacios.");
        const existing = masterDatabase.find(p => p.model === id);
        if (existing) { if(!confirm(`El modelo ${id} ya existe. ¿Editarlo?`)) return; loadModelIntoEditor(existing); showPanel('edit-model'); return; }
        loadModelIntoEditor({ model: id, schema_key: schema, attributes: {} }); dom.createModelIdInput.value = ''; showPanel('edit-model');
    }
    function handleSchemaCreateClick() { const key = dom.newSchemaKeyInput.value.trim().toLowerCase(); if (!key) return alert("Introduce una clave para el esquema."); if (masterSchemaMap[key]) { if (!confirm("Ya existe. ¿Cargar?")) return; loadSchemaIntoEditor(key, JSON.parse(JSON.stringify(masterSchemaMap[key]))); } else { loadSchemaIntoEditor(key, []); } dom.newSchemaKeyInput.value = ''; showPanel('edit-schema'); }
    function populateGamaSelectors() {
        const frag = document.createDocumentFragment();
        Object.keys(masterSchemaMap).filter(k => activeSchemas.has(k)).forEach(key => { const opt = document.createElement('option'); opt.value = key; opt.textContent = key.charAt(0).toUpperCase() + key.slice(1); frag.appendChild(opt); });
        if (dom.gamaExportSelect) { dom.gamaExportSelect.innerHTML = '<option value="">-- Seleccionar --</option>'; dom.gamaExportSelect.appendChild(frag.cloneNode(true)); }
        if (dom.createModelSchemaSelect) { dom.createModelSchemaSelect.innerHTML = '<option value="">-- Seleccionar Gama --</option>'; dom.createModelSchemaSelect.appendChild(frag.cloneNode(true)); }
    }
    function populateGamaExportList() {
        const schema = dom.gamaExportSelect.value; dom.gamaExportList.innerHTML = '';
        if (!schema) { dom.exportGamaJsonButton.disabled = true; dom.exportGamaCsvButton.disabled = true; return; }
        dom.exportGamaJsonButton.disabled = false; dom.exportGamaCsvButton.disabled = false;
        const prods = masterDatabase.filter(p => p.schema_key === schema);
        if (prods.length === 0) { dom.gamaExportList.innerHTML = '<p class="dim p-2">Sin modelos.</p>'; return; }
        const frag = document.createDocumentFragment(); prods.forEach(p => { const div = document.createElement('div'); div.className = 'gama-export-item'; div.innerHTML = `<span>${p.model}</span><button class="export-item-button" data-model="${p.model}">JSON</button>`; frag.appendChild(div); }); dom.gamaExportList.appendChild(frag);
    }
    function handleGamaExportClick(e) { const t = e.target.closest('.export-item-button'); if (!t) return; const p = masterDatabase.find(x => x.model === t.dataset.model); if (p) generateAndDownloadProductFile(p, p.model); }
    function exportGamaAsJson() { const schema = dom.gamaExportSelect.value; if (!schema) return; const prods = masterDatabase.filter(p => p.schema_key === schema); if (prods.length === 0) return alert("Gama vacía."); downloadFile(`GAMA_${schema.toUpperCase()}.json`, JSON.stringify(prods, null, 4), 'application/json;charset=utf-8'); }
    function exportGamaAsCsv() {
        const selectedSchema = dom.gamaExportSelect.value; if (!selectedSchema) return;
        const products = masterDatabase.filter(p => p.schema_key === selectedSchema); if (products.length === 0) return alert("Gama vacía.");
        const schemaDef = masterSchemaMap[selectedSchema];
        let row1_groups = [selectedSchema, "Identificación"]; let row2_codes = ["", "model"]; let row3_descs = ["", "Modelo"]; let attrKeys = [];
        if (schemaDef) { schemaDef.forEach(group => { group.attrs.forEach(attr => { row1_groups.push(group.group); row2_codes.push(attr.code); row3_descs.push(attr.desc); attrKeys.push(attr.code); }); }); } else { const allKeys = new Set(); products.forEach(p => Object.keys(p.attributes).forEach(k => allKeys.add(k))); Array.from(allKeys).forEach(key => { row1_groups.push("Datos"); row2_codes.push(key); row3_descs.push(key); attrKeys.push(key); }); }
        const sanitize = (val) => { if (val === null || val === undefined) return ""; val = String(val); val = val.replace(/"/g, '""'); if (val.search(/("|\;|:|\n|\r)/g) >= 0) val = `"${val}"`; return val; };
        const dataRows = products.map(p => { let row = ["", sanitize(p.model)]; attrKeys.forEach(key => { let val = p.attributes[key] || ""; row.push(sanitize(val)); }); return row.join(";"); });
        const header1 = row1_groups.map(g => sanitize(g)).join(";"); const header2 = row2_codes.map(c => sanitize(c)).join(";"); const header3 = row3_descs.map(d => sanitize(d)).join(";");
        const csvContent = "\uFEFF" + header1 + "\n" + header2 + "\n" + header3 + "\n" + dataRows.join("\n");
        const filename = `GAMA_${selectedSchema.toUpperCase()}.csv`; downloadFile(filename, csvContent, 'text/csv;charset=utf-8');
    }
    function loadModelIntoEditor(product) {
        currentLoadedSchemaKey = product.schema_key; const schema = masterSchemaMap[product.schema_key]; if (!schema) return alert(`Esquema ${product.schema_key} no encontrado.`);
        const isNew = Object.keys(product.attributes).length === 0; dom.productTitle.textContent = isNew ? `Crear: ${product.model}` : `Editar: ${product.model}`; dom.editModelIdInput.value = product.model; dom.editSchemaKeyDisplay.value = product.schema_key; dom.editorForm.querySelectorAll('.form-group-title, .form-row').forEach(el => el.remove()); dom.editorPlaceholder.style.display = 'none';
        const frag = document.createDocumentFragment();
        schema.forEach(group => {
            const h3 = document.createElement('h3'); h3.className = 'form-group-title'; h3.textContent = group.group; frag.appendChild(h3);
            group.attrs.forEach(attr => {
                const val = product.attributes[attr.code] || ""; const row = document.createElement('div'); row.className = 'form-row';
                const uniqueId = `attr_${attr.code}_${Math.random().toString(36).substr(2,5)}`;
                const label = document.createElement('label'); label.className = 'futuristic-label'; label.htmlFor = uniqueId; label.textContent = `${attr.desc} (${attr.code})`;
                const ta = document.createElement('textarea'); ta.className = 'futuristic-textarea'; ta.id = uniqueId; ta.name = attr.code; ta.rows = 1; ta.value = val; ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = (ta.scrollHeight) + 'px'; });
                row.appendChild(label); row.appendChild(ta); frag.appendChild(row);
            });
        });
        dom.editorForm.appendChild(frag); setTimeout(() => { dom.editorForm.querySelectorAll('textarea').forEach(t => { t.style.height = 'auto'; t.style.height = (t.scrollHeight) + 'px'; }); }, 10);
    }
    function exportDataFromEditor() {
        if (!currentLoadedSchemaKey) return; const id = dom.editModelIdInput.value.trim().toUpperCase(); if (!id) return alert("Falta Model ID."); const formData = new FormData(dom.editorForm); const attrs = {}; for (const [k, v] of formData.entries()) if (v.trim()) attrs[k] = v.trim();
        generateAndDownloadProductFile({ model: id, schema_key: currentLoadedSchemaKey, attributes: attrs }, id); alert("JSON Generado.");
    }
    function generateAndDownloadProductFile(obj, name) { downloadFile(`${name}.json`, JSON.stringify(obj, null, 4), 'application/json;charset=utf-8'); }
    function downloadFile(name, content, mime) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
    function loadSchemaIntoEditor(key, schema) { dom.schemaTitle.textContent = `Editando: ${key}`; dom.editSchemaKeyInput.value = key; dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(el => el.remove()); dom.schemaEditorPlaceholder.style.display = 'none'; dom.addGroupBtn.disabled = false; schema.forEach(g => addGroupToEditor(g)); }
    function addGroupToEditor(group = null) {
        const div = document.createElement('div'); div.className = 'schema-group-box'; const gName = group ? group.group : '';
        div.innerHTML = `<div class="schema-group-header"><div class="control-group flex-grow"><label class="futuristic-label">Grupo:</label><input type="text" class="futuristic-input w-full" data-type="group-name" value="${gName}" placeholder="NOMBRE GRUPO"></div><button class="schema-action-btn schema-add-attr-btn">+ Attr</button><button class="schema-action-btn schema-remove-btn schema-remove-group-btn">Eliminar</button></div><div class="schema-attributes-container"></div>`;
        const container = div.querySelector('.schema-attributes-container'); if (group && group.attrs) group.attrs.forEach(a => addAttributeToGroup(a, container)); dom.schemaEditorForm.appendChild(div);
    }
    function addAttributeToGroup(attr, container) {
        const div = document.createElement('div'); div.className = 'schema-attr-row'; const c = attr ? attr.code : ''; const d = attr ? attr.desc : '';
        div.innerHTML = `<input type="text" class="futuristic-input" data-type="attr-code" value="${c}" placeholder="codigo"><input type="text" class="futuristic-input" data-type="attr-desc" value="${d}" placeholder="Descripción"><button class="schema-action-btn schema-remove-btn schema-remove-attr-btn">✕</button>`; container.appendChild(div);
    }
    function handleSchemaEditorClicks(e) { if (e.target.closest('.schema-add-attr-btn')) { e.preventDefault(); addAttributeToGroup(null, e.target.closest('.schema-group-box').querySelector('.schema-attributes-container')); } else if (e.target.closest('.schema-remove-attr-btn')) { e.preventDefault(); e.target.closest('.schema-attr-row').remove(); } else if (e.target.closest('.schema-remove-group-btn')) { e.preventDefault(); if (confirm("¿Eliminar grupo?")) e.target.closest('.schema-group-box').remove(); } }
    function handleSchemaExportClick() {
        const key = dom.editSchemaKeyInput.value.trim().toLowerCase(); if (!key) return alert("Falta Schema Key."); const newSchema = []; let valid = true;
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach((gb, i) => { const gName = gb.querySelector('input[data-type="group-name"]').value.trim(); if (!gName) { alert(`Grupo ${i+1} sin nombre.`); valid = false; return; } const attrs = []; gb.querySelectorAll('.schema-attr-row').forEach(row => { const c = row.querySelector('input[data-type="attr-code"]').value.trim(); const d = row.querySelector('input[data-type="attr-desc"]').value.trim(); if (c && d) attrs.push({ code: c, desc: d }); }); if (attrs.length > 0) newSchema.push({ group: gName, attrs: attrs }); });
        if (!valid) return; if (newSchema.length === 0 && !confirm("Esquema vacío.")) return;
        const varName = `${key.toUpperCase()}_SCHEMA_GROUPS`; const content = `/**\n * Schema: ${key}\n */\n\nconst ${varName} = ${JSON.stringify(newSchema, null, 4)};\n\nif (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {\n    window.APP_DB.registerSchema('${key}', ${varName});\n}\n`;
        downloadFile(`modulo${key.charAt(0).toUpperCase() + key.slice(1)}.js`, content, 'text/javascript;charset=utf-8'); alert("Archivo JS Generado.");
    }

    initialize();
});