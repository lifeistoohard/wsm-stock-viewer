// — กำหนดข้อมูล Google Sheets API
const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const RANGE    = "Maintenance!B2:G";

let rawData = [];

// โหลดข้อมูลจาก Google Sheets
async function loadData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const obj = await res.json();
  rawData = obj.values || [];

  populateDropdowns();
  populateSuggestions();
}

// สร้าง dropdown แบบไดนามิก (Model → Year → System)
function populateDropdowns() {
  const modelSelect = document.getElementById("model");
  const yearSelect  = document.getElementById("modelYear");
  const sysSelect   = document.getElementById("system");

  // Model (A–Z)
  const models = [...new Set(rawData.map(r => r[0]).filter(v => v))].sort();
  modelSelect.innerHTML = `<option value=''>-- เลือก Model --</option>`;
  models.forEach(m => modelSelect.innerHTML += `<option>${m}</option>`);

  modelSelect.onchange = () => {
    // Model Year (Z–A)
    const m = modelSelect.value;
    const years = [...new Set(
      rawData
        .filter(r => r[0] === m)
        .map(r => r[1])
        .filter(v => v)
    )]
    // เรียงแบบ Z–A
    .sort()
    .reverse();

    yearSelect.innerHTML = `<option value=''>-- เลือกรุ่นปี --</option>`;
    years.forEach(y => yearSelect.innerHTML += `<option>${y}</option>`);

    // เคลียร์ System และผลลัพธ์เดิม
    sysSelect.innerHTML = `<option value=''>-- เลือกระบบ --</option>`;
    document.getElementById("results").innerHTML = "";
  };

  yearSelect.onchange = () => {
    // System (ตามลำดับใน sheet)
    const m = modelSelect.value;
    const y = yearSelect.value;
    // ใช้ Set เพื่อคัดเฉพาะค่าที่เจอครั้งแรก (insertion order = sheet order)
    const systems = [...new Set(
      rawData
        .filter(r => r[0] === m && r[1] === y)
        .map(r => r[2])
        .filter(v => v)
    )];

    sysSelect.innerHTML = `<option value=''>-- เลือกระบบ --</option>`;
    systems.forEach(s => sysSelect.innerHTML += `<option>${s}</option>`);

    document.getElementById("results").innerHTML = "";
  };

  sysSelect.onchange = () => {
    // แสดงผลลัพธ์เมื่อเลือกครบ 3 ตัว
    const m = modelSelect.value, y = yearSelect.value, s = sysSelect.value;
    if (m && y && s) {
      displayGroups(
        rawData.filter(r => r[0] === m && r[1] === y && r[2] === s)
      );
    }
  };
}

// เติมรายการสำหรับ autosuggest (จากคอลัมน์ “List” = index 3)
function populateSuggestions() {
  const dl   = document.getElementById("suggestions");
  const keys = [...new Set(rawData.map(r => r[3]).filter(v => v))];
  keys.forEach(k => {
    const o = document.createElement("option");
    o.value = k;
    dl.appendChild(o);
  });
}

// กด “ค้นหา” ด้วยคำ (manual + autosuggest)
document.getElementById("searchBtn").onclick = () => {
  const kw = document.getElementById("search").value.trim().toLowerCase();
  if (!kw) return;
  const filtered = rawData.filter(r =>
    r[3].toLowerCase().includes(kw)
  );
  displayGroups(filtered);
};

// ฟังก์ชันจัดกลุ่มและแสดงผล
function displayGroups(rows) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!rows.length) {
    results.innerHTML = `<p style="color:red;">❌ ไม่พบข้อมูล</p>`;
    return;
  }

  // สร้าง Map<"Model__Year", rows[]>
  const groups = new Map();
  rows.forEach(r => {
    const key = `${r[0]}__${r[1]}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  // วนสร้างแต่ละกลุ่ม
  groups.forEach((items, key) => {
    const [model, year] = key.split("__");

    // กล่องกรุ๊ป
    const g = document.createElement("div");
    g.className = "group";

    // หัวกล่อง
    const h = document.createElement("p");
    h.className = "group-header";
    h.innerHTML = `<strong>${model}</strong> 
                   <span class="model-year">${year}</span>`;
    g.appendChild(h);

    // รายการภายในกลุ่ม
    items.forEach(r => {
      const d = document.createElement("div");
      d.className = "item";
      d.innerHTML = `
        <p class="item-title">📘 ${r[3]}</p>
        <p class="item-period">⏳ ${r[5] || '-'} </p>
      `;
      g.appendChild(d);
    });

    results.appendChild(g);
  });
}

// เริ่มโหลด
loadData();
