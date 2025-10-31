"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

export const CategoriesSection = () => {
  const [value, setValue] = useState<string | null>(null);

  const trpc = useTRPC();
  const { data: categories, isLoading} = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  );

  const data = categories.map(({ name, id }) => ({ name, id }));

  return <FilterCarousel data={data} onSelect={(x) => {setValue(x)}} value={value} isLoading={isLoading}/>;
};
