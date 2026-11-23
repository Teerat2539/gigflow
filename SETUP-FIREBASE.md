# ตั้งค่า GigFlow ให้ล็อกอินด้วย Google (Firebase)

ทำครั้งเดียวประมาณ 10–15 นาที ใช้แพ็กเกจฟรี (Spark) ของ Firebase ได้

ผลลัพธ์ที่ได้:
- ผู้ใช้ทุกคนต้องล็อกอินด้วย Google ก่อนใช้งาน
- ข้อมูลของแต่ละคนเก็บแยกกันที่ `users/{uid}/...` และ Security Rules บังคับให้อ่านหรือแก้ได้เฉพาะเจ้าของบัญชี
- ข้อมูลซิงก์ข้ามเครื่อง และยังใช้งานตอนออฟไลน์ได้

---

## 1. สร้างโปรเจกต์ Firebase
1. เข้า https://console.firebase.google.com แล้วกด **Add project / สร้างโปรเจกต์**
2. ตั้งชื่อ เช่น `gigflow` (จะปิด Google Analytics ก็ได้)

## 2. เพิ่ม Web App และคัดลอก config
1. ในหน้า Project Overview กดไอคอน **`</>` (Web)**
2. ตั้งชื่อแอปเป็น `GigFlow` แล้วติ๊ก **Also set up Firebase Hosting**
3. คัดลอกค่าใน `firebaseConfig` ไปวางในไฟล์ `index.html` ตรง `window.GIGFLOW_FIREBASE_CONFIG`:

```js
window.GIGFLOW_FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "gigflow-xxxx.firebaseapp.com",
  projectId: "gigflow-xxxx",
  storageBucket: "gigflow-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

> ค่า config ของ Firebase Web **ไม่ใช่รหัสลับ** จึงใส่ในหน้าเว็บได้ตามปกติ ความปลอดภัยของข้อมูลมาจาก Security Rules ในข้อ 4

## 3. เปิดใช้ Google Sign-in
**Build › Authentication › Get started › Sign-in method › Google** จากนั้นกด Enable เลือก support email แล้วกด Save

## 4. สร้างฐานข้อมูล Firestore และตั้ง Security Rules
1. ไปที่ **Build › Firestore Database › Create database** เลือก location `asia-southeast1 (Singapore)` และเลือก **Production mode**
2. เปิดแท็บ **Rules** แล้ววางเนื้อหาทั้งหมดจากไฟล์ `firestore.rules` จากนั้นกด **Publish**
   - ถ้าใช้ CLI ในข้อ 5 จะ deploy rules ให้อัตโนมัติอยู่แล้ว

## 5. ขึ้นเว็บด้วย Firebase Hosting (https ฟรี)
ต้องมี Node.js ในเครื่องก่อน จากนั้นรันคำสั่งในโฟลเดอร์ `GigFlow`:

```bash
npm install -g firebase-tools
```
```bash
firebase login
```
```bash
firebase use --add
```
(เลือกโปรเจกต์ที่สร้างไว้ และตั้ง alias เป็น `default`)

```bash
firebase deploy
```

เมื่อ deploy เสร็จจะได้ URL เช่น `https://gigflow-xxxx.web.app`

## 6. ให้ล็อกอินบน iPhone ได้ลื่น (แนะนำมาก)
Safari บน iPhone บล็อก cookie ข้ามโดเมน ถ้าเปิดแอปจากหน้าจอโฮมแล้วล็อกอินไม่ผ่าน ให้ทำดังนี้:
1. ใน `index.html` เปลี่ยน `authDomain` เป็นโดเมนที่ใช้เปิดแอปจริง เช่น `"gigflow-xxxx.web.app"`
2. ไปที่ Google Cloud Console › **APIs & Services › Credentials** แล้วเปิด OAuth client ชื่อ *Web client (auto created by Google Service)*
3. ในช่อง **Authorized redirect URIs** เพิ่ม `https://gigflow-xxxx.web.app/__/auth/handler` แล้วกด Save
4. รัน `firebase deploy` อีกครั้ง

## 7. เปิดคำนวณเวลาเดินทางอัตโนมัติ (Google Maps Routes API)
ใช้สำหรับคำนวณเวลา **บ้าน → ร้าน** และ **ร้าน → ร้าน** (คืนที่วิ่งรอก) ตอนเลือกร้าน ถ้าไม่ทำข้อนี้ แอปยังใช้ได้ปกติ เพียงแต่ต้องกรอกเวลาเดินทางเอง

1. เข้า https://console.cloud.google.com แล้วเลือกโปรเจกต์เดียวกับ Firebase
2. **Billing:** ผูกบัญชีชำระเงิน เพราะ Google Maps ต้องผูกบัตรถึงจะใช้ได้ การใช้งานส่วนตัวระดับนี้มักอยู่ในโควตาฟรีรายเดือน แนะนำให้ตั้ง **Budget alert** ไว้ เช่น 50 บาท
3. **APIs & Services › Library:** ค้นหา **Routes API** แล้วกด Enable
4. **APIs & Services › Credentials › Create credentials › API key** แล้วกดแก้ไข key ที่สร้าง:
   - **Application restrictions:** เลือก *Websites* แล้วเพิ่ม `https://gigflow-xxxx.web.app/*` (ใส่ `http://localhost:5000/*` ด้วยถ้าจะทดสอบในเครื่อง)
   - **API restrictions:** เลือก *Restrict key* แล้วติ๊กเฉพาะ **Routes API**
