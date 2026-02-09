import { create } from "zustand";
import { api } from "@/lib/api";

export interface Vehicle {
  id: string;
  model: string;
  color: string;
  plate: string;
  length_cm: number;
  width_cm: number;
}

interface VehicleState {
  vehicles: Vehicle[];
  loading: boolean;
  fetchVehicles: () => Promise<void>;
  createVehicle: (vehicle: Partial<Omit<Vehicle, "id">>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Omit<Vehicle, "id">>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  loading: false,

  fetchVehicles: async () => {
    set({ loading: true });
    const vehicles = await api.get<Vehicle[]>("/vehicles/all/user-vehicles");
    set({ vehicles, loading: false });
  },

  createVehicle: async (vehicle) => {
    const created = await api.post<Vehicle>("/vehicles/create", vehicle);
    set((state) => ({ vehicles: [...state.vehicles, created] }));
  },

  updateVehicle: async (id, vehicle) => {
    const updated = await api.put<Vehicle>(`/vehicles/vehicle/${id}/update`, vehicle);
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)),
    }));
  },

  deleteVehicle: async (id) => {
    await api.del(`/vehicles/vehicle/${id}/delete`);
    set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) }));
  },
}));

