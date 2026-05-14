"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Star, UserCheck, Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  ratings?: Array<{
    rater: { name: string; profilePicture?: string };
    score: number;
    comment: string;
    createdAt: string;
  }>;
  followers?: Array<{ name: string; email: string }>;
  averageRating?: number;
  followersCount?: number;
  ratingsCount?: number;
  createdAt?: string;
};

type Listing = {
  _id: string;
  title: string;
  status: string;
  price: number;
  images: string[];
  createdAt: string;
};

export default function SellerProfilePage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [otherListings, setOtherListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSellerData() {
      try {
        const [sellerRes, listingsRes] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/users/${params.id}/listings`),
        ]);

        const sellerData = await sellerRes.json();
        const listingsData = await listingsRes.json();

        if (sellerRes.ok) {
          setSeller(sellerData.user);
          
          // Check if current user is following
          if (session?.user && sellerData.user.followers) {
            const isCurrentlyFollowing = sellerData.user.followers.some(
              (f: any) => f._id === session.user.id || f === session.user.id
            );
            setIsFollowing(isCurrentlyFollowing);
          }
          
          // Check if current user has already rated
          if (session?.user && sellerData.user.ratings) {
            const existingRating = sellerData.user.ratings.find(
              (r: any) => r.rater._id === session.user.id || r.rater === session.user.id
            );
            if (existingRating) {
              setUserRating(existingRating.score);
              setRating(existingRating.score);
              setComment(existingRating.comment);
            }
          }
        }

        if (listingsRes.ok) {
          setActiveListings(listingsData.activeListings ?? []);
          setOtherListings(listingsData.otherListings ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch seller data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSellerData();
  }, [params.id, session]);

  async function handleFollow() {
    try {
      const res = await fetch(`/api/users/${params.id}/follow`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSeller(data.user);
        setIsFollowing(data.following);
      }
    } catch (err) {
      console.error("Failed to follow:", err);
    }
  }

  async function handleSubmitRating() {
    if (!rating) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${params.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: rating,
          comment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSeller(data.user);
        setUserRating(rating);
        alert("Rating submitted successfully!");
        setComment("");
      }
    } catch (err) {
      console.error("Failed to submit rating:", err);
      alert("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading seller profile...</div>;
  }

  if (!seller) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Seller not found</p>
        <Link href="/browse" className="text-primary hover:underline">
          Back to Browse
        </Link>
      </div>
    );
  }

  const avgRating = parseFloat(String(seller.averageRating || 0));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/browse" className="rounded-full p-2 hover:bg-muted" title="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Seller Profile</h1>
      </div>

      {/* Seller Information Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Profile Picture */}
              {seller.profilePicture ? (
                <img
                  src={seller.profilePicture}
                  alt={seller.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                  {seller.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-foreground">{seller.name}</p>
                  {seller.role === "seller" && (
                    <UserCheck className="h-5 w-5 text-green-500" title="Verified Seller" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{seller.email}</p>
                {seller.location && <p className="text-sm text-muted-foreground">{seller.location}</p>}
                {seller.bio && <p className="mt-2 text-sm text-foreground">{seller.bio}</p>}
              </div>

              {/* Follow Button */}
              {session?.user?.id !== seller._id && (
                <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                  <Heart className={`h-4 w-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Followers</p>
              <p className="text-sm font-semibold text-foreground">{seller.followersCount || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Rating</p>
              <div className="flex items-center gap-1">
                {avgRating > 0 && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                <p className="text-sm font-semibold text-foreground">
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"} ({seller.ratingsCount || 0})
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Member Since</p>
              <p className="text-sm font-semibold text-foreground">
                {seller.createdAt
                  ? new Date(seller.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Seller Section */}
      {session?.user?.id !== seller._id && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-bold tracking-tight mb-4">
            {userRating ? "Update your rating" : "Rate this seller"}
          </h2>
          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Your rating:</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="ml-2 text-sm font-semibold text-foreground">{rating}/5</span>}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Comment (optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this seller..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitRating}
              disabled={submitting || !rating}
              className="w-full"
            >
              {submitting ? "Submitting..." : userRating ? "Update Rating" : "Submit Rating"}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {seller.ratings && seller.ratings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Reviews ({seller.ratingsCount})</h2>
          <div className="space-y-3">
            {seller.ratings.map((rating, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {rating.rater.profilePicture ? (
                      <img
                        src={rating.rater.profilePicture}
                        alt={rating.rater.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {rating.rater.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{rating.rater.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating.score ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
        

      {/* Listings Section */}
      <div className="space-y-8">
        {/* Active Listings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Current Listings ({activeListings.length})
          </h2>
          {activeListings.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-muted-foreground">No active listings</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeListings.map((listing) => (
                <Link
                  key={listing._id}
                  href={`/listings/${listing._id}`}
                  className="group rounded-lg border border-border bg-card overflow-hidden transition hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square bg-muted overflow-hidden">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="inline-block rounded-full bg-green-500/80 px-2 py-1 text-xs font-medium text-white">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <p className="line-clamp-2 font-medium text-foreground text-sm">{listing.title}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="font-semibold text-primary text-lg">${listing.price}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(listing.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sold/Other Listings History */}
        {otherListings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Listing History ({otherListings.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherListings.map((listing) => (
                <Link
                  key={listing._id}
                  href={`/listings/${listing._id}`}
                  className="group rounded-lg border border-border bg-card overflow-hidden transition hover:shadow-lg opacity-75 hover:opacity-100"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square bg-muted overflow-hidden">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="inline-block rounded-full bg-muted/80 px-2 py-1 text-xs font-medium text-foreground capitalize">
                        {listing.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <p className="line-clamp-2 font-medium text-foreground text-sm">{listing.title}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="font-semibold text-primary text-lg">${listing.price}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(listing.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>        </div>
                {rating.comment && <p className="mt-2 text-sm text-foreground">{rating.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Reviews Message */}
      {(!seller.ratings || seller.ratings.length === 0) && session?.user?.id !== seller._id && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">No reviews yet. Be the first to rate this seller!</p>
        </div>
      )}
    </div>
  );
}
