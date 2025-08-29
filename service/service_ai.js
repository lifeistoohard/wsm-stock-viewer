// —————————————————————————————
// 1) ข้อมูล AI Search
// —————————————————————————————
const aiData = [
    // ... วางอาร์เรย์ aiData ที่คุณสร้างจาก Google Sheets ที่นี่
];

// —————————————————————————————
// 2) ฟังก์ชันสำหรับ AI Search
// —————————————————————————————
function setupTabSwitching() {
    const normalTabBtn = document.getElementById("normalSearchTab");
    const aiTabBtn = document.getElementById("aiSearchTab");
    const normalContainer = document.getElementById("normalSearchContainer");
    const aiContainer = document.getElementById("aiSearchContainer");
    const searchInput = document.getElementById("searchInput");
    const aiSearchInput = document.getElementById("aiSearchInput");

    normalTabBtn.addEventListener("click", () => {
        normalTabBtn.classList.add("active");
        aiTabBtn.classList.remove("active");
        normalContainer.style.display = "block";
        aiContainer.style.display = "none";
        searchInput.value = "";
        aiSearchInput.value = "";
        renderList(bulletins);
        hideBackButton();
    });

    aiTabBtn.addEventListener("click", () => {
        aiTabBtn.classList.add("active");
        normalTabBtn.classList.remove("active");
        normalContainer.style.display = "none";
        aiContainer.style.display = "block";
        searchInput.value = "";
        aiSearchInput.value = "";
        // ในส่วนนี้เราจะยังใช้ renderList(bulletins) ชั่วคราว
        // รอจนกว่าจะมีการเชื่อมต่อกับ AI API จริง
        renderList(bulletins); 
        hideBackButton();
    });
}

function setupAiSearch() {
    const aiSearchBtn = document.getElementById("aiSearchBtn");
    const aiSearchInput = document.getElementById("aiSearchInput");

    aiSearchBtn.addEventListener("click", () => {
        const query = aiSearchInput.value.trim();
        if (query) {
            // NOTE: ส่วนนี้จะถูกแก้ไขเมื่อเราเชื่อมต่อกับ AI API
            alert("ฟังก์ชันค้นหาด้วย AI กำลังอยู่ระหว่างการพัฒนา กรุณาใช้การค้นหาแบบปกติไปก่อนนะครับ");
        }
    });

    aiSearchInput.addEventListener("keyup", e => {
        if (e.key === "Enter") {
            aiSearchBtn.click();
        }
    });
}

// —————————————————————————————
// 3) การเริ่มต้นระบบ
// —————————————————————————————
window.addEventListener("DOMContentLoaded", () => {
    // ต้องเรียกฟังก์ชันนี้จากไฟล์นี้เอง
    setupTabSwitching();
    setupAiSearch();
});
