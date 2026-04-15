import { MdOutlineKeyboardArrowLeft } from 'react-icons/md'

import { Desktop, Mobile } from '@/components/responsive'
import HeadMeta from '@/components/HeadMeta'


const question = [
  {
    question: 'Ketentuan Umum',
    answer: (
      <div>
        Dengan mengakses dan melakukan pemesanan, Anda mengonfirmasi bahwa Anda
        setuju dengan dan terikat oleh persyaratan layanan yang terdapat dalam
        Persyaratan & Kondisi yang diuraikan di bawah ini. Persyaratan ini
        berlaku untuk seluruh situs web dan email apa pun atau jenis komunikasi
        lainnya antara Anda dan kami. <br />
        <br />
        Dalam keadaan apa pun tim tidak bertanggung jawab atas segala kerusakan
        langsung, tidak langsung, khusus, insidental atau konsekuensial,
        termasuk, namun tidak terbatas pada, kehilangan data atau keuntungan,
        yang timbul dari penggunaan, atau ketidakmampuan untuk menggunakan,
        materi di situs ini, bahkan jika tim atau perwakilan resmi telah
        disarankan terkait kemungkinan kerusakan tersebut. Jika penggunaan Anda
        atas materi dari situs ini mengakibatkan kebutuhan untuk pelayanan,
        perbaikan, atau koreksi dari peralatan atau data, biaya yang ditimbulkan
        merupakan tanggungan Anda. <br />
        <br />
        Kami tidak bertanggung jawab atas hasil apa pun yang mungkin terjadi
        selama penggunaan sumber daya. Kami berhak untuk mengubah harga dan
        merevisi kebijakan penggunaan sumber daya setiap saat. <br />
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-1">
          Dengan mengakses dan melakukan pemesanan, Anda mengonfirmasi bahwa
          Anda setuju dengan dan terikat oleh persyaratan layanan yang terdapat
          dalam Persyaratan & Kondisi yang diuraikan di bawah ini. Persyaratan
          ini berlaku untuk seluruh situs web dan email apa pun atau jenis
          komunikasi lainnya antara Anda dan kami.
          <br />
          <br />
          Dalam keadaan apa pun tim tidak
        </span>
        <span id="mobile-terms-dots-1">...</span>
        <span id="mobile-terms-expanded-1">
          {' '}
          bertanggung jawab atas segala kerusakan langsung, tidak langsung,
          khusus, insidental atau konsekuensial, termasuk, namun tidak terbatas
          pada, kehilangan data atau keuntungan, yang timbul dari penggunaan,
          atau ketidakmampuan untuk menggunakan, materi di situs ini, bahkan
          jika tim atau perwakilan resmi telah disarankan terkait kemungkinan
          kerusakan tersebut. Jika penggunaan Anda atas materi dari situs ini
          mengakibatkan kebutuhan untuk pelayanan, perbaikan, atau koreksi dari
          peralatan atau data, biaya yang ditimbulkan merupakan tanggungan Anda.{' '}
          <br />
          <br />
          Kami tidak bertanggung jawab atas hasil apa pun yang mungkin terjadi
          selama penggunaan sumber daya. Kami berhak untuk mengubah harga dan
          merevisi kebijakan penggunaan sumber daya setiap saat. <br />
        </span>
        <input type="checkbox" id="mobile-terms-check-1" />
        <br />
        <label
          id="mobile-terms-read-1"
          htmlFor="mobile-terms-check-1"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Ketentuan Khusus',
    answer: (
      <div>
        Dengan melakukan pemesanan, Anda mengonfirmasi dan setuju dengan semua
        syarat dan ketentuan yang berlaku pada Norvine (“kami”, atau “milik
        kami”), serta tidak terbatas untuk tunduk pada syarat dan ketentuan
        pengembalian dan penukaran. Untuk syarat dan ketentuan pengembalian dan
        penukaran, Anda dapat membacanya pada bagian Return and Refund Policy.
      </div>
    ),
    mobileAnswer: (
      <div>
        Dengan melakukan pemesanan, Anda mengonfirmasi dan setuju dengan semua
        syarat dan ketentuan yang berlaku pada Norvine (“kami”, atau “milik
        kami”), serta tidak terbatas untuk tunduk pada syarat dan ketentuan
        pengembalian dan penukaran. Untuk syarat dan ketentuan pengembalian dan
        penukaran, Anda dapat membacanya pada bagian Return and Refund Policy.
      </div>
    ),
  },
  {
    question: 'Lisensi',
    answer: (
      <div>
        Norvine memberi Anda lisensi terbatas yang dapat dibatalkan,
        non-eksklusif, tidak dapat dialihkan, untuk mengunduh, memasang, dan
        menggunakan layanan kami secara ketat sesuai dengan ketentuan Perjanjian
        ini. <br />
        <br />
        Syarat & Ketentuan ini adalah kontrak antara Anda dan Norvine (dalam
        Syarat & Ketentuan ini disebut sebagai &quot;Norvine&quot;,
        &quot;kami&quot; atau &quot;milik kami&quot;), penyedia situs web
        Norvine dan layanan yang dapat diakses dari situs web Norvine (yang
        secara bersama-sama disebut dalam Syarat & Ketentuan ini sebagai
        &quot;Layanan Norvine&quot;). <br />
        <br />
        Anda setuju untuk terikat dengan Syarat & Ketentuan ini. Jika Anda tidak
        menyetujui Syarat & Ketentuan ini, mohon untuk tidak menggunakan
        Layanan. Dalam Syarat & Ketentuan ini, &quot;Anda&quot; merujuk kepada
        Anda sebagai individu dan entitas yang Anda wakili. Jika Anda melanggar
        salah satu dari Syarat & Ketentuan ini, kami berhak untuk membatalkan
        akun Anda atau memblokir akses ke akun Anda tanpa pemberitahuan.
        <br />
        <br />
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-3">
          Norvine memberi Anda lisensi terbatas yang dapat dibatalkan,
          non-eksklusif, tidak dapat dialihkan, untuk mengunduh, memasang, dan
          menggunakan layanan kami secara ketat sesuai dengan ketentuan
          Perjanjian ini. <br />
          <br />
          Syarat & Ketentuan ini adalah kontrak antara Anda dan Norvine (dalam
          Syarat & Ketentuan ini disebut sebagai &quot;Norvine&quot;,
          &quot;kami&quot; atau &quot;milik kami&quot;), penyedia situs web
          Norvine
        </span>
        <span id="mobile-terms-dots-3">...</span>
        <span id="mobile-terms-expanded-3">
          {' '}
          dan layanan yang dapat diakses dari situs web Norvine (yang secara
          bersama-sama disebut dalam Syarat & Ketentuan ini sebagai
          &quot;Layanan Norvine&quot;). <br />
          <br />
          Anda setuju untuk terikat dengan Syarat & Ketentuan ini. Jika Anda
          tidak menyetujui Syarat & Ketentuan ini, mohon untuk tidak menggunakan
          Layanan. Dalam Syarat & Ketentuan ini, &quot;Anda&quot; merujuk kepada
          Anda sebagai individu dan entitas yang Anda wakili. Jika Anda
          melanggar salah satu dari Syarat & Ketentuan ini, kami berhak untuk
          membatalkan akun Anda atau memblokir akses ke akun Anda tanpa
          pemberitahuan.
          <br />
        </span>
        <input type="checkbox" id="mobile-terms-check-3" />
        <br />
        <label
          id="mobile-terms-read-3"
          htmlFor="mobile-terms-check-3"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Definisi dan Kata Kunci',
    answer: (
      <div>
        Untuk Syarat & Ketentuan ini:
        <ul className="list-outside list-disc pl-8">
          <li>
            Cookie: sejumlah kecil data yang dihasilkan oleh situs web dan
            disimpan oleh browser web Anda. Ini digunakan untuk mengidentifikasi
            browser Anda, memberikan analitik, mengingat informasi tentang Anda
            seperti preferensi bahasa atau informasi login Anda.
          </li>
          <li>
            Perusahaan: ketika kebijakan ini menyebutkan “Perusahaan”, “kami”,
            atau “milik kami”, ini merujuk pada PT Satu Jaya Tama, Jl.Rawa Buaya
            No.5H, Jakarta Barat - 11740 yang bertanggung jawab atas informasi
            Anda berdasarkan Kebijakan Privasi ini.
          </li>
          <li>
            Negara: tempat Norvine atau pemilik/pendiri Norvine berada, dalam
            hal ini adalah Indonesia.
          </li>
          <li>
            Pelanggan: mengacu pada perusahaan, organisasi, atau orang yang
            mendaftar untuk menggunakan Layanan Norvine untuk mengelola hubungan
            dengan konsumen atau pengguna layanan Anda.
          </li>
          <li>
            Perangkat: perangkat apa pun yang terhubung ke internet seperti
            ponsel, tablet, komputer, atau perangkat lain apa pun yang dapat
            digunakan untuk mengunjungi Norvine dan menggunakan Layanan.
          </li>
          <li>
            Alamat IP: Setiap perangkat yang terhubung ke Internet diberi nomor
            yang dikenal sebagai alamat protokol Internet (IP). Angka-angka ini
            biasanya ditetapkan dalam blok geografis. Alamat IP sering dapat
            digunakan untuk mengidentifikasi lokasi dari mana perangkat
            terhubung ke Internet.
          </li>
          <li>
            Personil: mengacu pada orang-orang yang dipekerjakan oleh Norvine
            atau terikat kontrak untuk melakukan layanan atas nama salah satu
            pihak.
          </li>
          <li>
            Data Pribadi: informasi apa pun yang secara langsung, tidak
            langsung, atau sehubungan dengan informasi lain — termasuk nomor
            identifikasi pribadi — memungkinkan identifikasi atau
            pengidentifikasian seseorang.
          </li>
          <li>
            Layanan: mengacu pada layanan yang disediakan oleh Norvine
            sebagaimana dijelaskan dalam persyaratan relatif (jika tersedia) dan
            pada platform ini.
          </li>
          <li>
            Layanan pihak ketiga: mengacu pada pengiklan, sponsor kontes, mitra
            promosi dan pemasaran, dan pihak lain yang menyediakan konten kami
            atau yang produk atau layanannya menurut kami mungkin menarik bagi
            Anda.
          </li>
          <li>
            Situs web: Situs Norvine, yang dapat diakses melalui URL ini:
            norvine.co.id.
          </li>
          <li>
            Anda: orang atau entitas yang terdaftar pada Norvine untuk
            menggunakan Layanan.
          </li>
        </ul>
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-4">
          Untuk Syarat & Ketentuan ini:
          <ul className="list-outside list-disc pl-8">
            <li>
              <b>Cookie</b>: sejumlah kecil data yang dihasilkan oleh situs web
              dan disimpan oleh browser web Anda. Ini digunakan untuk
              mengidentifikasi browser Anda, memberikan analitik, mengingat
              informasi tentang Anda seperti preferensi bahasa atau informasi
              login Anda.
            </li>
          </ul>
        </span>
        <span id="mobile-terms-dots-4">...</span>
        <span id="mobile-terms-expanded-4">
          <ul className="list-outside list-disc pl-8">
            <li>
              <b>Perusahaan</b>: ketika kebijakan ini menyebutkan “Perusahaan”,
              “kami”, atau “milik kami”, ini merujuk pada PT Satu Jaya Tama,
              Jl.Rawa Buaya No.5H, Jakarta Barat - 11740 yang bertanggung jawab
              atas informasi Anda berdasarkan Kebijakan Privasi ini.
            </li>
            <li>
              <b>Negara</b>: tempat Norvine atau pemilik/pendiri Norvine berada,
              dalam hal ini adalah Indonesia.
            </li>
            <li>
              <b>Pelanggan</b>: mengacu pada perusahaan, organisasi, atau orang
              yang mendaftar untuk menggunakan Layanan Norvine untuk mengelola
              hubungan dengan konsumen atau pengguna layanan Anda.
            </li>
            <li>
              <b>Perangkat</b>: perangkat apa pun yang terhubung ke internet
              seperti ponsel, tablet, komputer, atau perangkat lain apa pun yang
              dapat digunakan untuk mengunjungi Norvine dan menggunakan Layanan.
            </li>
            <li>
              <b>Alamat IP</b>: Setiap perangkat yang terhubung ke Internet
              diberi nomor yang dikenal sebagai alamat protokol Internet (IP).
              Angka-angka ini biasanya ditetapkan dalam blok geografis. Alamat
              IP sering dapat digunakan untuk mengidentifikasi lokasi dari mana
              perangkat terhubung ke Internet.
            </li>
            <li>
              <b>Personil</b>: mengacu pada orang-orang yang dipekerjakan oleh
              Norvine atau terikat kontrak untuk melakukan layanan atas nama
              salah satu pihak.
            </li>
            <li>
              <b>Data Pribadi</b>: informasi apa pun yang secara langsung, tidak
              langsung, atau sehubungan dengan informasi lain — termasuk nomor
              identifikasi pribadi — memungkinkan identifikasi atau
              pengidentifikasian seseorang.
            </li>
            <li>
              <b>Layanan</b>: mengacu pada layanan yang disediakan oleh Norvine
              sebagaimana dijelaskan dalam persyaratan relatif (jika tersedia)
              dan pada platform ini.
            </li>
            <li>
              <b>Layanan pihak ketiga</b>: mengacu pada pengiklan, sponsor
              kontes, mitra promosi dan pemasaran, dan pihak lain yang
              menyediakan konten kami atau yang produk atau layanannya menurut
              kami mungkin menarik bagi Anda.
            </li>
            <li>
              <b>Situs web</b>: Situs Norvine, yang dapat diakses melalui URL
              ini: norvine.co.id.
            </li>
            <li>
              <b>Anda</b>: orang atau entitas yang terdaftar pada Norvine untuk
              menggunakan Layanan.
            </li>
          </ul>
        </span>
        <input type="checkbox" id="mobile-terms-check-4" />
        <br />
        <label
          id="mobile-terms-read-4"
          htmlFor="mobile-terms-check-4"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Pembatasan',
    answer: (
      <div>
        Anda setuju untuk tidak melakukan, dan Anda tidak akan mengizinkan orang
        lain untuk:
        <ul className="list-outside list-disc pl-8">
          <li>
            Memberikan lisensi, menjual, menyewakan, menetapkan,
            mendistribusikan, mentransmisikan, menyelenggarakan,
            mengalihdayakan, mengungkapkan atau mengeksploitasi layanan secara
            komersial atau menyediakan platform untuk pihak ketiga mana pun.
          </li>
          <li>
            Memodifikasi, membuat karya turunan, membongkar, mendekripsi,
            mengkompilasi balik, atau merekayasa balik bagian mana pun dari
            layanan.
          </li>
          <li>
            Menghapus, mengubah, atau mengaburkan pemberitahuan kepemilikan
            (termasuk pemberitahuan hak cipta atau merek dagang) dari atau
            afiliasinya, mitra, pemasok, atau pemberi lisensi layanan.
          </li>
        </ul>
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-5">
          Anda setuju untuk tidak melakukan, dan Anda tidak akan mengizinkan
          orang lain untuk:
          <ul className="list-outside list-disc pl-8">
            <li>
              Memberikan lisensi, menjual, menyewakan, menetapkan,
              mendistribusikan, mentransmisikan, menyelenggarakan,
              mengalihdayakan, mengungkapkan atau mengeksploitasi layanan secara
              komersial atau menyediakan platform untuk pihak ketiga mana pun.
            </li>
          </ul>
        </span>
        <span id="mobile-terms-dots-5">...</span>
        <span id="mobile-terms-expanded-5">
          <ul className="list-outside list-disc pl-8">
            <li>
              Memodifikasi, membuat karya turunan, membongkar, mendekripsi,
              mengkompilasi balik, atau merekayasa balik bagian mana pun dari
              layanan.
            </li>
            <li>
              Menghapus, mengubah, atau mengaburkan pemberitahuan kepemilikan
              (termasuk pemberitahuan hak cipta atau merek dagang) dari atau
              afiliasinya, mitra, pemasok, atau pemberi lisensi layanan.
            </li>
          </ul>
        </span>
        <input type="checkbox" id="mobile-terms-check-5" />
        <br />
        <label
          id="mobile-terms-read-5"
          htmlFor="mobile-terms-check-5"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Saran',
    answer: (
      <div>
        Setiap umpan balik, komentar, ide, perbaikan atau saran (secara
        kolektif, &quot;Saran&quot;) yang diberikan oleh Anda kepada kami
        sehubungan dengan layanan akan tetap menjadi milik tunggal dan eksklusif
        kami. Kami bebas menggunakan, menyalin, memodifikasi, menerbitkan, atau
        mendistribusikan kembali Saran untuk tujuan apa pun dan dengan cara apa
        pun tanpa kredit atau kompensasi apa pun kepada Anda.
      </div>
    ),
    mobileAnswer: (
      <div>
        Setiap umpan balik, komentar, ide, perbaikan atau saran (secara
        kolektif, &quot;Saran&quot;) yang diberikan oleh Anda kepada kami
        sehubungan dengan layanan akan tetap menjadi milik tunggal dan eksklusif
        kami. Kami bebas menggunakan, menyalin, memodifikasi, menerbitkan, atau
        mendistribusikan kembali Saran untuk tujuan apa pun dan dengan cara apa
        pun tanpa kredit atau kompensasi apa pun kepada Anda.
      </div>
    ),
  },
  {
    question: 'Cookies',
    answer: (
      <div>
        Kami menggunakan &quot;Cookies&quot; untuk mengidentifikasi area situs
        web kami yang telah Anda kunjungi. Cookie adalah sepotong kecil data
        yang disimpan di komputer atau perangkat seluler Anda oleh browser web
        Anda. Kami menggunakan Cookie untuk meningkatkan kinerja dan
        fungsionalitas layanan kami tetapi bukan hal essential terkait
        kegunaannya. Namun, tanpa cookie ini, fungsi tertentu seperti video
        mungkin tidak tersedia atau Anda akan diminta untuk memasukkan detail
        login Anda setiap kali Anda mengunjungi platform kami karena kami tidak
        dapat mengingat bahwa Anda telah login sebelumnya. Sebagian besar
        browser web dapat diatur untuk menonaktifkan penggunaan Cookie. Namun,
        jika Anda menonaktifkan Cookie, Anda mungkin tidak dapat mengakses
        fungsionalitas di situs web kami dengan benar atau tidak sama sekali.
        Kami tidak pernah menempatkan Informasi Identifikasi Pribadi di Cookies.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-7">
          Kami menggunakan &quot;Cookies&quot; untuk mengidentifikasi area situs
          web kami yang telah Anda kunjungi. Cookie adalah sepotong kecil data
          yang disimpan di komputer atau perangkat seluler Anda oleh browser web
          Anda. Kami menggunakan Cookie untuk meningkatkan kinerja dan
          fungsionalitas layanan kami tetapi bukan hal essential terkait
          kegunaannya. Namun, tanpa cookie ini, fungsi tertentu
        </span>
        <span id="mobile-terms-dots-7">...</span>
        <span id="mobile-terms-expanded-7">
          {' '}
          seperti video mungkin tidak tersedia atau Anda akan diminta untuk
          memasukkan detail login Anda setiap kali Anda mengunjungi platform
          kami karena kami tidak dapat mengingat bahwa Anda telah login
          sebelumnya. Sebagian besar browser web dapat diatur untuk
          menonaktifkan penggunaan Cookie. Namun, jika Anda menonaktifkan
          Cookie, Anda mungkin tidak dapat mengakses fungsionalitas di situs web
          kami dengan benar atau tidak sama sekali. Kami tidak pernah
          menempatkan Informasi Identifikasi Pribadi di Cookies.
          <br />
        </span>
        <input type="checkbox" id="mobile-terms-check-7" />
        <br />
        <label
          id="mobile-terms-read-7"
          htmlFor="mobile-terms-check-7"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Third-Party Services',
    answer: (
      <div>
        Kami dapat menampilkan, menyertakan, atau menyediakan konten pihak
        ketiga (termasuk data, informasi, aplikasi, dan layanan produk lainnya)
        atau menyediakan tautan ke situs web atau layanan pihak ketiga
        (&quot;Layanan Pihak Ketiga&quot;). Anda mengakui dan setuju bahwa kami
        tidak akan bertanggung jawab atas Layanan Pihak Ketiga manapun, termasuk
        keakuratan, kelengkapan, ketepatan waktu, validitas, kepatuhan hak
        cipta, legalitas, kesopanan, kualitas, atau aspek lainnya. Kami tidak
        menganggap dan tidak akan memiliki kewajiban atau tanggung jawab apa pun
        kepada Anda atau orang atau entitas lain manapun atas Layanan Pihak
        Ketiga manapun. Layanan Pihak Ketiga dan tautannya disediakan
        semata-mata untuk kenyamanan Anda dan Anda mengakses dan menggunakan
        sepenuhnya atas risiko Anda sendiri dan tunduk pada syarat dan ketentuan
        pihak ketiga tersebut.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-8">
          Kami dapat menampilkan, menyertakan, atau menyediakan konten pihak
          ketiga (termasuk data, informasi, aplikasi, dan layanan produk
          lainnya) atau menyediakan tautan ke situs web atau layanan pihak
          ketiga (&quot;Layanan Pihak Ketiga&quot;). Anda mengakui dan setuju
          bahwa kami tidak akan bertanggung jawab atas Layanan Pihak Ketiga
          manapun, termasuk keakuratan, kelengkapan, ketepatan
        </span>
        <span id="mobile-terms-dots-8">...</span>
        <span id="mobile-terms-expanded-8">
          {' '}
          waktu, validitas, kepatuhan hak cipta, legalitas, kesopanan, kualitas,
          atau aspek lainnya. Kami tidak menganggap dan tidak akan memiliki
          kewajiban atau tanggung jawab apa pun kepada Anda atau orang atau
          entitas lain manapun atas Layanan Pihak Ketiga manapun. Layanan Pihak
          Ketiga dan tautannya disediakan semata-mata untuk kenyamanan Anda dan
          Anda mengakses dan menggunakan sepenuhnya atas risiko Anda sendiri dan
          tunduk pada syarat dan ketentuan pihak ketiga tersebut.
          <br />
        </span>
        <input type="checkbox" id="mobile-terms-check-8" />
        <br />
        <label
          id="mobile-terms-read-8"
          htmlFor="mobile-terms-check-8"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Hak Kekayaan Intelektual',
    answer: (
      <div>
        Platform kami dan seluruh konten, fitur, dan fungsinya (termasuk namun
        tidak terbatas pada semua informasi, perangkat lunak, teks, tampilan,
        gambar, video dan audio, serta desain, pemilihan, dan pengaturannya),
        dimiliki oleh kami, pemberi lisensinya, atau pihak lain penyedia materi
        tersebut dan dilindungi oleh dan hak cipta internasional, merek dagang,
        paten, rahasia dagang, dan undang-undang kekayaan intelektual atau hak
        kepemilikan lainnya. Materi tidak boleh disalin, dimodifikasi,
        direproduksi, diunduh atau didistribusikan dengan cara apa pun,
        seluruhnya atau sebagian, tanpa izin tertulis sebelumnya dari kami,
        kecuali sebagaimana ditentukan secara tegas dalam Syarat & Ketentuan
        ini. Seluruh penggunaan materi yang tidak sah merupakan tindakan yang
        dilarang.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-9">
          Platform kami dan seluruh konten, fitur, dan fungsinya (termasuk namun
          tidak terbatas pada semua informasi, perangkat lunak, teks, tampilan,
          gambar, video dan audio, serta desain, pemilihan, dan pengaturannya),
          dimiliki oleh kami, pemberi lisensinya, atau pihak lain penyedia
          materi tersebut dan dilindungi oleh dan hak cipta internasional, merek
          dagang, paten, rahasia dagang, dan
        </span>
        <span id="mobile-terms-dots-9">...</span>
        <span id="mobile-terms-expanded-9">
          {' '}
          undang-undang kekayaan intelektual atau hak kepemilikan lainnya.
          Materi tidak boleh disalin, dimodifikasi, direproduksi, diunduh atau
          didistribusikan dengan cara apa pun, seluruhnya atau sebagian, tanpa
          izin tertulis sebelumnya dari kami, kecuali sebagaimana ditentukan
          secara tegas dalam Syarat & Ketentuan ini. Seluruh penggunaan materi
          yang tidak sah merupakan tindakan yang dilarang.
          <br />
        </span>
        <input type="checkbox" id="mobile-terms-check-9" />
        <br />
        <label
          id="mobile-terms-read-9"
          htmlFor="mobile-terms-check-9"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Disclaimer',
    answer: (
      <div>
        Kami tidak bertanggung jawab atas konten, kode, atau ketidaktepatan
        lainnya. Kami tidak memberikan jaminan atau garansi. Dalam keadaan apa
        pun kami tidak bertanggung jawab atas kerusakan khusus, langsung, tidak
        langsung, konsekuensial, atau insidental atau kerusakan apa pun, baik
        dalam tindakan kontrak, kelalaian atau kesalahan lainnya, yang timbul
        dari atau sehubungan dengan penggunaan Layanan atau isi Layanan. Kami
        berhak untuk melakukan penambahan, penghapusan, atau modifikasi terhadap
        konten pada Layanan setiap saat tanpa pemberitahuan sebelumnya.
        <br />
        <br />
        Layanan kami dan isinya disediakan &quot;sebagaimana adanya&quot; dan
        &quot;sebagaimana tersedia&quot; tanpa jaminan atau pernyataan apa pun,
        baik tersurat maupun tersirat. Kami adalah distributor dan bukan
        penerbit konten yang disediakan oleh pihak ketiga; dengan demikian, kami
        tidak menjalankan kontrol editorial atas konten tersebut dan tidak
        membuat jaminan atau representasi mengenai keakuratan, keandalan, atau
        penerimaan dari setiap informasi, konten, layanan, atau barang dagangan
        yang disediakan melalui atau dapat diakses melalui Layanan kami. Tanpa
        membatasi hal tersebut di atas, Kami secara khusus menyangkal semua
        jaminan dan pernyataan dalam konten apa pun yang dikirimkan pada atau
        sehubungan dengan Layanan kami atau di situs yang mungkin muncul sebagai
        tautan pada Layanan kami, atau dalam produk yang disediakan sebagai
        bagian dari, atau sehubungan dengan, Layanan kami, termasuk namun tidak
        terbatas pada jaminan apa pun yang dapat diperjualbelikan, kesesuaian
        untuk tujuan tertentu, atau non-pelanggaran hak pihak ketiga. Tidak ada
        nasihat lisan atau informasi tertulis yang diberikan oleh kami atau
        afiliasinya, karyawan, pejabat, direktur, agen, atau sejenisnya yang
        akan menciptakan jaminan. Informasi harga dan ketersediaan dapat berubah
        sewaktu-waktu tanpa pemberitahuan. Tanpa membatasi hal tersebut di atas,
        kami tidak menjamin bahwa Layanan kami tidak akan terganggu, tidak
        rusak, tepat waktu, atau bebas dari kesalahan.
      </div>
    ),
    mobileAnswer: (
      <div>
        <span id="mobile-terms-main-10">
          Kami tidak bertanggung jawab atas konten, kode, atau ketidaktepatan
          lainnya. Kami tidak memberikan jaminan atau garansi. Dalam keadaan apa
          pun kami tidak bertanggung jawab atas kerusakan khusus, langsung,
          tidak langsung, konsekuensial, atau insidental atau kerusakan apa pun,
          baik dalam tindakan kontrak, kelalaian atau kesalahan lainnya, yang
          timbul dari atau sehubungan dengan
        </span>
        <span id="mobile-terms-dots-10">...</span>
        <span id="mobile-terms-expanded-10">
          {' '}
          penggunaan Layanan atau isi Layanan. Kami berhak untuk melakukan
          penambahan, penghapusan, atau modifikasi terhadap konten pada Layanan
          setiap saat tanpa pemberitahuan sebelumnya.
          <br />
          <br />
          Layanan kami dan isinya disediakan &quot;sebagaimana adanya&quot; dan
          &quot;sebagaimana tersedia&quot; tanpa jaminan atau pernyataan apa
          pun, baik tersurat maupun tersirat. Kami adalah distributor dan bukan
          penerbit konten yang disediakan oleh pihak ketiga; dengan demikian,
          kami tidak menjalankan kontrol editorial atas konten tersebut dan
          tidak membuat jaminan atau representasi mengenai keakuratan,
          keandalan, atau penerimaan dari setiap informasi, konten, layanan,
          atau barang dagangan yang disediakan melalui atau dapat diakses
          melalui Layanan kami. Tanpa membatasi hal tersebut di atas, Kami
          secara khusus menyangkal semua jaminan dan pernyataan dalam konten apa
          pun yang dikirimkan pada atau sehubungan dengan Layanan kami atau di
          situs yang mungkin muncul sebagai tautan pada Layanan kami, atau dalam
          produk yang disediakan sebagai bagian dari, atau sehubungan dengan,
          Layanan kami, termasuk namun tidak terbatas pada jaminan apa pun yang
          dapat diperjualbelikan, kesesuaian untuk tujuan tertentu, atau
          non-pelanggaran hak pihak ketiga. Tidak ada nasihat lisan atau
          informasi tertulis yang diberikan oleh kami atau afiliasinya,
          karyawan, pejabat, direktur, agen, atau sejenisnya yang akan
          menciptakan jaminan. Informasi harga dan ketersediaan dapat berubah
          sewaktu-waktu tanpa pemberitahuan. Tanpa membatasi hal tersebut di
          atas, kami tidak menjamin bahwa Layanan kami tidak akan terganggu,
          tidak rusak, tepat waktu, atau bebas dari kesalahan.
          <br />
        </span>
        <input type="checkbox" id="mobile-terms-check-10" />
        <br />
        <label
          id="mobile-terms-read-10"
          htmlFor="mobile-terms-check-10"
          className="text-[#EC0000]"
        />
      </div>
    ),
  },
  {
    question: 'Contact Us',
    answer: (
      <div>
        Untuk informasi lebih lanjut, silakan hubungi kami melalui email:{' '}
        <a href="mailto:support@norvine.co.id">
          <span className="cursor-pointer text-[#EC0000]">
            support@norvine.co.id
          </span>
        </a>
      </div>
    ),
    mobileAnswer: (
      <div>
        Untuk informasi lebih lanjut, silakan hubungi kami melalui email:{' '}
        <a href="mailto:support@norvine.co.id">
          <span className="cursor-pointer text-[#EC0000]">
            support@norvine.co.id
          </span>
        </a>
      </div>
    ),
  },
]

export default function TermsCondition() {
  return (
    <>
        <HeadMeta />
        <div>
      <Desktop>
        
        <div className="mb-14 flex h-32 items-center px-18 pt-16 pb-8">
          <MdOutlineKeyboardArrowLeft size={24} />
          <h5 className="txt-h5 ml-4 font-bold">
            Home . <span className="text-[#EC0000]">Terms and Condition</span>
          </h5>
        </div>
        <div className="px-56">
          <h1 className="txt-h1 mb-20 text-[#EC0000]">
            TERMS & <br />
            CONDITIONS
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
