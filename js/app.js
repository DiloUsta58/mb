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
const CURRENT_KW_KEY = `${KW.year}-KW${KW.week}`;

/* Alle Wochen laden */
function loadAllWeeks(){
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

/* Eine Woche laden */
function loadWeekData(){
    const allWeeks = loadAllWeeks();
    return allWeeks[CURRENT_KW_KEY] || null;
}

/* Woche speichern */
function saveWeekData(){
    const selectedWeek = kwSelect?.value || CURRENT_KW_KEY;

    const allWeeks = loadAllWeeks();
    allWeeks[selectedWeek] = {
        inventory: data,
        seeds: seedsData
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allWeeks));
    populateKWSelector();
}




let defaultInventory = [
  { name:"Baffle 920/910 mm", artikel:"E00007344", vorOrt:17, lager:100, aufbau:0 },
  { name:"Hartfilzplatte1000x1500x10 mm", artikel:"E00033020", vorOrt:28, lager:0, aufbau:0 },
  { name:"Baffle 688 mm", artikel:"E00007106", vorOrt:16, lager:100, aufbau:0 },
  { name:"CFC Platte 1000x1000x2,0mm", artikel:"E00033083", vorOrt:46, lager:0, aufbau:0 },
  { name:"Vierkantmutter M10 17x17mm", artikel:"E00006727", vorOrt:330, lager:0, aufbau:0 },
  { name:"CFC Gewindestange M10 x 1000 mm", artikel:"E00033019", vorOrt:34, lager:0, aufbau:0 },
  { name:"CFC Gewindestange M6 x 70 mm", artikel:"E00007814", vorOrt:200, lager:0, aufbau:0 },
  { name:"Rundmutter M6 25 x 5 mm", artikel:"E00008295", vorOrt:680, lager:0, aufbau:0 },
  { name:"Nickel Foil Purity 99,6% 0,0125 mm x 500 mm", artikel:"E32705202", vorOrt:0, lager:0, aufbau:0 },
  { name:"Graphitkordel 2 mm Ø", artikel:"E00000177", vorOrt:1, lager:0, aufbau:0 },
  { name:"Flachmutter, rund M10 25 x 7 mm", artikel:"E00008296", vorOrt:310, lager:0, aufbau:0 }
];

let defaultSeeds = [
    { typ:"A", menge:91 },
    { typ:"B", menge:127 },
    { typ:"S&S", menge:41 }
];

const weekData = loadWeekData();

let data = weekData ? weekData.inventory : defaultInventory;
let seedsData = weekData ? weekData.seeds : defaultSeeds;

document.getElementById("kwDisplay").textContent =
    `KW ${KW.week} / ${new Date().toLocaleDateString("de-DE")}`;



const tbody = document.querySelector("#inventoryTable tbody");


/* Berechnung */
function calcTotal(vorOrt, lager, aufbau){
    vorOrt = Number(vorOrt) || 0;
    lager  = Number(lager)  || 0;
    aufbau = Number(aufbau) || 0;
    return (vorOrt + lager) - aufbau;
}

/* Tabelle rendern */
function renderTable(){
    tbody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.artikel}</td>

            <td data-print="${item.vorOrt}">
                <input type="number" value="${item.vorOrt}" data-row="${index}" data-field="vorOrt">
            </td>

            <td data-print="${item.lager}">
                <input type="number" value="${item.lager}" data-row="${index}" data-field="lager">
            </td>

            <td data-print="${item.aufbau}">
                <input type="number" value="${item.aufbau}" data-row="${index}" data-field="aufbau">
            </td>

            <td class="total" data-print="${calcTotal(item.vorOrt,item.lager,item.aufbau)}">
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
   GLOBAL INPUT LISTENER (Inventory + Seeds)
===================================== */
document.addEventListener("input", e=>{

    /* ===== INVENTORY ===== */
    if(e.target.dataset.row !== undefined){

        const rowIndex = e.target.dataset.row;
        const field = e.target.dataset.field;

        data[rowIndex][field] = e.target.value;

        const row = e.target.closest("tr");
        const inputs = row.querySelectorAll("input");

        const vorOrt = inputs[0].value;
        const lager  = inputs[1].value;
        const aufbau = inputs[2].value;

        row.querySelector(".total").textContent =
            calcTotal(vorOrt,lager,aufbau);

        saveWeekData();
        return;
    }

    /* ===== SEEDS ===== */
    if(e.target.dataset.seed !== undefined){
        const index = e.target.dataset.seed;
        seedsData[index].menge = e.target.value;

        saveWeekData();
        return;
    }

});


/* =========================
   KW SELECTOR
========================= */

const kwSelect = document.getElementById("kwSelect");

/* vorhandene Wochen laden */
function populateKWSelector(){
    const allWeeks = loadAllWeeks();
    kwSelect.innerHTML = "";

    // aktuelle KW hinzufügen falls noch nicht gespeichert
    if(!allWeeks[CURRENT_KW_KEY]){
        allWeeks[CURRENT_KW_KEY] = { inventory: defaultInventory, seeds: defaultSeeds };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allWeeks));
    }

    const weeks = Object.keys(allWeeks).sort().reverse();

    weeks.forEach(weekKey=>{
        const option = document.createElement("option");
        option.value = weekKey;
        option.textContent = weekKey;
        if(weekKey === CURRENT_KW_KEY) option.selected = true;
        kwSelect.appendChild(option);
    });
}

populateKWSelector();

/* KW wechseln */
kwSelect.addEventListener("change", ()=>{
    const selectedWeek = kwSelect.value;
    const allWeeks = loadAllWeeks();
    const weekData = allWeeks[selectedWeek];

    data = JSON.parse(JSON.stringify(weekData.inventory));
    seedsData = JSON.parse(JSON.stringify(weekData.seeds));

    renderTable();
    renderSeeds();

    document.getElementById("kwDisplay").textContent = selectedWeek;
});

/* Drucken */
document.getElementById("printBtn").addEventListener("click", ()=>{
    window.print();
});
