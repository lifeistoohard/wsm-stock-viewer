function setupAiSearch() {
    const aiSearchBtn = document.getElementById("aiSearchBtn");
    const aiSearchInput = document.getElementById("aiSearchInput");
    const searchResultsContainer = document.getElementById("searchResultsContainer"); 

    aiSearchBtn.addEventListener("click", async () => {
        const query = aiSearchInput.value.trim();
        if (query) {
            // แสดงข้อความระหว่างรอระบบประมวลผล
            searchResultsContainer.innerHTML = "กำลังค้นหาและวิเคราะห์ข้อมูล... กรุณารอสักครู่";

            // API Key ของคุณ
            const YOUR_API_KEY = ""; 
            
            try {
                // System Prompt ที่เรากำหนดกฎเกณฑ์ไว้
                const systemPrompt = `[บทบาทของคุณ]
คุณคือ "AI ผู้เชี่ยวชาญฝ่ายเทคนิค" หน้าที่ของคุณคือการให้คำปรึกษา แนะนำกระบวนการทำงาน และวิธีการจัดการปัญหาสำหรับรถยนต์ 5 ตระกูล ได้แก่ D-MAX, MU-X, N-Series, F-Series, และ FXGX Series โดยต้องตอบคำถามโดยอิงจากเอกสาร Service Bulletin (PDF) ที่แนบมาให้เท่านั้น

[กฎเกณฑ์ที่ต้องปฏิบัติตามอย่างเคร่งครัด]
1. ห้ามตอบคำถามทันที หากผู้ใช้งานยังระบุข้อมูลเบื้องต้นไม่ครบ คุณต้องตรวจสอบว่าในคำถามของผู้ใช้ มีข้อมูลสำคัญครบ 2 ข้อนี้แล้วหรือยัง:
   - ข้อ ก. รุ่นรถ (ต้องรู้ว่าเป็นรถ D-MAX, MU-X, N-Series, F-Series, หรือ FXFYGX Series เช่น D-MAX, NMR (อยู่ใน N-Series) , FTR (อยู่ใน F-Series), FXZ (อยู่ใน FXFYGX Series) เป็นต้น) และรุ่นปีของรถ
   - ข้อ ข. อาการที่พบ หรือ ส่วนประกอบที่ต้องการสอบถาม
2. การถามกลับ: หากผู้ใช้ระบุข้อมูลไม่ครบ (เช่น บอกแค่อาการแต่ไม่บอกรุ่นรถ หรือ บอกรุ่นรถแต่ไม่ระบุอาการชัดเจน) ให้คุณตั้งคำถามกลับอย่างสุภาพ เพื่อขอข้อมูลที่ขาดหายไป (ให้ถามกลับทีละ 1 เรื่องเท่านั้น)
3. ห้ามมั่วข้อมูล (No Hallucination): เมื่อได้ข้อมูลครบแล้ว ให้ค้นหาวิธีแก้ไขจากในเอกสาร PDF เท่านั้น หากในเอกสารไม่มีข้อมูล หรือหาไม่พบ ให้ตอบตามตรงว่า "ขออภัยครับ ไม่พบข้อมูลอาการดังกล่าวของรถรุ่นนี้ใน Service Bulletin ระบบปัจจุบันครับ" ห้ามคิดวิธีซ่อมขึ้นมาเองเด็ดขาด
4. การสรุปคำตอบ: เมื่อหาข้อมูลเจอ ให้สรุปขั้นตอนการทำงาน หรือการจัดการปัญหาเป็นข้อๆ (Bullet points) เพื่อให้อ่านและนำไปปฏิบัติตามได้ง่าย

[บุคลิกและน้ำเสียง]
เป็นมืออาชีพ น่าเชื่อถือ สุภาพ และใช้ภาษาไทยที่เข้าใจง่ายสำหรับช่างเทคนิค`;

                // ประกอบร่างคำสั่งทั้งหมด (กฎเกณฑ์ + คำถามผู้ใช้ + ฐานข้อมูล Service Bulletin)
                const prompt = `${systemPrompt}\n\nUser: "${query}"\n\nฐานข้อมูลอ้างอิง Service Bulletin (JSON):\n${JSON.stringify(aiData)}`;

                // เปลี่ยนมาใช้โมเดล gemini-1.5-flash เพื่อความรวดเร็วและรองรับข้อมูลเยอะ
                const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + YOUR_API_KEY, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }],
                        }],
                    }),
                });

                if (!response.ok) {
                    throw new Error("การเชื่อมต่อ API ขัดข้อง");
                }
                const data = await response.json();
                
                // ดึงผลลัพธ์ที่เป็นตัวอักษรออกมา
                const textResult = data.candidates[0].content.parts[0].text;
                
                // แปลง \n ให้เป็นการขึ้นบรรทัดใหม่ใน HTML เพื่อให้อ่านง่าย
                const formattedResult = textResult.replace(/\n/g, "<br>");
                
                // แสดงผลลัพธ์ออกทางหน้าเว็บ
                searchResultsContainer.innerHTML = `<h3 style="color:#e63946;">🤖 AI ผู้เชี่ยวชาญฝ่ายเทคนิค:</h3><div style="line-height: 1.6; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">${formattedResult}</div>`;

            } catch (error) {
                console.error("เกิดข้อผิดพลาด:", error);
                searchResultsContainer.innerHTML = "<p style='color:red;'>ขออภัย ไม่สามารถติดต่อระบบ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>";
            }
        }
    });

    aiSearchInput.addEventListener("keyup", e => {
        if (e.key === "Enter") {
            aiSearchBtn.click();
        }
    });
}
