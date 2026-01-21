export async function trackShipment(awb: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tracking/${awb}`);
  if (!res.ok) throw new Error("Tracking failed");
  return await res.json(); // JSON now
}
