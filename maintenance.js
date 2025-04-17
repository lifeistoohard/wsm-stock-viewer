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
  const modelList = Array.from(modelSet).sort();  // 🔹 เรียง A-Z ที่นี่
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
        <p><strong>📘  ${row[3]}</strong></p>
        <p><strong>${row[5]}</strong></p>
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
