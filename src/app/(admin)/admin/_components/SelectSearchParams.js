"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SelectSearchParams({
  params,
  dealership,
  currentDealership,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const admins = dealership.filter((item) => item.user.role === "ADMIN");
  const dealerships = dealership.filter(
    (item) => item.user.role === "DEALERSHIP"
  );

  return (
    <Select
      value={params || currentDealership?.user?.id || ""}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);
        value === currentDealership?.user?.id
          ? params.delete("filter")
          : params.set("filter", value);

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
    >
      <SelectTrigger className="mb:w-60 w-full">
        <SelectValue placeholder="All Data" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all-dealership">All Dealership</SelectItem>
        <SelectGroup>
          <SelectLabel>Admin</SelectLabel>
          {admins.map((item) => (
            <SelectItem
              key={item.id}
              className={
                item.user.id === currentDealership?.user?.id && "font-semibold"
              }
              value={item.user.id}
            >
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Dealership</SelectLabel>
          {dealerships.map((item) => (
            <SelectItem key={item.id} value={item.user.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
