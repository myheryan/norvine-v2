import { useState } from 'react';

export default function RefundForm({ transactionId, totalAmount, onSuccess }: any) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return alert("Alasan wajib diisi.");
    setLoading(true);

    try {
      const res = await fetch('/api/refund/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, reason, amount: totalAmount })
      });
      const data = await res.json();

      if (res.ok) {
        alert("Permintaan refund terkirim. Menunggu tinjauan admin.");
        onSuccess?.();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Gagal koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="refund-box">
      <style jsx>{`
        .refund-box { 
          font-family: system-ui, -apple-system, sans-serif; 
          padding: 15px; border: 1px solid #eee; background: #fafafa;
        }
        p { font-size: 12px; color: #666; margin-bottom: 10px; }
        textarea { 
          width: 100%; padding: 10px; font-size: 13px; border: 1px solid #ddd; 
          border-radius: 0; outline: none; resize: none; margin-bottom: 10px;
        }
        button { 
          width: 100%; padding: 10px; background: #000; color: #fff; 
          border: none; font-size: 12px; font-weight: 500; cursor: pointer;
        }
        button:disabled { background: #ccc; }
      `}</style>

      <p>AJUKAN PENGEMBALIAN DANA</p>
      <textarea 
        rows={3} 
        placeholder="Berikan alasan (misal: Salah ukuran, barang rusak, dll)" 
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'MEMPROSES...' : 'KIRIM PERMINTAAN'}
      </button>
    </div>
  );
}