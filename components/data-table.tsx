"use client";

import * as React from "react";
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

const data: Task[] = [
  {
    id: 1,
    title: "Buy clothes",
    priority: 5,
    status: "Pending",
    startTime: "26-Nov-24 11:00 AM",
    endTime: "30-Nov-24 11:00 AM",
    totalTime: 96,
  },
  {
    id: 2,
    title: "Finish code",
    priority: 2,
    status: "Finished",
    startTime: "25-Nov-24 09:05 AM",
    endTime: "25-Nov-24 03:15 PM",
    totalTime: 6.17,
  },
  {
    id: 3,
    title: "Book travel tickets",
    priority: 4,
    status: "Pending",
    startTime: "19-Nov-24 10:00 PM",
    endTime: "20-Nov-24 11:00 PM",
    totalTime: 25,
  },
  {
    id: 4,
    title: "Order groceries",
    priority: 3,
    status: "Finished",
    startTime: "14-Oct-24 10:30 AM",
    endTime: "16-Oct-24 10:30 PM",
    totalTime: 60,
  },
  {
    id: 5,
    title: "Medical checkup",
    priority: 1,
    status: "Pending",
    startTime: "19-Nov-24 01:15 PM",
    endTime: "21-Dec-24 05:00 PM",
    totalTime: 51.75,
  },
];

export type Task = {
  id: number;
  title: string;
  priority: number;
  status: "Pending" | "Finished";
  startTime: string;
  endTime: string;
  totalTime: number;
};

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    accessorKey: "id",
    header: "Task ID",
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Priority <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={
          row.getValue("status") === "Finished"
            ? "text-green-600"
            : "text-yellow-600"
        }
      >
        {row.getValue("status")}
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
  },
  {
    accessorKey: "endTime",
    header: "End Time",
  },
  {
    accessorKey: "totalTime",
    header: "Total time to finish (hrs)",
    cell: ({ row }) => <div>{row.getValue("totalTime")}</div>,
  },
  {
    id: "edit",
    header: "Edit",
    cell: () => (
      <Button variant="ghost" size="icon">
        <Pencil className="h-4 w-4" />
      </Button>
    ),
  },
];

export function TaskTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [filterStatus, setFilterStatus] = React.useState<string | null>(null);
    const [timeSort, setTimeSort] = React.useState<string | null>(null);
    const [priorityFilter, setPriorityFilter] = React.useState<number | null>(null);
    
    // Add new states for edit functionality
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [tasks, setTasks] = React.useState<Task[]>(data);
  
    // Handle edit button click
    const handleEditClick = (task: Task) => {
      setSelectedTask(task);
      setIsEditModalOpen(true);
    };
  
    // Handle task update
    const handleUpdateTask = (taskId: number, updatedTask: Partial<Task>) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, ...updatedTask }
            : task
        )
      );
    };
  
    // Get min and max priority from data
    const priorities = React.useMemo(() => {
      const priorityValues = tasks.map((task) => task.priority);
      return {
        min: Math.min(...priorityValues),
        max: Math.max(...priorityValues),
      };
    }, [tasks]);
  
    // Reset all filters function
    function resetFilters() {
      setFilterStatus(null);
      setTimeSort(null);
      setPriorityFilter(null);
      table.getColumn("title")?.setFilterValue("");
    }
  
    // Apply time-based sorting
    const sortedData = React.useMemo(() => {
      let result = [...tasks];
  
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
  
    // Apply all filters
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
  
    // Modify columns to include edit functionality
    const columnsWithEdit = React.useMemo(
      () =>
        columns.map((col) => {
          if (col.id === 'edit') {
            return {
              ...col,
              cell: ({ row } : {row : any}) => (
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
                <DropdownMenuRadioItem value="start_asc">
                  Start Time (Ascending)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="start_desc">
                  Start Time (Descending)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="end_asc">
                  End Time (Ascending)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="end_desc">
                  End Time (Descending)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTimeSort(null)}>
                Reset Time Sort
              </DropdownMenuItem>
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
                onValueChange={(value) =>
                  setPriorityFilter(value ? parseInt(value) : null)
                }
              >
                {Array.from(
                  { length: priorities.max - priorities.min + 1 },
                  (_, i) => (
                    <DropdownMenuRadioItem
                      key={i}
                      value={(priorities.min + i).toString()}
                    >
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
              <DropdownMenuRadioGroup
                value={filterStatus!}
                onValueChange={setFilterStatus}
              >
                <DropdownMenuRadioItem value="pending">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="finished">
                  Finished
                </DropdownMenuRadioItem>
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
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
  
        {/* Add Edit Dialog */}
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