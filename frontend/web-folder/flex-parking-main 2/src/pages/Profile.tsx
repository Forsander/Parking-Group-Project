import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVehicleStore } from "@/store/vehicleStore";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Mail, Car } from "lucide-react";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { PageHeader } from "@/components/PageHeader";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { vehicles, loading, fetchVehicles } = useVehicleStore();
  const prettyRole = (role?: string) =>
    role ? role.replace(/^ROLE_/, "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "—";
  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user, fetchVehicles]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Profile" logoSrc="favicon.ico" />

      <main className="container mx-auto max-w-lg p-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{prettyRole(user?.role)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  My Vehicles
                </CardTitle>
                <AddVehicleDialog />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : vehicles && vehicles.length > 0 ? (
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.color}</p>
                          <Badge variant="outline" className="mt-1">
                            {vehicle.plate}
                          </Badge>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>L: {vehicle.length_cm}cm</p>
                          <p>W: {vehicle.width_cm}cm</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No vehicles added yet
                </p>
              )}
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
