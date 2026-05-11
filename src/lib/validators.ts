import { z } from "zod";
import { LISTING_CONDITIONS, LISTING_STATUSES } from "@/models/Listing";

export const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const listingCreateSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(8000),
  condition: z.enum(LISTING_CONDITIONS),
  categorySlug: z.string().min(1),
  subcategorySlug: z.string().min(1),
  location: z.string().min(1).max(120),
  price: z.coerce.number().min(0).max(1_000_000_000),
  images: z
    .array(
      z.string().refine(
        (s) => s.startsWith("/uploads/") || /^https?:\/\//.test(s),
        "Invalid image URL"
      )
    )
    .max(12)
    .default([]),
});

export const listingUpdateSchema = listingCreateSchema.partial().extend({
  status: z.enum(LISTING_STATUSES).optional(),
});

export const messageBodySchema = z.object({
  body: z.string().min(1).max(8000),
});

export const conversationCreateSchema = z.object({
  listingId: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const browseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
  categorySlug: z.string().optional(),
  subcategorySlug: z.string().optional(),
  condition: z.enum(LISTING_CONDITIONS).optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "relevance"]).default("newest"),
  q: z.string().max(200).optional(),
});
