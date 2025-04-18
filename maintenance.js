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
    container.innerHTML += `
      <div class="card">
        <div class="card-title">📘 ${row[3]}</div>
        <div class="card-detail">📅 ${row[5]}</div>
      </div>
    `;
  });
}

function clearDropdown(id) {
  document.getElementById(id).innerHTML = `<option value=''>-- เลือก --</option>`;
}

function clearResults() {
  document.getElementById("results").innerHTML = "";
}

// 🔍 Keyword Search (Suggestion)
function showSuggestions() {
  const input = document.getElementById("keywordInput").value.toLowerCase();
  const suggestionBox = document.getElementById("suggestions");
  suggestionBox.innerHTML = "";

  if (!input) return;

  const suggestions = [...new Set(rawData.map(row => row[3]).filter(name => name.toLowerCase().includes(input)))];

  suggestions.slice(0, 5).forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = item;
    div.onclick = () => {
      document.getElementById("keywordInput").value = item;
      suggestionBox.innerHTML = "";
      searchByKeyword();
    };
    suggestionBox.appendChild(div);
  });
}

function searchByKeyword() {
  const input = document.getElementById("keywordInput").value.toLowerCase();
  const resultsDiv = document.getElementById("keywordResults");
  const matched = rawData.filter(row => row[3].toLowerCase().includes(input));
  resultsDiv.innerHTML = "";

  if (matched.length === 0) {
    resultsDiv.innerHTML = "<p style='color:red;'>❌ ไม่พบรายการที่เกี่ยวข้อง</p>";
    return;
  }

  matched.forEach(row => {
    resultsDiv.innerHTML += `
      <div class="card">
        <div class="card-title">📘 ${row[3]}</div>
        <div class="card-detail">🚗 Model: ${row[0]} | 📅 รุ่นปี: ${row[1]}</div>
        <div class="card-detail">📅 ระยะ: ${row[5]}</div>
      </div>
    `;
  });
}
