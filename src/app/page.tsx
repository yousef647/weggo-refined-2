import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

const QUICK_CATEGORIES = [
  { label: "Electronics", href: "/browse?categorySlug=electronics" },
  { label: "Furniture", href: "/browse?categorySlug=furniture" },
  { label: "Fashion", href: "/browse?categorySlug=fashion" },
  { label: "Sports", href: "/browse?categorySlug=sports" },
  { label: "Books", href: "/browse?categorySlug=books-media" },
  { label: "Kids & baby", href: "/browse?categorySlug=kids-baby" },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-14 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
            Neighbourhood deals, less waste
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Give great stuff a second life on <span className="text-primary">weggo</span>
          </h1>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Browse curated second-hand listings, message sellers safely in context, and save favourites to your wishlist.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8 shadow-md">
              <Link href="/browse" className="inline-flex items-center gap-2">
                Start browsing
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full border-border/80 bg-card/80 px-6 backdrop-blur">
              <Link href="/sell/new">Sell an item</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Shop by category</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-full border border-border/80 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-muted/50"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <ShieldCheck className="mb-3 h-8 w-8 text-primary" aria-hidden />
          <h3 className="font-semibold text-foreground">Trust the basics</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Clear condition labels, seller profiles, and admin moderation when something looks off.
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <MessageCircle className="mb-3 h-8 w-8 text-primary" aria-hidden />
          <h3 className="font-semibold text-foreground">Message in-thread</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Conversations stay tied to the listing so both sides know what you are talking about.
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <Sparkles className="mb-3 h-8 w-8 text-primary" aria-hidden />
          <h3 className="font-semibold text-foreground">Wishlist that sticks</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Save items while you decide — your wishlist syncs to your account across devices.
          </p>
        </div>
      </section>
    </div>
  );
}
