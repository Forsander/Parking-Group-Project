import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBookingStore } from "@/store/bookingStore";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Bookings() {
  const { user } = useAuth();
  const { bookings, loading, fetchRenterBookings, cancelBooking } = useBookingStore();

  useEffect(() => {
    if (user?.id) {
      fetchRenterBookings(user.id);
    }
  }, [user?.id, fetchRenterBookings]);

  const prettyStatus = (s?: string) => {
    const u = (s || "").toUpperCase();
    if (u === "CONFIRMED") return "Confirmed";
    if (u === "PENDING") return "Pending";
    if (u === "CANCELLED") return "Declined";
    if (u === "COMPLETED") return "Completed";
    if (u === "ACTIVE") return "Active";
    return s || "—";
  };

  const statusVariant = (s?: string): "default" | "secondary" | "destructive" | "outline" => {
    const u = (s || "").toUpperCase();
    if (u === "CONFIRMED") return "default";
    if (u === "PENDING") return "secondary";
    if (u === "CANCELLED") return "destructive";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="My Bookings" logoSrc="/favicon.ico" />

      <main className="container mx-auto max-w-lg p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusUpper = (booking.status || "").toUpperCase();
              const canCancel = statusUpper === "PENDING" || statusUpper === "CONFIRMED" || statusUpper === "ACTIVE";

              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{booking.parking_spot?.title ?? "Booking"}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1 text-slate-700">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span className="truncate">
                            {booking.spotLocation ?? booking.parking_spot?.address ?? "—"}
                          </span>
                        </CardDescription>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {booking.status && (
                          <Badge
                            className={
                              booking.status.toUpperCase() === "CONFIRMED"
                                ? "bg-green-600 text-white"
                                : "text-slate-800"
                            }
                            variant={statusVariant(booking.status)}
                          >
                            {prettyStatus(booking.status)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>
                        {format(new Date(booking.startTime), "PPp")} - {format(new Date(booking.endTime), "p")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <DollarSign className="h-5 w-5 text-slate-600" />
                        {booking.totalAmount}
                      </div>

                      {canCancel && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (!confirm("Cancel this booking?")) return;
                            try {
                              await cancelBooking(booking.id);
                              toast.success("Booking cancelled");
                              if (user?.id) await fetchRenterBookings(user.id);
                            } catch (e: any) {
                              toast.error(e?.message || "Failed to cancel booking");
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-600">No bookings yet.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}