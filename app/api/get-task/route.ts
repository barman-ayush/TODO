/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import prismadb from "@/lib/prismadb";
import { catchError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req:Request) {
    try{
        console.log("HIT")
        const userId = (await auth())?.userId;
        if(!userId) return new NextResponse("Unauthorized" , {status : 401});
        const response = await prismadb.task.findMany();
        console.log(response);
        return NextResponse.json(response , {status : 200})
    }catch(e  :any){
        catchError(e);
    }
}