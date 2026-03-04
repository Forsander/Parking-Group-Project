import { create } from "zustand";
import { api } from "@/lib/api";

export interface Booking {
  id: number;
  spotId: number;
  renterId?: number;
  startTime: string;
  endTime: string;
  totalAmount?: number;
  status?: string;
  clientSecret?: string;
  spotLocation?: string;

  parking_spot?: {
    title: string;
    address: string;
    price_per_hour: number;
  };
}

type CreateBookingPayload = {
  spotId: number;
  startTime: string; // "2026-02-10T10:00"
  endTime: string;   // "2026-02-10T12:00"
};

interface BookingState {
  bookings: Booking[];
  loading: boolean;

  fetchRenterBookings: (renterId: number) => Promise<void>;
  fetchSpotBookings: (spotId: number) => Promise<void>;
  fetchAllBookings: () => Promise<void>;

  createBooking: (payload: CreateBookingPayload) => Promise<Booking>;
  updateBooking: (id: number, payload: CreateBookingPayload) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;

  pendingRequests: any[];
  fetchPendingForOwner: () => Promise<void>;
  acceptBooking: (bookingId: number) => Promise<void>;
  rejectBooking: (bookingId: number) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  loading: false,

  pendingRequests: [],

  fetchRenterBookings: async (renterId: number) => {
    set({ loading: true });
    const bookings = await api.get<Booking[]>(`/bookings/renter/${renterId}`);
    set({ bookings, loading: false });
  },

  fetchSpotBookings: async (spotId: number) => {
    set({ loading: true });
    const bookings = await api.get<Booking[]>(`/bookings/spot/${spotId}`);
    set({ bookings, loading: false });
  },

  fetchAllBookings: async () => {
    set({ loading: true });
    const bookings = await api.get<Booking[]>(`/bookings/`);
    set({ bookings, loading: false });
  },

  createBooking: async (payload: CreateBookingPayload) => {
    const body = {
      spotId: Number(payload.spotId),
      startTime: payload.startTime,
      endTime: payload.endTime,
    };

    const created = await api.post<Booking>("/bookings/create", body);

    set((state) => ({ bookings: [created, ...state.bookings] }));
    return created;
  },

  updateBooking: async (id: number, payload: CreateBookingPayload) => {
    const body = {
      spotId: Number(payload.spotId),
      startTime: payload.startTime,
      endTime: payload.endTime,
    };

    const updated = await api.put<Booking>(`/bookings/${id}/update`, body);

    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
    }));
  },

  cancelBooking: async (id: number) => {
    const updated = await api.put<Booking>(`/bookings/booking/${id}/cancel`);

    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
    }));
  },

    fetchPendingForOwner: async () => {
        const pendingRequests = await api.get<any[]>(`/bookings/owner/pending`);
        set({ pendingRequests });
    },

    acceptBooking: async (bookingId: number) => {
        const updated = await api.put<any>(`/bookings/${bookingId}/accept`);
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((b) => b.id !== bookingId),
          bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)),
        }));
    },

    rejectBooking: async (bookingId: number) => {
        const updated = await api.put<any>(`/bookings/${bookingId}/reject`);
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((b) => b.id !== bookingId),
          bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)),
        }));
    },
}));