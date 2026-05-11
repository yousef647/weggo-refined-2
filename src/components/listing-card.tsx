import Link from "next/link";
import Image from "next/image";
import { formatPrice, CONDITION_LABELS } from "@/lib/format";

export type ListingCardData = {
  _id: string;
  title: string;
  price: number;
  condition: string;
  images?: string[];
  location?: string;
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const img = listing.images?.[0];
  const displayTitle = listing.title.replace(/^\[demo\]\s*/i, "");

  return (
    <Link
      href={`/listings/${listing._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/90 bg-card shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        {img ? (
          <>
            <Image
              src={img}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No photo</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur">
          {CONDITION_LABELS[listing.condition] ?? listing.condition}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {displayTitle}
        </p>
        <p className="text-lg font-bold tracking-tight text-foreground">{formatPrice(listing.price)}</p>
        {listing.location ? (
          <p className="mt-auto text-xs text-muted-foreground">{listing.location}</p>
        ) : (
          <span className="mt-auto" />
        )}
      </div>
    </Link>
  );
}
