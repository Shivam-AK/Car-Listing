"use client";

import { getDealerships } from "@/actions/dealership";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { Landmark, MoreHorizontal, Search, Trash2, Users } from "lucide-react";
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

export default function DealershipList() {
  const [dealerSearch, setDealerSearch] = useState("");

  const {
    loading: fetchingDealers,
    fn: fetchDealerships,
    data: dealersData,
    error: dealersError,
  } = useFetch(getDealerships);

  useEffect(() => {
    fetchDealerships();
  }, []);

  useEffect(() => {
    if (dealersError) {
      toast.error("Failed to load Dealerships");
    }
  }, [dealersError]);

  const filteredDealers = dealersData?.success
    ? dealersData.data.filter(
        (ds) =>
          ds.user.email.toLowerCase().includes(dealerSearch.toLowerCase()) ||
          ds.user.name.toLowerCase().includes(dealerSearch.toLowerCase()) ||
          ds.user.role.toLowerCase().includes(dealerSearch.toLowerCase()) ||
          ds.name.toLowerCase().includes(dealerSearch.toLowerCase()) ||
          ds.email.toLowerCase().includes(dealerSearch.toLowerCase()) ||
          ds.phone.toLowerCase().includes(dealerSearch.toLowerCase())
      )
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Dealership</CardTitle>
        <CardDescription>
          Manage Dealerships with admin privileges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute top-2.5 left-2.5 size-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search User..."
            className="pl-9"
            value={dealerSearch}
            onChange={(e) => setDealerSearch(e.target.value)}
          />
        </div>

        {fetchingDealers ? (
          <Skeleton className="h-36 w-full" />
        ) : dealersData?.success && filteredDealers.length > 0 ? (
          <div>
            <Table>
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Dealership Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDealers.map((dealership) => (
                  <TableRow key={dealership.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                          {dealership.user.imageUrl ? (
                            <img
                              src={dealership.user.imageUrl}
                              alt={dealership.user.name || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users className="size-4 text-gray-500" />
                          )}
                        </div>
                        <span>{dealership.user.name || "Unnamed User"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{dealership.name}</TableCell>
                    <TableCell>{dealership.email}</TableCell>
                    <TableCell>{dealership.phone}</TableCell>
                    <TableCell>{getRoleBadge(dealership.user.role)}</TableCell>
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
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(
                                dealership.user.email
                              )
                            }
                          >
                            Copy User Email
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
            <Landmark className="mx-auto mb-4 size-12 text-gray-500" />
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              No Users Found.
            </h3>
            <p className="text-gray-500">
              {dealerSearch
                ? "No users match your search criteria"
                : "There are no users registered yet"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
