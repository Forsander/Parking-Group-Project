import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParkingSpotStore } from "@/store/parkingSpotStore";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, DollarSign, Trash2 } from "lucide-react";
import { AddSpotDialog } from "@/components/AddSpotDialog";
import { PageHeader } from "@/components/PageHeader";
import { useBookingStore } from "@/store/bookingStore";
import { toast } from "sonner";

export default function MySpots() {
  const { user } = useAuth();
  const { userSpots, loading, fetchUserSpots, deleteSpot, activateSpot } = useParkingSpotStore();

  const {
    pendingRequests,
    fetchPendingForOwner,
    acceptBooking,
    rejectBooking,
    ownerBookings,
    fetchOwnerBookings,
  } = useBookingStore();

  const lockedSpotIds = new Set<number>((ownerBookings ?? []).map((b: any) => Number(b.spotId)));

  useEffect(() => {
    if (user) {
      fetchUserSpots();
      fetchPendingForOwner();
      fetchOwnerBookings();
    }
  }, [user, fetchUserSpots, fetchPendingForOwner, fetchOwnerBookings]);

  const visibleSpots = (userSpots ?? []).filter((s) => s.active || lockedSpotIds.has(s.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="My Parking Spots" logoSrc="/favicon.ico">
        <div className="flex justify-end">
          <AddSpotDialog />
        </div>
      </PageHeader>

      <main className="container mx-auto max-w-lg p-4">
        {pendingRequests.length > 0 && (
          <div className="mb-4 space-y-2">
            <h2 className="text-sm font-semibold">Pending Requests</h2>

            {pendingRequests.map((b: any) => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{b.spotLocation ?? `Spot #${b.spotId}`}</div>
                    <div className="text-sm text-muted-foreground">
                      {b.startTime} → {b.endTime}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await acceptBooking(b.id);
                          toast.success("Accepted");
                          await fetchPendingForOwner();
                          await fetchUserSpots();
                          await fetchOwnerBookings();
                        } catch (e: any) {
                          toast.error(e?.message || "Failed to accept");
                        }
                      }}
                    >
                      Accept
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await rejectBooking(b.id);
                          toast.success("Declined");
                          await fetchPendingForOwner();
                          await fetchUserSpots();
                          await fetchOwnerBookings();
                        } catch (e: any) {
                          toast.error(e?.message || "Failed to decline");
                        }
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : visibleSpots.length > 0 ? (
          <div className="space-y-4">
            {visibleSpots.map((spot) => (
              <Card key={spot.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{spot.title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {spot.address}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={spot.active ? "default" : "secondary"}>
                        {spot.active ? "Available" : "Booked"}
                      </Badge>

                      {!spot.active && lockedSpotIds.has(spot.id) && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await activateSpot(spot.id);
                              toast.success("Activated");
                              await fetchUserSpots();
                              await fetchOwnerBookings();
                            } catch (e: any) {
                              toast.error(e?.message || "Failed to activate");
                            }
                          }}
                        >
                          Activate
                        </Button>
                      )}

                      {spot.active && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={async () => {
                            if (!confirm("Remove this spot from listings?")) return;
                            try {
                              await deleteSpot(spot.id);
                              toast.success("Removed from listings");
                              await fetchUserSpots();
                              await fetchOwnerBookings();
                            } catch (e: any) {
                              toast.error(e?.message || "Failed to remove listing");
                            }
                          }}
                          aria-label="Remove listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {spot.description && (
                    <p className="mb-3 text-sm text-muted-foreground">{spot.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                      <DollarSign className="h-5 w-5" />
                      {spot.price_per_hour}/hr
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">You haven't listed any parking spots yet.</p>
            <AddSpotDialog
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  List Your First Spot
                </Button>
              }
            />
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}