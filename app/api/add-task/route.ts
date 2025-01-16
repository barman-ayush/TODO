/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, priority, status, startTime, endTime } = body;
        const user = await currentUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!title || priority === undefined || !status || !startTime || !endTime) {
            return NextResponse.json({ 
                error: "Missing required fields",
                received: { title, priority, status, startTime, endTime }
            }, { status: 400 });
        }

        // Convert string dates to Date objects
        const parsedStartTime = new Date(startTime);
        const parsedEndTime = new Date(endTime);

        // Validate dates
        if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
            return NextResponse.json({ 
                error: "Invalid date format",
                received: { startTime, endTime }
            }, { status: 400 });
        }

        const task = await prismadb.task.create({
            data: {
                title,
                priority: Number(priority),
                status: status,
                startTime: parsedStartTime,
                endTime: parsedEndTime,
                userId: user.id
            }
        });

        return NextResponse.json(task, { status: 201 });

    } catch (error) {
        console.log("[ADD_TASK_POST]", error);
        // Log the actual error message for debugging
        console.log("Error details:", error instanceof Error ? error.message : error);
        return NextResponse.json({ 
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}