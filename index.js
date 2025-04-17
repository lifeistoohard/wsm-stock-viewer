const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const RANGE = "Stock!A2:H"; // แถว A-H: รวมข้อมูลทั้งหมด

let rawData = [];

async function loadData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  rawData = data.values;

  // ดึง unique model
  const models = [...new Set(rawData.map(row => row[4]).filter(Boolean))].sort();
  const modelDropdown = document.getElementById("modelSelect");
  modelDropdown.innerHTML = "<option value=''>-- เลือกรุ่นรถ --</option>";
  models.forEach(model => {
    modelDropdown.innerHTML += `<option value="${model}">${model}</option>`;
  });

  modelDropdown.onchange = () => {
    const selectedModel = modelDropdown.value;
    populateSystemDropdown(selectedModel);
    document.getElementById("results").innerHTML = ""; // clear old results
  };
}

function populateSystemDropdown(model) {
  const filtered = rawData.filter(row => row[4] === model);
  const systems = [...new Set(filtered.map(row => row[3]).filter(Boolean))].sort();
  const systemDropdown = document.getElementById("systemSelect");

  systemDropdown.innerHTML = "<option value=''>-- เลือก System --</option>";
  systems.forEach(sys => {
    systemDropdown.innerHTML += `<option value="${sys}">${sys}</option>`;
  });

  systemDropdown.onchange = () => {
    const selectedSystem = systemDropdown.value;
    showResults(model, selectedSystem);
  };
}

function showResults(model, system) {
  const resultsDiv = document.getElementById("results");
  const matched = rawData.filter(row => row[4] === model && row[3] === system);

  if (matched.length === 0) {
    resultsDiv.innerHTML = "<p style='color:red;'>❌ ไม่พบข้อมูลที่ตรงกัน</p>";
    return;
  }

  resultsDiv.innerHTML = "";
  matched.forEach(row => {
    const location = row[6] || "-";
    const cover = row[7] || "-";
    const isCD = row[2]?.startsWith("CD");
    const nameColor = isCD ? "darkblue" : "black";

    resultsDiv.innerHTML += `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ddd;">
        <p style="font-size: 22px; font-weight: bold; color: ${nameColor};">📖 ${row[2]}</p>
        <p><strong>📘 ระบบ:</strong> ${row[3]}</p>
        <p><strong>🏷️ รุ่น:</strong> ${row[4]}</p>
        <p><strong>📅 ปี:</strong> ${row[5]}</p>
        <p><strong>📍 Location:</strong> ${location}</p>
        <p><strong>🆔 Code หน้าปก:</strong> ${cover}</p>
        <p><strong>📦 รหัสสินค้า:</strong> ${row[0]}</p>
        <p><strong>📉 คงเหลือ:</strong> <span style="font-size: 24px; color: green;">${row[1]}</span> ชิ้น</p>
      </div>
    `;
  });
}

loadData();
