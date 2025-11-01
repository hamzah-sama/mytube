"use client";

import dynamic from "next/dynamic";

// Render hanya di client (ssr: false)
export const ThemeToggle = dynamic(() => import('@/modules/home/ui/components/theme'), {
  ssr: false,
});
