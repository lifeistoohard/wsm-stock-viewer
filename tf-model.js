const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8"; 
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k"; 

const RANGE_LCV_AFTER  = "'TF_Model code'!A1:K"; 
const RANGE_LCV_BEFORE = "'TF_Model code_Before2020'!A1:K"; 
const RANGE_CV         = "'CV_Model code'!A1:J"; 
const RANGE_ENGINE_SPECS = "'Engine_Specs'!A1:C"; // 🟢 เพิ่ม Sheet ใหม่

let currentFamily = "LCV"; 
let currentLCVRange = RANGE_LCV_AFTER; 

let dbLCV = { headers: [], data: [] };
let dbCV  = { headers: [], data: [] };
let dbEngineSpecs = {}; // 🟢 เก็บข้อมูลสเปคเครื่องยนต์

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
        // 1. โหลดข้อมูลรหัสหลัก
        if (currentFamily === "LCV") {
            await fetchSheet(currentLCVRange, dbLCV, 11);
        } else {
            await fetchSheet(RANGE_CV, dbCV, 10);
        }

        // 2. 🟢 โหลดข้อมูล Engine Specs (โหลดแค่ครั้งเดียวพร้อมกันไปเลย)
        const specUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_ENGINE_SPECS}?key=${API_KEY}`;
        const specRes = await fetch(specUrl);
        const specObj = await specRes.json();
        
        dbEngineSpecs = {}; // ล้างข้อมูลเก่า
        if (specObj.values && specObj.values.length > 1) {
            // เริ่มลูปที่ i=1 เพื่อข้ามหัวข้อ (Row 1)
            for (let i = 1; i < specObj.values.length; i++) {
                let row = specObj.values[i];
                if (row[0]) {
                    // ใช้ชื่อเต็มๆ ในคอลัมน์ A เป็น Key
                    dbEngineSpecs[row[0].trim()] = {
                        emission: row[1] || "-",
                        oil: row[2] || "-"
                    };
                }
            }
        }

        errorMsg.innerText = ""; 
    } catch (error) {
        console.error("Error:", error);
        errorMsg.innerText = "❌ โหลดข้อมูลไม่สำเร็จ โปรดเช็คชื่อ Sheet หรือ API";
    }
}

// ----------------------------------------------------
// UI Toggles สลับประเภทรถ
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
setupInputs('.lcv-box', 11);
setupInputs('.cv-box', 10); 

// ----------------------------------------------------
// ฟังก์ชันประมวลผล 
// ----------------------------------------------------
function decodeModelCode() {
    const errorMsg = document.getElementById("errorMsg");
    const resultContainer = document.getElementById("resultContainer");
    const resultGrid = document.getElementById("resultGrid");
    
    errorMsg.innerText = "";
    resultGrid.innerHTML = "";
    resultContainer.style.display = "none";

    const activeInputs = currentFamily === "LCV" ? document.querySelectorAll('.lcv-box') : document.querySelectorAll('.cv-box');
    const requiredLength = currentFamily === "LCV" ? 11 : 10;
    
    let fullCode = "";
    let codeParts = [];
    let isValid = true;

    activeInputs.forEach(input => {
        let val = input.value.trim().toUpperCase();
        fullCode += val;
        codeParts.push(val);
        if (val.length !== parseInt(input.getAttribute('maxlength'))) isValid = false;
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

const cvCustomHeaders = [
    "1: ตระกูล", "2: น้ำหนัก", "3: ระบบขับเคลื่อน", "4: เครื่องยนต์", 
    "4: เครื่องยนต์ (EURO 5)", "5: ฐานล้อ", "6: แรงม้า", 
    "7: รายละเอียดพิเศษ", "8: เฟืองท้าย", "9: รุ่นปี"
];

function decodeCV(codeParts, grid) {
    const yearCode = codeParts[8]; 
    let yearDataStr = (dbCV.data[9] && dbCV.data[9][yearCode]) ? dbCV.data[9][yearCode] : "";
    let yearMatch = yearDataStr.match(/\d{4}/);
    let yearNumber = yearMatch ? parseInt(yearMatch[0]) : 0; 
    
    const engineColIndex = (yearNumber >= 2024) ? 4 : 3;

    for (let i = 0; i < 9; i++) {
        let code = codeParts[i];
        let colIndex = i; 
        
        if (i === 3) {
            colIndex = engineColIndex; 
        } else if (i > 3) {
            colIndex = i + 1; 
        }

        let headerText = cvCustomHeaders[colIndex];
        let decodedValue = dbCV.data[colIndex] && dbCV.data[colIndex][code] 
            ? dbCV.data[colIndex][code] 
            : `<span style="color:#ef4444;">${code} (ไม่พบรหัสนี้)</span>`;
            
        appendResultBox(grid, headerText, decodedValue);
    }
}

// 🟢 ฟังก์ชันสร้างกล่องและเช็คการคลิก
function appendResultBox(grid, label, value) {
    let itemDiv = document.createElement("div");
    itemDiv.className = "result-item";
    
    // ตรวจสอบว่าหัวข้อมีคำว่า "เครื่องยนต์" หรือไม่ (เพื่อเปิดให้คลิกได้)
    if (label.includes("เครื่องยนต์") && !value.includes("ไม่พบรหัสนี้")) {
        itemDiv.classList.add("clickable-box");
        itemDiv.innerHTML = `<span class="label">📍 ${label} <span class="info-badge">👆 คลิกดูข้อมูล</span></span><span class="value">${value}</span>`;
        itemDiv.onclick = () => openModal(value);
    } else {
        itemDiv.innerHTML = `<span class="label">📍 ${label}</span><span class="value">${value}</span>`;
    }
    
    grid.appendChild(itemDiv);
}

// ----------------------------------------------------
// 🟢 ระบบจัดการ Popup Modal
// ----------------------------------------------------
function openModal(engineFullName) {
    const overlay = document.getElementById("infoModal");
    const mTitle = document.getElementById("modalTitle");
    const mBody = document.getElementById("modalBody");
    
    mTitle.innerText = engineFullName;
    
    // ค้นหาข้อมูลใน dbEngineSpecs โดยใช้ชื่อเต็มเป็นคีย์
    const spec = dbEngineSpecs[engineFullName.trim()];
    
    if (spec) {
        // เปลี่ยนการขึ้นบรรทัดใหม่จาก Google Sheet (\n) ให้เป็น <br> ใน HTML
        const oilText = spec.oil.replace(/\n/g, "<br>");
        mBody.innerHTML = `
            <p><strong>💨 มาตรฐานไอเสีย:</strong> ${spec.emission}</p>
            <hr style="border:0; border-top:1px dashed #ccc; margin:12px 0;">
            <p><strong>🛢️ น้ำมันที่แนะนำ:</strong><br><br>${oilText}</p>
        `;
    } else {
        mBody.innerHTML = `<p style="color:#ef4444; text-align:center;">❌ ยังไม่มีข้อมูลแนะนำน้ำมันหล่อลื่นสำหรับเครื่องยนต์รุ่นนี้ในระบบ</p>`;
    }
    
    overlay.style.display = "flex";
    // ใช้ setTimeout เพื่อให้ transition CSS ทำงานได้สมูท
    setTimeout(() => overlay.classList.add("show"), 10);
}

function closeModal() {
    const overlay = document.getElementById("infoModal");
    overlay.classList.remove("show");
    setTimeout(() => overlay.style.display = "none", 300);
}

// ปิด Modal เมื่อคลิกพื้นที่ว่างด้านนอก
document.getElementById("infoModal").addEventListener("click", (e) => {
    if (e.target.id === "infoModal") closeModal();
});

document.getElementById("searchBtn").addEventListener("click", decodeModelCode);

loadData();
