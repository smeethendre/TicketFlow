import { ShowBookingClient } from "@/components/show-booking-client";

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ShowBookingClient showId={id} />;
}
