/**
 * Demo seed for RNS E-commerce.
 * Images are local SVG placeholders under public/seed (run: node scripts/generate-seed-images.mjs)
 */
import bcrypt from "bcryptjs";
import { dec } from "./app/lib/decimal";
import { db } from "./src/prisma/db";

const DEMO_PASSWORD = "demo1234";
const ADMIN_PASSWORD = "admin1234";

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  variants: { sku: string; size: string; color: string; price: number; stock: number }[];
};

const categories = [
  { name: "Men", slug: "men", description: "Men's fashion", sortOrder: 1, imageUrl: "/seed/categories/men.svg" },
  { name: "Women", slug: "women", description: "Women's fashion", sortOrder: 2, imageUrl: "/seed/categories/women.svg" },
  { name: "Kids", slug: "kids", description: "Kids wear", sortOrder: 3, imageUrl: "/seed/categories/kids.svg" },
  { name: "Bracelets", slug: "bracelets", description: "Jewellery", sortOrder: 4, imageUrl: "/seed/categories/bracelets.svg" },
  { name: "Watches", slug: "watches", description: "Watches", sortOrder: 5, imageUrl: "/seed/categories/watches.svg" },
  { name: "Perfume", slug: "perfume", description: "Fragrances", sortOrder: 6, imageUrl: "/seed/categories/perfume.svg" },
  { name: "Bags", slug: "bags", description: "Bags", sortOrder: 7, imageUrl: "/seed/categories/bags.svg" },
];

const products: SeedProduct[] = [
  { slug: "classic-tee", name: "Classic Cotton Tee", description: "Everyday cotton tee.", categorySlug: "men", variants: [
    { sku: "TEE-M-BLK", size: "M", color: "Black", price: 850, stock: 20 },
    { sku: "TEE-L-BLK", size: "L", color: "Black", price: 850, stock: 15 },
    { sku: "TEE-M-WHT", size: "M", color: "White", price: 850, stock: 12 },
  ]},
  { slug: "slim-fit-shirt", name: "Slim Fit Shirt", description: "Office-ready slim fit.", categorySlug: "men", variants: [
    { sku: "SFS-M-BLU", size: "M", color: "Blue", price: 1450, stock: 10 },
    { sku: "SFS-L-BLU", size: "L", color: "Blue", price: 1450, stock: 8 },
  ]},
  { slug: "linen-panjabi", name: "Linen Panjabi", description: "Breathable festival panjabi.", categorySlug: "men", variants: [
    { sku: "PAN-M-CRM", size: "M", color: "Cream", price: 2200, stock: 6 },
    { sku: "PAN-L-CRM", size: "L", color: "Cream", price: 2200, stock: 4 },
  ]},
  { slug: "denim-jacket", name: "Denim Jacket", description: "Lightweight denim layer.", categorySlug: "men", variants: [
    { sku: "DNM-L-IND", size: "L", color: "Indigo", price: 3200, stock: 5 },
  ]},
  { slug: "floral-kurti", name: "Floral Kurti", description: "Soft printed kurti.", categorySlug: "women", variants: [
    { sku: "KUR-M-FLR", size: "M", color: "Pink", price: 1200, stock: 14 },
    { sku: "KUR-L-FLR", size: "L", color: "Pink", price: 1200, stock: 11 },
  ]},
  { slug: "cotton-saree", name: "Cotton Saree", description: "Daily wear saree.", categorySlug: "women", variants: [
    { sku: "SAR-FS-GRN", size: "Free", color: "Green", price: 2200, stock: 7 },
  ]},
  { slug: "kids-cotton-tee", name: "Kids Cotton Tee", description: "Soft tee for kids.", categorySlug: "kids", variants: [
    { sku: "KTEE-5-RED", size: "5Y", color: "Red", price: 500, stock: 25 },
    { sku: "KTEE-7-RED", size: "7Y", color: "Red", price: 500, stock: 18 },
  ]},
  { slug: "kids-denim-shorts", name: "Kids Denim Shorts", description: "Durable shorts.", categorySlug: "kids", variants: [
    { sku: "KDS-6-BLU", size: "6Y", color: "Blue", price: 650, stock: 16 },
  ]},
  { slug: "kids-hoodie", name: "Kids Hoodie", description: "Cozy hoodie.", categorySlug: "kids", variants: [
    { sku: "KHD-8-GRY", size: "8Y", color: "Gray", price: 950, stock: 9 },
  ]},
  { slug: "silver-bracelet", name: "Silver Chain Bracelet", description: "Silver-tone bracelet.", categorySlug: "bracelets", variants: [
    { sku: "BR-SLV-01", size: "Free", color: "Silver", price: 450, stock: 30 },
  ]},
  { slug: "beaded-bracelet", name: "Beaded Bracelet", description: "Colorful beads.", categorySlug: "bracelets", variants: [
    { sku: "BR-BED-01", size: "Free", color: "Multi", price: 300, stock: 40 },
  ]},
  { slug: "pearl-bracelet", name: "Pearl Bracelet", description: "Pearl finish bracelet.", categorySlug: "bracelets", variants: [
    { sku: "BR-PRL-01", size: "Free", color: "White", price: 550, stock: 3 },
  ]},
  { slug: "analog-watch", name: "Classic Analog Watch", description: "Leather strap watch.", categorySlug: "watches", variants: [
    { sku: "WCH-AN-BRN", size: "Free", color: "Brown", price: 2500, stock: 12 },
  ]},
  { slug: "sports-watch", name: "Digital Sports Watch", description: "Water resistant sports watch.", categorySlug: "watches", variants: [
    { sku: "WCH-SP-BLK", size: "Free", color: "Black", price: 1800, stock: 18 },
  ]},
  { slug: "minimal-watch", name: "Minimal Watch", description: "Minimal dial design.", categorySlug: "watches", variants: [
    { sku: "WCH-MN-SLV", size: "Free", color: "Silver", price: 2100, stock: 4 },
  ]},
  { slug: "ocean-perfume", name: "Ocean Breeze Perfume", description: "Fresh 100ml fragrance.", categorySlug: "perfume", variants: [
    { sku: "PF-OCE-100", size: "100ml", color: "Blue", price: 1500, stock: 22 },
  ]},
  { slug: "oud-perfume", name: "Royal Oud Perfume", description: "Rich oud 50ml.", categorySlug: "perfume", variants: [
    { sku: "PF-OUD-50", size: "50ml", color: "Gold", price: 2800, stock: 8 },
  ]},
  { slug: "citrus-perfume", name: "Citrus Bloom", description: "Citrus daily scent.", categorySlug: "perfume", variants: [
    { sku: "PF-CIT-50", size: "50ml", color: "Yellow", price: 1300, stock: 15 },
  ]},
  { slug: "canvas-backpack", name: "Canvas Backpack", description: "Spacious backpack.", categorySlug: "bags", variants: [
    { sku: "BAG-CNV-KHK", size: "Free", color: "Khaki", price: 1400, stock: 14 },
  ]},
  { slug: "leather-handbag", name: "Leather Handbag", description: "Multi-pocket handbag.", categorySlug: "bags", variants: [
    { sku: "BAG-LTH-TAN", size: "Free", color: "Tan", price: 3200, stock: 7 },
  ]},
  { slug: "tote-bag", name: "City Tote Bag", description: "Lightweight tote.", categorySlug: "bags", variants: [
    { sku: "BAG-TOT-BLK", size: "Free", color: "Black", price: 1100, stock: 20 },
  ]},
];

