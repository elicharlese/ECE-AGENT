"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

// Radix Dialog-based Drawer shim to avoid vaul/react-19 peer conflicts.
// API-compatible exports for existing code.

function Drawer({
  ...props
}: React.ComponentProps<typeof Dialog.Root>) {
  return <Dialog.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof Dialog.Portal>) {
  return <Dialog.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Overlay>) {
  return (
    <Dialog.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <Dialog.Content
        data-slot="drawer-content"
        className={cn(
          "bg-background fixed inset-x-0 bottom-0 z-50 flex h-auto max-h-[80vh] flex-col rounded-t-lg border-t p-0 shadow-lg sm:mx-auto sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-2 h-1.5 w-16 shrink-0 rounded-full" />
        {children}
      </Dialog.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1 p-4 text-center md:text-left", className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title data-slot="drawer-title" className={cn("text-foreground font-semibold", className)} {...props} />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
