"use client";

import { Sparkles } from "lucide-react";
import React from "react";
import Link from "next/link";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";



import { cn } from "@/lib/utils";
import MobileSidebar from "./mobile-sidebar";
import { ModeToggle } from "./mode-toggle";


interface NavbarProps {
  isPro: boolean;
}

export default function Navbar() {

  return (
    <div
      className="fixed w-full z-50 flex justify-between items-center py-2 px-4 h-16 border-b border-primary/10 "
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="flex items-center">
        <MobileSidebar/>
        <Link href="/" className="flex flex-row  items-center">
          <img style={{width : "10%"}} src={"/logo.png"} />
          <h1
            className={cn(
              "hidden md:block text-xl md:text-3xl font-bold text-primary"
            )}
          >
            Organize.io
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <ModeToggle/>
      </div>
    </div>
  );
}