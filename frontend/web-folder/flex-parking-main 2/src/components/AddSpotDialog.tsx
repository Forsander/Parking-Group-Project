import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useParkingSpotStore } from "@/store/parkingSpotStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";

const spotSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  available_from: z.string().min(1, "Start date is required"),
  available_to: z.string().min(1, "End date is required"),
  price_per_hour: z.coerce.number().min(0),
  price_per_day: z.coerce.number().min(0),
});

type SpotFormValues = z.infer<typeof spotSchema>;

interface AddSpotDialogProps {
  trigger?: React.ReactNode;
}

export function AddSpotDialog({ trigger }: AddSpotDialogProps) {
  const [open, setOpen] = useState(false);
  const { createSpot } = useParkingSpotStore();

  const form = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: "",
      postal_code: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
      available_from: "",
      available_to: "",
      price_per_hour: 0,
      price_per_day: 0,
    },
  });

  const onSubmit = async (values: SpotFormValues) => {
    try {
      await createSpot(values);
      toast.success("Parking spot added successfully!");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add parking spot");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Spot
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Parking Spot</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Downtown Parking Spot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your parking spot..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address fields (still editable) */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Helsinki" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="00100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Finland" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Location Picker (A+B): search + click/drag marker.
                It updates address/city/postal_code/country + latitude/longitude in the form. */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Pick location on map</div>
              <LocationPicker
                value={{
                  latitude: form.watch("latitude") ?? null,
                  longitude: form.watch("longitude") ?? null,
                  address: form.watch("address"),
                  city: form.watch("city"),
                  postal_code: form.watch("postal_code"),
                  country: form.watch("country"),
                }}
                onChange={(next) => {
                  form.setValue("latitude", next.latitude ?? undefined, { shouldValidate: true });
                  form.setValue("longitude", next.longitude ?? undefined, { shouldValidate: true });

                  if (next.address !== undefined) form.setValue("address", next.address, { shouldValidate: true });
                  if (next.city !== undefined) form.setValue("city", next.city, { shouldValidate: true });
                  if (next.postal_code !== undefined) form.setValue("postal_code", next.postal_code, { shouldValidate: true });
                  if (next.country !== undefined) form.setValue("country", next.country, { shouldValidate: true });
                }}
              />
              <p className="text-xs text-muted-foreground">
                You can search an address, then click or drag the marker to set the exact spot. Latitude/Longitude will be saved automatically.
              </p>
            </div>

            {/* (Optional) show read-only lat/lng so user can see what will be saved */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    value={form.watch("latitude") ?? ""}
                    placeholder="Set via map"
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    value={form.watch("longitude") ?? ""}
                    placeholder="Set via map"
                  />
                </FormControl>
              </FormItem>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="available_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available From</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="available_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available To</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_per_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Hour ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Day ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="40.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Add Parking Spot
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}