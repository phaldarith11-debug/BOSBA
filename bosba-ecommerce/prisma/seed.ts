import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bosba.com" },
    update: {},
    create: { email: "admin@bosba.com", name: "BOSBA Admin", password: adminPassword, role: "ADMIN" },
  });
  console.log("Admin:", admin.email);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "electronics" }, update: {}, create: { nameEn: "Electronics", nameKm: "អេឡិចត្រូនិច", slug: "electronics" } }),
    prisma.category.upsert({ where: { slug: "fashion" }, update: {}, create: { nameEn: "Fashion", nameKm: "ម៉ូដ", slug: "fashion" } }),
    prisma.category.upsert({ where: { slug: "food" }, update: {}, create: { nameEn: "Food & Beverages", nameKm: "អាហារ និងភេសជ្ជៈ", slug: "food" } }),
    prisma.category.upsert({ where: { slug: "home" }, update: {}, create: { nameEn: "Home & Living", nameKm: "ផ្ទះ និងគ្រឿងប្រើប្រាស់", slug: "home" } }),
    prisma.category.upsert({ where: { slug: "beauty" }, update: {}, create: { nameEn: "Beauty & Health", nameKm: "សម្រស់ និងសុខភាព", slug: "beauty" } }),
    prisma.category.upsert({ where: { slug: "sports" }, update: {}, create: { nameEn: "Sports", nameKm: "កីឡា", slug: "sports" } }),
  ]);
  console.log("Categories:", categories.length);

  // Delivery zones
  const zones = await Promise.all([
    prisma.deliveryZone.upsert({ where: { id: "zone-pp" }, update: {}, create: { id: "zone-pp", nameEn: "Phnom Penh", nameKm: "ភ្នំពេញ", priceUsd: 1.5, priceKhr: 6150, estimatedDays: 1 } }),
    prisma.deliveryZone.upsert({ where: { id: "zone-sr" }, update: {}, create: { id: "zone-sr", nameEn: "Siem Reap", nameKm: "សៀមរាប", priceUsd: 4.0, priceKhr: 16400, estimatedDays: 2 } }),
    prisma.deliveryZone.upsert({ where: { id: "zone-sv" }, update: {}, create: { id: "zone-sv", nameEn: "Sihanoukville", nameKm: "ព្រះសីហនុ", priceUsd: 4.0, priceKhr: 16400, estimatedDays: 2 } }),
    prisma.deliveryZone.upsert({ where: { id: "zone-bt" }, update: {}, create: { id: "zone-bt", nameEn: "Battambang", nameKm: "បាត់ដំបង", priceUsd: 4.5, priceKhr: 18450, estimatedDays: 2 } }),
    prisma.deliveryZone.upsert({ where: { id: "zone-other" }, update: {}, create: { id: "zone-other", nameEn: "Other Provinces", nameKm: "ខេត្តផ្សេងៗ", priceUsd: 5.0, priceKhr: 20500, estimatedDays: 3 } }),
  ]);
  console.log("Delivery zones:", zones.length);

  const elecId = categories.find((c) => c.slug === "electronics")!.id;
  const fashionId = categories.find((c) => c.slug === "fashion")!.id;
  const foodId = categories.find((c) => c.slug === "food")!.id;

  // Sample products
  const products = [
    { nameEn: "iPhone 15 Case", nameKm: "គ្រោងទូរស័ព្ទ iPhone 15", slug: "iphone-15-case", priceUsd: 8.99, priceKhr: 36859, stock: 50, categoryId: elecId, featured: true },
    { nameEn: "Wireless Earbuds", nameKm: "កាស Bluetooth", slug: "wireless-earbuds", priceUsd: 24.99, priceKhr: 102459, comparePrice: 34.99, stock: 30, categoryId: elecId, featured: true },
    { nameEn: "USB-C Cable 2m", nameKm: "ខ្សែ USB-C 2 ម៉ែត្រ", slug: "usb-c-cable-2m", priceUsd: 4.99, priceKhr: 20459, stock: 100, categoryId: elecId },
    { nameEn: "Khmer Silk Scarf", nameKm: "ក្រណាត់ប្រណីត", slug: "khmer-silk-scarf", priceUsd: 15.0, priceKhr: 61500, stock: 20, categoryId: fashionId, featured: true },
    { nameEn: "Traditional Krama", nameKm: "ក្រមា", slug: "traditional-krama", priceUsd: 6.0, priceKhr: 24600, stock: 40, categoryId: fashionId },
    { nameEn: "Kampot Pepper 100g", nameKm: "ម្រេចកំពត ១០០ ក្រាម", slug: "kampot-pepper-100g", priceUsd: 7.5, priceKhr: 30750, stock: 60, categoryId: foodId, featured: true },
    { nameEn: "Dried Mango Snack", nameKm: "ស្វាយស្ងួត", slug: "dried-mango-snack", priceUsd: 3.5, priceKhr: 14350, stock: 80, categoryId: foodId },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, images: [], active: true },
    });
  }
  console.log("Products:", products.length);

  // Sample coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderUsd: 10,
      maxUsage: 100,
    },
  });
  console.log("Coupon WELCOME10 created");

  console.log("Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
