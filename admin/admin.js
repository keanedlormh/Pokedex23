document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES GLOBALES ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let activeSchemas = new Set();
    let currentLoadedSchemaKey = null; 
    let currentActivePanel = 'general';
    let isLightMode = false;

    // Configuración Drive
    let driveConfig = {
        title: "Pokedex Drive Offline",
        version: "v2.0",
        introText: "Base de datos técnica generada con Pokedex Drive Admin."
    };

    // --- DOM REFS & INIT ---
    // (Igual que antes, solo actualizamos la parte crítica)
    const dom = {
        // ... (resto de referencias)
        driveTriggerBtn: document.getElementById('drive-builder-trigger'),
        driveModal: document.getElementById('drive-modal'),
        driveCloseBtn: document.getElementById('drive-close-btn'),
        driveProgressFill: document.getElementById('drive-progress-fill'),
        drivePercentText: document.getElementById('drive-percent-text'),
        driveConsole: document.getElementById('drive-log-console'),
        driveActionArea: document.getElementById('drive-action-area'),
        driveDownloadBtn: document.getElementById('drive-download-final-btn'),
        // ...
        homeBtn: document.getElementById('home-btn'),
        btnSaveMemory: document.getElementById('btn-save-memory'),
        btnExportFile: document.getElementById('btn-export-file'),
        editorControls: document.getElementById('editor-controls'),
        settingsBtn: document.getElementById('settings-btn'),
        settingsMenu: document.getElementById('settings-menu'),
        themeBtn: document.getElementById('theme-btn'),
        infoBtn: document.getElementById('info-btn'),
        libraryBtn: document.getElementById('library-menu-toggle'),
        infoModal: document.getElementById('info-modal'),
        libraryModal: document.getElementById('library-modal'), 
        modalOverlay: document.getElementById('modal-overlay'),
        closeInfoModalBtn: document.getElementById('close-info-modal-btn'),
        libraryCloseBtn: document.getElementById('library-close-btn'), 
        libraryGamaList: document.getElementById('library-gama-list'),
        csvUploadInput: document.getElementById('csv-upload-input'),
        csvTextBtn: document.getElementById('csv-text-btn'),
        csvTextInput: document.getElementById('csv-text-input'),
        uploadStatusText: document.getElementById('upload-status-text'),
        allContentPanels: document.querySelectorAll('.content-panel'),
        navCardButtons: document.querySelectorAll('.nav-card[data-panel]'),
        modelSearchInput: document.getElementById('search-model'),
        modelSearchResults: document.getElementById('model-results-list'),
        createModelSchemaSelect: document.getElementById('create-model-schema-select'),
        createModelIdInput: document.getElementById('create-model-id'),
        createModelBtn: document.getElementById('create-model-btn'),
        editModelIdInput: document.getElementById('edit-model-id'),
        editSchemaKeyDisplay: document.getElementById('edit-schema-key-display'),
        productTitle: document.getElementById('product-title'),
        editorForm: document.getElementById('editor-form'),
        editorPlaceholder: document.getElementById('editor-placeholder'),
        schemaResultsList: document.getElementById('schema-results-list'),
        newSchemaKeyInput: document.getElementById('new-schema-key'),
        createSchemaBtn: document.getElementById('create-schema-btn'),
        editSchemaKeyInput: document.getElementById('edit-schema-key'),
        schemaEditorForm: document.getElementById('schema-editor-form'),
        addGroupBtn: document.getElementById('add-group-btn'),
        gamaExportSelect: document.getElementById('gama-export-select'),
        gamaExportList: document.getElementById('gama-export-list'),
        exportGamaJsonButton: document.getElementById('export-gama-json-btn'),
        exportGamaCsvButton: document.getElementById('export-gama-csv-btn'),
        
        driveConfigBtn: document.getElementById('drive-config-btn'),
        driveConfigModal: document.getElementById('drive-config-modal'),
        driveConfigCloseBtn: document.getElementById('drive-config-close-btn'),
        driveConfigSaveBtn: document.getElementById('conf-drive-save-btn'),
        confDriveTitle: document.getElementById('conf-drive-title'),
        confDriveVersion: document.getElementById('conf-drive-version'),
        confDriveText: document.getElementById('conf-drive-text')
    };

    function initialize() {
        const savedMode = localStorage.getItem('admin-theme-mode');
        isLightMode = (savedMode === 'light');
        // randomizeTheme(); (Simplificado para brevedad)

        setTimeout(() => {
            if (window.APP_DB) {
                masterDatabase = window.APP_DB.products || [];
                masterSchemaMap = window.APP_DB.schemas || [];
                Object.keys(masterSchemaMap).forEach(k => activeSchemas.add(k));
            }
            setupEventListeners();
            showPanel('general');
        }, 100);
    }

    function setupEventListeners() {
        // ... (Listeners previos igual)
        dom.driveTriggerBtn.addEventListener('click', startDriveBuild);
        dom.driveDownloadBtn.addEventListener('click', downloadCompiledDrive);
        
        // Listeners resto UI
        dom.homeBtn.addEventListener('click', () => showPanel('general'));
        dom.navCardButtons.forEach(btn => btn.addEventListener('click', () => showPanel(btn.dataset.panel)));
        dom.btnSaveMemory.addEventListener('click', handleMemorySave);
        dom.btnExportFile.addEventListener('click', handleExportFile);
        dom.settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); dom.settingsMenu.style.display = dom.settingsMenu.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', () => { if (dom.settingsMenu) dom.settingsMenu.style.display = 'none'; });
        dom.libraryBtn.addEventListener('click', openLibraryModal);
        dom.infoBtn.addEventListener('click', () => { dom.infoModal.style.display = 'block'; dom.modalOverlay.style.display = 'block'; });
        dom.closeInfoModalBtn.addEventListener('click', hideAllModals);
        dom.libraryCloseBtn.addEventListener('click', hideAllModals);
        dom.modalOverlay.addEventListener('click', hideAllModals);
        dom.driveCloseBtn.addEventListener('click', hideAllModals);
        dom.driveConfigCloseBtn.addEventListener('click', hideAllModals);
        dom.driveConfigBtn.addEventListener('click', openDriveConfigModal);
        dom.driveConfigSaveBtn.addEventListener('click', saveDriveConfig);
        dom.csvTextBtn.addEventListener('click', handleCsvTextImport);
        dom.csvUploadInput.addEventListener('change', handleCsvFileUpload);
        dom.modelSearchInput.addEventListener('input', updateSearchResults);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.createModelBtn.addEventListener('click', createNewModel);
        dom.schemaResultsList.addEventListener('click', handleSchemaLoad);
        dom.createSchemaBtn.addEventListener('click', createNewSchema);
        dom.addGroupBtn.addEventListener('click', () => addGroupToSchemaEditor());
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorEvents);
        dom.gamaExportSelect.addEventListener('change', updateExportList);
        dom.exportGamaJsonButton.addEventListener('click', exportFullGamaJson);
        dom.exportGamaCsvButton.addEventListener('click', exportFullGamaCsv);
        if(dom.libraryGamaList) {
            dom.libraryGamaList.addEventListener('change', (e) => { if(e.target.matches('.gama-checkbox')) { const key = e.target.dataset.key; if(e.target.checked) activeSchemas.add(key); else activeSchemas.delete(key); refreshUI(); } });
            dom.libraryGamaList.addEventListener('click', (e) => { if(e.target.matches('.gama-download-btn')) { e.preventDefault(); exportGamaToCSV(e.target.dataset.key); } });
        }
    }

    // ... (Resto de funciones de UI/CSV/Export/Editores se mantienen igual que en v3.7) ...
    // ... SOLO MODIFICAMOS startDriveBuild ...

    // --- DRIVE BUILDER LOGIC ---
    let compiledBlob = null;

    function startDriveBuild() {
        // Reset UI
        dom.driveModal.style.display = 'block';
        dom.modalOverlay.style.display = 'block';
        dom.driveActionArea.style.display = 'none';
        dom.driveProgressFill.style.width = '0%';
        dom.drivePercentText.textContent = '0%';
        dom.driveConsole.innerHTML = '<div class="log-line">> Iniciando Pokedex Drive Engine...</div>';

        // 1. Filtrar datos activos
        const activeData = masterDatabase.filter(p => activeSchemas.has(p.schema_key));
        const activeSchemasObj = {};
        activeSchemas.forEach(k => activeSchemasObj[k] = masterSchemaMap[k]);

        if (activeData.length === 0) {
            dom.driveConsole.innerHTML += `<div class="log-line error">> Error: No hay datos activos.</div>`;
            return;
        }

        const steps = [
            { pct: 20, msg: `Analizando ${activeData.length} modelos en RAM...` },
            { pct: 50, msg: "Generando estructura visual (v4.9)..." },
            { pct: 80, msg: "Inyectando Bootloader Offline..." }
        ];

        let currentStep = 0;

        function nextStep() {
            if (currentStep >= steps.length) {
                // PASO FINAL: Compilación
                try {
                    dom.driveConsole.innerHTML += `<div class="log-line">> Compilando HTML final...</div>`;
                    
                    if (typeof PokedexDrive === 'undefined') {
                        throw new Error("Motor 'pokedexdrive.js' no cargado.");
                    }

                    compiledBlob = PokedexDrive.compile(activeData, activeSchemasObj, driveConfig);
                    
                    // Finalización exitosa
                    dom.driveProgressFill.style.width = '100%';
                    dom.drivePercentText.textContent = '100%';
                    dom.driveConsole.innerHTML += `<div class="log-line success" style="color:var(--color-green-accent)">> ¡Compilación completada!</div>`;
                    dom.driveConsole.scrollTop = dom.driveConsole.scrollHeight;
                    dom.driveActionArea.style.display = 'block';

                } catch (error) {
                    console.error(error);
                    dom.driveConsole.innerHTML += `<div class="log-line error" style="color:var(--color-red-accent)">> Error Fatal: ${error.message}</div>`;
                }
                return;
            }

            const s = steps[currentStep];
            dom.driveProgressFill.style.width = s.pct + '%';
            dom.drivePercentText.textContent = s.pct + '%';
            dom.driveConsole.innerHTML += `<div class="log-line">> ${s.msg}</div>`;
            dom.driveConsole.scrollTop = dom.driveConsole.scrollHeight;
            
            currentStep++;
            setTimeout(nextStep, 600); // Pequeño delay para ver el progreso
        }

        // Iniciar secuencia
        setTimeout(nextStep, 500);
    }

    function downloadCompiledDrive() {
        if(compiledBlob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(compiledBlob);
            a.download = 'pokedex_drive_offline.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    // ... (Helpers UI panel, modals, etc... necesarios para que no falle el init)
    function showPanel(id) { currentActivePanel = id; dom.allContentPanels.forEach(p => p.classList.remove('active')); document.getElementById(`panel-${id}`).classList.add('active'); dom.editorControls.style.display = (id === 'edit-model' || id === 'edit-schema') ? 'flex' : 'none'; }
    function hideAllModals() { dom.infoModal.style.display = 'none'; dom.libraryModal.style.display = 'none'; dom.driveModal.style.display = 'none'; dom.driveConfigModal.style.display = 'none'; dom.modalOverlay.style.display = 'none'; }
    function openDriveConfigModal() { dom.confDriveTitle.value = driveConfig.title; dom.confDriveVersion.value = driveConfig.version; dom.confDriveText.value = driveConfig.introText; dom.driveConfigModal.style.display = 'block'; dom.modalOverlay.style.display = 'block'; }
    function saveDriveConfig() { driveConfig.title = dom.confDriveTitle.value.trim() || "Pokedex Drive"; driveConfig.version = dom.confDriveVersion.value.trim() || "v1.0"; driveConfig.introText = dom.confDriveText.value.trim(); hideAllModals(); alert("Guardado en RAM."); }
    function handleCsvTextImport() { const t = dom.csvTextInput.value.trim(); if(t) { try{ parseAndImportCsv(t); alert("Importado."); dom.csvTextInput.value=''; refreshUI(); }catch(e){alert(e.message);} } }
    function handleCsvFileUpload(e) { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload=ev=>{ try{ parseAndImportCsv(ev.target.result); refreshUI(); }catch(e){alert(e.message);} }; r.readAsText(f); } }
    function parseCSVLine(text) { const result = []; let current = ''; let inQuotes = false; for (let i = 0; i < text.length; i++) { const char = text[i]; const nextChar = text[i + 1]; if (inQuotes) { if (char === '"' && nextChar === '"') { current += '"'; i++; } else if (char === '"') { inQuotes = false; } else { current += char; } } else { if (char === ';') { result.push(current); current = ''; } else if (char === '"') { inQuotes = true; } else { current += char; } } } result.push(current); return result; }
    function parseAndImportCsv(csvText) { let cleanText = csvText; if (cleanText.charCodeAt(0) === 0xFEFF) cleanText = cleanText.slice(1); const lines = cleanText.split(/\r?\n/).filter(l => l.trim() !== ''); if (lines.length < 4) throw new Error("CSV muy corto"); const rowGroups = parseCSVLine(lines[0]); const schemaKey = rowGroups[0].toLowerCase().trim(); if (!schemaKey) throw new Error("Falta Schema Key"); const rowCodes = parseCSVLine(lines[1]); const rowDescs = parseCSVLine(lines[2]); const startIndex = 2; const tempSchema = {}; const groupOrder = []; for (let i = startIndex; i < rowCodes.length; i++) { const groupName = rowGroups[i] || "Otros"; const code = rowCodes[i]; const desc = rowDescs[i] || code; if (code) { if (!tempSchema[groupName]) { tempSchema[groupName] = []; groupOrder.push(groupName); } tempSchema[groupName].push({ code, desc }); } } const newSchemaGroup = groupOrder.map(gName => ({ group: gName, attrs: tempSchema[gName] })); masterSchemaMap[schemaKey] = newSchemaGroup; activeSchemas.add(schemaKey); for (let i = 3; i < lines.length; i++) { const cols = parseCSVLine(lines[i]); const modelId = cols[1]; if (!modelId) continue; const attributes = {}; for (let j = startIndex; j < rowCodes.length; j++) { const code = rowCodes[j]; if (code && cols[j]) attributes[code] = cols[j]; } const existingIdx = masterDatabase.findIndex(p => p.model === modelId); const newProd = { model: modelId, schema_key: schemaKey, attributes: attributes }; if (existingIdx >= 0) masterDatabase[existingIdx] = newProd; else masterDatabase.push(newProd); } return { schemaKey }; }
    function refreshUI() { updateSearchResults(); updateSchemaLists(); if(dom.libraryModal.style.display==='block') renderLibraryList(); }
    function updateSearchResults() { dom.modelSearchResults.innerHTML = ''; const q = dom.modelSearchInput.value.toLowerCase(); masterDatabase.filter(p => p.model.toLowerCase().includes(q) && activeSchemas.has(p.schema_key)).forEach(p => { const d = document.createElement('div'); d.className='list-item'; d.textContent=p.model; d.dataset.model=p.model; dom.modelSearchResults.appendChild(d); }); }
    function handleResultClick(e) { const t=e.target.closest('.list-item'); if(t) loadModelEditor(t.dataset.model); }
    function createNewModel() { /* Lógica igual a v3.7 */ } 
    function loadModelEditor(id) { /* Lógica igual a v3.7 */ showPanel('edit-model'); }
    function updateSchemaLists() { /* Lógica igual a v3.7 */ }
    function handleSchemaLoad() { /* Lógica igual a v3.7 */ }
    function createNewSchema() { /* Lógica igual a v3.7 */ }
    function addGroupToSchemaEditor() { /* Lógica igual a v3.7 */ }
    function handleSchemaEditorEvents() { /* Lógica igual a v3.7 */ }
    function openLibraryModal() { renderLibraryList(); dom.libraryModal.style.display='block'; dom.modalOverlay.style.display='block'; }
    function renderLibraryList() { dom.libraryGamaList.innerHTML=''; Object.keys(masterSchemaMap).forEach(k => { const act=activeSchemas.has(k); const div=document.createElement('div'); div.className='gama-toggle-item'; div.innerHTML=`<label class="gama-toggle-label"><input type="checkbox" class="gama-checkbox" data-key="${k}" ${act?'checked':''}><span class="gama-name">${k}</span></label><div class="gama-actions-right"><button class="gama-download-btn" data-key="${k}">⬇</button></div>`; dom.libraryGamaList.appendChild(div); }); }
    function handleMemorySave() { /* Igual v3.7 */ refreshUI(); }
    function handleExportFile() { /* Igual v3.7 */ }
    function updateExportList() { /* Igual v3.7 */ }
    function exportFullGamaJson() { /* Igual v3.7 */ }
    function exportFullGamaCsv() { /* Igual v3.7 */ }
    function exportGamaToCSV(k) { /* Igual v3.7 */ }
    function downloadFile(n,c,m) { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([c],{type:m})); a.download=n; document.body.appendChild(a); a.click(); document.body.removeChild(a); }

    initialize();
});