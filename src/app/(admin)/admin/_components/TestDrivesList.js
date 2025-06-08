"use client";

import { getAdminTestDrives, updateTestDriveStatus } from "@/actions/admin";
import { cancelTestDrive } from "@/actions/test-drive";
import TestDriveCard from "@/components/TestDriveCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import useFetch from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import { AlertCircle, CalendarRange, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TestDrivesList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { state } = useSidebar();

  const {
    loading: fetchingTestDrives,
    fn: fetchTestDrives,
    data: testDrivesData,
    error: testDrivesError,
  } = useFetch(getAdminTestDrives);

  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateTestDriveStatus);

  const {
    loading: cancelling,
    fn: cancelTestDriveFn,
    data: cancelResult,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  useEffect(() => {
    fetchTestDrives(search, statusFilter);
  }, [search, statusFilter]);

  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Test drive status updated successfully");
      fetchTestDrives(search, statusFilter);
    }
  }, [updateResult]);

  useEffect(() => {
    if (cancelResult?.success) {
      toast.success("Test drive cancelled successfully");
      fetchTestDrives(search, statusFilter);
    }
  }, [cancelResult]);

  useEffect(() => {
    if (testDrivesError) {
      toast.error("Failed to load test drives");
    }
    if (updateError) {
      toast.error("Failed to update test drive status");
    }
    if (cancelError) {
      toast.error("Failed to cancel test drive");
    }
  }, [testDrivesError, updateError, cancelError]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTestDrives(search, statusFilter);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (newStatus) {
      await updateStatusFn(bookingId, newStatus);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value || "")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem>All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>

          <form
            onSubmit={handleSearchSubmit}
            className="mb:flex-row flex w-full flex-col gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2.5 size-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by car or customer..."
                className="w-full pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="flex items-center gap-2 leading-none font-semibold">
            <CalendarRange className="size-5" />
            Test Drive Bookings
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage all test drive reservations and update their status
          </p>
        </div>
        {fetchingTestDrives && !testDrivesData ? (
          <div className="flex-center py-12">
            <Loader2 className="size-8 animate-spin text-gray-400" />
          </div>
        ) : testDrivesError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load test drives. Please try again.
            </AlertDescription>
          </Alert>
        ) : testDrivesData?.data?.length === 0 ? (
          <div className="flex-center flex-col px-4 py-12 text-center">
            <CalendarRange className="mb-4 size-12 text-gray-300" />
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              No test drives found
            </h3>
            <p className="mb-4 text-gray-500">
              {statusFilter || search
                ? "No test drives match your search criteria"
                : "There are no test drive bookings yet."}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "mx-auto grid grid-cols-1 gap-5 max-[640px]:container sm:grid-cols-2",
              state === "collapsed"
                ? "md:grid-cols-1"
                : "tb:grid-cols-2 md:grid-cols-1 lg:grid-cols-1"
            )}
          >
            {testDrivesData?.data?.map((booking) => (
              <div key={booking.id}>
                <TestDriveCard
                  booking={booking}
                  onCancel={cancelTestDriveFn}
                  showActions={["PENDING", "CONFIRMED"].includes(
                    booking.status
                  )}
                  isAdmin
                  isCancelling={cancelling}
                  sidebarState={state}
                  renderStatusSelector={() => (
                    <Select
                      value={booking.status}
                      onValueChange={(value) =>
                        handleUpdateStatus(booking.id, value)
                      }
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="w-32" size="sm">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="NO_SHOW">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
