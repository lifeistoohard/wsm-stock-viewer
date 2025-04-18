const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const RANGE = "Maintenance!B2:G";

let rawData = [];

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    rawData = data.values;
    populateModelDropdown();
  });

function populateModelDropdown() {
  const models = [...new Set(rawData.map(row => row[0]))].sort();
  const modelSelect = document.getElementById("model");
  modelSelect.innerHTML = "<option value=''>-- เลือก Model --</option>";
  models.forEach(model => {
    modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
  });

  modelSelect.onchange = () => {
    populateModelYearDropdown(modelSelect.value);
    clearDropdown("system");
    clearResults();
  };
}

function populateModelYearDropdown(selectedModel) {
  const years = [...new Set(rawData.filter(row => row[0] === selectedModel).map(row => row[1]))];
  const yearSelect = document.getElementById("modelYear");
  yearSelect.innerHTML = "<option value=''>-- เลือก Model Year --</option>";
  years.forEach(year => {
    yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
  });

  yearSelect.onchange = () => {
    populateSystemDropdown(selectedModel, yearSelect.value);
    clearResults();
  };
}

function populateSystemDropdown(selectedModel, selectedYear) {
  const systems = [...new Set(rawData.filter(row => row[0] === selectedModel && row[1] === selectedYear).map(row => row[2]))];
  const systemSelect = document.getElementById("system");
  systemSelect.innerHTML = "<option value=''>-- เลือก System --</option>";
  systems.forEach(sys => {
    systemSelect.innerHTML += `<option value="${sys}">${sys}</option>`;
  });

  systemSelect.onchange = () => {
    showResults(selectedModel, selectedYear, systemSelect.value);
  };
}

function showResults(model, year, system) {
  const filtered = rawData.filter(row =>
    row[0] === model && row[1] === year && row[2] === system
  );

  const container = document.getElementById("results");
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = "<p>❌ ไม่พบข้อมูล</p>";
    return;
  }

  const group = document.createElement("div");
  group.className = "group-box";
  group.innerHTML = `<div class="group-title">📌 ${model} ${year} - ${system}</div>`;

  filtered.forEach(row => {
    group.innerHTML += `<div class="result-item">📖 ${row[3]} &nbsp;&nbsp;&nbsp; 🧭 ระยะ: ${row[5]}</div>`;
  });

  container.appendChild(group);
}

// 🔍 ฟังก์ชันเสิร์ชด้วย keyword
function searchByKeyword() {
  const keyword = document.getElementById("keyword").value.trim();
  if (!keyword) return;

  const filtered = rawData.filter(row => row[3].toLowerCase().includes(keyword.toLowerCase()));
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = "<p>❌ ไม่พบข้อมูล</p>";
    return;
  }

  const grouped = {};

  filtered.forEach(row => {
    const key = `${row[0]} ${row[1]}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  Object.entries(grouped).forEach(([key, rows]) => {
    const box = document.createElement("div");
    box.className = "group-box";
    box.innerHTML = `<div class="group-title">🚗 ${key}</div>`;

    rows.forEach(row => {
      box.innerHTML += `<div class="result-item">📖 ${row[3]} &nbsp;&nbsp;&nbsp; 🧭 ระยะ: ${row[5]}</div>`;
    });

    container.appendChild(box);
  });
}

// 🔁 Auto-suggest
function handleSuggest() {
  const keyword = document.getElementById("keyword").value.toLowerCase();
  const suggestions = [...new Set(rawData.map(row => row[3]).filter(item => item && item.toLowerCase().includes(keyword)))];
  const list = document.getElementById("suggestions");
  list.innerHTML = "";
  suggestions.forEach(text => {
    const opt = document.createElement("option");
    opt.value = text;
    list.appendChild(opt);
  });
}

function clearDropdown(id) {
  const dropdown = document.getElementById(id);
  dropdown.innerHTML = `<option value=''>-- เลือก --</option>`;
}

function clearResults() {
  document.getElementById("results").innerHTML = "";
}
