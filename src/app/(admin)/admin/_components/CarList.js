"use client";

import { deleteCar, getCars, updateCar } from "@/actions/cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/useFetch";
import { formatCurrency } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  SquarePen,
  Star,
  StarOff,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const getStatusBadge = (status) => {
  const badgeStatus = {
    AVAILABLE: (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Available
      </Badge>
    ),
    UNAVAILABLE: (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        Unavailable
      </Badge>
    ),
    SOLD: (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        Sold
      </Badge>
    ),
  };

  return badgeStatus[status] ?? <Badge variant="outline">{status}</Badge>;
};

// Predefined options
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

const carFormSchema = z.object({
  make: z.string().min(1, "Make is Required."),
  model: z.string().min(1, "Model is Required."),
  year: z.string().refine((val) => {
    const year = parseInt(val);
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
  }, "Valid year required"),
  price: z.string().min(1, "Price is required"),
  mileage: z.string().min(1, "Mileage is required"),
  color: z.string().min(1, "Color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  seats: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
  featured: z.boolean().default(false),
});

export default function CarList({ params }) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [carToAction, setCarToAction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    loading: loadingCars,
    fn: fetchCars,
    data: carsData,
    error: carsError,
  } = useFetch(getCars);

  const {
    loading: deletingCar,
    fn: deleteCarFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);

  const {
    loading: updatingCar,
    fn: updateCarFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCar);

  useEffect(() => {
    fetchCars(params);
  }, [params]);

  // Handle successful operations
  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Car deleted successfully");
      fetchCars(params);
    }

    if (updateResult?.success) {
      toast.success("Car updated successfully");
      fetchCars(params);
      setEditDialogOpen(false);
    }
  }, [deleteResult, updateResult]);

  useEffect(() => {
    if (carsError) {
      toast.error("Failed to Load Cars.");
    }

    if (deleteError) {
      toast.error("Failed to Delete Car.");
    }

    if (updateError) {
      toast.error("Failed to Update Car.");
    }
  }, [carsError, deleteError, updateError]);

  const handleToggleFeatured = async (car) => {
    const carData = { featured: !car.featured };
    await updateCarFn({ carId: car.id, carData });
  };

  const handleStatusUpdate = async (car, newStatus) => {
    const carData = { status: newStatus };
    await updateCarFn({ carId: car.id, carData });
  };

  const handleDeleteCar = async () => {
    if (!carToAction) return;

    await deleteCarFn(carToAction.id);
    setDeleteDialogOpen(false);
    setCarToAction(null);
  };

  const filterCarsData = carsData?.success
    ? carsData.data.filter(
        (car) =>
          car.make.toLowerCase().includes(search.toLowerCase()) ||
          car.model.toLowerCase().includes(search.toLowerCase()) ||
          `${car.year}`.toLowerCase().includes(search.toLowerCase()) ||
          `${car.price}`.toLowerCase().includes(search.toLowerCase()) ||
          car.color.toLowerCase().includes(search.toLowerCase()) ||
          car.fuelType.toLowerCase().includes(search.toLowerCase()) ||
          car.transmission.toLowerCase().includes(search.toLowerCase()) ||
          car.bodyType.toLowerCase().includes(search.toLowerCase()) ||
          car.status.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  const onMultiImagesDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit and will be skipped`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === validFiles.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          setImageError("");
          toast.success(`Successfully Uploaded ${newImages.length} Image.`);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const {
    getRootProps: getMultiImageRootProps,
    getInputProps: getMultiImageInputProps,
  } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      setImageError("Please Upload at least One Image");
      return;
    }

    const carData = {
      ...data,
      year: parseInt(data.year),
      price: parseFloat(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null,
    };

    await updateCarFn({
      carId: carToAction,
      carData,
      images: uploadedImages,
    });
  };

  // Remove image from upload preview
  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="mb:flex-row flex flex-col items-start justify-between gap-4 sm:items-center">
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="flex items-center"
        >
          <Plus className="size-4" />
          Add Car
        </Button>

        <div className="mb:w-auto relative w-full">
          <Search className="absolute top-2.5 left-2.5 size-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search cars..."
            className="mb:w-60 w-full pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Car Table */}
      <Card className="py-3.5 sm:py-5">
        <CardContent className="px-3.5 sm:px-5">
          {loadingCars && !carsData ? (
            <Skeleton className="h-44 w-full" />
          ) : carsData?.success && filterCarsData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Make & Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterCarsData.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="h-10 w-14 overflow-hidden rounded-sm">
                        {car.images && car.images.length > 0 ? (
                          <Image
                            src={car.images[0]}
                            alt={`${car.make} ${car.model}`}
                            height={40}
                            width={56}
                            className="h-full w-full object-cover"
                            priority
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <CarIcon className="size-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {car.make} {car.model}
                    </TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>{formatCurrency(car.price)}</TableCell>
                    <TableCell>{getStatusBadge(car.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-9 p-0"
                        onClick={() => handleToggleFeatured(car)}
                        disabled={updatingCar}
                      >
                        {car.featured ? (
                          <Star className="size-5 fill-amber-500 text-amber-500" />
                        ) : (
                          <StarOff className="size-5 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="space-x-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setValue("make", car.make);
                          setValue("model", car.model);
                          setValue("year", car.year?.toString());
                          setValue("price", car.price?.toString());
                          setValue("mileage", car.mileage?.toString());
                          setValue("color", car.color);
                          setValue("fuelType", car.fuelType);
                          setValue("transmission", car.transmission);
                          setValue("bodyType", car.bodyType);
                          setValue("seats", car.seats?.toString());
                          setValue("status", car.status);
                          setValue("description", car.description);
                          setValue("featured", car.featured);
                          setUploadedImages(car.images);
                          setCarToAction(car.id);
                          setEditDialogOpen(true);
                        }}
                      >
                        <SquarePen className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="size-8" variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Link href={`/cars/${car.id}`} target="_blank">
                            <DropdownMenuItem>
                              <Eye className="size-4" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Status</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(car, "AVAILABLE")}
                            disabled={car.status === "AVAILABLE" || updatingCar}
                          >
                            Set Available
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(car, "UNAVAILABLE")
                            }
                            disabled={
                              car.status === "UNAVAILABLE" || updatingCar
                            }
                          >
                            Set Unavailable
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(car, "SOLD")}
                            disabled={car.status === "SOLD" || updatingCar}
                          >
                            Mark as Sold
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setCarToAction(car);
                              setDeleteDialogOpen(true);
                            }}
                          >
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
          ) : (
            <div className="flex-center flex-col px-4 py-12 text-center">
              <CarIcon className="mb-4 size-12 text-gray-300" />
              <h3 className="mb-1 text-lg font-medium text-gray-900">
                No Cars Found
              </h3>
              <p className="mb-4 text-gray-500">
                {search
                  ? "No cars match your search criteria"
                  : "Your inventory is empty. Add cars to get started."}
              </p>
              <Button onClick={() => router.push("/admin/cars/create")}>
                Add Your First Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {carToAction?.make}{" "}
              {carToAction?.model} ({carToAction?.year})? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCar}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={deletingCar}
            >
              {deletingCar ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <SheetContent className="min-w-11/12 overflow-y-auto sm:min-w-xl md:min-w-2xl">
          <SheetHeader>
            <SheetTitle>Edit Car</SheetTitle>
            <SheetDescription>
              Enter the details of the car you want to Edit.
            </SheetDescription>
          </SheetHeader>
          <div className="mb-5 px-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Make */}
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    {...register("make")}
                    placeholder="e.g. Tata"
                    autoComplete="off"
                    className={errors.make ? "border-red-500" : ""}
                  />
                  {errors.make && (
                    <p className="text-xs text-red-500">
                      {errors.make.message}
                    </p>
                  )}
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    {...register("model")}
                    placeholder="e.g. Curvv.ev"
                    autoComplete="off"
                    className={errors.model ? "border-red-500" : ""}
                  />
                  {errors.model && (
                    <p className="text-xs text-red-500">
                      {errors.model.message}
                    </p>
                  )}
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    {...register("year")}
                    placeholder="e.g. 2025"
                    autoComplete="off"
                    className={errors.year ? "border-red-500" : ""}
                  />
                  {errors.year && (
                    <p className="text-xs text-red-500">
                      {errors.year.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    {...register("price")}
                    placeholder="e.g. 25000"
                    autoComplete="off"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Mileage */}
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    {...register("mileage")}
                    placeholder="e.g. 15000"
                    autoComplete="off"
                    className={errors.mileage ? "border-red-500" : ""}
                  />
                  {errors.mileage && (
                    <p className="text-xs text-red-500">
                      {errors.mileage.message}
                    </p>
                  )}
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...register("color")}
                    placeholder="e.g. Black"
                    autoComplete="off"
                    className={errors.color ? "border-red-500" : ""}
                  />
                  {errors.color && (
                    <p className="text-xs text-red-500">
                      {errors.color.message}
                    </p>
                  )}
                </div>

                {/* Fuel Type */}
                <div>
                  <Label className="mb-2">Fuel Type</Label>
                  <Select
                    onValueChange={(value) => setValue("fuelType", value)}
                    defaultValue={getValues("fuelType")}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.fuelType ? "border-red-500" : ""
                      )}
                    >
                      <SelectValue placeholder="Select Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fuelType && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.fuelType.message}
                    </p>
                  )}
                </div>

                {/* Transmission */}
                <div>
                  <Label className="mb-2">Transmission</Label>
                  <Select
                    onValueChange={(value) => setValue("transmission", value)}
                    defaultValue={getValues("transmission")}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.transmission ? "border-red-500" : ""
                      )}
                    >
                      <SelectValue placeholder="Select Transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.transmission && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.transmission.message}
                    </p>
                  )}
                </div>

                {/* Body Type */}
                <div>
                  <Label className="mb-2">Body Type</Label>
                  <Select
                    onValueChange={(value) => setValue("bodyType", value)}
                    defaultValue={getValues("bodyType")}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.bodyType ? "border-red-500" : ""
                      )}
                    >
                      <SelectValue placeholder="Select Body Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bodyType && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.bodyType.message}
                    </p>
                  )}
                </div>

                {/* Seats */}
                <div className="space-y-2">
                  <Label htmlFor="seats">
                    Number of Seats{" "}
                    <span className="text-sm leading-3.5 text-gray-500">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="seats"
                    {...register("seats")}
                    placeholder="e.g. 4"
                    autoComplete="off"
                    className={errors.seats ? "border-red-500" : ""}
                  />
                </div>

                {/* Status */}
                <div>
                  <Label className="mb-2">Status</Label>
                  <Select
                    onValueChange={(value) => setValue("status", value)}
                    defaultValue={getValues("status")}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.status ? "border-red-500" : ""
                      )}
                    >
                      <SelectValue placeholder="Select Body Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {carStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-xs text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter detailed description of the car..."
                  className={`min-h-32 ${
                    errors.description ? "border-red-500" : ""
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Featured */}
              <div className="flex space-x-3 rounded-md border p-4">
                <Checkbox
                  id="featured"
                  checked={watch("featured")}
                  onCheckedChange={(checked) => setValue("featured", checked)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="featured">Feature this car</Label>
                  <p className="text-sm text-gray-500">
                    Featured Cars Appear on the Homepage
                  </p>
                </div>
              </div>

              {/* Images */}
              <div>
                <Label
                  htmlFor="images"
                  className={cn("mb-2", imageError ? "text-red-500" : "")}
                >
                  Images {imageError && <span className="text-red-500">*</span>}
                </Label>
                <div
                  {...getMultiImageRootProps()}
                  className={cn(
                    "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition hover:bg-gray-50",
                    imageError ? "border-red-500" : "border-gray-300"
                  )}
                >
                  <input {...getMultiImageInputProps()} id="images" />
                  <div className="flex-center flex-col">
                    <Upload className="mb-2 size-12 text-gray-400" />
                    <p className="text-base text-gray-600">
                      Drag & drop or click to upload multiple images
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Supports: JPG, JPEG, PNG, WebP, (max 5MB each)
                    </p>
                  </div>
                </div>
                {imageError && (
                  <p className="mt-2 text-xs text-red-500">{imageError}</p>
                )}

                {/* Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium">
                      Uploaded Image {uploadedImages.length}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="group relative">
                          <Image
                            src={image}
                            alt={`Car Image ${index}`}
                            className="h-28 w-full rounded-md object-cover"
                            height={112}
                            width={140}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 size-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            onClick={() => removeImage(index)}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={updatingCar}
              >
                {updatingCar ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" /> Loading...
                  </>
                ) : (
                  "Save Car"
                )}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
