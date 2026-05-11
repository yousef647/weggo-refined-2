import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import User from "../src/models/User";
import Listing from "../src/models/Listing";

const DEMO_PREFIX = "[demo] ";

type Row = {
  title: string;
  description: string;
  price: number;
  condition: "new" | "like_new" | "good" | "fair" | "for_parts";
  categorySlug: string;
  subcategorySlug: string;
  location: string;
  images: string[];
};

const ROWS: Row[] = [
  {
    title: "iPhone 13 — unlocked",
    description: "Well cared for, battery health 88%. Includes original box and cable. No scratches on screen.",
    price: 420,
    condition: "good",
    categorySlug: "electronics",
    subcategorySlug: "phones",
    location: "Portland, OR",
    images: ["https://picsum.photos/seed/weggo-phone1/900/700", "https://picsum.photos/seed/weggo-phone2/900/700"],
  },
  {
    title: "MacBook Air M1, 8GB / 256GB",
    description: "Used for school only. Minor wear on keys. Charger included. Reset and ready to set up.",
    price: 650,
    condition: "like_new",
    categorySlug: "electronics",
    subcategorySlug: "laptops",
    location: "Austin, TX",
    images: ["https://picsum.photos/seed/weggo-laptop1/900/700"],
  },
  {
    title: "Sony WH-1000XM4 headphones",
    description: "Great noise cancelling. Ear cushions replaced last year. Travel case included.",
    price: 175,
    condition: "good",
    categorySlug: "electronics",
    subcategorySlug: "audio",
    location: "Chicago, IL",
    images: ["https://picsum.photos/seed/weggo-audio1/900/700"],
  },
  {
    title: "Mid-century coffee table",
    description: "Solid wood, some sun fading on one corner. Very sturdy. Moving sale.",
    price: 95,
    condition: "fair",
    categorySlug: "furniture",
    subcategorySlug: "tables-desks",
    location: "Seattle, WA",
    images: ["https://picsum.photos/seed/weggo-table1/900/700"],
  },
  {
    title: "IKEA KALLAX 4x4 + bins",
    description: "Disassembled for pickup. All hardware bagged and labeled. Smoke-free home.",
    price: 110,
    condition: "good",
    categorySlug: "furniture",
    subcategorySlug: "storage",
    location: "Denver, CO",
    images: ["https://picsum.photos/seed/weggo-kallax1/900/700"],
  },
  {
    title: "Patagonia down jacket (men’s M)",
    description: "Worn a handful of winters. Washed with down-safe detergent. No tears.",
    price: 140,
    condition: "like_new",
    categorySlug: "fashion",
    subcategorySlug: "mens",
    location: "Boston, MA",
    images: ["https://picsum.photos/seed/weggo-jacket1/900/700"],
  },
  {
    title: "Vintage leather boots (women’s 8)",
    description: "Resoled once. Character patina. Fits true to size.",
    price: 85,
    condition: "good",
    categorySlug: "fashion",
    subcategorySlug: "shoes",
    location: "Nashville, TN",
    images: ["https://picsum.photos/seed/weggo-boots1/900/700"],
  },
  {
    title: "KitchenAid Artisan stand mixer",
    description: "Includes whisk, paddle, dough hook, and pouring shield. Works perfectly.",
    price: 220,
    condition: "good",
    categorySlug: "home",
    subcategorySlug: "kitchenware",
    location: "Phoenix, AZ",
    images: ["https://picsum.photos/seed/weggo-mixer1/900/700"],
  },
  {
    title: "Trek hybrid bike (medium frame)",
    description: "Recently tuned at local shop. New tires. Great for city commuting.",
    price: 380,
    condition: "good",
    categorySlug: "sports",
    subcategorySlug: "bikes",
    location: "Minneapolis, MN",
    images: ["https://picsum.photos/seed/weggo-bike1/900/700", "https://picsum.photos/seed/weggo-bike2/900/700"],
  },
  {
    title: "Kids LEGO bins (mixed sets)",
    description: "Sorted roughly by color. Some manuals included. Perfect starter lot.",
    price: 45,
    condition: "fair",
    categorySlug: "kids-baby",
    subcategorySlug: "toys",
    location: "Atlanta, GA",
    images: ["https://picsum.photos/seed/weggo-lego1/900/700"],
  },
  {
    title: "Paperback fiction bundle (12 books)",
    description: "Popular titles from the last decade. Good reading copies, some spine creases.",
    price: 24,
    condition: "good",
    categorySlug: "books-media",
    subcategorySlug: "fiction",
    location: "Philadelphia, PA",
    images: ["https://picsum.photos/seed/weggo-books1/900/700"],
  },
  {
    title: "DeWalt 20V drill/driver kit",
    description: "Two batteries, charger, and contractor bag. Light DIY use only.",
    price: 130,
    condition: "like_new",
    categorySlug: "diy-tools",
    subcategorySlug: "power-tools",
    location: "Detroit, MI",
    images: ["https://picsum.photos/seed/weggo-dewalt1/900/700"],
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("seed:listings is intended for local development only.");
  }
  await connectDB();

  let seller =
    (await User.findOne({ role: "seller" }).sort({ createdAt: 1 })) ||
    (await User.findOne({ role: "admin" }).sort({ createdAt: 1 }));

  if (!seller) {
    seller = await User.create({
      email: "mockseller@weggo.local",
      passwordHash: await bcrypt.hash("Mock12345!", 12),
      name: "Demo Seller",
      role: "seller",
      banned: false,
    });
    // eslint-disable-next-line no-console
    console.log("Created mockseller@weggo.local / Mock12345! (change in real use)");
  }

  const deleted = await Listing.deleteMany({ title: /^\[demo\] / });
  // eslint-disable-next-line no-console
  if (deleted.deletedCount) console.log(`Removed ${deleted.deletedCount} old demo listings.`);

  await Listing.insertMany(
    ROWS.map((r) => ({
      seller: seller!._id,
      title: `${DEMO_PREFIX}${r.title}`,
      description: r.description,
      price: r.price,
      condition: r.condition,
      categorySlug: r.categorySlug,
      subcategorySlug: r.subcategorySlug,
      location: r.location,
      images: r.images,
      status: "active" as const,
    }))
  );

  // eslint-disable-next-line no-console
  console.log(`Inserted ${ROWS.length} demo listings for seller ${seller!.email}.`);
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
