// --- กำหนดข้อมูล Google Sheets API
const SHEET_ID = "19pJJpiDKatYgUmO_43SUyECxqTYaqfhwcQwYiuxn-d8";
const API_KEY  = "AIzaSyAki5uoqv3JpG7sqZ7crpaALomcUxlD72k";
const RANGE    = "Bulletin!A2:D"; // <-- เปลี่ยน Range ให้ชี้ไปที่ชีต "Bulletin"

let bulletins = [];

// โหลดข้อมูลจาก Google Sheets
async function loadData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const obj = await res.json();
        
        // แปลงข้อมูลจาก Google Sheets ให้เป็นรูปแบบที่โค้ดเข้าใจ
        const rawData = obj.values || [];
        bulletins = rawData.map(row => ({
            title: row[0] || '',
            year: parseInt(row[1], 10) || 0,
            file: row[2] || '',
            tags: (row[3] || '').split(',').map(tag => tag.trim()).filter(tag => tag)
        }));

        renderList(bulletins);
        setupSearch();
        hideBackButton();

    } catch (error) {
        console.error("Error fetching data:", error);
        const container = document.getElementById("bulletinContainer");
        container.innerHTML = `<p style='color:red;'>❌ ไม่สามารถโหลดข้อมูลได้ โปรดตรวจสอบ API Key หรือ Sheet ID</p>`;
    }
}

// โค้ดส่วนที่เหลือ (renderList, setupSearch, hideBackButton, etc.)
// สามารถใช้โค้ดเดิมที่คุณมีอยู่ได้เลยครับ
// เพราะการทำงานของฟังก์ชันเหล่านี้ไม่ได้เปลี่ยนไป
// แค่เปลี่ยนแหล่งที่มาของข้อมูลเท่านั้น
// ...

function renderList(data) {
    const container = document.getElementById("bulletinContainer");
    container.innerHTML = "";

    if (!data.length) {
        container.innerHTML = "<p style='color:red;'>❌ ไม่พบรายการ</p>";
        return;
    }

    const years = [...new Set(data.map(b => b.year))].sort((a, b) => b - a);
    const latestYear = Math.max(...years);

    years.sort((a, b) => b - a);

    years.forEach(year => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "year-group";

        const h2 = document.createElement("h2");
        h2.className = "year-header";
        h2.innerHTML = `${year === latestYear ? "▼" : "▶"} ${year}`;
        h2.style.cursor = "pointer";

        const itemsWrapper = document.createElement("div");
        itemsWrapper.className = "bulletin-items";
        itemsWrapper.style.display = year === latestYear ? "block" : "none";

        h2.addEventListener("click", () => {
            const shown = itemsWrapper.style.display === "block";
            itemsWrapper.style.display = shown ? "none" : "block";
            h2.innerHTML = `${shown ? "▶" : "▼"} ${year}`;
        });

        const getNum = title => {
            const m = title.match(/TSE-SVB-\d{4}-(\d{2})/);
            return m ? parseInt(m[1], 10) : 0;
        };

        data
            .filter(b => b.year === year)
            .sort((a, b) => getNum(b.title) - getNum(a.title))
            .forEach(b => {
                const item = document.createElement("div");
                item.className = "bulletin-item";
                item.innerHTML = `
                    <a href="${b.file}" target="_blank">${b.title}</a>
                    <div class="meta-tags">
                        ${(b.tags || []).map(tag => `<span class="tag" data-tag="${tag}" style="cursor:pointer;">${tag}</span>`).join(" ")}
                    </div>
                `;
                itemsWrapper.appendChild(item);
            });

        groupDiv.appendChild(h2);
        groupDiv.appendChild(itemsWrapper);
        container.appendChild(groupDiv);
    });

    enableTagSearch();
}

function showBackButton() {
    document.getElementById("backBtn").style.display = "block";
}

function hideBackButton() {
    document.getElementById("backBtn").style.display = "none";
}

function setupSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");

    function doSearch() {
        const kw = input.value.trim().toLowerCase();
        if (!kw) {
            renderList(bulletins);
            hideBackButton();
            return;
        }
        const filtered = bulletins.filter(b =>
            b.title.toLowerCase().includes(kw) ||
            (b.tags || []).some(t => t.toLowerCase().includes(kw))
        );
        renderList(filtered);
        showBackButton();
    }

    btn.addEventListener("click", doSearch);
    input.addEventListener("keyup", e => {
        if (e.key === "Enter") doSearch();
    });
}

function enableTagSearch() {
    document.querySelectorAll(".tag").forEach(tagEl => {
        tagEl.addEventListener("click", () => {
            const selectedTag = tagEl.dataset.tag.toLowerCase();
            const filtered = bulletins.filter(b =>
                (b.tags || []).some(t => t.toLowerCase() === selectedTag)
            );
            renderList(filtered);
            showBackButton();
        });
    });
}
window.addEventListener("DOMContentLoaded", () => {
    loadData();
});
