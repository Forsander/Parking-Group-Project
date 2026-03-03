import { create } from "zustand";
import { api } from "@/lib/api"; // use named export if you have it

export interface ParkingSpot {
  id: number;
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
  createSpot: (spot: Partial<Omit<ParkingSpot, "id" | "is_available">>) => Promise<void>;
  updateSpot: (id: number, spot: Partial<Omit<ParkingSpot, "id" | "is_available">>) => Promise<void>;
  deleteSpot: (id: number) => Promise<void>;
  activateSpot: (id: number) => Promise<void>;
  deactivateSpot: (id: number) => Promise<void>;
}

export const useParkingSpotStore = create<ParkingSpotState>((set) => ({
  spots: [],
  userSpots: [],
  loading: false,

  fetchActiveSpots: async () => {
    set({ loading: true });

    const res = await api.get<any>("/parking-spots/all/active-spots");

    // ✅ support either:
    // 1) backend returns ParkingSpot[] directly
    // 2) backend returns ApiResponse { message, data: ParkingSpot[] }
    const arr: any[] = Array.isArray(res) ? res : (res?.data ?? []);

    const spots = arr
      .map((s: any) => {
        // ✅ try common id field names
        const rawId =
          s?.id ??
          s?.spotId ??
          s?.spot_id ??
          s?.parkingSpotId ??
          s?.parking_spot_id;

        const id = Number(rawId);

        return {
          ...s,
          id, // force numeric
        };
      })
      .filter((s: any) => Number.isFinite(s.id) && s.id > 0);

    // If we filtered everything, log the first item so we can see what the backend actually sends
    if (arr.length > 0 && spots.length === 0) {
      console.log("⚠️ No valid spot ids found. First spot object was:", arr[0]);
    }

    set({ spots, loading: false });
  },

  fetchUserSpots: async () => {
    set({ loading: true });
    const userSpots = await api.get<ParkingSpot[]>("/parking-spots/all/user-spots");
    set({ userSpots, loading: false });
  },

  fetchSpotsByCity: async (city: string) => {
    set({ loading: true });
    const spots = await api.get<ParkingSpot[]>(`/parking-spots/all/active-spots/${city}`);
    set({ spots, loading: false });
  },

  fetchSpotsByCityAndTime: async (city: string, startTime: string, endTime: string) => {
    set({ loading: true });
    const spots = await api.get<ParkingSpot[]>(
      `/parking-spots/all/active-spots/${city}/from/${startTime}/to/${endTime}`
    );
    set({ spots, loading: false });
  },

  createSpot: async (spot) => {
    const created = await api.post<ParkingSpot>("/parking-spots/create", spot);
    set((state) => ({ userSpots: [...state.userSpots, created] }));
  },

  updateSpot: async (id, spot) => {
    const updated = await api.put<ParkingSpot>(`/parking-spots/parking-spot/${id}/update`, spot);
    set((state) => ({
      userSpots: state.userSpots.map((s) => (s.id === id ? updated : s)),
    }));
  },

  deleteSpot: async (id) => {
    await api.del(`/parking-spots/parking-spot/${id}/delete`);
    set((state) => ({ userSpots: state.userSpots.filter((s) => s.id !== id) }));
  },

  activateSpot: async (id) => {
    const updated = await api.put<ParkingSpot>(`/parking-spots/parking-spot/${id}/activate`);
    set((state) => ({
      userSpots: state.userSpots.map((s) => (s.id === id ? updated : s)),
    }));
  },

  deactivateSpot: async (id) => {
    const updated = await api.put<ParkingSpot>(`/parking-spots/parking-spot/${id}/deactivate`);
    set((state) => ({
      userSpots: state.userSpots.map((s) => (s.id === id ? updated : s)),
    }));
  },
}));
