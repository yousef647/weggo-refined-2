import "dotenv/config";
import { connectDB } from "../src/lib/db";
import Category from "../src/models/Category";

type Row = { parentSlug: string | null; slug: string; name: string; sortOrder: number };

const TAXONOMY: { slug: string; name: string; sortOrder: number; children: { slug: string; name: string }[] }[] = [
  {
    slug: "electronics",
    name: "Electronics",
    sortOrder: 10,
    children: [
      { slug: "phones", name: "Phones" },
      { slug: "laptops", name: "Laptops" },
      { slug: "tablets", name: "Tablets" },
      { slug: "audio", name: "Audio & headphones" },
      { slug: "cameras", name: "Cameras" },
      { slug: "gaming", name: "Gaming" },
      { slug: "wearables", name: "Wearables" },
      { slug: "accessories", name: "Accessories & cables" },
    ],
  },
  {
    slug: "furniture",
    name: "Furniture",
    sortOrder: 20,
    children: [
      { slug: "sofas", name: "Sofas & seating" },
      { slug: "tables-desks", name: "Tables & desks" },
      { slug: "beds", name: "Beds & mattresses" },
      { slug: "storage", name: "Storage & shelving" },
      { slug: "office", name: "Office furniture" },
      { slug: "outdoor", name: "Outdoor furniture" },
    ],
  },
  {
    slug: "fashion",
    name: "Fashion",
    sortOrder: 30,
    children: [
      { slug: "womens", name: "Women’s clothing" },
      { slug: "mens", name: "Men’s clothing" },
      { slug: "shoes", name: "Shoes" },
      { slug: "bags", name: "Bags & wallets" },
      { slug: "jewelry", name: "Jewelry & watches" },
      { slug: "kids-fashion", name: "Kids’ fashion" },
    ],
  },
  {
    slug: "home",
    name: "Home & kitchen",
    sortOrder: 40,
    children: [
      { slug: "kitchenware", name: "Kitchenware" },
      { slug: "appliances", name: "Small appliances" },
      { slug: "decor", name: "Decor & lighting" },
      { slug: "textiles", name: "Bedding & textiles" },
      { slug: "cleaning", name: "Cleaning supplies" },
    ],
  },
  {
    slug: "sports",
    name: "Sports & outdoors",
    sortOrder: 50,
    children: [
      { slug: "bikes", name: "Bikes" },
      { slug: "fitness", name: "Fitness" },
      { slug: "camping", name: "Camping & hiking" },
      { slug: "team-sports", name: "Team sports" },
      { slug: "winter", name: "Winter sports" },
    ],
  },
  {
    slug: "kids-baby",
    name: "Kids & baby",
    sortOrder: 60,
    children: [
      { slug: "strollers", name: "Strollers & carriers" },
      { slug: "toys", name: "Toys & games" },
      { slug: "baby-gear", name: "Baby gear" },
      { slug: "books", name: "Books for kids" },
    ],
  },
  {
    slug: "books-media",
    name: "Books & media",
    sortOrder: 70,
    children: [
      { slug: "fiction", name: "Fiction" },
      { slug: "nonfiction", name: "Non-fiction" },
      { slug: "textbooks", name: "Textbooks" },
      { slug: "vinyl-cds", name: "Vinyl, CDs & DVDs" },
    ],
  },
  {
    slug: "diy-tools",
    name: "DIY & tools",
    sortOrder: 80,
    children: [
      { slug: "power-tools", name: "Power tools" },
      { slug: "hand-tools", name: "Hand tools" },
      { slug: "garden", name: "Garden & outdoor power" },
      { slug: "materials", name: "Materials & hardware" },
    ],
  },
];

async function main() {
  await connectDB();
  const rows: Row[] = [];
  for (const p of TAXONOMY) {
    rows.push({ parentSlug: null, slug: p.slug, name: p.name, sortOrder: p.sortOrder });
    p.children.forEach((c, idx) => {
      rows.push({ parentSlug: p.slug, slug: c.slug, name: c.name, sortOrder: idx });
    });
  }
  await Category.deleteMany({});
  await Category.insertMany(rows);
  // eslint-disable-next-line no-console
  console.log(`Seeded ${rows.length} category rows.`);
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
