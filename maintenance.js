// maintenance.js

const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const RANGE = "Maintenance!A:H";
const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

let rawData = [];

// โหลดข้อมูลจาก Google Sheet
fetch(endpoint)
  .then(res => res.json())
  .then(data => {
    rawData = data.values.slice(1); // ตัด header ทิ้ง
    updateModelDropdown();
  })
  .catch(err => {
    console.error("Error loading data:", err);
  });

function updateModelDropdown() {
  const modelSet = new Set(rawData.map(row => row[1]));
  const modelDropdown = document.getElementById("model");
  modelDropdown.innerHTML = '<option value="">เลือก Model</option>';
  modelSet.forEach(model => {
    modelDropdown.innerHTML += `<option value="${model}">${model}</option>`;
  });

  modelDropdown.onchange = updateModelYearDropdown;
}

function updateModelYearDropdown() {
  const model = document.getElementById("model").value;
  const modelYearSet = new Set(
    rawData.filter(row => row[1] === model).map(row => row[2])
  );
  const modelYearDropdown = document.getElementById("modelYear");
  modelYearDropdown.innerHTML = '<option value="">เลือก Model Year</option>';
  modelYearSet.forEach(my => {
    modelYearDropdown.innerHTML += `<option value="${my}">${my}</option>`;
  });

  modelYearDropdown.onchange = updateSystemDropdown;
  document.getElementById("system").innerHTML = '<option value="">เลือก System</option>';
  document.getElementById("list").innerHTML = '<option value="">เลือก List</option>';
  document.getElementById("results").innerHTML = '';
}

function updateSystemDropdown() {
  const model = document.getElementById("model").value;
  const modelYear = document.getElementById("modelYear").value;
  const systemSet = new Set(
    rawData.filter(row => row[1] === model && row[2] === modelYear).map(row => row[3])
  );
  const systemDropdown = document.getElementById("system");
  systemDropdown.innerHTML = '<option value="">เลือก System</option>';
  systemSet.forEach(system => {
    systemDropdown.innerHTML += `<option value="${system}">${system}</option>`;
  });

  systemDropdown.onchange = updateListDropdown;
  document.getElementById("list").innerHTML = '<option value="">เลือก List</option>';
  document.getElementById("results").innerHTML = '';
}

function updateListDropdown() {
  const model = document.getElementById("model").value;
  const modelYear = document.getElementById("modelYear").value;
  const system = document.getElementById("system").value;
  const listSet = new Set(
    rawData.filter(row => row[1] === model && row[2] === modelYear && row[3] === system).map(row => row[4])
  );
  const listDropdown = document.getElementById("list");
  listDropdown.innerHTML = '<option value="">เลือก List</option>';
  listSet.forEach(list => {
    listDropdown.innerHTML += `<option value="${list}">${list}</option>`;
  });

  listDropdown.onchange = showFilteredResults;
  document.getElementById("results").innerHTML = '';
}

function showFilteredResults() {
  const model = document.getElementById("model").value;
  const modelYear = document.getElementById("modelYear").value;
  const system = document.getElementById("system").value;
  const list = document.getElementById("list").value;

  const filtered = rawData.filter(row =>
    row[1] === model &&
    row[2] === modelYear &&
    row[3] === system &&
    row[4] === list
  );

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = filtered.map(row => `
    <div style="margin-bottom: 16px; padding: 12px; background: #fff; border-radius: 8px; box-shadow: 0 0 6px rgba(0,0,0,0.1);">
      <p><strong>🚗 Model:</strong> ${row[1]}</p>
      <p><strong>📆 Year:</strong> ${row[2]}</p>
      <p><strong>🧩 System:</strong> ${row[3]}</p>
      <p><strong>📝 List:</strong> ${row[4]}</p>
      <p><strong>🛠️ Period:</strong> ${row[7]}</p>
    </div>
  `).join("");
}
