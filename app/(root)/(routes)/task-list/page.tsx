/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AddTaskDialog } from "@/components/add-task";
import { TaskTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import axios from "axios"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TaskList = () => {
  const handleAddTask =async (newTask: object) => {
    try{
      console.log("New task:", newTask);
      const response = await axios.post("/api/add-task" , newTask);
      console.log(response)
    }catch(e){
      console.log(e);
    }
    // Here you would typically update your state or make an API call
    // Update your task list accordingly
  };

  return (
    <Fragment>
      <div className="h-full p-4 space-y-2 mx-8">
        <h1 className="hidden md:block text-xl md:text-3xl font-bold text-primary">
          Task List
        </h1>
        <div className="w-full p-4 flex flex-row justify-between items-center">
          <div className="flex flex-row items-center justify-center">
            <AddTaskDialog onAddTask={handleAddTask} />
            <Button variant="outline" className="mx-2">
              Delete Selected
            </Button>
          </div>
        </div>
        <TaskTable />
      </div>
    </Fragment>
  );
};

export default TaskList;