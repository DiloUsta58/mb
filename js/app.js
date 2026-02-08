/* =========================
   APP VERSION
========================= */
const APP_VERSION = "1.1.5";

/* =========================
   THEME SWITCHER
========================= */
const THEME_KEY = "inventur_theme";

function applyTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
}

function initTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark" : "light";

    applyTheme(saved || system);
}


/* =========================
   KW + STORAGE SYSTEM
========================= */
const STORAGE_KEY = "baffleInventoryKW";

/* ISO Kalenderwoche berechnen */
function getISOWeek(){
    const now = new Date();
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
    return { year: date.getUTCFullYear(), week: weekNo };
}

const KW = getISOWeek();

/* Alle Wochen laden */
function loadAllWeeks(){
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

/* =====================================
   EINE WOCHE LADEN (MIT AUTO-ÜBERNAHME)
===================================== */
function loadWeekData(){

    const selectedWeek = kwSelect.value;   // z.B. 2026-KW6
    const allWeeks = loadAllWeeks();

    /* aktuelle KW ermitteln */
    const currentKW = getCurrentKW();
    const selectedKWNumber = Number(selectedWeek.split("KW")[1]);

    /* 🔴 1. Zukunft prüfen */
    if(selectedKWNumber > currentKW){

        alert("Keine Daten vorhanden – Datum liegt in der Zukunft.");

        data = JSON.parse(JSON.stringify(defaultInventory));
        seedsData = JSON.parse(JSON.stringify(defaultSeeds));

        renderTable();
        renderSeeds();
        updatePrintHeader();
        return;
    }

    /* 🟢 2. Woche hat bereits Daten → normal laden */
    if(allWeeks[selectedWeek]){
        data = allWeeks[selectedWeek].inventory;
        seedsData = allWeeks[selectedWeek].seeds;

        renderTable();
        renderSeeds();
        updatePrintHeader();
        return;
    }

    /* 🟡 3. Woche hat KEINE Daten → Vorwoche suchen */
    const prevWeekKey = getPreviousWeekKey(selectedWeek);

    if(prevWeekKey && allWeeks[prevWeekKey]){

        console.log("📦 Übernehme Daten aus", prevWeekKey);

        // Deep Copy (!! sehr wichtig)
        data = JSON.parse(JSON.stringify(allWeeks[prevWeekKey].inventory));
        seedsData = JSON.parse(JSON.stringify(allWeeks[prevWeekKey].seeds));

        // sofort speichern → Woche existiert jetzt
        saveWeekData();

        renderTable();
        renderSeeds();
        updatePrintHeader();
        return;
    }

    /* 🔵 4. Erste Nutzung → Default */
    console.log("🆕 Starte mit Default Daten");

    data = JSON.parse(JSON.stringify(defaultInventory));
    seedsData = JSON.parse(JSON.stringify(defaultSeeds));

    saveWeekData();
    renderTable();
    renderSeeds();
    updatePrintHeader();
}



/* Woche speichern */
function saveWeekData(){

    const selectedWeek = kwSelect.value;   // einzige Quelle!

    const allWeeks = loadAllWeeks();
    allWeeks[selectedWeek] = {
        inventory: data,
        seeds: seedsData
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allWeeks));
}





