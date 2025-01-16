import { clsx, type ClassValue } from "clsx"
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function catchError(error : object){
  console.log("[ADD_TASK_POST]", error);
  console.log(
    "Error details:",
    error instanceof Error ? error.message : error
  );
  return NextResponse.json(
    {
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 }
  );
}