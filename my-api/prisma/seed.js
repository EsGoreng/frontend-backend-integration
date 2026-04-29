import prisma from "../config/database.js";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Customer Example",
      email: "customer@example.com",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: {
        name: "Electronics",
        slug: "electronics",
      },
    }),
    prisma.category.upsert({
      where: { slug: "fashion" },
      update: {},
      create: {
        name: "Fashion",
        slug: "fashion",
      },
    }),
    prisma.category.upsert({
      where: { slug: "home-goods" },
      update: {},
      create: {
        name: "Home Goods",
        slug: "home-goods",
      },
    }),
  ]);

  await Promise.all([
    prisma.product.upsert({
      where: { slug: "wireless-headphones" },
      update: {},
      create: {
        name: "Wireless Headphones",
        slug: "wireless-headphones",
        description: "Headphone nirkabel dengan kualitas suara premium.",
        price: 149.99,
        sku: "WH-001",
        stock: 25,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: "smartwatch" },
      update: {},
      create: {
        name: "Smartwatch",
        slug: "smartwatch",
        description: "Smartwatch untuk kebugaran dan notifikasi harian.",
        price: 99.99,
        sku: "SW-001",
        stock: 40,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: "linen-bed-sheet" },
      update: {},
      create: {
        name: "Linen Bed Sheet",
        slug: "linen-bed-sheet",
        description: "Set seprai linen nyaman untuk tidur malam yang nyenyak.",
        price: 59.99,
        sku: "LB-001",
        stock: 80,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: "denim-jacket" },
      update: {},
      create: {
        name: "Denim Jacket",
        slug: "denim-jacket",
        description: "Jaket denim bergaya kasual untuk pria dan wanita.",
        price: 79.99,
        sku: "DJ-001",
        stock: 35,
        categoryId: categories[1].id,
      },
    }),
  ]);

  console.log("Seed data berhasil ditambahkan");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