let defaultInventory = [
  { name:"Baffle 920/910 mm", artikel:"E00007344", vorOrt:0, lager:0, aufbau:0 },
  { name:"Hartfilzplatte1000x1500x10 mm", artikel:"E00033020", vorOrt:0, lager:0, aufbau:0 },
  { name:"Baffle 688 mm", artikel:"E00007106", vorOrt:0, lager:0, aufbau:0 },
  { name:"CFC Platte 1000x1000x2,0mm", artikel:"E00033083", vorOrt:0, lager:0, aufbau:0 },
  { name:"Vierkantmutter M10 17x17mm", artikel:"E00006727", vorOrt:0, lager:0, aufbau:0 },
  { name:"CFC Gewindestange M10 x 1000 mm", artikel:"E00033019", vorOrt:0, lager:0, aufbau:0 },
  { name:"CFC Gewindestange M6 x 70 mm", artikel:"E00007814", vorOrt:0, lager:0, aufbau:0 },
  { name:"Rundmutter M6 25 x 5 mm", artikel:"E00008295", vorOrt:0, lager:0, aufbau:0 },
  { name:"Nickel Foil Purity 99,6% 0,0125 mm x 500 mm", artikel:"E32705202", vorOrt:0, lager:0, aufbau:0 },
  { name:"Graphitkordel 2 mm Ø", artikel:"E00000177", vorOrt:0, lager:0, aufbau:0 },
  { name:"Flachmutter, rund M10 25 x 7 mm", artikel:"E00008296", vorOrt:0, lager:0, aufbau:0 }
];

let defaultSeeds = [
    { typ:"A", menge:0 },
    { typ:"B", menge:0 },
    { typ:"S f S", menge:0 }
];

/* ==============================
   GLOBALE APP STATE VARS
============================== */
let currentKW = getCurrentKW();   // ← NEU (global verfügbar)

let data = JSON.parse(JSON.stringify(defaultInventory));
let seedsData = JSON.parse(JSON.stringify(defaultSeeds));
/* ==============================
   HILFSFUNKTIONEN
============================== */
/* Aktuelle Kalenderwoche berechnen */4
function getCurrentKW(){
    const now = new Date();
    const firstJan = new Date(now.getFullYear(),0,1);
    const days = Math.floor((now - firstJan) / (24*60*60*1000));
    return Math.ceil((days + firstJan.getDay()+1) / 7);
}

/* Vorherige Woche ermitteln */
function getPreviousWeekKey(currentKey){
    const allWeeks = loadAllWeeks();
    const keys = Object.keys(allWeeks).sort(); // chronologisch

    const index = keys.indexOf(currentKey);
    if(index <= 0) return null;

    return keys[index - 1];
}


document.getElementById("kwDisplay").textContent =
    `KW ${KW.week} / ${new Date().toLocaleDateString("de-DE")}`;



const tbody = document.querySelector("#inventoryTable tbody");


/* Berechnung */
function calcTotal(vorOrt, lager, aufbau){

    vorOrt = Number(vorOrt) || 0;
    lager  = Number(lager)  || 0;
    aufbau = Number(aufbau) || 0;

    let newVorOrt = vorOrt;
    let newLager  = lager;

    // 1️⃣ Aufbau zuerst von Vor Ort abziehen
    if (aufbau <= newVorOrt){
        newVorOrt -= aufbau;
    }else{
        // 2️⃣ Rest von Lager abziehen
        let rest = aufbau - newVorOrt;
        newVorOrt = 0;
        newLager = Math.max(0, newLager - rest);
    }

    // 3️⃣ Gesamt berechnen
    return newVorOrt + newLager;
}


/* Tabelle rendern */
function renderTable(){
    tbody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>

            <td class="col-mobile-hide">${item.artikel}</td>

            <td data-print="${item.vorOrt}">
                <input type="number" value="${item.vorOrt}" data-row="${index}" data-field="vorOrt">
            </td>

            <td class="col-lager" data-print="${item.lager}">
                <input type="number" value="${item.lager}" data-row="${index}" data-field="lager">
            </td>

            <td class="col-aufbau col-mobile-hide" data-print="${item.aufbau}">
                <input type="number" value="${item.aufbau}" data-row="${index}" data-field="aufbau">
            </td>

            <td class="total col-total">
                ${calcTotal(item.vorOrt,item.lager,item.aufbau)}
            </td>
        `;


        tbody.appendChild(row);
    });
}

renderTable();


/* ===== SEEDS ===== */

const seedsBody = document.querySelector("#seedsTable tbody");

function renderSeeds(){
    seedsBody.innerHTML = "";

    seedsData.forEach((item,index)=>{
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.typ}</td>
            <td data-print="${item.menge}">
                <input type="number" value="${item.menge}" data-seed="${index}">
            </td>
        `;

        seedsBody.appendChild(row);
    });
}


