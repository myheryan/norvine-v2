"use client";

import { useState, useEffect } from "react";
import { MapPin, X, Check, Plus, Edit2 } from "lucide-react";
import AddressManager from "@/components/user/AddressManager";
import { Button } from "@/components/ui/baseInput";
import { toast } from "sonner";

// 1. Definisikan Interface agar data konsisten
export interface AddressItem {
  id?: string;
  label?: string;
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isMain?: boolean;
}

interface Props {
  selectedAddr: AddressItem | null;
  setAddress: (addr: AddressItem) => void;
}

export default function CheckoutAddressSection({ selectedAddr, setAddress }: Props) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // 2. Fungsi untuk memetakan data dari database ke State Checkout
  const handleSelect = (addr: any) => {
    if (!addr) return;
    const mappedAddress: AddressItem = {
      id: addr.id,
      recipientName: addr.recipient || addr.recipientName || "Tanpa Nama",
      recipientPhone: addr.phone || addr.recipientPhone || "",
      fullAddress: addr.fullAddress || addr.address || "",
      district: addr.district || "",
      city: addr.city || "",
      province: addr.province || "",
      postalCode: addr.postalCode ? String(addr.postalCode) : ""
    };
    setAddress(mappedAddress);
    setIsListModalOpen(false);
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const openEditModal = (addr: any) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  // 3. Fetch data alamat
  const fetchMainAddress = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/address?mainOnly=true");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAddresses(data);
        const main = data.find((a: any) => a.isMain) || data[0];
        // Hanya set otomatis jika belum ada alamat yang dipilih sebelumnya
        if (!selectedAddr?.recipientName) handleSelect(main);
      }
    } catch (error) {
      console.error("Gagal load alamat utama");
    } finally { setLoading(false); }
  };

  const fetchAllAddresses = async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/user/address");
      const data = await res.json();
      if (Array.isArray(data)) setAddresses(data);
    } catch (error) {
      toast.error("Gagal memuat daftar alamat");
    } finally { setListLoading(false); }
  };

  useEffect(() => { fetchMainAddress(); }, []);

  if (loading && !selectedAddr?.fullAddress) {
    return <div className="bg-white h-24 animate-pulse border border-zinc-100 rounded-sm" />;
  }

  return (
    <>
      {/* --- TAMPILAN UTAMA DI HALAMAN CHECKOUT --- */}
      <div className="bg-white relative overflow-hidden shadow-sm rounded-xs border border-zinc-100">
        <div className="h-[3px] w-full flex">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-zinc-950" : "bg-orange-600"} skew-x-[-30deg]`} />
          ))}
        </div>

        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4 text-zinc-900">
            <MapPin size={16} className="text-orange-600" />
            <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase">Alamat Pengiriman</h2>
          </div>

          {selectedAddr?.fullAddress ? (
            <div className="flex justify-between items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-zinc-900 text-sm tracking-tight">{selectedAddr.recipientName}</span>
                  <span className="text-zinc-300 text-xs">|</span>
                  <span className="text-zinc-600 text-sm">{selectedAddr.recipientPhone}</span>
                </div>
                <p className="text-[13px] text-zinc-500 leading-relaxed max-w-xl">
                  {selectedAddr.fullAddress}, {selectedAddr.district}, {selectedAddr.city}, {selectedAddr.province}{" "}
                  <span className="font-bold text-zinc-800">[{selectedAddr.postalCode}]</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setIsListModalOpen(true); fetchAllAddresses(); }}
                className="text-zinc-900 text-[10px] font-bold border border-zinc-200 px-4 py-2.5 hover:bg-zinc-50 rounded-sm tracking-[0.1em] uppercase transition-all"
              >
                Ganti
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAddModal}
              className="w-full py-6 border-2 border-dashed border-zinc-100 rounded-sm text-zinc-400 text-[10px] font-bold tracking-widest hover:bg-zinc-50 flex flex-col items-center gap-2 uppercase transition-all"
            >
              <Plus size={18} /> Tambah Alamat Baru
            </button>
          )}
        </div>
      </div>

      {/* --- MODAL DAFTAR ALAMAT --- */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-[2px]" onClick={() => setIsListModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-t-xl md:rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-900 text-[10px] uppercase tracking-[0.2em]">Pilih Alamat</h3>
              <button onClick={() => setIsListModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3 bg-zinc-50/30">
              {listLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-sm" />)}
                </div>
              ) : (
                addresses.map((addr) => {
                  const isSelected = selectedAddr?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      className={`group p-4 border transition-all relative flex justify-between items-center bg-white ${
                        isSelected ? "border-zinc-900" : "border-zinc-100 hover:border-zinc-300"
                      }`}
                    >
                      {/* Area Klik untuk Memilih Alamat */}
                      <div className="space-y-1 pr-4 flex-1 cursor-pointer" onClick={() => handleSelect(addr)}>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                {addr.label || "Alamat"}
                            </span>
                            {isSelected && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">● Digunakan</span>}
                        </div>
                        <div className="text-sm font-bold text-zinc-800">
                          {addr.recipient} <span className="text-zinc-300 font-normal mx-1">|</span> {addr.phone}
                        </div>
                        <p className="text-xs text-zinc-500 leading-normal">
                          {addr.fullAddress || addr.address}, {addr.district}, {addr.city} ({addr.postalCode})
                        </p>
                      </div>

                      {/* TOMBOL EDIT - e.stopPropagation agar tidak mentrigger handleSelect */}
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          openEditModal(addr); 
                        }}
                        className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all"
                      >
                        <Edit2 size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-white border-t border-zinc-100">
              <Button 
                type="button" 
                onClick={() => { setIsListModalOpen(false); openAddModal(); }} 
                className="w-full bg-zinc-900 text-white py-6 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                Tambah Alamat Baru
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Manager untuk Tambah/Edit */}
      <AddressManager 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSuccess={() => {
            fetchMainAddress();
            if (isListModalOpen) fetchAllAddresses();
        }}
        initialData={editingAddress} 
      />
    </>
  );
}