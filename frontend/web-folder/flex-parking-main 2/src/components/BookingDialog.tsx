import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useVehicleStore } from "@/store/vehicleStore";
import { useBookingStore } from "@/store/bookingStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const bookingSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});


type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingDialogProps {
  spotId: number; 
  pricePerHour: number;
  pricePerDay: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked?: () => void;
  availableFrom?: string;
  availableTo?: string;
}

export function BookingDialog({
  spotId,
  pricePerHour,
  pricePerDay,
  open,
  onOpenChange,
  onBooked,
  availableFrom,
  availableTo,
}: BookingDialogProps) {
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { createBooking } = useBookingStore();
  const withSeconds = (v: string) => (v.length === 16 ? `${v}:00` : v);
  const toLocalInput = (iso?: string) => (iso ? iso.slice(0, 16) : undefined);



  useEffect(() => {
    if (open) fetchVehicles();
  }, [open, fetchVehicles]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { startTime: "", endTime: "" },
  });

  const calculatePrice = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

    if (hours >= 24) {
      const days = Math.ceil(hours / 24);
      return days * pricePerDay;
    }
    return hours * pricePerHour;
  };

  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const totalPrice = calculatePrice(startTime, endTime);

  const onSubmit = async (values: BookingFormValues) => {
    try {
      await createBooking({
        spotId,
        startTime: withSeconds(values.startTime),
        endTime: withSeconds(values.endTime),
      });

      onBooked?.();
      toast.success("Booking created successfully!");
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create booking");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Parking Spot</DialogTitle>
        </DialogHeader>

        {!vehicles || vehicles.length === 0 ? (
          <div className="py-4 text-center">
            <p className="mb-4 text-muted-foreground">You need to add a vehicle before booking.</p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={toLocalInput(availableFrom)}
                        max={toLocalInput(availableTo)}
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={toLocalInput(availableFrom)}
                        max={toLocalInput(availableTo)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {totalPrice > 0 && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-slate-500">Total Price: ${totalPrice.toFixed(2)}</p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Confirm Booking
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}