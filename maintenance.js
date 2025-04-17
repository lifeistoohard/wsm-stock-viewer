// maintenance.js

// กำหนดค่า Spreadsheet ID และ API Key ของคุณ
const SHEET_ID = 'YOUR_SPREADSHEET_ID';
const API_KEY = 'YOUR_API_KEY';
const SHEET_NAME = 'Maintenance';

// ตัวแปรสำหรับเก็บข้อมูลทั้งหมด
let allData = [];

// ฟังก์ชันสำหรับดึงข้อมูลจาก Google Sheets
async function fetchData() {
  const range = `${SHEET_NAME}!A:H`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.values && data.values.length > 1) {
      // ลบแถวหัวตาราง
      allData = data.values.slice(1);
      populateDropdowns();
    } else {
      console.error('ไม่พบข้อมูลในชีต');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
  }
}

// ฟังก์ชันสำหรับเติมข้อมูลลงใน dropdowns
function populateDropdowns() {
  const models = [...new Set(allData.map(row => row[1]))];
  const years = [...new Set(allData.map(row => row[2]))];
  const systems = [...new Set(allData.map(row => row[3]))];
  const lists = [...new Set(allData.map(row => row[4]))];

  populateSelect('model', models);
  populateSelect('modelYear', years);
  populateSelect('system', systems);
  populateSelect('list', lists);
}

// ฟังก์ชันสำหรับเติมตัวเลือกลงใน select element
function populateSelect(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">-- เลือก --</option>';
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// ฟังก์ชันสำหรับแสดงผลลัพธ์
function displayResults(results) {
  const output = document.getElementById('results');
  if (results.length === 0) {
    output.innerHTML = '<p>❌ ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>';
    return;
  }

  output.innerHTML = results.map(row => `
    <div style="margin-bottom: 16px;">
      <p><strong>Model:</strong> ${row[1]}</p>
      <p><strong>Model Year:</strong> ${row[2]}</p>
      <p><strong>System:</strong> ${row[3]}</p>
      <p><strong>List:</strong> ${row[4]}</p>
      <p><strong>Period:</strong> ${row[6]}</p>
    </div>
  `).join('');
}

// ฟังก์ชันสำหรับกรองข้อมูลตามเงื่อนไขที่เลือก
function filterData() {
  const model = document.getElementById('model').value;
  const year = document.getElementById('modelYear').value;
  const system = document.getElementById('system').value;
  const list = document.getElementById('list').value;

  const filtered = allData.filter(row => {
    return (!model || row[1] === model) &&
           (!year || row[2] === year) &&
           (!system || row[3] === system) &&
           (!list || row[4] === list);
  });

  displayResults(filtered);
}

// ฟังก์ชันสำหรับค้นหาด้วยการพิมพ์
function searchByText() {
  const keyword = document.getElementById('search').value.trim().toLowerCase();
  if (!keyword) {
    displayResults([]);
    return;
  }

  const filtered = allData.filter(row => row[4].toLowerCase().includes(keyword));
  displayResults(filtered);
}

// เพิ่ม event listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchData();

  document.getElementById('model').addEventListener('change', filterData);
  document.getElementById('modelYear').addEventListener('change', filterData);
  document.getElementById('system').addEventListener('change', filterData);
  document.getElementById('list').addEventListener('change', filterData);
  document.getElementById('search').addEventListener('input', searchByText);
});
