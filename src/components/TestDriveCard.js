"use client";

import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ArrowRight, Calendar, Car, Clock, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const formatTime = (timeString) => {
  try {
    return format(parseISO(`2025-01-01T${timeString}`), "h:mm a");
  } catch (error) {
    return timeString;
  }
};

const getStatusBadge = (status) => {
  const badgeStatus = {
    PENDING: <Badge className="bg-amber-100 text-amber-800">Pending</Badge>,
    CONFIRMED: <Badge className="bg-green-100 text-green-800">Confirmed</Badge>,
    COMPLETED: <Badge className="bg-blue-100 text-blue-800">Completed</Badge>,
    CANCELLED: <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>,
    NO_SHOW: <Badge className="bg-red-100 text-red-800">No Show</Badge>,
  };

  return badgeStatus[status] ?? <Badge variant="outline">{status}</Badge>;
};

export default function TestDriveCard({
  booking,
  onCancel,
  showActions = true,
  isPast = false,
  isAdmin = false,
  isCancelling = false,
  sidebarState = "collapsed",
  renderStatusSelector = () => null,
}) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancel = async () => {
    if (!onCancel) return;

    await onCancel(booking.id);
    setCancelDialogOpen(false);
  };

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden py-0",
          sidebarState === "collapsed" ? "md:py-3.5" : "lg:py-3.5",
          isPast && "opacity-90 transition-opacity hover:opacity-100"
        )}
      >
        <CardContent
          className={cn(
            "flex flex-col px-0",
            sidebarState === "collapsed"
              ? "md:flex-row md:px-3.5"
              : "lg:flex-row lg:px-3.5"
          )}
        >
          {/* Car Image - Left */}
          <div
            className={cn(
              "relative aspect-video",
              sidebarState === "collapsed"
                ? "md:h-auto md:w-1/4"
                : "lg:h-auto lg:w-1/4",
              isPast && "md:w-1/2"
            )}
          >
            {booking.car.images && booking.car.images.length > 0 ? (
              <Image
                src={booking.car.images[0]}
                alt={`${booking.car.make} ${booking.car.model}`}
                fill
                className={cn(
                  "object-cover",
                  sidebarState === "collapsed"
                    ? "md:rounded-lg"
                    : "lg:rounded-lg"
                )}
              />
            ) : (
              <div className="flex-center bg-gray-200">
                <Car className="size-12 text-gray-400" />
              </div>
            )}
          </div>

          <div
            className={cn(
              "my-auto p-3.5",
              sidebarState === "collapsed"
                ? "md:w-1/2 md:flex-1 md:p-0 md:pl-3.5"
                : "lg:w-1/2 lg:flex-1 lg:p-0 lg:pl-3.5"
            )}
          >
            <div className="flex-between mb-2">
              {getStatusBadge(booking.status)}
              {renderStatusSelector()}
            </div>

            <h3 className="mb-1 text-lg font-bold">
              {booking.car.year} {booking.car.make} {booking.car.model}{" "}
            </h3>

            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 size-4" />
                {format(new Date(booking.bookingDate), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="mr-2 size-4" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </div>

              {/* Show customer info in admin view */}
              {isAdmin && booking.user && (
                <div className="flex items-center text-gray-600">
                  <User className="mr-2 size-4" />
                  {booking.user.name || booking.user.email}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Right */}
          {showActions && (
            <div
              className={cn(
                "grid grid-rows-1 gap-y-2 border-t p-3.5",
                sidebarState === "collapsed"
                  ? "md:ml-3 md:w-1/4 md:border-t-0 md:border-l md:p-0 md:pl-3.5"
                  : "lg:ml-3 lg:w-1/4 lg:border-t-0 lg:border-l lg:p-0 lg:pl-3.5"
              )}
            >
              {/* Show notes if any */}
              {booking.notes && (
                <div className="rounded bg-gray-50 p-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium text-black">Notes: </span>
                    {booking.notes}
                  </p>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/cars/${booking.carId}`} className="flex-center">
                  View Car
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              {(booking.status === "PENDING" ||
                booking.status === "CONFIRMED") && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {onCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Test Drive</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your test drive for the{" "}
                {booking.car.year} {booking.car.make} {booking.car.model}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>
                    {format(
                      new Date(booking.bookingDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep Reservation
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Reservation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
