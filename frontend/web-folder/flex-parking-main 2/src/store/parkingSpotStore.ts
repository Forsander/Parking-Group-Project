import { create } from 'zustand';
import api, { ApiResponse } from '@/lib/api';

export interface ParkingSpot {
  id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  available_from: string;
  available_to: string;
  price_per_hour: number;
  price_per_day: number;
  is_available: boolean;
}

interface ParkingSpotState {
  spots: ParkingSpot[];
  userSpots: ParkingSpot[];
  loading: boolean;
  fetchActiveSpots: () => Promise<void>;
  fetchUserSpots: () => Promise<void>;
  fetchSpotsByCity: (city: string) => Promise<void>;
  fetchSpotsByCityAndTime: (city: string, startTime: string, endTime: string) => Promise<void>;
  createSpot: (spot: Partial<Omit<ParkingSpot, 'id' | 'is_available'>>) => Promise<void>;
  updateSpot: (id: string, spot: Partial<Omit<ParkingSpot, 'id' | 'is_available'>>) => Promise<void>;
  deleteSpot: (id: string) => Promise<void>;
  activateSpot: (id: string) => Promise<void>;
  deactivateSpot: (id: string) => Promise<void>;
}

export const useParkingSpotStore = create<ParkingSpotState>((set) => ({
  spots: [],
  userSpots: [],
  loading: false,

  fetchActiveSpots: async () => {
    set({ loading: true });
    const response = await api.get<ApiResponse<ParkingSpot[]>>('/parking-spots/all/active-spots');
    set({ spots: response.data.data, loading: false });
  },

  fetchUserSpots: async () => {
    set({ loading: true });
    const response = await api.get<ApiResponse<ParkingSpot[]>>('/parking-spots/all/user-spots');
    set({ userSpots: response.data.data, loading: false });
  },

  fetchSpotsByCity: async (city: string) => {
    set({ loading: true });
    const response = await api.get<ApiResponse<ParkingSpot[]>>(`/parking-spots/all/active-spots/${city}`);
    set({ spots: response.data.data, loading: false });
  },

  fetchSpotsByCityAndTime: async (city: string, startTime: string, endTime: string) => {
    set({ loading: true });
    const response = await api.get<ApiResponse<ParkingSpot[]>>(
      `/parking-spots/all/active-spots/${city}/from/${startTime}/to/${endTime}`
    );
    set({ spots: response.data.data, loading: false });
  },

  createSpot: async (spot) => {
    const response = await api.post<ApiResponse<ParkingSpot>>('/parking-spots/create', spot);
    set((state) => ({ userSpots: [...state.userSpots, response.data.data] }));
  },

  updateSpot: async (id, spot) => {
    const response = await api.put<ApiResponse<ParkingSpot>>(
      `/parking-spots/parking-spot/${id}/update`,
      spot
    );
    set((state) => ({
      userSpots: state.userSpots.map((s) => (s.id === id ? response.data.data : s)),
    }));
  },

  deleteSpot: async (id) => {
    await api.delete(`/parking-spots/parking-spot/${id}/delete`);
    set((state) => ({ userSpots: state.userSpots.filter((s) => s.id !== id) }));
  },

  activateSpot: async (id) => {
    const response = await api.put<ApiResponse<ParkingSpot>>(
      `/parking-spots/parking-spot/${id}/activate`
    );
    set((state) => ({
      userSpots: state.userSpots.map((s) => (s.id === id ? response.data.data : s)),
    }));
  },

  deactivateSpot: async (id) => {
    const response = await api.put<ApiResponse<ParkingSpot>>(
      `/parking-spots/parking-spot/${id}/deactivate`
    );
    set((state) => ({
      userSpots: state.userSpots.map((s) => (s.id === id ? response.data.data : s)),
    }));
  },
}));
