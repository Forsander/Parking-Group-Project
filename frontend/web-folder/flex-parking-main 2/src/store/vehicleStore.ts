import { create } from 'zustand';
import api, { ApiResponse } from '@/lib/api';

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
  createVehicle: (vehicle: Partial<Omit<Vehicle, 'id'>>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Omit<Vehicle, 'id'>>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  loading: false,

  fetchVehicles: async () => {
    set({ loading: true });
    const response = await api.get<ApiResponse<Vehicle[]>>('/vehicles/all/user-vehicles');
    set({ vehicles: response.data.data, loading: false });
  },

  createVehicle: async (vehicle) => {
    const response = await api.post<ApiResponse<Vehicle>>('/vehicles/create', vehicle);
    set((state) => ({ vehicles: [...state.vehicles, response.data.data] }));
  },

  updateVehicle: async (id, vehicle) => {
    const response = await api.put<ApiResponse<Vehicle>>(`/vehicles/vehicle/${id}/update`, vehicle);
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? response.data.data : v)),
    }));
  },

  deleteVehicle: async (id) => {
    await api.delete(`/vehicles/vehicle/${id}/delete`);
    set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) }));
  },
}));
