import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Add New Car</h1>

      <Skeleton className="mb-8 h-9 w-full" />
      <div className="space-y-4">
        <Card className="py-3.5 sm:py-5">
          <CardHeader className="px-3.5 sm:px-5">
            <CardTitle>AI-Powered Car Details Extraction</CardTitle>
            <CardDescription>
              Upload an image of a car and let Gemini AI extract its details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-3.5 sm:px-5">
            <Skeleton className="w-full py-1.5">
              <div className="h-36" />
            </Skeleton>

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
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
