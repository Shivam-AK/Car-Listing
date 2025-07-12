import { getFeaturedCars } from "@/actions/home";
import { getLoggedInUser } from "@/lib/auth";
import CarCard from "./CarCard";

export default async function FeaturedCars() {
  let user = await getLoggedInUser();
  if (user instanceof Error) user = null;

  const featuredCars = await getFeaturedCars(user);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {featuredCars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
