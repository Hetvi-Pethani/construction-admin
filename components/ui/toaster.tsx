"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";

export const toaster = createToaster({
  overlap: true,
  placement: "top-end",
  gap: 16,
});

const toastTypes = [
  {
    type: "success" as const,
    icon: CheckCircle,
    colors: "bg-green-50 border-l-4 border-green-500 text-green-800",
    iconColor: "text-green-500",
  },
  {
    type: "error" as const,
    icon: AlertCircle,
    colors: "bg-red-50 border-l-4 border-red-500 text-red-800",
    iconColor: "text-red-500",
  },
  {
    type: "warning" as const,
    icon: AlertTriangle,
    colors: "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800",
    iconColor: "text-yellow-500",
  },
  {
    type: "info" as const,
    icon: Info,
    colors: "bg-blue-50 border-l-4 border-blue-500 text-blue-800",
    iconColor: "text-blue-500",
  },
];

export function GlobalToastProvider() {
  return (
    <Portal>
      <Toaster toaster={toaster}>
        {(toast) => {
          const toastConfig = toastTypes.find((t) => t.type === toast.type);
          const Icon = toastConfig?.icon || Info;

          return (
            <Toast.Root
              className={`rounded-lg shadow-lg min-w-80 p-4 relative overflow-anywhere transition-all duration-300 ease-default will-change-transform h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-(--z-index) ${
                toastConfig?.colors || "bg-white border-l-4 border-gray-500 text-gray-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    toastConfig?.iconColor || "text-gray-500"
                  }`}
                />
                <div className="flex-1 pr-6">
                  <Toast.Title className="font-semibold text-sm">
                    {toast.title}
                  </Toast.Title>
                  {toast.description && (
                    <Toast.Description className="text-sm opacity-80 mt-1">
                      {toast.description}
                    </Toast.Description>
                  )}
                </div>
              </div>
              <Toast.CloseTrigger className="absolute top-3 right-3 p-1 hover:bg-black/10 rounded transition-colors">
                <X className="w-3 h-3" />
              </Toast.CloseTrigger>
            </Toast.Root>
          );
        }}
      </Toaster>
    </Portal>
  );
}
