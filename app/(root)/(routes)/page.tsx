/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TaskSummaryDashboard from "@/components/dashboatd";
import { Fragment } from "react";
const RootPage = () => {
  return (
    <Fragment>
      <div className="h-full p-4 space-y-2 mx-8">
        <h1
          className={
            "hidden md:block text-xl md:text-3xl font-bold text-primary"
          }
        >
         Dashboard
        </h1>
        <TaskSummaryDashboard/>
      </div>
    </Fragment>
  );
};
export default RootPage;
