const URL_BOOKING = "https://api-stg-middleware.thelionparcel.com/client/booking";
const TOKEN = "Basic bGlvbnBhcmNlbDpsaW9ucGFyY2VsQDEyMw==";

async function testSTTBooking() {
  console.log("--- 🧪 TESTING STT BOOKING FOR CLIENT: NORVINE ---");

const payload = {
        "stt": {
            "stt_no": "", // Kosongkan karena akan di-generate sistem
            "stt_no_ref_external": `NORV-${Date.now()}`, 
            "stt_tax_number": "",
            "stt_goods_estimate_price": 150000,
            "stt_goods_status": "",
            "stt_origin": "CENGKARENG, JAKARTA BARAT",
            "stt_destination": "CENGKARENG, JAKARTA BARAT",
            "stt_sender_name": "NORVINE OFFICIAL",
            "stt_sender_phone": "+6281234567890", // Coba tanpa +62 dulu
            "stt_sender_address": "Jl.Rawa Buaya No.5H, Jakarta Barat",
            "stt_recipient_name": "Heryanto Harry",
            "stt_recipient_address": "Jl. Sudirman No. 123, Medan Petisah",
            "stt_recipient_phone": "089679393932",
            "stt_insurance_type": "free",
            "stt_product_type": "REGPACK",
            "stt_commodity_code": "ABR036",
            "stt_is_cod": false,
            "stt_is_woodpacking": false,
            "stt_pieces": [
                {
                    "stt_piece_length": 10,
                    "stt_piece_width": 10,
                    "stt_piece_height": 10,
                    "stt_piece_gross_weight": 1 // Satuan KG untuk struktur ini
                }
            ],
            "stt_piece_per_pack": 1,
            "stt_next_commodity": "",
            "stt_cod_amount": 0
        },
        "products": [
            {
                "name": "Norvine Premium T-Shirt",
                "variant": "Black XL",
                "qty": 1
            }
        ]
    };

  try {
    const response = await fetch(URL_BOOKING, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': TOKEN,
        'Timezone': '+07:00',
        'platform': 'web'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS: STT BERHASIL DI-BOOKING");
      console.log("Nomor STT (Resi):", data.data?.stt_no);
      console.log("Shipment ID:", data.data?.shipment_id);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ FAILED: Status ${response.status}`);
      console.log("Pesan Error:", JSON.stringify(data.message, null, 2));
    }
  } catch (error) {
    console.error("💥 ERROR KONEKSI:", error.message);
  }
}

testSTTBooking();