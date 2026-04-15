import Link from 'next/link'
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md'
import { Desktop, Mobile } from '@/components/responsive'
import HeadMeta from '@/components/HeadMeta'


const question = [
  {
    question: 'Kebijakan Pengembalian dan Penukaran',
    answer: (
      <div>
        Pelanggan/customer (dalam Kebijakan Pengembalian dan Penukaran ini
        disebut sebagai “Anda”) dapat melakukan pengembalian dan penukaran
        produk, jika terdapat permasalahan dengan produk yang telah dibeli
        sesuai dengan ketentuan dan syarat yang berlaku. Berikut merupakan
        mekanisme, kriteria produk yang dapat dikembalikan/ditukarkan,
        persyaratan, dan ketentuan-ketentuan lainnya terkait pengembalian dan
        penukaran produk Norvine.
        <br />
        <br />
        Panduan pengembalian dan penukaran produk:
        <ul className="list-outside list-disc pl-8">
          <li>Anda dapat menghubungi kami melalui support@norvine.co.id</li>
          <li>Lakukan pengisian formulir R3 (Retail, Return and Refund)</li>
          <li>
            Setelah disetujui,Anda dapat mengirimkan produk ke alamat yang kami
            berikan Penukaran akan diproses dalam jangka waktu 14 hari kerja
            sejak formulir R3 disetujui
          </li>
          <li>Produk baru akan dikirimkan kembali kepada Anda</li>
        </ul>
        <br />
        <br />
        Berikut merupakan kriteria produk yang dapat diproses untuk pengembalian
        dan penukaran:
        <ol className="list-outside list-decimal pl-7">
          <li>Produk yang diterima sudah melewati tanggal kadaluarsa.</li>
          <li>
            Produk yang diterima memiliki periode kedaluwarsa kurang dari jumlah
            konsumsi per botol yang dianjurkan.
            <br />
          </li>
          <li>
            Kode verifikasi produk tidak terdaftar saat dilakukan verifikasi
            melalui situs web kami, dimana produk tersebut diperoleh dari toko
            resmi kami pada situs penjualan online.
            <br />
          </li>
          <li>
            Produk diterima dalam kondisi tidak tersegel, dimana produk tersebut
            diperoleh dari toko resmi kami pada situs penjualan online.
            <br />
          </li>
        </ol>
        <br />
        Adapun syarat penukaran dan pengembalian, antara lain :
        <ol className="list-outside list-decimal pl-7">
          <li>Produk belum dikonsumsi atau digunakan.</li>
          <li>
            Kemasan produk dalam kondisi baik, tidak terdapat kerusakan (pecah,
            retak, robek, dan lainnya), dan masih berada dalam kemasan aslinya.
          </li>
          <li>
            Pengajuan penukaran dan pengembalian dilakukan dalam jangka waktu 14
            hari setelah produk diterima.
          </li>
        </ol>
        <br />
        <br />
        Seluruh pengembalian produk harus dikirimkan ke gudang kami, dengan
        alamat sesuai yang tertera pada formulir R3 (Retail, Return and Refund).
        Kami berhak menolak pengembalian produk yang tidak memenuhi kriteria dan
        persyaratan pengembalian di atas sesuai kebijakan kami.
        <br />
        <br />
        Ketentuan terkait biaya - biaya yang mungkin timbul dalam proses
        pengembalian dan penukaran produk:
        <ul className="list-outside list-disc pl-8">
          <li>
            Kami tidak mengakomodasi biaya pengiriman/asuransi/lainnya untuk
            produk yang dikirimkan kembali kepada kami.
          </li>
          <li>
            Biaya pengiriman produk penukaran kepada Anda akan diakomodasi oleh
            kami. Sehingga, Anda tidak perlu membayar biaya pengiriman kembali.
          </li>
        </ul>
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-refund-main-1">
          Pelanggan/customer (dalam Kebijakan Pengembalian dan Penukaran ini
          disebut sebagai “Anda”) dapat melakukan pengembalian dan penukaran
          produk, jika terdapat permasalahan dengan produk yang telah dibeli
          sesuai dengan ketentuan dan syarat yang berlaku. Berikut merupakan
          mekanisme
        </span>
        <span id="mobile-refund-dots-1">...</span>
        <span id="mobile-refund-expanded-1">
          , kriteria produk yang dapat dikembalikan/ditukarkan, persyaratan, dan
          ketentuan-ketentuan lainnya terkait pengembalian dan penukaran produk
          Norvine.
          <br />
          <br />
          Panduan pengembalian dan penukaran produk:
          <ul className="list-outside list-disc pl-8">
            <li>Anda dapat menghubungi kami melalui support@norvine.co.id</li>
            <li>Lakukan pengisian formulir R3 (Retail, Return and Refund)</li>
            <li>
              Setelah disetujui,Anda dapat mengirimkan produk ke alamat yang
              kami berikan Penukaran akan diproses dalam jangka waktu 14 hari
              kerja sejak formulir R3 disetujui
            </li>
            <li>Produk baru akan dikirimkan kembali kepada Anda</li>
          </ul>
          <br />
          <br />
          Berikut merupakan kriteria produk yang dapat diproses untuk
          pengembalian dan penukaran:
          <ol className="list-outside list-decimal pl-7">
            <li>Produk yang diterima sudah melewati tanggal kadaluarsa.</li>
            <li>
              Produk yang diterima memiliki periode kedaluwarsa kurang dari
              jumlah konsumsi per botol yang dianjurkan.
              <br />
            </li>
            <li>
              Kode verifikasi produk tidak terdaftar saat dilakukan verifikasi
              melalui situs web kami, dimana produk tersebut diperoleh dari toko
              resmi kami pada situs penjualan online.
              <br />
            </li>
            <li>
              Produk diterima dalam kondisi tidak tersegel, dimana produk
              tersebut diperoleh dari toko resmi kami pada situs penjualan
              online.
              <br />
            </li>
          </ol>
          <br />
          Adapun syarat penukaran dan pengembalian, antara lain :
          <ol className="list-outside list-decimal pl-7">
            <li>Produk belum dikonsumsi atau digunakan.</li>
            <li>
              Kemasan produk dalam kondisi baik, tidak terdapat kerusakan
              (pecah, retak, robek, dan lainnya), dan masih berada dalam kemasan
              aslinya.
            </li>
            <li>
              Pengajuan penukaran dan pengembalian dilakukan dalam jangka waktu
              14 hari setelah produk diterima.
            </li>
          </ol>
          <br />
          <br />
          Seluruh pengembalian produk harus dikirimkan ke gudang kami, dengan
          alamat sesuai yang tertera pada formulir R3 (Retail, Return and
          Refund). Kami berhak menolak pengembalian produk yang tidak memenuhi
          kriteria dan persyaratan pengembalian di atas sesuai kebijakan kami.
          <br />
          <br />
          Ketentuan terkait biaya - biaya yang mungkin timbul dalam proses
          pengembalian dan penukaran produk:
          <ul className="list-outside list-disc pl-8">
            <li>
              Kami tidak mengakomodasi biaya pengiriman/asuransi/lainnya untuk
              produk yang dikirimkan kembali kepada kami.
            </li>
            <li>
              Biaya pengiriman produk penukaran kepada Anda akan diakomodasi
              oleh kami. Sehingga, Anda tidak perlu membayar biaya pengiriman
              kembali.
            </li>
          </ul>
        </span>
        <input type="checkbox" id="mobile-refund-check-1" />
        <br />
        <label
          id="mobile-refund-read-1"
          htmlFor="mobile-refund-check-1"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Pengembalian Dana',
    answer: (
      <div>
        Pengembalian dana hanya akan dapat dilakukan jika formulir R3 telah
        disetujui, dan dalam jangka waktu 14 hari kerja pihak Norvine tidak
        dapat mengirimkan kembali pengembalian produk sesuai dengan pesanan
        pembelian yang telah dilakukan, yang mungkin disebabkan karena produk
        out-of-stock. Apabila hal tersebut terjadi, maka nilai pengembalian dana
        kepada customer akan diberikan senilai pembelian yang telah dilakukan
        dan dibuktikan melalui invoice. Jika dalam kasus customer tidak
        mendapatkan invoice, nilai pengembalian dana akan didasarkan pada harga
        wajar sesuai pasar.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-refund-main-2">
          Pengembalian dana hanya akan dapat dilakukan jika formulir R3 telah
          disetujui, dan dalam jangka waktu 14 hari kerja pihak Norvine tidak
          dapat mengirimkan kembali pengembalian produk sesuai dengan pesanan
          pembelian yang telah dilakukan, yang mungkin disebabkan karena produk
          out-of-stock. Apabila hal tersebut terjadi, maka nilai pengembalian
        </span>
        <span id="mobile-refund-dots-2">...</span>
        <span id="mobile-refund-expanded-2">
          {' '}
          dana kepada customer akan diberikan senilai pembelian yang telah
          dilakukan dan dibuktikan melalui invoice. Jika dalam kasus customer
          tidak mendapatkan invoice, nilai pengembalian dana akan didasarkan
          pada harga wajar sesuai pasar.
        </span>
        <input type="checkbox" id="mobile-refund-check-2" />
        <br />
        <label
          id="mobile-refund-read-2"
          htmlFor="mobile-refund-check-2"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
]
export default function ReturnAndRefundPolicy() {
  return (
    <>
      <HeadMeta />
      <div>
      <Desktop>
        
        <div className="mb-14 flex h-32 items-center px-18 pt-16 pb-8">
          <MdOutlineKeyboardArrowLeft size={24} />
          <h5 className="txt-h5 ml-4 font-bold">
            Home .{' '}
            <span className="text-[#EC0000]">Return and Refund Policy</span>
          </h5>
        </div>
        <div className="px-56">
          <h1 className="txt-h1 mb-20 text-[#EC0000]">
            RETURN & <br />
            REFUND POLICY
          </h1>
          <div className="mb-52 space-y-16">
            {question.map(({ question, answer }, index) => {
              return (
                <div key={index}>
                  <h3 className="txt-h3 mb-4 text-[#1D1E20]">{question}</h3>
                  <div className="txt-body text-[#777777]">{answer}</div>
                </div>
              )
            })}
          </div>
        </div>
      </Desktop>
      <Mobile>
        
        <div className="px-4">
          <div className="mb-52 space-y-10">
            {question.map(({ question, mobileAnswer }, index) => {
              return (
                <div key={index}>
                  <h3 className="txt-mobile-h2 mb-4 text-[#1D1E20]">
                    {question}
                  </h3>
                  <div className="txt-mobile-body text-[#777777]">
                    {mobileAnswer}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Mobile>
    </div>
    </>
  
  )
}
