# Movers Feature (Top Gainers / Losers) — Ready to Run

Self-contained NestJS module implementing `POST /movers/calculate`
per `TopGL.yaml` and the flowchart. All TypeScript errors found
during setup (missing folder, undefined narrowing, implicit `any`,
`unknown` catch type) are already fixed in this version.

## Folder contents

```
movers/
├── movers.module.ts
├── movers.controller.ts
├── movers.controller.spec.ts
├── movers.service.ts
├── dto/calculate-movers.dto.ts
├── entities/            # Stock, StockPrice, MoverResult (TypeORM)
├── repositories/movers.repository.ts
├── services/movers-massive-api.service.ts
├── exceptions/           # -> 500 INSUFFICIENT_DATA, 502 EXTERNAL_DATA_SOURCE_ERROR
├── interfaces/movers.interface.ts
├── migrations/1730000000000-CreateMoversTables.ts
├── seed-test-data.sql    # sample data for manual happy-path testing
└── .env.movers.example
```

**Important:** everything must sit under `src/modules/movers/` —
not directly under `src/modules/`. The relative imports
(`./dto/...`, `./entities/...`) only resolve correctly from inside
this folder.

## Setup from an empty NestJS project

```powershell
# 1. from project root
npm i @nestjs/typeorm typeorm pg @nestjs/axios axios @nestjs/config class-validator class-transformer

# 2. copy this whole "movers" folder into src/modules/movers

# 3. add to src/main.ts, right after `const app = await NestFactory.create(AppModule);`
#    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

In `src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoversModule } from './modules/movers/movers.module';
import { Stock } from './modules/movers/entities/stock.entity';
import { StockPrice } from './modules/movers/entities/stock-price.entity';
import { MoverResult } from './modules/movers/entities/mover-result.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Stock, StockPrice, MoverResult],
      synchronize: false,
    }),
    MoversModule,
  ],
})
export class AppModule {}
```

`.env` at project root:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/stockapi
MOVERS_MASSIVE_API_URL=https://massive-api.example.com/v1/prices/latest
MOVERS_MASSIVE_API_KEY=changeme
```

## Run and test

```powershell
npm run start:dev
```

Since a real Massive API likely isn't wired up yet, run
`seed-test-data.sql` against your `stockapi` database first
(pgAdmin → Query tool → paste → run, or `psql -U postgres -d stockapi -f seed-test-data.sql`).
That creates the `stocks`/`stock_prices` tables' rows directly —
run the migration first (via your project's TypeORM CLI /
datasource `migration:run`, using `migrations/1730000000000-CreateMoversTables.ts`)
so the tables exist before seeding. This inserts 3 symbols with
35 days of price history, enough for `1D`, `1W`, and `1M` to pass
the completeness check without ever calling the external API.

Then in Postman:

```
POST http://localhost:3000/movers/calculate
Content-Type: application/json

{ "period": "1D", "type": "gainers", "limit": 10 }
```

Expected: `200 OK` with a `data` array of up to 3 stocks, sorted by
`change_percent` descending.

Try `"type": "losers"` too, and an invalid `"period": "1Y"` to see
the `400` validation error.

Run the included unit test with `npm run test movers.controller`.

## Merging into the shared team repo

Same as before — copy `modules/movers/` into the shared repo,
add `MoversModule` to the shared `app.module.ts` imports, merge the
`.env` values, and drop the migration file in alongside teammates'.
If someone else's feature also needs a `Stock` entity, agree on one
canonical version as a team.

## Assumptions worth flagging with your team

- **Volatility** = standard deviation of daily % returns over the
  selected period.
- **Data completeness** = at least 90% of tracked stocks have a
  price on both the latest date and the period-start date
  (`COMPLETENESS_THRESHOLD` in `movers.repository.ts`).
- **Period → date range**: 1D = 1 calendar day back, 1W = 7 days,
  1M = 30 days (calendar days, not trading days).
