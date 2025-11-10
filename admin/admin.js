/*
 * Lógica del Panel de Administración v3.0.0
 * [NUEVO] Editor de Módulos de Esquema (Schema).
 * [ACTUALIZADO] Exportación de modelos individuales a .json
 * [AÑADIDO] Exportar gama completa a JSON.
 */

// window.APP_DB se define en admin/index.html

document.addEventListener('DOMContentLoaded', () => {

    // --- Almacenamiento de Elementos del DOM ---
    const dom = {
        // Controles de Navegación
        adminNavbar: document.querySelector('.admin-navbar'),
        allContentPanels: document.querySelectorAll('.content-panel'),
        allMenuDropdowns: document.querySelectorAll('.menu-dropdown'),
        allMenuItems: document.querySelectorAll('.menu-item'),

        // Panel 1: Editar Modelo
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        productTitle: document.getElementById('product-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),
        newModelIdInput: document.getElementById('new-model-id'),
        exportButton: document.getElementById('export-btn'),

        // Panel 2: Exportar Gama
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list'),
        exportGamaJsonButton: document.getElementById('export-gama-json-btn'),

        // [NUEVO v3.0.0] Panel 3: Editor de Esquemas
        schemaResultsList: document.getElementById('schema-results-list'),
        newSchemaKeyInput: document.getElementById('new-schema-key'),
        createSchemaBtn: document.getElementById('create-schema-btn'),
        schemaTitle: document.getElementById('schema-title'),
        schemaKeyDisplay: document.getElementById('schema-key-display'),
        exportSchemaBtn: document.getElementById('export-schema-btn'),
        schemaEditorForm: document.getElementById('schema-editor-form'),
        schemaEditorPlaceholder: document.getElementById('schema-editor-placeholder'),
        addGroupBtn: document.getElementById('add-group-btn')
    };
    
    // --- Base de Datos Local ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null;
    let currentLoadedModel = null;
    let activeDropdown = null;

    // [NUEVO v3.0.0] Estado del editor de esquemas
    let currentEditingSchemaKey = null;


    // --- Inicialización ---
    function initialize() {
        console.log("Admin Panel v3.0.0 inicializando...");
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;

            if (masterDatabase.length === 0) console.warn("La base de datos está vacía.");

            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));

            setupEventListeners();
            
            // Paneles
            renderSearchResults(masterDatabase);
            populateGamaSelector();
            populateSchemaList(); // [NUEVO v3.0.0]

            showPanel('edit-model'); // Mostrar panel por defecto

            console.log(`Admin DB cargada con ${masterDatabase.length} productos.`);
            console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);
            
            // Deshabilitar botones por defecto
            dom.exportButton.disabled = true;
            dom.exportGamaJsonButton.disabled = true;
            dom.exportSchemaBtn.disabled = true; // [NUEVO v3.0.0]
            dom.addGroupBtn.disabled = true; // [NUEVO v3.0.0]
        }, 100);
    }

    function setupEventListeners() {
        // Navegación
        if (dom.adminNavbar) {
            dom.adminNavbar.addEventListener('click', handleNavClick);
        }
        document.addEventListener('click', (e) => {
            if (dom.adminNavbar && !dom.adminNavbar.contains(e.target)) {
                closeAllDropdowns();
            }
        });
        
        // Panel 1: Cargar en Editor
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        
        // Panel 2: Exportar Gama
        dom.gamaExportSelect.addEventListener('change', populateGamaExportList);
        dom.gamaExportList.addEventListener('click', handleGamaExportClick);
        dom.exportGamaJsonButton.addEventListener('click', exportGamaAsJson); 

        // Panel 1 (continuación): Editor
        dom.exportButton.addEventListener('click', exportDataFromEditor);

        // [NUEVO v3.0.0] Panel 3: Editor de Esquemas
        dom.schemaResultsList.addEventListener('click', handleSchemaLoadClick);
        dom.createSchemaBtn.addEventListener('click', handleSchemaCreateClick);
        dom.exportSchemaBtn.addEventListener('click', handleSchemaExportClick);
        dom.addGroupBtn.addEventListener('click', () => addGroupToEditor()); // Añadir grupo vacío
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorClicks);
    }

    // --- Lógica de Navegación por Menús ---

    function handleNavClick(e) {
        const menuTitle = e.target.closest('.menu-title');
        const menuItem = e.target.closest('.menu-item');

        if (menuTitle) {
            e.stopPropagation();
            const dropdownId = menuTitle.dataset.dropdown;
            toggleDropdown(dropdownId);
            return;
        }

        if (menuItem) {
            e.stopPropagation();
            const tabId = menuItem.dataset.tab;
            if (tabId) {
                showPanel(tabId);
                closeAllDropdowns();
            }
            return;
        }
    }

    function toggleDropdown(dropdownId) {
        const dropdownToToggle = document.getElementById(dropdownId);
        if (!dropdownToToggle) return;

        if (dropdownToToggle.classList.contains('active')) {
            dropdownToToggle.classList.remove('active');
            activeDropdown = null;
        } else {
            closeAllDropdowns();
            dropdownToToggle.classList.add('active');
            activeDropdown = dropdownToToggle;
        }
    }

    function closeAllDropdowns() {
        if (activeDropdown) {
            activeDropdown.classList.remove('active');
            activeDropdown = null;
        }
    }

    function showPanel(panelId) {
        // Ocultar todos los paneles
        dom.allContentPanels.forEach(panel => panel.classList.remove('active'));
        // Desactivar todos los items de menú
        dom.allMenuItems.forEach(button => button.classList.remove('active'));
        // Desactivar todos los títulos de menú
        document.querySelectorAll('.menu-title.active').forEach(title => title.classList.remove('active'));


        const panelToShow = document.getElementById(`panel-${panelId}`);
        const menuItemToActivate = document.querySelector(`.menu-item[data-tab="${panelId}"]`);

        if (panelToShow) panelToShow.classList.add('active');
        if (menuItemToActivate) {
            menuItemToActivate.classList.add('active');
            // Activar el título del menú padre
            const parentTitle = menuItemToActivate.closest('.menu-group').querySelector('.menu-title');
            if(parentTitle) parentTitle.classList.add('active');
        }
    }

    // --- Lógica de Búsqueda (Panel 1) ---
    function applySearch() {
        dom.modelSearchResults.classList.remove('list-collapsed');
        const textQuery = dom.modelSearchInput.value.toLowerCase().trim();
        const filteredProducts = (textQuery === "") ?
            masterDatabase :
            masterDatabase.filter(p => p.model.toLowerCase().includes(textQuery));
        renderSearchResults(filteredProducts);
    }

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

    function handleResultClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;

        document.querySelectorAll('#model-results-list .list-item.active').forEach(item => item.classList.remove('active'));
        target.classList.add('active');

        const model = target.dataset.model;
        if (!model) return;
        const product = masterDatabase.find(p => p.model === model);
        if (product) {
            loadModelIntoEditor(product);
            dom.modelSearchResults.classList.add('list-collapsed');
        }
    }

    // --- Lógica de Exportar Gama (Panel 2) ---

    function populateGamaSelector() {
        if (!dom.gamaExportSelect) return;
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
            // [CAMBIO v2.9.6] El botón ahora dice "Descargar .json"
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
            // [CAMBIO v2.9.6] Esta función ahora genera .json
            generateAndDownloadProductFile(product, product.model);
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

    // --- Lógica del Editor (Panel 1) ---

    function loadModelIntoEditor(product) {
        currentLoadedModel = product;
        currentLoadedSchemaKey = product.schema_key;
        const schema = masterSchemaMap[product.schema_key];

        if (!schema) {
            alert(`Error: No se encontró el esquema "${product.schema_key}"`);
            return;
        }

        dom.editorPlaceholder.style.display = 'none';
        dom.editorForm.innerHTML = '';
        dom.productTitle.textContent = `2. Editando: ${product.model}`;
        dom.newModelIdInput.value = product.model;

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
        dom.exportButton.disabled = false;

        setTimeout(() => {
            dom.editorForm.querySelectorAll('textarea').forEach(textarea => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            });
        }, 1);
    }

    function exportDataFromEditor() {
        if (!currentLoadedModel || !currentLoadedSchemaKey) {
            alert("No hay ningún modelo cargado en el editor para exportar.");
            return;
        }

        const newModelId = dom.newModelIdInput.value.trim().toUpperCase();
        if (newModelId === "") {
            alert("Por favor, introduce un 'Nuevo Model ID' para la exportación.");
            dom.newModelIdInput.focus();
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
        
        generateAndDownloadProductFile(modifiedProduct, newModelId);
    }

    // --- Lógica de Exportación Genérica ---

    /**
     * [ACTUALIZADO v2.9.6] Genera el contenido de un archivo .json para un solo producto.
     */
    function generateAndDownloadProductFile(product, fileName) {
        const jsonString = JSON.stringify(product, null, 4);
        const filename = `${fileName}.json`;
        downloadFile(filename, jsonString, 'application/json;charset=utf-8');
    }

    /**
     * [HELPER] Crea un blob y fuerza la descarga de un archivo de texto.
     */
    function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    // --- [NUEVO v3.0.0] Lógica del Editor de Esquemas (Panel 3) ---

    /**
     * Rellena la lista de esquemas existentes en el Panel 3.
     */
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

    /**
     * Maneja el clic en un esquema de la lista para cargarlo.
     */
    function handleSchemaLoadClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;

        document.querySelectorAll('#schema-results-list .list-item.active').forEach(item => item.classList.remove('active'));
        target.classList.add('active');

        const schemaKey = target.dataset.schemaKey;
        if (!schemaKey || !masterSchemaMap[schemaKey]) {
            alert(`Error: No se pudo encontrar el esquema ${schemaKey}.`);
            return;
        }

        // Cargar el esquema (una copia profunda para evitar mutaciones)
        const schemaToLoad = JSON.parse(JSON.stringify(masterSchemaMap[schemaKey]));
        loadSchemaIntoEditor(schemaKey, schemaToLoad);
    }

    /**
     * Maneja el clic en "Crear Nuevo Esquema".
     */
    function handleSchemaCreateClick() {
        const newKey = dom.newSchemaKeyInput.value.trim().toLowerCase();
        
        // Validación simple
        if (newKey === "") {
            alert("Por favor, introduce una clave para el nuevo esquema (ej: monitores).");
            dom.newSchemaKeyInput.focus();
            return;
        }
        if (/\s/.test(newKey)) {
            alert("La clave del esquema no puede contener espacios.");
            dom.newSchemaKeyInput.focus();
            return;
        }
        if (masterSchemaMap[newKey]) {
            if (!confirm(`El esquema "${newKey}" ya existe. ¿Deseas cargarlo y sobrescribirlo?`)) {
                return;
            }
            // Cargar el esquema existente
            const schemaToLoad = JSON.parse(JSON.stringify(masterSchemaMap[newKey]));
            loadSchemaIntoEditor(newKey, schemaToLoad);
            // Activar el item en la lista si existe
            document.querySelector(`#schema-results-list .list-item[data-schema-key="${newKey}"]`)?.classList.add('active');
            return;
        }

        // Cargar un esquema vacío
        loadSchemaIntoEditor(newKey, []);
        dom.newSchemaKeyInput.value = '';
        // Desactivar items de la lista
        document.querySelectorAll('#schema-results-list .list-item.active').forEach(item => item.classList.remove('active'));
    }

    /**
     * Carga un esquema (array de grupos) en la interfaz del editor.
     * @param {string} key - La clave del esquema (ej: "tvs").
     * @param {Array} schema - El array de grupos de atributos.
     */
    function loadSchemaIntoEditor(key, schema) {
        currentEditingSchemaKey = key;
        
        // Actualizar UI
        dom.schemaTitle.textContent = `3. Editando Esquema: ${key}`;
        dom.schemaKeyDisplay.value = key;
        dom.schemaEditorPlaceholder.style.display = 'none';
        dom.schemaEditorForm.innerHTML = ''; // Limpiar editor
        
        // Habilitar controles
        dom.exportSchemaBtn.disabled = false;
        dom.addGroupBtn.disabled = false;

        // Rellenar el editor
        if (schema.length > 0) {
            schema.forEach(group => {
                addGroupToEditor(group);
            });
        }
    }

    /**
     * Añade un bloque de "Grupo" al editor de esquemas.
     * Si se proporciona un objeto `group`, rellena los campos.
     * @param {Object | null} group - El objeto de grupo (ej: { group: "GENERAL", attrs: [...] }).
     */
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
            <div class="schema-attributes-container">
                <!-- Atributos se añaden aquí -->
            </div>
        `;

        // Rellenar los atributos existentes
        const attributesContainer = groupElement.querySelector('.schema-attributes-container');
        if (groupAttrs.length > 0) {
            groupAttrs.forEach(attr => {
                addAttributeToGroup(attr, attributesContainer);
            });
        }

        dom.schemaEditorForm.appendChild(groupElement);
    }

    /**
     * Añade una fila de "Atributo" a un elemento de grupo.
     * Si se proporciona un objeto `attr`, rellena los campos.
     * @param {Object | null} attr - El objeto de atributo (ej: { code: "...", desc: "..." }).
     * @param {HTMLElement} groupContainer - El elemento DOM del contenedor de atributos del grupo.
     */
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

    /**
     * Manejador de eventos global para los botones dinámicos del editor de esquemas.
     */
    function handleSchemaEditorClicks(e) {
        const addAttrBtn = e.target.closest('.schema-add-attr-btn');
        const removeAttrBtn = e.target.closest('.schema-remove-attr-btn');
        const removeGroupBtn = e.target.closest('.schema-remove-group-btn');

        if (addAttrBtn) {
            e.preventDefault();
            const attributesContainer = addAttrBtn.closest('.schema-group-box').querySelector('.schema-attributes-container');
            addAttributeToGroup(null, attributesContainer); // Añadir fila vacía
            return;
        }

        if (removeAttrBtn) {
            e.preventDefault();
            removeAttrBtn.closest('.schema-attr-row').remove(); // Eliminar fila de atributo
            return;
        }

        if (removeGroupBtn) {
            e.preventDefault();
            if (confirm("¿Estás seguro de que quieres eliminar este grupo y todos sus atributos?")) {
                removeGroupBtn.closest('.schema-group-box').remove(); // Eliminar bloque de grupo
            }
            return;
        }
    }

    /**
     * Recoge los datos del editor de esquemas, los valida y genera un fichero .js.
     */
    function handleSchemaExportClick() {
        if (!currentEditingSchemaKey) {
            alert("No hay ningún esquema cargado para exportar.");
            return;
        }

        const newSchema = [];
        const groupElements = dom.schemaEditorForm.querySelectorAll('.schema-group-box');
        let isValid = true;
        let errorMsg = '';

        groupElements.forEach((groupEl, groupIndex) => {
            const groupNameInput = groupEl.querySelector('input[data-type="group-name"]');
            const groupName = groupNameInput.value.trim();

            if (groupName === "") {
                errorMsg = `Error: El Grupo #${groupIndex + 1} no tiene nombre.`;
                groupNameInput.focus();
                isValid = false;
                return;
            }

            const newGroup = {
                group: groupName,
                attrs: []
            };

            const attrElements = groupEl.querySelectorAll('.schema-attr-row');
            if (attrElements.length === 0) {
                 if (!confirm(`Aviso: El grupo "${groupName}" no tiene atributos. ¿Continuar igualmente?`)) {
                    isValid = false;
                    return;
                 }
            }

            attrElements.forEach((attrEl, attrIndex) => {
                const codeInput = attrEl.querySelector('input[data-type="attr-code"]');
                const descInput = attrEl.querySelector('input[data-type="attr-desc"]');
                const code = codeInput.value.trim();
                const desc = descInput.value.trim();

                if (code === "") {
                    errorMsg = `Error: Atributo #${attrIndex + 1} en el grupo "${groupName}" no tiene 'code'.`;
                    codeInput.focus();
                    isValid = false;
                    return;
                }
                if (desc === "") {
                    errorMsg = `Error: Atributo #${attrIndex + 1} (code: ${code}) en el grupo "${groupName}" no tiene 'desc'.`;
                    descInput.focus();
                    isValid = false;
                    return;
                }

                newGroup.attrs.push({ code, desc });
            });

            if (!isValid) return; // Salir del bucle de grupos
            newSchema.push(newGroup);
        });

        if (!isValid) {
            if (errorMsg) alert(errorMsg);
            return;
        }

        if (newSchema.length === 0) {
            alert("No se puede exportar un esquema vacío. Añade al menos un grupo.");
            return;
        }

        // Si todo es válido, generar el fichero .js
        const schemaKey = currentEditingSchemaKey;
        const schemaConstantName = `${schemaKey.toUpperCase()}_SCHEMA_GROUPS`;
        const schemaJSON = JSON.stringify(newSchema, null, 4); // Formateado

        const fileContent = `/**
 * Modulo de Esquema: ${schemaKey}
 * (Generado por Admin Panel v3.0.0)
 */

const ${schemaConstantName} = ${schemaJSON};

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este esquema
// con la clave "${schemaKey}".
if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('${schemaKey}', ${schemaConstantName});
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}
`;
        // Generar y descargar el archivo
        const filename = `modulo${schemaKey.charAt(0).toUpperCase() + schemaKey.slice(1)}.js`;
        downloadFile(filename, fileContent, 'text/javascript;charset=utf-8');

        alert(`¡Esquema "${schemaKey}" exportado como "${filename}"!\n\nNo olvides añadirlo a 'db/schemas/' y actualizar 'db/manifest.json'.`);
    }

    // --- Ejecución ---
    initialize();
});