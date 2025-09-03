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
    const keys = [...new Set(glossaryData.map(r => r[0]).filter(v => v))];
    dl.innerHTML = ''; // เคลียร์รายการเก่า
    keys.forEach(k => {
        const o = document.createElement("option");
        o.value = k;
        dl.appendChild(o);
    });
}

// กด “ค้นหา” ด้วยคำ
document.getElementById("searchBtn").onclick = () => {
    const kw = document.getElementById("search").value.trim().toLowerCase();
    if (!kw) {
        document.getElementById("results").innerHTML = `<p style="color:red;">❌ กรุณาพิมพ์คำที่ต้องการค้นหา</p>`;
        return;
    }

    // ค้นหาคำที่ตรงกับคำที่พิมพ์
    const filtered = glossaryData.filter(r =>
        r[0] && r[0].toLowerCase().includes(kw)
    );

    displayResults(filtered);
};

// ฟังก์ชันแสดงผลลัพธ์
function displayResults(rows) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    if (!rows.length) {
        results.innerHTML = `<p style="color:red;">❌ ไม่พบคำว่า "${document.getElementById("search").value}"</p>`;
        return;
    }

    // สร้างกล่องสำหรับแต่ละผลลัพธ์
    rows.forEach(r => {
        const english = r[0] || "N/A";
        const thai = r[1] || "-";

        const g = document.createElement("div");
        g.className = "group";
        g.innerHTML = `
            <p class="group-header"><strong>${english}</strong></p>
            <div class="item">
                <p class="item-title">📘 ${thai}</p>
            </div>
        `;
        results.appendChild(g);
    });
}

// เริ่มโหลดข้อมูลเมื่อเข้าหน้าเว็บ
loadData();
