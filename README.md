# US Stock Market Movers API (MassiveAPI)

ระบบ API สำหรับคำนวณและดึงข้อมูลหุ้นสหรัฐฯ ที่มีการเคลื่อนไหวโดดเด่น (Stock Market Movers) พัฒนาด้วย NestJS, TypeORM/PostgreSQL และเชื่อมต่อกับ Polygon.io API พร้อมระบบตรวจจับความสมบูรณ์ของข้อมูลในฐานข้อมูลอัตโนมัติ

==================================================
🛠 Tech Stack
==================================================
- Framework: NestJS (v10)
- Database & ORM: PostgreSQL / TypeORM
- External API: Polygon.io API
- Testing: Jest & Supertest (Unit Testing & E2E Testing)
- Documentation: Swagger / OpenAPI (@nestjs/swagger)

==================================================
✨ Features
==================================================
- Movers Types: รองรับการจัดอันดับหุ้น 3 ประเภท
  * gainer: หุ้นที่มีเปอร์เซ็นต์ราคาปรับตัวเพิ่มขึ้นสูงสุด
  * loser: หุ้นที่มีเปอร์เซ็นต์ราคาปรับตัวลดลงสูงสุด
  * most_volatile: หุ้นที่มีความผันผวนของราคาสูงสุด
- Time Periods: เลือกช่วงเวลาคำนวณได้ 3 ระยะ (1D, 1W, 1M)
- Smart Data Fetching: ตรวจสอบความสมบูรณ์ของข้อมูลใน DB หากข้อมูลไม่ครบจะทำการดึงข้อมูลล่าสุดจาก Polygon.io API และทำ Upsert ลง DB ให้อัตโนมัติ
- Request Validation: กรองและแปลงข้อมูลประเภท Query/Body ด้วย class-validator และ class-transformer
- Interactive API Docs: ทดสอบยิง API ได้ทันทีผ่านหน้าเว็บ Swagger UI

==================================================
🚀 Getting Started
==================================================
1. Installation:
   git clone https://github.com/phuwanat48/MassiveAPI.git
   cd MassiveAPI
   npm install --legacy-peer-deps

2. Environment Setup (.env):
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=stock_db
   POLYGON_API_KEY=your_polygon_api_key

3. Running the Application:
   npm run start:dev   # Development mode
   npm run build       # Production build
   npm run start:prod  # Production mode

==================================================
📖 API Documentation (Swagger)
==================================================
http://localhost:3000/api

==================================================
📌 API Endpoints
==================================================
URL: /movers/calculate
Method: POST
Content-Type: application/json

Request Body Example:
{
  "period": "1D",
  "type": "most_volatile",
  "limit": 10
}

Parameters:
- period (string): Options [1D, 1W, 1M], Default: 1D
- type (string): Options [gainer, loser, most_volatile], Default: gainer
- limit (number): Min 1, Default: 10

==================================================
🧪 Running Tests
==================================================
- Unit Tests: npm run test -- movers.service.spec.ts
- E2E Tests: npm run test:e2e