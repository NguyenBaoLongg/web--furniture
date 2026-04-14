import React from "react";
import { Outlet } from "react-router-dom";
import { StaffSidebar } from "./StaffSidebar";

export const StaffLayout = () => {
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#fafafa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
