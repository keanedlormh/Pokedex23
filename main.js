/*
 * Enciclopedia Técnica Futurista - Lógica Principal (main.js) v4.2.0
 * Update: Parser CSV robusto compatible con Excel, limpieza de BOM y gestión de Gamas.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Elementos DOM ---
    const dom = {
        body: document.body,
        // Búsqueda y Resultados
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        modelListHeader: document.getElementById('model-list-header'),
        
        // Filtros
        smartFilterToggle: document.getElementById('smart-filter-toggle'),
        smartFilterPanel: document.getElementById('smart-filter-panel'),
        filterOverlay: document.getElementById('filter-overlay'),
        smartFilterContainer: document.getElementById('smart-filters-container'),
        schemaFilterSelect: document.getElementById('schema-filter-select'),
        activeFiltersBar: document.getElementById('active-filters-bar'),
        
        // Menú Ajustes
        settingsMenuToggle: document.getElementById('settings-menu-toggle'),
        settingsMenuPanel: document.getElementById('settings-menu-panel'),
        paletteToggleButton: document.getElementById('palette-toggle-btn'),
        infoToggleButton: document.getElementById('info-toggle-btn'),
        adminLinkButton: document.getElementById('admin-link-btn'),
        libraryBtn: document.getElementById('library-menu-toggle'),
        
        // Modal Info
        readmeModal: document.getElementById('readme-modal'),
        readmeContent: document.getElementById('readme-content'),
        readmeCloseButton: document.getElementById('readme-close-btn'),
        
        // Detalles Producto
        productDisplayPlaceholder: document.getElementById('product-placeholder'),
        productTitle: document.getElementById('product-title'),
        productSpecsContainer: document.getElementById('product-specs'),
        specControls: document.getElementById('spec-controls'),
        expandAllButton: document.getElementById('expand-all-btn'),
        collapseAllButton: document.getElementById('collapse-all-btn'),
        selectedModelDisplay: document.getElementById('selected-model-display'),

        // Biblioteca (Modal)
        libraryModal: document.getElementById('library-modal'),
        libraryCloseBtn: document.getElementById('library-close-btn'),
        libraryGamaList: document.getElementById('library-gama-list'),
        csvUploadInput: document.getElementById('csv-upload-input'),
        uploadStatusText: document.getElementById('upload-status-text')
    };

    const originalPlaceholder = dom.productDisplayPlaceholder;
    let masterDatabase = [];
    let masterSchemaMap = {};
    let attrCodeToDescMap = {};
    let activeSchemas = new Set(); 

    // --- Tema ---
    const darkPaletteHSL = { accent: { h: 188, s: 96, l: 41 }, dark: { h: 210, s: 29, l: 8 }, medium: { h: 210, s: 19, l: 11 }, border: { h: 210, s: 16, l: 15 }, textP: { h: 210, s: 29, l: 92 }, textS: { h: 210, s: 12, l: 67 } };
    const lightPaletteHSL = { accent: { h: 188, s: 86, l: 40 }, dark: { h: 210, s: 20, l: 98 }, medium: { h: 210, s: 19, l: 94 }, border: { h: 210, s: 16, l: 85 }, textP: { h: 210, s: 29, l: 10 }, textS: { h: 210, s: 12, l: 40 } };
    
    let isLightMode = true; 
    let currentAccentHue = darkPaletteHSL.accent.h;

    function initialize() {
        setTimeout(() => {
            masterDatabase = window.APP_DB.products;
            masterSchemaMap = window.APP_DB.schemas;
            if (masterDatabase.length === 0) console.warn("Base de datos vacía.");
            masterDatabase.sort((a, b) => a.model.localeCompare(b.model));
            
            Object.keys(masterSchemaMap).forEach(k => activeSchemas.add(k));

            buildAttributeCache();
            setupEventListeners();
            populateSchemaSelector();
            populateSmartFilters('all');
            populateFullModelList(); 
            
            currentAccentHue = Math.floor(Math.random() * 360);
            updatePaletteCSS(lightPaletteHSL, currentAccentHue);
            
            dom.paletteToggleButton.innerHTML = '🎨 Tema';
        }, 100);
    }

    function setupEventListeners() {
        if (dom.modelSearchInput) dom.modelSearchInput.addEventListener('input', applyFiltersAndSearch);
        if (dom.schemaFilterSelect) {
            dom.schemaFilterSelect.addEventListener('change', () => {
                populateSmartFilters(dom.schemaFilterSelect.value);
                applyFiltersAndSearch();
            });
        }
        if (dom.smartFilterContainer) {
            dom.smartFilterContainer.addEventListener('change', applyFiltersAndSearch);
            dom.smartFilterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-toggle-btn') || e.target.closest('.filter-group-title')) {
                    const titleEl = e.target.closest('.filter-group-title');
                    if (titleEl) toggleFilterGroup(titleEl);
                }
            });
        }
        if (dom.activeFiltersBar) {
            dom.activeFiltersBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.chip-remove-btn');
                if (btn) {
                    e.preventDefault(); e.stopPropagation();
                    const action = btn.dataset.action;
                    action === 'remove-schema' ? removeSchemaFilter() : removeActiveFilter(btn.dataset.attrCode);
                }
            });
        }
        if (dom.modelSearchResults) dom.modelSearchResults.addEventListener('click', handleResultClick);
        if (dom.smartFilterToggle) dom.smartFilterToggle.addEventListener('click', toggleFilterPanel);
        if (dom.settingsMenuToggle) dom.settingsMenuToggle.addEventListener('click', toggleSettingsMenu);
        
        if (dom.filterOverlay) {
            dom.filterOverlay.addEventListener('click', () => {
                closeFilterPanel(); closeSettingsMenu(); closeReadmeModal(); closeLibraryModal();
            });
        }
        if (dom.readmeCloseButton) dom.readmeCloseButton.addEventListener('click', closeReadmeModal);
        if (dom.expandAllButton) dom.expandAllButton.addEventListener('click', expandAllSpecs);
        if (dom.collapseAllButton) dom.collapseAllButton.addEventListener('click', collapseAllSpecs);
        if (dom.paletteToggleButton) dom.paletteToggleButton.addEventListener('click', handleThemeToggle);
        if (dom.infoToggleButton) dom.infoToggleButton.addEventListener('click', showReadmeInfo);

        if (dom.libraryBtn) dom.libraryBtn.addEventListener('click', openLibraryModal);
        if (dom.libraryCloseBtn) dom.libraryCloseBtn.addEventListener('click', closeLibraryModal);
        if (dom.csvUploadInput) dom.csvUploadInput.addEventListener('change', handleCsvUpload);
        if (dom.libraryGamaList) dom.libraryGamaList.addEventListener('change', handleGamaToggle);
    }

    // --- Lógica Filtros ---
    function removeActiveFilter(attrCode) {
        const allSelects = Array.from(dom.smartFilterContainer.querySelectorAll('select'));
        const targetSelects = allSelects.filter(s => s.dataset.attribute === attrCode || s.getAttribute('data-attribute') === attrCode);
        if (targetSelects.length > 0) {
            targetSelects.forEach(select => select.value = "");
            applyFiltersAndSearch();
        } else {
            applyFiltersAndSearch();
        }
    }

    function renderActiveFilters(filters) {
        if (!dom.activeFiltersBar) return;
        const currentSchema = dom.schemaFilterSelect.value;
        const hasSchemaFilter = currentSchema !== 'all';
        const hasAttrFilters = Object.keys(filters).length > 0;

        if (!hasSchemaFilter && !hasAttrFilters) {
            dom.activeFiltersBar.className = 'active-filters-bar-hidden'; dom.activeFiltersBar.innerHTML = ''; return;
        }
        dom.activeFiltersBar.className = 'active-filters-bar-visible'; dom.activeFiltersBar.innerHTML = ''; 
        const fragment = document.createDocumentFragment();

        if (hasSchemaFilter) {
            const schemaName = currentSchema.charAt(0).toUpperCase() + currentSchema.slice(1);
            const schemaChip = document.createElement('div'); schemaChip.className = 'active-filter-chip schema-chip'; 
            schemaChip.innerHTML = `<span class="chip-label"><span class="filter-name">Gama:</span><span class="filter-value">${schemaName}</span></span><button class="chip-remove-btn" data-action="remove-schema" title="Quitar filtro de gama">&times;</button>`;
            fragment.appendChild(schemaChip);
        }

        Object.entries(filters).forEach(([attrCode, attrValue]) => {
            const attrDesc = attrCodeToDescMap[attrCode] || attrCode;
            const safeCode = attrCode.replace(/"/g, '&quot;');
            const chip = document.createElement('div'); chip.className = 'active-filter-chip';
            chip.innerHTML = `<span class="chip-label"><span class="filter-name">${attrDesc}:</span><span class="filter-value">${attrValue}</span></span><button class="chip-remove-btn" data-attr-code="${safeCode}" title="Eliminar filtro">&times;</button>`;
            fragment.appendChild(chip);
        });
        dom.activeFiltersBar.appendChild(fragment);
    }

    // --- Funciones Auxiliares ---
    function populateFullModelList() { renderSearchResults(masterDatabase, dom.modelSearchResults); }
    
    function buildAttributeCache() {
        attrCodeToDescMap = {};
        if (Object.keys(masterSchemaMap).length === 0) return;
        Object.values(masterSchemaMap).forEach(schema => {
            schema.forEach(group => { group.attrs.forEach(attr => { attrCodeToDescMap[attr.code] = attr.desc; }); });
        });
    }
    
    function populateSchemaSelector() {
        if (!dom.schemaFilterSelect) return;
        const currentValue = dom.schemaFilterSelect.value; 
        dom.schemaFilterSelect.innerHTML = '<option value="all">Todas las Gamas</option>';
        const fragment = document.createDocumentFragment();
        
        Object.keys(masterSchemaMap).filter(k => activeSchemas.has(k)).forEach(key => {
            const option = document.createElement('option'); option.value = key;
            const friendlyName = key.charAt(0).toUpperCase() + key.slice(1);
            option.textContent = friendlyName; fragment.appendChild(option);
        });
        dom.schemaFilterSelect.appendChild(fragment);
        
        if (activeSchemas.has(currentValue)) {
            dom.schemaFilterSelect.value = currentValue;
        } else {
            dom.schemaFilterSelect.value = 'all';
        }
    }

    function populateSmartFilters(schemaKey = 'all') {
        if (!dom.smartFilterContainer) return;
        dom.smartFilterContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        if (schemaKey === 'all') {
            const placeholder = document.createElement('p'); placeholder.className = 'filter-placeholder';
            placeholder.textContent = 'Selecciona una gama para ver filtros específicos.';
            fragment.appendChild(placeholder); dom.smartFilterContainer.appendChild(fragment); return;
        } 
        
        const relevantProducts = masterDatabase.filter(p => p.schema_key === schemaKey && activeSchemas.has(p.schema_key));
        const schemaGroups = masterSchemaMap[schemaKey] || [];

        schemaGroups.forEach(group => {
            const groupWrapper = document.createElement('div'); groupWrapper.className = 'filter-group-wrapper';
            const title = document.createElement('h3'); title.className = 'filter-group-title';
            title.innerHTML = `<button class="filter-toggle-btn gray"></button>${group.group}`;
            groupWrapper.appendChild(title);
            const rowsContainer = document.createElement('div'); rowsContainer.className = 'filter-rows-container collapsed';
            
            let hasFiltersInGroup = false; 
            
            group.attrs.forEach(attr => {
                const rawValues = relevantProducts.map(p => p.attributes[attr.code]).filter(v => v && v !== 'unknown');
                const uniqueValues = [...new Set(rawValues)].sort((a, b) => {
                    const numA = parseFloat(a); const numB = parseFloat(b);
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    return String(a).localeCompare(String(b));
                });

                if (uniqueValues.length > 0) {
                    hasFiltersInGroup = true;
                    const uniqueId = `filter_${attr.code}_${Math.random().toString(36).substr(2, 5)}`;
                    const row = document.createElement('div'); row.className = 'filter-row';
                    const label = document.createElement('label'); label.htmlFor = uniqueId;
                    label.textContent = attr.desc; label.title = attr.desc;
                    const select = document.createElement('select'); 
                    select.id = uniqueId;
                    select.className = 'futuristic-select'; 
                    select.dataset.attribute = attr.code;
                    select.setAttribute('data-attribute', attr.code);
                    select.innerHTML = '<option value="">---</option>';
                    
                    uniqueValues.forEach(value => {
                        const option = document.createElement('option'); option.value = value; option.textContent = value;
                        select.appendChild(option);
                    });
                    row.appendChild(label); row.appendChild(select); rowsContainer.appendChild(row);
                }
            });
            if (hasFiltersInGroup) { groupWrapper.appendChild(rowsContainer); fragment.appendChild(groupWrapper); }
        });
        dom.smartFilterContainer.appendChild(fragment);
    }

    function getAppliedFilters() {
        const filters = {};
        dom.smartFilterContainer.querySelectorAll('select').forEach(select => {
            if (select.value) filters[select.dataset.attribute] = select.value;
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

    function filterProducts(textQuery, attributeFilters) {
        const selectedSchema = dom.schemaFilterSelect.value;
        const hasTextQuery = textQuery.length > 0;
        const hasAttributeFilters = Object.keys(attributeFilters).length > 0;
        const hasSchemaFilter = selectedSchema !== 'all';
        
        let candidates = masterDatabase.filter(p => activeSchemas.has(p.schema_key));

        if (!hasTextQuery && !hasAttributeFilters && !hasSchemaFilter) return candidates;

        return candidates.filter(product => {
            if (hasSchemaFilter && product.schema_key !== selectedSchema) return false;
            if (hasTextQuery && !product.model.toLowerCase().includes(textQuery)) return false;
            if (hasAttributeFilters) {
                const match = Object.entries(attributeFilters).every(([attrCode, attrValue]) => product.attributes[attrCode] === attrValue);
                if (!match) return false;
            }
            return true;
        });
    }

    function handleResultClick(e) {
        const target = e.target.closest('.list-item');
        if (!target) return;
        document.querySelectorAll('.list-item.active').forEach(item => item.classList.remove('active'));
        target.classList.add('active');
        closeFilterPanel(); closeSettingsMenu(); closeLibraryModal();
        const model = target.dataset.model;
        const product = masterDatabase.find(p => p.model === model);
        if (product) {
            displayProduct(product); expandAllSpecs();
            dom.body.classList.add('model-is-selected'); showSelectedModelChip(product.model);
        }
    }

    function removeSchemaFilter() {
        if (dom.schemaFilterSelect) {
            dom.schemaFilterSelect.value = 'all'; populateSmartFilters('all'); applyFiltersAndSearch(); 
        }
    }
    
    function renderSearchResults(results, container) {
        if (!container) return;
        container.innerHTML = '';
        if (dom.modelListHeader) dom.modelListHeader.textContent = `Modelos (${results.length})`;
        if (results.length === 0) { container.innerHTML = '<div class="list-item" style="cursor: default; background: none; color: var(--color-text-dim);">No se encontraron resultados.</div>'; return; }
        const fragment = document.createDocumentFragment();
        results.forEach(product => {
            const item = document.createElement('div'); item.className = 'list-item'; 
            item.dataset.model = product.model; item.textContent = product.model; fragment.appendChild(item);
        });
        container.appendChild(fragment);
    }
    
    function displayProduct(product) {
        dom.productDisplayPlaceholder.style.display = 'none'; dom.specControls.className = 'spec-controls-visible'; 
        dom.productTitle.textContent = product.model;
        const productSchema = masterSchemaMap[product.schema_key]; 
        if (productSchema) renderProductSpecs(product.attributes, productSchema);
        else dom.productSpecsContainer.innerHTML = '<p class="text-gray-400">Error: Esquema no encontrado.</p>';
    }

    function renderProductSpecs(attributes, schema) {
        dom.productSpecsContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        schema.forEach(group => {
            const details = document.createElement('details'); details.className = 'spec-group';
            const summary = document.createElement('summary'); summary.textContent = group.group;
            details.appendChild(summary);
            const content = document.createElement('div'); content.className = 'spec-group-content';
            let hasContentInGroup = false; 
            group.attrs.forEach(attr => {
                const value = attributes[attr.code];
                if (value && value !== 'unknown') {
                    hasContentInGroup = true;
                    const specItem = document.createElement('div'); specItem.className = 'spec-row';
                    specItem.innerHTML = `<span class="attr-desc">${attr.desc}</span><span class="attr-value">${value}</span>`;
                    content.appendChild(specItem);
                }
            });
            if (hasContentInGroup) { details.appendChild(content); fragment.appendChild(details); }
        });
        dom.productSpecsContainer.appendChild(fragment);
    }

    function showSelectedModelChip(modelName) {
        dom.selectedModelDisplay.innerHTML = `<button id="clear-selection-btn" class="model-chip-button" title="Cerrar y volver a búsqueda">Modelo: ${modelName} <span>&times;</span></button>`;
        dom.selectedModelDisplay.querySelector('#clear-selection-btn').addEventListener('click', clearSelection);
    }

    function clearSelection() {
        dom.body.classList.remove('model-is-selected');
        dom.selectedModelDisplay.innerHTML = '';
        dom.productTitle.textContent = 'Selecciona un producto';
        dom.specControls.className = 'spec-controls-hidden';
        dom.productSpecsContainer.innerHTML = '';
        dom.productSpecsContainer.appendChild(originalPlaceholder);
        originalPlaceholder.style.display = 'block';
        applyFiltersAndSearch(); 
        const currentActive = dom.modelSearchResults.querySelector('.list-item.active');
        if (currentActive) currentActive.classList.remove('active');
    }

    // --- UI Controls ---
    function expandAllSpecs() { dom.productSpecsContainer.querySelectorAll('details.spec-group').forEach(group => group.open = true); }
    function collapseAllSpecs() { dom.productSpecsContainer.querySelectorAll('details.spec-group').forEach(group => group.open = false); }
    function toggleFilterGroup(titleElement) {
        const btn = titleElement.querySelector('.filter-toggle-btn');
        const rowsContainer = titleElement.nextElementSibling; 
        if (rowsContainer && btn) {
            if (rowsContainer.classList.contains('collapsed')) {
                rowsContainer.classList.remove('collapsed'); rowsContainer.classList.add('expanded');
                btn.classList.remove('gray'); btn.classList.add('blue');
            } else {
                rowsContainer.classList.remove('expanded'); rowsContainer.classList.add('collapsed');
                btn.classList.remove('blue'); btn.classList.add('gray');
            }
        }
    }

    function openFilterPanel() {
        if (!dom.smartFilterPanel) return;
        closeSettingsMenu(); closeReadmeModal(); closeLibraryModal();
        dom.smartFilterPanel.className = 'smart-filter-content-open';
        dom.filterOverlay.className = 'overlay-visible';
        dom.smartFilterToggle.classList.add('active');
    }
    function closeFilterPanel() {
        if (!dom.smartFilterPanel) return;
        dom.smartFilterPanel.className = 'smart-filter-content-hidden';
        checkOverlay();
        dom.smartFilterToggle.classList.remove('active');
    }
    function toggleFilterPanel() { dom.smartFilterPanel.className === 'smart-filter-content-hidden' ? openFilterPanel() : closeFilterPanel(); }
    
    function openSettingsMenu() {
        if (!dom.settingsMenuPanel) return;
        closeFilterPanel(); closeReadmeModal(); closeLibraryModal();
        dom.settingsMenuPanel.className = 'settings-menu-panel-open';
        dom.filterOverlay.className = 'overlay-visible';
        dom.settingsMenuToggle.classList.add('active');
    }
    function closeSettingsMenu() {
        if (!dom.settingsMenuPanel) return;
        dom.settingsMenuPanel.className = 'settings-menu-panel-hidden';
        checkOverlay();
        dom.settingsMenuToggle.classList.remove('active');
    }
    function toggleSettingsMenu() { dom.settingsMenuPanel.className === 'settings-menu-panel-hidden' ? openSettingsMenu() : closeSettingsMenu(); }
    
    function openReadmeModal() { closeFilterPanel(); closeSettingsMenu(); closeLibraryModal(); dom.readmeModal.className = 'modal-visible'; dom.filterOverlay.className = 'overlay-visible'; }
    function closeReadmeModal() { dom.readmeModal.className = 'modal-hidden'; checkOverlay(); }

    function checkOverlay() {
        if (dom.smartFilterPanel.className === 'smart-filter-content-hidden' && 
            dom.settingsMenuPanel.className === 'settings-menu-panel-hidden' &&
            dom.readmeModal.className === 'modal-hidden' &&
            dom.libraryModal.className === 'modal-hidden') {
            dom.filterOverlay.className = 'overlay-hidden';
        }
    }

    // --- Biblioteca (FIXED CSV PARSER) ---
    function openLibraryModal() {
        closeSettingsMenu(); 
        closeFilterPanel(); closeReadmeModal();
        renderLibraryGamaList();
        dom.libraryModal.className = 'modal-visible';
        dom.filterOverlay.className = 'overlay-visible';
        dom.uploadStatusText.textContent = "Formato Admin Requerido (Punto y coma)";
        dom.csvUploadInput.value = "";
    }

    function closeLibraryModal() {
        dom.libraryModal.className = 'modal-hidden';
        checkOverlay();
    }

    function renderLibraryGamaList() {
        dom.libraryGamaList.innerHTML = '';
        Object.keys(masterSchemaMap).forEach(schemaKey => {
            const isActive = activeSchemas.has(schemaKey);
            const friendlyName = schemaKey.charAt(0).toUpperCase() + schemaKey.slice(1);
            
            const item = document.createElement('div');
            item.className = 'gama-toggle-item';
            item.innerHTML = `
                <label class="gama-toggle-label">
                    <input type="checkbox" class="gama-checkbox" data-key="${schemaKey}" ${isActive ? 'checked' : ''}>
                    <span class="gama-name">${friendlyName}</span>
                </label>
                <span class="gama-status">${isActive ? 'Activa' : 'Oculta'}</span>
            `;
            dom.libraryGamaList.appendChild(item);
        });
    }

    function handleGamaToggle(e) {
        if (!e.target.matches('.gama-checkbox')) return;
        const key = e.target.dataset.key;
        const isChecked = e.target.checked;
        
        if (isChecked) activeSchemas.add(key);
        else activeSchemas.delete(key);

        const statusSpan = e.target.closest('.gama-toggle-item').querySelector('.gama-status');
        statusSpan.textContent = isChecked ? 'Activa' : 'Oculta';
        statusSpan.style.color = isChecked ? 'var(--color-cyan-accent)' : 'var(--color-text-dim)';

        populateSchemaSelector(); 
        populateSmartFilters(dom.schemaFilterSelect.value); 
        applyFiltersAndSearch(); 
    }

    function handleCsvUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        dom.uploadStatusText.textContent = `Procesando: ${file.name}...`;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                parseAndImportCsv(content);
                dom.uploadStatusText.textContent = `¡Importado con éxito!`;
                dom.uploadStatusText.style.color = 'var(--color-cyan-accent)';
                
                buildAttributeCache();
                populateSchemaSelector();
                applyFiltersAndSearch();
                renderLibraryGamaList(); 

            } catch (error) {
                console.error(error);
                dom.uploadStatusText.textContent = `Error: Formato inválido`;
                dom.uploadStatusText.style.color = '#ef4444';
                alert("Error al importar. Revisa que el CSV use punto y coma (;) y formato UTF-8.");
            }
        };
        // Importante: Forzar UTF-8 para leer tildes y BOM
        reader.readAsText(file, 'UTF-8');
    }

    /**
     * Helper para dividir líneas CSV respetando comillas dobles.
     * Maneja: "valor;con;punto;y;coma";valor_normal;"valor""con""comillas"
     */
    function parseCSVLine(text) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (inQuotes) {
                if (char === '"' && nextChar === '"') {
                    // Comilla doble escapada ("") -> literal "
                    current += '"';
                    i++; // Saltar la siguiente comilla
                } else if (char === '"') {
                    // Fin de comillas
                    inQuotes = false;
                } else {
                    // Carácter normal dentro de comillas
                    current += char;
                }
            } else {
                if (char === ';') {
                    // Separador
                    result.push(current);
                    current = '';
                } else if (char === '"') {
                    // Inicio de comillas
                    inQuotes = true;
                } else {
                    // Carácter normal
                    current += char;
                }
            }
        }
        result.push(current); // Añadir el último campo
        return result;
    }

    function parseAndImportCsv(csvText) {
        // 1. Limpiar BOM si existe (\uFEFF) para evitar caracteres basura al inicio
        // charCodeAt(0) === 65279 es el BOM
        let cleanText = csvText;
        if (cleanText.charCodeAt(0) === 0xFEFF) {
            cleanText = cleanText.slice(1);
        }

        const lines = cleanText.split(/\r?\n/).filter(l => l.trim() !== ''); // Dividir por saltos de línea

        if (lines.length < 3) throw new Error("CSV muy corto (Faltan cabeceras o datos)");

        // --- Fila 1: Códigos ---
        // A1: Schema Key, B1: 'model', C1+: Códigos de atributos
        const row1 = parseCSVLine(lines[0]);
        
        const schemaKey = row1[0].toLowerCase().trim();
        // Validar limpieza
        if (!schemaKey || schemaKey.includes(' ')) throw new Error("Schema Key inválida en A1");

        const attrCodes = row1.slice(1); // ["info_categoria", "info_nombre...", ...]
        
        // --- Fila 2: Descripciones ---
        // A1: (Vacio o Label), B1: Label Model, C1+: Descripciones
        const row2 = parseCSVLine(lines[1]);
        const attrDescs = row2.slice(1); // ["Categoría...", "Código...", ...]

        // Construir Esquema Dinámico
        const newAttrs = [];
        // Empezamos desde el índice 1 de attrCodes porque el índice 0 suele ser 'info_categoria'
        // PERO: En el formato del admin, row1[0] es SchemaKey. row1[1] NO es model ID en el header exportado?
        // Revisemos el formato exportado:
        // Export: A1=Key, A2="Model ID".
        // PERO Export función anterior: 
        // row1_codes = [selectedSchema, 'model', attr1, attr2...]
        // row2_descs = ['', 'Modelo', desc1, desc2...]
        // Datos: ['', modelID, val1, val2...]
        
        // Ajuste al parser para coincidir con Export v3.4.1:
        // row1[0] = SchemaKey. row1[1] = 'model'. row1[2] = attr1...
        // row2[0] = ''. row2[1] = 'Modelo'. row2[2] = desc1...
        // data[0] = ''. data[1] = ID. data[2] = val1...
        
        // Validemos si es formato 'v3.4.1' (con columna A vacía en datos) o formato plano 'v3.3.0'
        // El usuario pasó un ejemplo plano: "pcs;info_categoria..."
        // Vamos a detectar dinámicamente.
        
        let startIndexAttrs = 0;
        let modelIndexInData = 0;

        // Detección heurística:
        if (row1[1] === 'model') {
            // Formato con columna 'model' explicita en cabecera (v3.4.1 Admin)
            startIndexAttrs = 2; // 0=Key, 1=Model, 2=Attr1
            modelIndexInData = 1; // En datos: 0=Empty, 1=ID
        } else {
            // Formato plano (User raw text example): 0=Key, 1=Attr1... (Model ID es la primera columna de datos)
            // En el ejemplo del usuario: "pcs;info_categoria..."
            // Y los datos: "14Z90...;Portátiles..."
            startIndexAttrs = 1;
            modelIndexInData = 0;
        }

        for (let i = startIndexAttrs; i < row1.length; i++) {
            if (row1[i]) {
                newAttrs.push({
                    code: row1[i],
                    desc: (row2[i] && row2[i].trim()) ? row2[i] : row1[i]
                });
            }
        }

        const newSchemaGroup = [{
            group: "Especificaciones Importadas",
            attrs: newAttrs
        }];

        window.APP_DB.registerSchema(schemaKey, newSchemaGroup);
        activeSchemas.add(schemaKey);

        // --- Datos (Fila 3 en adelante) ---
        let count = 0;
        for (let i = 2; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);
            
            // Obtener Model ID
            const modelId = cols[modelIndexInData];
            if (!modelId) continue; // Fila vacía o corrupta

            const attributes = {};
            // Mapear atributos
            for (let j = 0; j < newAttrs.length; j++) {
                // El valor en CSV está en (startIndexAttrs + j)
                const colIndex = startIndexAttrs + j;
                if (cols[colIndex]) {
                    attributes[newAttrs[j].code] = cols[colIndex];
                }
            }

            const newProduct = {
                model: modelId,
                schema_key: schemaKey,
                attributes: attributes
            };

            window.APP_DB.registerProduct(newProduct);
            count++;
        }

        // Refrescar referencias
        masterSchemaMap = window.APP_DB.schemas;
        masterDatabase = window.APP_DB.products;
        console.log(`Importada gama ${schemaKey} con ${count} modelos.`);
    }

    // --- Tema ---
    function handleThemeToggle() {
        isLightMode = !isLightMode;
        if (isLightMode) updatePaletteCSS(lightPaletteHSL, currentAccentHue);
        else { currentAccentHue = Math.floor(Math.random() * 360); updatePaletteCSS(darkPaletteHSL, currentAccentHue); }
    }
    function updatePaletteCSS(baseHSL, accentHue) {
        const p = baseHSL;
        const hueDifference = 0;
        const newOtherHue = (accentHue + hueDifference + 360) % 360; 
        const accentRGB = hslToRgb(accentHue, p.accent.s, p.accent.l);
        const root = document.documentElement;
        const vars = {
            '--color-cyan-accent': `hsl(${accentHue}, ${p.accent.s}%, ${p.accent.l}%)`,
            '--color-cyan-glow': `rgba(${accentRGB.r}, ${accentRGB.g}, ${accentRGB.b}, 0.25)`,
            '--color-bg-dark': `hsl(${newOtherHue}, ${p.dark.s}%, ${p.dark.l}%)`,
            '--color-bg-medium': `hsl(${newOtherHue}, ${p.medium.s}%, ${p.medium.l}%)`,
            '--color-border': `hsl(${newOtherHue}, ${p.border.s}%, ${p.border.l}%)`,
            '--color-border-light': `hsl(${newOtherHue}, ${p.border.s}%, ${p.border.l + 5}%)`,
            '--color-text-primary': `hsl(${newOtherHue}, ${p.textP.s}%, ${p.textP.l}%)`,
            '--color-text-secondary': `hsl(${newOtherHue}, ${p.textS.s}%, ${p.textS.l}%)`,
            '--color-text-dim': `hsl(${newOtherHue}, ${p.textS.s}%, ${p.textS.l - 10}%)`
        };
        for (const [key, value] of Object.entries(vars)) { root.style.setProperty(key, value); }
    }
    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
    }
    
    async function showReadmeInfo() {
        closeSettingsMenu(); closeLibraryModal(); openReadmeModal();
        if (dom.readmeContent.textContent === "" || dom.readmeContent.textContent.startsWith("Cargando...")) {
            try {
                dom.readmeContent.textContent = "Cargando...";
                const response = await fetch('README.md');
                if (!response.ok) throw new Error('No se pudo encontrar README.md');
                const text = await response.text();
                dom.readmeContent.textContent = text;
            } catch (error) {
                dom.readmeContent.textContent = "Error al cargar el archivo README.md.\n\nAsegúrate de que el archivo existe en la raíz del proyecto.";
            }
        }
    }
    
    initialize();
});