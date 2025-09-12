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
        document.getElementById("results").innerHTML = `<p style="color:red; text-align: center;">❌ ไม่สามารถโหลดข้อมูลได้ โปรดตรวจสอบ API Key หรือ Sheet ID</p>`;
    }
}

// เติมรายการสำหรับ autosuggest (จากคอลัมน์ภาษาอังกฤษและภาษาไทย)
function populateSuggestions() {
    const dl = document.getElementById("suggestions");
    
    // กรองข้อมูล: นำเฉพาะแถวที่คอลัมน์ 0 (อังกฤษ) และคอลัมน์ 1 (ไทย) มีข้อมูล
    const completeEntries = glossaryData.filter(r => r[0] && r[1]);
    
    // ดึงคำศัพท์ภาษาอังกฤษและภาษาไทย
    const englishKeys = completeEntries.map(r => r[0]);
    const thaiKeys = completeEntries.map(r => r[1]);

    // รวมคำศัพท์ทั้งหมดและลบคำที่ซ้ำกัน
    const allKeys = [...new Set([...englishKeys, ...thaiKeys])].sort();
    
    dl.innerHTML = ''; // เคลียร์รายการเก่า
    allKeys.forEach(k => {
        const o = document.createElement("option");
        o.value = k;
        dl.appendChild(o);
    });
}

// ฟังก์ชันคัดลอกข้อความ
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        console.error('ไม่สามารถคัดลอกข้อความได้:', err);
    });
}

// ฟังก์ชันแสดงแถบแจ้งเตือน (Toast Notification)
function showToast() {
    const toast = document.getElementById("notification-toast");
    toast.className = "show";
    setTimeout(function(){ 
        toast.className = toast.className.replace("show", ""); 
    }, 3000); // 3000 มิลลิวินาที (3 วินาที)
}

// เพิ่ม Event Listener ให้กับปุ่มคัดลอกทั้งหมด
function addCopyButtonListeners() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const textToCopy = event.currentTarget.dataset.translation;
            copyToClipboard(textToCopy);
        });
    });
}

// กด “ค้นหา” ด้วยคำ
document.getElementById("searchBtn").onclick = () => {
    const kw = document.getElementById("search").value.trim();
    if (!kw) {
        document.getElementById("results").innerHTML = `<p style="color:red; text-align: center;">❌ กรุณาพิมพ์คำที่ต้องการค้นหา</p>`;
        return;
    }

    const isThai = /[\u0E00-\u0E7F]/.test(kw);

    let filtered = [];
    if (isThai) {
        filtered = glossaryData.filter(r => 
            r[1] && r[1].includes(kw)
        );
    } else {
        const lowerCaseKw = kw.toLowerCase();
        filtered = glossaryData.filter(r => 
            r[0] && r[0].toLowerCase().includes(lowerCaseKw)
        );
    }

    displayResults(filtered, isThai);
};

// ฟังก์ชันแสดงผลลัพธ์
function displayResults(rows, isThaiSearch) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    if (!rows.length) {
        results.innerHTML = `<p style="color:red; text-align: center;">❌ ไม่พบคำว่า "${document.getElementById("search").value}"</p>`;
        return;
    }

    rows.forEach(r => {
        const english = r[0] || "N/A";
        const thai = r[1] || "-";
        
        let textToCopy;
        let translatedText;
        
        if (isThaiSearch) {
            textToCopy = english;
            translatedText = `<strong>คำแปล:</strong> ${english}`;
        } else {
            textToCopy = thai;
            translatedText = `<strong>คำแปล:</strong> ${thai}`;
        }

        const g = document.createElement("div");
        g.className = "result-group";
        
        g.innerHTML = `
            <h2>${isThaiSearch ? thai : english}</h2>
            <p>${translatedText}</p>
            <button class="copy-btn" data-translation="${textToCopy}">
                📄 คัดลอกคำแปล
            </button>
        `;
        results.appendChild(g);
    });
    
    addCopyButtonListeners();
}

// เริ่มโหลดข้อมูลเมื่อเข้าหน้าเว็บ
loadData();
