const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8"; 
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k"; 

// กำหนดชื่อ Sheet ให้ตรงกัน
const RANGE_LCV_AFTER  = "'TF_Model code'!A1:K"; 
const RANGE_LCV_BEFORE = "'TF_Model code_Before2020'!A1:K"; 
const RANGE_CV         = "'CV_Model code'!A1:J"; // CV มี A ถึง I/J 

let currentFamily = "LCV"; // 'LCV' หรือ 'CV'
let currentLCVRange = RANGE_LCV_AFTER; 

let dbLCV = { headers: [], data: [] };
let dbCV  = { headers: [], data: [] };

// ฟังก์ชันโหลดข้อมูลหลัก
async function fetchSheet(range, targetDB, colCount) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const res = await fetch(url);
    const obj = await res.json();
    if (obj.error) throw new Error(obj.error.message);

    const rows = obj.values || [];
    if (rows.length > 0) {
        targetDB.headers = rows[0]; 
        targetDB.data = Array.from({ length: colCount }, () => ({}));

        for (let i = 1; i < rows.length; i++) {
            for (let col = 0; col < colCount; col++) {
                let cellValue = rows[i][col];
                if (cellValue) {
                    let key = cellValue.split(':')[0].trim();
                    targetDB.data[col][key] = cellValue; 
                }
            }
        }
    }
}

async function loadData() {
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = "กำลังโหลดข้อมูล...";
    document.getElementById("resultContainer").style.display = "none";
    try {
        if (currentFamily === "LCV") {
            await fetchSheet(currentLCVRange, dbLCV, 11);
        } else {
            await fetchSheet(RANGE_CV, dbCV, 10);
        }
        errorMsg.innerText = ""; 
    } catch (error) {
        console.error("Error:", error);
        errorMsg.innerText = "❌ โหลดข้อมูลไม่สำเร็จ โปรดเช็คชื่อ Sheet หรือ API";
    }
}

// ----------------------------------------------------
// UI Toggles สลับประเภทรถ และ ปี
// ----------------------------------------------------
document.querySelectorAll('input[name="vehicleFamily"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentFamily = e.target.value;
        document.getElementById("resultContainer").style.display = "none";
        document.getElementById("errorMsg").innerText = "";

        // สลับ UI
        if (currentFamily === "LCV") {
            document.getElementById("lcvSection").style.display = "block";
            document.getElementById("cvSection").style.display = "none";
            document.getElementById("titleText").innerText = "กรุณากรอกรหัส Model - LCV (11 หลัก)";
        } else {
            document.getElementById("lcvSection").style.display = "none";
            document.getElementById("cvSection").style.display = "block";
            document.getElementById("titleText").innerText = "กรุณากรอกรหัส Model - CV (9 หลัก)";
        }
        loadData(); // โหลดชีตของหมวดนั้นๆ
    });
});

document.querySelectorAll('input[name="yearGroupLCV"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentLCVRange = (e.target.value === 'before2020') ? RANGE_LCV_BEFORE : RANGE_LCV_AFTER;
        loadData();
    });
});

// ----------------------------------------------------
// ระบบ Input Auto-Advance & Paste
// ----------------------------------------------------
function setupInputs(selector, maxCharsTotal) {
    const inputs = document.querySelectorAll(selector);
    inputs.forEach((input, index) => {
        // 1. พิมพ์ปกติ เลื่อนอัตโนมัติ
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();
            if (input.value.length === input.maxLength) {
                if (index < inputs.length - 1) inputs[index + 1].focus();
            }
        });
        // 2. ลบถอยหลัง
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '') {
                if (index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = ''; 
                    e.preventDefault(); 
                }
            } else if (e.key === 'Enter') {
                decodeModelCode();
            }
        });
        // 3. ก๊อปปี้วาง
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            let pastedText = (e.clipboardData || window.clipboardData).getData('text').toUpperCase().trim();
            let currentPos = 0;
            for (let i = 0; i < inputs.length; i++) {
                if (currentPos >= pastedText.length) break;
                let maxLen = inputs[i].maxLength;
                inputs[i].value = pastedText.substring(currentPos, currentPos + maxLen);
                inputs[i].focus();
                currentPos += maxLen;
            }
            if (currentPos === maxCharsTotal) {
                setTimeout(decodeModelCode, 100);
            }
        });
    });
}
// ผูก Event ให้ทั้งสองกลุ่ม
setupInputs('.lcv-box', 11);
setupInputs('.cv-box', 9);

