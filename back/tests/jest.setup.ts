import { config } from "dotenv";
config({ path: ".env.test" });
import { prisma } from "../src/prisma/client";

beforeAll(async () => {
  console.log("Connecting to the database...");
  await prisma.$connect();
});

afterAll(async () => {
  console.log("Disconnecting from the database...");
  await prisma.$disconnect();
});
