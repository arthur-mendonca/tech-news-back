import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const id = "51146e08-dd80-443e-9f05-55c1bf3758d4";

    const data = {
        name: "TechCrunch",
        url: "https://techcrunch.com/feed/",
        isActive: true,
    };

    await prisma.feedSource.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

