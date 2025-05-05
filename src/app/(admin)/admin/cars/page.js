import React from "react";
import CarList from "../_components/CarList";

export const metadata = {
  title: "Cars",
  description: "Manage Your Cars in Your Marketplace",
};

export default function Cars() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Management</h1>
      <CarList />
    </div>
  );
}
