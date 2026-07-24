// กำหนดข้อมูล Google Sheets API
const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8"; 
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k"; 
const RANGE    = "'TF_Model code'!A1:J"; 

let modelDataMap = [];
let headers = [];

// โหลดข้อมูลจาก Google Sheets
async function loadData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const obj = await res.json();
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
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("errorMsg").innerText = "❌ ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้";
    }
}

// ----------------------------------------------------
// ระบบพิมพ์แล้วเลื่อนช่องอัตโนมัติ (Auto-advance)
// ----------------------------------------------------
const inputs = document.querySelectorAll('.code-box');

inputs.forEach((input, index) => {
    // เมื่อมีการพิมพ์
    input.addEventListener('input', (e) => {
        // บังคับพิมพ์ใหญ่
        input.value = input.value.toUpperCase();
        
        // ถ้าพิมพ์ครบจำนวน maxlength ของช่องนั้น ให้เลื่อนไปช่องถัดไป
        if (input.value.length === input.maxLength) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    // เมื่อมีการกดปุ่มบนคีย์บอร์ด (จัดการ Backspace)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '') {
            // ถ้าช่องว่างอยู่แล้วกด Backspace ให้ถอยไปช่องก่อนหน้า
            if (index > 0) {
                inputs[index - 1].focus();
                // รอให้โฟกัสก่อนค่อยลบตัวอักษรของช่องก่อนหน้า
                setTimeout(() => {
                    inputs[index - 1].value = inputs[index - 1].value.slice(0, -1);
                }, 10);
            }
        } else if (e.key === 'Enter') {
            // กด Enter เพื่อถอดรหัส
            decodeModelCode();
        }
    });
});

// ฟังก์ชันถอดรหัส
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

    // กวาดข้อมูลจากทุกช่อง
    inputs.forEach(input => {
        let val = input.value.trim().toUpperCase();
        fullCode += val;
        codeParts.push(val);
        
        // ตรวจสอบว่ากรอกครบตาม MaxLength ของแต่ละช่องไหม
        if (val.length !== input.maxLength) {
            isValid = false;
        }
    });

    // ตรวจสอบความถูกต้อง
    if (!isValid || fullCode.length !== 11) {
        errorMsg.innerText = "❌ กรุณากรอกรหัส Model ให้ครบทุกช่องรวม 11 ตัวอักษร";
        return;
    }

    // แสดงรหัสเต็มๆ ด้านบน
    document.getElementById("displayCode").innerText = fullCode;

    // สร้างกล่องแสดงผลทีละหมวด (ดึงข้อมูลจาก Array codeParts ที่แยกตามช่องไว้แล้ว)
    for (let i = 0; i < 10; i++) {
        let code = codeParts[i];
        let decodedValue = modelDataMap[i][code] || `<span style="color:red;">${code} (ไม่พบรหัสนี้)</span>`;
        
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

// ผูกปุ่มกดเข้ากับฟังก์ชัน
document.getElementById("searchBtn").addEventListener("click", decodeModelCode);

// โหลดข้อมูล
loadData();
