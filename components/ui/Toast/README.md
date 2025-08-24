# Toast Component

This Toast component has been updated to use [sonner](https://sonner.emilkowal.ski/) instead of react-hot-toast for better performance and modern toast notifications.

## Setup

Make sure you have the Toaster component added to your layout. You can add it to your root layout or any layout where you want toasts to appear:

```tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

## Usage

### Basic Usage

```tsx
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
```

### Available Methods

- `toast.success(options)` - Success notification
- `toast.error(options)` - Error notification
- `toast.warning(options)` - Warning notification
- `toast.info(options)` - Info notification
- `toast.default(options)` - Default notification
- `toast.show({ variant, ...options })` - Show with specific variant
- `toast.dismiss(toastId)` - Dismiss specific toast
- `toast.dismissAll()` - Dismiss all toasts

### Options

```tsx
type ToastOptions = {
  title?: string; // Toast title
  description?: string; // Toast description
  duration?: number; // Duration in milliseconds
  action?: {
    // Action button
    label: string;
    onClick: () => void;
  };
  closable?: boolean; // Whether toast can be closed
  position?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
};
```

### Example with Action Button

```tsx
toast.success({
  title: "File uploaded",
  description: "Your file has been uploaded successfully.",
  action: {
    label: "View",
    onClick: () => navigateToFile(),
  },
  duration: 5000,
});
```

## Migration from react-hot-toast

The API remains the same, so no changes are needed in your existing code. The component now uses sonner under the hood for better performance and modern toast notifications.

## Benefits of Sonner

- Better performance
- Modern animations
- Better accessibility
- Smaller bundle size
- More customization options
- Better TypeScript support
