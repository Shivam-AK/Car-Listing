"use client";

import { cancelTestDrive } from "@/actions/test-drive";
import TestDriveCard from "@/components/TestDriveCard";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function ReservationsList({ initialData }) {
  const upcomingBookings = initialData?.data?.filter((booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status)
  );

  const pastBookings = initialData?.data?.filter((booking) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)
  );

  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  const handleCancelBooking = async (bookingId) => {
    await cancelBookingFn(bookingId);
  };

  if (initialData?.data?.length === 0) {
    return (
      <div className="flex-center min-h-96 flex-col rounded-lg border bg-gray-50 p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Calendar className="size-8 text-gray-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No Reservations Found</h3>
        <p className="mb-6 max-w-md text-gray-500">
          You don't have any test drive reservations yet. Browse our cars and
          book a test drive to get started.
        </p>
        <Button variant="default" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Upcoming Test Drives</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming test drives.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={cancelling}
                showActions
                cancelError={cancelError}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>

      {pastBookings.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Past Test Drives</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {pastBookings.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                showActions={false}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
