// Temporary end-to-end smoke test for the no-code CMS.
//   npx tsx scripts/cms-smoke.ts seed    → insert published sample blocks/menu
//   npx tsx scripts/cms-smoke.ts clean   → remove everything it created
// All sample rows are tagged so cleanup never touches real content.
import "dotenv/config";
import { prisma } from "@bosba/database";

const TAG = "[smoke]";

async function seed() {
  const section = await prisma.pageSection.create({
    data: {
      page: "home",
      type: "promo_banner",
      titleEn: `${TAG} Mid-Year Sale`,
      titleKm: "ការបញ្ចុះតម្លៃ",
      subtitleEn: "Up to 50% off across the store.",
      buttonText: "Shop deals",
      buttonLink: "/products?featured=true",
      device: "both",
      visible: true,
      status: "published",
      sortOrder: 0,
    },
  });

  const menu = await prisma.menu.upsert({
    where: { location: "header" },
    update: {},
    create: { location: "header" },
  });
  const item = await prisma.menuItem.create({
    data: {
      menuId: menu.id,
      labelEn: `${TAG} Deals`,
      labelKm: "ការផ្តល់ជូន",
      url: "/products?featured=true",
      device: "both",
      visible: true,
      status: "published",
      sortOrder: 0,
    },
  });

  console.log("seeded section:", section.id, "| menu item:", item.id);
}

async function clean() {
  const s = await prisma.pageSection.deleteMany({ where: { titleEn: { startsWith: TAG } } });
  const m = await prisma.menuItem.deleteMany({ where: { labelEn: { startsWith: TAG } } });
  console.log(`cleaned ${s.count} section(s), ${m.count} menu item(s)`);
}

const cmd = process.argv[2];
(cmd === "clean" ? clean() : seed())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
