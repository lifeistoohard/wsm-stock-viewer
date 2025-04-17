const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const SHEET_NAME = "Maintenance";

let allRows = [];

async function loadSheet() {
  const range = `${SHEET_NAME}!A:H`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  allRows = data.values.slice(1); // remove header

  populateDropdowns();
}

function populateDropdowns() {
  const models = [...new Set(allRows.map(row => row[1]))];
  const years = [...new Set(allRows.map(row => row[2]))];
  const systems = [...new Set(allRows.map(row => row[3]))];
  const lists = [...new Set(allRows.map(row => row[4]))];

  populate("modelDropdown", models);
  populate("yearDropdown", years);
  populate("systemDropdown", systems);
  populate("listDropdown", lists);
}

function populate(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = "<option value=''>-- เลือก --</option>";
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  });
}

function filterByText() {
  const keyword = document.getElementById("searchBox").value.trim().toLowerCase();
  const matches = allRows.filter(row => row[4].toLowerCase().includes(keyword));
  displayResults(matches);
}

function displayResults(matches) {
  const output = document.getElementById("results");
  if (!matches.length) {
    output.innerHTML = "<p>❌ ไม่พบข้อมูลที่ค้นหา</p>";
    return;
  }

  output.innerHTML = matches.map(row => `
    <div style="margin-bottom: 16px;">
      <p><strong>Model:</strong> ${row[1]}</p>
      <p><strong>Model Year:</strong> ${row[2]}</p>
      <p><strong>System:</strong> ${row[3]}</p>
      <p><strong>List:</strong> ${row[4]}</p>
      <p><strong>Period:</strong> ${row[6]}</p>
    </div>
  `).join("");
}

loadSheet();