renderSeeds();

/* =====================================
   GLOBAL INPUT LISTENER (Tippen erlauben)
===================================== */
document.addEventListener("input", e=>{

    /* ===== INVENTORY ===== */
    if(e.target.dataset.row !== undefined){

        const rowIndex = e.target.dataset.row;
        const field = e.target.dataset.field;

        data[rowIndex][field] = Number(e.target.value) || 0;

        /* 🔴 LIVE Gesamt berechnen */
        const row = e.target.closest("tr");
        const inputs = row.querySelectorAll("input");

        const vorOrt = Number(inputs[0].value) || 0;
        const lager  = Number(inputs[1].value) || 0;

        const total = vorOrt + lager;

        const totalCell = row.querySelector(".total");
        totalCell.textContent = total;


        /* Druckwerte aktualisieren */
        inputs[0].parentElement.dataset.print = vorOrt;
        inputs[1].parentElement.dataset.print = lager;
        inputs[2].parentElement.dataset.print = Number(inputs[2].value) || 0;

        saveWeekData();
        return;
    }

    /* ===== SEEDS ===== */
    if(e.target.dataset.seed !== undefined){
        const index = e.target.dataset.seed;
        seedsData[index].menge = Number(e.target.value) || 0;
        saveWeekData();
        return;
    }
});


/* =====================================
   AUFBAU BUCHEN (bei Feld verlassen)
===================================== */
document.addEventListener("change", e=>{

    if(e.target.dataset.field !== "aufbau") return;

    const rowIndex = e.target.dataset.row;
    let rowData = data[rowIndex];

    let aufbau = Number(rowData.aufbau) || 0;
    if(aufbau === 0) return;

    let vorOrt = Number(rowData.vorOrt) || 0;
    let lager  = Number(rowData.lager)  || 0;

    /* 🔥 Lagerlogik */
    if(aufbau <= vorOrt){
        vorOrt -= aufbau;
    }else{
        let rest = aufbau - vorOrt;
        vorOrt = 0;
        lager = Math.max(0, lager - rest);
    }

    /* Werte übernehmen */
    rowData.vorOrt = vorOrt;
    rowData.lager  = lager;
    rowData.aufbau = 0;

    saveWeekData();
    renderTable();
});


/* =========================
   KW SELECTOR
========================= */

const kwSelect = document.getElementById("kwSelect");

/* vorhandene Wochen laden */
function populateKWSelector(){

    const currentKW = getCurrentKW();
    const year = new Date().getFullYear();

    kwSelect.innerHTML = "";

    // alle KW des Jahres erzeugen (1–52)
    for(let kw=1; kw<=52; kw++){

        const opt = document.createElement("option");
        opt.value = `${year}-KW${kw}`;

        // Anzeige im Dropdown
        if(kw > currentKW){
            opt.textContent = `KW ${kw} (Zukunft)`;
        }else{
            opt.textContent = `KW ${kw}`;
        }

        kwSelect.appendChild(opt);
    }

    // aktuelle Woche automatisch auswählen
    kwSelect.value = `${year}-KW${currentKW}`;
}


populateKWSelector();

/* KW wechseln */
kwSelect.addEventListener("change", ()=>{
    loadWeekData();
});
 
/* Alle gespeicherten Wochen zurückgeben (sortiert) */
function getStoredWeeks(){
    const allWeeks = loadAllWeeks();
    return Object.keys(allWeeks).sort();
}

function populateResetWeekSelect(){
    const select = document.getElementById("resetWeekSelect");
    select.innerHTML = "";

    const weeks = getStoredWeeks();

    weeks.forEach(week=>{
        const opt = document.createElement("option");
        opt.value = week;
        opt.textContent = week;
        select.appendChild(opt);
    });
}







