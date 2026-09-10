# 📊 US Stock Market Movers Analysis Module

มอดูลวิเคราะห์ข้อมูลหุ้นสหรัฐอเมริกาที่มีการเปลี่ยนแปลงราคาสูงสุด (Top Gainers / Top Losers) พัฒนาด้วย **NestJS v10+**, **TypeORM**, และ **PostgreSQL** พร้อมระบบตรวจสอบความสมบูรณ์ของข้อมูลในฐานข้อมูลอัตโนมัติ และสลับไปดึงข้อมูลจาก External API (`MassiveApiService`) เมื่อจำเป็น

---

## 📑 สารบัญ (Table of Contents)
- [ภาพรวมโปรเจกต์ (Project Overview)](#-ภาพรวมโปรเจกต์-project-overview)
- [เทคโนโลยีที่ใช้ (Tech Stack)](#-เทคโนโลยีที่ใช้-tech-stack)
- [สถาปัตยกรรมระบบ (System Architecture)](#-สถาปัตยกรรมระบบ-system-architecture)
- [โครงสร้างโฟลเดอร์ (Project Structure)](#-โครงสร้างโฟลเดอร์-project-structure)
- [คู่มือ API (API Specification)](#-คู่มือ-api-api-specification)
- [การติดตั้งและการตั้งค่า (Installation & Setup)](#-การติดตั้งและการตั้งค่า-installation--setup)
- [การรันการทดสอบ (Testing Suite)](#-การรันการทดสอบ-testing-suite)

---

## 🚀 ภาพรวมโปรเจกต์ (Project Overview)

ระบบประมวลผลข้อมูลราคาหุ้นสหรัฐฯ เพื่อหาหุ้นที่มีราคาเพิ่มขึ้นสูงสุด (Gainers) หรือลดลงสูงสุด (Losers) ในช่วงเวลาต่างๆ (1D, 1W, 1M) โดยมีจุดเด่นหลักดังนี้:

1. **Smart Data Syncing**: ตรวจสอบความสมบูรณ์ของข้อมูลในฐานข้อมูล (`checkDataCompleteness`) หากพบว่าข้อมูลไม่สมบูรณ์ ระบบจะดึงข้อมูลจาก External API (`MassiveApiService`) และทำการบันทึก (`upsertPrices`) ลง PostgreSQL อัตโนมัติ
2. **Flexible Calculation**: คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง (Price Change Percentage) และแปลงระดับทศนิยมให้เที่ยงตรงด้วยระบบ Data Normalization
3. **Robust Testing Environment**: ผ่านการทดสอบระดับ **Unit Test 100% (7/7 tests)** และ **E2E Test** เพื่อการันตีความเสถียรก่อนนำไปใช้งานจริง

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

* **Framework**: NestJS v10+ (TypeScript)
* **Database & ORM**: PostgreSQL, TypeORM
* **HTTP Client**: Axios / RxJS (สำหรับติดต่อ External API)
* **Testing Framework**: Jest, Supertest, ts-jest
* **API Testing Tool**: Thunder Client / Postman

---

## 🏗 สถาปัตยกรรมระบบ (System Architecture)

โปรเจกต์ใช้รูปแบบ **Service-Repository Pattern** เพื่อแยกความรับผิดชอบอย่างชัดเจน (Separation of Concerns):

```
┌─────────────────────────┐
│    MoversController     │  <--- รับ Request / คืนค่า Response JSON
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│      MoversService      │  <--- คำนวณ Business Logic / คำนวณ % เปลี่ยนแปลง
└──────┬────────────┬─────┘
       │            │
       │            └──────────────────────────┐
┌──────▼──────────────┐              ┌─────────▼─────────────┐
│  MoversRepository   │              │   MassiveApiService   │
│  (PostgreSQL / DB)  │              │     (External API)    │
└─────────────────────┘              └───────────────────────┘
```

---

## 📂 โครงสร้างโฟลเดอร์ (Project Structure)

```text
movers-project/
├── src/
│   ├── modules/
│   │   └── movers/
│   │       ├── dto/
│   │       │   └── calculate-movers.dto.ts
│   │       ├── entities/
│   │       ├── repositories/
│   │       │   └── movers.repository.ts
│   │       ├── services/
│   │       │   └── movers-massive-api.service.ts
│   │       ├── movers.controller.ts
│   │       ├── movers.controller.spec.ts
│   │       ├── movers.module.ts
│   │       ├── movers.service.ts
│   │       └── movers.service.spec.ts
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── seed-test-data.sql
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📡 คู่มือ API (API Specification)

### 1. คำนวณ Stock Movers (POST)

* **Endpoint**: `POST /movers/calculate`
* **Content-Type**: `application/json`

**Request Body (JSON):**
```json
{
  "period": "1M",
  "type": "gainer",
  "limit": 10
}
```

**Parameters:**
| Field | Type | Required | Values | Default | Description |
|---|---|---|---|---|---|
| `period` | String | No | `1D`, `1W`, `1M` | `1D` | ช่วงเวลาที่ต้องการเปรียบเทียบ |
| `type` | String | No | `gainer`, `loser` | `gainer` | ประเภทหุ้น (ปรับขึ้น/ปรับลง) |
| `limit` | Number | No | > 0 | `10` | จำนวนรายการที่ต้องการแสดง |

**Response Example (`200 OK`):**
```json
{
  "period": "1M",
  "type": "gainer",
  "data": [
    {
      "symbol": "XOM",
      "company_name": "Exxon Mobil Corporation",
      "current_price": 118.50,
      "previous_close_price": 102.20,
      "change_amount": 16.30,
      "change_percent": 15.95
    },
    {
      "symbol": "MSFT",
      "company_name": "Microsoft Corporation",
      "current_price": 420.00,
      "previous_close_price": 380.00,
      "change_amount": 40.00,
      "change_percent": 10.53
    }
  ]
}
```

---

### 2. ดึงข้อมูล Stock Movers (GET)

* **Endpoint**: `GET /movers?period=1W&type=gainer&limit=5`

**Query Parameters:**
* `period` (optional): `1D`, `1W`, `1M`
* `type` (optional): `gainer`, `loser`
* `limit` (optional): number

---

## ⚡ การติดตั้งและการตั้งค่า (Installation & Setup)

1. **Clone repository และติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

2. **ตั้งค่า Environment Variables (`.env`):**
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=stock_db
   MASSIVE_API_KEY=your_api_key
   ```

3. **เตรียมข้อมูลสำหรับการทดสอบ (Optional):**
   นำไฟล์ `seed-test-data.sql` ไป Execute ใน PostgreSQL เพื่อสร้าง Mock Database Initial State

4. **เริ่มรันระบบ Development Server:**
   ```bash
   npm run start:dev
   ```

---

## 🧪 การรันการทดสอบ (Testing Suite)

โปรเจกต์นี้ได้รับการออกแบบด้วยแนวคิด Test-Driven Development (TDD) ครอบคลุมทั้ง Unit Test และ E2E Test

### 1. Unit Tests
ทดสอบเฉพาะส่วนของ Business Logic, Controller, และ Service แบบแยกส่วน (Isolated):

```bash
npm run test
```

**ผลลัพธ์การทดสอบ Unit Tests:**
* ✅ `AppController` (Module creation & root endpoint)
* ✅ `MoversController` (Request routing & DTO passing)
* ✅ `MoversService`:
  * Default calculation params (`1D`, `gainer`, `limit 10`)
  * Filtering & Sorting logic for Top Losers
  * Automatic external API fallback when DB is incomplete

```text
PASS  src/app.controller.spec.ts
PASS  src/modules/movers/movers.controller.spec.ts
PASS  src/modules/movers/movers.service.spec.ts

Test Suites: 3 passed, 3 total
Tests:       7 passed, 7 total
Time:        5.47 s
```

### 2. End-to-End (E2E) Tests
ทดสอบการทำงานภาพรวมของ HTTP Pipeline และ Nest Application Lifecycle:

```bash
npm run test:e2e
```

**ผลลัพธ์การทดสอบ E2E Tests:**
```text
PASS  test/app.e2e-spec.ts
AppController (e2e)
  ✓ / (GET) (26 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Time:        4.863 s
```

---

## 📝 สรุปความพร้อมส่งมอบ (Delivery Readiness)

- [x] **Core Features Complete**: ประมวลผล Movers, คำนวณ %, กรอง Gainer/Loser
- [x] **Database Integration**: TypeORM + PostgreSQL พร้อม Auto Sync API
- [x] **Unit Testing**: Passed 100% (7/7)
- [x] **E2E Testing**: Passed 100% (1/1)
- [x] **API Testing**: ทดสอบผ่าน Thunder Client สำเร็จ (`200 OK`)
