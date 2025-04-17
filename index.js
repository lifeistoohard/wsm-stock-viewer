const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const RANGE = "Stock!A2:H";

let rawData = [];

async function loadData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  rawData = data.values;

  populateModelDropdown();
  const urlParams = new URLSearchParams(window.location.search);
  const idFromURL = urlParams.get("id");
  if (idFromURL) {
    document.getElementById("search").value = idFromURL;
    searchById(idFromURL);
  }
}

function populateModelDropdown() {
  const models = [...new Set(rawData.map(row => row[4]).filter(Boolean))].sort();
  const modelDropdown = document.getElementById("modelSelect");
  models.forEach(model => {
    modelDropdown.innerHTML += `<option value="${model}">${model}</option>`;
  });

  modelDropdown.onchange = () => {
    populateSystemDropdown(modelDropdown.value);
  };
}

function populateSystemDropdown(selectedModel) {
  const filtered = rawData.filter(row => row[4] === selectedModel);
  const systems = [...new Set(filtered.map(row => row[3]).filter(Boolean))].sort();
  const systemDropdown = document.getElementById("systemSelect");
  systemDropdown.innerHTML = '<option value="">🔽 เลือกระบบ</option>';
  systems.forEach(system => {
    systemDropdown.innerHTML += `<option value="${system}">${system}</option>`;
  });
}

function manualSearch() {
  const input = document.getElementById("search").value.trim();
  if (input) {
    searchById(input);
  }
}

function searchById(id) {
  const match = rawData.find(row => row[0] === id);
  const infoDiv = document.getElementById("info");
  infoDiv.innerHTML = "";

  if (match) {
    const location = match[6] || "-";
    const cover = match[7] || "-";
    const isCD = match[2]?.startsWith("CD");
    const nameColor = isCD ? "darkblue" : "black";

    infoDiv.innerHTML = `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ddd;">
        <p style="font-size: 22px; font-weight: bold; color: ${nameColor};">📖 ${match[2]}</p>
        <p><strong>📘 ระบบ:</strong> ${match[3]}</p>
        <p><strong>🏷️ รุ่น:</strong> ${match[4]}</p>
        <p><strong>📅 ปี:</strong> ${match[5]}</p>
        <p><strong>📍 Location:</strong> ${location}</p>
        <p><strong>🆔 Code หน้าปก:</strong> ${cover}</p>
        <p><strong>📦 รหัสสินค้า:</strong> ${match[0]}</p>
        <p><strong>📉 คงเหลือ:</strong> <span style="font-size: 24px; color: green;">${match[1]}</span> ชิ้น</p>
      </div>
    `;
  } else {
    infoDiv.innerHTML = "<p style='color:red;'>❌ ไม่พบรหัสสินค้านี้</p>";
  }
}

function searchByDropdowns() {
  const model = document.getElementById("modelSelect").value;
  const system = document.getElementById("systemSelect").value;
  const infoDiv = document.getElementById("info");
  infoDiv.innerHTML = "";

  if (!model || !system) {
    infoDiv.innerHTML = "<p style='color:red;'>⛔ กรุณาเลือกรุ่นและระบบให้ครบ</p>";
    return;
  }

  const filtered = rawData.filter(row => row[4] === model && row[3] === system);

  if (filtered.length === 0) {
    infoDiv.innerHTML = "<p style='color:red;'>❌ ไม่พบข้อมูล</p>";
    return;
  }

  filtered.forEach(row => {
    const location = row[6] || "-";
    const cover = row[7] || "-";
    const isCD = row[2]?.startsWith("CD");
    const nameColor = isCD ? "darkblue" : "black";

    infoDiv.innerHTML += `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ddd;">
        <p style="font-size: 22px; font-weight: bold; color: ${nameColor};">📖 ${row[2]}</p>
        <p><strong>📘 ระบบ:</strong> ${row[3]}</p>
        <p><strong>🏷️ รุ่น:</strong> ${row[4]}</p>
        <p><strong>📅 ปี:</strong> ${row[5]}</p>
        <p><strong>📍 Location:</strong> ${location}</p>
        <p><strong>🆔 Code หน้าปก:</strong> ${cover}</p>
        <p><strong>📦 หมายเลข Mat.:</strong> ${row[0]}</p>
        <p><strong>📉 คงเหลือ:</strong> <span style="font-size: 24px; color: green;">${row[1]}</span> ชิ้น</p>
      </div>
    `;
  });
}

loadData();
