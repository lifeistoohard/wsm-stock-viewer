// —————————————————————————————
// 1) ตั้งข้อมูล Service Bulletins (เพิ่ม/ลบ ได้ตามต้องการ)
// —————————————————————————————
const bulletins = [
  // ตัวอย่าง
  { title: "SB-2025-01: ข้อมูลทั่วไป",     year: 2025, file: "pdf/SB-2025-01.pdf" },
  { title: "SB-2025-02: ระบบเบรก",         year: 2025, file: "pdf/SB-2025-02.pdf" },
  { title: "SB-2024-01: เครื่องยนต์",       year: 2024, file: "pdf/SB-2024-01.pdf" },
  // … เพิ่มให้ครบทุกฉบับ
];

// —————————————————————————————
// 2) สร้างกลุ่มตามปี → แสดงบนหน้า
// —————————————————————————————
function renderList(data) {
  const container = document.getElementById("bulletinContainer");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p style='color:red;'>❌ ไม่พบรายการ</p>";
    return;
  }

  // หา unique ปี และเรียงจากมาก→น้อย
  const years = [...new Set(data.map(b => b.year))]
    .sort((a,b) => b - a);

  years.forEach(year => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "year-group";

    // หัวกล่องปี
    const h2 = document.createElement("h2");
    h2.textContent = year;
    groupDiv.appendChild(h2);

    // สร้างรายการย่อย
    data
      .filter(b => b.year === year)
      .forEach(b => {
        const item = document.createElement("div");
        item.className = "bulletin-item";
        item.innerHTML = `
          <a href="${b.file}" target="_blank">${b.title}</a>
          <div class="meta">ไฟล์: ${b.file}</div>
        `;
        groupDiv.appendChild(item);
      });

    container.appendChild(groupDiv);
  });
}

// —————————————————————————————
// 3) ฟังก์ชันค้นหาด้วย keyword
// —————————————————————————————
function setupSearch() {
  const input = document.getElementById("searchInput");
  const btn   = document.getElementById("searchBtn");

  function doSearch() {
    const kw = input.value.trim().toLowerCase();
    if (!kw) {
      renderList(bulletins);
      return;
    }
    const filtered = bulletins.filter(b =>
      b.title.toLowerCase().includes(kw)
    );
    renderList(filtered);
  }

  btn.addEventListener("click", doSearch);
  // กด Enter
  input.addEventListener("keyup", e => {
    if (e.key === "Enter") doSearch();
  });
}

// —————————————————————————————
// 4) เมื่อโหลดหน้าครั้งแรก
// —————————————————————————————
window.addEventListener("DOMContentLoaded", () => {
  renderList(bulletins);  // แสดงทั้งหมด
  setupSearch();          // เปิดใช้ฟังก์ชันค้นหา
});
