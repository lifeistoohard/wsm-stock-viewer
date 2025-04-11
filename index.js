const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY = "YOUR_API_KEY";
const RANGE = "A:H";

let allRows = [];

async function loadData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  allRows = data.values;

  const dataOnly = allRows.slice(1);
  const systems = [...new Set(dataOnly.map(row => row[3]).filter(Boolean))];
  const models = [...new Set(dataOnly.map(row => row[4]).filter(Boolean))];

  systems.sort();
  models.sort();

  const systemSelect = document.getElementById("systemSelect");
  const modelSelect = document.getElementById("modelSelect");

  systems.forEach(system => {
    const option = document.createElement("option");
    option.value = system;
    option.textContent = system;
    systemSelect.appendChild(option);
  });

  models.forEach(model => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const idFromURL = urlParams.get("id");
  if (idFromURL) {
    document.getElementById("search").value = idFromURL;
    searchById(idFromURL);
  }
}

function searchById(id) {
  const match = allRows.find(row => row[0] === id);
  const infoDiv = document.getElementById("info");

  if (match) {
    const location = match[6] || "-";
    const cover = match[7] || "-";
    const isCD = match[2].startsWith("CD");
    const nameColor = isCD ? "darkblue" : "black";
    infoDiv.innerHTML = `
      <p style="font-size: 22px; font-weight: bold; color: ${nameColor};">📖 ${match[2]}</p>
      <p><strong>📘 ระบบ:</strong> ${match[3]}</p>
      <p><strong>🏷️ รุ่น:</strong> ${match[4]}</p>
      <p><strong>📅 ปี:</strong> ${match[5]}</p>
      <p><strong>📍 Location:</strong> ${location}</p>
      <p><strong>🆔 Code หน้าปก:</strong> ${cover}</p>
      <p><strong>📦 รหัสสินค้า:</strong> ${match[0]}</p>
      <p><strong>📉 คงเหลือ:</strong> <span style="font-size: 24px; color: green;">${match[1]}</span> ชิ้น</p>
    `;
  } else {
    infoDiv.innerHTML = "<p style='color:red;'>❌ ไม่พบรหัสสินค้านี้</p>";
  }
}

function manualSearch() {
  const input = document.getElementById("search").value.trim();
  if (input) {
    searchById(input);
  }
}

function searchByDropdowns() {
  const system = document.getElementById("systemSelect").value;
  const model = document.getElementById("modelSelect").value;
  const infoDiv = document.getElementById("info");
  infoDiv.innerHTML = "";

  if (!system || !model) {
    infoDiv.innerHTML = "<p style='color:red;'>⛔️ กรุณาเลือกระบบและรุ่น</p>";
    return;
  }

  const dataOnly = allRows.slice(1);
  const matches = dataOnly.filter(row => row[3] === system && row[4] === model);

  if (matches.length > 0) {
    matches.forEach(match => {
      const location = match[6] || "-";
      const cover = match[7] || "-";
      const isCD = match[2].startsWith("CD");
      const nameColor = isCD ? "darkblue" : "black";

      infoDiv.innerHTML += `
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ddd;">
          <p style="font-size: 22px; font-weight: bold; color: ${nameColor};">📖 ${match[2]}</p>
          <p><strong>📘 ระบบ:</strong> ${match[3]}</p>
          <p><strong>🏷️ รุ่นรถ:</strong> ${match[4]}</p>
          <p><strong>📅 รุ่นปี:</strong> ${match[5]}</p>
          <p><strong>📍 Location:</strong> ${location}</p>
          <p><strong>🆔 Code หน้าปก:</strong> ${cover}</p>
          <p><strong>📦 เลข Mat.No:</strong> ${match[0]}</p>
          <p><strong>📉 คงเหลือ:</strong> <span style="font-size: 24px; color: green;">${match[1]}</span> ชิ้น</p>
        </div>
      `;
    });
  } else {
    infoDiv.innerHTML = "<p style='color:red;'>❌ ไม่พบข้อมูลที่ตรงกัน</p>";
  }
}

loadData();