/* Drucken */
document.getElementById("printBtn").addEventListener("click", ()=>{
    alert(
      "Tipp für sauberen Ausdruck:\n\n" +
      "Im Druckdialog → Weitere Einstellungen →\n" +
      "Häkchen bei 'Kopf- und Fußzeilen' entfernen." +
      "     \n\n" +
    "Bei Problemen mit veralteten Daten:\n" +
    "Iphone: Einstellung → Apps → Safari \n" +  
    "→ 'Websitedaten löschen' → Seite neu laden\n\n" +
    "Dark Mode: Wenn aktiviert, kann es sein, dass die Druckversion zu dunkel ist.\n\n" +
    "In diesem Fall bitte vorübergehend auf Light Mode wechseln."
    );

    window.print();
});


/* ===============================
   SERVICE WORKER REGISTRIEREN
=============================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Service Worker aktiv"))
      .catch(err => console.log("SW Fehler:", err));
  });
}

/* ===============================
   AKTUELLES DATUM FOOTER
=============================== */
function formatGermanDate(date){
    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

document.getElementById("currentDate").textContent =
    formatGermanDate(new Date());

document.getElementById("appVersion").textContent = APP_VERSION;


/* ===============================
   DATEN ZURÜCKSETZEN (aktive KW)
=============================== */
/* Reset-Button */
resetBtn.addEventListener("click", ()=>{
    populateResetWeekSelect();
    document.getElementById("resetPanel").classList.remove("hidden");
});

/* Reset abbrechen */
document.getElementById("cancelReset").onclick = ()=>{
    document.getElementById("resetPanel").classList.add("hidden");
};

/* Daten zurücksetzen */
document.getElementById("confirmReset").onclick = ()=>{

    const mode = document.querySelector("input[name='resetMode']:checked").value;
    const allWeeks = loadAllWeeks();

    if(mode === "current"){
        delete allWeeks[kwSelect.value];
    }

    if(mode === "single"){
        const week = document.getElementById("resetWeekSelect").value;
        delete allWeeks[week];
    }

    if(mode === "all"){
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allWeeks));

    loadWeekData();
    renderTable();
    renderSeeds();

    document.getElementById("resetPanel").classList.add("hidden");
};


/* ===============================
   DRUCK HEADER (KW anzeigen)
=============================== */
function updatePrintHeader(){
    document.querySelector(".print-kw").textContent =
        "Kalenderwoche: " + kwSelect.value;
}


/* =====================================
   APP START (DOM READY)
===================================== */
document.addEventListener("DOMContentLoaded", () => {

/*
    alert(
      "Tipp falls die Seite sich nicht aktuallisiert:\n\n" +
      "Iphone: Einstellung → Apps → Safari \n" +
      "→ 'Websitedaten löschen' → Seite neu laden\n\n" +
      "PC: STRG + F5 drücken (Hard Reload)"
    );
*/

    populateKWSelector();   // zuerst KW füllen
    loadWeekData();         // DANN Woche laden
    updatePrintHeader();

});



/* =========================
   SERVICE WORKER UPDATE CHECK
========================= */

let swRegistration;

if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('sw.js').then(reg => {

        swRegistration = reg;

        // Neuer Service Worker gefunden
        reg.onupdatefound = () => {
            const newWorker = reg.installing;

            newWorker.onstatechange = () => {
                if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        showUpdateBanner();
                    }
                }
            };
        };

    }).catch(err => console.log("SW Fehler:", err));

    // Wenn neuer SW aktiv → Seite neu laden
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

function showUpdateBanner(){
    document.getElementById("updateBanner").style.display = "block";
}

/* 👉 DAS ist jetzt der richtige Update Button */
function updateApp(){

    if(!swRegistration || !swRegistration.waiting){
        location.reload();
        return;
    }

    // Neuer SW darf aktiv werden
    swRegistration.waiting.postMessage("SKIP_WAITING");
}


/* =========================
   THEME TOGGLE
========================= */
document.getElementById("themeToggle").onclick = () =>{
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
};

initTheme();






/* =========================
   APP VERSION LOG
========================= */
console.log("App Version:", APP_VERSION);
