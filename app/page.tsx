"use client";
import { useToast } from "@/components/ui/Toast";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success({
      title: "Success!",
      description: "Your action was completed successfully.",
    });
  };

  const handleError = () => {
    toast.error({
      title: "Error!",
      description: "Something went wrong. Please try again.",
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}

export default MyComponent;
