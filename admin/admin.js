/**
 * Pokedex Drive Admin v3.5 - Logic Core
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES GLOBALES ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null; 
    let currentActivePanel = 'general';
    let isLightMode = false;

    // Paletas HSL (Portadas de main.js para compatibilidad visual)
    const darkPaletteHSL = { accent: { h: 188, s: 96, l: 41 }, dark: { h: 210, s: 29, l: 8 }, medium: { h: 210, s: 19, l: 11 }, border: { h: 210, s: 16, l: 15 }, textP: { h: 210, s: 29, l: 92 }, textS: { h: 210, s: 12, l: 67 } };
    const lightPaletteHSL = { accent: { h: 188, s: 86, l: 40 }, dark: { h: 210, s: 20, l: 98 }, medium: { h: 210, s: 19, l: 94 }, border: { h: 210, s: 16, l: 85 }, textP: { h: 210, s: 29, l: 10 }, textS: { h: 210, s: 12, l: 40 } };

    // --- REFERENCIAS DOM ---
    const dom = {
        homeBtn: document.getElementById('home-btn'),
        // Header Controls
        btnSaveMemory: document.getElementById('btn-save-memory'),
        btnExportFile: document.getElementById('btn-export-file'),
        editorControls: document.getElementById('editor-controls'),
        
        // Modals & Settings
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
        csvTextBtn: document.getElementById('csv-text-btn'),
        csvTextInput: document.getElementById('csv-text-input'),

        // Panels
        allContentPanels: document.querySelectorAll('.content-panel'),
        navCardButtons: document.querySelectorAll('.nav-card[data-panel]'),
        
        // Model Editor Elements
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        createModelSchemaSelect: document.getElementById('create-model-schema-select'),
        createModelIdInput: document.getElementById('create-model-id'),
        createModelBtn: document.getElementById('create-model-btn'),
        editModelIdInput: document.getElementById('edit-model-id'),
        editSchemaKeyDisplay: document.getElementById('edit-schema-key-display'),
        productTitle: document.getElementById('product-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),

        // Schema Editor Elements
        schemaResultsList: document.getElementById('schema-results-list'),
        newSchemaKeyInput: document.getElementById('new-schema-key'),
        createSchemaBtn: document.getElementById('create-schema-btn'),
        editSchemaKeyInput: document.getElementById('edit-schema-key'),
        schemaEditorForm: document.getElementById('schema-editor-form'),
        addGroupBtn: document.getElementById('add-group-btn'),

        // Export Elements
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list'),
        exportGamaJsonButton: document.getElementById('export-gama-json-btn'),
        exportGamaCsvButton: document.getElementById('export-gama-csv-btn'),

        // Drive Builder Elements
        driveTriggerBtn: document.getElementById('drive-builder-trigger'),
        driveModal: document.getElementById('drive-modal'),
        driveCloseBtn: document.getElementById('drive-close-btn'),
        driveProgressFill: document.getElementById('drive-progress-fill'),
        drivePercentText: document.getElementById('drive-percent-text'),
        driveConsole: document.getElementById('drive-log-console'),
        driveActionArea: document.getElementById('drive-action-area'),
        driveDownloadBtn: document.getElementById('drive-download-final-btn')
    };

    // --- INICIALIZACIÓN ---
    function initialize() {
        // Carga de Tema Inicial
        const savedMode = localStorage.getItem('admin-theme-mode');
        isLightMode = (savedMode === 'light');
        randomizeTheme(); // Usar función random real

        // Pequeño delay para asegurar que el Bootloader HTML ha llenado APP_DB
        setTimeout(() => {
            if (window.APP_DB) {
                masterDatabase = window.APP_DB.products || [];
                masterSchemaMap = window.APP_DB.schemas || [];
                console.log(`Admin Init: ${masterDatabase.length} modelos, ${Object.keys(masterSchemaMap).length} gamas.`);
            } else {
                console.error("APP_DB no definido.");
            }
            
            setupEventListeners();
            refreshUI();
            showPanel('general');
        }, 100);
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Navegación
        dom.homeBtn.addEventListener('click', () => showPanel('general'));
        dom.navCardButtons.forEach(btn => {
            btn.addEventListener('click', () => showPanel(btn.dataset.panel));
        });

        // Header Actions
        dom.btnSaveMemory.addEventListener('click', handleMemorySave);
        dom.btnExportFile.addEventListener('click', handleExportFile);
        dom.settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); dom.settingsMenu.style.display = dom.settingsMenu.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', (e) => { if (dom.settingsMenu) dom.settingsMenu.style.display = 'none'; });

        // Modals
        dom.libraryBtn.addEventListener('click', openLibraryModal);
        dom.themeBtn.addEventListener('click', (e) => { e.stopPropagation(); isLightMode = !isLightMode; localStorage.setItem('admin-theme-mode', isLightMode?'light':'dark'); randomizeTheme(); });
        dom.infoBtn.addEventListener('click', () => { dom.infoModal.style.display = 'block'; dom.modalOverlay.style.display = 'block'; });
        dom.closeInfoModalBtn.addEventListener('click', hideAllModals);
        dom.libraryCloseBtn.addEventListener('click', hideAllModals);
        dom.modalOverlay.addEventListener('click', hideAllModals);
        dom.driveCloseBtn.addEventListener('click', hideAllModals);
        dom.csvTextBtn.addEventListener('click', handleCsvImport);

        // Model Hub
        dom.modelSearchInput.addEventListener('input', updateSearchResults);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.createModelBtn.addEventListener('click', createNewModel);

        // Schema Hub
        dom.schemaResultsList.addEventListener('click', handleSchemaLoad);
        dom.createSchemaBtn.addEventListener('click', createNewSchema);
        dom.addGroupBtn.addEventListener('click', () => addGroupToSchemaEditor());
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorEvents);

        // Export
        dom.gamaExportSelect.addEventListener('change', updateExportList);
        dom.exportGamaJsonButton.addEventListener('click', exportFullGamaJson);
        dom.exportGamaCsvButton.addEventListener('click', exportFullGamaCsv);

        // Drive Builder (Metaconstructor)
        dom.driveTriggerBtn.addEventListener('click', startDriveBuild);
        dom.driveDownloadBtn.addEventListener('click', downloadCompiledDrive);
    }

    function refreshUI() {
        updateSearchResults();
        updateSchemaLists();
        if(dom.libraryModal.style.display === 'block') renderLibraryList();
    }

    // --- LÓGICA DE TEMA (PORTADA DE MAIN.JS) ---
    function randomizeTheme() {
        const hue = Math.floor(Math.random() * 360);
        const palette = isLightMode ? lightPaletteHSL : darkPaletteHSL;
        updatePaletteCSS(palette, hue);
    }

    function updatePaletteCSS(p, accentHue) {
        const accentRGB = hslToRgb(accentHue, p.accent.s, p.accent.l);
        const root = document.documentElement;
        
        // Mapeo exacto de variables CSS
        root.style.setProperty('--color-cyan-accent', `hsl(${accentHue}, ${p.accent.s}%, ${p.accent.l}%)`);
        root.style.setProperty('--color-cyan-glow', `rgba(${accentRGB.r}, ${accentRGB.g}, ${accentRGB.b}, 0.25)`);
        root.style.setProperty('--color-green-accent', `hsl(${(accentHue + 120) % 360}, 80%, 45%)`);
        
        // Fondos (hue shift ligero)
        const bgHue = (accentHue + 200) % 360; 
        root.style.setProperty('--color-bg-dark', `hsl(${bgHue}, ${p.dark.s}%, ${p.dark.l}%)`);
        root.style.setProperty('--color-bg-medium', `hsl(${bgHue}, ${p.medium.s}%, ${p.medium.l}%)`);
        root.style.setProperty('--color-border', `hsl(${bgHue}, ${p.border.s}%, ${p.border.l}%)`);
        root.style.setProperty('--color-text-primary', `hsl(${bgHue}, ${p.textP.s}%, ${p.textP.l}%)`);
        root.style.setProperty('--color-text-secondary', `hsl(${bgHue}, ${p.textS.s}%, ${p.textS.l}%)`);

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


    // --- GESTIÓN DE PANELES ---
    function showPanel(id) {
        currentActivePanel = id;
        dom.allContentPanels.forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${id}`).classList.add('active');
        
        // Mostrar botones de edición solo si es necesario
        if (id === 'edit-model' || id === 'edit-schema') {
            document.body.classList.add('fullscreen-editor-active');
            dom.editorControls.style.display = 'flex';
        } else {
            document.body.classList.remove('fullscreen-editor-active');
            dom.editorControls.style.display = 'none';
        }
    }

    function hideAllModals() {
        dom.infoModal.style.display = 'none';
        dom.libraryModal.style.display = 'none';
        dom.driveModal.style.display = 'none';
        dom.modalOverlay.style.display = 'none';
    }

    // --- LÓGICA DE EDITORES (MEMORY FIRST) ---

    // 1. Guardar en Memoria (RAM)
    function handleMemorySave() {
        // Animación click
        dom.btnSaveMemory.style.transform = "scale(0.9)";
        setTimeout(() => dom.btnSaveMemory.style.transform = "scale(1)", 150);

        if (currentActivePanel === 'edit-model') {
            const id = dom.editModelIdInput.value;
            const schemaKey = dom.editSchemaKeyDisplay.value;
            if (!id) return;

            // Recolectar datos
            const formData = new FormData(dom.editorForm);
            const attributes = {};
            for (const [key, value] of formData.entries()) {
                if(value.trim()) attributes[key] = value.trim();
            }

            // Actualizar Array Principal
            const idx = masterDatabase.findIndex(p => p.model === id);
            const newObj = { model: id, schema_key: schemaKey, attributes: attributes };
            
            if (idx >= 0) masterDatabase[idx] = newObj;
            else masterDatabase.push(newObj);

            alert(`Modelo ${id} actualizado en RAM.`);
        } 
        else if (currentActivePanel === 'edit-schema') {
            const key = dom.editSchemaKeyInput.value;
            const structure = buildSchemaFromDOM();
            if (!structure) return;

            masterSchemaMap[key] = structure;
            alert(`Esquema ${key} actualizado en RAM.`);
        }
        refreshUI();
    }

    // 2. Exportar Archivo
    function handleExportFile() {
        if (currentActivePanel === 'edit-model') {
            const id = dom.editModelIdInput.value;
            const product = masterDatabase.find(p => p.model === id);
            if (product) downloadFile(`${id}.json`, JSON.stringify(product, null, 4), 'application/json');
            else alert("Guarda en memoria primero.");
        } 
        else if (currentActivePanel === 'edit-schema') {
            const key = dom.editSchemaKeyInput.value;
            const structure = masterSchemaMap[key];
            if (structure) {
                const content = `window.APP_DB.registerSchema('${key}', ${JSON.stringify(structure, null, 4)});`;
                downloadFile(`schema_${key}.js`, content, 'text/javascript');
            }
        }
    }


    // --- MODEL HUB ---
    function updateSearchResults() {
        const q = dom.modelSearchInput.value.toLowerCase();
        dom.modelSearchResults.innerHTML = '';
        
        const filtered = masterDatabase.filter(p => p.model.toLowerCase().includes(q));
        if (filtered.length === 0) {
            dom.modelSearchResults.innerHTML = '<div class="list-item" style="cursor:default">Sin resultados</div>';
            return;
        }

        const frag = document.createDocumentFragment();
        filtered.forEach(p => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `<strong>${p.model}</strong> <span style="font-size:0.8em; opacity:0.7">(${p.schema_key})</span>`;
            div.dataset.model = p.model;
            frag.appendChild(div);
        });
        dom.modelSearchResults.appendChild(frag);
    }

    function handleResultClick(e) {
        const item = e.target.closest('.list-item');
        if (!item || !item.dataset.model) return;
        loadModelEditor(item.dataset.model);
    }

    function createNewModel() {
        const schema = dom.createModelSchemaSelect.value;
        const id = dom.createModelIdInput.value.trim().toUpperCase();
        if(!schema || !id) return alert("Faltan datos");
        
        if (masterDatabase.find(p => p.model === id)) {
            if(!confirm("Ya existe. ¿Editar?")) return;
        } else {
            // Crear entrada vacía temporal
            masterDatabase.push({ model: id, schema_key: schema, attributes: {} });
        }
        loadModelEditor(id);
    }

    function loadModelEditor(modelId) {
        const product = masterDatabase.find(p => p.model === modelId);
        if (!product) return;

        currentLoadedSchemaKey = product.schema_key;
        dom.productTitle.textContent = `Editando: ${product.model}`;
        dom.editModelIdInput.value = product.model;
        dom.editSchemaKeyDisplay.value = product.schema_key;
        
        // Limpiar form
        dom.editorPlaceholder.style.display = 'none';
        dom.editorForm.querySelectorAll('.form-group-title, .form-row').forEach(e => e.remove());

        // Generar campos basados en Schema
        const schema = masterSchemaMap[product.schema_key];
        if (!schema) return alert("Esquema no encontrado para este modelo.");

        schema.forEach(group => {
            const h3 = document.createElement('h3');
            h3.className = 'form-group-title';
            h3.textContent = group.group;
            dom.editorForm.appendChild(h3);

            group.attrs.forEach(attr => {
                const row = document.createElement('div');
                row.className = 'form-row';
                const label = document.createElement('label');
                label.className = 'futuristic-label';
                label.textContent = attr.desc;
                
                const textarea = document.createElement('textarea');
                textarea.className = 'futuristic-textarea';
                textarea.name = attr.code;
                textarea.value = product.attributes[attr.code] || '';
                textarea.rows = 1;

                row.append(label, textarea);
                dom.editorForm.appendChild(row);
            });
        });

        showPanel('edit-model');
    }

    // --- SCHEMA HUB ---
    function updateSchemaLists() {
        const keys = Object.keys(masterSchemaMap);
        dom.schemaResultsList.innerHTML = '';
        dom.createModelSchemaSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
        dom.gamaExportSelect.innerHTML = '<option value="">-- Seleccionar --</option>';

        keys.forEach(k => {
            // Lista lateral
            const div = document.createElement('div');
            div.className = 'list-item';
            div.textContent = k;
            div.dataset.key = k;
            dom.schemaResultsList.appendChild(div);

            // Selects
            const opt1 = document.createElement('option'); opt1.value = k; opt1.textContent = k;
            dom.createModelSchemaSelect.appendChild(opt1);
            
            const opt2 = document.createElement('option'); opt2.value = k; opt2.textContent = k;
            dom.gamaExportSelect.appendChild(opt2);
        });
    }

    function handleSchemaLoad(e) {
        const item = e.target.closest('.list-item');
        if(!item) return;
        loadSchemaEditor(item.dataset.key);
    }

    function createNewSchema() {
        const key = dom.newSchemaKeyInput.value.trim().toLowerCase();
        if(!key) return;
        if(!masterSchemaMap[key]) masterSchemaMap[key] = [];
        loadSchemaEditor(key);
    }

    function loadSchemaEditor(key) {
        const schema = masterSchemaMap[key];
        dom.editSchemaKeyInput.value = key;
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(e => e.remove());
        
        schema.forEach(g => addGroupToSchemaEditor(g));
        showPanel('edit-schema');
    }

    function addGroupToSchemaEditor(groupData = null) {
        const div = document.createElement('div');
        div.className = 'schema-group-box';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <input type="text" class="futuristic-input" placeholder="Nombre Grupo" value="${groupData ? groupData.group : ''}" data-role="group-name">
                <button class="schema-action-btn schema-remove-btn" onclick="this.closest('.schema-group-box').remove()">Eliminar Grupo</button>
            </div>
            <div class="attrs-container"></div>
            <button class="schema-action-btn" data-role="add-attr" style="margin-left:0; margin-top:0.5rem; border-color:var(--color-green-accent); color:var(--color-green-accent);">+ Atributo</button>
        `;
        
        const container = div.querySelector('.attrs-container');
        if(groupData) groupData.attrs.forEach(a => addAttrRow(container, a));

        dom.schemaEditorForm.appendChild(div);
    }

    function addAttrRow(container, attrData = null) {
        const row = document.createElement('div');
        row.className = 'schema-attr-row';
        row.innerHTML = `
            <input type="text" class="futuristic-input" placeholder="Código (id)" value="${attrData ? attrData.code : ''}" data-role="attr-code">
            <input type="text" class="futuristic-input" placeholder="Etiqueta Visible" value="${attrData ? attrData.desc : ''}" data-role="attr-desc">
            <button class="schema-action-btn schema-remove-btn" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(row);
    }

    function handleSchemaEditorEvents(e) {
        if (e.target.dataset.role === 'add-attr') {
            e.preventDefault();
            addAttrRow(e.target.previousElementSibling);
        }
    }

    function buildSchemaFromDOM() {
        const groups = [];
        let valid = true;
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(box => {
            const gName = box.querySelector('[data-role="group-name"]').value.trim();
            if(!gName) { valid = false; return; }
            
            const attrs = [];
            box.querySelectorAll('.schema-attr-row').forEach(row => {
                const c = row.querySelector('[data-role="attr-code"]').value.trim();
                const d = row.querySelector('[data-role="attr-desc"]').value.trim();
                if(c && d) attrs.push({ code: c, desc: d });
            });
            groups.push({ group: gName, attrs: attrs });
        });
        if(!valid) alert("Hay grupos sin nombre.");
        return valid ? groups : null;
    }

    // --- LIBRARY & CSV IMPORT ---
    function openLibraryModal() {
        renderLibraryList();
        dom.libraryModal.style.display = 'block';
        dom.modalOverlay.style.display = 'block';
    }

    function renderLibraryList() {
        dom.libraryGamaList.innerHTML = '';
        Object.keys(masterSchemaMap).forEach(k => {
            const count = masterDatabase.filter(p => p.schema_key === k).length;
            const div = document.createElement('div');
            div.className = 'gama-toggle-item';
            div.innerHTML = `<span>${k}</span> <span>${count} modelos</span>`;
            dom.libraryGamaList.appendChild(div);
        });
    }

    function handleCsvImport() {
        const text = dom.csvTextInput.value.trim();
        if(!text) return;
        
        try {
            // Parser simplificado para Demo (Formato Admin: Schema;Key;Desc \n Rows)
            const lines = text.split('\n');
            const header = lines[0].split(';');
            const schemaKey = header[0].toLowerCase().trim();
            
            if(!schemaKey) throw new Error("Cabecera inválida");

            // Crear esquema dummy si no existe
            if(!masterSchemaMap[schemaKey]) {
                masterSchemaMap[schemaKey] = [{ group: "Importado", attrs: header.slice(2).map(h => ({code: h, desc: h})) }];
            }

            let added = 0;
            for(let i=3; i<lines.length; i++) {
                const cols = lines[i].split(';');
                if(cols.length < 2) continue;
                const model = cols[1];
                const attrs = {};
                // Mapeo básico posicional
                header.slice(2).forEach((h, idx) => {
                    if(cols[idx+2]) attrs[h] = cols[idx+2].trim();
                });
                masterDatabase.push({ model: model, schema_key: schemaKey, attributes: attrs });
                added++;
            }
            alert(`Importados ${added} modelos a ${schemaKey}`);
            refreshUI();
            dom.csvTextInput.value = '';
        } catch(e) {
            alert("Error formato CSV: " + e.message);
        }
    }


    // --- EXPORT TOOLS ---
    function updateExportList() {
        const s = dom.gamaExportSelect.value;
        dom.gamaExportList.innerHTML = '';
        if(!s) return;
        
        const prods = masterDatabase.filter(p => p.schema_key === s);
        prods.forEach(p => {
            const div = document.createElement('div');
            div.className = 'gama-toggle-item';
            div.innerHTML = `${p.model}`;
            dom.gamaExportList.appendChild(div);
        });
    }

    function exportFullGamaJson() {
        const s = dom.gamaExportSelect.value;
        if(!s) return;
        const data = masterDatabase.filter(p => p.schema_key === s);
        downloadFile(`GAMA_${s}.json`, JSON.stringify(data, null, 4), 'application/json');
    }

    function exportFullGamaCsv() {
        alert("Función CSV completa disponible en versión Pro. Usando JSON por defecto.");
    }

    function downloadFile(name, content, mime) {
        const blob = new Blob([content], {type: mime});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // --- POXKEDEX DRIVE META-CONSTRUCTOR (INTEGRADO) ---
    let compiledBlob = null;

    function startDriveBuild() {
        dom.driveModal.style.display = 'block';
        dom.modalOverlay.style.display = 'block';
        dom.driveActionArea.style.display = 'none';
        dom.driveProgressFill.style.width = '0%';
        dom.driveConsole.innerHTML = '<div class="log-line">> Iniciando Pokedex Drive Engine...</div>';

        // Simulación de proceso de compilación
        const steps = [
            { pct: 10, msg: "Analizando RAM Database..." },
            { pct: 30, msg: `Empaquetando ${masterDatabase.length} modelos...` },
            { pct: 50, msg: "Generando Bootloader Offline..." },
            { pct: 80, msg: "Inyectando Assets CSS/JS..." },
            { pct: 100, msg: "Finalizando compilación." }
        ];

        let currentStep = 0;
        
        function nextStep() {
            if (currentStep >= steps.length) {
                // Generar Blob Real
                const htmlContent = generateOfflineHTML();
                compiledBlob = new Blob([htmlContent], {type: 'text/html'});
                
                dom.driveActionArea.style.display = 'block';
                return;
            }
            
            const s = steps[currentStep];
            dom.driveProgressFill.style.width = s.pct + '%';
            dom.drivePercentText.textContent = s.pct + '%';
            dom.driveConsole.innerHTML += `<div class="log-line">> ${s.msg}</div>`;
            dom.driveConsole.scrollTop = dom.driveConsole.scrollHeight;
            
            currentStep++;
            setTimeout(nextStep, 600); // Delay artificial para efecto
        }
        nextStep();
    }

    function downloadCompiledDrive() {
        if(compiledBlob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(compiledBlob);
            a.download = 'pokedex_drive_offline.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    function generateOfflineHTML() {
        // Generador simple para la demo
        return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pokedex Drive Offline</title>
<style>body{background:#111;color:#eee;font-family:sans-serif;padding:2rem;text-align:center}</style>
</head>
<body>
<h1>Pokedex Drive</h1>
<p>Generado con ${masterDatabase.length} modelos.</p>
<textarea style="width:100%;height:300px">${JSON.stringify(masterDatabase)}</textarea>
</body>
</html>`;
    }

    initialize();
});