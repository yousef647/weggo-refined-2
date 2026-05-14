"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Edit2, ArrowLeft, Upload, Save, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Listing = {
  _id: string;
  title: string;
  status: string;
  price: number;
  images: string[];
  createdAt: string;
};

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
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "", location: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, listingsRes] = await Promise.all([
          fetch("/api/users/" + user?.id),
          fetch("/api/me/listings"),
        ]);

        const userData = await userRes.json();
        const listingsData = await listingsRes.json();

        if (userRes.ok) {
          setProfileData(userData.user);
          setEditData({
            name: userData.user.name || "",
            bio: userData.user.bio || "",
            location: userData.user.location || "",
          });
        }

        if (listingsRes.ok) {
          setListings(listingsData.listings ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated" && user) {
      fetchData();
    }
  }, [status, user]);

  async function handleProfileUpdate() {
    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData(data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  }

  async function handleProfilePictureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/me/profile-picture", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData(data.user);
      }
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
    } finally {
      setUploading(false);
    }
  }

  if (status === "loading" || !user || !profileData) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  const avgRating = parseFloat(String(profileData.averageRating || 0));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-muted"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      {/* User Information Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Profile Picture */}
              <div className="relative">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt={profileData.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                    {profileData.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 rounded-full bg-muted p-2 hover:bg-muted/80 disabled:opacity-50"
                  title="Upload profile picture"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              {isEditing ? (
                <div className="flex-1 space-y-3">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Name"
                    className="text-lg font-semibold"
                  />
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="Location"
                  />
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Bio"
                    className="resize-none"
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-semibold text-foreground">{profileData.name}</p>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  {profileData.location && <p className="text-sm text-muted-foreground">{profileData.location}</p>}
                  {profileData.bio && <p className="mt-2 text-sm text-foreground">{profileData.bio}</p>}
                </div>
              )}
            </div>

            {/* Edit/Save Button */}
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleProfileUpdate} variant="default" size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Role</p>
              <p className="text-sm font-semibold text-foreground capitalize">{profileData.role}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Listings</p>
              <p className="text-sm font-semibold text-foreground">{listings.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Followers</p>
              <p className="text-sm font-semibold text-foreground">{profileData.followersCount || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Rating</p>
              <div className="flex items-center gap-1">
                {avgRating > 0 && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                <p className="text-sm font-semibold text-foreground">
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"} ({profileData.ratingsCount || 0})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      {profileData.ratings && profileData.ratings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
          <div className="space-y-3">
            {profileData.ratings.map((rating, idx) => (
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
                </div>
                {rating.comment && <p className="mt-2 text-sm text-foreground">{rating.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">My Listings</h2>
          {(profileData.role === "seller" || profileData.role === "admin") && (
            <Link
              href="/sell/new"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              + Create New Listing
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading listings...</p>
        ) : listings.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">You haven't created any listings yet.</p>
            {(profileData.role === "seller" || profileData.role === "admin") && (
              <Link
                href="/sell/new"
                className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Create your first listing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing._id}
                href={`/sell/${listing._id}/edit`}
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
                    <span className="inline-block rounded-full bg-background/80 backdrop-blur px-2 py-1 text-xs font-medium capitalize text-foreground">
                      {listing.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <p className="line-clamp-2 font-medium text-foreground text-sm">{listing.title}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="font-semibold text-primary text-lg">${listing.price}</p>
                    <Edit2 className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
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
    </div>
  );
}
