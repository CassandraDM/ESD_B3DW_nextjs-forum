import { PrismaClient } from "../src/generated/prisma";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const NB_USERS = 5;
const NB_CONVERSATION = 10;
const NB_MESSAGE_PER_CONVERSATION = 5;

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log("🌱 Starting seed...");

  // Créer des utilisateurs avec différents rôles
  console.log("👤 Creating users...");
  const users = [];
  
  // Créer un admin
  const adminPassword = await hashPassword("password123");
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      bio: "Administrateur du forum",
      role: "ADMIN",
    },
  });
  users.push(admin);
  console.log(`  ✓ Created admin: ${admin.email}`);

  // Créer un modérateur
  const moderatorPassword = await hashPassword("password123");
  const moderator = await prisma.user.create({
    data: {
      email: "moderator@example.com",
      password: moderatorPassword,
      name: "Moderator User",
      bio: "Modérateur du forum",
      role: "MODERATOR",
    },
  });
  users.push(moderator);
  console.log(`  ✓ Created moderator: ${moderator.email}`);

  // Créer des utilisateurs normaux
  for (let i = 0; i < NB_USERS; i++) {
    const hashedPassword = await hashPassword("password123"); // Mot de passe par défaut pour tous les utilisateurs de test
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        name: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        role: "USER", // Rôle par défaut
      },
    });
    users.push(user);
    console.log(`  ✓ Created user: ${user.email}`);
  }

  // Créer des conversations avec des auteurs
  console.log("💬 Creating conversations...");
  const conversations = [];
  for (let i = 0; i < NB_CONVERSATION; i++) {
    // Sélectionner un utilisateur aléatoire comme auteur
    const author = faker.helpers.arrayElement(users);
    const conversation = await prisma.conversation.create({
      data: {
        title: faker.lorem.sentence(),
        authorId: author.id,
      },
    });
    conversations.push(conversation);
    console.log(`  ✓ Created conversation: ${conversation.title}`);
  }

  // Créer des messages avec des auteurs
  console.log("📝 Creating messages...");
  for (const conversation of conversations) {
    for (let j = 0; j < NB_MESSAGE_PER_CONVERSATION; j++) {
      // Sélectionner un utilisateur aléatoire comme auteur du message
      const author = faker.helpers.arrayElement(users);
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: faker.lorem.paragraph(),
          authorId: author.id,
        },
      });
    }
    console.log(
      `  ✓ Created ${NB_MESSAGE_PER_CONVERSATION} messages for conversation: ${conversation.title}`
    );
  }

  console.log("✅ Seeding completed successfully!");
  console.log(`   - ${users.length} users created`);
  console.log(`   - ${conversations.length} conversations created`);
  console.log(
    `   - ${
      conversations.length * NB_MESSAGE_PER_CONVERSATION
    } messages created`
  );
  console.log("\n📧 Test accounts (password: password123):");
  console.log(`   - Admin: ${admin.email} (ADMIN)`);
  console.log(`   - Moderator: ${moderator.email} (MODERATOR)`);
  users
    .filter((u) => u.id !== admin.id && u.id !== moderator.id)
    .forEach((user) => {
      console.log(`   - ${user.email} (USER)`);
    });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