// ----------------------------------------------------
// ฟังก์ชันประมวลผล (แยก LCV และ CV)
// ----------------------------------------------------
function decodeModelCode() {
    const errorMsg = document.getElementById("errorMsg");
    const resultContainer = document.getElementById("resultContainer");
    const resultGrid = document.getElementById("resultGrid");
    
    errorMsg.innerText = "";
    resultGrid.innerHTML = "";
    resultContainer.style.display = "none";

    // ดึงค่า Input ของหมวดที่กำลังเปิดใช้งาน
    const activeInputs = currentFamily === "LCV" ? document.querySelectorAll('.lcv-box') : document.querySelectorAll('.cv-box');
    const requiredLength = currentFamily === "LCV" ? 11 : 9;
    
    let fullCode = "";
    let codeParts = [];
    let isValid = true;

    activeInputs.forEach(input => {
        let val = input.value.trim().toUpperCase();
        fullCode += val;
        codeParts.push(val);
        if (val.length !== input.maxLength) isValid = false;
    });

    if (!isValid || fullCode.length !== requiredLength) {
        errorMsg.innerText = `❌ กรุณากรอกรหัสให้ครบทุกช่อง (รวม ${requiredLength} ตัวอักษร)`;
        return;
    }

    document.getElementById("displayCode").innerText = fullCode;

    if (currentFamily === "LCV") {
        decodeLCV(codeParts, resultGrid);
    } else {
        decodeCV(codeParts, resultGrid);
    }

    resultContainer.style.display = "block";
}

// ---- ฟังก์ชันย่อยสำหรับ LCV ----
function decodeLCV(codeParts, grid) {
    const yearCode = codeParts[9]; 
    const codes2003to2011 = ['A','B','C','D','E','F','G','H','I','K','L','M','N'];

    for (let i = 0; i < 10; i++) {
        let code = codeParts[i];
        let colIndex = i; 
        let headerText = dbLCV.headers[i];

        if (currentLCVRange === RANGE_LCV_BEFORE) {
            if (i === 8) { 
                colIndex = codes2003to2011.includes(yearCode) ? 8 : 9; 
                headerText = dbLCV.headers[colIndex] || "เกรด";
            } else if (i === 9) {
                colIndex = 10; 
                headerText = dbLCV.headers[10] || "รุ่นปี";
            }
        }
        let decodedValue = dbLCV.data[colIndex][code] || `<span style="color:#ef4444;">${code} (ไม่พบรหัสนี้)</span>`;
        appendResultBox(grid, headerText || `ตำแหน่ง ${i+1}`, decodedValue);
    }
}

// ---- ฟังก์ชันย่อยสำหรับ CV ----
function decodeCV(codeParts, grid) {
    // 8 ตำแหน่งการกรอก (index 0 ถึง 7)
    // 0:char1, 1:char2, 2:char3, 3:char4-5, 4:char6, 5:char7, 6:char8, 7:char9
    
    // ดึงหลักที่ 9 (Year Code) จากกล่องที่ 8 (index 7)
    const yearCode = codeParts[7]; 
    
    // หากข้อมูลใน Sheet เป็นแบบ คอลัมน์ I (Index 8) คือปี
    let yearDataStr = dbCV.data[8][yearCode] || ""; 
    let yearMatch = yearDataStr.match(/\d{4}/);
    let yearNumber = yearMatch ? parseInt(yearMatch[0]) : 0; 
    
    // เงื่อนไข: ถ้าปี >= 2024 ใช้คอลัมน์ E (Index 4), ถ้าไม่ถึงใช้คอลัมน์ D (Index 3)
    const engineColIndex = (yearNumber >= 2024) ? 4 : 3;

    for (let i = 0; i < 8; i++) {
        let code = codeParts[i];
        let colIndex = i; 
        
        if (i === 3) {
            // กล่องที่ 4 (เครื่องยนต์) โยกไปใช้คอลัมน์ D(3) หรือ E(4)
            colIndex = engineColIndex; 
        } else if (i > 3) {
            // ตั้งแต่กล่องที่ 5 เป็นต้นไป (ตัวอักษรที่ 6-9) ต้องขยับบวก 1 คอลัมน์ (ข้ามคอลัมน์ E)
            // เช่น กล่องที่ 5(i=4) ไปอ่านคอลัมน์ F(5)
            // กล่องที่ 8(i=7) ไปอ่านคอลัมน์ I(8)
            colIndex = i + 1;
        }

        let headerText = dbCV.headers[colIndex];
        let decodedValue = dbCV.data[colIndex][code] || `<span style="color:#ef4444;">${code} (ไม่พบรหัสนี้)</span>`;
        appendResultBox(grid, headerText || `ตำแหน่ง ${i+1}`, decodedValue);
    }
}

// สร้างกล่องแสดงผล HTML
function appendResultBox(grid, label, value) {
    let itemDiv = document.createElement("div");
    itemDiv.className = "result-item";
    itemDiv.innerHTML = `<span class="label">📍 ${label}</span><span class="value">${value}</span>`;
    grid.appendChild(itemDiv);
}

document.getElementById("searchBtn").addEventListener("click", decodeModelCode);

// เริ่มทำงาน
loadData();
