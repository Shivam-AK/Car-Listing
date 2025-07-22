"use client";

import {
  getDealershipInfo,
  saveDealership,
  saveWorkingHours,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFetch from "@/hooks/useFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Landmark, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const dealershipFormSchema = z.object({
  name: z.string().min(1, "Make is Required."),
  address: z.string().min(1, "Model is Required."),
  phone: z.string().min(1, "Price is required"),
  email: z.string().min(1, "Color is required"),
});

export default function SettingForm() {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(dealershipFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  const {
    loading: fetchingSettings,
    fn: fetchDealershipHours,
    data: fetchHoursData,
    error: fetchHoursError,
  } = useFetch(getDealershipInfo);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
    setData: setSaveResult,
  } = useFetch(saveWorkingHours);

  const {
    data: dealershipResult,
    loading: dealershipLoading,
    fn: saveDealershipFn,
    error: dealershipError,
    setData: setDealershipResult,
  } = useFetch(saveDealership);

  useEffect(() => {
    if (fetchHoursData?.success && fetchHoursData.data) {
      const dealership = fetchHoursData.data;
      setValue("name", dealership.name);
      setValue("address", dealership.address);
      setValue("phone", dealership.phone);
      setValue("email", dealership.email);

      if (dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          const hoursData = dealership.workingHours.find(
            (hour) => hour.dayOfWeek === day.value
          );

          if (hoursData) {
            return {
              dayOfWeek: hoursData.dayOfWeek,
              openTime: hoursData.openTime,
              closeTime: hoursData.closeTime,
              isOpen: hoursData.isOpen,
            };
          }

          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });

        setWorkingHours(mappedHours);
      } else {
        toast.error("Please Setup Your Working Hours.");
      }
    }
  }, [fetchHoursData]);

  useEffect(() => {
    fetchDealershipHours();
  }, []);

  useEffect(() => {
    if (saveResult?.success) {
      toast.success("Working Hours Saved Successfully.");
      fetchDealershipHours();
      setSaveResult(undefined);
    }

    if (dealershipResult?.success) {
      toast.success("Dealership Saved Successfully.");
      fetchDealershipHours();
      setDealershipResult(undefined);
    }
  }, [saveResult, dealershipResult]);

  // Handle errors
  useEffect(() => {
    if (fetchHoursError) {
      toast.error("Failed to load dealership settings");
    }

    if (saveError) {
      toast.error(`Failed to save working hours: ${saveError.message}`);
    }

    if (dealershipError) {
      toast.error("Failed to Save Dealership.");
    }
  }, [fetchHoursError, saveError, dealershipError]);

  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setWorkingHours(updatedHours);
  };

  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };

  const onSubmit = async (data) => {
    await saveDealershipFn(data);
  };

  return (
    <Tabs defaultValue="hours">
      <TabsList>
        <TabsTrigger value="hours">
          <Clock className="mr-1.5 size-4" />
          Working Hours
        </TabsTrigger>
        <TabsTrigger value="dealership">
          <Landmark className="mr-1.5 size-4" />
          Dealership
        </TabsTrigger>
      </TabsList>
      <TabsContent value="hours">
        <Card className="mb:py-5 py-3.5">
          <CardHeader className="mb:px-5 px-3.5">
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Set your Dealership's working hours for each day of the week.
            </CardDescription>
          </CardHeader>
          <CardContent className="mb:px-5 px-3.5">
            <div className="space-y-4">
              {DAYS.map((day, index) => (
                <div
                  key={day.value}
                  className="grid grid-cols-12 items-center gap-x-3 gap-y-3 rounded-lg px-4 py-3 shadow-sm hover:bg-slate-50"
                >
                  <div className="col-span-6 lg:col-span-2">
                    <div className="font-medium">{day.label}</div>
                  </div>

                  <div className="flex-end col-span-6 lg:col-span-2 lg:!justify-center">
                    <Checkbox
                      id={`is-open-${day.value}`}
                      checked={workingHours[index]?.isOpen}
                      onCheckedChange={(checked) => {
                        handleWorkingHourChange(index, "isOpen", checked);
                      }}
                    />
                    <Label
                      htmlFor={`is-open-${day.value}`}
                      className="ml-2 min-h-9 cursor-pointer"
                    >
                      {workingHours[index]?.isOpen ? "Open" : "Closed"}
                    </Label>
                  </div>

                  {workingHours[index]?.isOpen ? (
                    <>
                      <div className="mb:col-span-6 col-span-12 lg:col-span-4">
                        <div className="flex items-center gap-x-3">
                          <Clock className="size-4 shrink-0 text-gray-700" />
                          <Input
                            type="time"
                            value={workingHours[index]?.openTime}
                            className="text-sm"
                            onChange={(e) =>
                              handleWorkingHourChange(
                                index,
                                "openTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="mb:col-span-6 col-span-12 flex items-center gap-x-3 lg:col-span-4">
                        <div>to</div>
                        <Input
                          type="time"
                          value={workingHours[index]?.closeTime}
                          className="text-sm"
                          onChange={(e) =>
                            handleWorkingHourChange(
                              index,
                              "closeTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-11 text-sm text-gray-500 italic lg:col-span-7">
                      Closed all day
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="float-end mt-6">
              <Button onClick={handleSaveHours} disabled={savingHours}>
                {savingHours ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 size-4" />
                    Save Working Hours
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="dealership">
        <Card className="mb:py-5 py-3.5">
          <CardHeader className="mb:px-5 px-3.5">
            <CardTitle>Dealership Info</CardTitle>
            <CardDescription>Set your Dealership's details.</CardDescription>
          </CardHeader>
          <CardContent className="mb:px-5 px-3.5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Dealership Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g. Big Boy Toyz"
                    autoComplete="off"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="e.g. Plot No. 134, Sector 37, Gurugram, Haryana 122001"
                    autoComplete="off"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="e.g. 9999999999"
                    autoComplete="off"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    {...register("email")}
                    placeholder="e.g. example@gmail.com"
                    autoComplete="off"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="float-end"
                disabled={dealershipLoading}
              >
                {dealershipLoading ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Save Dealership"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
