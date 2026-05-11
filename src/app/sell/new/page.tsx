import { ListingForm } from "@/components/listing-form";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create listing</h1>
        <p className="text-sm text-muted-foreground">Upload photos, set a fair price, and describe the item honestly.</p>
      </div>
      <ListingForm mode="create" />
    </div>
  );
}
