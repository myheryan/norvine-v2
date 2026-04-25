// test-pay.js
const simulate = async () => {
  const secretKey = "xnd_development_3t1GHDC5oMPUNMlQPGlUOwP7ZsQnjuUmQ3wNlWwf0fmyLOG0eqyqlaEEmBGa";
  // Ganti dengan QR ID terbaru yang Bapak dapat dari proses checkout
  const qrId = "qr_3400187c-1e3c-45ca-9b00-92df276f0566"; 

  
  const auth = Buffer.from(secretKey + ":").toString('base64');
  const url = `https://api.xendit.co/qr_codes/${qrId}/payments/simulate`;

  console.log("🚀 Mencoba menembak URL:", url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  
  const data = await res.json();
  console.log("📩 Respon Xendit:", data);
};

simulate();