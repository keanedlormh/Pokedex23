/*
 * Lógica del Panel de Administración v3.2.0
 * [CAMBIO v3.2.0] Implementación de "Crear Nuevo Modelo desde Gama"
 */

// window.APP_DB se define en admin/index.html

document.addEventListener('DOMContentLoaded', () => {

    // --- Almacenamiento de Elementos del DOM ---
    const dom = {
        // Globales
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

        // Panel General
        panelGeneral: document.getElementById('panel-general'),
        navCardButtons: document.querySelectorAll('.nav-card'),

        // Panel Hub: Modelo
        panelModelHub: document.getElementById('panel-model-hub'),
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        createModelList: document.getElementById('create-model-list'), // [NUEVO v3.2.0]

        // Panel Hub: Esquema
        panelSchemaHub: document.getElementById('panel-schema-hub'),
        schemaResultsList: document.getElementById('schema-results-list'),
        newSchemaKeyInput: document.getElementById('new-schema-key'),
        createSchemaBtn: document.getElementById('create-schema-btn'),

        // Panel Editor: Modelo
        panelEditModel: document.getElementById('panel-edit-model'),
        productTitle: document.getElementById('product-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),
        editModelIdInput: document.getElementById('edit-model-id'),
        editSchemaKeyDisplay: document.getElementById('edit-schema-key-display'),

        // Panel Editor: Esquema
        panelEditSchema: document.getElementById('panel-edit-schema'),
        schemaTitle: document.getElementById('schema-title'),
        schemaEditorForm: document.getElementById('schema-editor-form'),
        schemaEditorPlaceholder: document.getElementById('schema-editor-placeholder'),
        editSchemaKeyInput: document.getElementById('edit-schema-key'),
        addGroupBtn: document.getElementById('add-group-btn'),

        // Panel Exportar Gama
        panelExportGama: document.getElementById('panel-export-gama'),
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list'),
        exportGamaJsonButton: document.getElementById('export-gama-json-btn')
    };

    // --- Estado Local ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null; 
    let currentActivePanel = 'general'; 
    let isCreatingNewModel = false; // [NUEVO v3.2.0] Flag de estado


    // --- Inicialización ---
    function initialize() {
        console.log("Admin Panel v3.2.0 inicializando..."); 
        applyInitialTheme(); 

        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;

            if (masterDatabase.length === 0) console.warn("La base de datos está vacía.");
            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));

            setupEventListeners();

            // Rellenar listas
            renderSearchResults(masterDatabase);
            populateSchemaList(); 
            populateGamaSelector(); 
            
            // [NUEVO v3.2.0] Rellenar la lista de creación
            renderCreateNewOptions();

            showPanel('general');

            console.log(`Admin DB cargada. Productos: ${masterDatabase.length}, Esquemas: ${Object.keys(masterSchemaMap).length}`);
            dom.exportGamaJsonButton.disabled = true;
            dom.addGroupBtn.disabled = true; 
        }, 100);
    }

    function setupEventListeners() {
        // Nav
        dom.homeBtn.addEventListener('click', () => showPanel('general'));
        dom.saveBtn.addEventListener('click', handleSaveClick);

        // Ajustes
        dom.settingsBtn.addEventListener('click', toggleSettingsMenu);
        dom.themeBtn.addEventListener('click', toggleTheme); 
        dom.infoBtn.addEventListener('click', showInfoModal);
        dom.closeInfoModalBtn.addEventListener('click', hideInfoModal);
        dom.modalOverlay.addEventListener('click', hideInfoModal);

        document.addEventListener('click', (e) => {
            if (dom.settingsMenu && dom.settingsBtn) {
                 if (dom.settingsMenu.style.display === 'block' && 
                    !dom.settingsMenu.contains(e.target) && 
                    !dom.settingsBtn.contains(e.target)) {
                    dom.settingsMenu.style.display = 'none';
                }
            }
        });

        // Panel General
        dom.navCardButtons.forEach(card => {
            card.addEventListener('click', () => showPanel(card.dataset.panel));
        });

        // Panel Hub Modelo
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        // [NUEVO v3.2.0] Listener para la lista de creación
        dom.createModelList.addEventListener('click', handleCreateNewClick);

        // Panel Hub Esquema
        dom.schemaResultsList.addEventListener('click', handleSchemaLoadClick);
        dom.createSchemaBtn.addEventListener('click', handleSchemaCreateClick);

        // Editores
        dom.addGroupBtn.addEventListener('click', () => addGroupToEditor());
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorClicks);

        // Exportar Gama
        dom.gamaExportSelect.addEventListener('change', populateGamaExportList);
        dom.gamaExportList.addEventListener('click', handleGamaExportClick);
        dom.exportGamaJsonButton.addEventListener('click', exportGamaAsJson); 
    }


    // --- Gestión de Paneles y UI ---

    function handleSaveClick() {
        if (currentActivePanel === 'edit-model') {
            exportDataFromEditor();
        } else if (currentActivePanel === 'edit-schema') {
            handleSchemaExportClick();
        }
    }

    function showPanel(panelId) {
        currentActivePanel = panelId;
        dom.allContentPanels.forEach(panel => panel.classList.remove('active'));
        document.body.classList.remove('fullscreen-editor-active');
        dom.saveBtn.style.display = 'none';
        if (dom.settingsMenu) dom.settingsMenu.style.display = 'none';

        const panelToShow = document.getElementById(`panel-${panelId}`);
        if (panelToShow) panelToShow.classList.add('active');

        if (panelId === 'edit-model' || panelId === 'edit-schema') {
            document.body.classList.add('fullscreen-editor-active');
            dom.saveBtn.style.display = 'block';
            
            // [NUEVO v3.2.0] Texto dinámico del botón
            dom.saveBtn.textContent = (panelId === 'edit-model') ? "Exportar .json" : "Guardar .js";
        }
    }

    // Ajustes y Temas
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
    function applyInitialTheme() {
        const savedMode = localStorage.getItem('admin-theme-mode');
        if (savedMode === 'light') document.documentElement.classList.add('light-mode');
        else document.documentElement.classList.remove('light-mode');
    }
    function toggleTheme() {
        const htmlElement = document.documentElement;
        if (htmlElement.classList.contains('light-mode')) {
            htmlElement.classList.remove('light-mode');
            localStorage.setItem('admin-theme-mode', 'dark');
        } else {
            htmlElement.classList.add('light-mode');
            localStorage.setItem('admin-theme-mode', 'light');
        }
        dom.settingsMenu.style.display = 'none';
    }


    // --- Lógica Hub Modelo (Buscar y CREAR) ---

    function applySearch() {
        const textQuery = dom.modelSearchInput.value.toLowerCase().trim();
        const filteredProducts = (textQuery === "") ?
            masterDatabase :
            masterDatabase.filter(p => p.model.toLowerCase().includes(textQuery));
        renderSearchResults(filteredProducts);
    }

    function renderSearchResults(results) {
        dom.modelSearchResults.innerHTML = '';
        if (results.length === 0) {
            dom.modelSearchResults.innerHTML = '<div class="list-item" style="cursor: default;">No se encontraron resultados.</div>';
            return;
        }
        const fragment = document.createDocumentFragment();
        results.forEach(product => {
            const item = document.createElement('div');
            item.className = 'list-item'; 
            item.dataset.model = product.model;
            item.innerHTML = `
                <span style="font-weight: 600;">${product.model}</span>
                <span style="font-size: 0.7rem; opacity: 0.7; margin-left: 5px;">(${product.schema_key})</span>
            `;
            fragment.appendChild(item);
        });
        dom.modelSearchResults.appendChild(fragment);
    }

    function handleResultClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;
        const model = target.dataset.model;
        const product = masterDatabase.find(p => p.model === model);
        if (product) {
            isCreatingNewModel = false; // Estamos editando
            loadModelIntoEditor(product);
            showPanel('edit-model');
        }
    }

    // [NUEVO v3.2.0] Renderiza los botones de gamas en la sección "Crear Nuevo"
    function renderCreateNewOptions() {
        dom.createModelList.innerHTML = '';
        const keys = Object.keys(masterSchemaMap);
        
        if (keys.length === 0) {
            dom.createModelList.innerHTML = '<p class="text-gray-400 text-sm">No hay esquemas cargados.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        keys.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'schema-select-card';
            btn.dataset.schemaKey = key;
            
            // Icono decorativo basado en clave (opcional)
            let icon = '📦';
            if (key.includes('tv')) icon = '📺';
            if (key.includes('sound')) icon = '🔊';
            
            btn.innerHTML = `
                <span class="schema-icon">${icon}</span>
                <span class="schema-name">${key.toUpperCase()}</span>
            `;
            fragment.appendChild(btn);
        });
        dom.createModelList.appendChild(fragment);
    }

    // [NUEVO v3.2.0] Maneja el clic en "Crear Nuevo desde Gama"
    function handleCreateNewClick(e) {
        const target = e.target.closest('.schema-select-card');
        if (!target) return;

        const schemaKey = target.dataset.schemaKey;
        if (schemaKey) {
            createNewModelFromSchema(schemaKey);
        }
    }

    // [NUEVO v3.2.0] Genera el modelo en blanco en memoria
    function createNewModelFromSchema(schemaKey) {
        const schemaGroups = masterSchemaMap[schemaKey];
        if (!schemaGroups) return;

        // Generar atributos vacíos
        const blankAttributes = {};
        schemaGroups.forEach(group => {
            if (group.attrs) {
                group.attrs.forEach(attr => {
                    blankAttributes[attr.code] = "";
                });
            }
        });

        // Crear objeto modelo "dummy"
        const blankModel = {
            model: "", // Vacío para que el usuario lo rellene
            schema_key: schemaKey,
            attributes: blankAttributes
        };

        isCreatingNewModel = true;
        loadModelIntoEditor(blankModel);
        showPanel('edit-model');

        // Enfocar el input de nombre para que el usuario sepa que debe escribirlo
        setTimeout(() => {
            dom.editModelIdInput.focus();
            // Visual feedback opcional
            dom.productTitle.textContent = "Creando Nuevo Modelo";
        }, 100);
    }


    // --- Lógica Hub Esquema ---

    function populateSchemaList() {
        if (!dom.schemaResultsList) return;
        dom.schemaResultsList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        Object.keys(masterSchemaMap).forEach(key => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.dataset.schemaKey = key;
            item.innerHTML = `<span style="font-weight: 600;">${key}</span>`;
            fragment.appendChild(item);
        });
        dom.schemaResultsList.appendChild(fragment);
    }

    function handleSchemaLoadClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;
        const schemaKey = target.dataset.schemaKey;
        const schemaToLoad = JSON.parse(JSON.stringify(masterSchemaMap[schemaKey]));
        loadSchemaIntoEditor(schemaKey, schemaToLoad);
        showPanel('edit-schema');
    }

    function handleSchemaCreateClick() {
        const newKey = dom.newSchemaKeyInput.value.trim().toLowerCase();
        if (!newKey) { alert("Introduce una clave."); return; }
        if (masterSchemaMap[newKey]) {
            if (!confirm("El esquema ya existe. ¿Sobrescribir?")) return;
            loadSchemaIntoEditor(newKey, JSON.parse(JSON.stringify(masterSchemaMap[newKey])));
        } else {
            loadSchemaIntoEditor(newKey, []);
        }
        dom.newSchemaKeyInput.value = '';
        showPanel('edit-schema');
    }


    // --- Lógica Exportar Gama ---

    function populateGamaSelector() {
        if (!dom.gamaExportSelect) return;
        dom.gamaExportSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
        Object.keys(masterSchemaMap).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.toUpperCase();
            dom.gamaExportSelect.appendChild(option);
        });
    }

    function populateGamaExportList() {
        const selectedSchema = dom.gamaExportSelect.value;
        dom.gamaExportList.innerHTML = '';
        if (!selectedSchema) { dom.exportGamaJsonButton.disabled = true; return; }
        
        dom.exportGamaJsonButton.disabled = false;
        const modelsInGama = masterDatabase.filter(p => p.schema_key === selectedSchema);
        
        if (modelsInGama.length === 0) {
            dom.gamaExportList.innerHTML = '<p class="text-gray-400 p-2">No hay modelos.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        modelsInGama.forEach(product => {
            const item = document.createElement('div');
            item.className = 'gama-export-item';
            item.innerHTML = `<span>${product.model}</span><button class="export-item-button" data-model="${product.model}">Descargar .json</button>`;
            fragment.appendChild(item);
        });
        dom.gamaExportList.appendChild(fragment);
    }

    function handleGamaExportClick(e) {
        const target = e.target.closest('.export-item-button');
        if (!target) return;
        const product = masterDatabase.find(p => p.model === target.dataset.model);
        if (product) generateAndDownloadProductFile(product, product.model);
    }

    function exportGamaAsJson() {
        const selectedSchema = dom.gamaExportSelect.value;
        if (!selectedSchema) return;
        const products = masterDatabase.filter(p => p.schema_key === selectedSchema);
        downloadFile(`GAMA_${selectedSchema.toUpperCase()}.json`, JSON.stringify(products, null, 4), 'application/json');
    }


    // --- Lógica Editor Modelo ---

    function loadModelIntoEditor(product) {
        currentLoadedSchemaKey = product.schema_key;
        const schema = masterSchemaMap[product.schema_key];

        // UI Header
        dom.productTitle.textContent = product.model ? `Editando: ${product.model}` : `Creando Nuevo Modelo (${product.schema_key})`;
        dom.editModelIdInput.value = product.model || ""; // Puede ser vacío si es nuevo
        dom.editSchemaKeyDisplay.value = product.schema_key;

        // Limpiar contenido dinámico
        dom.editorForm.querySelectorAll('.form-group-title, .form-row').forEach(el => el.remove());
        dom.editorPlaceholder.style.display = 'none';

        const fragment = document.createDocumentFragment();
        schema.forEach(group => {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'form-group-title';
            groupTitle.textContent = group.group;
            fragment.appendChild(groupTitle);

            group.attrs.forEach(attr => {
                const value = (product.attributes && product.attributes[attr.code]) ? product.attributes[attr.code] : "";
                
                const row = document.createElement('div');
                row.className = 'form-row';
                
                const label = document.createElement('label');
                label.className = 'futuristic-label';
                label.textContent = `${attr.desc} (${attr.code})`;
                
                const textarea = document.createElement('textarea');
                textarea.className = 'futuristic-textarea';
                textarea.name = attr.code;
                textarea.rows = 1;
                textarea.textContent = value;
                
                // Auto-expand
                textarea.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });

                row.appendChild(label);
                row.appendChild(textarea);
                fragment.appendChild(row);
            });
        });

        dom.editorForm.appendChild(fragment);
        // Trigger resize inicial
        setTimeout(() => dom.editorForm.querySelectorAll('textarea').forEach(t => t.style.height = t.scrollHeight + 'px'), 10);
    }

    function exportDataFromEditor() {
        if (!currentLoadedSchemaKey) return;

        // [CAMBIO v3.2.0] Validación más estricta del nombre
        const newModelId = dom.editModelIdInput.value.trim().toUpperCase();
        if (newModelId === "") {
            alert("IMPORTANTE: Debes asignar un nombre (Model ID) antes de exportar.");
            dom.editModelIdInput.focus();
            return;
        }

        const formData = new FormData(dom.editorForm);
        const newAttributes = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'edit-model-id' && key !== 'edit-schema-key-display' && value.trim() !== "") {
                newAttributes[key] = value.trim();
            }
        }

        const modifiedProduct = {
            model: newModelId,
            schema_key: currentLoadedSchemaKey,
            attributes: newAttributes
        };

        generateAndDownloadProductFile(modifiedProduct, newModelId);
        
        // Si era nuevo, actualizar estado UI
        if (isCreatingNewModel) {
            dom.productTitle.textContent = `Editando: ${newModelId}`;
            isCreatingNewModel = false;
        }
    }


    // --- Utils ---
    function generateAndDownloadProductFile(product, fileName) {
        downloadFile(`${fileName}.json`, JSON.stringify(product, null, 4), 'application/json;charset=utf-8');
    }
    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    // --- Lógica Editor Esquema (Simplificada para brevedad, igual que v3.1.5) ---
    function loadSchemaIntoEditor(key, schema) {
        dom.schemaTitle.textContent = `Editando Esquema: ${key}`;
        dom.editSchemaKeyInput.value = key;
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(el => el.remove());
        dom.schemaEditorPlaceholder.style.display = 'none';
        dom.addGroupBtn.disabled = false;
        schema.forEach(group => addGroupToEditor(group));
    }

    function addGroupToEditor(group = null) {
        const div = document.createElement('div');
        div.className = 'schema-group-box';
        div.innerHTML = `
            <div class="schema-group-header">
                <div class="control-group"><label class="futuristic-label">Grupo</label><input type="text" class="futuristic-input w-full" data-type="group-name" value="${group ? group.group : ''}"></div>
                <button class="schema-action-btn schema-add-attr-btn">+ Attr</button><button class="schema-action-btn schema-remove-group-btn">✕</button>
            </div>
            <div class="schema-attributes-container"></div>
        `;
        const container = div.querySelector('.schema-attributes-container');
        if (group && group.attrs) group.attrs.forEach(attr => addAttributeToGroup(attr, container));
        dom.schemaEditorForm.appendChild(div);
    }

    function addAttributeToGroup(attr, container) {
        const div = document.createElement('div');
        div.className = 'schema-attr-row';
        div.innerHTML = `
            <input type="text" class="futuristic-input" data-type="attr-code" value="${attr ? attr.code : ''}" placeholder="code">
            <input type="text" class="futuristic-input" data-type="attr-desc" value="${attr ? attr.desc : ''}" placeholder="desc">
            <button class="schema-action-btn schema-remove-attr-btn">✕</button>
        `;
        container.appendChild(div);
    }

    function handleSchemaEditorClicks(e) {
        if (e.target.classList.contains('schema-add-attr-btn')) {
            e.preventDefault(); addAttributeToGroup(null, e.target.closest('.schema-group-box').querySelector('.schema-attributes-container'));
        } else if (e.target.classList.contains('schema-remove-attr-btn')) {
            e.preventDefault(); e.target.closest('.schema-attr-row').remove();
        } else if (e.target.classList.contains('schema-remove-group-btn')) {
            e.preventDefault(); if(confirm("Borrar grupo?")) e.target.closest('.schema-group-box').remove();
        }
    }

    function handleSchemaExportClick() {
        const key = dom.editSchemaKeyInput.value.trim().toLowerCase();
        if (!key) return alert("Falta Schema Key");
        
        const schema = [];
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(g => {
            const gName = g.querySelector('input[data-type="group-name"]').value;
            const attrs = [];
            g.querySelectorAll('.schema-attr-row').forEach(r => {
                attrs.push({
                    code: r.querySelector('input[data-type="attr-code"]').value,
                    desc: r.querySelector('input[data-type="attr-desc"]').value
                });
            });
            if(gName) schema.push({ group: gName, attrs: attrs });
        });

        const content = `const ${key.toUpperCase()}_SCHEMA_GROUPS = ${JSON.stringify(schema, null, 4)};\nif(window.APP_DB) window.APP_DB.registerSchema('${key}', ${key.toUpperCase()}_SCHEMA_GROUPS);`;
        downloadFile(`modulo${key.charAt(0).toUpperCase() + key.slice(1)}.js`, content, 'text/javascript');
    }

    initialize();
});