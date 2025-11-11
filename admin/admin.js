/*
 * Lógica del Panel de Administración v3.1.8
 * [PARCHE DEFINITIVO] Refactorizada la lógica de popups (Ajustes/Modal)
 * para solucionar el bug de propagación de clics.
 */

// window.APP_DB se define en admin/index.html

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Almacenamiento de Elementos del DOM ---
    const dom = {
        // Controles de Navegación
        homeButton: document.getElementById('home-btn'),
        saveButton: document.getElementById('save-btn'),
        allContentPanels: document.querySelectorAll('.content-panel'),
        navCards: document.querySelectorAll('.nav-card'),
        
        // Panel 1: Modelos
        modelSearchInput: document.getElementById('search-model'),
        modelResultsList: document.getElementById('model-results-list'),
        
        // Panel 2: Editor de Modelo
        editModelTitle: document.getElementById('edit-model-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),
        editModelIdInput: document.getElementById('edit-model-id'),
        
        // Panel 3: Schemas
        schemaResultsList: document.getElementById('schema-results-list'),
        createSchemaKeyInput: document.getElementById('create-schema-key'),
        createSchemaButton: document.getElementById('create-schema-btn'),

        // Panel 4: Editor de Schema
        editSchemaTitle: document.getElementById('edit-schema-title'),
        schemaEditorForm: document.getElementById('schema-editor-form'),
        schemaEditorPlaceholder: document.getElementById('schema-editor-placeholder'),
        editSchemaKeyInput: document.getElementById('edit-schema-key'),
        schemaAddGroupButton: document.getElementById('schema-add-group-btn'),

        // Panel 5: Exportar Gama
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list'),
        exportGamaJsonButton: document.getElementById('export-gama-json-btn'),

        // v3.1.4 Menú de Ajustes, Modal y Overlay
        settingsMenuToggle: document.getElementById('settings-menu-toggle'),
        settingsMenuPanel: document.getElementById('settings-menu-panel'),
        paletteToggleButton: document.getElementById('palette-toggle-btn'),
        infoToggleButton: document.getElementById('info-toggle-btn'),
        
        filterOverlay: document.getElementById('filter-overlay'),
        
        readmeModal: document.getElementById('readme-modal'),
        readmeContent: document.getElementById('readme-content'),
        readmeCloseButton: document.getElementById('readme-close-btn'),
    };
    
    // --- 2. Base de Datos Local y Estado ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null; // Para el editor de Modelos
    let currentLoadedModel = null;     // Para el editor de Modelos
    let currentSchemaForEditor = null; // Para el editor de Schemas
    
    let activePanel = 'panel-general';
    let activeEditor = null; // 'model' o 'schema'

    
    // --- 3. Lógica de Tema ---
    const darkPaletteHSL = {
        accent: { h: 188, s: 96, l: 41 }, 
        dark:   { h: 210, s: 29, l: 8 },  
        medium: { h: 210, s: 19, l: 11 }, 
        border: { h: 210, s: 16, l: 15 }, 
        textP:  { h: 210, s: 29, l: 92 }, 
        textS:  { h: 210, s: 12, l: 67 }  
    };
    const lightPaletteHSL = {
        accent: { h: 188, s: 86, l: 40 }, 
        dark:   { h: 210, s: 20, l: 98 }, 
        medium: { h: 210, s: 19, l: 94 }, 
        border: { h: 210, s: 16, l: 85 }, 
        textP:  { h: 210, s: 29, l: 10 }, 
        textS:  { h: 210, s: 12, l: 40 }  
    };
    const hueDifference = darkPaletteHSL.dark.h - darkPaletteHSL.accent.h;
    let isLightMode = false;
    let currentAccentHue = darkPaletteHSL.accent.h;


    // --- 4. Inicialización ---
    function initialize() {
        console.log("Admin Panel v3.1.8 inicializando...");
        
        // Esperar a que los scripts del bootloader carguen la BD
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;

            if (masterDatabase.length === 0) console.warn("La base de datos está vacía.");

            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));

            setupEventListeners();
            
            // Poblar listas
            renderSearchResults(masterDatabase);
            populateGamaSelector();
            populateSchemaList();
            
            // Mostrar panel general
            showPanel('panel-general'); 

            // Aplicar tema
            updatePaletteCSS(darkPaletteHSL, currentAccentHue);
            dom.paletteToggleButton.innerHTML = '🎨 Tema';

            console.log(`Admin DB cargada con ${masterDatabase.length} productos.`);
            console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);
        }, 100);
    }

    function setupEventListeners() {
        // Navegación principal
        dom.homeButton.addEventListener('click', () => showPanel('panel-general'));
        dom.saveButton.addEventListener('click', handleSaveClick);
        
        dom.navCards.forEach(card => {
            card.addEventListener('click', () => showPanel(card.dataset.panelId));
        });

        // Panel 1: Cargar Modelo
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelResultsList.addEventListener('click', handleResultClick);
        
        // Panel 3: Cargar/Crear Schema
        dom.schemaResultsList.addEventListener('click', handleSchemaLoadClick);
        dom.createSchemaButton.addEventListener('click', handleSchemaCreateClick);

        // Panel 4: Editor de Schema (Clicks en botones dinámicos)
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorClicks);
        dom.schemaAddGroupButton.addEventListener('click', () => {
            addGroupToEditor(); // Añade grupo vacío
        });
        
        // Panel 5: Exportar Gama
        dom.gamaExportSelect.addEventListener('change', populateGamaExportList);
        dom.gamaExportList.addEventListener('click', handleGamaExportClick);
        dom.exportGamaJsonButton.addEventListener('click', exportGamaAsJson);
        
        
        // --- [LÓGICA v3.1.8] Listeners de Ajustes, Modal y Overlay ---
        
        // 1. El botón de toggle abre/cierra su menú
        dom.settingsMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic active el overlay
            toggleSettings();
        });

        // 2. Botones DENTRO del menú de ajustes
        dom.paletteToggleButton.addEventListener('click', handleThemeToggle);
        dom.infoToggleButton.addEventListener('click', showReadme);
        
        // 3. El Overlay cierra todo
        dom.filterOverlay.addEventListener('click', closeAllPopups);
        
        // 4. El botón de cerrar el modal cierra todo
        dom.readmeCloseButton.addEventListener('click', closeAllPopups);

        // 5. Clics DENTRO de los popups no deben cerrarlos
        dom.settingsMenuPanel.addEventListener('click', (e) => e.stopPropagation());
        dom.readmeModal.addEventListener('click', (e) => e.stopPropagation());
    }


    // --- 5. Lógica de Navegación y Estado ---

    function showPanel(panelId) {
        if (!panelId) return;
        
        activePanel = panelId;
        dom.allContentPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === panelId);
        });

        const isEditor = panelId === 'panel-edit-model' || panelId === 'panel-edit-schema';
        
        document.body.classList.toggle('fullscreen-editor-active', isEditor);
        dom.saveButton.style.display = isEditor ? 'inline-flex' : 'none';

        if (isEditor) {
            activeEditor = (panelId === 'panel-edit-model') ? 'model' : 'schema';
        } else {
            activeEditor = null;
        }
        
        // Resetear listas al salir de hubs (para que se recarguen)
        if (panelId === 'panel-general') {
            dom.modelResultsList.innerHTML = '';
            dom.schemaResultsList.innerHTML = '';
        }
        
        // Poblar listas al entrar en hubs
        if (panelId === 'panel-model-hub') {
            renderSearchResults(masterDatabase);
        }
        if (panelId === 'panel-schema-hub') {
            populateSchemaList();
        }

        closeAllPopups(); // Cerrar popups al navegar
    }

    function handleSaveClick() {
        if (activeEditor === 'model') {
            exportDataFromEditor();
        } else if (activeEditor === 'schema') {
            handleSchemaExportClick();
        }
    }

    // --- 6. Lógica de Búsqueda (Panel 1) ---
    function applySearch() {
        const textQuery = dom.modelSearchInput.value.toLowerCase().trim();
        const filteredProducts = (textQuery === "") ?
            masterDatabase :
            masterDatabase.filter(p => p.model.toLowerCase().includes(textQuery));
        renderSearchResults(filteredProducts);
    }

    function renderSearchResults(results) {
        dom.modelResultsList.innerHTML = '';
        if (results.length === 0) {
            dom.modelResultsList.innerHTML = '<div class="list-item" style="cursor: default; background: none; color: var(--color-text-dim);">No se encontraron resultados.</div>';
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
        dom.modelResultsList.appendChild(fragment);
    }

    function handleResultClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;

        const model = target.dataset.model;
        if (!model) return;
        
        const product = masterDatabase.find(p => p.model === model);
        if (product) {
            loadModelIntoEditor(product);
            showPanel('panel-edit-model');
        }
    }
    
    // --- 7. Lógica de Exportar Gama (Panel 5) ---

    function populateGamaSelector() {
        if (!dom.gamaExportSelect) return;
        dom.gamaExportSelect.innerHTML = '<option value="">-- Seleccionar --</option>'; // Reset
        const fragment = document.createDocumentFragment();
        Object.keys(masterSchemaMap).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            let friendlyName = key.charAt(0).toUpperCase() + key.slice(1);
            if (key === 'tvs') friendlyName = "TVs";
            option.textContent = friendlyName;
            fragment.appendChild(option);
    
        });
        dom.gamaExportSelect.appendChild(fragment);
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
        if (product) {
            generateAndDownloadProductFile(product, product.model, 'application/json;charset=utf-8');
        } else {
            alert(`Error: No se pudo encontrar el modelo ${modelId} en la base de datos.`);
        }
    }

    function exportGamaAsJson() {
        const selectedSchema = dom.gamaExportSelect.value;
        if (!selectedSchema) {
            alert("Por favor, selecciona una gama primero.");
            return;
        }

        const productsToExport = masterDatabase.filter(p => p.schema_key === selectedSchema);
        if (productsToExport.length === 0) {
            alert("No hay productos en esta gama para exportar.");
            return;
        }

        const jsonString = JSON.stringify(productsToExport, null, 4);
        const filename = `GAMA_${selectedSchema.toUpperCase()}.json`;
        downloadFile(filename, jsonString, 'application/json;charset=utf-8');
    }

    // --- 8. Lógica del Editor de Modelo (Panel 2) ---

    function loadModelIntoEditor(product) {
        currentLoadedModel = product;
        currentLoadedSchemaKey = product.schema_key;
        const schema = masterSchemaMap[product.schema_key];

        if (!schema) {
            alert(`Error: No se encontró el esquema "${product.schema_key}"`);
            return;
        }

        dom.editModelTitle.textContent = product.model;
        dom.editModelIdInput.value = product.model;

        // Limpiar solo los campos dinámicos
        const dynamicContent = dom.editorForm.querySelectorAll('.form-group-title, .form-row');
        dynamicContent.forEach(el => el.remove());
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
                // Auto-resize
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
        
        // Ajustar altura de textareas
        setTimeout(() => {
            dom.editorForm.querySelectorAll('textarea').forEach(textarea => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            });
        }, 1);
    }

    function exportDataFromEditor() {
        if (!currentLoadedSchemaKey) {
            alert("No hay ningún modelo cargado en el editor para exportar.");
            return;
        }

        const newModelId = dom.editModelIdInput.value.trim().toUpperCase();
        if (newModelId === "") {
            alert("Por favor, introduce un 'Model ID' para la exportación.");
            dom.editModelIdInput.focus();
            return;
        }

        const formData = new FormData(dom.editorForm);
        const newAttributes = {};
        for (const [key, value] of formData.entries()) {
            if (value.trim() !== "") {
                newAttributes[key] = value.trim();
            }
        }

        const modifiedProduct = {
            model: newModelId,
            schema_key: currentLoadedSchemaKey,
            attributes: newAttributes
        };
        
        const jsonString = JSON.stringify(modifiedProduct, null, 4);
        generateAndDownloadProductFile(modifiedProduct, newModelId, 'application/json;charset=utf-8');
    }

    // --- 9. Lógica del Editor de Esquemas (Paneles 3 y 4) ---

    function populateSchemaList() {
        dom.schemaResultsList.innerHTML = '';
        const schemas = Object.keys(masterSchemaMap);
        
        if (schemas.length === 0) {
            dom.schemaResultsList.innerHTML = '<div class="list-item" style="cursor: default; background: none; color: var(--color-text-dim);">No se encontraron esquemas.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();
        schemas.forEach(key => {
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
        if (!schemaKey || !masterSchemaMap[schemaKey]) {
            alert(`Error: No se pudo encontrar el esquema ${schemaKey}`);
            return;
        }
        
        currentSchemaForEditor = masterSchemaMap[schemaKey];
        
        loadSchemaIntoEditor(schemaKey, currentSchemaForEditor);
        showPanel('panel-edit-schema');
    }
    
    function handleSchemaCreateClick() {
        const schemaKey = dom.createSchemaKeyInput.value.trim().toLowerCase();
        if (schemaKey === "") {
            alert("Por favor, introduce una 'Nueva Clave de Esquema'.");
            dom.createSchemaKeyInput.focus();
            return;
        }
        if (masterSchemaMap[schemaKey]) {
            alert(`Error: El esquema '${schemaKey}' ya existe. Cárgalo para editarlo.`);
            return;
        }
        
        // Crear un esquema vacío
        currentSchemaForEditor = []; 
        loadSchemaIntoEditor(schemaKey, currentSchemaForEditor);
        showPanel('panel-edit-schema');
        dom.createSchemaKeyInput.value = ''; // Limpiar input
    }
    
    function loadSchemaIntoEditor(key, schema) {
        dom.editSchemaTitle.textContent = key;
        dom.editSchemaKeyInput.value = key;
        
        // Limpiar solo los grupos dinámicos
        const dynamicContent = dom.schemaEditorForm.querySelectorAll('.schema-group-box');
        dynamicContent.forEach(el => el.remove());
        dom.schemaEditorPlaceholder.style.display = 'none';
        
        const fragment = document.createDocumentFragment();
        
        if (schema.length > 0) {
            schema.forEach(group => {
                fragment.appendChild(createGroupElement(group.group, group.attrs));
            });
        } else {
            dom.schemaEditorPlaceholder.style.display = 'block';
        }
        
        dom.schemaEditorForm.appendChild(fragment);
    }
    
    function createGroupElement(groupName = '', attrs = []) {
        const groupEl = document.createElement('div');
        groupEl.className = 'schema-group-box';
        
        groupEl.innerHTML = `
            <div class="schema-group-header">
                <div class="control-group">
                    <label class="futuristic-label">Nombre del Grupo:</label>
                    <input type="text" class="futuristic-input w-full" data-type="group-name" value="${groupName}" placeholder="ej: GENERAL">
                </div>
                <button class="schema-action-btn schema-add-attr-btn" data-action="add-attr">+ Atributo</button>
                <button class="schema-action-btn schema-remove-btn" data-action="remove-group">X Grupo</button>
            </div>
            <div class="schema-attributes-container">
                <!-- Atributos se añaden aquí -->
            </div>
        `;
        
        const attrsContainer = groupEl.querySelector('.schema-attributes-container');
        if (attrs.length > 0) {
            attrs.forEach(attr => {
                attrsContainer.appendChild(createAttributeElement(attr.code, attr.desc));
            });
        }
        
        return groupEl;
    }
    
    function createAttributeElement(code = '', desc = '') {
        const attrEl = document.createElement('div');
        attrEl.className = 'schema-attr-row';
        attrEl.innerHTML = `
            <input type="text" class="futuristic-input" data-type="attr-code" value="${code}" placeholder="ej: general_potencia">
            <input type="text" class="futuristic-input" data-type="attr-desc" value="${desc}" placeholder="ej: Potencia de salida (W)">
            <button class="schema-action-btn schema-remove-btn" data-action="remove-attr">X</button>
        `;
        return attrEl;
    }

    function handleSchemaEditorClicks(e) {
        const action = e.target.dataset.action;
        if (!action) return;
        
        if (action === 'add-attr') {
            const container = e.target.closest('.schema-group-box').querySelector('.schema-attributes-container');
            container.appendChild(createAttributeElement());
            dom.schemaEditorPlaceholder.style.display = 'none';
        }
        
        if (action === 'remove-attr') {
            e.target.closest('.schema-attr-row').remove();
        }
        
        if (action === 'remove-group') {
            e.target.closest('.schema-group-box').remove();
        }
    }

    function handleSchemaExportClick() {
        const schemaKey = dom.editSchemaKeyInput.value.trim().toLowerCase();
        if (schemaKey === "") {
            alert("La 'Schema Key' no puede estar vacía.");
            dom.editSchemaKeyInput.focus();
            return;
        }
        
        const newSchema = [];
        const groupElements = dom.schemaEditorForm.querySelectorAll('.schema-group-box');
        
        let error = false;
        
        groupElements.forEach(groupEl => {
            const groupName = groupEl.querySelector('[data-type="group-name"]').value.trim();
            if (groupName === "") {
                alert("El 'Nombre del Grupo' no puede estar vacío.");
                error = true;
                return;
            }
            
            const groupData = {
                group: groupName,
                attrs: []
            };
            
            const attrElements = groupEl.querySelectorAll('.schema-attr-row');
            attrElements.forEach(attrEl => {
                const code = attrEl.querySelector('[data-type="attr-code"]').value.trim();
                const desc = attrEl.querySelector('[data-type="attr-desc"]').value.trim();
                
                if (code === "" || desc === "") {
                    alert("Los campos 'code' y 'desc' de un atributo no pueden estar vacíos.");
                    error = true;
                    return;
                }
                
                groupData.attrs.push({ code, desc });
            });
            
            if (error) return;
            newSchema.push(groupData);
        });
        
        if (error) return;

        // Formatear el archivo .js
        const schemaString = JSON.stringify(newSchema, null, 4);
        const variableName = `${schemaKey.toUpperCase()}_SCHEMA_GROUPS`;
        
        const fileContent = `/**
 * Modulo de Esquema: ${schemaKey}
 * (Generado por Admin Panel v3.1.8)
 */

const ${variableName} = ${schemaString};

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este esquema
if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('${schemaKey}', ${variableName});
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}
`;
        
        const filename = `modulo${schemaKey.charAt(0).toUpperCase() + schemaKey.slice(1)}.js`;
        downloadFile(filename, fileContent, 'application/javascript;charset=utf-fileContent8');
    }

    // --- 10. Lógica de Exportación Genérica ---

    function generateAndDownloadProductFile(product, fileName, mimeType) {
        const jsonString = JSON.stringify(product, null, 4);
        const filename = `${fileName}.json`;
        downloadFile(filename, jsonString, mimeType);
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
    
    // --- 11. [REFACTORIZADO v3.1.8] Lógica de Ajustes, Tema y Modal ---
    
    /**
     * Cierra TODOS los popups y el overlay.
     * Esta es la función de reseteo universal.
     */
    function closeAllPopups() {
        dom.settingsMenuPanel.className = 'settings-menu-panel-hidden';
        dom.settingsMenuToggle.classList.remove('active');
        dom.readmeModal.className = 'modal-hidden';
        dom.filterOverlay.className = 'overlay-hidden';
    }

    /**
     * Abre o cierra el menú de ajustes.
     */
    function toggleSettings() {
        const isOpen = dom.settingsMenuPanel.classList.contains('settings-menu-panel-open');
        closeAllPopups(); // Cierra todo primero

        if (!isOpen) {
            // Si estaba cerrado, ábrelo
            dom.settingsMenuPanel.className = 'settings-menu-panel-open';
            dom.filterOverlay.className = 'overlay-visible';
            dom.settingsMenuToggle.classList.add('active');
        }
        // Si estaba abierto, closeAllPopups() ya hizo el trabajo de cerrarlo.
    }
    
    /**
     * Cierra el menú de ajustes y abre el modal del README.
     */
    function showReadme() {
        closeAllPopups(); // Cierra el menú de ajustes

        dom.readmeModal.className = 'modal-visible';
        dom.filterOverlay.className = 'overlay-visible';
        
        loadReadmeContent(); // Carga el contenido async
    }
    
    /**
     * Alterna el tema (Claro/Oscuro) y genera nueva paleta.
     * NO cierra el menú.
     */
    function handleThemeToggle() {
        isLightMode = !isLightMode; 

        if (isLightMode) {
            updatePaletteCSS(lightPaletteHSL, currentAccentHue);
        } else {
            currentAccentHue = Math.floor(Math.random() * 360);
            updatePaletteCSS(darkPaletteHSL, currentAccentHue);
        }
    }

    /**
     * Carga el contenido del README.md en el modal.
     */
    async function loadReadmeContent() {
        if (dom.readmeContent.textContent === "" || dom.readmeContent.textContent.startsWith("Cargando...")) {
            try {
                dom.readmeContent.textContent = "Cargando...";
                const response = await fetch('README.md'); 
                if (!response.ok) {
                    const rootResponse = await fetch('../README.md');
                    if (!rootResponse.ok) throw new Error('No se pudo encontrar README.md');
                    const text = await rootResponse.text();
                    dom.readmeContent.textContent = text;
                } else {
                     const text = await response.text();
                     dom.readmeContent.textContent = text;
                }
            } catch (error) {
                console.error("Error al cargar README.md:", error);
                dom.readmeContent.textContent = "Error al cargar el archivo README.md.";
            }
        }
    }

    /**
     * Aplica la paleta de colores a las variables CSS root.
     */
    function updatePaletteCSS(baseHSL, accentHue) {
        const p = baseHSL;
        const newOtherHue = (accentHue + hueDifference + 360) % 360; 

        const newColors = {
            accent: `hsl(${accentHue}, ${p.accent.s}%, ${p.accent.l}%)`,
            bgDark: `hsl(${newOtherHue}, ${p.dark.s}%, ${p.dark.l}%)`,
            bgMedium: `hsl(${newOtherHue}, ${p.medium.s}%, ${p.medium.l}%)`,
            border: `hsl(${newOtherHue}, ${p.border.s}%, ${p.border.l}%)`,
            textPrimary: `hsl(${newOtherHue}, ${p.textP.s}%, ${p.textP.l}%)`,
            textSecondary: `hsl(${newOtherHue}, ${p.textS.s}%, ${p.textS.l}%)`
        };

        const accentRGB = hslToRgb(accentHue, p.accent.s, p.accent.l);
        newColors.glow = `rgba(${accentRGB.r}, ${accentRGB.g}, ${accentRGB.b}, 0.25)`;
        
        const root = document.documentElement;
        root.style.setProperty('--color-cyan-accent', newColors.accent);
        root.style.setProperty('--color-cyan-glow', newColors.glow);
        root.style.setProperty('--color-bg-dark', newColors.bgDark);
        root.style.setProperty('--color-bg-medium', newColors.bgMedium);
        root.style.setProperty('--color-border', newColors.border);
        root.style.setProperty('--color-border-light', `hsl(${newOtherHue}, ${p.border.s}%, ${p.border.l + 5}%)`);
        root.style.setProperty('--color-text-primary', newColors.textPrimary);
        root.style.setProperty('--color-text-secondary', newColors.textSecondary);
        root.style.setProperty('--color-text-dim', `hsl(${newOtherHue}, ${p.textS.s}%, ${p.textS.l - 10}%)`);
    }

    /**
     * Convierte HSL a RGB (para el color --glow).
     */
    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    }

    // --- 12. Ejecución ---
    initialize();
});