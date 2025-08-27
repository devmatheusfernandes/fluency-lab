"use client";

import { usePathname } from "next/navigation";
import { switchLocale } from "@/actions/language";

export default function LanguageSwitcher() {
  const pathname = usePathname();

  return (
    <div>
      <button onClick={() => switchLocale("pt", pathname)}>Português</button>
      <span style={{ margin: "0 5px" }}>|</span>
      <button onClick={() => switchLocale("en", pathname)}>English</button>
    </div>
  );
}
