"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Session } from "@/types/auth";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Profile({ session }: { session: Session }) {
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isDeletePhoneAlertOpen, setIsDeletePhoneAlertOpen] = useState(false);
  const [isEmailAlertOpen, setIsEmailAlertOpen] = useState(false);
  const [isSmsAlertOpen, setIsSmsAlertOpen] = useState(false);

  const { data: userData, isLoading: userDataIsLoading } = useQuery({
    queryKey: ["user", session.user.id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${session.user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      return data.data;
    },
  });

  const rawPhone = typeof userData?.phoneNumber === "string" ? userData.phoneNumber : "";

  const {
    mutate: updateEmailNotification,
    isPending: updateEmailNotificationIsPending,
  } = useMutation({
    mutationFn: async (newValue: boolean) => {
      const response = await fetch(
        `/api/users/${session.user.id}/notification`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alertNotification: newValue,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update notification settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", session.user.id] });
    },
  });

  const {
    mutate: updateSMSNotification,
    isPending: updateSMSNotificationIsPending,
  } = useMutation({
    mutationFn: async (newValue: boolean) => {
      const response = await fetch(
        `/api/users/${session.user.id}/sms-notification`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            smsNotification: newValue,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update SMS notification settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", session.user.id] });
    },
  });

  const { mutate: updatePhoneNumber, isPending: updatePhoneNumberIsPending } =
    useMutation({
      mutationFn: async (newValue: string) => {
        const response = await fetch(`/api/phone-number`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: newValue,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to update phone number");
        }
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user", session.user.id] });
      },
    });

  const { mutate: deletePhoneNumber, isPending: deletePhoneNumberIsPending } =
    useMutation({
      mutationFn: async () => {
        const response = await fetch(`/api/phone-number`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to delete phone number");
        }
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user", session.user.id] });
      },
    });

  function handleToggleEmailNotifications() {
    const currentValue = userData?.alertNotification || false;
    updateEmailNotification(!currentValue);
  }

  function handleToggleSMSNotifications() {
    const currentValue = userData?.smsNotification || false;
    updateSMSNotification(!currentValue);
  }

  function handleUpdateUserPhoneNumber(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (phoneNumber.length === 10) {
      updatePhoneNumber(phoneNumber);
      setPhoneNumber("");
      setIsPhoneDialogOpen(false);
    }
  }

  function formatPhoneNumber(phone: string) {
    if (!phone) return "Not set";
    if (phone.startsWith("+63")) {
      return `0${phone.slice(3)}`;
    }
    if (phone.startsWith("9") && phone.length === 10) {
      return `0${phone}`;
    }
    return phone;
  }

  return (
    <div className="grid gap-3">
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 md:gap-4">
            <Image
              src={
                session.user?.image ||
                (session.user as any)?.profileImage ||
                "/placeholder-avatar.svg"
              }
              width={45}
              height={45}
              alt={`${session.user?.name ?? ""} name`}
              className="size-11 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold">{session.user?.name}</p>
              <p className="text-muted-foreground truncate text-sm font-medium">
                {session.user?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0">
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="grid items-center gap-1">
              <p className="text-foreground/80 text-sm">Phone Number:</p>
              {userDataIsLoading ? (
                <div className="bg-card-foreground/10 h-6 w-24 animate-pulse rounded-md"></div>
              ) : (
                <p className="text-foreground/90 font-medium">
                  {formatPhoneNumber(rawPhone)}
                </p>
              )}
            </div>
            {!rawPhone && (
              <Button
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setIsPhoneDialogOpen(true)}
              >
                Set now
              </Button>
            )}
            {rawPhone && (
              <Button
                variant="secondary"
                className="cursor-pointer"
                disabled={userDataIsLoading || deletePhoneNumberIsPending}
                aria-disabled={userDataIsLoading || deletePhoneNumberIsPending}
                onClick={() => setIsDeletePhoneAlertOpen(true)}
              >
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set new phone number</DialogTitle>
            <DialogDescription>
              Enter your phone number below and click save to update your
              profile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUserPhoneNumber}>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="phone-number">Phone number</Label>
                <Input
                  id="phone-number"
                  name="phone-number"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  minLength={10}
                  pattern="9[0-9]{9}"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length === 0) {
                      setPhoneNumber("");
                    } else {
                      if (value[0] !== "9") {
                        value = "9" + value.replace(/^9*/, "");
                      }
                      setPhoneNumber(value.slice(0, 10));
                    }
                  }}
                  value={phoneNumber}
                  placeholder="9XXXXXXXXX"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPhoneDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  phoneNumber?.length !== 10 || updatePhoneNumberIsPending
                }
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeletePhoneAlertOpen}
        onOpenChange={setIsDeletePhoneAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Phone Number?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your phone number? You will no
              longer receive SMS notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeletePhoneAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deletePhoneNumber();
                setIsDeletePhoneAlertOpen(false);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0">
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-row items-center justify-between gap-2">
            <div className="text-foreground/80 text-sm">
              Receive email alerts when an earthquake activity is detected.
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                if (!userDataIsLoading && !updateEmailNotificationIsPending) {
                  setIsEmailAlertOpen(true);
                }
              }}
            >
              <Switch
                checked={!!userData?.alertNotification}
                className="cursor-pointer"
                disabled={userDataIsLoading || updateEmailNotificationIsPending}
                aria-disabled={
                  userDataIsLoading || updateEmailNotificationIsPending
                }
              />
            </div>
          </div>
          <div className="mb-4 flex flex-row items-center justify-between gap-2">
            <div className="text-foreground/80 text-sm">
              Receive SMS notifications when an earthquake activity is detected.
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                if (
                  !userDataIsLoading &&
                  !updateSMSNotificationIsPending &&
                  rawPhone
                ) {
                  setIsSmsAlertOpen(true);
                }
              }}
            >
              <Switch
                checked={userData?.smsNotification ? true : false}
                className="cursor-pointer"
                disabled={
                  userDataIsLoading ||
                  updateSMSNotificationIsPending ||
                  !rawPhone
                }
                aria-disabled={
                  userDataIsLoading ||
                  updateSMSNotificationIsPending ||
                  !rawPhone
                }
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="text-foreground/80 text-sm">
              Customize the application appearance to match your preferred
              theme.
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost">
                  <span>
                    {theme
                      ? theme.charAt(0).toUpperCase() + theme.slice(1)
                      : "System"}
                  </span>
                  <ChevronsUpDown className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isEmailAlertOpen} onOpenChange={setIsEmailAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userData?.alertNotification
                ? "Disable Earthquake Notifications?"
                : "Enable Earthquake Notifications?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userData?.alertNotification
                ? "You will no longer receive email alerts when earthquake activity is detected."
                : "You will receive email alerts when earthquake activity is detected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsEmailAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleToggleEmailNotifications();
                setIsEmailAlertOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSmsAlertOpen} onOpenChange={setIsSmsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userData?.smsNotification
                ? "Disable SMS Notifications?"
                : "Enable SMS Notifications?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userData?.smsNotification
                ? "You will no longer receive SMS notifications when earthquake activity is detected."
                : "You will receive SMS notifications when earthquake activity is detected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsSmsAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleToggleSMSNotifications();
                setIsSmsAlertOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
