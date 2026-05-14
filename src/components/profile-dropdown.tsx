"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";

interface ProfileDropdownProps {
  userName: string;
  email: string;
}

export function ProfileDropdown({ userName, email }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/80"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <ChevronDown className="h-4 w-4 transition" style={{ transform: isOpen ? "rotate(180deg)" : "" }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg">
          {/* User Info Header */}
          <div className="border-b border-border px-4 py-3">
            <p className="font-semibold text-foreground text-sm">{userName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            <Link
              href="/account/profile"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-muted transition"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
