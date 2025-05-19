import UserList from "../_components/UserList";

export const metadata = {
  title: "Users",
  description: "Manage Your All Users",
};

export default function User() {
  return (
    <div className="mb-20 p-6">
      <h1 className="mb-6 text-2xl font-bold">Users Management</h1>
      <UserList />
    </div>
  );
}
