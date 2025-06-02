"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ban,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  Info,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard({ initialData }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!initialData || !initialData.success) {
    return (
      <Alert variant="destructive">
        <Info className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {initialData?.error || "Failed to load dashboard data"}
        </AlertDescription>
      </Alert>
    );
  }

  const { cars, testDrives } = initialData.data;

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-drives">Test Drives</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="mb:grid-cols-2 grid gap-4 lg:grid-cols-4">
            {/* Cars */}
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">
                  Total Cars
                </CardTitle>
                <Car className="text-muted-foreground size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.total}</div>
                <p className="text-muted-foreground text-sm">
                  <span className="text-nowrap">
                    {cars.available} Available,
                  </span>{" "}
                  <span className="text-nowrap">{cars.sold} Sold</span>
                </p>
              </CardContent>
            </Card>

            {/* Test Drives */}
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">
                  Test Drives
                </CardTitle>
                <Calendar className="text-muted-foreground size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.total}</div>
                <p className="text-muted-foreground text-sm">
                  <span className="text-nowrap">
                    {testDrives.pending} Pending,
                  </span>{" "}
                  <span className="text-nowrap">
                    {testDrives.confirmed} Confirmed
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="text-muted-foreground size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testDrives.conversionRate}%
                </div>
                <p className="text-muted-foreground text-sm">
                  From test drives to Sales
                </p>
              </CardContent>
            </Card>

            {/* Cars Sold */}
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
                <DollarSign className="text-muted-foreground size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.sold}</div>
                <p className="text-muted-foreground text-sm">
                  {((cars.sold / cars.total) * 100).toFixed(1)}% of inventory
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dealership Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="mb:grid-cols-2 grid gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-medium">Car Inventory</h3>
                    <div className="flex items-center">
                      <div className="h-2.5 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2.5 rounded-full bg-green-600 transition-all"
                          style={{
                            width: `${(cars.available / cars.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {((cars.available / cars.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Available inventory capacity
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-medium">
                      Test Drive Success
                    </h3>
                    <div className="flex items-center">
                      <div className="h-2.5 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2.5 rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${
                              (testDrives.completed / (testDrives.total || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {(
                          (testDrives.completed / (testDrives.total || 1)) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Completed test drives
                    </p>
                  </div>
                </div>

                <div className="mb:grid-cols-3 mt-6 grid grid-cols-2 justify-center gap-4">
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {cars.sold}
                    </span>
                    <p className="mt-1 text-sm text-gray-600">Cars Sold</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <span className="text-3xl font-bold text-amber-600">
                      {testDrives.pending + testDrives.confirmed}
                    </span>
                    <p className="mt-1 text-sm text-gray-600">
                      Upcoming Test Drives
                    </p>
                  </div>
                  <div className="mb:col-span-1 col-span-2 rounded-lg bg-gray-50 p-3 text-center">
                    <span className="text-3xl font-bold text-green-600">
                      {((cars.available / (cars.total || 1)) * 100).toFixed(0)}%
                    </span>
                    <p className="mt-1 text-sm text-gray-600">
                      Inventory Utilization
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="test-drives" className="space-y-6">
          <div className="mb:grid-cols-2 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Calendar className="text-muted-foreground size-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="size-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.pending}</div>
                <p className="text-muted-foreground text-sm">
                  {((testDrives.pending / testDrives.total) * 100).toFixed(1)}%
                  of bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="size-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.confirmed}</div>
                <p className="text-muted-foreground text-sm">
                  {((testDrives.confirmed / testDrives.total) * 100).toFixed(1)}
                  % of bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="size-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.completed}</div>
                <p className="text-muted-foreground text-sm">
                  {((testDrives.completed / testDrives.total) * 100).toFixed(1)}
                  % of bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <XCircle className="size-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.cancelled}</div>
                <p className="text-muted-foreground text-sm">
                  {((testDrives.cancelled / testDrives.total) * 100).toFixed(1)}
                  % of bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-between">
                <CardTitle className="text-sm font-medium">No Show</CardTitle>
                <Ban className="size-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.noShow}</div>
                <p className="text-muted-foreground text-sm">
                  {((testDrives.noShow / testDrives.total) * 100).toFixed(1)}%
                  of bookings
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Drive Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Conversion Rate Card */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-lg font-medium">
                      Conversion Rate
                    </h3>
                    <div className="text-3xl font-bold text-blue-600">
                      {testDrives.conversionRate}%
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Test drives resulting in car purchases
                    </p>
                  </div>

                  {/* Test Drive Success Rate */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-lg font-medium">
                      Completion Rate
                    </h3>
                    <div className="text-3xl font-bold text-green-600">
                      {testDrives.total
                        ? (
                            (testDrives.completed / testDrives.total) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Test drives successfully completed
                    </p>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-medium">Booking Status Breakdown</h3>

                  {/* Pending */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span className="font-medium">
                        {testDrives.pending} (
                        {(
                          (testDrives.pending / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2.5 rounded-full bg-amber-500"
                        style={{
                          width: `${
                            (testDrives.pending / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Confirmed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Confirmed</span>
                      <span className="font-medium">
                        {testDrives.confirmed} (
                        {(
                          (testDrives.confirmed / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2.5 rounded-full bg-green-500"
                        style={{
                          width: `${
                            (testDrives.confirmed / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span className="font-medium">
                        {testDrives.completed} (
                        {(
                          (testDrives.completed / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{
                          width: `${
                            (testDrives.completed / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Cancelled */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Cancelled</span>
                      <span className="font-medium">
                        {testDrives.cancelled} (
                        {(
                          (testDrives.cancelled / testDrives.total) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2.5 rounded-full bg-red-500"
                        style={{
                          width: `${
                            (testDrives.cancelled / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* No Show */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>No Show</span>
                      <span className="font-medium">
                        {testDrives.noShow} (
                        {((testDrives.noShow / testDrives.total) * 100).toFixed(
                          1
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2.5 rounded-full bg-gray-500"
                        style={{
                          width: `${
                            (testDrives.noShow / testDrives.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
