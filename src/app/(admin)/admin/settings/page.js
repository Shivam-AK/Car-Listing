import React from "react";
import SettingForm from "../_components/SettingForm";

export const metadata = {
  title: "Settings",
  description: "Manage Your Settings in Your Marketplace",
};

export default function Settings() {
  return (
    <div className="mb-20 p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingForm />
    </div>
  );
}
