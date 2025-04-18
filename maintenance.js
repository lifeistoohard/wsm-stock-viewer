// 🔁 V2.1: Group search results by Model + Model Year

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
        <p><strong style="color: darkblue; font-size: 18px;">📘 ${row[3]}</strong></p>
        <p>${row[5]}</p>
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

// 📌 New: Search by keyword and group by Model + Year
function searchKeyword() {
  const keyword = document.getElementById("keywordInput").value.trim().toLowerCase();
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!keyword) return;

  // Group by Model+Year
  const grouped = {};

  rawData.forEach(row => {
    const list = row[3]?.toLowerCase() || "";
    if (list.includes(keyword)) {
      const groupKey = `${row[0]} | ${row[1]}`;
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(row);
    }
  });

  const groupKeys = Object.keys(grouped);
  if (groupKeys.length === 0) {
    container.innerHTML = "<p style='color:red;'>❌ ไม่พบรายการที่ค้นหา</p>";
    return;
  }

  groupKeys.forEach(group => {
    const items = grouped[group];
    const groupDiv = document.createElement("div");
    groupDiv.style.marginBottom = "32px";
    groupDiv.style.padding = "16px";
    groupDiv.style.borderRadius = "12px";
    groupDiv.style.background = "#fff";
    groupDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";

    const title = document.createElement("h3");
    title.textContent = `🚗 ${group}`;
    title.style.marginBottom = "16px";
    groupDiv.appendChild(title);

    items.forEach(row => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <p class="card-title"><strong style="color: darkblue;">📘 ${row[3]}</strong></p>
        <p class="card-detail"><i>📅</i> ระยะ: ${row[5]}</p>
      `;
      groupDiv.appendChild(card);
    });

    container.appendChild(groupDiv);
  });
}
