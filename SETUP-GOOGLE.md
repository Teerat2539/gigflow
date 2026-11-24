# ตั้งค่า GigFlow ให้ล็อกอินด้วย Google และเก็บข้อมูลใน Google Drive

ทำครั้งเดียวประมาณ 10–15 นาที ฟรี และ **ไม่ต้องสร้างฐานข้อมูล**

ผลลัพธ์ที่ได้:
- ผู้ใช้กด **“ดำเนินการต่อด้วย Google”** แล้วใช้งานได้ทันที
- ข้อมูลของแต่ละคนเป็นไฟล์เดียวใน **Google Drive ของคนนั้นเอง** อยู่ในโฟลเดอร์ซ่อนของแอป (appDataFolder)
  - คนอื่นมองไม่เห็น
  - GigFlow มองไม่เห็นไฟล์อื่นใน Drive ของผู้ใช้
- ใช้หลายเครื่องได้: ข้อมูลซิงก์ผ่าน Drive ตอนเปิดแอปและหลังแก้ไข (ไม่ใช่เรียลไทม์) และใช้งานออฟไลน์ได้

---

## 1. สร้างโปรเจกต์ใน Google Cloud
1. เข้า https://console.cloud.google.com ด้วยบัญชี Google ของคุณ
2. กดเมนูเลือกโปรเจกต์ด้านบน › **New project** ตั้งชื่อ เช่น `GigFlow` แล้วกด Create

## 2. เปิด Google Drive API
**APIs & Services › Library** แล้วค้นหา **Google Drive API** จากนั้นกด **Enable**

## 3. ตั้งค่าหน้าขออนุญาต (OAuth consent screen)
เมนู **Google Auth Platform** (บางบัญชีชื่อ *APIs & Services › OAuth consent screen*)
1. **Branding:** ตั้ง App name เป็น `GigFlow` เลือก User support email และกรอก Developer contact email
   - ไม่ต้องใส่โลโก้ เพราะถ้าใส่ Google จะต้องตรวจสอบแอปก่อน
2. **Audience:** เลือก **External**
3. **Data access › Add or remove scopes:** ติ๊ก 4 รายการนี้
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `.../auth/drive.appdata` (ค้นคำว่า *appdata*)
4. กลับไปที่ **Audience** แล้วกด **Publish app** เพื่อเปลี่ยนเป็น *In production*
   - ทั้ง 4 สิทธิ์นี้เป็นระดับที่ Google ไม่ต้องตรวจสอบแอป (non-sensitive) จึงใช้ได้ทุกบัญชี Google
   - ถ้ายังไม่ Publish (อยู่ในโหมด *Testing*) จะล็อกอินได้เฉพาะอีเมลที่เพิ่มไว้ในช่อง **Test users** เท่านั้น

## 4. สร้าง OAuth Client ID
1. **Google Auth Platform › Clients › Create client** (หรือ *APIs & Services › Credentials › Create credentials › OAuth client ID*)
2. Application type: **Web application**
3. **Authorized JavaScript origins:** ใส่โดเมนที่จะเปิดแอป เช่น
   - `https://gigflow-xxxx.web.app` (ได้มาจากข้อ 5)
   - `http://localhost:5000` (ถ้าจะทดสอบในเครื่อง)
   - ช่อง *Authorized redirect URIs* ไม่ต้องใส่
4. กด Create แล้วคัดลอก **Client ID** (ลงท้ายด้วย `.apps.googleusercontent.com`) ไปวางใน `index.html`:
   ```js
   window.GIGFLOW_GOOGLE_CLIENT_ID = "1234567890-xxxx.apps.googleusercontent.com";
   ```

> Client ID **ไม่ใช่รหัสลับ** จึงใส่ในหน้าเว็บได้ตามปกติ และใช้ได้เฉพาะโดเมนที่อนุญาตไว้ในข้อ 4 ข้อย่อย 3

## 5. ขึ้นเว็บ (https ฟรี) — เลือกได้หนึ่งทาง
Google Sign-in ใช้ได้เฉพาะหน้าเว็บที่เปิดผ่าน `https://` หรือ `http://localhost` เท่านั้น ถ้าดับเบิลคลิกเปิดไฟล์ในเครื่องจะล็อกอินไม่ได้

**ทาง ก: Firebase Hosting** (ใช้แค่ส่วนฝากเว็บ ไม่ต้องสร้างฐานข้อมูล)
1. เข้า https://console.firebase.google.com › Add project › เลือกโปรเจกต์ `GigFlow` ที่สร้างไว้ในข้อ 1
2. ต้องมี Node.js ในเครื่องก่อน จากนั้นรันคำสั่งในโฟลเดอร์ `GigFlow`:
```bash
npm install -g firebase-tools
```
```bash
firebase login
```
```bash
firebase use --add
```
```bash
firebase deploy
```
3. จะได้ URL เช่น `https://gigflow-xxxx.web.app` ให้นำ URL นี้ไปใส่ในข้อ 4 ข้อย่อย 3

**ทาง ข: Netlify** (ไม่ต้องติดตั้งอะไร)
1. เข้า https://app.netlify.com/drop แล้วลากโฟลเดอร์ `GigFlow` ทั้งโฟลเดอร์ไปวาง
2. จะได้ URL เช่น `https://xxxx.netlify.app` ให้นำไปใส่ในข้อ 4 ข้อย่อย 3

