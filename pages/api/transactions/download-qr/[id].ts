import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');

  try {
    const { id } = req.query;
    const transaction = await prisma.transaction.findUnique({
      where: { id: String(id) },
      include: { user: { select: { name: true } } }
    });

    if (!transaction) return res.status(404).send('Not found');

    const qrSource = transaction.qrUrl || transaction.paymentCode;

    // CANVAS SETUP (Clean Ratio)
    const width = 500;
    const height = 750;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // BACKGROUND
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // HEADER SECTION (Gopay Style Blue/Dark Accent)
    ctx.fillStyle = "#000000"; // Tetap hitam untuk Norvine
    ctx.fillRect(0, 0, width, 100);

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("NORVINE PAYMENT", width / 2, 55);
    ctx.font = "normal 12px sans-serif";
    ctx.fillText(transaction.invoice.toUpperCase(), width / 2, 80);

    // QR CODE CONTAINER
    const qrBuffer = await QRCode.toBuffer(qrSource!, {
      margin: 1,
      width: 320,
      color: { dark: "#000000", light: "#FFFFFF" }
    });
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 90, 140, 320, 320);

    // DASHED LINE (Receipt Style)
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(40, 500);
    ctx.lineTo(460, 500);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // PAYMENT INFO (Gopay Minimalist Style)
    ctx.textAlign = "left";
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("TOTAL PEMBAYARAN", 50, 550);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 32px sans-serif";
    const amount = new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0 
    }).format(transaction.totalAmount);
    ctx.fillText(amount, 50, 595);

    ctx.textAlign = "right";
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("NAMA PELANGGAN", 450, 550);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(transaction.user.name?.toUpperCase() || "CUSTOMER", 450, 575);

    // FOOTER SAFETY NOTE
    ctx.fillStyle = "#F3F4F6";
    ctx.fillRect(40, 640, 420, 60);
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#4B5563";
    ctx.font = "italic 11px sans-serif";
    ctx.fillText("Simpan QR ini dan scan melalui aplikasi pembayaran Anda.", width / 2, 665);
    ctx.fillText("Pastikan nominal sesuai agar pesanan diproses otomatis.", width / 2, 685);

    const buffer = canvas.toBuffer("image/png");
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="NORVINE_QR_${transaction.invoice}.png"`);
    return res.send(buffer);

  } catch (error) {
    return res.status(500).send('Error');
  }
}