
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    console.log("here")
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const taskId = (await params).taskId;
    console.log(taskId)
    if (!taskId) {
      return new NextResponse("Task ID is required", { status: 400 });
    }

    const body = await req.json();
    const { title, priority, status, startTime, endTime } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const task = await prismadb.task.update({
      where: {
        id: taskId, // Convert string taskId to number
        userId,
      },
      data: {
        title,
        priority,
        status,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
      },
    });

    return NextResponse.json(task);
    
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}