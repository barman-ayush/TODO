/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast"; 
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { EditTaskDialog } from "./edit-task";
import axios from "axios";
import { useRouter } from "next/navigation";

export type Task = {
  id: number;
  title: string;
  priority: number;
  status: string;
  startTime: string;
  endTime: string;
};

const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={`capitalize ${
          row.getValue("status") === "finished"
            ? "text-green-600"
            : "text-yellow-600"
        }`}
      >
        {row.getValue("status")}
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("startTime"));
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("endTime"));
      return date.toLocaleString();
    },
  },
  {
    id: "edit",
    header: "Actions",
    enableSorting: false,
  },
];

export function TaskTable( ) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null);
  const [timeSort, setTimeSort] = React.useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`/api/get-task`);
        setTasks(response.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  } , []);

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (taskId: number, updatedTask: Partial<Task>) => {
    try {
      const response = await axios.patch(`/api/add-task/${taskId}`, {
        title: updatedTask.title,
        priority: updatedTask.priority,
        status: updatedTask.status,
        startTime: updatedTask.startTime,
        endTime: updatedTask.endTime,
      });

      if (response.status === 200) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, ...response.data } : task
          )
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task");
    }finally{
      router.refresh();
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setIsDeleting(true);
      
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const selectedTaskIds = selectedRows.map(row => row.original.id);
      
      if (selectedTaskIds.length === 0) {
        toast.error("No tasks selected");
        return;
      }

      const response = await axios.post('/api/delete', {
        taskIds: selectedTaskIds
      });

      if (response.status === 200) {
        setTasks(prevTasks => 
          prevTasks.filter(task => !selectedTaskIds.includes(task.id))
        );
        
        setRowSelection({});
        toast.success(`Successfully deleted ${selectedTaskIds.length} tasks`);
      }
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast.error('Failed to delete tasks');
    } finally {
      setIsDeleting(false);
      router.refresh()
    }
  };

  const priorities = React.useMemo(() => {
    if (!tasks.length) return { min: 0, max: 0 };
    const priorityValues = tasks.map((task) => task.priority);
    return {
      min: Math.min(...priorityValues),
      max: Math.max(...priorityValues),
    };
  }, [tasks]);

  function resetFilters() {
    setFilterStatus(null);
    setTimeSort(null);
    setPriorityFilter(null);
    table.getColumn("title")?.setFilterValue("");
  }

  const sortedData = React.useMemo(() => {
    if (!tasks.length) return [];
    const result = [...tasks];

    if (timeSort) {
      result.sort((a, b) => {
        const dateA = new Date(
          a[timeSort.includes("start") ? "startTime" : "endTime"]
        );
        const dateB = new Date(
          b[timeSort.includes("start") ? "startTime" : "endTime"]
        );
        return timeSort.includes("asc")
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
    }

    return result;
  }, [tasks, timeSort]);

  const filteredData = React.useMemo(() => {
    let filtered = sortedData;

    if (filterStatus) {
      filtered = filtered.filter(
        (task) => task.status.toLowerCase() === filterStatus
      );
    }

    if (priorityFilter !== null) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    return filtered;
  }, [sortedData, filterStatus, priorityFilter]);

  const columnsWithEdit = React.useMemo(
    () =>
      columns.map((col) => {
        if (col.id === "edit") {
          return {
            ...col,
            cell: ({ row }: { row: any }) => (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(row.original)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ),
          };
        }
        return col;
      }),
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns: columnsWithEdit,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnVisibility, rowSelection },
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">No tasks found</p>
        <p className="text-sm text-muted-foreground">
          You haven't created any tasks yet. Create your first task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort by Time <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sort by Time</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={timeSort!} onValueChange={setTimeSort}>
              <DropdownMenuRadioItem value="start_asc">Start Time (Ascending)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="start_desc">Start Time (Descending)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="end_asc">End Time (Ascending)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="end_desc">End Time (Descending)</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTimeSort(null)}>Reset Time Sort</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filter by Priority <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Priority Level</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={priorityFilter?.toString() || ""}
              onValueChange={(value) => setPriorityFilter(value ? parseInt(value) : null)}
            >
              {Array.from(
                { length: priorities.max - priorities.min + 1 },
                (_, i) => (
                  <DropdownMenuRadioItem key={i} value={(priorities.min + i).toString()}>
                    Priority {priorities.min + i}
                  </DropdownMenuRadioItem>
                )
              )}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPriorityFilter(null)}>
              Reset Priority Filter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filter by Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={filterStatus!} onValueChange={setFilterStatus}>
              <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="finished">Finished</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>
              Reset Status Filter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="secondary" onClick={resetFilters} className="ml-auto">
          Reset All Filters
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="mr-2"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
            {isDeleting && "..."}
          </Button>
        )}

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}