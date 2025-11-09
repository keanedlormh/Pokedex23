/*
 * Lógica del Panel de Administración v2.8
 * AÑADIDO: Panel de exportación por gama.
 * REFACTOR: Lógica de exportación genérica.
 */

// window.APP_DB se define en admin/index.html

document.addEventListener('DOMContentLoaded', () => {

    // --- Almacenamiento de Elementos del DOM ---
    const dom = {
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        productTitle: document.getElementById('product-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),
        newModelIdInput: document.getElementById('new-model-id'),
        exportButton: document.getElementById('export-btn'),
        
        // [NUEVO] Panel de Exportar Gama
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list')
    };

    // --- Base de Datos Local ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null;
    let currentLoadedModel = null;

    // --- Inicialización ---
    function initialize() {
        console.log("Admin Panel v2.8 inicializando...");
        
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;
            
            if (masterDatabase.length === 0) {
                console.warn("La base de datos está vacía.");
            }

            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
            
            setupEventListeners();
            renderSearchResults(masterDatabase);
            populateGamaSelector(); // [NUEVO]
            
            console.log(`Admin DB cargada con ${masterDatabase.length} productos.`);
            console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);
            dom.exportButton.disabled = true;
        }, 100);
    }

    function setupEventListeners() {
        // Panel 1: Cargar en Editor
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        
        // Panel 2: Exportar Gama
        dom.gamaExportSelect.addEventListener('change', populateGamaExportList);
        dom.gamaExportList.addEventListener('click', handleGamaExportClick);
        
        // Panel 3: Editor
        dom.exportButton.addEventListener('click', exportDataFromEditor);
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

    // --- [NUEVA] Lógica de Exportar Gama (Panel 2) ---
    
    /**
     * Rellena el dropdown de selección de gama en el Panel 2.
     */
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

    /**
     * Rellena la lista de exportación cuando se cambia el dropdown.
     */
    function populateGamaExportList() {
        const selectedSchema = dom.gamaExportSelect.value;
        dom.gamaExportList.innerHTML = ''; // Limpiar
        
        if (!selectedSchema) return;

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
                    Descargar .txt
                </button>
            `;
            fragment.appendChild(item);
        });
        dom.gamaExportList.appendChild(fragment);
    }

    /**
     * Maneja el clic en un botón de descarga individual (Panel 2).
     */
    function handleGamaExportClick(e) {
        const target = e.target.closest('.export-item-button');
        if (!target) return;

        const modelId = target.dataset.model;
        const product = masterDatabase.find(p => p.model === modelId);

        if (product) {
            // Exporta el producto original tal cual
            generateAndDownloadProductFile(product, product.model);
        } else {
            alert(`Error: No se pudo encontrar el modelo ${modelId} en la base de datos.`);
        }
    }


    // --- Lógica del Editor (Panel 3) ---
    
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
        dom.productTitle.textContent = `3. Editando: ${product.model}`;
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

    /**
     * Maneja el clic en el botón "Exportar" del Editor (Panel 3).
     */
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

        // Recoge los datos *modificados* del formulario
        const formData = new FormData(dom.editorForm);
        const newAttributes = {};
        for (const [key, value] of formData.entries()) {
            if (value.trim() !== "") {
                newAttributes[key] = value.trim();
            }
        }
        
        // Crea un objeto producto *temporal* con los nuevos datos
        const modifiedProduct = {
            model: newModelId,
            schema_key: currentLoadedSchemaKey,
            attributes: newAttributes
        };

        generateAndDownloadProductFile(modifiedProduct, newModelId);
    }


    // --- [REFACTORIZADO] Lógica de Exportación Genérica ---
    
    /**
     * Genera el contenido del archivo .js y lo descarga como .txt.
     * @param {object} product - El objeto producto (original o modificado).
     * @param {string} fileName - El nombre del modelo (Model ID) para el archivo.
     */
    function generateAndDownloadProductFile(product, fileName) {
        
        const variableName = `${fileName.replace(/\./g, '_')}_DATA`;
        
        const fileContent = `/**
 * Ficha de producto: ${product.model}
 * (Generado por Admin Panel v2.8)
 */

const ${variableName} = {
    "model": "${product.model}",
    "schema_key": "${product.schema_key}",
    "attributes": ${JSON.stringify(product.attributes, null, 4)}
};

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este producto
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(${variableName});
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}
`;

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.js.txt`; // Exportar como .txt
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Ejecución ---
    initialize();
});