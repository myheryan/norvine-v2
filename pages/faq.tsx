import Link from 'next/link'
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md'

import { Desktop, Mobile } from '@/components/responsive'
import HeadMeta from '@/components/HeadMeta'


const question = [
  {
    question:
      '1. Bagaimana saya memastikan produk yang saya dapat adalah produk autentik?',
    answer: (
      <div>
        Periksa sticker hologram yang berada dibelakang produk, dan lakukan
        verifikasi serial number.
      </div>
    ),
    mobileAnswer: (
      <div>
        Periksa sticker hologram yang berada dibelakang produk, dan lakukan
        verifikasi serial number.
      </div>
    ),
  },
  {
    question: '2.	Apakah setiap produk Norvine dilengkapi dengan kode keamanan?',
    answer: (
      <div>
        Ya, setiap produk dilengkapi dengan produk keamanan yang dapat
        diverifikasi melalui situs web resmi.
      </div>
    ),
    mobileAnswer: (
      <div>
        Ya, setiap produk dilengkapi dengan produk keamanan yang dapat
        diverifikasi melalui situs web resmi.
      </div>
    ),
  },
  {
    question:
      '3.	Bagaimana melakukan verifikasi serial number pada produk saya?',
    answer: (
      <div>
        Gosok bagian &quot;scratch here&quot;, maka terdapat nomor serial unik.
        Masukan nomor tersebut pada laman{' '}
        {
          <a
            href="https://1jayatama.com/verify"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cursor-pointer text-[#EC0000]">
              {' '}
              https:/1jayatama.com/verify.
            </span>
          </a>
        }{' '}
        Apabila verifikasi berhasil, akan muncul pemberitahuan bahwa nomor
        serial tersebut pertama kali diverifikasi.
      </div>
    ),
    mobileAnswer: (
      <div>
        Gosok bagian &quot;scratch here&quot;, maka terdapat nomor serial unik.
        Masukan nomor tersebut pada laman{' '}
        {
          <a
            href="https://1jayatama.com/verify"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cursor-pointer text-[#EC0000]">
              {' '}
              https:/1jayatama.com/verify.
            </span>
          </a>
        }{' '}
        Apabila verifikasi berhasil, akan muncul pemberitahuan bahwa nomor
        serial tersebut pertama kali diverifikasi.
      </div>
    ),
  },
  {
    question: '4.	Bagaimana jika nomor serial unik saya tidak dapat ditemukan?',
    answer: (
      <div>
        Harap segera berhenti mengkonsumsi produk tersebut dan hubungi kami.
      </div>
    ),
    mobileAnswer: (
      <div>
        Harap segera berhenti mengkonsumsi produk tersebut dan hubungi kami.
      </div>
    ),
  },
  {
    question: '5.	Kapan sebenarnya saya membutuhkan suplemen?',
    answer: (
      <div>
        Jika Anda dapat menjaga asupan seluruh kebutuhan nutrisi tubuh, makan
        makanan sehat, dan mengonsumsi sayur-sayuran dan buah-buahan dengan
        cukup, maka mungkin Anda tidak perlu suplemen atau vitamin tambahan.
        Namun, jika hal-hal tersebut tidak dapat terpenuhi secara alami, maka
        suplementasi akan sangat membantu kebutuhan tubuh Anda.
      </div>
    ),
    mobileAnswer: (
      <div>
        Jika Anda dapat menjaga asupan seluruh kebutuhan nutrisi tubuh, makan
        makanan sehat, dan mengonsumsi sayur-sayuran dan buah-buahan dengan
        cukup, maka mungkin Anda tidak perlu suplemen atau vitamin tambahan.
        Namun, jika hal-hal tersebut tidak dapat terpenuhi secara alami, maka
        suplementasi akan sangat membantu kebutuhan tubuh Anda.
      </div>
    ),
  },
  {
    question: '6.	Siapa yang dapat mengonsumi Norvine Supplement?',
    answer: (
      <div>
        Norvine Supplement direkomendasikan bagi orang yang sudah berusia di
        atas 18 tahun atau sesuai dengan rekomendasi dari dokter/tenaga
        kesehatan lainnya.
      </div>
    ),
    mobileAnswer: (
      <div>
        Norvine Supplement direkomendasikan bagi orang yang sudah berusia di
        atas 18 tahun atau sesuai dengan rekomendasi dari dokter/tenaga
        kesehatan lainnya.
      </div>
    ),
  },
  {
    question:
      '7.	Bagaimana cara saya menentukan suplemen yang tepat untuk kebutuhan saya?',
    answer: (
      <div>
        Setiap orang memiliki kebutuhan akan suplemen yang berbeda-beda, cara
        yang tepat adalah dengan berkonsultasi dengan dokter atau tenaga
        kesehatan lain, maupun melalui serangkaian pengecekan kesehatan di
        laboratorium.
        <br />
        <br />
        Waktu terbaik untuk mengonsumsi suplemen didasarkan pada beberapa hal,
        seperti jenis bahan aktif/vitamin yang terkandung didalamnya serta
        efeknya terhadap tubuh. Seperti misalnya, multivitamin disarankan untuk
        diminum pada pagi hari atau siang hari setelah makan agar dapat diserap
        dengan baik oleh tubuh bersama makanan serta pada beberapa orang mungkin
        saja dapat memberikan efek pada kualitas tidur seseorang jika diminum
        pada malam hari.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-faq-main-7">
          Setiap orang memiliki kebutuhan akan suplemen yang berbeda-beda, cara
          yang tepat adalah dengan berkonsultasi dengan dokter atau tenaga
          kesehatan lain, maupun melalui serangkaian pengecekan kesehatan di
          laboratorium.
          <br />
          <br />
        </span>
        Waktu terbaik untuk mengonsumsi suplemen didasarkan pada beberapa hal
        <span id="mobile-faq-dots-7">...</span>
        <span id="mobile-faq-expanded-7">
          , seperti jenis bahan aktif/vitamin yang terkandung didalamnya serta
          efeknya terhadap tubuh. Seperti misalnya, multivitamin disarankan
          untuk diminum pada pagi hari atau siang hari setelah makan agar dapat
          diserap dengan baik oleh tubuh bersama makanan serta pada beberapa
          orang mungkin saja dapat memberikan efek pada kualitas tidur seseorang
          jika diminum pada malam hari.
        </span>
        <input type="checkbox" id="mobile-faq-check-7" />
        <br />
        <label
          id="mobile-faq-read-7"
          htmlFor="mobile-faq-check-7"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: '8.	Apakah Norvine Supplement aman untuk dikonsumsi?',
    answer: (
      <div>
        Norvine Supplement telah melalui serangkaian pengujian mutu yang
        tervalidasi dan telah mendapatkan izin edar dari BPOM.
      </div>
    ),
    mobileAnswer: (
      <div>
        Norvine Supplement telah melalui serangkaian pengujian mutu yang
        tervalidasi dan telah mendapatkan izin edar dari BPOM.
      </div>
    ),
  },
  {
    question: '9.	Apakah produk Norvine termasuk produk halal?',
    answer: (
      <div>
        Pada dasarnya, Norvine Supplement belum mendapatkan sertifikasi halal
        dari MUI, namun produk Norvine Supplement menggunakan bahan baku halal
        dan diproduksi di Fasilitas yang halal.
      </div>
    ),
    mobileAnswer: (
      <div>
        Pada dasarnya, Norvine Supplement belum mendapatkan sertifikasi halal
        dari MUI, namun produk Norvine Supplement menggunakan bahan baku halal
        dan diproduksi di Fasilitas yang halal.
      </div>
    ),
  },
  {
    question:
      '10.	Apakah wajar ketika urin saya kekuningan setelah mengonsumsi Norvine Supplement?',
    answer: (
      <div>
        Apabila Anda mengonsumsi suplemen yang mengandung vitamin B atau vitamin
        C, maka hasil ekskresi (urin) dapat menunjukkan perubahan warna menjadi
        kekuningan. Konsumsi suplemen kesehatan juga perlu diikuti dengan minum
        air yang cukup.
      </div>
    ),
    mobileAnswer: (
      <div>
        Apabila Anda mengonsumsi suplemen yang mengandung vitamin B atau vitamin
        C, maka hasil ekskresi (urin) dapat menunjukkan perubahan warna menjadi
        kekuningan. Konsumsi suplemen kesehatan juga perlu diikuti dengan minum
        air yang cukup.
      </div>
    ),
  },
  {
    question:
      '11.	Ukuran tablet/kaplet suplemen saya cukup besar dan sulit untuk ditelan. Apakah ada solusi?',
    answer: (
      <div>
        Ukuran tablet/kaplet yang besar dapat dikarenakan jumlah kandungan suatu
        zat yang besar didalamnya. Contohnya seperti kaplet vitamin C-1000 mg
        yang mengandung 1 gram vitamin C dan zat tambahan lainnya. Tablet/kaplet
        tersebut dapat dipatahkan/digerus terlebih dahulu untuk mempermudah
        konsumsi, selama tablet/kaplet tersebut bukan merupakan tablet/kaplet
        lepas lambat atau lepas terkontrol.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-faq-main-11">
          Ukuran tablet/kaplet yang besar dapat dikarenakan jumlah kandungan
          suatu zat yang besar didalamnya. Contohnya seperti kaplet vitamin
          C-1000 mg yang mengandung 1 gram vitamin C dan zat tambahan lainnya.
          Tablet/kaplet tersebut dapat dipatahkan/digerus terlebih dahulu untuk
          mempermudah konsumsi
        </span>
        <span id="mobile-faq-dots-11">...</span>
        <span id="mobile-faq-expanded-11">
          , selama tablet/kaplet tersebut bukan merupakan tablet/kaplet lepas
          lambat atau lepas terkontrol.
        </span>
        <input type="checkbox" id="mobile-faq-check-11" />
        <br />
        <label
          id="mobile-faq-read-11"
          htmlFor="mobile-faq-check-11"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: '12.	Apa perbedaan antara kapsul, tablet, dan softgel?',
    answer: (
      <div>
        Kapsul, tablet, dan softgel merupakan sediaan padat yang mengandung zat
        aktif dan membantu menghantarkan zat tersebut kedalam tubuh. Setiap zat
        memiliki karakteristik tersendiri sehingga dapat diformulasikan menjadi
        beragam bentuk sediaan yang berbeda sesuai dengan target dan proses
        pelepasan yang dituju.
      </div>
    ),
    mobileAnswer: (
      <div>
        Kapsul, tablet, dan softgel merupakan sediaan padat yang mengandung zat
        aktif dan membantu menghantarkan zat tersebut kedalam tubuh. Setiap zat
        memiliki karakteristik tersendiri sehingga dapat diformulasikan menjadi
        beragam bentuk sediaan yang berbeda sesuai dengan target dan proses
        pelepasan yang dituju.
      </div>
    ),
  },
  {
    question:
      '13.	Mengapa kandungan vitamin/zat tertentu dengan merk Norvine lebih rendah dari beberapa merk suplemen luar negeri?',
    answer: (
      <div>
        Setiap negara memiliki regulasi tersendiri yang sangat mungkin berbeda
        tentang batasan kadar bahan aktif dalam produk suplemen kesehatan.
        Berdasarkan regulasi di ASEAN, kadar kandungan yang ditetapkan cenderung
        lebih rendah dibandingkan negara Barat.
        <br />
        <br /> Sebagai contoh, dimasa sebelum adanya SARS-Cov19 (Covid-19), BPOM
        memberikan batasan 400 IU untuk Vitamin D-3, sementara di Amerika
        peredaran suplemen kesehatan tidak diwajibkan untuk diregistrasikan ke
        FDA dimana Vitamin D-3 dengan kandungan 10.000 IU pun masih
        diperbolehkan sebagai suplementasi. Regulasi yang berlaku di Indonesia
        telah melalui berbagai penilaian dan selalu diperbaharui, sehingga dapat
        ditetapkan batas aman yang sesuai dengan kebutuhan bagi penduduk di
        Indonesia.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-faq-main-13">
          Setiap negara memiliki regulasi tersendiri yang sangat mungkin berbeda
          tentang batasan kadar bahan aktif dalam produk suplemen kesehatan.
          Berdasarkan regulasi di ASEAN, kadar kandungan yang ditetapkan
          cenderung lebih rendah dibandingkan negara Barat.
          <br />
          <br /> Sebagai contoh, dimasa sebelum adanya SARS-Cov19 (Covid-19),
          BPOM
        </span>
        <span id="mobile-faq-dots-13">...</span>
        <span id="mobile-faq-expanded-13">
          {' '}
          memberikan batasan 400 IU untuk Vitamin D-3, sementara di Amerika
          peredaran suplemen kesehatan tidak diwajibkan untuk diregistrasikan ke
          FDA dimana Vitamin D-3 dengan kandungan 10.000 IU pun masih
          diperbolehkan sebagai suplementasi. Regulasi yang berlaku di Indonesia
          telah melalui berbagai penilaian dan selalu diperbaharui, sehingga
          dapat ditetapkan batas aman yang sesuai dengan kebutuhan bagi penduduk
          di Indonesia.
        </span>
        <input type="checkbox" id="mobile-faq-check-13" />
        <br />
        <label
          id="mobile-faq-read-13"
          htmlFor="mobile-faq-check-13"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: '14.	Apa yang dimaksud dengan Obat Tradisional?',
    answer: (
      <div>
        Obat tradisional adalah bahan atau ramuan bahan yang berupa bahan
        tumbuhan, bahan hewan, bahan mineral, sediaan sarian (galenik), atau
        campuran dari bahan tersebut yang secara turun temurun telah digunakan
        untuk pengobatan, dan dapat diterapkan sesuai dengan norma yang berlaku
        di masyarakat.
      </div>
    ),
    mobileAnswer: (
      <div>
        Obat tradisional adalah bahan atau ramuan bahan yang berupa bahan
        tumbuhan, bahan hewan, bahan mineral, sediaan sarian (galenik), atau
        campuran dari bahan tersebut yang secara turun temurun telah digunakan
        untuk pengobatan, dan dapat diterapkan sesuai dengan norma yang berlaku
        di masyarakat.
      </div>
    ),
  },
  {
    question: '15.	Apakah ada efek samping mengonsumsi obat tradisional?',
    answer: (
      <div>
        Pada dasarnya, terdapat efek samping yang ringan ketika Anda mengonsumsi
        obat tradisional. Jika gejala efek samping semakin memburuk, segera
        hentikan konsumsi obat tradisional dan konsultasikan kepada
        dokter/tenaga kesehatan lain.
      </div>
    ),
    mobileAnswer: (
      <div>
        Pada dasarnya, terdapat efek samping yang ringan ketika Anda mengonsumsi
        obat tradisional. Jika gejala efek samping semakin memburuk, segera
        hentikan konsumsi obat tradisional dan konsultasikan kepada
        dokter/tenaga kesehatan lain.
      </div>
    ),
  },
]

export default function FAQ() {
  return (
    <>
        <HeadMeta />
    
        <div>
      <Desktop>
        
        <div className="mb-14 flex h-32 items-center px-18 pt-16 pb-8">
          <MdOutlineKeyboardArrowLeft size={24} />
          <h5 className="txt-h5 ml-4 font-bold">
            Home . <span className="text-[#EC0000]">FAQ</span>
          </h5>
        </div>
        <div className="px-56">
          <h3 className="txt-h3 mb-3 text-[#EC0000]">
            FREQUENLTY ASK QUESTION
          </h3>
          <h1 className="txt-h1 mb-20 text-[#1D1E20]">HOW CAN WE HELP YOU?</h1>
          <div className="mb-52 space-y-16">
            {question.map(({ question, answer }, index) => {
              return (
                <div key={index}>
                  <h3 className="txt-h3 mb-4 text-[#1D1E20]">{question}</h3>
                  <p className="txt-body text-[#777777]">{answer}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Desktop>
      <Mobile>
        
        <div className="px-4">
          <h1 className="txt-mobile-h1 mb-10 text-[#1D1E20]">
            How can we help you?
          </h1>
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
