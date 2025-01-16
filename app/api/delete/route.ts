import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const taskIds = body?.taskIds;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return new NextResponse("Task IDs are required", { status: 400 });
    }

    // Verify all tasks belong to the user
    const tasks = await prismadb.task.findMany({
      where: {
        id: { 
          in: taskIds 
        },
        userId: userId
      }
    });

    if (tasks.length !== taskIds.length) {
      return new NextResponse("Unauthorized: Some tasks don't belong to the user", { status: 403 });
    }

    // If verification passes, delete the tasks
    const deletedTasks = await prismadb.task.deleteMany({
      where: {
        id: { 
          in: taskIds
        },
        userId: userId
      }
    });

    return NextResponse.json(deletedTasks);
    
  } catch (error) {
    console.log("[TASK_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}