import type {
  AdminBooking,
  Booking,
  Hostel,
  HostelEvent,
  HostelListResponse,
} from "../types";
import { api } from "./client";

export type HostelInput = {
  name: string;
  gender: "Male" | "Female";
  capacity: number;
  priceKobo: number;
  description?: string;
  imageUrl?: string;
  active?: boolean;
};

export type EventInput = {
  name: string;
  opensAt?: string;
  closesAt?: string;
  active?: boolean;
};

export const hostelApi = {
  list: () => api.get<HostelListResponse>("/hostels"),
  myBookings: () => api.get<{ bookings: Booking[] }>("/hostels/bookings/me"),
  book: (hostelId: number) => api.post<{ booking: Booking }>("/hostels/bookings", { hostelId }),
  cancel: (id: number) => api.post<{ id: number; status: string }>(`/hostels/bookings/${id}/cancel`),

  // Admin
  adminHostels: () => api.get<{ hostels: Hostel[] }>("/hostels/admin/hostels"),
  adminCreateHostel: (input: HostelInput) => api.post<{ id: number }>("/hostels/admin/hostels", input),
  adminUpdateHostel: (id: number, input: HostelInput) =>
    api.put<{ id: number }>(`/hostels/admin/hostels/${id}`, input),
  adminEvents: () => api.get<{ events: HostelEvent[] }>("/hostels/admin/events"),
  adminUpsertEvent: (input: EventInput) => api.post<{ id: number }>("/hostels/admin/events", input),
  adminBookings: () => api.get<{ bookings: AdminBooking[] }>("/hostels/admin/bookings"),
  adminCheckIn: (id: number) =>
    api.post<{ id: number; checkedInAt: string | null }>(`/hostels/admin/bookings/${id}/check-in`),
};
