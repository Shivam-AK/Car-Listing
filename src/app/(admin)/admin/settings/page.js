import SettingForm from "../_components/SettingForm";

export const metadata = {
  title: "Settings",
  description: "Manage Your Settings in Your Marketplace",
};

export default function Settings() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingForm />
    </section>
  );
}
