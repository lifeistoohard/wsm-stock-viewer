const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8"; 
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k"; 

const RANGE_LCV_AFTER  = "'TF_Model code'!A1:K"; 
const RANGE_LCV_BEFORE = "'TF_Model code_Before2020'!A1:K"; 
const RANGE_CV         = "'CV_Model code'!A1:J"; 

let currentFamily = "LCV"; 
let currentLCVRange = RANGE_LCV_AFTER; 

let dbLCV = { headers: [], data: [] };
let dbCV  = { headers: [], data: [] };

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
// UI Toggles สลับประเภทรถ (รูปภาพ, ข้อความ และช่อง)
// ----------------------------------------------------
document.querySelectorAll('input[name="vehicleFamily"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentFamily = e.target.value;
        document.getElementById("resultContainer").style.display = "none";
        document.getElementById("errorMsg").innerText = "";

        const headerImg = document.getElementById("headerImg");
        const titleText = document.getElementById("titleText");
        const lcvSection = document.getElementById("lcvSection");
        const cvSection = document.getElementById("cvSection");

        if (currentFamily === "LCV") {
            lcvSection.style.display = "block";
            cvSection.style.display = "none";
            titleText.innerText = "กรุณากรอกรหัส Model Name - LCV";
            headerImg.src = "ModelCode_header.png";
        } else {
            lcvSection.style.display = "none";
            cvSection.style.display = "block";
            titleText.innerText = "กรุณากรอกรหัส Model Name - CV";
            headerImg.src = "CVModelCode_header.png";
        }
        loadData(); 
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
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();
            if (input.value.length === parseInt(input.getAttribute('maxlength'))) {
                if (index < inputs.length - 1) inputs[index + 1].focus();
            }
        });
        
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
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            let pastedText = (e.clipboardData || window.clipboardData).getData('text').toUpperCase().trim();
            let currentPos = 0;
            for (let i = 0; i < inputs.length; i++) {
                if (currentPos >= pastedText.length) break;
                let maxLen = parseInt(inputs[i].getAttribute('maxlength'));
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
setupInputs('.cv-box', 10); // CV รวมตัวอักษร 10 ตัว

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

    const activeInputs = currentFamily === "LCV" ? document.querySelectorAll('.lcv-box') : document.querySelectorAll('.cv-box');
    
    // ความยาวตัวอักษรรวม: LCV = 11, CV = 10
    const requiredLength = currentFamily === "LCV" ? 11 : 10;
    
    let fullCode = "";
    let codeParts = [];
    let isValid = true;

    activeInputs.forEach(input => {
        let val = input.value.trim().toUpperCase();
        fullCode += val;
        codeParts.push(val);
        // เช็คว่ากรอกครบตาม MaxLength ของช่องนั้นๆ หรือไม่
        if (val.length !== parseInt(input.getAttribute('maxlength'))) {
            isValid = false;
        }
    });

    if (!isValid || fullCode.length !== requiredLength) {
        errorMsg.innerText = `❌ กรุณากรอกรหัสให้ครบทุกช่อง (LCV = 11 หลัก, CV = 10 หลัก)`;
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
        let decodedValue = dbLCV.data[colIndex] && dbLCV.data[colIndex][code] 
            ? dbLCV.data[colIndex][code] 
            : `<span style="color:#ef4444;">${code} (ไม่พบรหัสนี้)</span>`;
            
        appendResultBox(grid, headerText || `ตำแหน่ง ${i+1}`, decodedValue);
    }
}

// หัวข้อล็อคตายตัวสำหรับ CV
const cvCustomHeaders = [
    "1: ตระกูล", 
    "2: น้ำหนัก", 
    "3: ระบบขับเคลื่อน", 
    "4: เครื่องยนต์", 
    "4: เครื่องยนต์ (EURO 5)", 
    "5: ฐานล้อ", 
    "6: แรงม้า", 
    "7: รายละเอียดพิเศษ", 
    "8: เฟืองท้าย", 
    "9: รุ่นปี"
];

function decodeCV(codeParts, grid) {
    // หลักที่ 9 (รุ่นปี) อยู่ในกล่องที่ 9 (Index 8)
    const yearCode = codeParts[8]; 
    
    // ข้อมูลปีอยู่ในคอลัมน์ J (Index 9) ใน Sheet
    let yearDataStr = "";
    if (dbCV.data[9] && dbCV.data[9][yearCode]) {
        yearDataStr = dbCV.data[9][yearCode];
    }
    
    let yearMatch = yearDataStr.match(/\d{4}/);
    let yearNumber = yearMatch ? parseInt(yearMatch[0]) : 0; 
    
    // เงื่อนไข: ปี >= 2024 ใช้คอลัมน์ E (Index 4), ถ้าไม่ถึงใช้คอลัมน์ D (Index 3)
    const engineColIndex = (yearNumber >= 2024) ? 4 : 3;

    // วนลูปสร้างกล่องผลลัพธ์ทั้ง 9 ช่อง
    for (let i = 0; i < 9; i++) {
        let code = codeParts[i];
        let colIndex = i; 
        
        if (i === 3) {
            colIndex = engineColIndex; 
        } else if (i > 3) {
            colIndex = i + 1; // ข้ามคอลัมน์ E
        }

        let headerText = cvCustomHeaders[colIndex];
        let decodedValue = dbCV.data[colIndex] && dbCV.data[colIndex][code] 
            ? dbCV.data[colIndex][code] 
            : `<span style="color:#ef4444;">${code} (ไม่พบรหัสนี้)</span>`;
            
        appendResultBox(grid, headerText, decodedValue);
    }
}

function appendResultBox(grid, label, value) {
    let itemDiv = document.createElement("div");
    itemDiv.className = "result-item";
    itemDiv.innerHTML = `<span class="label">📍 ${label}</span><span class="value">${value}</span>`;
    grid.appendChild(itemDiv);
}

document.getElementById("searchBtn").addEventListener("click", decodeModelCode);

loadData();
