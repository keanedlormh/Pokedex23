/*
 * Lógica del Panel de Administración v2.6
 * Esta es una aplicación separada y no interactúa con main.js.
 */

// 1. Crear el objeto APP_DB local para esta página
// Los scripts ../db/ rellenarán este objeto.
window.APP_DB = {
    products: [],
    schemas: {},
    registerProduct: function(product) {
        this.products.push(product);
    },
    registerSchema: function(key, schemaGroups) {
        this.schemas[key] = schemaGroups;
    }
};

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
    let currentLoadedSchemaKey = null; // 'tvs' o 'soundbars'
    let currentLoadedModel = null; // El modelo original cargado

    // --- Inicialización ---
    function initialize() {
        console.log("Admin Panel v2.6 inicializando...");
        
        // Esperar un breve momento para que se carguen los scripts de ../db/
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;
            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
            
            setupEventListeners();
            renderSearchResults(masterDatabase); // Mostrar todos al inicio
            
            console.log(`Admin DB cargada con ${masterDatabase.length} productos.`);
            console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);
            dom.exportButton.disabled = true; // Desactivar hasta que se cargue un modelo
        }, 100); // 100ms de retardo para la carga de scripts
    }

    function setupEventListeners() {
        dom.modelSearchInput.addEventListener('input', applySearch);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.exportButton.addEventListener('click', exportDataAsTxt);
    }

    // --- Lógica de Búsqueda ---
    function applySearch() {
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
        dom.editorForm.innerHTML = ''; // Limpiar formulario
        dom.productTitle.textContent = `Editando: ${product.model}`;
        dom.newModelIdInput.value = product.model; // Poner el ID actual por defecto
        
        const fragment = document.createDocumentFragment();

        // Rellenar el formulario basado en el ESQUEMA, no en los datos
        // Esto asegura que incluso los campos vacíos ("unknown") aparezcan
        schema.forEach(group => {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'form-group-title';
            groupTitle.textContent = group.group;
            fragment.appendChild(groupTitle);

            group.attrs.forEach(attr => {
                const value = product.attributes[attr.code] || ""; // Obtener valor o string vacío
                
                const row = document.createElement('div');
                row.className = 'form-row';

                const label = document.createElement('label');
                label.className = 'futuristic-label';
                label.htmlFor = `attr_${attr.code}`;
                label.textContent = `${attr.desc} (${attr.code})`;

                const textarea = document.createElement('textarea');
                textarea.className = 'futuristic-textarea';
                textarea.id = `attr_${attr.code}`;
                textarea.name = attr.code; // Usar 'name' para el FormData
                textarea.rows = 1; // Empezar pequeño
                textarea.textContent = value;
                
                // Auto-ajustar altura
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
        dom.exportButton.disabled = false; // Activar botón de exportar

        // Ajustar altura de todos los textareas después de añadirlos al DOM
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

        // 1. Recoger todos los datos del formulario
        const formData = new FormData(dom.editorForm);
        const newAttributes = {};
        for (const [key, value] of formData.entries()) {
            if (value.trim() !== "") { // Solo guardar atributos con valor
                newAttributes[key] = value.trim();
            }
        }

        // 2. Generar el contenido del archivo .js (como texto)
        const variableName = `${newModelId.replace(/\./g, '_')}_DATA`; // Ej: OLED65C54LA_AEU_DATA
        
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

        // 3. Crear y descargar el archivo .txt
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${newModelId}.js.txt`; // El usuario pidió .txt
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Ejecución ---
    initialize();
});