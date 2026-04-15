import { useState } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AddressManager from "@/components/user/AddressManager";
import { MapPin, Plus, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { displayPhoneNumber } from "@/lib/utils";

export async function getServerSideProps(context: any) {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
    if (!session?.user?.email) return { redirect: { destination: "/auth/login", permanent: false } };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const addresses = await prisma.address.findMany({
      where: { userId: user?.id },
      orderBy: { isMain: 'desc' },
    });

    return { props: { addresses: JSON.parse(JSON.stringify(addresses)) } };
  } catch (error) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }
}

export default function AddressPage({ addresses }: { addresses: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // Memicu refresh data Server Side tanpa reload halaman
  const refreshData = () => {
    router.replace(router.asPath);
  };

  // Fungsi Hapus Alamat
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus alamat ini?")) return;

    try {
      const res = await fetch("/api/user/address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Alamat berhasil dihapus");
        refreshData();
      }
    } catch (error) {
      toast.error("Gagal menghapus alamat");
    }
  };

  // Fungsi Set Utama
  const handleSetMain = async (id: string) => {
    try {
      const res = await fetch("/api/user/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isMain: true }),
      });

      if (res.ok) {
        toast.success("Alamat utama diperbarui");
        refreshData();
      }
    } catch (error) {
      toast.error("Gagal memperbarui alamat");
    }
  };

  // Buka modal untuk Edit
  const openEditModal = (address: any) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  // Buka modal untuk Tambah Baru
  const openAddModal = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  return (
      <div className="max-w-4xl mx-auto md:px-4 md:py-8">
        {/* Header */}
        <div className="px-6 py-3 z-10 flex justify-between items-center bg-blue-50 backdrop-blur-md">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Alamat Saya</h1>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Tambah
          </button>
        </div>

        {/* List Alamat */}
        <div className="flex flex-col">
          {addresses.length === 0 ? (
            <div className="bg-white py-32 text-center">
              <MapPin size={48} className="mx-auto text-zinc-200 mb-4" strokeWidth={1} />
              <p className="text-zinc-600 text-sm font-medium">Belum ada alamat tersimpan.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div 
                key={address.id} 
                className={`group bg-white p-3 border-t-1 border-slate-300 transition-all duration-300`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1 divide-x-2 divide-amber-700 divide-y">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-zinc-900">{address.recipient}</span>
                        <p className="text-xs text-zinc-500 font-medium ">{displayPhoneNumber(address.phone)}</p>
                    </div>
                  </div>
                </div>

                <div className="text-[13px] text-zinc-600 leading-relaxed ">
                  <p>{address.fullAddress}</p>
                  <p>{address.district}, {address.city}, {address.province} {address.postalCode}</p>
                </div>

                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex flex-row items-center justify-start gap-4">
                    { address.label && (
                    <p className="bg-emerald-600 rounded-full px-3 py-1 text-xs font-medium text-white">
                      {address.label}
                    </p> )
                    }
                    {address.isMain && (
                      <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Alamat Pengiriman Utama
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row justify-end gap-2">
                  {!address.isMain && (  <button 
                      onClick={() => handleSetMain(address.id)}
                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
                    >
                      Jadikan Utama
                    </button>
                  )}
                    <button 
                      onClick={() => openEditModal(address)}
                      className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-all"
                      title="Ubah"
                    >
                      <Edit3 size={18} />
                    </button>
                    {address && (
                      <button 
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
              {/* Modal Manager */}
      <AddressManager 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
        initialData={selectedAddress}
      />
      </div>


  );
}