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

## 7. ทดลองใช้
- เปิด URL ใน Safari แล้วกด **ดำเนินการต่อด้วย Google**
- ถ้าเคยใช้เวอร์ชันเดิมแบบไม่ล็อกอินบนเครื่องนั้น แอปจะถามว่าต้องการ **ย้ายข้อมูลเดิมขึ้นบัญชี** หรือไม่
- ติดตั้งเป็นแอป: กดปุ่ม Share แล้วเลือก **เพิ่มไปยังหน้าจอโฮม**

---

### ปัญหาที่พบบ่อย
| อาการ | วิธีแก้ |
|---|---|
| `โดเมนนี้ยังไม่ได้รับอนุญาต` | Authentication › Settings › **Authorized domains** แล้วเพิ่มโดเมนที่ใช้เปิดแอป (`localhost` มีให้แล้ว) |
| `ยังไม่ได้เปิดใช้ Google sign-in` | ทำข้อ 3 |
| ล็อกอินได้แต่ขึ้น “ไม่มีสิทธิ์เข้าถึงข้อมูล” | Rules ยังไม่ได้ publish ให้ทำข้อ 4.2 |
| เปิดไฟล์ด้วยการดับเบิลคลิก (`file://`) แล้วล็อกอินไม่ได้ | Google Sign-in ต้องเปิดผ่าน http(s) เท่านั้น ให้ทดสอบด้วย `firebase serve` หรือ deploy ขึ้นเว็บ |
| อยากกลับไปใช้แบบไม่ล็อกอิน | ลบค่า `apiKey` ใน config ให้เป็น `""` |

### โครงสร้างข้อมูลใน Firestore
```
users/{uid}/gigs/{gigId}      ← 1 เอกสารต่อ 1 คิวงาน
users/{uid}/meta/venues       ← โปรไฟล์ร้าน (Venue Presets)
```
