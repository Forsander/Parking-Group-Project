import { create } from 'zustand';
import api, { ApiResponse } from '@/lib/api';

export interface Booking {
  id: string;
  spotId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  parking_spot?: {
    title: string;
    address: string;
    price_per_hour: number;
  };
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  fetchRenterBookings: (renterId: string) => Promise<void>;
  fetchSpotBookings: (spotId: string) => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  createBooking: (booking: { spotId: string; startTime: string; endTime: string }) => Promise<void>;
  updateBooking: (id: string, booking: { spotId: string; startTime: string; endTime: string }) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  loading: false,

  fetchRenterBookings: async (renterId: string) => {
    set({ loading: true });
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/renter/${renterId}`);
    set({ bookings: response.data.data, loading: false });
  },

  fetchSpotBookings: async (spotId: string) => {
    set({ loading: true });
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/spot/${spotId}`);
    set({ bookings: response.data.data, loading: false });
  },

  fetchAllBookings: async () => {
    set({ loading: true });
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/');
    set({ bookings: response.data.data, loading: false });
  },

  createBooking: async (booking) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings/create', booking);
    set((state) => ({ bookings: [...state.bookings, response.data.data] }));
  },

  updateBooking: async (id, booking) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/update`, booking);
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? response.data.data : b)),
    }));
  },

  cancelBooking: async (id) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/booking/${id}/cancel`);
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? response.data.data : b)),
    }));
  },
}));
