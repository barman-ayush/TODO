import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get all tasks for the user
        const tasks = await prismadb.task.findMany({
            where: { userId },
        });

        // Calculate basic metrics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Finished').length;
        const pendingTasks = totalTasks - completedTasks;

        // Calculate completion rates
        const completionRate = Math.round((completedTasks / totalTasks) * 100) || 0;
        const pendingRate = Math.round((pendingTasks / totalTasks) * 100) || 0;

        // Calculate average time per completed task
        const completedTasksTime = tasks
            .filter(task => task.status === 'Finished')
            .map(task => {
                const duration = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
                return duration / (1000 * 60 * 60); // Convert to hours
            });

        const avgTimePerTask = completedTasksTime.length
            ? Number((completedTasksTime.reduce((a, b) => a + b, 0) / completedTasksTime.length).toFixed(1))
            : 0;

        // Calculate time metrics for pending tasks
        const pendingTasksData = tasks
            .filter(task => task.status === 'Pending')
            .map(task => {
                const timeLapsed = (Date.now() - new Date(task.startTime).getTime()) / (1000 * 60 * 60);
                const timeToFinish = (new Date(task.endTime).getTime() - Date.now()) / (1000 * 60 * 60);
                return {
                    priority: task.priority,
                    timeLapsed: Math.max(0, Math.round(timeLapsed)),
                    timeToFinish: Math.max(0, Math.round(timeToFinish))
                };
            });

        // Calculate total time metrics
        const totalTimeLapsed = pendingTasksData.reduce((sum, task) => sum + task.timeLapsed, 0);
        const totalTimeToFinish = pendingTasksData.reduce((sum, task) => sum + task.timeToFinish, 0);

        // Generate priority breakdown
        const priorityBreakdown = [1, 2, 3, 4, 5].map(priority => {
            const priorityTasks = pendingTasksData.filter(task => task.priority === priority);
            return {
                priority,
                pendingTasks: priorityTasks.length,
                timeLapsed: priorityTasks.reduce((sum, task) => sum + task.timeLapsed, 0),
                timeToFinish: priorityTasks.reduce((sum, task) => sum + task.timeToFinish, 0)
            };
        });

        return NextResponse.json({
            totalTasks,
            completionRate,
            pendingRate,
            avgTimePerTask,
            pendingTasks,
            totalTimeLapsed,
            totalTimeToFinish,
            priorityBreakdown
        });

    } catch (error) {
        console.error("[TASK_SUMMARY]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}