5. คัดลอก key ไปใส่ใน `index.html`:
   ```js
   window.GIGFLOW_GOOGLE_MAPS_API_KEY = "AIza...";
   ```
6. ในแอป ไปที่เมนู ☰ › **ตั้งค่าบัญชีผู้ใช้ › ตำแหน่งบ้าน** แล้ววางลิงก์ Google Maps **แบบเต็ม** หรือพิกัดของบ้าน
   - ลิงก์สั้น `maps.app.goo.gl/...` อ่านพิกัดไม่ได้ แอปจะแนะนำวิธีเอาลิงก์เต็มหรือพิกัดให้

> แอปคำนวณให้เฉพาะร้านที่ลิงก์ Google Maps มีพิกัดหรือชื่อสถานที่ ร้านที่เป็นลิงก์สั้นหรือไม่มีลิงก์ต้องกรอกเวลาเอง
> เวลาที่เติมให้ = เวลาขับรถจาก Google (คิดสภาพจราจรถ้าเป็นงานในอนาคต) + เวลาเผื่อเก็บของที่ตั้งไว้ (ค่าเริ่มต้น 15 นาที)

## 8. ปล่อยเวอร์ชันใหม่ (ให้ทุกเครื่องรู้ว่ามีอัปเดต)
1. แก้เลขใน `index.html`: `window.GIGFLOW_VERSION = '1.4.1'` และ `window.GIGFLOW_BUILD_DATE`
2. รัน `firebase deploy`
3. เครื่องที่เปิดแอปอยู่จะเห็นแถบสีฟ้า **“มีอัปเดตใหม่ v1.4.1 — แตะเพื่อโหลด”** ภายใน 30 นาที หรือทันทีที่สลับกลับมาเปิดแอป ส่วนเลขเวอร์ชันปัจจุบันดูได้ที่ล่างสุดของเมนู ☰

## 9. ทดลองใช้
- เปิด URL ใน Safari แล้วกด **ดำเนินการต่อด้วย Google**
- ถ้าเคยใช้เวอร์ชันเดิมแบบไม่ล็อกอินบนเครื่องนั้น แอปจะถามว่าต้องการ **ย้ายข้อมูลเดิมขึ้นบัญชี** หรือไม่
- ติดตั้งเป็นแอป: เมนู ☰ › **ติดตั้งแอปลงเครื่อง**
  - iPhone: ทำตามขั้นตอน คือ แชร์ › เพิ่มไปยังหน้าจอโฮม
  - Android/คอมพิวเตอร์: กดติดตั้งได้ทันที

---

### ปัญหาที่พบบ่อย
| อาการ | วิธีแก้ |
|---|---|
| `โดเมนนี้ยังไม่ได้รับอนุญาต` | Authentication › Settings › **Authorized domains** แล้วเพิ่มโดเมนที่ใช้เปิดแอป (`localhost` มีให้แล้ว) |
| `ยังไม่ได้เปิดใช้ Google sign-in` | ทำข้อ 3 |
| ล็อกอินได้แต่ขึ้น “ไม่มีสิทธิ์เข้าถึงข้อมูล” | Rules ยังไม่ได้ publish ให้ทำข้อ 4 ข้อย่อย 2 |
| เปิดไฟล์ด้วยการดับเบิลคลิก (`file://`) แล้วล็อกอินไม่ได้ | Google Sign-in ต้องเปิดผ่าน http(s) เท่านั้น ให้ทดสอบด้วย `firebase serve` หรือ deploy ขึ้นเว็บ |
| อยากกลับไปใช้แบบไม่ล็อกอิน | ลบค่า `apiKey` ใน config ให้เป็น `""` |

### โครงสร้างข้อมูลใน Firestore
```
users/{uid}/gigs/{gigId}      ← 1 เอกสารต่อ 1 คิวงาน
users/{uid}/meta/venues       ← โปรไฟล์ร้าน (Venue Presets)
users/{uid}/meta/settings     ← ตั้งค่าบัญชี: วงหลัก, ตำแหน่งบ้าน, เวลาเผื่อเก็บของ
```

### ไฟล์ในโฟลเดอร์
| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | ตัวแอปทั้งหมด |
| `manifest.json`, `sw.js`, `icons/` | ทำให้ติดตั้งเป็นแอปได้ และเปิดใช้งานแบบออฟไลน์ได้ |
| `firestore.rules` | กฎความปลอดภัย: แต่ละคนเข้าถึงได้เฉพาะข้อมูลของตัวเอง |
| `firebase.json` | ตั้งค่า Hosting และ Rules สำหรับ `firebase deploy` |
