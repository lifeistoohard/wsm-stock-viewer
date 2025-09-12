// --- กำหนดข้อมูล Google Sheets API
const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8"; // <-- เปลี่ยนเป็น SHEET ID ของคุณ
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k"; // <-- เปลี่ยนเป็น API KEY ของคุณ
const GLOSSARY_RANGE = "Glossary!A2:B";

let glossaryData = []; // เก็บข้อมูลดิบจาก Google Sheets

// โหลดข้อมูลจาก Google Sheets
async function loadData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${GLOSSARY_RANGE}?key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const obj = await res.json();
        glossaryData = obj.values || [];

        populateSuggestions();
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("results").innerHTML = `<p style="color:red;">❌ ไม่สามารถโหลดข้อมูลได้ โปรดตรวจสอบ API Key หรือ Sheet ID</p>`;
    }
}


// เติมรายการสำหรับ autosuggest (จากคอลัมน์ภาษาอังกฤษ = index 0)
function populateSuggestions() {
    const dl = document.getElementById("suggestions");

    // กรองข้อมูล: นำเฉพาะแถวที่คอลัมน์ 0 (อังกฤษ) และคอลัมน์ 1 (ไทย) มีข้อมูล
    const keys = [...new Set(glossaryData.filter(r => r[0] && r[1]).map(r => r[0]))];
    
    dl.innerHTML = ''; // เคลียร์รายการเก่า
    keys.forEach(k => {
        const o = document.createElement("option");
        o.value = k;
        dl.appendChild(o);
    });
}

// กด “ค้นหา” ด้วยคำ
document.getElementById("searchBtn").onclick = () => {
    const kw = document.getElementById("search").value.trim();
    if (!kw) {
        document.getElementById("results").innerHTML = `<p style="color:red; text-align: center;">❌ กรุณาพิมพ์คำที่ต้องการค้นหา</p>`;
        return;
    }

    const lowerCaseKw = kw.toLowerCase();

    // ตรวจสอบว่าคำค้นหาเป็นภาษาไทยหรือไม่
    const isThai = /[\u0E00-\u0E7F]/.test(kw);

    let filtered = [];
    if (isThai) {
        // ถ้าเป็นภาษาไทย ให้หาคำแปลภาษาอังกฤษ
        filtered = glossaryData.filter(r => 
            r[1] && r[1].toLowerCase().includes(lowerCaseKw)
        );
    } else {
        // ถ้าเป็นภาษาอังกฤษ ให้หาคำแปลภาษาไทย
        filtered = glossaryData.filter(r => 
            r[0] && r[0].toLowerCase().includes(lowerCaseKw)
        );
    }

    displayResults(filtered, isThai); // ส่งค่า isThai ไปให้ฟังก์ชันแสดงผลด้วย
};


// ฟังก์ชันแสดงผลลัพธ์
function displayResults(rows, isThaiSearch) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    if (!rows.length) {
        results.innerHTML = `<p style="color:red; text-align: center;">❌ ไม่พบคำว่า "${document.getElementById("search").value}"</p>`;
        return;
    }

    // สร้างกล่องสำหรับแต่ละผลลัพธ์
    rows.forEach(r => {
        const english = r[0] || "N/A";
        const thai = r[1] || "-";

        const g = document.createElement("div");
        g.className = "result-group";
        
        // สลับการแสดงผลตามภาษาที่ใช้ค้นหา
        if (isThaiSearch) {
            g.innerHTML = `
                <h2>${thai}</h2>
                <p><strong>คำแปล:</strong> ${english}</p>
            `;
        } else {
            g.innerHTML = `
                <h2>${english}</h2>
                <p><strong>คำแปล:</strong> ${thai}</p>
            `;
        }

        results.appendChild(g);
    });
}
// เริ่มโหลดข้อมูลเมื่อเข้าหน้าเว็บ
loadData();
