/*
 * Lógica del Panel de Administración v3.1.10
 * [CAMBIO v3.1.10] Implementada la lógica de tema
 * claro/oscuro de la app principal.
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

        // Panel Hub: Modelo
        panelModelHub: document.getElementById('panel-model-hub'),
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),

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

    
    // --- [NUEVO v3.1.10] Lógica de Tema (Portado de main.js) ---
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


    // --- Inicialización ---
    function initialize() {
        console.log("Admin Panel v3.1.10 inicializando...");
        
        // [CAMBIO v3.1.10] Aplicar tema oscuro por defecto
        updatePaletteCSS(darkPaletteHSL, currentAccentHue);
        dom.themeBtn.innerHTML = '🎨 Tema'; // Poner texto estático

        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;

            if (masterDatabase.length === 0) console.warn("La base de datos está vacía.");

            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));

            setupEventListeners();
            
            // Rellenar listas de hubs
            renderSearchResults(masterDatabase);
            populateSchemaList(); 
            populateGamaSelector(); 

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
        // [CAMBIO v3.1.10] El botón de tema ahora llama a handleThemeToggle
        dom.themeBtn.addEventListener('click', handleThemeToggle); 
        dom.infoBtn.addEventListener('click', showInfoModal);
        dom.closeInfoModalBtn.addEventListener('click', hideInfoModal);
        dom.modalOverlay.addEventListener('click', () => {
            hideInfoModal();
            toggleSettingsMenu(false); // Forzar cierre del menú
        });
        
        // Clic fuera del menú de ajustes
        document.addEventListener('click', (e) => {
            if (dom.settingsMenu && dom.settingsBtn) {
                 if (dom.settingsMenu.style.display === 'block' && 
                    !dom.settingsMenu.contains(e.target) && 
                    !dom.settingsBtn.contains(e.target)) {
                    toggleSettingsMenu(false); // Forzar cierre
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
        
        // Ocultar todos los paneles
        dom.allContentPanels.forEach(panel => panel.classList.remove('active'));
        
        // Limpiar clases del body y botón Guardar
        document.body.classList.remove('fullscreen-editor-active');
        dom.saveBtn.style.display = 'none';

        // Ocultar menú de ajustes si está abierto
        toggleSettingsMenu(false); // Forzar cierre

        const panelToShow = document.getElementById(`panel-${panelId}`);
        if (!panelToShow) {
            console.error(`Panel con ID 'panel-${panelId}' no encontrado.`);
            return;
        }

        panelToShow.classList.add('active');

        // Configurar UI para editores
        if (panelId === 'edit-model' || panelId === 'edit-schema') {
            document.body.classList.add('fullscreen-editor-active');
            dom.saveBtn.style.display = 'block';
        }
    }

    // --- [REFACTORIZADO v3.1.10] Lógica de Ajustes, Tema y Modal ---

    /**
     * @param {boolean} [forceState] - Opcional. true para abrir, false para cerrar.
     */
    function toggleSettingsMenu(forceState) {
        const currentState = dom.settingsMenu.style.display === 'block';
        const newState = (forceState !== undefined) ? forceState : !currentState;
        
        dom.settingsMenu.style.display = newState ? 'block' : 'none';
        
        // Sincronizar overlay
        if (newState) {
            hideInfoModal(); // Cierra el modal si está abierto
            dom.modalOverlay.style.display = 'block';
        } else if (dom.infoModal.style.display === 'none') {
            dom.modalOverlay.style.display = 'none';
        }
    }

    function showInfoModal() {
        dom.infoModal.style.display = 'block';
        dom.modalOverlay.style.display = 'block';
        toggleSettingsMenu(false); // Forzar cierre del menú
    }

    function hideInfoModal() {
        dom.infoModal.style.display = 'none';
        if (dom.settingsMenu.style.display === 'none') {
             dom.modalOverlay.style.display = 'none';
        }
    }

    // --- Lógica de Tema (Portado de main.js) ---

    function handleThemeToggle() {
        isLightMode = !isLightMode; // Alternar estado

        if (isLightMode) {
            // CAMBIANDO A MODO CLARO
            document.body.classList.add('light-mode');
            updatePaletteCSS(lightPaletteHSL, currentAccentHue);
        } else {
            // CAMBIANDO A MODO OSCURO
            document.body.classList.remove('light-mode');
            currentAccentHue = Math.floor(Math.random() * 360); // Nuevo color al volver a oscuro
            updatePaletteCSS(darkPaletteHSL, currentAccentHue);
        }
        
        // No cerrar el menú
        // toggleSettingsMenu(false); 
    }

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

    // (Panel Hub: Modelo) -> Clic en un modelo
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
        if (!schemaKey || !masterSchemaMap[schemaKey]) {
            alert(`Error: No se pudo encontrar el esquema ${schemaKey}.`);
            return;
        }

        const schemaToLoad = JSON.parse(JSON.stringify(masterSchemaMap[schemaKey]));
        loadSchemaIntoEditor(schemaKey, schemaToLoad);
        showPanel('edit-schema'); // Navegar al editor
    }

    // (Panel Hub: Esquema) -> Clic en "Crear"
    function handleSchemaCreateClick() {
        const newKey = dom.newSchemaKeyInput.value.trim().toLowerCase();
        
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
            showPanel('edit-schema'); // Navegar al editor
            return;
        }

        // Cargar un esquema vacío
        loadSchemaIntoEditor(newKey, []);
        dom.newSchemaKeyInput.value = '';
        showPanel('edit-schema'); // Navegar al editor
    }


    // --- Lógica de Exportar Gama (Panel 2) ---

    function populateGamaSelector() {
        if (!dom.gamaExportSelect) return;
        dom.gamaExportSelect.innerHTML = '<option value="">-- Seleccionar --</option>'; // Resetear
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

    // --- Lógica del Editor de Modelo (Panel 1) ---

    function loadModelIntoEditor(product) {
        currentLoadedSchemaKey = product.schema_key; // Guardar para construir formulario
        const schema = masterSchemaMap[product.schema_key];

        if (!schema) {
            alert(`Error: No se encontró el esquema "${product.schema_key}"`);
            return;
        }

        // Rellenar campos clave (que ahora están fijos en el form)
        dom.productTitle.textContent = `Editando: ${product.model}`;
        dom.editModelIdInput.value = product.model;
        dom.editSchemaKeyDisplay.value = product.schema_key;

        // Limpiar solo el contenido generado anteriormente
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
        
        // Añadir el nuevo contenido al formulario
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
            alert("No hay ningún modelo cargado en el editor para guardar.");
            return;
        }

        // Leer el Model ID desde el campo de entrada (que ahora está en el form)
        const newModelId = dom.editModelIdInput.value.trim().toUpperCase();
        if (newModelId === "") {
            alert("Por favor, introduce un 'Model ID' para guardar.");
            dom.editModelIdInput.focus();
            return;
        }

        const formData = new FormData(dom.editorForm);
        const newAttributes = {};
        for (const [key, value] of formData.entries()) {
            // Evitar guardar los campos de clave como atributos
            if (key !== 'edit-model-id' && key !== 'edit-schema-key-display') {
                 if (value.trim() !== "") {
                    newAttributes[key] = value.trim();
                }
            }
        }

        const modifiedProduct = {
            model: newModelId,
            schema_key: currentLoadedSchemaKey, // Usar la clave guardada al cargar
            attributes: newAttributes
        };
        
        generateAndDownloadProductFile(modifiedProduct, newModelId);
        alert(`Modelo "${newModelId}" guardado como .json.`);
        // Actualizar título por si cambió el nombre
        dom.productTitle.textContent = `Editando: ${newModelId}`;
    }

    // --- Lógica de Exportación Genérica ---

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
        // Rellenar campo clave (que ahora está fijo en el div)
        dom.schemaTitle.textContent = `Editando Esquema: ${key}`;
        dom.editSchemaKeyInput.value = key;

        // Limpiar solo los grupos generados anteriormente
        dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(el => el.remove());
        dom.schemaEditorPlaceholder.style.display = 'none';

        // Habilitar controles
        dom.addGroupBtn.disabled = false;

        // Rellenar el editor con los nuevos grupos
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
            <div class="schema-attributes-container">
                <!-- Atributos se añaden aquí -->
            </div>
        `;

        const attributesContainer = groupElement.querySelector('.schema-attributes-container');
        if (groupAttrs.length > 0) {
            groupAttrs.forEach(attr => {
                addAttributeToGroup(attr, attributesContainer);
            });
        }
        // Añadir al contenedor del formulario
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
            if (confirm("¿Estás seguro de que quieres eliminar este grupo y todos sus atributos?")) {
                removeGroupBtn.closest('.schema-group-box').remove();
            }
            return;
        }
    }

    function handleSchemaExportClick() {
        // Leer la clave del esquema DESDE EL FORMULARIO
        const schemaKeyInput = dom.schemaEditorForm.querySelector('#edit-schema-key');
        const schemaKey = schemaKeyInput ? schemaKeyInput.value.trim().toLowerCase() : '';

        if (schemaKey === "") {
            alert("No se puede guardar. La 'Schema Key' no puede estar vacía.");
            if(schemaKeyInput) schemaKeyInput.focus();
            return;
        }
        if (/\s/.test(schemaKey)) {
            alert("La clave del esquema no puede contener espacios.");
            if(schemaKeyInput) schemaKeyInput.focus();
            return;
        }

        const newSchema = [];
        // Buscar los grupos dentro del contenedor del formulario
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

            if (!isValid) return; 
            newSchema.push(newGroup);
        });

        if (!isValid) {
            if (errorMsg) alert(errorMsg);
            return;
        }
        if (newSchema.length === 0) {
            alert("No se puede guardar un esquema vacío. Añade al menos un grupo.");
            return;
        }

        // Generar el fichero .js
        const schemaConstantName = `${schemaKey.toUpperCase()}_SCHEMA_GROUPS`;
        const schemaJSON = JSON.stringify(newSchema, null, 4); // Formateado

        const fileContent = `/**
 * Modulo de Esquema: ${schemaKey}
 * (Generado por Admin Panel v3.1.10)
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
        const filename = `modulo${schemaKey.charAt(0).toUpperCase() + schemaKey.slice(1)}.js`;
        downloadFile(filename, fileContent, 'text/javascript;charset=utf-8');

        alert(`¡Módulo de gama "${schemaKey}" guardado como "${filename}"!\n\nNo olvides añadirlo a 'db/schemas/' y actualizar 'db/manifest.json'.`);
        dom.schemaTitle.textContent = `Editando Esquema: ${schemaKey}`;
    }

    // --- Ejecución ---
    initialize();
});