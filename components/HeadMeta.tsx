import Head from 'next/head';
import { ReactNode } from 'react';

interface HeadMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  ogImage?: string;
  type?: string;
  siteName?: string;
  author?: string;
  robots?: "index, follow" | "noindex, nofollow" | "index, nofollow" | "noindex, follow";
  children?: ReactNode; // Untuk tag tambahan spesifik di halaman tertentu
}

export default function HeadMeta({
  title = "Norvine | Settle Your Way For A Healthier You",
  description = "Beragam pilihan Norvine Supplement dapat membantu Anda dalam memilih suplemen kesehatan yang tepat dan sesuai dengan kebutuhan tiap individu. Doing good for health isn't expensive, it's priceless!",
  keywords = "belanja online, produk terbaik, brand anda, fashion, koleksi",
  url = "https://norvine.co.id",
  ogImage = "https://norvine.co.id/images/norvine-logo.png",
  type = "website",
  siteName = "Norvine",
  author = "Norvine",
  robots = "index, follow",
  children,
}: HeadMetaProps) {
  return (
    <Head>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
     <meta name="author" content={author} />
      
      {/* --- CRAWLER & INDEXING --- */}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />

      {/* --- OPEN GRAPH (Facebook, WhatsApp, LinkedIn) --- */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {/* Dimensi gambar OG standar agar tidak terpotong saat di-share */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* --- TWITTER CARDS --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {/* Ganti @username dengan username Twitter brand Anda jika ada */}

      {/* --- VIEWPORT & THEME --- */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#000000" /> {/* Sesuaikan dengan warna brand Anda */}

      {/* --- CUSTOM INJECTIONS --- */}
      {children}
    </Head>
  );
}