async function upsertCategory(cat: (typeof categories)[0]) {
  const existing = (await db.orm.public.Category.all()).find((c) => c.slug === cat.slug);
  if (existing) return existing;
  return db.orm.public.Category.create(cat);
}

async function upsertProduct(p: SeedProduct, categoryId: number) {
  const all = await db.orm.public.Product.all();
  let product = all.find((x) => x.slug === p.slug);
  if (!product) {
    product = await db.orm.public.Product.create({
      name: p.name,
      slug: p.slug,
      description: p.description,
      categoryId,
      isActive: true,
    });
  }

  const images = (await db.orm.public.ProductImage.all()).filter((i) => i.productId === product!.id);
  if (images.length === 0) {
    await db.orm.public.ProductImage.create({
      productId: product.id,
      url: `/seed/products/${p.slug}-1.svg`,
      sortOrder: 0,
      isPrimary: true,
    });
    await db.orm.public.ProductImage.create({
      productId: product.id,
      url: `/seed/products/${p.slug}-2.svg`,
      sortOrder: 1,
      isPrimary: false,
    });
  }

  const variants = (await db.orm.public.ProductVariant.all()).filter((v) => v.productId === product!.id);
  if (variants.length === 0) {
    for (const v of p.variants) {
      await db.orm.public.ProductVariant.create({
        productId: product.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: dec(v.price),
        stock: v.stock,
      });
    }
  }

  return product;
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@rns.local").toLowerCase();

  for (const cat of categories) {
    await upsertCategory(cat);
  }

  const categoryRows = await db.orm.public.Category.all();
  for (const p of products) {
    const cat = categoryRows.find((c) => c.slug === p.categorySlug);
    if (!cat) continue;
    await upsertProduct(p, cat.id);
  }

  const users = await db.orm.public.User.all();
  let admin = users.find((u) => u.email === adminEmail);
  if (!admin) {
    admin = await db.orm.public.User.create({
      name: "RNS Admin",
      email: adminEmail,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      phone: "01700000000",
    });
  }

  let demo = users.find((u) => u.email === "demo@rns.local");
  if (!demo) {
    demo = await db.orm.public.User.create({
      name: "Demo Shopper",
      email: "demo@rns.local",
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      phone: "01800000000",
    });
  }

  const addresses = await db.orm.public.Address.all();
  if (!addresses.some((a) => a.userId === demo!.id)) {
    await db.orm.public.Address.create({
      userId: demo!.id,
      label: "Home",
      line1: "12 Gulshan Avenue",
      city: "Dhaka",
      region: "Dhaka",
      postalCode: "1212",
      isDefault: true,
    });
    await db.orm.public.Address.create({
      userId: demo!.id,
      label: "Office",
      line1: "45 Banani Road",
      city: "Dhaka",
      region: "Dhaka",
      isDefault: false,
    });
  }

  const coupons = await db.orm.public.Coupon.all();
  if (!coupons.some((c) => c.code === "WELCOME10")) {
    await db.orm.public.Coupon.create({
      code: "WELCOME10",
      type: "PERCENT",
      value: dec(10),
      minSubtotal: dec(500),
      maxUses: 100,
      isActive: true,
    });
  }
  if (!coupons.some((c) => c.code === "FLAT200")) {
    await db.orm.public.Coupon.create({
      code: "FLAT200",
      type: "FIXED",
      value: dec(200),
      minSubtotal: dec(1500),
      maxUses: 50,
      isActive: true,
    });
  }
  if (!coupons.some((c) => c.code === "EXPIRED50")) {
    await db.orm.public.Coupon.create({
      code: "EXPIRED50",
      type: "FIXED",
      value: dec(50),
      isActive: true,
      expiresAt: new Date(Date.now() - 86400000).toISOString(),
    });
  }

  const banners = await db.orm.public.Banner.all();
  if (banners.length === 0) {
    await db.orm.public.Banner.create({
      title: "New Season Styles",
      subtitle: "Explore men, women, and kids collections",
      imageUrl: "/seed/banners/hero-1.svg",
      linkUrl: "/products",
      sortOrder: 0,
      isActive: true,
    });
    await db.orm.public.Banner.create({
      title: "Accessories Sale",
      subtitle: "Watches, bracelets, and bags",
      imageUrl: "/seed/banners/hero-2.svg",
      linkUrl: "/products?category=watches",
      sortOrder: 1,
      isActive: true,
    });
    await db.orm.public.Banner.create({
      title: "Fragrance Picks",
      subtitle: "Long-lasting perfumes",
      imageUrl: "/seed/banners/hero-3.svg",
      linkUrl: "/products?category=perfume",
      sortOrder: 2,
      isActive: true,
    });
  }

  const orders = await db.orm.public.Order.all();
  if (orders.length === 0) {
    const variants = await db.orm.public.ProductVariant.all();
    const tee = variants.find((v) => v.sku === "TEE-M-BLK");
    const watch = variants.find((v) => v.sku === "WCH-AN-BRN");
    const welcome = (await db.orm.public.Coupon.all()).find((c) => c.code === "WELCOME10");

    if (tee && watch) {
      const subtotal = Number(tee.price) * 2 + Number(watch.price);
      const discount = Math.round(subtotal * 0.1);
      const order = await db.orm.public.Order.create({
        userId: demo!.id,
        status: "Shipped",
        paymentMethod: "Cash on Delivery",
        subtotal: dec(subtotal),
        discountAmount: dec(discount),
        total: dec(subtotal - discount),
        deliveryAddress: "12 Gulshan Avenue, Dhaka",
        customerName: demo!.name,
        customerPhone: demo!.phone ?? "01800000000",
        customerEmail: demo!.email,
        couponId: welcome?.id ?? null,
        couponCode: welcome?.code ?? null,
      });
      await db.orm.public.OrderItem.create({
        orderId: order.id,
        variantId: tee.id,
        quantity: 2,
        unitPrice: dec(Number(tee.price)),
        productName: "Classic Cotton Tee",
        variantLabel: "M / Black",
      });
      await db.orm.public.OrderItem.create({
        orderId: order.id,
        variantId: watch.id,
        quantity: 1,
        unitPrice: dec(Number(watch.price)),
        productName: "Classic Analog Watch",
        variantLabel: "Free / Brown",
      });

      const guestVariant = variants.find((v) => v.sku === "BR-BED-01");
      if (guestVariant) {
        const guestSubtotal = Number(guestVariant.price) * 3;
        const guestOrder = await db.orm.public.Order.create({
          userId: null,
          status: "Processing",
          paymentMethod: "Cash on Delivery",
          subtotal: dec(guestSubtotal),
          discountAmount: dec(0),
          total: dec(guestSubtotal),
          deliveryAddress: "78 Mirpur Road, Dhaka",
          customerName: "Guest Customer",
          customerPhone: "01911111111",
          customerEmail: "guest@example.com",
          guestEmail: "guest@example.com",
          guestName: "Guest Customer",
          guestPhone: "01911111111",
        });
        await db.orm.public.OrderItem.create({
          orderId: guestOrder.id,
          variantId: guestVariant.id,
          quantity: 3,
          unitPrice: dec(Number(guestVariant.price)),
          productName: "Beaded Bracelet",
          variantLabel: "Free / Multi",
        });
      }
    }
  }

  console.log("\n=== RNS E-commerce seed complete ===");
  console.log("Store: http://localhost:3000");
  console.log(`Admin login: ${adminEmail} / ${ADMIN_PASSWORD}`);
  console.log(`Demo shopper: demo@rns.local / ${DEMO_PASSWORD}`);
  console.log("Coupons: WELCOME10 (10%), FLAT200, EXPIRED50 (expired test)");
  console.log("Guest order lookup: email guest@example.com with order id from DB\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
