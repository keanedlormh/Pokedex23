/*
 * Lógica del Panel de Administración v3.3.0
 * Update: Exportación a CSV para Excel.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias DOM ---
    const dom = {
        homeBtn: document.getElementById('home-btn'),
        saveBtn: document.getElementById('save-btn'),
        allContentPanels: document.querySelectorAll('.content-panel'),

        // Ajustes
        settingsBtn: document.getElementById('settings-btn'),
        settingsMenu: document.getElementById('settings-menu'),
        themeBtn: document.getElementById('theme-btn'),
        infoBtn: document.getElementById('info-btn'),
        infoModal: document.getElementById('info-modal'),
        modalOverlay: document.getElementById('modal-overlay'),
        closeInfoModalBtn: document.getElementById('close-info-modal-btn'),

        // Paneles
        panelGeneral: document.getElementById('panel-general'),
        navCardButtons: document.querySelectorAll('.nav-card'),

        // Hub Modelo
        panelModelHub: document.getElementById('panel-model-hub'),
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        createModelSchemaSelect: document.getElementById('create-model-schema-select'),
        createModelIdInput: document.getElementById('create-model-id'),
        createModelBtn: document.getElementById('create-model-btn'),

        // Hub Esquema
        panelSchemaHub: document.getElementById('panel-schema-hub'),
        schemaResultsList: document.getElementById('schema-results-list'),
        newSchemaKeyInput: document.getElementById('new-schema-key'),
        createSchemaBtn: document.getElementById('create-schema-btn'),

        // Editor Modelo
        panelEditModel: document.getElementById('panel-edit-model'),
        productTitle: document.getElementById('product-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),
        editModelIdInput: document.getElementById('edit-model-id'),
        editSchemaKeyDisplay: document.getElementById('edit-schema-key-display'),

        // Editor Esquema
        panelEditSchema: document.getElementById('panel-edit-schema'),
        schemaTitle: document.getElementById('schema-title'),
        schemaEditorForm: document.getElementById('schema-editor-form'),
        schemaEditorPlaceholder: document.getElementById('schema-editor-placeholder'),
        editSchemaKeyInput: document.getElementById('edit-schema-key'),
        addGroupBtn: document.getElementById('add-group-btn'),

        // Exportar
        panelExportGama: document.getElementById('panel-export-gama'),
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list'),
        exportGamaJsonButton: document.getElementById('export-gama-json-btn'),
        exportGamaCsvButton: document.getElementById('export-gama-csv-btn') // NUEVO
    };

    // --- Variables de Estado ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null; 
    let currentActivePanel = 'general';

    // --- Variables de Tema ---
    const darkPaletteHSL = { accent: { h: 188, s: 96, l: 41 }, dark: { h: 210, s: 29, l: 8 }, medium: { h: 210, s: 19, l: 11 }, border: { h: 210, s: 16, l: 15 }, textP: { h: 210, s: 29, l: 92 }, textS: { h: 210, s: 12, l: 67 } };
    const lightPaletteHSL = { accent: { h: 188, s: 86, l: 40 }, dark: { h: 210, s: 20, l: 98 }, medium: { h: 210, s: 19, l: 94 }, border: { h: 210, s: 16, l: 85 }, textP: { h: 210, s: 29, l: 10 }, textS: { h: 210, s: 12, l: 40 } };
    
    let isLightMode = false;
    let currentAccentHue = 188;

    // --- Init ---
    function initialize() {
        applyInitialTheme(); 

        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;

            if (masterDatabase.length > 0) {
                masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
            }

            setupEventListeners();

            renderSearchResults(masterDatabase);
            populateSchemaList(); 
            populateGamaSelectors(); 

            showPanel('general');
            
            // Estado inicial botones
            if(dom.exportGamaJsonButton) dom.exportGamaJsonButton.disabled = true;
            if(dom.exportGamaCsvButton) dom.exportGamaCsvButton.disabled = true;
            if(dom.addGroupBtn) dom.addGroupBtn.disabled = true; 

        }, 100);
    }

    function setupEventListeners() {
        dom.homeBtn.addEventListener('click', () => showPanel('general'));
        dom.saveBtn.addEventListener('click', handleSaveClick);

        // Ajustes
        dom.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSettingsMenu();
        });
        dom.themeBtn.addEventListener('click', handleThemeToggle);
        dom.infoBtn.addEventListener('click', showInfoModal);
        dom.closeInfoModalBtn.addEventListener('click', hideInfoModal);
        dom.modalOverlay.addEventListener('click', hideInfoModal);

        document.addEventListener('click', (e) => {
            if (dom.settingsMenu && dom.settingsMenu.style.display === 'block') {
                if (!dom.settingsMenu.contains(e.target) && e.target !== dom.settingsBtn) {
                    dom.settingsMenu.style.display = 'none';
                }
            }
        });

        // Navegación Cards
        dom.navCardButtons.forEach(card => {
            card.addEventListener('click', () => showPanel(card.dataset.panel));
        });

        // Buscador Modelos
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.createModelBtn.addEventListener('click', handleCreateModelClick);

        // Esquemas
        dom.schemaResultsList.addEventListener('click', handleSchemaLoadClick);
        dom.createSchemaBtn.addEventListener('click', handleSchemaCreateClick);

        // Editor Esquema
        dom.addGroupBtn.addEventListener('click', () => addGroupToEditor());
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorClicks);

        // Exportar
        dom.gamaExportSelect.addEventListener('change', populateGamaExportList);
        dom.gamaExportList.addEventListener('click', handleGamaExportClick);
        dom.exportGamaJsonButton.addEventListener('click', exportGamaAsJson); 
        // Listener NUEVO para CSV
        dom.exportGamaCsvButton.addEventListener('click', exportGamaAsCsv);
    }

    // --- Lógica de Tema ---
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
        const p = baseHSL;
        const newOtherHue = (accentHue + 0 + 360) % 360; 
        const accentRGB = hslToRgb(accentHue, p.accent.s, p.accent.l);
        const root = document.documentElement;

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

        for (const [key, value] of Object.entries(vars)) {
            root.style.setProperty(key, value);
        }
        if (isLightMode) root.classList.add('light-mode');
        else root.classList.remove('light-mode');
    }

    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
    }

    // --- Funciones del Panel --- (Resto de lógica igual que v3.2)
    function handleSaveClick() {
        if (currentActivePanel === 'edit-model') exportDataFromEditor();
        else if (currentActivePanel === 'edit-schema') handleSchemaExportClick();
    }

    function showPanel(panelId) {
        currentActivePanel = panelId;
        dom.allContentPanels.forEach(p => p.classList.remove('active'));
        document.body.classList.remove('fullscreen-editor-active');
        dom.saveBtn.style.display = 'none';
        if (dom.settingsMenu) dom.settingsMenu.style.display = 'none';
        const target = document.getElementById(`panel-${panelId}`);
        if (target) target.classList.add('active');
        if (panelId === 'edit-model' || panelId === 'edit-schema') {
            document.body.classList.add('fullscreen-editor-active');
            dom.saveBtn.style.display = 'inline-flex';
        }
    }

    function toggleSettingsMenu() {
        dom.settingsMenu.style.display = (dom.settingsMenu.style.display === 'block') ? 'none' : 'block';
    }
    function showInfoModal() {
        dom.infoModal.style.display = 'block';
        dom.modalOverlay.style.display = 'block';
        dom.settingsMenu.style.display = 'none'; 
    }
    function hideInfoModal() {
        dom.infoModal.style.display = 'none';
        dom.modalOverlay.style.display = 'none';
    }

    // --- Model Hub ---
    function applySearch() {
        const q = dom.modelSearchInput.value.toLowerCase().trim();
        const filtered = q === "" ? masterDatabase : masterDatabase.filter(p => p.model.toLowerCase().includes(q));
        renderSearchResults(filtered);
    }
    function renderSearchResults(results) {
        dom.modelSearchResults.innerHTML = '';
        if (results.length === 0) {
            dom.modelSearchResults.innerHTML = '<div class="list-item dim">No se encontraron resultados.</div>';
            return;
        }
        const frag = document.createDocumentFragment();
        results.forEach(p => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.dataset.model = p.model;
            item.innerHTML = `<strong>${p.model}</strong> <span class="dim text-xs">(${p.schema_key})</span>`;
            frag.appendChild(item);
        });
        dom.modelSearchResults.appendChild(frag);
    }
    function handleResultClick(e) {
        const t = e.target.closest('.list-item');
        if (!t) return;
        const product = masterDatabase.find(p => p.model === t.dataset.model);
        if (product) {
            loadModelIntoEditor(product);
            showPanel('edit-model');
        }
    }
    function handleCreateModelClick() {
        const schema = dom.createModelSchemaSelect.value;
        const id = dom.createModelIdInput.value.trim().toUpperCase();
        if (!schema) return alert("Selecciona una gama.");
        if (!id) return alert("Introduce un Model ID.");
        if (/\s/.test(id)) return alert("El ID no puede tener espacios.");
        const existing = masterDatabase.find(p => p.model === id);
        if (existing) {
            if(!confirm(`El modelo ${id} ya existe. ¿Editarlo?`)) return;
            loadModelIntoEditor(existing);
            showPanel('edit-model');
            return;
        }
        loadModelIntoEditor({ model: id, schema_key: schema, attributes: {} });
        dom.createModelIdInput.value = '';
        showPanel('edit-model');
    }

    // --- Schema Hub ---
    function populateSchemaList() {
        dom.schemaResultsList.innerHTML = '';
        const frag = document.createDocumentFragment();
        Object.keys(masterSchemaMap).forEach(key => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.dataset.schemaKey = key;
            item.innerHTML = `<strong>${key}</strong>`;
            frag.appendChild(item);
        });
        dom.schemaResultsList.appendChild(frag);
    }
    function handleSchemaLoadClick(e) {
        const t = e.target.closest('.list-item');
        if (!t) return;
        const key = t.dataset.schemaKey;
        loadSchemaIntoEditor(key, JSON.parse(JSON.stringify(masterSchemaMap[key])));
        showPanel('edit-schema');
    }
    function handleSchemaCreateClick() {
        const key = dom.newSchemaKeyInput.value.trim().toLowerCase();
        if (!key) return alert("Introduce una clave para el esquema.");
        if (masterSchemaMap[key]) {
            if (!confirm("Ya existe. ¿Cargar?")) return;
            loadSchemaIntoEditor(key, JSON.parse(JSON.stringify(masterSchemaMap[key])));
        } else {
            loadSchemaIntoEditor(key, []);
        }
        dom.newSchemaKeyInput.value = '';
        showPanel('edit-schema');
    }

    // --- Selectores ---
    function populateGamaSelectors() {
        const frag = document.createDocumentFragment();
        Object.keys(masterSchemaMap).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            frag.appendChild(opt);
        });
        if (dom.gamaExportSelect) {
            dom.gamaExportSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
            dom.gamaExportSelect.appendChild(frag.cloneNode(true));
        }
        if (dom.createModelSchemaSelect) {
            dom.createModelSchemaSelect.innerHTML = '<option value="">-- Seleccionar Gama --</option>';
            dom.createModelSchemaSelect.appendChild(frag.cloneNode(true));
        }
    }

    function populateGamaExportList() {
        const schema = dom.gamaExportSelect.value;
        dom.gamaExportList.innerHTML = '';
        if (!schema) {
            dom.exportGamaJsonButton.disabled = true;
            dom.exportGamaCsvButton.disabled = true;
            return;
        }
        dom.exportGamaJsonButton.disabled = false;
        dom.exportGamaCsvButton.disabled = false;
        
        const prods = masterDatabase.filter(p => p.schema_key === schema);
        if (prods.length === 0) {
            dom.gamaExportList.innerHTML = '<p class="dim p-2">Sin modelos.</p>';
            return;
        }
        const frag = document.createDocumentFragment();
        prods.forEach(p => {
            const div = document.createElement('div');
            div.className = 'gama-export-item';
            div.innerHTML = `<span>${p.model}</span><button class="export-item-button" data-model="${p.model}">JSON</button>`;
            frag.appendChild(div);
        });
        dom.gamaExportList.appendChild(frag);
    }

    function handleGamaExportClick(e) {
        const t = e.target.closest('.export-item-button');
        if (!t) return;
        const p = masterDatabase.find(x => x.model === t.dataset.model);
        if (p) generateAndDownloadProductFile(p, p.model);
    }

    function exportGamaAsJson() {
        const schema = dom.gamaExportSelect.value;
        if (!schema) return;
        const prods = masterDatabase.filter(p => p.schema_key === schema);
        if (prods.length === 0) return alert("Gama vacía.");
        downloadFile(`GAMA_${schema.toUpperCase()}.json`, JSON.stringify(prods, null, 4), 'application/json;charset=utf-8');
    }

    // --- [NUEVO] Exportación CSV ---
    function exportGamaAsCsv() {
        const selectedSchema = dom.gamaExportSelect.value;
        if (!selectedSchema) return;
        
        const products = masterDatabase.filter(p => p.schema_key === selectedSchema);
        if (products.length === 0) return alert("Gama vacía.");
        
        // 1. Obtener estructura de columnas basada en el esquema
        const schemaDef = masterSchemaMap[selectedSchema];
        let csvHeaders = ['Model ID', 'Schema Key'];
        let attrKeys = [];

        if (schemaDef) {
            schemaDef.forEach(group => {
                group.attrs.forEach(attr => {
                    // Usamos attr.code como cabecera para compatibilidad técnica
                    csvHeaders.push(attr.code); 
                    attrKeys.push(attr.code);
                });
            });
        } else {
            // Fallback si no hay esquema (raro): recolectar todas las claves de los productos
            const allKeys = new Set();
            products.forEach(p => Object.keys(p.attributes).forEach(k => allKeys.add(k)));
            attrKeys = Array.from(allKeys);
            csvHeaders = csvHeaders.concat(attrKeys);
        }

        // 2. Construir filas
        const rows = products.map(p => {
            // Fila base
            let row = [p.model, p.schema_key];
            
            // Valores de atributos alineados con las cabeceras
            attrKeys.forEach(key => {
                let val = p.attributes[key] || ""; // Valor o cadena vacía
                
                // Sanitización CSV para Excel:
                // 1. Escapar comillas dobles ( duplicarlas: " -> "" )
                val = val.replace(/"/g, '""');
                
                // 2. Si contiene separador, salto de línea o comillas, envolver en comillas dobles
                // IMPORTANTE: Usamos punto y coma (;) como separador para compatibilidad con Excel Español
                if (val.search(/("|\;|:|\n)/g) >= 0) {
                    val = `"${val}"`;
                }
                row.push(val);
            });
            
            // Unir con punto y coma
            return row.join(";");
        });

        // 3. Unir todo con BOM para UTF-8 correcto en Excel
        // \uFEFF es el Byte Order Mark
        const csvContent = "\uFEFF" + csvHeaders.join(";") + "\n" + rows.join("\n");

        // 4. Descargar
        const filename = `GAMA_${selectedSchema.toUpperCase()}.csv`;
        downloadFile(filename, csvContent, 'text/csv;charset=utf-8');
    }


    // --- Editor Modelo ---
    function loadModelIntoEditor(product) {
        currentLoadedSchemaKey = product.schema_key;
        const schema = masterSchemaMap[product.schema_key];
        if (!schema) return alert(`Esquema ${product.schema_key} no encontrado.`);

        const isNew = Object.keys(product.attributes).length === 0;
        dom.productTitle.textContent = isNew ? `Crear: ${product.model}` : `Editar: ${product.model}`;
        dom.editModelIdInput.value = product.model;
        dom.editSchemaKeyDisplay.value = product.schema_key;

        dom.editorForm.querySelectorAll('.form-group-title, .form-row').forEach(el => el.remove());
        dom.editorPlaceholder.style.display = 'none';

        const frag = document.createDocumentFragment();
        schema.forEach(group => {
            const h3 = document.createElement('h3');
            h3.className = 'form-group-title';
            h3.textContent = group.group;
            frag.appendChild(h3);

            group.attrs.forEach(attr => {
                const val = product.attributes[attr.code] || "";
                const row = document.createElement('div');
                row.className = 'form-row';
                const uniqueId = `attr_${attr.code}_${Math.random().toString(36).substr(2,5)}`;
                
                const label = document.createElement('label');
                label.className = 'futuristic-label';
                label.htmlFor = uniqueId;
                label.textContent = `${attr.desc} (${attr.code})`;

                const ta = document.createElement('textarea');
                ta.className = 'futuristic-textarea';
                ta.id = uniqueId;
                ta.name = attr.code; 
                ta.rows = 1;
                ta.value = val;
                ta.addEventListener('input', () => {
                    ta.style.height = 'auto';
                    ta.style.height = (ta.scrollHeight) + 'px';
                });
                row.appendChild(label);
                row.appendChild(ta);
                frag.appendChild(row);
            });
        });
        dom.editorForm.appendChild(frag);
        setTimeout(() => {
            dom.editorForm.querySelectorAll('textarea').forEach(t => {
                t.style.height = 'auto';
                t.style.height = (t.scrollHeight) + 'px';
            });
        }, 10);
    }

    function exportDataFromEditor() {
        if (!currentLoadedSchemaKey) return;
        const id = dom.editModelIdInput.value.trim().toUpperCase();
        if (!id) return alert("Falta Model ID.");
        const formData = new FormData(dom.editorForm);
        const attrs = {};
        for (const [k, v] of formData.entries()) {
            if (v.trim()) attrs[k] = v.trim();
        }
        generateAndDownloadProductFile({
            model: id,
            schema_key: currentLoadedSchemaKey,
            attributes: attrs
        }, id);
        alert("JSON Generado.");
    }

    function generateAndDownloadProductFile(obj, name) {
        downloadFile(`${name}.json`, JSON.stringify(obj, null, 4), 'application/json;charset=utf-8');
    }
    function downloadFile(name, content, mime) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([content], { type: mime }));
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // --- Editor Esquema ---
    function loadSchemaIntoEditor(key, schema) {
        dom.schemaTitle.textContent = `Editando: ${key}`;
        dom.editSchemaKeyInput.value = key;
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(el => el.remove());
        dom.schemaEditorPlaceholder.style.display = 'none';
        dom.addGroupBtn.disabled = false;
        schema.forEach(g => addGroupToEditor(g));
    }

    function addGroupToEditor(group = null) {
        const div = document.createElement('div');
        div.className = 'schema-group-box';
        const gName = group ? group.group : '';
        div.innerHTML = `
            <div class="schema-group-header">
                <div class="control-group flex-grow">
                    <label class="futuristic-label">Grupo:</label>
                    <input type="text" class="futuristic-input w-full" data-type="group-name" value="${gName}" placeholder="NOMBRE GRUPO">
                </div>
                <button class="schema-action-btn schema-add-attr-btn">+ Attr</button>
                <button class="schema-action-btn schema-remove-btn schema-remove-group-btn">Eliminar</button>
            </div>
            <div class="schema-attributes-container"></div>
        `;
        const container = div.querySelector('.schema-attributes-container');
        if (group && group.attrs) group.attrs.forEach(a => addAttributeToGroup(a, container));
        dom.schemaEditorForm.appendChild(div);
    }

    function addAttributeToGroup(attr, container) {
        const div = document.createElement('div');
        div.className = 'schema-attr-row';
        const c = attr ? attr.code : '';
        const d = attr ? attr.desc : '';
        div.innerHTML = `
            <input type="text" class="futuristic-input" data-type="attr-code" value="${c}" placeholder="codigo_variable">
            <input type="text" class="futuristic-input" data-type="attr-desc" value="${d}" placeholder="Descripción legible">
            <button class="schema-action-btn schema-remove-btn schema-remove-attr-btn">✕</button>
        `;
        container.appendChild(div);
    }

    function handleSchemaEditorClicks(e) {
        if (e.target.closest('.schema-add-attr-btn')) {
            e.preventDefault();
            addAttributeToGroup(null, e.target.closest('.schema-group-box').querySelector('.schema-attributes-container'));
        } else if (e.target.closest('.schema-remove-attr-btn')) {
            e.preventDefault();
            e.target.closest('.schema-attr-row').remove();
        } else if (e.target.closest('.schema-remove-group-btn')) {
            e.preventDefault();
            if (confirm("¿Eliminar grupo?")) e.target.closest('.schema-group-box').remove();
        }
    }

    function handleSchemaExportClick() {
        const key = dom.editSchemaKeyInput.value.trim().toLowerCase();
        if (!key) return alert("Falta Schema Key.");
        const newSchema = [];
        let valid = true;
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
        if (newSchema.length === 0 && !confirm("Esquema vacío. ¿Guardar?")) return;
        const varName = `${key.toUpperCase()}_SCHEMA_GROUPS`;
        const content = `/**\n * Schema: ${key}\n */\n\nconst ${varName} = ${JSON.stringify(newSchema, null, 4)};\n\nif (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {\n    window.APP_DB.registerSchema('${key}', ${varName});\n}\n`;
        downloadFile(`modulo${key.charAt(0).toUpperCase() + key.slice(1)}.js`, content, 'text/javascript;charset=utf-8');
        alert("Archivo JS Generado.");
    }

    initialize();
});