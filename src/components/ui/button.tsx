import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        green: "border-transparent bg-green-500 text-white hover:bg-green-600",
        yellow: "border-transparent bg-yellow-400 text-black hover:bg-yellow-500",
        blue: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        purple: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
        pink: "border-transparent bg-pink-500 text-white hover:bg-pink-600",
        teal: "border-transparent bg-teal-500 text-white hover:bg-teal-600",
        orange: "border-transparent bg-orange-400 text-black hover:bg-orange-500",
        gray: "border-transparent bg-gray-400 text-black hover:bg-gray-500",
        slate: "border-transparent bg-slate-400 text-black hover:bg-slate-500",
        amber: "border-transparent bg-amber-400 text-black hover:bg-amber-500",
        indigo: "border-transparent bg-indigo-500 text-white hover:bg-indigo-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
