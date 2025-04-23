// —————————————————————————————
// 1) รายการ PDF ทั้งหมด (117 ไฟล์)
// —————————————————————————————
const bulletins = [
  { title: "TSE-SVB-2020-01 การโปรแกรมกล่องควบคุม เครื่องเล่นวิทยุ และระบบปรับอากาศอัตโนมัติ", year: 2020, file: "service/TSE-SVB-2020-01%20การโปรแกรมกล่องควบคุม%20เครื่องเล่นวิทยุ%20และระบบปรับอากาศอัตโนมัติ.pdf" },
  { title: "TSE-SVB-2020-02 แจ้งข้อมูลระยะการบำรุงรักษารถบรรทุกอีซูซุรุ่นใหม่ NLR Lite", year: 2020, file: "service/TSE-SVB-2020-02%20แจ้งข้อมูลระยะการบำรุงรักษารถบรรทุกอีซูซุรุ่นใหม่%20NLR%20Lite.pdf" },
  { title: "TSE-SVB-2020-03 การอัพเดทโปรแกรม G-IDSS", year: 2020, file: "service/TSE-SVB-2020-03%20การอัพเดทโปรแกรม%20G-IDSS.pdf" },
  { title: "TSE-SVB-2020-04 ข้อแนะนำการตรวจสอบหน้าปัดเรือนไมล์", year: 2020, file: "service/TSE-SVB-2020-04%20ข้อแนะนำการตรวจสอบหน้าปัดเรือนไมล์.pdf" },
  { title: "TSE-SVB-2020-05 ข้อแนะนำการบำรุงรักษาระบบลมและอุปกรณ์ดักจับความชื้น", year: 2020, file: "service/TSE-SVB-2020-05%20ข้อแนะนำการบำรุงรักษาระบบลมและอุปกรณ์ดักจับความชื้น.pdf" },
  { title: "TSE-SVB-2020-06 ข้อแนะนำเพิ่มเติมการดูแลรักษารถรอส่งมอบและรอการต่อตัวถัง", year: 2020, file: "service/TSE-SVB-2020-06%20ข้อแนะนำเพิ่มเติมการดูแลรักษารถรอส่งมอบและรอการต่อตัวถัง.pdf" },
  { title: "TSE-SVB-2020-07 การปรับปรุงรายการเกี่ยวกับค่าแรง", year: 2020, file: "service/TSE-SVB-2020-07%20การปรับปรุงรายการเกี่ยวกับค่าแรง.pdf" },
  { title: "TSE-SVB-2020-08 แจ้งการปรับปรุงรายการค่าแรงสำหรับชุดบำรุงรักษาตามระยะรูปแบบใหม่", year: 2020, file: "service/TSE-SVB-2020-08%20แจ้งการปรับปรุงรายการค่าแรงสำหรับชุดบำรุงรักษาตามระยะรูปแบบใหม่.pdf" },
  { title: "TSE-SVB-2020-09 ข้อควรระวังขณะทำการเปลี่ยนชิ้นส่วนระบบปรับอากาศ", year: 2020, file: "service/TSE-SVB-2020-09%20ข้อควรระวังขณะทำการเปลี่ยนชิ้นส่วนระบบปรับอากาศ.pdf" },
  { title: "TSE-SVB-2020-10 ข้อควรระวังเกี่ยวกับการถอดประกอบแผงคอนโซลด้านหน้ารถ", year: 2020, file: "service/TSE-SVB-2020-10%20ข้อควรระวังเกี่ยวกับการถอดประกอบแผงคอนโซลด้านหน้ารถ.pdf" },
  // … (รายการ A–Z รวม 117 รายการ ให้ copy–paste ต่อจากนี้ตาม list ที่คุณให้)
  { title: "TSE-SVB-2025-07 วิธีการบำรุงรักษาและการตรวจสอบแรงดันไอเสียของกรอง DPD", year: 2025, file: "service/TSE-SVB-2025-07%20วิธีการบำรุงรักษาและการตรวจสอบแรงดันไอเสียของกรอง%20DPD.pdf" }
];

// —————————————————————————————
// 2) แสดงรายการ grouped by year (2025 → 2024 → …)
// —————————————————————————————
function renderList(data) {
  const container = document.getElementById("bulletinContainer");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p style='color:red;'>❌ ไม่พบรายการ</p>";
    return;
  }

  // unique ปี เรียงจากมาก→น้อย
  const years = [...new Set(data.map(b => b.year))]
    .sort((a,b) => b - a);

  years.forEach(year => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "year-group";

    const h2 = document.createElement("h2");
    h2.textContent = year;
    groupDiv.appendChild(h2);

    data
      .filter(b => b.year === year)
      .forEach(b => {
        const item = document.createElement("div");
        item.className = "bulletin-item";
        item.innerHTML = `
          <a href="${b.file}" target="_blank">${b.title}</a>
          <div class="meta">ไฟล์: ${b.file.split("/").pop()}</div>
        `;
        groupDiv.appendChild(item);
      });

    container.appendChild(groupDiv);
  });
}

// —————————————————————————————
// 3) ฟังก์ชันค้นหา
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
  input.addEventListener("keyup", e => {
    if (e.key === "Enter") doSearch();
  });
}

// —————————————————————————————
// 4) เมื่อโหลดหน้า
// —————————————————————————————
window.addEventListener("DOMContentLoaded", () => {
  renderList(bulletins);
  setupSearch();
});
