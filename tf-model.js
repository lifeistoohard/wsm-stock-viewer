// กำหนดข้อมูล Google Sheets API
const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8"; 
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k"; 

// 🔴 เปลี่ยนชื่อ Sheet ตรงนี้ให้ตรงกับที่คุณสร้างไว้ใน Google Sheets 
const RANGE_AFTER_2020  = "'TF_Model code'!A1:J"; 
const RANGE_BEFORE_2020 = "'TF_Model code_Before2020'!A1:J"; // <--- สมมติว่าสร้างอีก Sheet ชื่อนี้

let modelDataMap = [];
let headers = [];
let currentRange = RANGE_AFTER_2020; // ค่าเริ่มต้น

// ฟังก์ชันโหลดข้อมูลจาก Google Sheets
async function loadData() {
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = "กำลังโหลดข้อมูล...";
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${currentRange}?key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const obj = await res.json();
        
        if (obj.error) {
            throw new Error(obj.error.message);
        }

        const rows = obj.values || [];
        if (rows.length > 0) {
            headers = rows[0]; 
            modelDataMap = Array.from({ length: 10 }, () => ({}));

            for (let i = 1; i < rows.length; i++) {
                for (let col = 0; col < 10; col++) {
                    let cellValue = rows[i][col];
                    if (cellValue) {
                        let key = cellValue.split(':')[0].trim();
                        modelDataMap[col][key] = cellValue; 
                    }
                }
            }
            errorMsg.innerText = ""; // โหลดสำเร็จ เคลียร์ข้อความ
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        errorMsg.innerText = "❌ ไม่สามารถโหลดข้อมูลได้ (โปรดเช็คชื่อ Sheet)";
    }
}

// ----------------------------------------------------
// จัดการเปลี่ยนปี (ดึงข้อมูลใหม่เมื่อกดเปลี่ยน Tab)
// ----------------------------------------------------
const radioButtons = document.querySelectorAll('input[name="yearGroup"]');
radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'before2020') {
            currentRange = RANGE_BEFORE_2020;
        } else {
            currentRange = RANGE_AFTER_2020;
        }
        // รีเซ็ตผลลัพธ์และโหลดข้อมูลชุดใหม่
        document.getElementById("resultContainer").style.display = "none";
        loadData();
    });
});

// ----------------------------------------------------
// ระบบพิมพ์แล้วเลื่อนช่องอัตโนมัติ (เสถียรขึ้น)
// ----------------------------------------------------
const inputs = document.querySelectorAll('.code-box');

inputs.forEach((input, index) => {
    // ใช้ input event สำหรับการเดินหน้า
    input.addEventListener('input', () => {
        input.value = input.value.toUpperCase();
        
        if (input.value.length === input.maxLength) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    // ใช้ keydown เพื่อดักจับ Backspace ก่อนที่ค่าจะถูกเปลี่ยน
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            // ถ้าช่องปัจจุบันว่างเปล่า แล้วกดลบ ให้ถอยไปช่องก่อนหน้าและเคลียร์ค่าช่องนั้น
            if (input.value === '') {
                if (index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = ''; // เคลียร์ค่าให้เลยเพื่อความสมูท
                    e.preventDefault(); // ป้องกันพฤติกรรมลบซ้ำซ้อนของเบราว์เซอร์
                }
            }
        } else if (e.key === 'Enter') {
            decodeModelCode();
        }
    });
});

// ----------------------------------------------------
// ฟังก์ชันประมวลผลถอดรหัส
// ----------------------------------------------------
function decodeModelCode() {
    const errorMsg = document.getElementById("errorMsg");
    const resultContainer = document.getElementById("resultContainer");
    const resultGrid = document.getElementById("resultGrid");
    
    errorMsg.innerText = "";
    resultGrid.innerHTML = "";
    resultContainer.style.display = "none";

    let fullCode = "";
    let codeParts = [];
    let isValid = true;

    inputs.forEach(input => {
        let val = input.value.trim().toUpperCase();
        fullCode += val;
        codeParts.push(val);
        
        if (val.length !== input.maxLength) {
            isValid = false;
        }
    });

    if (!isValid || fullCode.length !== 11) {
        errorMsg.innerText = "❌ กรุณากรอกรหัส Model ให้ครบทุกช่อง";
        return;
    }

    document.getElementById("displayCode").innerText = fullCode;

    for (let i = 0; i < 10; i++) {
        let code = codeParts[i];
        let decodedValue = modelDataMap[i][code] || `<span style="color:#ef4444;">${code} (ไม่พบรหัสนี้)</span>`;
        
        let itemDiv = document.createElement("div");
        itemDiv.className = "result-item";
        itemDiv.innerHTML = `
            <span class="label">📍 ${headers[i] || `ตำแหน่งที่ ${i+1}`}</span>
            <span class="value">${decodedValue}</span>
        `;
        resultGrid.appendChild(itemDiv);
    }

    resultContainer.style.display = "block";
}

document.getElementById("searchBtn").addEventListener("click", decodeModelCode);

// โหลดข้อมูลครั้งแรกเมื่อเปิดหน้า
loadData();
