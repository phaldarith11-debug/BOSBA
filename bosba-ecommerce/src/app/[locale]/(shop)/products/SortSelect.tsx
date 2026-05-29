"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function SortSelect({ currentSort, labels }: {
  currentSort: string;
  labels: { latest: string; priceAsc: string; priceDesc: string; nameAz: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      defaultValue={currentSort}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">{labels.latest}</option>
      <option value="price_asc">{labels.priceAsc}</option>
      <option value="price_desc">{labels.priceDesc}</option>
      <option value="name">{labels.nameAz}</option>
    </select>
  );
}
