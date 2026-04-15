import VerifyClient from '@/components/verify/verifyClient'; // Sesuaikan path import jika berbeda
import HeadMeta from '@/components/HeadMeta';

export default function VerifyPage() {
  return (
    <>
    <HeadMeta
        title='Cek Keaslian Produk Norvine | Product Verification'
        description='Pastikan produk suplemen kesehatan Norvine Anda 100% original. Masukkan 16 digit security code dari stiker hologram untuk cek keaslian.'
    />
        <main>
      {/* Panggil Client Component yang sudah dibuat di Langkah 1 */}
      <VerifyClient />
    </main>
    </>

  );
}