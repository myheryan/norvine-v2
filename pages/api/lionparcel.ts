import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const response = await fetch(process.env.LIONPARCEL_STG_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.LIONPARCEL_STG_TOKEN!,
        'Timezone': '+07:00'
      },
      body: JSON.stringify(req.body) // Data kiriman dari frontend Norvine
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}