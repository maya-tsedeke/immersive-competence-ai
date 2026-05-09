import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function demoAlert(feature: string) {
  if (typeof window !== "undefined") {
    window.alert(
      `${feature} — prototype action only.\n\nNo file is generated in this mock build. Connect an export backend in a future iteration.`,
    );
  }
}
