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

export async function getServiceBookings(
  catalogId?: number,
): Promise<ServiceBooking[]> {
  const response = await api.get('/client/service-bookings', {
    params: catalogId ? {catalog_id: catalogId} : undefined,
  });
  return response.data.data.bookings ?? [];
}

export async function createServiceBooking(
  catalogId: number,
  note?: string,
): Promise<ServiceBooking> {
  const response = await api.post('/client/service-bookings', {
    catalog_id: catalogId,
    ...(note ? {note} : {}),
  });
  return response.data.data.booking;
}
