/*
 * Lógica del Panel de Administración v2.6.1
 * AÑADIDO: La lista de modelos se oculta al seleccionar uno.
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
        exportButton: document.getElementById('export-btn')
    };

    // --- Base de Datos Local ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let currentLoadedSchemaKey = null;
    let currentLoadedModel = null;

    // --- Inicialización ---
    function initialize() {
        console.log("Admin Panel v2.6.1 inicializando...");
        
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;
            
            if (masterDatabase.length === 0) {
                console.warn("La base de datos está vacía. ¿Se cargaron los scripts de ../db/?");
            }

            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
            
            setupEventListeners();
            renderSearchResults(masterDatabase);
            
            console.log(`Admin DB cargada con ${masterDatabase.length} productos.`);
            console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);
            dom.exportButton.disabled = true;
        }, 100);
    }

    function setupEventListeners() {
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.exportButton.addEventListener('click', exportDataAsTxt);
    }

    // --- Lógica de Búsqueda ---
    function applySearch() {
        // [MODIFICADO] Vuelve a mostrar la lista cuando el usuario escribe
        dom.modelSearchResults.classList.remove('list-collapsed');
        
        const textQuery = dom.modelSearchInput.value.toLowerCase().trim();
        if (textQuery === "") {
            renderSearchResults(masterDatabase);
            return;
        }
        const filteredProducts = masterDatabase.filter(product => {
            return product.model.toLowerCase().includes(textQuery);
        });
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

        document.querySelectorAll('.list-item.active').forEach(item => {
            item.classList.remove('active');
        });
        target.classList.add('active');

        const model = target.dataset.model;
        if (!model) return;

        const product = masterDatabase.find(p => p.model === model);
        if (product) {
            loadModelIntoEditor(product);
            // [MODIFICADO] Oculta la lista después de la selección
            dom.modelSearchResults.classList.add('list-collapsed');
        }
    }

    // --- Lógica del Editor ---
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
        dom.productTitle.textContent = `Editando: ${product.model}`;
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

    // --- Lógica de Exportación ---
    function exportDataAsTxt() {
        if (!currentLoadedModel || !currentLoadedSchemaKey) {
            alert("No hay ningún modelo cargado para exportar.");
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

        const variableName = `${newModelId.replace(/\./g, '_')}_DATA`;
        
        const fileContent = `/**
 * Ficha de producto: ${newModelId}
 * (Generado por Admin Panel)
 */

const ${variableName} = {
    "model": "${newModelId}",
    "schema_key": "${currentLoadedSchemaKey}",
    "attributes": ${JSON.stringify(newAttributes, null, 4)}
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
        link.download = `${newModelId}.js.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Ejecución ---
    initialize();
});
