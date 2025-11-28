document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES GLOBALES ---
    let masterDatabase = [];
    let masterSchemaMap = {};
    let activeSchemas = new Set();
    let currentLoadedSchemaKey = null; 
    let currentActivePanel = 'general';
    let isLightMode = false;

    // Configuración Global para el Metaconstructor
    // Se expone a window para que pokedexdrive.js pueda leerla
    window.driveConfig = {
        title: "Pokedex Drive",
        version: "v24.0.1",
        introText: "Versión offline generada automáticamente.\nContiene toda la base de datos y funcionalidad completa."
    };

    // Paletas
    const darkPaletteHSL = { accent: { h: 188, s: 96, l: 41 }, dark: { h: 210, s: 29, l: 8 }, medium: { h: 210, s: 19, l: 11 }, border: { h: 210, s: 16, l: 15 }, textP: { h: 210, s: 29, l: 92 }, textS: { h: 210, s: 12, l: 67 } };
    const lightPaletteHSL = { accent: { h: 188, s: 86, l: 40 }, dark: { h: 210, s: 20, l: 98 }, medium: { h: 210, s: 19, l: 94 }, border: { h: 210, s: 16, l: 85 }, textP: { h: 210, s: 29, l: 10 }, textS: { h: 210, s: 12, l: 40 } };

    // --- DOM REFERENCES ---
    const dom = {
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
        
        // Config Drive
        driveConfigBtn: document.getElementById('drive-config-btn'),
        driveConfigModal: document.getElementById('drive-config-modal'),
        driveConfigCloseBtn: document.getElementById('drive-config-close-btn'),
        driveConfigSaveBtn: document.getElementById('conf-drive-save-btn'),
        confDriveTitle: document.getElementById('conf-drive-title'),
        confDriveVersion: document.getElementById('conf-drive-version'),
        confDriveText: document.getElementById('conf-drive-text'),
        
        // Modales Compilador (Solo cierre, la lógica está en pokedexdrive.js)
        driveCloseBtn: document.getElementById('drive-close-btn')
    };

    // --- INIT ---
    function initialize() {
        const savedMode = localStorage.getItem('admin-theme-mode');
        isLightMode = (savedMode === 'light');
        randomizeTheme();

        setTimeout(() => {
            if (window.APP_DB) {
                masterDatabase = window.APP_DB.products || [];
                masterSchemaMap = window.APP_DB.schemas || [];
                Object.keys(masterSchemaMap).forEach(k => activeSchemas.add(k));
            }
            setupEventListeners();
            refreshUI();
            showPanel('general');
        }, 100);
    }

    function setupEventListeners() {
        // Nav & Panels
        dom.homeBtn.addEventListener('click', () => showPanel('general'));
        dom.navCardButtons.forEach(btn => btn.addEventListener('click', () => showPanel(btn.dataset.panel)));
        
        // Header Actions
        dom.btnSaveMemory.addEventListener('click', handleMemorySave);
        dom.btnExportFile.addEventListener('click', handleExportFile);
        dom.settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); dom.settingsMenu.style.display = dom.settingsMenu.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', () => { if (dom.settingsMenu) dom.settingsMenu.style.display = 'none'; });

        // Modals Globales
        dom.closeInfoModalBtn.addEventListener('click', hideAllModals);
        dom.libraryCloseBtn.addEventListener('click', hideAllModals);
        dom.driveConfigCloseBtn.addEventListener('click', hideAllModals);
        dom.modalOverlay.addEventListener('click', hideAllModals);
        if(dom.driveCloseBtn) dom.driveCloseBtn.addEventListener('click', hideAllModals);

        // Library & Settings
        dom.libraryBtn.addEventListener('click', openLibraryModal);
        dom.themeBtn.addEventListener('click', (e) => { e.stopPropagation(); isLightMode = !isLightMode; localStorage.setItem('admin-theme-mode', isLightMode?'light':'dark'); randomizeTheme(); });
        dom.infoBtn.addEventListener('click', () => { dom.infoModal.style.display = 'block'; dom.modalOverlay.style.display = 'block'; });

        // Drive Config
        dom.driveConfigBtn.addEventListener('click', openDriveConfigModal);
        dom.driveConfigSaveBtn.addEventListener('click', saveDriveConfig);

        // CSV Import
        dom.csvTextBtn.addEventListener('click', handleCsvTextImport);
        dom.csvUploadInput.addEventListener('change', handleCsvFileUpload);

        // Model Hub
        dom.modelSearchInput.addEventListener('input', updateSearchResults);
        dom.modelSearchResults.addEventListener('click', handleResultClick);
        dom.createModelBtn.addEventListener('click', createNewModel);

        // Schema Hub
        dom.schemaResultsList.addEventListener('click', handleSchemaLoad);
        dom.createSchemaBtn.addEventListener('click', createNewSchema);
        dom.addGroupBtn.addEventListener('click', () => addGroupToSchemaEditor());
        dom.schemaEditorForm.addEventListener('click', handleSchemaEditorEvents);

        // Export
        dom.gamaExportSelect.addEventListener('change', updateExportList);
        dom.exportGamaJsonButton.addEventListener('click', exportFullGamaJson);
        dom.exportGamaCsvButton.addEventListener('click', exportFullGamaCsv);

        // Biblioteca Dinámica
        if(dom.libraryGamaList) {
            dom.libraryGamaList.addEventListener('change', (e) => {
                if(e.target.matches('.gama-checkbox')) {
                    const key = e.target.dataset.key;
                    if(e.target.checked) activeSchemas.add(key); else activeSchemas.delete(key);
                    refreshUI();
                }
            });
            dom.libraryGamaList.addEventListener('click', (e) => {
                if(e.target.matches('.gama-download-btn')) {
                    e.preventDefault();
                    exportGamaToCSV(e.target.dataset.key);
                }
            });
        }
    }

    function refreshUI() {
        updateSearchResults();
        updateSchemaLists();
        if(dom.libraryModal.style.display === 'block') renderLibraryList();
    }

    // --- LOGICA DE CONFIGURACIÓN DRIVE ---
    function openDriveConfigModal() {
        dom.confDriveTitle.value = window.driveConfig.title;
        dom.confDriveVersion.value = window.driveConfig.version;
        dom.confDriveText.value = window.driveConfig.introText;
        dom.driveConfigModal.style.display = 'block';
        dom.modalOverlay.style.display = 'block';
    }

    function saveDriveConfig() {
        window.driveConfig.title = dom.confDriveTitle.value.trim() || "Pokedex Drive";
        window.driveConfig.version = dom.confDriveVersion.value.trim() || "v1.0";
        window.driveConfig.introText = dom.confDriveText.value.trim();
        hideAllModals();
        alert("Configuración actualizada. Lista para compilar.");
    }

    // --- HELPERS UI & THEME ---
    function showPanel(id) {
        currentActivePanel = id;
        dom.allContentPanels.forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${id}`).classList.add('active');
        dom.editorControls.style.display = (id === 'edit-model' || id === 'edit-schema') ? 'flex' : 'none';
    }

    function hideAllModals() {
        dom.infoModal.style.display = 'none';
        dom.libraryModal.style.display = 'none';
        dom.driveConfigModal.style.display = 'none';
        // driveModal se maneja en pokedexdrive.js, pero podemos cerrarlo si el usuario hace click fuera
        const driveModal = document.getElementById('drive-modal');
        if(driveModal) driveModal.style.display = 'none';
        dom.modalOverlay.style.display = 'none';
    }

    function randomizeTheme() {
        const hue = Math.floor(Math.random() * 360);
        updatePaletteCSS(isLightMode ? lightPaletteHSL : darkPaletteHSL, hue);
    }

    function updatePaletteCSS(p, hue) {
        const root = document.documentElement;
        const hsl = (h,s,l) => `hsl(${h},${s}%,${l}%)`;
        const rgb = (h,s,l) => { s/=100; l/=100; const f=n=>{ const k=(n+h/30)%12; const a=s*Math.min(l,1-l); return l-a*Math.max(-1,Math.min(k-3,9-k,1));}; return [Math.round(255*f(0)),Math.round(255*f(8)),Math.round(255*f(4))].join(','); };
        const c = rgb(hue,p.accent.s,p.accent.l); const bgHue=(hue+200)%360;
        root.style.setProperty('--color-cyan-accent', hsl(hue,p.accent.s,p.accent.l));
        root.style.setProperty('--color-cyan-glow', `rgba(${c},0.25)`);
        root.style.setProperty('--color-green-accent', `hsl(${(hue+120)%360},80%,45%)`);
        root.style.setProperty('--color-bg-dark', hsl(bgHue,p.dark.s,p.dark.l));
        root.style.setProperty('--color-bg-medium', hsl(bgHue,p.medium.s,p.medium.l));
        root.style.setProperty('--color-border', hsl(bgHue,p.border.s,p.border.l));
        root.style.setProperty('--color-text-primary', hsl(bgHue,p.textP.s,p.textP.l));
        root.style.setProperty('--color-text-secondary', hsl(bgHue,p.textS.s,p.textS.l));
        if (isLightMode) root.classList.add('light-mode'); else root.classList.remove('light-mode');
    }

    // --- CSV & EDITOR LOGIC (Preservada de v3.9) ---
    function parseCSVLine(text) { const r=[]; let c='',q=false; for(let i=0;i<text.length;i++){const x=text[i],n=text[i+1];if(q){if(x==='"'&&n==='"'){c+='"';i++}else if(x==='"')q=false;else c+=x}else{if(x===';'){r.push(c);c=''}else if(x==='"')q=true;else c+=x}} r.push(c); return r; }
    function parseAndImportCsv(t) { let x=t;if(x.charCodeAt(0)===0xFEFF)x=x.slice(1); const l=x.split(/\r?\n/).filter(y=>y.trim()); if(l.length<4)throw new Error("CSV corto"); const g=parseCSVLine(l[0]),k=g[0].toLowerCase().trim(); if(!k)throw new Error("No Key"); const c=parseCSVLine(l[1]),d=parseCSVLine(l[2]),s={},o=[]; for(let i=2;i<c.length;i++){const n=g[i]||"Otros",CD=c[i],DS=d[i]||CD;if(CD){if(!s[n]){s[n]=[];o.push(n)}s[n].push({code:CD,desc:DS})}} masterSchemaMap[k]=o.map(n=>({group:n,attrs:s[n]})); activeSchemas.add(k); let cnt=0; for(let i=3;i<l.length;i++){const r=parseCSVLine(l[i]),m=r[1];if(!m)continue;const a={};for(let j=2;j<c.length;j++){if(c[j]&&r[j])a[c[j]]=r[j]}const ix=masterDatabase.findIndex(z=>z.model===m),np={model:m,schema_key:k,attributes:a};if(ix>=0)masterDatabase[ix]=np;else masterDatabase.push(np);cnt++} return {count:cnt,schemaKey:k}; }
    function handleCsvTextImport(){ const t=dom.csvTextInput.value.trim();if(t){try{const r=parseAndImportCsv(t);alert(`Importados ${r.count} en ${r.schemaKey}`);dom.csvTextInput.value='';refreshUI();}catch(e){alert(e.message);}} }
    function handleCsvFileUpload(e){ const f=e.target.files[0];if(f){const r=new FileReader();r.onload=v=>{try{const res=parseAndImportCsv(v.target.result);dom.uploadStatusText.textContent=`OK: ${res.schemaKey}`;dom.uploadStatusText.style.color='var(--color-green-accent)';refreshUI();}catch(err){alert(err.message);}};r.readAsText(f,'UTF-8');e.target.value='';} }
    
    // --- EXPORT & EDITORS ---
    function updateSearchResults(){const q=dom.modelSearchInput.value.toLowerCase();dom.modelSearchResults.innerHTML='';const f=masterDatabase.filter(p=>p.model.toLowerCase().includes(q)&&activeSchemas.has(p.schema_key));if(f.length===0){dom.modelSearchResults.innerHTML='<div class="list-item" style="cursor:default">Sin resultados</div>';return}const fg=document.createDocumentFragment();f.forEach(p=>{const d=document.createElement('div');d.className='list-item';d.textContent=p.model;d.dataset.model=p.model;fg.appendChild(d)});dom.modelSearchResults.appendChild(fg);}
    function handleResultClick(e){const i=e.target.closest('.list-item');if(i)loadModelEditor(i.dataset.model);}
    function createNewModel(){const s=dom.createModelSchemaSelect.value,id=dom.createModelIdInput.value.trim().toUpperCase();if(!s||!id)return alert("Datos?");if(masterDatabase.find(p=>p.model===id)&&!confirm("Editar?"))return;masterDatabase.push({model:id,schema_key:s,attributes:{}});loadModelEditor(id);}
    function loadModelEditor(id){const p=masterDatabase.find(x=>x.model===id);if(!p)return;currentLoadedSchemaKey=p.schema_key;dom.productTitle.textContent=id;dom.editModelIdInput.value=id;dom.editSchemaKeyDisplay.value=p.schema_key;dom.editorPlaceholder.style.display='none';dom.editorForm.querySelectorAll('.form-group-title,.form-row').forEach(e=>e.remove());const s=masterSchemaMap[p.schema_key];if(!s)return alert("No schema");s.forEach(g=>{const h=document.createElement('h3');h.className='form-group-title';h.textContent=g.group;dom.editorForm.appendChild(h);g.attrs.forEach(a=>{const r=document.createElement('div');r.className='form-row';r.innerHTML=`<label class="futuristic-label">${a.desc}</label><textarea class="futuristic-textarea" name="${a.code}" rows="1">${p.attributes[a.code]||''}</textarea>`;dom.editorForm.appendChild(r)})});showPanel('edit-model');}
    function updateSchemaLists(){const k=Object.keys(masterSchemaMap).filter(x=>activeSchemas.has(x));dom.schemaResultsList.innerHTML='';dom.createModelSchemaSelect.innerHTML='<option value="">--</option>';dom.gamaExportSelect.innerHTML='<option value="">--</option>';k.forEach(x=>{const d=document.createElement('div');d.className='list-item';d.textContent=x;d.dataset.key=x;dom.schemaResultsList.appendChild(d);const o1=document.createElement('option');o1.value=x;o1.textContent=x;dom.createModelSchemaSelect.appendChild(o1);const o2=document.createElement('option');o2.value=x;o2.textContent=x;dom.gamaExportSelect.appendChild(o2);});}
    function handleSchemaLoad(e){const i=e.target.closest('.list-item');if(i)loadSchemaEditor(i.dataset.key);}
    function createNewSchema(){const k=dom.newSchemaKeyInput.value.trim().toLowerCase();if(k){if(!masterSchemaMap[k])masterSchemaMap[k]=[];loadSchemaEditor(k);}}
    function loadSchemaEditor(k){dom.editSchemaKeyInput.value=k;dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(e=>e.remove());masterSchemaMap[k].forEach(g=>addGroupToSchemaEditor(g));showPanel('edit-schema');}
    function addGroupToSchemaEditor(g=null){const d=document.createElement('div');d.className='schema-group-box';d.innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:.5rem"><input class="futuristic-input" placeholder="Grupo" value="${g?g.group:''}" data-role="group-name"><button class="schema-action-btn schema-remove-btn" onclick="this.closest('.schema-group-box').remove()">Eliminar</button></div><div class="attrs-container"></div><button class="schema-action-btn" data-role="add-attr" style="margin-left:0;margin-top:.5rem;color:var(--color-green-accent)">+ Attr</button>`;const c=d.querySelector('.attrs-container');if(g)g.attrs.forEach(a=>addAttrRow(c,a));dom.schemaEditorForm.appendChild(d);}
    function addAttrRow(c,a=null){const r=document.createElement('div');r.className='schema-attr-row';r.innerHTML=`<input class="futuristic-input" placeholder="ID" value="${a?a.code:''}" data-role="attr-code"><input class="futuristic-input" placeholder="Label" value="${a?a.desc:''}" data-role="attr-desc"><button class="schema-action-btn schema-remove-btn" onclick="this.parentElement.remove()">✕</button>`;c.appendChild(r);}
    function handleSchemaEditorEvents(e){if(e.target.dataset.role==='add-attr'){e.preventDefault();addAttrRow(e.target.previousElementSibling);}}
    function buildSchemaFromDOM(){const g=[];let ok=true;dom.schemaEditorForm.querySelectorAll('.schema-group-box').forEach(b=>{const n=b.querySelector('[data-role="group-name"]').value.trim();if(!n){ok=false;return}const a=[];b.querySelectorAll('.schema-attr-row').forEach(r=>{const c=r.querySelector('[data-role="attr-code"]').value.trim(),d=r.querySelector('[data-role="attr-desc"]').value.trim();if(c&&d)a.push({code:c,desc:d})});g.push({group:n,attrs:a})});return ok?g:null;}
    function openLibraryModal(){renderLibraryList();dom.libraryModal.style.display='block';dom.modalOverlay.style.display='block';}
    function renderLibraryList(){dom.libraryGamaList.innerHTML='';Object.keys(masterSchemaMap).forEach(k=>{const a=activeSchemas.has(k),d=document.createElement('div');d.className='gama-toggle-item';d.innerHTML=`<label class="gama-toggle-label"><input type="checkbox" class="gama-checkbox" data-key="${k}" ${a?'checked':''}><span class="gama-name">${k.toUpperCase()}</span></label><div class="gama-actions-right"><button class="gama-download-btn" data-key="${k}">⬇</button></div>`;dom.libraryGamaList.appendChild(d)});}
    function handleMemorySave(){dom.btnSaveMemory.style.transform="scale(0.9)";setTimeout(()=>dom.btnSaveMemory.style.transform="scale(1)",150);if(currentActivePanel==='edit-model'){const id=dom.editModelIdInput.value;if(!id)return;const fd=new FormData(dom.editorForm),at={};for(const[k,v]of fd.entries())if(v.trim())at[k]=v.trim();const ix=masterDatabase.findIndex(x=>x.model===id),np={model:id,schema_key:dom.editSchemaKeyDisplay.value,attributes:at};if(ix>=0)masterDatabase[ix]=np;else masterDatabase.push(np);alert("Modelo guardado en RAM");}else if(currentActivePanel==='edit-schema'){const k=dom.editSchemaKeyInput.value,s=buildSchemaFromDOM();if(s){masterSchemaMap[k]=s;alert("Esquema guardado en RAM");}}refreshUI();}
    function handleExportFile(){if(currentActivePanel==='edit-model'){const id=dom.editModelIdInput.value,p=masterDatabase.find(x=>x.model===id);if(p)downloadFile(id+'.json',JSON.stringify(p,null,4),'application/json');}else if(currentActivePanel==='edit-schema'){const k=dom.editSchemaKeyInput.value,s=masterSchemaMap[k];if(s)downloadFile('schema_'+k+'.js',`window.APP_DB.registerSchema('${k}',${JSON.stringify(s,null,4)});`,'text/javascript');}}
    function updateExportList(){const s=dom.gamaExportSelect.value;dom.gamaExportList.innerHTML='';if(s)masterDatabase.filter(p=>p.schema_key===s).forEach(p=>{const d=document.createElement('div');d.className='gama-toggle-item';d.innerHTML=p.model;dom.gamaExportList.appendChild(d)});}
    function exportFullGamaJson(){const s=dom.gamaExportSelect.value;if(s)downloadFile('GAMA_'+s+'.json',JSON.stringify(masterDatabase.filter(p=>p.schema_key===s),null,4),'application/json');}
    function exportFullGamaCsv(){const s=dom.gamaExportSelect.value;if(s)exportGamaToCSV(s);else alert("Selecciona gama");}
    function exportGamaToCSV(k){const p=masterDatabase.filter(x=>x.schema_key===k);if(!p.length)return alert("Vacío");const sd=masterSchemaMap[k],r1=[k,"Info"],r2=["","model"],r3=["","Modelo"],ak=[];sd.forEach(g=>g.attrs.forEach(a=>{r1.push(g.group);r2.push(a.code);r3.push(a.desc);ak.push(a.code)}));const san=v=>{if(v==null)return"";v=String(v).replace(/"/g,'""');return(v.search(/("|\;|:|\n)/g)>=0)?'"'+v+'"':v},rows=p.map(x=>{let r=["",san(x.model)];ak.forEach(c=>r.push(san(x.attributes[c]||"")));return r.join(";")}),csv="\uFEFF"+r1.map(san).join(";")+"\n"+r2.map(san).join(";")+"\n"+r3.map(san).join(";")+"\n"+rows.join("\n");downloadFile('GAMA_'+k+'.csv',csv,'text/csv;charset=utf-8');}
    function downloadFile(n,c,m){const b=new Blob([c],{type:m}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();document.body.removeChild(a);}

    initialize();
});