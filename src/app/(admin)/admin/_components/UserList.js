"use client";

import { getUsers, updateUserRole } from "@/actions/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/useFetch";
import {
  Loader2,
  MoreHorizontal,
  Search,
  SquarePen,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const getRoleBadge = (status) => {
  const badgeStatus = {
    ADMIN: <Badge className="bg-green-100 text-green-800">Admin</Badge>,
    DEALERSHIP: <Badge className="bg-blue-100 text-blue-800">Dealership</Badge>,
    USER: <Badge className="bg-purple-100 text-purple-800">User</Badge>,
  };

  return badgeStatus[status] ?? <Badge variant="outline">{status}</Badge>;
};

export default function UserList() {
  const [userSearch, setUserSearch] = useState("");

  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: usersData,
    error: usersError,
  } = useFetch(getUsers);

  const {
    loading: updatingRole,
    fn: updateRoleFn,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (updateRoleResult?.success) {
      fetchUsers();
      toast.success("User Role Updated Successfully.");
    }
  }, [updateRoleResult]);

  useEffect(() => {
    if (usersError) {
      toast.error("Failed to load users");
    }

    if (updateRoleError) {
      toast.error(`Failed to update user role: ${updateRoleError.message}`);
    }
  }, [usersError, updateRoleError]);

  const filteredUsers = usersData?.success
    ? usersData.data.filter(
        (user) =>
          user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.name.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  const handleRoleUpdate = async (user, newRole) => {
    const userData = { role: newRole };
    await updateRoleFn(user.id, userData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All User</CardTitle>
        <CardDescription>Manage users with admin privileges.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute top-2.5 left-2.5 size-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search User..."
            className="pl-9"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>

        {fetchingUsers ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : usersData?.success && filteredUsers.length > 0 ? (
          <div>
            <Table>
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.name || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users className="size-4 text-gray-500" />
                          )}
                        </div>
                        <span>{user.name || "Unnamed User"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="size-8" variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Roles</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleRoleUpdate(user, "ADMIN")}
                            disabled={user.role === "ADMIN" || updatingRole}
                          >
                            Set Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleUpdate(user, "DEALERSHIP")}
                            disabled={
                              user.role === "DEALERSHIP" || updatingRole
                            }
                          >
                            Set Dealership
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleUpdate(user, "USER")}
                            disabled={user.role === "USER" || updatingRole}
                          >
                            Mark as User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 size-12 text-gray-500" />
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              No Users Found.
            </h3>
            <p className="text-gray-500">
              {userSearch
                ? "No users match your search criteria"
                : "There are no users registered yet"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