## 6. (ไม่บังคับ) คำนวณเวลาเดินทางอัตโนมัติ — Google Maps Routes API
ถ้าไม่ทำข้อนี้ แอปยังใช้ได้ปกติ เพียงแต่ต้องกรอกเวลาเดินทางเอง
1. ในโปรเจกต์เดียวกัน: **Billing** › ผูกบัญชีชำระเงิน (Google Maps บังคับผูกบัตร แต่การใช้ส่วนตัวมักอยู่ในโควตาฟรีรายเดือน) แนะนำให้ตั้ง **Budget alert** ไว้
2. **APIs & Services › Library** › **Routes API** › Enable
3. **Credentials › Create credentials › API key** แล้วกดแก้ไข key:
   - **Application restrictions:** เลือก *Websites* แล้วใส่ `https://gigflow-xxxx.web.app/*`
   - **API restrictions:** เลือก *Restrict key* แล้วติ๊ก **Routes API**
4. วาง key ใน `index.html`: `window.GIGFLOW_GOOGLE_MAPS_API_KEY = "AIza...";`
5. ในแอป ไปที่เมนู ☰ › ตั้งค่าบัญชีผู้ใช้ › **ตำแหน่งบ้าน** แล้ววางลิงก์ Google Maps แบบเต็ม หรือพิกัด

## 7. ปล่อยเวอร์ชันใหม่
1. แก้เลขใน `index.html`: `window.GIGFLOW_VERSION = '1.6.1'` และ `window.GIGFLOW_BUILD_DATE`
2. Deploy ใหม่ (`firebase deploy` หรือลากโฟลเดอร์ไปที่ Netlify อีกครั้ง)
3. เครื่องที่เปิดแอปอยู่จะเห็นแถบสีฟ้า **“มีอัปเดตใหม่ — แตะเพื่อโหลด”**

---

## การใช้งานที่ควรรู้
- **ล็อกอินครั้งแรก:** Google จะถามว่าอนุญาตให้ GigFlow *“ดู สร้าง และลบข้อมูลการกำหนดค่าของตัวเองใน Google ไดรฟ์”* หรือไม่ ต้องติ๊กอนุญาตด้วย แอปถึงจะเก็บข้อมูลได้
- **การซิงก์:**
  - การยืนยันกับ Google มีอายุประมาณ 1 ชั่วโมง เมื่อหมดอายุ หน้าหลักจะขึ้น **“แตะเพื่อซิงก์กับ Google Drive”** แตะครั้งเดียว Google อาจเด้งหน้าต่างเล็ก ๆ แล้วปิดเอง
  - ระหว่างนั้นทุกอย่างยังบันทึกในเครื่องตามปกติ
- **ใช้หลายเครื่อง:** การแก้ไขจากอีกเครื่องจะมาตอนซิงก์ครั้งถัดไป ได้แก่ ตอนเปิดแอป สลับกลับมาที่แอป ทุก 5 นาที หรือกดปุ่ม “ซิงก์ตอนนี้” ในเมนู ☰ ถ้าแก้งานเดียวกันจากสองเครื่อง ครั้งที่แก้ทีหลังจะเป็นค่าที่ใช้
- **ดูหรือลบข้อมูลใน Drive:** Google Drive › ⚙️ Settings › **Manage apps** › GigFlow จะเห็นขนาด *Hidden app data* และลบได้จากตรงนั้น หรือใช้เมนู ☰ › ลบบัญชีและข้อมูลถาวร
- **ออกจากระบบ:** ข้อมูลยังอยู่ใน Drive แต่ข้อมูลที่แคชไว้ในเครื่องนั้นจะถูกล้าง

### ปัญหาที่พบบ่อย
| อาการ | วิธีแก้ |
|---|---|
| `Error 400: origin_mismatch` / `redirect_uri_mismatch` | ใส่โดเมนที่ใช้เปิดแอปในข้อ 4 ข้อย่อย 3 ให้ตรง (ขึ้นต้น `https://` และไม่มี `/` ท้าย) |
| `Access blocked: GigFlow has not completed the Google verification process` | แอปยังอยู่โหมด Testing → กด Publish app (ข้อ 3 ข้อย่อย 4) หรือเพิ่มอีเมลใน Test users |
| ล็อกอินได้แต่ขึ้น “ต้องติ๊กอนุญาตให้ GigFlow เก็บข้อมูล…” | ตอนขออนุญาต ต้องติ๊กช่องสิทธิ์ Google Drive ด้วย |
| “Google Drive ไม่อนุญาต — ตรวจสอบว่าเปิด Google Drive API แล้ว” | ทำข้อ 2 |
| กดล็อกอินแล้วไม่มีอะไรเกิดขึ้น | เบราว์เซอร์บล็อกป๊อปอัป → อนุญาตป๊อปอัปสำหรับเว็บนี้ |
| อยากกลับไปใช้แบบไม่ล็อกอิน | ลบค่าใน `GIGFLOW_GOOGLE_CLIENT_ID` ให้เป็น `""` |

### ไฟล์ในโฟลเดอร์
| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | ตัวแอปทั้งหมด |
| `manifest.json`, `sw.js`, `icons/` | ทำให้ติดตั้งเป็นแอปได้ และเปิดแบบออฟไลน์ได้ |
| `firebase.json` | ตั้งค่า Firebase Hosting (ใช้เฉพาะถ้าเลือกทาง ก ในข้อ 5) |
