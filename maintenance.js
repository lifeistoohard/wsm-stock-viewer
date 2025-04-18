const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const RANGE = "Maintenance!B2:G";

let rawData = [];

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    rawData = data.values;
    populateModelDropdown();
    setupKeywordSearch();
  });

// ✅ สร้าง dropdown Model
function populateModelDropdown() {
  const modelSet = new Set(rawData.map(row => row[0]));
  const modelList = Array.from(modelSet).sort();
  const modelSelect = document.getElementById("model");
  modelSelect.innerHTML = "<option value=''>-- เลือก Model --</option>";
  modelList.forEach(model => {
    modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
  });

  modelSelect.onchange = () => {
    populateModelYearDropdown(modelSelect.value);
    clearDropdown("system");
    clearResults();
  };
}

// ✅ สร้าง dropdown Model Year
function populateModelYearDropdown(selectedModel) {
  const filtered = rawData.filter(row => row[0] === selectedModel);
  const yearSet = new Set(filtered.map(row => row[1]));
  const yearSelect = document.getElementById("modelYear");
  yearSelect.innerHTML = "<option value=''>-- เลือก Model Year --</option>";
  yearSet.forEach(year => {
    yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
  });

  yearSelect.onchange = () => {
    populateSystemDropdown(selectedModel, yearSelect.value);
    clearResults();
  };
}

// ✅ สร้าง dropdown System
function populateSystemDropdown(selectedModel, selectedYear) {
  const filtered = rawData.filter(row => row[0] === selectedModel && row[1] === selectedYear);
  const systemSet = new Set(filtered.map(row => row[2]));
  const systemSelect = document.getElementById("system");
  systemSelect.innerHTML = "<option value=''>-- เลือก System --</option>";
  systemSet.forEach(sys => {
    systemSelect.innerHTML += `<option value="${sys}">${sys}</option>`;
  });

  systemSelect.onchange = () => {
    showResults(selectedModel, selectedYear, systemSelect.value);
  };
}

// ✅ แสดงผลลัพธ์แบบ grouped
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

  filtered.forEach(row => {
    const title = `<div class="card-title"><strong>${row[0]}</strong> <span style="color:red; margin-left: 8px;">${row[1]}</span></div>`;
    const card = `
      <div class="card">
        ${title}
        <p><strong>📘</strong> <strong>${row[3]}</strong></p>
        <p><strong>📅</strong> ${row[5]}</p>
      </div>
    `;
    container.innerHTML += card;
  });
}

// ✅ ค้นหาด้วยคีย์เวิร์ด พร้อม autosuggest
function setupKeywordSearch() {
  const input = document.getElementById("keywordSearch");
  const suggestions = document.getElementById("suggestions");

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();
    suggestions.innerHTML = "";

    if (!keyword) return;

    const matches = [...new Set(rawData.map(row => row[3]))].filter(item =>
      item.toLowerCase().includes(keyword)
    );

    matches.slice(0, 10).forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      div.className = "suggestion";
      div.onclick = () => {
        input.value = item;
        suggestions.innerHTML = "";
        searchByKeyword(item);
      };
      suggestions.appendChild(div);
    });
  });

  document.getElementById("keywordSearchBtn").onclick = () => {
    searchByKeyword(input.value.trim());
  };
}

// ✅ แสดงผลคีย์เวิร์ดแบบ grouped
function searchByKeyword(keyword) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!keyword) return;

  const filtered = rawData.filter(row =>
    row[3].toLowerCase().includes(keyword.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>❌ ไม่พบข้อมูลที่ตรงกับคำค้นหา</p>";
    return;
  }

  const grouped = {};

  filtered.forEach(row => {
    const key = `${row[0]}|${row[1]}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  for (const key in grouped) {
    const [model, year] = key.split("|");
    const groupTitle = `<div class="card-title"><strong>${model}</strong> <span style="color:red; margin-left: 8px;">${year}</span></div>`;
    const cardContent = grouped[key].map(row =>
      `<p><strong>📘</strong> <strong>${row[3]}</strong></p><p><strong>📅</strong> ${row[5]}</p>`
    ).join("");

    container.innerHTML += `
      <div class="card">
        ${groupTitle}
        ${cardContent}
      </div>
    `;
  }
}

// ✅ รีเซ็ต
function clearDropdown(id) {
  document.getElementById(id).innerHTML = `<option value=''>-- เลือก --</option>`;
}

function clearResults() {
  document.getElementById("results").innerHTML = "";
}
