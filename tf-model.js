// กำหนดข้อมูล Google Sheets API
const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8"; 
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k"; 

// 🔴 ดึงข้อมูลเผื่อไว้ถึงคอลัมน์ K (A1:K) เพื่อรองรับชีตก่อนปี 2020 
const RANGE_AFTER_2020  = "'TF_Model code'!A1:K"; 
const RANGE_BEFORE_2020 = "'TF_Model code_Before2020'!A1:K"; 

let modelDataMap = [];
let headers = [];
let currentRange = RANGE_AFTER_2020; 

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
            // เตรียม Array 11 ช่อง (Index 0-10) สำหรับคอลัมน์ A ถึง K
            modelDataMap = Array.from({ length: 11 }, () => ({}));

            for (let i = 1; i < rows.length; i++) {
                // วนลูป 11 คอลัมน์
                for (let col = 0; col < 11; col++) {
                    let cellValue = rows[i][col];
                    if (cellValue) {
                        let key = cellValue.split(':')[0].trim();
                        modelDataMap[col][key] = cellValue; 
                    }
                }
            }
            errorMsg.innerText = ""; 
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        errorMsg.innerText = "❌ ไม่สามารถโหลดข้อมูลได้ (โปรดเช็คชื่อ Sheet)";
    }
}

// จัดการเปลี่ยนปี 
const radioButtons = document.querySelectorAll('input[name="yearGroup"]');
radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'before2020') {
            currentRange = RANGE_BEFORE_2020;
        } else {
            currentRange = RANGE_AFTER_2020;
        }
        document.getElementById("resultContainer").style.display = "none";
        loadData();
    });
});

// ระบบพิมพ์ เลื่อนช่อง และ Copy/Paste
const inputs = document.querySelectorAll('.code-box');

inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        input.value = input.value.toUpperCase();
        if (input.value.length === input.maxLength) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            if (input.value === '') {
                if (index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = ''; 
                    e.preventDefault(); 
                }
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
            let maxLen = inputs[i].maxLength;
            let textForBox = pastedText.substring(currentPos, currentPos + maxLen);
            inputs[i].value = textForBox;
            inputs[i].focus();
            currentPos += maxLen;
        }

        if (currentPos === 11) {
            setTimeout(decodeModelCode, 100);
        }
    });
});

// ฟังก์ชันประมวลผลถอดรหัส
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
        errorMsg.innerText = "❌ กรุณากรอกรหัส Model ให้ครบทุกช่อง (รวม 11 ตัวอักษร)";
        return;
    }

    document.getElementById("displayCode").innerText = fullCode;

    // รหัสปี คอลัมน์สุดท้าย
    const yearCode = codeParts[9]; 
    // ตัวอักษรปีช่วง 2003 - 2011
    const codes2003to2011 = ['A','B','C','D','E','F','G','H','I','K','L','M','N'];

    // วนสร้างผลลัพธ์ 10 ตำแหน่ง
    for (let i = 0; i < 10; i++) {
        let code = codeParts[i];
        
        // ค่าตั้งต้น: ให้อ่านจากคอลัมน์เดียวกับ Index ของช่องนั้น
        let colIndex = i; 
        let headerText = headers[i];

        // 🟢 เงื่อนไขพิเศษสำหรับ "ก่อนรุ่นปี 2020"
        if (currentRange === RANGE_BEFORE_2020) {
            if (i === 8) { 
                // หลักที่ 9 (เกรด) ต้องดูจากรหัสปี
                if (codes2003to2011.includes(yearCode)) {
                    colIndex = 8; // ใช้คอลัมน์ I
                    headerText = headers[8] || "เกรด (2003-2011)";
                } else {
                    colIndex = 9; // ใช้คอลัมน์ J
                    headerText = headers[9] || "เกรด (2012+)";
                }
            } else if (i === 9) {
                // หลักที่ 10 (รุ่นปี) ขยับไปใช้คอลัมน์ K
                colIndex = 10; 
                headerText = headers[10] || "รุ่นปี";
            }
        }

        // ดึงข้อความจาก Data Map
        let decodedValue = modelDataMap[colIndex][code] || `<span style="color:#ef4444;">${code} (ไม่พบรหัสนี้)</span>`;
        
        let itemDiv = document.createElement("div");
        itemDiv.className = "result-item";
        itemDiv.innerHTML = `
            <span class="label">📍 ${headerText || `ตำแหน่งที่ ${i+1}`}</span>
            <span class="value">${decodedValue}</span>
        `;
        resultGrid.appendChild(itemDiv);
    }

    resultContainer.style.display = "block";
}

document.getElementById("searchBtn").addEventListener("click", decodeModelCode);

// โหลดข้อมูลครั้งแรก
loadData();
