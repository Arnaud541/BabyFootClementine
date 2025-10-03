import { config } from "dotenv";
// jest.config.ts
config({ path: ".env.test" });

import { prisma } from "./src/prisma/client";

beforeAll(async () => {
  // Here you can run any setup code before all tests, like seeding your test database
  await prisma.$connect();
});

afterAll(async () => {
  // Here you can run any teardown code after all tests, like clearing your test database
  await prisma.$disconnect();
});
