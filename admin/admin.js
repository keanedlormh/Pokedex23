/*
 * Lógica del Panel de Administración v2.9.6
 * ACTUALIZADO: Exportación de modelos individuales a .json
 * AÑADIDO: Exportar gama completa a JSON.
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
        exportGamaJsonButton: document.getElementById('export-gama-json-btn') // [NUEVO]
    };
    
    // --- Base de Datos Local ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null;
    let currentLoadedModel = null;
    let activeDropdown = null;
    
    // --- Inicialización ---
    function initialize() {
        console.log("Admin Panel v2.9.6 inicializando...");
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;

            if (masterDatabase.length === 0) console.warn("La base de datos está vacía.");

            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));

            setupEventListeners();
            renderSearchResults(masterDatabase);
            populateGamaSelector();

            showPanel('edit-model'); // Mostrar panel por defecto

            console.log(`Admin DB cargada con ${masterDatabase.length} productos.`);
            console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);
            dom.exportButton.disabled = true;
            dom.exportGamaJsonButton.disabled = true; // [NUEVO] Deshabilitado al inicio
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
        // [NUEVO]

        // Panel 1 (continuación): Editor
        dom.exportButton.addEventListener('click', exportDataFromEditor);
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
        dom.allContentPanels.forEach(panel => panel.classList.remove('active'));
        dom.allMenuItems.forEach(button => button.classList.remove('active'));

        const panelToShow = document.getElementById(`panel-${panelId}`);
        const menuItemToActivate = document.querySelector(`.menu-item[data-tab="${panelId}"]`);

        if (panelToShow) panelToShow.classList.add('active');
        if (menuItemToActivate) {
            menuItemToActivate.classList.add('active');
            const parentTitle = menuItemToActivate.closest('.menu-group').querySelector('.menu-title');
            if(parentTitle) parentTitle.classList.add('active'); // Mantiene el menú padre activo
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

        document.querySelectorAll('.list-item.active').forEach(item => item.classList.remove('active'));
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
            // [NUEVO] Deshabilitar botón
            return;
        }

        dom.exportGamaJsonButton.disabled = false; 
        // [NUEVO] Habilitar botón
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

    // [NUEVA] Función para exportar la gama completa como JSON
    function exportGamaAsJson() {
        const selectedSchema = dom.gamaExportSelect.value;
        if (!selectedSchema) {
            alert("Por favor, selecciona una gama primero.");
            return;
        }

        // 1. Filtrar la base de datos completa para esta gama
        const productsToExport = masterDatabase.filter(p => p.schema_key === selectedSchema);
        if (productsToExport.length === 0) {
            alert("No hay productos en esta gama para exportar.");
            return;
        }

        // 2. Convertir el array de productos a un string JSON formateado
        const jsonString = JSON.stringify(productsToExport, null, 4);
        
        // 3. Generar el nombre del archivo
        // [CAMBIO v2.9.6] El nombre del archivo ya no necesita .txt
        const filename = `GAMA_${selectedSchema.toUpperCase()}.json`;
        
        // 4. Descargar el archivo
        // [CAMBIO v2.9.6] Se usa el MimeType de JSON
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
        
        // [CAMBIO v2.9.6] Esta función ahora genera .json
        generateAndDownloadProductFile(modifiedProduct, newModelId);
    }

    // --- Lógica de Exportación Genérica ---

    /**
     * [ACTUALIZADO v2.9.6] Genera el contenido de un archivo .json para un solo producto.
     */
    function generateAndDownloadProductFile(product, fileName) {
        
        // 1. Convertir el objeto del producto a un string JSON formateado
        const jsonString = JSON.stringify(product, null, 4);

        // 2. Generar el nombre del archivo .json
        const filename = `${fileName}.json`;

        // 3. Descargar el archivo usando el helper
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

    // --- Ejecución ---
    initialize();
});