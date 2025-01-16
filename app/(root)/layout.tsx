import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import React, { Fragment } from "react";
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Fragment>
      <div className="h-full bg-cover bg-center">
        <Navbar />
        <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0">
          <Sidebar />
        </div>
        <main className="md:pl-20 pt-16 h-full">{children}</main>
      </div>
    </Fragment>
  );
};
export default RootLayout;
