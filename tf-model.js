// กำหนดข้อมูล Google Sheets API (จากระบบเดิมของคุณ)
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
            headers = rows[0]; // แถวแรกคือชื่อหัวข้อ
            
            // สร้าง Array เตรียมเก็บข้อมูลแต่ละคอลัมน์ 10 ตำแหน่ง
            modelDataMap = Array.from({ length: 10 }, () => ({}));

            // วนลูปอ่านข้อมูลตั้งแต่แถวที่ 2 เป็นต้นไป
            for (let i = 1; i < rows.length; i++) {
                for (let col = 0; col < 10; col++) {
                    let cellValue = rows[i][col];
                    if (cellValue) {
                        // แยกเอาเฉพาะตัวอักษรหน้าเครื่องหมาย ":" มาเป็น Key
                        let key = cellValue.split(':')[0].trim();
                        // เก็บค่าทั้งก้อนไว้แสดงผล
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

// ฟังก์ชันถอดรหัส
function decodeModelCode() {
    const input = document.getElementById("searchInput").value.trim().toUpperCase();
    const errorMsg = document.getElementById("errorMsg");
    const resultContainer = document.getElementById("resultContainer");
    const resultGrid = document.getElementById("resultGrid");
    
    errorMsg.innerText = "";
    resultGrid.innerHTML = "";
    resultContainer.style.display = "none";

    if (input.length !== 11) {
        errorMsg.innerText = "❌ กรุณากรอกรหัส Model ให้ครบ 11 ตัวอักษร (เช่น TFS46JCNHMT)";
        return;
    }

    // หั่น string ตามตำแหน่ง (11 ตัวอักษร แบ่งเป็น 10 หมวด)
    const codeParts = [
        input.substring(0, 1),   // 0: ปิกอัพ (T)
        input.substring(1, 2),   // 1: น้ำหนัก (F)
        input.substring(2, 3),   // 2: ระบบขับเคลื่อน (S)
        input.substring(3, 5),   // 3: เครื่องยนต์ (46) -> ใช้ 2 ตัวอักษร
        input.substring(5, 6),   // 4: ฐานล้อ (J)
        input.substring(6, 7),   // 5: ประเภทห้องโดยสาร (C)
        input.substring(7, 8),   // 6: ระบบเกียร์ (N)
        input.substring(8, 9),   // 7: ช่วงล่าง (H)
        input.substring(9, 10),  // 8: เกรด (M)
        input.substring(10, 11)  // 9: รุ่นปี (T)
    ];

    document.getElementById("displayCode").innerText = "ถอดรหัส: " + input;

    // สร้างกล่องแสดงผลทีละหมวด
    for (let i = 0; i < 10; i++) {
        let code = codeParts[i];
        let decodedValue = modelDataMap[i][code] || `${code} (ไม่พบข้อมูลอ้างอิง)`;
        
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

// ผูกปุ่มและ Enter กับฟังก์ชันค้นหา
document.getElementById("searchBtn").addEventListener("click", decodeModelCode);
document.getElementById("searchInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") decodeModelCode();
});

// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
loadData();
