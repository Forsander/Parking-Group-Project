import { useState, useEffect } from "react";
import { useParkingSpotStore } from "@/store/parkingSpotStore";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Search, Calendar } from "lucide-react";
import { BookingDialog } from "@/components/BookingDialog";
import { format } from "date-fns";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { spots, loading, fetchActiveSpots } = useParkingSpotStore();

  useEffect(() => {
    fetchActiveSpots();
  }, [fetchActiveSpots]);

  const filteredSpots = spots?.filter(
    (spot) =>
      spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookSpot = (spotId: string) => {
    setSelectedSpot(spotId);
    setBookingDialogOpen(true);
  };

  const selectedSpotData = spots?.find((s) => s.id === selectedSpot);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b bg-card p-4">
        <h1 className="mb-3 text-2xl font-bold">Find Parking</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by location or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredSpots && filteredSpots.length > 0 ? (
          <div className="space-y-4">
            {filteredSpots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{spot.title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {spot.address}
                        {spot.city && `, ${spot.city}`}
                        {spot.country && `, ${spot.country}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {spot.description && (
                    <p className="text-sm text-muted-foreground">{spot.description}</p>
                  )}
                  {(spot.available_from || spot.available_to) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {spot.available_from && format(new Date(spot.available_from), "MMM d")} 
                      {spot.available_to && ` - ${format(new Date(spot.available_to), "MMM d, yyyy")}`}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        {spot.price_per_hour}/hr
                        {spot.price_per_day && ` • $${spot.price_per_day}/day`}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleBookSpot(spot.id)}>
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No parking spots available yet.</p>
          </div>
        )}
      </main>

      {selectedSpotData && (
        <BookingDialog
          spotId={selectedSpot!}
          pricePerHour={Number(selectedSpotData.price_per_hour)}
          pricePerDay={Number(selectedSpotData.price_per_day || 0)}
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
        />
      )}

      <BottomNav />
    </div>
  );
}
