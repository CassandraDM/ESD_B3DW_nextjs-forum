"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Button variant="ghost" className="text-lg font-bold">
            Forum
          </Button>
        </Link>
        <nav className="flex items-center gap-4">
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}

