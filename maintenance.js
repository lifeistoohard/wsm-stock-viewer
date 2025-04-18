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

function populateSystemDropdown(model, year) {
  const filtered = rawData.filter(row => row[0] === model && row[1] === year);
  const systemSet = new Set(filtered.map(row => row[2]));
  const systemSelect = document.getElementById("system");
  systemSelect.innerHTML = "<option value=''>-- เลือก System --</option>";
  systemSet.forEach(sys => {
    systemSelect.innerHTML += `<option value="${sys}">${sys}</option>`;
  });

  systemSelect.onchange = () => {
    showResults(model, year, systemSelect.value);
  };
}

function showResults(model, year, system) {
  const filtered = rawData.filter(row =>
    row[0] === model && row[1] === year && row[2] === system
  );

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (filtered.length === 0) {
    resultsDiv.innerHTML = "<p>❌ ไม่พบข้อมูล</p>";
    return;
  }

  resultsDiv.innerHTML += `
    <div class="group-title">
      🔧 ${model} <span class="model-year">${year}</span>
    </div>
    <div class="result-card">
      ${filtered.map(row => `
        <div>
          <div class="item">${row[3]}</div>
          <div class="period">${row[5]}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function searchByKeyword() {
  const keyword = document.getElementById("keywordInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!keyword) return;

  const matches = rawData.filter(row =>
    row[3] && row[3].toLowerCase().includes(keyword)
  );

  if (matches.length === 0) {
    resultsDiv.innerHTML = "<p>❌ ไม่พบรายการที่เกี่ยวข้อง</p>";
    return;
  }

  const grouped = {};
  matches.forEach(row => {
    const key = `${row[0]}||${row[1]}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  Object.entries(grouped).forEach(([key, items]) => {
    const [model, year] = key.split("||");

    resultsDiv.innerHTML += `
      <div class="group-title">
        🔧 ${model} <span class="model-year">${year}</span>
      </div>
      <div class="result-card">
        ${items.map(row => `
          <div>
            <div class="item">${row[3]}</div>
            <div class="period">${row[5]}</div>
          </div>
        `).join("")}
      </div>
    `;
  });
}

function clearDropdown(id) {
  const dropdown = document.getElementById(id);
  dropdown.innerHTML = `<option value=''>-- เลือก --</option>`;
}

function clearResults() {
  document.getElementById("results").innerHTML = "";
}
