import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParkingSpotStore } from "@/store/parkingSpotStore";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, DollarSign } from "lucide-react";
import { AddSpotDialog } from "@/components/AddSpotDialog";

export default function MySpots() {
  const { user } = useAuth();
  const { userSpots, loading, fetchUserSpots } = useParkingSpotStore();

  useEffect(() => {
    if (user) {
      fetchUserSpots();
    }
  }, [user, fetchUserSpots]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Parking Spots</h1>
          <AddSpotDialog />
        </div>
      </header>

      <main className="container mx-auto max-w-lg p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : userSpots && userSpots.length > 0 ? (
          <div className="space-y-4">
            {userSpots.map((spot) => (
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
                    <Badge variant={spot.is_available ? "default" : "secondary"}>
                      {spot.is_available ? "Available" : "Unavailable"}
                    </Badge>
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
            <p className="mb-4 text-muted-foreground">
              You haven't listed any parking spots yet.
            </p>
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
