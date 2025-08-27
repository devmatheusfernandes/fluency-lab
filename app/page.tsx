"use client";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function Home() {
  const handleClick = () => {
    toast.success("Hello World", {
      description: "This is a description",
    });
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-surface-1">
      Hello World
      <Button onClick={handleClick}>Click me</Button>
      <ThemeToggle />
    </div>
  );
}
