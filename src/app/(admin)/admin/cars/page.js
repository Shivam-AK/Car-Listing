import React from "react";
import CarList from "../_components/CarList";

export const metadata = {
  title: "Cars",
  description: "Manage Your Cars in Your Marketplace",
};

export default function Cars() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Cars Management</h1>
      <CarList />
    </div>
  );
}
