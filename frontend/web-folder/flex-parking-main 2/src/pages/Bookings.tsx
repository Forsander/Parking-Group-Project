import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBookingStore } from "@/store/bookingStore";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader"

export default function Bookings() {
  const { user } = useAuth();
  const { bookings, loading, fetchRenterBookings } = useBookingStore();

  useEffect(() => {
    if (user?.id) {
      fetchRenterBookings(user.id);
    }
  }, [user?.id, fetchRenterBookings]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="My Bookings" logoSrc="favicon.ico" />

      <main className="container mx-auto max-w-lg p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.parking_spot?.title}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.parking_spot?.address}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(booking.startTime), "PPp")} -{" "}
                      {format(new Date(booking.endTime), "p")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <DollarSign className="h-5 w-5" />
                    {booking.totalAmount}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No bookings yet.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
