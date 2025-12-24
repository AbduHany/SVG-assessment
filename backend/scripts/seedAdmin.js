const bcrypt = require("bcryptjs");
const dbClient = require("../src/utils/db");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const User = dbClient.models.user;

const DEFAULT_ADMIN_NAME = "Admin User";
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (!email) {
    throw new Error("ADMIN_EMAIL is required to seed an admin user.");
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    if (!user.isAdmin) {
      await user.update({ isAdmin: true });
      console.log(`Updated existing user ${email} to admin.`);
    } else {
      console.log(`Admin user already exists for ${email}.`);
    }
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const id = uuidv4();

  await User.create({
    id,
    name,
    email,
    password: hashedPassword,
    isAdmin: true,
    isActive: true,
  });

  console.log(`Created admin user for ${email}.`);
}

seedAdmin()
  .then(async () => {
    await dbClient.sequelize.close();
    console.log("Admin seeding completed successfully.");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Failed to seed admin user.");
    console.error(error);
    try {
      await dbClient.sequelize.close();
    } catch (closeError) {
      console.error("Failed to close database connection.");
      console.error(closeError);
    }
    process.exit(1);
  });
