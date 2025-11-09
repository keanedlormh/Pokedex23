/*
 * Enciclopedia Técnica Futurista - Lógica Principal (main.js) v2.2
 * AÑADIDO: Selector de Gama (Schema) para filtrar productos y atributos.
 */

// PASO 1: Creación de la base de datos global
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

// PASO 2: Espera al DOM
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Almacenamiento de Elementos del DOM ---
    const dom = {
        body: document.body,
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        
        // --- Sistema de Filtros ---
        smartFilterToggle: document.getElementById('smart-filter-toggle'),
        smartFilterPanel: document.getElementById('smart-filter-panel'),
        filterOverlay: document.getElementById('filter-overlay'),
        smartFilterContainer: document.getElementById('smart-filters-container'),
        schemaFilterSelect: document.getElementById('schema-filter-select'), // [NUEVO]
        
        // --- Barra de Filtros Activos ---
        activeFiltersBar: document.getElementById('active-filters-bar'),
        
        // --- Panel de Specs ---
        productDisplayPlaceholder: document.getElementById('product-placeholder'),
        productTitle: document.getElementById('product-title'),
        productSpecsContainer: document.getElementById('product-specs'),
        specControls: document.getElementById('spec-controls'),
        expandAllButton: document.getElementById('expand-all-btn'),
        collapseAllButton: document.getElementById('collapse-all-btn'),
        selectedModelDisplay: document.getElementById('selected-model-display')
    };

    const originalPlaceholder = dom.productDisplayPlaceholder;

    // --- 2. Base de Datos Principal ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let filterValueCache = {};
    let attrCodeToDescMap = {};

    // --- 3. Inicialización de la Aplicación ---

    function initialize() {
        console.log("Enciclopedia v2.2 inicializando...");
        
        masterDatabase = window.APP_DB.products;
        masterSchemaMap = window.APP_DB.schemas;
        masterDatabase.sort((a, b) => a.model.localeCompare(b.model));

        buildAttributeCache();
        buildFilterValueCache();

        setupEventListeners();
        
        populateSchemaSelector(); // [NUEVO]
        populateSmartFilters('all'); // [MODIFICADO] Cargar todos por defecto
        populateFullModelList(); 

        console.log(`Base de datos cargada con ${masterDatabase.length} productos.`);
        console.log(`Esquemas cargados: ${Object.keys(masterSchemaMap).join(', ')}`);
    }

    function setupEventListeners() {
        if (dom.modelSearchInput) {
            dom.modelSearchInput.addEventListener('input', applyFiltersAndSearch);
        }

        // [NUEVO] Listener para el selector de gama
        if (dom.schemaFilterSelect) {
            dom.schemaFilterSelect.addEventListener('change', () => {
                const selectedSchema = dom.schemaFilterSelect.value;
                // Limpiar filtros de atributos al cambiar de gama
                dom.smartFilterContainer.querySelectorAll('select').forEach(select => select.value = "");
                
                populateSmartFilters(selectedSchema); // Recargar panel de filtros
                applyFiltersAndSearch(); // Refrescar lista de productos
            });
        }
        
        if (dom.smartFilterContainer) {
            dom.smartFilterContainer.addEventListener('change', applyFiltersAndSearch);
            dom.smartFilterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-toggle-btn') || e.target.closest('.filter-group-title')) {
                    const titleEl = e.target.closest('.filter-group-title');
                    if (titleEl) {
                        toggleFilterGroup(titleEl);
                    }
                }
            });
        }
        
        if (dom.activeFiltersBar) {
            dom.activeFiltersBar.addEventListener('click', (e) => {
                if (e.target.classList.contains('chip-remove-btn')) {
                    removeActiveFilter(e.target.dataset.attrCode);
                }
            });
        }
        
        if (dom.modelSearchResults) {
            dom.modelSearchResults.addEventListener('click', handleResultClick);
        }

        if (dom.smartFilterToggle) {
            dom.smartFilterToggle.addEventListener('click', toggleFilterPanel);
        }
        if (dom.filterOverlay) {
            dom.filterOverlay.addEventListener('click', closeFilterPanel);
        }

        if (dom.expandAllButton) {
            dom.expandAllButton.addEventListener('click', expandAllSpecs);
        }
        if (dom.collapseAllButton) {
            dom.collapseAllButton.addEventListener('click', collapseAllSpecs);
        }
    }

    // --- 4. Lógica de Búsqueda y Filtro ---

    function populateFullModelList() {
        renderSearchResults(masterDatabase, dom.modelSearchResults);
    }

    function buildAttributeCache() {
        if (Object.keys(masterSchemaMap).length === 0) return;
        Object.values(masterSchemaMap).forEach(schema => {
            schema.forEach(group => {
                group.attrs.forEach(attr => {
                    attrCodeToDescMap[attr.code] = attr.desc;
                });
            });
        });
    }

    function buildFilterValueCache() {
        if (Object.keys(masterSchemaMap).length === 0) return;
        Object.values(masterSchemaMap).forEach(schema => {
            schema.forEach(group => {
                group.attrs.forEach(attr => {
                    if (!filterValueCache[attr.code]) { 
                        const uniqueValues = new Set();
                        masterDatabase.forEach(product => {
                            const value = product.attributes[attr.code];
                            if (value && value !== 'unknown') {
                                uniqueValues.add(value);
                            }
                        });
                        if (uniqueValues.size > 0) {
                            filterValueCache[attr.code] = [...uniqueValues].sort((a, b) => {
                                const numA = parseFloat(a);
                                const numB = parseFloat(b);
                                if (!isNaN(numA) && !isNaN(numB)) {
                                    return numA - numB;
                                }
                                return String(a).localeCompare(String(b));
                            });
                        }
                    }
                });
            });
        });
    }

    /**
     * [NUEVA FUNCIÓN] Rellena el dropdown de selección de gama.
     */
    function populateSchemaSelector() {
        if (!dom.schemaFilterSelect) return;
        const fragment = document.createDocumentFragment();
        Object.keys(masterSchemaMap).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            // Pone en mayúscula la primera letra (ej: 'soundbars' -> 'Soundbars')
            let friendlyName = key.charAt(0).toUpperCase() + key.slice(1);
            if (key === 'tvs') friendlyName = "TVs"; // Caso especial
            
            option.textContent = friendlyName;
            fragment.appendChild(option);
        });
        dom.schemaFilterSelect.appendChild(fragment);
    }


    /**
     * [MODIFICADO] Rellena los filtros según la gama seleccionada.
     */
    function populateSmartFilters(schemaKey = 'all') {
        if (!dom.smartFilterContainer || Object.keys(masterSchemaMap).length === 0) return;

        dom.smartFilterContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        let schemaList = [];
        if (schemaKey === 'all') {
            // Obtiene todos los esquemas (ej: [ [schemaSoundbars], [schemaTVs] ])
            schemaList = Object.values(masterSchemaMap); 
        } else if (masterSchemaMap[schemaKey]) {
            // Obtiene solo el esquema seleccionado (ej: [ [schemaTVs] ])
            schemaList = [ masterSchemaMap[schemaKey] ];
        }

        schemaList.forEach(schemaGroups => {
            schemaGroups.forEach(group => {
                const groupWrapper = document.createElement('div');
                groupWrapper.className = 'filter-group-wrapper';
                
                const title = document.createElement('h3');
                title.className = 'filter-group-title';

                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'filter-toggle-btn gray';
                
                title.appendChild(toggleBtn);
                title.appendChild(document.createTextNode(group.group));
                groupWrapper.appendChild(title);

                const rowsContainer = document.createElement('div');
                rowsContainer.className = 'filter-rows-container collapsed';
                
                let hasFiltersInGroup = false;

                group.attrs.forEach(attr => {
                    const values = filterValueCache[attr.code];
                    if (values && values.length > 0) {
                        hasFiltersInGroup = true;
                        const row = document.createElement('div');
                        row.className = 'filter-row';

                        const label = document.createElement('label');
                        label.htmlFor = `filter_${attr.code}`;
                        label.textContent = attr.desc;
                        label.title = attr.desc;

                        const select = document.createElement('select');
                        select.id = `filter_${attr.code}`;
                        select.className = 'futuristic-select';
                        select.dataset.attribute = attr.code;

                        const defaultOption = document.createElement('option');
                        defaultOption.value = "";
                        defaultOption.textContent = "---";
                        select.appendChild(defaultOption);

                        values.forEach(value => {
                            const option = document.createElement('option');
                            option.value = value;
                            option.textContent = value;
                            select.appendChild(option);
                        });

                        row.appendChild(label);
                        row.appendChild(select);
                        rowsContainer.appendChild(row);
                    }
                });

                if (hasFiltersInGroup) {
                    groupWrapper.appendChild(rowsContainer);
                    fragment.appendChild(groupWrapper);
                }
            });
        });

        dom.smartFilterContainer.appendChild(fragment);
    }

    function getAppliedFilters() {
        const filters = {};
        const selects = dom.smartFilterContainer.querySelectorAll('select');
        selects.forEach(select => {
            if (select.value) {
                filters[select.dataset.attribute] = select.value;
            }
        });
        return filters;
    }

    function applyFiltersAndSearch() {
        const textQuery = dom.modelSearchInput.value.toLowerCase().trim();
        const attributeFilters = getAppliedFilters();

        const filteredProducts = filterProducts(textQuery, attributeFilters);
        renderSearchResults(filteredProducts, dom.modelSearchResults);
        
        renderActiveFilters(attributeFilters);
    }

    /**
     * [MODIFICADO] Ahora filtra también por la gama seleccionada.
     */
    function filterProducts(textQuery, attributeFilters) {
        // [NUEVO] Obtener la gama seleccionada
        const selectedSchema = dom.schemaFilterSelect.value;
        
        const hasTextQuery = textQuery.length > 0;
        const hasAttributeFilters = Object.keys(attributeFilters).length > 0;
        const hasSchemaFilter = selectedSchema !== 'all';

        // Si no hay filtros, mostrar todo
        if (!hasTextQuery && !hasAttributeFilters && !hasSchemaFilter) {
            return masterDatabase;
        }

        return masterDatabase.filter(product => {
            // 1. Filtro de Gama (NUEVO)
            if (hasSchemaFilter && product.schema_key !== selectedSchema) {
                return false;
            }

            // 2. Filtro de Texto
            if (hasTextQuery && !product.model.toLowerCase().includes(textQuery)) {
                return false;
            }
            
            // 3. Filtro de Atributos
            if (hasAttributeFilters) {
                const match = Object.entries(attributeFilters).every(([attrCode, attrValue]) => {
                    return product.attributes[attrCode] === attrValue;
                });
                if (!match) {
                    return false;
                }
            }
            
            return true;
        });
    }

    function handleResultClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;

        document.querySelectorAll('.list-item.active').forEach(item => {
            item.classList.remove('active');
        });
        target.classList.add('active');

        closeFilterPanel();

        const model = target.dataset.model;
        if (!model) return;

        const product = masterDatabase.find(p => p.model === model);
        if (product) {
            displayProduct(product);
            expandAllSpecs();
            dom.body.classList.add('model-is-selected');
            showSelectedModelChip(product.model);
        }
    }

    // --- 5. Lógica de Renderizado ---
    function renderActiveFilters(filters) {
        if (!dom.activeFiltersBar) return;

        if (Object.keys(filters).length === 0) {
            dom.activeFiltersBar.className = 'active-filters-bar-hidden';
            dom.activeFiltersBar.innerHTML = '';
            return;
        }
        
        dom.activeFiltersBar.className = 'active-filters-bar-visible';
        dom.activeFiltersBar.innerHTML = ''; // Limpiar
        
        const fragment = document.createDocumentFragment();
        
        Object.entries(filters).forEach(([attrCode, attrValue]) => {
            const attrDesc = attrCodeToDescMap[attrCode] || attrCode; // Usar caché
            
            const chip = document.createElement('div');
            chip.className = 'active-filter-chip';
            
            chip.innerHTML = `
                <span class="chip-label">
                    <span class="filter-name">${attrDesc}:</span>
                    <span class="filter-value">${attrValue}</span>
                </span>
                <button class="chip-remove-btn" data-attr-code="${attrCode}" title="Eliminar filtro">&times;</button>
            `;
            fragment.appendChild(chip);
        });
        
        dom.activeFiltersBar.appendChild(fragment);
    }
    
    function removeActiveFilter(attrCode) {
        const select = dom.smartFilterContainer.querySelector(`#filter_${attrCode}`);
        if (select) {
            select.value = ""; // Resetear el <select>
        }
        applyFiltersAndSearch(); // Refrescar la UI
    }

    function renderSearchResults(results, container) {
        if (!container) return;
        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div class="list-item" style="cursor: default; background: none; color: var(--color-text-dim);">No se encontraron resultados.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();
        results.forEach(product => {
            const item = document.createElement('div');
            item.className = 'list-item'; 
            item.dataset.model = product.model;
            item.textContent = product.model;
            fragment.appendChild(item);
        });

        container.appendChild(fragment);
    }

    function displayProduct(product) {
        if (dom.productDisplayPlaceholder) {
            dom.productDisplayPlaceholder.style.display = 'none';
        }
        if (dom.specControls) {
            dom.specControls.className = 'spec-controls-visible'; 
        }

        dom.productTitle.textContent = product.model;
        const productSchema = masterSchemaMap[product.schema_key]; 
        
        if (productSchema) {
            renderProductSpecs(product.attributes, productSchema);
        } else {
            console.error(`Error: No se encontró el esquema "${product.schema_key}" para el modelo ${product.model}.`);
            dom.productSpecsContainer.innerHTML = '<p class="text-gray-400">Error: No se pudo cargar la estructura de especificaciones.</p>';
        }
    }

    function renderProductSpecs(attributes, schema) {
        dom.productSpecsContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        schema.forEach(group => {
            const details = document.createElement('details');
            details.className = 'spec-group';
            
            const summary = document.createElement('summary');
            summary.textContent = group.group;
            details.appendChild(summary);

            const content = document.createElement('div');
            content.className = 'spec-group-content';

            let hasContentInGroup = false; 

            group.attrs.forEach(attr => {
                const value = attributes[attr.code];
                
                if (value && value !== 'unknown') {
                    hasContentInGroup = true;
                    const specItem = document.createElement('div');
                    specItem.className = 'spec-row';
                    specItem.innerHTML = `
                        <span class="attr-desc">${attr.desc}</span>
                        <span class="attr-value">${value}</span>
                    `;
                    content.appendChild(specItem);
                }
            });

            if (hasContentInGroup) {
                details.appendChild(content);
                fragment.appendChild(details);
            }
        });

        dom.productSpecsContainer.appendChild(fragment);
    }
    
    // --- 6. FUNCIONES DE ESTADO Y PANEL (v2.0) ---
    function showSelectedModelChip(modelName) {
        dom.selectedModelDisplay.innerHTML = `
            <button id="clear-selection-btn" class="model-chip-button" title="Volver al buscador">
                Modelo: ${modelName} 
                <span>&times;</span>
            </button>`;
        
        dom.selectedModelDisplay.querySelector('#clear-selection-btn')
            .addEventListener('click', clearSelection);
    }

    /**
     * [MODIFICADO] Resetea también el selector de gama.
     */
    function clearSelection() {
        dom.body.classList.remove('model-is-selected');
        dom.selectedModelDisplay.innerHTML = '';
        dom.productTitle.textContent = 'Selecciona un producto';
        dom.specControls.className = 'spec-controls-hidden';
        dom.productSpecsContainer.innerHTML = '';
        dom.productSpecsContainer.appendChild(originalPlaceholder);
        originalPlaceholder.style.display = 'block';
        
        dom.modelSearchInput.value = '';
        // Resetear todos los <select> en el panel de filtros
        dom.smartFilterContainer.querySelectorAll('select').forEach(select => select.value = "");
        
        // [NUEVO] Resetear el selector de gama a "Todas"
        if (dom.schemaFilterSelect) {
            dom.schemaFilterSelect.value = 'all';
        }

        // [NUEVO] Recargar todos los filtros
        populateSmartFilters('all');
        
        applyFiltersAndSearch(); // Recargar lista y limpiar barra de filtros activos
        
        const currentActive = dom.modelSearchResults.querySelector('.list-item.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }
    }

    function expandAllSpecs() {
        const allGroups = dom.productSpecsContainer.querySelectorAll('details.spec-group');
        allGroups.forEach(group => group.open = true);
    }

    function collapseAllSpecs() {
        const allGroups = dom.productSpecsContainer.querySelectorAll('details.spec-group');
        allGroups.forEach(group => group.open = false);
    }

    function openFilterPanel() {
        if (!dom.smartFilterPanel || !dom.filterOverlay || !dom.smartFilterToggle) return;
        dom.smartFilterPanel.className = 'smart-filter-content-open';
        dom.filterOverlay.className = 'overlay-visible';
        dom.smartFilterToggle.classList.add('active');
    }

    function closeFilterPanel() {
        if (!dom.smartFilterPanel || !dom.filterOverlay || !dom.smartFilterToggle) return;
        dom.smartFilterPanel.className = 'smart-filter-content-hidden';
        dom.filterOverlay.className = 'overlay-hidden';
        dom.smartFilterToggle.classList.remove('active');
    }
    
    function toggleFilterPanel() {
        if (!dom.smartFilterPanel) return;
        if (dom.smartFilterPanel.className === 'smart-filter-content-hidden') {
            openFilterPanel();
        } else {
            closeFilterPanel();
        }
    }

    function toggleFilterGroup(titleElement) {
        const btn = titleElement.querySelector('.filter-toggle-btn');
        const rowsContainer = titleElement.nextElementSibling;

        if (rowsContainer && btn) {
            if (rowsContainer.classList.contains('collapsed')) {
                rowsContainer.classList.remove('collapsed');
                rowsContainer.classList.add('expanded');
                btn.classList.remove('gray');
                btn.classList.add('blue');
            } else {
                rowsContainer.classList.remove('expanded');
                rowsContainer.classList.add('collapsed');
                btn.classList.remove('blue');
                btn.classList.add('gray');
            }
        }
    }

    // --- 7. Ejecución ---
    initialize();
});
