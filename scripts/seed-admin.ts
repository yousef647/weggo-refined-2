import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import User from "../src/models/User";

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@weggo.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  if (process.env.NODE_ENV === "production") {
    throw new Error("seed:admin is intended for local development only.");
  }
  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      // eslint-disable-next-line no-console
      console.log(`Updated existing user to admin: ${email}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Admin already present: ${email}`);
    }
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    email,
    passwordHash,
    name: "Local Admin",
    role: "admin",
    banned: false,
  });
  // eslint-disable-next-line no-console
  console.log(`Created admin user ${email}. Change the password after first login.`);
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
