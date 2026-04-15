import prisma from "./prisma";

export async function getCalculatedShipping(postalCode: string, items: any[]) {
  // 1. Cek status fitur di database
  const shippingSetup = await prisma.shippingProvider.findUnique({
    where: { code: "LION_PARCEL" }
  });

  // Jika tidak ada atau nonaktif, kembalikan null/kosong
  if (!shippingSetup || !shippingSetup.isActive) {
    return { active: false, services: [] };
  }

  try {
    const totalWeight = items.reduce((sum, i) => sum + (i.weight * i.quantity), 0);

    const res = await fetch("https://api-stg.lionparcel.com/v1/rates", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${shippingSetup.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        origin_postal_code: (shippingSetup.config as any)?.origin_zip || "12345",
        destination_postal_code: postalCode,
        weight: totalWeight || 1, // Minimal 1kg
        commodity_id: "GEN"
      })
    });

    const data = await res.json();
    return { active: true, services: data.services || [] };
  } catch (error) {
    console.error("Shipping Engine Error:", error);
    return { active: false, services: [] };
  }
}