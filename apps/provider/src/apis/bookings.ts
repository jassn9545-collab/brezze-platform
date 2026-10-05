import api from './api';

export type ServiceBookingStatus = 'pending' | 'accepted' | 'rejected';

export type ServiceBooking = {
  id: number;
  catalog_id: number;
  service_title: string;
  service_image: string | null;
  price: string;
  note: string | null;
  status: ServiceBookingStatus;
  project_id: number | null;
  conversation_id: number | null;
  client: {id: number; name: string; profile_image: string | null};
  provider: {id: number; name: string; profile_image: string | null};
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getServiceBookings(): Promise<{
  bookings: ServiceBooking[];
  pendingCount: number;
}> {
  const response = await api.get('/freelancer/service-bookings');
  return {
    bookings: response.data.data.bookings ?? [],
    pendingCount: response.data.data.pending_count ?? 0,
  };
}

export async function respondToServiceBooking(
  bookingId: number,
  action: 'accept' | 'reject',
): Promise<ServiceBooking> {
  const response = await api.post(
    `/freelancer/service-bookings/${bookingId}/respond`,
    {action},
  );
  return response.data.data.booking;
}
