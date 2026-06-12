import { db, usersTable } from "./index";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

function hashPassword(pw: string) {
  return createHash("sha256").update(pw + "alis_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  const adminEmail = "admin@alis.com";
  const existingAdmin = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail));

  if (existingAdmin.length === 0) {
    console.log("Creating admin user...");
    await db.insert(usersTable).values({
      name: "System Admin",
      email: adminEmail,
      passwordHash: hashPassword("admin123"),
      role: "admin",
    });
    console.log("Admin user created.");
  } else {
    console.log("Admin user already exists.");
  }

  // Create other demo users if needed
  const demoUsers = [
    { name: "Demo Student", email: "student@alis.com", password: "password123", role: "student" },
    { name: "Demo Teacher", email: "teacher@alis.com", password: "password123", role: "teacher" },
    { name: "Demo Parent", email: "parent@alis.com", password: "password123", role: "parent" },
  ];

  for (const user of demoUsers) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, user.email));
    if (existing.length === 0) {
      console.log(`Creating ${user.role} user...`);
      await db.insert(usersTable).values({
        name: user.name,
        email: user.email,
        passwordHash: hashPassword(user.password),
        role: user.role,
      });
    }
  }

  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
