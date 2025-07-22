"use client";

import { addCar, processCarImageWithAI } from "@/actions/cars";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

const formatPrice = (price) => {
  // $2,00,00,000
  let match;
  if (price?.includes("-")) {
    match = price?.match(/- *\$(.*)/);
  } else {
    match = price?.match(/ *\$(.*)/);
  }

  if (match && match?.[1]) {
    // Remove all commas and convert to number
    const numberPrice = parseInt(match[1]?.replace(/(,|\+)/g, ""));
    return `${numberPrice}`; // "20000000"
  } else {
    return "";
  }
};

export default function AddCarForm() {
  const [activeTab, setActiveTab] = useState("ai");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedAiImage, setUploadedAiImage] = useState(null);

  const router = useRouter();

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

  const onAiDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB.");
        return;
      }

      setUploadedAiImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        toast.success("Image Uploaded Successfully.");
      };

      reader.onerror = () => {
        toast.error("Failed to read the Image.");
      };

      reader.readAsDataURL(file);
    }
  };

  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
    useDropzone({
      onDrop: onAiDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxFiles: 1,
      multiple: false,
    });

  const {
    loading: processImageLoading,
    fn: processImageFn,
    data: processImageResult,
    error: processImageError,
  } = useFetch(processCarImageWithAI);

  useEffect(() => {
    if (processImageError) {
      toast.error(processImageError.message || "Failed to upload car");
    }
  }, [processImageError]);

  useEffect(() => {
    if (processImageResult?.success) {
      const carDetails = processImageResult.data;

      console.log(carDetails);

      // Update form with AI results
      setValue("make", carDetails.make);
      setValue("model", carDetails.model);
      setValue("year", carDetails.year.toString());
      setValue("color", carDetails.color);
      setValue(
        "bodyType",
        bodyTypes.includes(carDetails.bodyType) ? carDetails.bodyType : ""
      );
      setValue(
        "fuelType",
        fuelTypes.includes(carDetails.fuelType) ? carDetails.fuelType : ""
      );
      setValue("price", formatPrice(carDetails.price));
      setValue("mileage", carDetails.mileage.replaceAll(/,/g, ""));
      setValue("transmission", carDetails.transmission);
      setValue("description", carDetails.description);

      // Add the image to the uploaded images
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(uploadedAiImage);

      toast.success("Successfully extracted car details", {
        description: `Detected ${carDetails.year} ${carDetails.make} ${
          carDetails.model
        } with ${Math.round(carDetails.confidence * 100)}% confidence`,
      });

      setActiveTab("manual");
    }
  }, [processImageResult]);

  const processWithAI = async () => {
    if (!uploadedAiImage) {
      toast.error("Please Upload an Image First.");
      return;
    }

    await processImageFn(uploadedAiImage);
  };

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

  const {
    data: addCarResult,
    loading: addCarLoading,
    fn: addCarFn,
  } = useFetch(addCar);

  useEffect(() => {
    if (addCarResult?.success) {
      toast.success("Car Added successfully.");
      router.push("/admin/cars");
    }
  }, [addCarResult]);

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

    await addCarFn({ carData, images: uploadedImages });
  };

  // Remove image from upload preview
  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Tabs
      defaultValue="ai"
      className="w-full"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="ai">AI Upload</TabsTrigger>
      </TabsList>
      <TabsContent value="manual" className="mt-6">
        <Card className="mb:py-5 py-3.5">
          <CardHeader className="mb:px-5 px-3.5">
            <CardTitle>Car Details</CardTitle>
            <CardDescription>
              Enter the details of the car you want to add.
            </CardDescription>
          </CardHeader>
          <CardContent className="mb:px-5 px-3.5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Make */}
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    {...register("make")}
                    placeholder="e.g. Tata"
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
                    <p className="text-xs text-red-500">
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
                    <p className="text-xs text-red-500">
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
                    <p className="text-xs text-red-500">
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

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="group relative">
                          <Image
                            src={image}
                            alt={`Car Image ${index}`}
                            className="h-28 w-full rounded-md object-cover"
                            height={50}
                            width={50}
                            priority
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
                disabled={addCarLoading}
              >
                {addCarLoading ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" /> Adding
                    Car...
                  </>
                ) : (
                  "Add Car"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ai" className="mt-6">
        <Card className="mb:py-5 py-3.5">
          <CardHeader className="mb:px-5 px-3.5">
            <CardTitle>AI-Powered Car Details Extraction</CardTitle>
            <CardDescription>
              Upload an image of a car and let Gemini AI extract its details.
            </CardDescription>
          </CardHeader>
          <CardContent className="mb:px-5 px-3.5">
            <div className="space-y-6">
              <div className="rounded-lg border-2 border-dashed p-6 text-center">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Car Preview"
                      className="mb-4 max-h-56 max-w-full object-contain"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setUploadedAiImage(null);
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        disabled={processImageLoading}
                        onClick={processWithAI}
                      >
                        {processImageLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Camera className="size-4" />
                            Extract Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getAiRootProps()}
                    className="cursor-pointer transition hover:bg-gray-50"
                  >
                    <input {...getAiInputProps()} />
                    <div className="flex-center flex-col">
                      <Camera className="mb-2 size-12 text-gray-400" />
                      <p className="text-base text-gray-600">
                        Drag & Drop or Click to Upload a Car Image
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Supports: JPG, JPEG, PNG, WebP, (max 5MB each)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">How it works</h3>
                <ol className="list-decimal space-y-2 pl-4 text-sm text-gray-600">
                  <li>Upload a clear image of the car</li>
                  <li>Click "Extract Details" to analyze with Gemini AI</li>
                  <li>Review the extracted information</li>
                  <li>Fill in any missing details manually</li>
                  <li>Add the car to your inventory</li>
                </ol>
              </div>

              <div className="rounded-md bg-amber-50 p-4">
                <h3 className="mb-1 font-medium text-amber-800">
                  Tips for best results
                </h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Use clear, well-lit images</li>
                  <li>• Try to capture the entire vehicle</li>
                  <li>• For difficult models, use multiple views</li>
                  <li>• Always verify AI-extracted information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
