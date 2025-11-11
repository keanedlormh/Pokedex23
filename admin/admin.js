/*
 * Lógica del Panel de Administración v3.2.0
 * [CAMBIO v3.2.0] Implementada la creación de modelos
 * basados en selección de Gamas (Schemas).
 */

// window.APP_DB se define en admin/index.html

document.addEventListener('DOMContentLoaded', () => {

    // --- Almacenamiento de Elementos del DOM ---
    const dom = {
        // Controles de Navegación
        homeBtn: document.getElementById('home-btn'),
        saveBtn: document.getElementById('save-btn'),
        allContentPanels: document.querySelectorAll('.content-panel'),

        // Controles de Ajustes
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

        // Panel Hub: Modelo (BUSCAR Y CREAR)
        panelModelHub: document.getElementById('panel-model-hub'),
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        // [NUEVO v3.2.0] Inputs para crear modelo
        createModelSchemaSelect: document.getElementById('create-model-schema-select'),
        createModelIdInput: document.getElementById('create-model-id'),
        createModelBtn: document.getElementById('create-model-btn'),

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

    // --- Base de Datos Local ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null; // Solo para el editor de modelos
    let currentActivePanel = 'general'; // Estado para el botón Guardar


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

            // Rellenar listas de hubs
            renderSearchResults(masterDatabase);
            populateSchemaList(); 
            populateGamaSelectors(); // [MODIFICADO v3.2.0] Llena ambos selects (Exportar y Crear)

            // Mostrar panel de inicio
            showPanel('general');

            console.log(`Admin DB cargada con ${masterDatabase.length} productos.`);
            console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);

            // Deshabilitar botones por defecto
            dom.exportGamaJsonButton.disabled = true;
            dom.addGroupBtn.disabled = true; 
        }, 100);
    }

    function setupEventListeners() {
        // Navegación principal
        dom.homeBtn.addEventListener('click', () => showPanel('general'));
        dom.saveBtn.addEventListener('click', handleSaveClick);

        // Navegación de Ajustes
        dom.settingsBtn.addEventListener('click', toggleSettingsMenu);
        dom.themeBtn.addEventListener('click', toggleTheme);
        dom.infoBtn.addEventListener('click', showInfoModal);
        dom.closeInfoModalBtn.addEventListener('click', hideInfoModal);
        dom.modalOverlay.addEventListener('click', hideInfoModal);

        // Clic fuera del menú de ajustes
        document.addEventListener('click', (e) => {
            if (dom.settingsMenu && dom.settingsBtn) {
                 if (dom.settingsMenu.style.display === 'block' && 
                    !dom.settingsMenu.contains(e.target) && 
                    !dom.settingsBtn.contains(e.target)) {
                    dom.settingsMenu.style.display = 'none';
                }
            }
        });

        // Tarjetas de navegación del Panel General
        dom.navCardButtons.forEach(card => {
            card.addEventListener('click', () => {
                const panelId = card.dataset.panel;
                showPanel(panelId);
            });
        });

        // Panel Hub: Modelo
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        // [NUEVO v3.2.0] Listener para Crear Nuevo Modelo
        dom.createModelBtn.addEventListener('click', handleCreateModelClick);

        // Panel Hub: Esquema
        dom.schemaResultsList.addEventListener('click', handleSchemaLoadClick);
        dom.createSchemaBtn.addEventListener('click', handleSchemaCreateClick);

        // Panel Editor: Esquema (botones dinámicos)
        dom.addGroupBtn.addEventListener('click', () => addGroupToEditor()); // Añadir grupo vacío
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorClicks);

        // Panel Exportar Gama
        dom.gamaExportSelect.addEventListener('change', populateGamaExportList);
        dom.gamaExportList.addEventListener('click', handleGamaExportClick);
        dom.exportGamaJsonButton.addEventListener('click', exportGamaAsJson); 
    }

    // --- Lógica de Navegación y Estado ---

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
        if (!panelToShow) return;

        panelToShow.classList.add('active');

        if (panelId === 'edit-model' || panelId === 'edit-schema') {
            document.body.classList.add('fullscreen-editor-active');
            dom.saveBtn.style.display = 'block';
        }
    }

    // --- Lógica de Ajustes, Tema y Modal ---

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
        if (savedMode === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
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


    // --- Lógica de "Hubs" (Carga y Creación) ---

    // (Panel Hub: Modelo)
    function applySearch() {
        const textQuery = dom.modelSearchInput.value.toLowerCase().trim();
        const filteredProducts = (textQuery === "") ?
            masterDatabase :
            masterDatabase.filter(p => p.model.toLowerCase().includes(textQuery));
        renderSearchResults(filteredProducts);
    }

    // (Panel Hub: Modelo)
    function renderSearchResults(results) {
        dom.modelSearchResults.innerHTML = '';
        if (results.length === 0) {
            dom.modelSearchResults.innerHTML = '<div class="list-item" style="cursor: default; background: none; color: var(--color-text-dim);">No se encontraron resultados.</div>';
            return;
        }
        const fragment = document.createDocumentFragment();
        results.forEach(product => {
            const item = document.createElement('div');
            item.className = 'list-item'; 
            item.dataset.model = product.model;
            item.innerHTML = `
                <span style="font-weight: 600;">${product.model}</span>
                <span style="font-size: 0.7rem; color: var(--color-text-dim); margin-left: 5px;">(${product.schema_key})</span>
            `;
            fragment.appendChild(item);
        });
        dom.modelSearchResults.appendChild(fragment);
    }

    // (Panel Hub: Modelo) -> Clic en un modelo existente
    function handleResultClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;
        const model = target.dataset.model;
        if (!model) return;
        const product = masterDatabase.find(p => p.model === model);
        if (product) {
            loadModelIntoEditor(product);
            showPanel('edit-model'); // Navegar al editor
        }
    }

    // [NUEVO v3.2.0] (Panel Hub: Modelo) -> Clic en Crear Nuevo
    function handleCreateModelClick() {
        const selectedSchema = dom.createModelSchemaSelect.value;
        const newModelId = dom.createModelIdInput.value.trim().toUpperCase();

        // Validaciones
        if (selectedSchema === "") {
            alert("Por favor, selecciona una gama (Schema) para el nuevo modelo.");
            return;
        }
        if (newModelId === "") {
            alert("Por favor, introduce un Model ID (ej: OLED55C4).");
            dom.createModelIdInput.focus();
            return;
        }
        if (/\s/.test(newModelId)) {
            alert("El Model ID no debe tener espacios.");
            return;
        }

        // Verificar si ya existe
        const exists = masterDatabase.find(p => p.model === newModelId);
        if (exists) {
            if(!confirm(`El modelo "${newModelId}" YA EXISTE en la base de datos cargada.\n¿Quieres editar el existente en su lugar?`)) {
                return; // El usuario canceló
            }
            loadModelIntoEditor(exists);
            showPanel('edit-model');
            return;
        }

        // Crear objeto Producto "En blanco"
        const blankProduct = {
            model: newModelId,
            schema_key: selectedSchema,
            attributes: {} // Objeto vacío, se rellenará al guardar
        };

        // Cargar en el editor
        loadModelIntoEditor(blankProduct);
        
        // Limpiar inputs
        dom.createModelIdInput.value = '';
        dom.createModelSchemaSelect.value = '';

        showPanel('edit-model');
    }


    // (Panel Hub: Esquema)
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

    // (Panel Hub: Esquema) -> Clic en un esquema
    function handleSchemaLoadClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;
        const schemaKey = target.dataset.schemaKey;
        if (!schemaKey || !masterSchemaMap[schemaKey]) return;

        const schemaToLoad = JSON.parse(JSON.stringify(masterSchemaMap[schemaKey]));
        loadSchemaIntoEditor(schemaKey, schemaToLoad);
        showPanel('edit-schema'); 
    }

    // (Panel Hub: Esquema) -> Clic en "Crear"
    function handleSchemaCreateClick() {
        const newKey = dom.newSchemaKeyInput.value.trim().toLowerCase();
        if (newKey === "") {
            alert("Introduce una clave para el nuevo esquema.");
            dom.newSchemaKeyInput.focus();
            return;
        }
        if (masterSchemaMap[newKey]) {
            if (!confirm(`El esquema "${newKey}" ya existe. ¿Cargar?`)) return;
            const schemaToLoad = JSON.parse(JSON.stringify(masterSchemaMap[newKey]));
            loadSchemaIntoEditor(newKey, schemaToLoad);
            showPanel('edit-schema');
            return;
        }
        loadSchemaIntoEditor(newKey, []);
        dom.newSchemaKeyInput.value = '';
        showPanel('edit-schema'); 
    }


    // --- Lógica de Selectores de Gama (Común) ---
    
    // [MODIFICADO v3.2.0] Unifica la población de selectores
    function populateGamaSelectors() {
        const fragment = document.createDocumentFragment();
        
        Object.keys(masterSchemaMap).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            let friendlyName = key.charAt(0).toUpperCase() + key.slice(1);
            if (key === 'tvs') friendlyName = "TVs";
            option.textContent = friendlyName;
            fragment.appendChild(option);
        });

        // Llenar selector de Exportación
        if (dom.gamaExportSelect) {
            dom.gamaExportSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
            dom.gamaExportSelect.appendChild(fragment.cloneNode(true));
        }

        // [NUEVO v3.2.0] Llenar selector de Crear Modelo
        if (dom.createModelSchemaSelect) {
            dom.createModelSchemaSelect.innerHTML = '<option value="">-- Seleccionar Gama --</option>';
            dom.createModelSchemaSelect.appendChild(fragment.cloneNode(true));
        }
    }

    function populateGamaExportList() {
        const selectedSchema = dom.gamaExportSelect.value;
        dom.gamaExportList.innerHTML = '';

        if (!selectedSchema) {
            dom.exportGamaJsonButton.disabled = true; 
            return;
        }

        dom.exportGamaJsonButton.disabled = false; 
        const modelsInGama = masterDatabase.filter(p => p.schema_key === selectedSchema);
        if (modelsInGama.length === 0) {
            dom.gamaExportList.innerHTML = '<p class="text-gray-400" style="padding: 0.5rem;">No hay modelos en esta gama.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        modelsInGama.forEach(product => {
            const item = document.createElement('div');
            item.className = 'gama-export-item';
            item.innerHTML = `
                <span>${product.model}</span>
                <button class="export-item-button" data-model="${product.model}">
                    Descargar .json
                </button>
            `;
            fragment.appendChild(item);
        });
        dom.gamaExportList.appendChild(fragment);
    }

    function handleGamaExportClick(e) {
        const target = e.target.closest('.export-item-button');
        if (!target) return;
        const modelId = target.dataset.model;
        const product = masterDatabase.find(p => p.model === modelId);
        if (product) generateAndDownloadProductFile(product, product.model);
    }

    function exportGamaAsJson() {
        const selectedSchema = dom.gamaExportSelect.value;
        if (!selectedSchema) return;
        const productsToExport = masterDatabase.filter(p => p.schema_key === selectedSchema);
        if (productsToExport.length === 0) {
            alert("No hay productos en esta gama.");
            return;
        }
        const jsonString = JSON.stringify(productsToExport, null, 4);
        const filename = `GAMA_${selectedSchema.toUpperCase()}.json`;
        downloadFile(filename, jsonString, 'application/json;charset=utf-8');
    }

    // --- Lógica del Editor de Modelo (Panel 1) ---

    function loadModelIntoEditor(product) {
        currentLoadedSchemaKey = product.schema_key;
        const schema = masterSchemaMap[product.schema_key];

        if (!schema) {
            alert(`Error: No se encontró el esquema "${product.schema_key}"`);
            return;
        }

        // Configuración visual
        // [MEJORA] Si es nuevo (sin atributos), título diferente
        const isNew = Object.keys(product.attributes).length === 0;
        dom.productTitle.textContent = isNew ? `Creando: ${product.model}` : `Editando: ${product.model}`;
        
        dom.editModelIdInput.value = product.model;
        dom.editSchemaKeyDisplay.value = product.schema_key;

        // Limpiar formulario dinámico
        dom.editorForm.querySelectorAll('.form-group-title, .form-row').forEach(el => el.remove());
        dom.editorPlaceholder.style.display = 'none';

        const fragment = document.createDocumentFragment();
        schema.forEach(group => {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'form-group-title';
            groupTitle.textContent = group.group;
            fragment.appendChild(groupTitle);

            group.attrs.forEach(attr => {
                const value = product.attributes[attr.code] || "";
                const row = document.createElement('div');
                row.className = 'form-row';
                const label = document.createElement('label');
                label.className = 'futuristic-label';
                label.htmlFor = `attr_${attr.code}`;
                label.textContent = `${attr.desc} (${attr.code})`;
                const textarea = document.createElement('textarea');
                textarea.className = 'futuristic-textarea';
                textarea.id = `attr_${attr.code}`;
                textarea.name = attr.code;
                textarea.rows = 1;
                textarea.textContent = value;
                textarea.addEventListener('input', () => {
                    textarea.style.height = 'auto';
                    textarea.style.height = (textarea.scrollHeight) + 'px';
                });
                row.appendChild(label);
                row.appendChild(textarea);
                fragment.appendChild(row);
            });
        });

        dom.editorForm.appendChild(fragment);

        // Auto-ajustar textareas
        setTimeout(() => {
            dom.editorForm.querySelectorAll('textarea').forEach(textarea => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            });
        }, 1);
    }

    function exportDataFromEditor() {
        if (!currentLoadedSchemaKey) {
            alert("No hay ningún modelo cargado.");
            return;
        }
        const newModelId = dom.editModelIdInput.value.trim().toUpperCase();
        if (newModelId === "") {
            alert("Introduce un 'Model ID'.");
            dom.editModelIdInput.focus();
            return;
        }

        const formData = new FormData(dom.editorForm);
        const newAttributes = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'edit-model-id' && key !== 'edit-schema-key-display') {
                 if (value.trim() !== "") {
                    newAttributes[key] = value.trim();
                }
            }
        }

        const modifiedProduct = {
            model: newModelId,
            schema_key: currentLoadedSchemaKey,
            attributes: newAttributes
        };

        generateAndDownloadProductFile(modifiedProduct, newModelId);
        alert(`Modelo "${newModelId}" guardado como .json.`);
        dom.productTitle.textContent = `Editando: ${newModelId}`;
    }

    // --- Funciones de Archivo ---

    function generateAndDownloadProductFile(product, fileName) {
        const jsonString = JSON.stringify(product, null, 4);
        const filename = `${fileName}.json`;
        downloadFile(filename, jsonString, 'application/json;charset=utf-8');
    }

    function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    // --- Lógica del Editor de Esquemas (Panel 3) ---

    function loadSchemaIntoEditor(key, schema) {
        dom.schemaTitle.textContent = `Editando Esquema: ${key}`;
        dom.editSchemaKeyInput.value = key;
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(el => el.remove());
        dom.schemaEditorPlaceholder.style.display = 'none';
        dom.addGroupBtn.disabled = false;
        if (schema.length > 0) {
            schema.forEach(group => {
                addGroupToEditor(group);
            });
        }
    }

    function addGroupToEditor(group = null) {
        const groupElement = document.createElement('div');
        groupElement.className = 'schema-group-box';
        const groupName = group ? group.group : '';
        const groupAttrs = group ? group.attrs : [];

        groupElement.innerHTML = `
            <div class="schema-group-header">
                <div class="control-group">
                    <label class="futuristic-label">Nombre del Grupo:</label>
                    <input type="text" class="futuristic-input w-full" data-type="group-name" value="${groupName}" placeholder="EJ: GENERAL">
                </div>
                <button class="schema-action-btn schema-add-attr-btn" title="Añadir Atributo">+ Atributo</button>
                <button class="schema-action-btn schema-remove-btn schema-remove-group-btn" title="Eliminar Grupo">✕ Grupo</button>
            </div>
            <div class="schema-attributes-container"></div>
        `;

        const attributesContainer = groupElement.querySelector('.schema-attributes-container');
        if (groupAttrs.length > 0) {
            groupAttrs.forEach(attr => {
                addAttributeToGroup(attr, attributesContainer);
            });
        }
        dom.schemaEditorForm.appendChild(groupElement);
    }

    function addAttributeToGroup(attr = null, groupContainer) {
        const attrElement = document.createElement('div');
        attrElement.className = 'schema-attr-row';
        const attrCode = attr ? attr.code : '';
        const attrDesc = attr ? attr.desc : '';

        attrElement.innerHTML = `
            <input type="text" class="futuristic-input" data-type="attr-code" value="${attrCode}" placeholder="ej: general_potencia_w">
            <input type="text" class="futuristic-input" data-type="attr-desc" value="${attrDesc}" placeholder="Descripción del atributo">
            <button class="schema-action-btn schema-remove-btn schema-remove-attr-btn" title="Eliminar Atributo">✕</button>
        `;
        groupContainer.appendChild(attrElement);
    }

    function handleSchemaEditorClicks(e) {
        const addAttrBtn = e.target.closest('.schema-add-attr-btn');
        const removeAttrBtn = e.target.closest('.schema-remove-attr-btn');
        const removeGroupBtn = e.target.closest('.schema-remove-group-btn');

        if (addAttrBtn) {
            e.preventDefault();
            const attributesContainer = addAttrBtn.closest('.schema-group-box').querySelector('.schema-attributes-container');
            addAttributeToGroup(null, attributesContainer);
            return;
        }
        if (removeAttrBtn) {
            e.preventDefault();
            removeAttrBtn.closest('.schema-attr-row').remove();
            return;
        }
        if (removeGroupBtn) {
            e.preventDefault();
            if (confirm("¿Estás seguro de que quieres eliminar este grupo?")) {
                removeGroupBtn.closest('.schema-group-box').remove();
            }
            return;
        }
    }

    function handleSchemaExportClick() {
        const schemaKeyInput = dom.schemaEditorForm.querySelector('#edit-schema-key');
        const schemaKey = schemaKeyInput ? schemaKeyInput.value.trim().toLowerCase() : '';

        if (schemaKey === "" || /\s/.test(schemaKey)) {
            alert("Clave de esquema inválida.");
            if(schemaKeyInput) schemaKeyInput.focus();
            return;
        }

        const newSchema = [];
        const groupElements = dom.schemaEditorForm.querySelectorAll('.schema-group-box');
        let isValid = true;

        groupElements.forEach((groupEl, groupIndex) => {
            const groupName = groupEl.querySelector('input[data-type="group-name"]').value.trim();
            if (groupName === "") {
                alert(`El Grupo #${groupIndex + 1} no tiene nombre.`);
                isValid = false;
                return;
            }

            const newGroup = { group: groupName, attrs: [] };
            const attrElements = groupEl.querySelectorAll('.schema-attr-row');
            
            if (attrElements.length === 0 && !confirm(`El grupo "${groupName}" está vacío. ¿Seguir?`)) {
                isValid = false;
                return;
            }

            attrElements.forEach((attrEl) => {
                const code = attrEl.querySelector('input[data-type="attr-code"]').value.trim();
                const desc = attrEl.querySelector('input[data-type="attr-desc"]').value.trim();
                if (code === "" || desc === "") {
                    alert("Atributos incompletos.");
                    isValid = false;
                    return;
                }
                newGroup.attrs.push({ code, desc });
            });
            if (isValid) newSchema.push(newGroup);
        });

        if (!isValid || newSchema.length === 0 && !confirm("Esquema vacío. ¿Guardar?")) return;

        const schemaConstantName = `${schemaKey.toUpperCase()}_SCHEMA_GROUPS`;
        const schemaJSON = JSON.stringify(newSchema, null, 4);
        const fileContent = `/**\n * Modulo de Esquema: ${schemaKey}\n */\n\nconst ${schemaConstantName} = ${schemaJSON};\n\nif (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {\n    window.APP_DB.registerSchema('${schemaKey}', ${schemaConstantName});\n} else {\n    console.error("Error: APP_DB no inicializada.");\n}\n`;
        
        const filename = `modulo${schemaKey.charAt(0).toUpperCase() + schemaKey.slice(1)}.js`;
        downloadFile(filename, fileContent, 'text/javascript;charset=utf-8');
        alert(`¡Esquema "${schemaKey}" guardado!`);
        dom.schemaTitle.textContent = `Editando Esquema: ${schemaKey}`;
    }

    // --- Ejecución ---
    initialize();
});