/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PriorityBreakdown {
  priority: number;
  pendingTasks: number;
  timeLapsed: number;
  timeToFinish: number;
}

interface TaskSummaryData {
  totalTasks: number;
  completionRate: number;
  pendingRate: number;
  avgTimePerTask: number;
  pendingTasks: number;
  totalTimeLapsed: number;
  totalTimeToFinish: number;
  priorityBreakdown: PriorityBreakdown[];
}

const TaskSummaryDashboard = () => {
  const [summaryData, setSummaryData] = useState<TaskSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/task-summary');
        const data = await response.json();
        setSummaryData(data);
      } catch (error) {
        console.error('Failed to fetch task summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!summaryData) {
    return <div className="flex items-center justify-center p-8">No data available</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{summaryData.totalTasks}</div>
            <div className="text-sm text-gray-500">Total tasks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{summaryData.completionRate}%</div>
            <div className="text-sm text-gray-500">Tasks completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{summaryData.pendingRate}%</div>
            <div className="text-sm text-gray-500">Tasks pending</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{summaryData.avgTimePerTask} hrs</div>
            <div className="text-sm text-gray-500">Average time per completed task</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending task summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{summaryData.pendingTasks}</div>
            <div className="text-sm text-gray-500">Pending tasks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{summaryData.totalTimeLapsed} hrs</div>
            <div className="text-sm text-gray-500">Total time lapsed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{summaryData.totalTimeToFinish} hrs</div>
            <div className="text-sm text-gray-500">Total time to finish</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task priority</TableHead>
                <TableHead>Pending tasks</TableHead>
                <TableHead>Time lapsed (hrs)</TableHead>
                <TableHead>Time to finish (hrs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.priorityBreakdown.map((row) => (
                <TableRow key={row.priority}>
                  <TableCell>{row.priority}</TableCell>
                  <TableCell>{row.pendingTasks}</TableCell>
                  <TableCell>{row.timeLapsed}</TableCell>
                  <TableCell>{row.timeToFinish}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskSummaryDashboard;