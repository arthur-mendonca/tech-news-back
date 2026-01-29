import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const id = "51146e08-dd80-443e-9f05-55c1bf3758d4";

    const data: Prisma.FeedSourceCreateInput = {
        name: "TechCrunch",
        url: "https://techcrunch.com/feed/",
        isActive: true,
    };

    await prisma.feedSource.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
    });

    // Create initial user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const userUpsertData: Prisma.UserUpsertArgs = {
        where: { email: adminEmail },
        update: {
            passwordHash,
        },
        create: {
            email: adminEmail,
            passwordHash,
        },
    };

    await prisma.user.upsert(userUpsertData);

    console.log(`Initial user created: ${adminEmail}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

