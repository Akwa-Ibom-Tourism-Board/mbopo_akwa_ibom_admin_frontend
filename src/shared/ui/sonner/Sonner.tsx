import { Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { useTheme } from "@/theme";

export const Toaster = (props: ToasterProps) => {
  const theme = useTheme();

  return (
    <SonnerToaster
      theme="light"
      position="top-right"
      duration={6000}
      closeButton
      toastOptions={{
        style: {
          background: theme.colors.card,
          color: theme.colors.cardForeground,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.lg,
        },
      }}
      {...props}
    />
  );
};

// Re-export of a non-component; harmless for fast refresh.
// eslint-disable-next-line react-refresh/only-export-components
export { toast } from "sonner";
