import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Loader2, X, MapPin, ChevronDown, CheckCircle2, CheckIcon } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";

interface RegionItem {
  id: string;
  name: string;
  lionDistrictId?: string;
  postalOptions?: string[];
}

const DEFAULT_FORM_DATA = {
  id: "", label: "", recipient: "", phone: "", fullAddress: "",
  province: "", city: "", district: "", postalCode: "", isMain: false,
};

export default function AddressManager({ isOpen, onClose, onSuccess, initialData }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGeo, setIsFetchingGeo] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [regencies, setRegencies] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [postalOptions, setPostalOptions] = useState<string[]>([]);

  // State internal untuk ID teknis yang dibutuhkan API (tidak disimpan di DB Prisma Anda)
  const [geoIds, setGeoIds] = useState({ provinceId: "", cityId: "", districtId: "", lionDistrictId: "" });
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const getAddressData = useCallback(async (type: string, id?: string) => {
    try {
      setIsFetchingGeo(true);
      const url = id ? `/api/address?type=${type}&id=${id}` : `/api/address?type=${type}`;
      const res = await fetch(url);
      return await res.json();
    } catch (error) { 
      return []; 
    } finally { 
      setIsFetchingGeo(false); 
    }
  }, []);

  // LOGIKA SYNC: Mencari ID berdasarkan Nama saat Update Mode
  useEffect(() => {
    const syncAddressInfo = async () => {
      if (isOpen) {
        if (initialData?.id) {
          setFormData({ ...DEFAULT_FORM_DATA, ...initialData });
          try {
            const provs = await getAddressData("provinces");
            setProvinces(provs);
            const foundProv = provs.find((p: any) => p.name.toLowerCase() === initialData.province.toLowerCase());

            if (foundProv) {
              setGeoIds(prev => ({ ...prev, provinceId: foundProv.id }));
              const cities = await getAddressData("cities", foundProv.id);
              setRegencies(cities);
              const foundCity = cities.find((c: any) => c.name.toLowerCase() === initialData.city.toLowerCase());

              if (foundCity) {
                setGeoIds(prev => ({ ...prev, cityId: foundCity.id }));
                const dists = await getAddressData("districts", foundCity.id);
                setDistricts(dists);
                const foundDist = dists.find((d: any) => d.name.toLowerCase() === initialData.district.toLowerCase());

                if (foundDist) {
                  setGeoIds(prev => ({ 
                    ...prev, 
                    districtId: foundDist.id, 
                    lionDistrictId: foundDist.lionDistrictId || "" 
                  }));
                  setPostalOptions(foundDist.postalOptions || []);
                }
              }
            }
          } catch (err) {
            console.error("Sync Error:", err);
          }
        } else {
          setFormData(DEFAULT_FORM_DATA);
          setGeoIds({ provinceId: "", cityId: "", districtId: "", lionDistrictId: "" });
          setRegencies([]);
          setDistricts([]);
          getAddressData("provinces").then(setProvinces);
        }
      }
    };
    syncAddressInfo();
  }, [isOpen, initialData, getAddressData]);

  const selectRegion = (field: any, item: RegionItem) => {
    setFormData(prev => ({ ...prev, [field.nameKey]: item.name }));
    setGeoIds(prev => ({ ...prev, [field.idKey]: item.id }));

    field.reset.forEach((r: string) => {
        setFormData(prev => ({ ...prev, [r]: "" }));
        if (r === "city") {
          setGeoIds(p => ({ ...p, cityId: "", districtId: "", lionDistrictId: "" }));
          setRegencies([]);
        }
        if (r === "district") {
          setGeoIds(p => ({ ...p, districtId: "", lionDistrictId: "" }));
          setDistricts([]);
        }
    });

    if (field.label === "Provinsi") {
      getAddressData("cities", item.id).then(setRegencies);
    } else if (field.label === "Kota / Kabupaten") {
      getAddressData("districts", item.id).then(setDistricts);
    } else if (field.label === "Kecamatan") {
      setGeoIds(prev => ({ ...prev, lionDistrictId: item.lionDistrictId || "" }));
      setPostalOptions(item.postalOptions || []);
    }
    setActiveDropdown(null);
  };

  const handleManualSubmit = async () => {
    if (!formData.recipient || !formData.phone || !formData.fullAddress || !geoIds.lionDistrictId) {
      toast.error("Mohon lengkapi wilayah hingga tervalidasi (Checkmark aktif).");
      return;
    }

    setIsLoading(true);
    try {
      const method = formData.id ? "PUT" : "POST";
      const res = await fetch("/api/user/address", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan data.");
      toast.success("Alamat berhasil diperbarui.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-hidden border border-zinc-200 flex flex-col max-h-[95vh]" ref={dropdownRef}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-zinc-900" />
            <span className="text-sm font-bold tracking-[0.1em] text-zinc-900 uppercase">Detail Lokasi</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-2 overflow-y-auto">
          
          {/* Section: Kontak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 tracking-widest">Penerima</label>
              <input 
                placeholder="Nama Lengkap"
                className="w-full h-11 px-3 border border-zinc-200 text-sm focus:border-black outline-none transition-all" 
                value={formData.recipient} 
                onChange={e => setFormData({...formData, recipient: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 tracking-widest">Telepon</label>
              <input 
                placeholder="08xxxxxxxxxx"
                className="w-full h-11 px-3 border border-zinc-200 text-sm focus:border-black outline-none transition-all" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: formatPhoneNumber(e.target.value.replace(/\D/g, ""))})} 
              />
            </div>
          </div>

          {/* Section: Wilayah */}
          <div className="space-y-2">
            {[
              { label: "Provinsi", data: provinces, value: formData.province, idValue: geoIds.provinceId, idKey: "provinceId", nameKey: "province", reset: ["city", "district", "postalCode"] },
              { label: "Kota / Kabupaten", data: regencies, value: formData.city, idValue: geoIds.cityId, idKey: "cityId", nameKey: "city", reset: ["district", "postalCode"], disabled: !geoIds.provinceId },
              { label: "Kecamatan", data: districts, value: formData.district, idValue: geoIds.districtId, idKey: "districtId", nameKey: "district", reset: ["postalCode"], disabled: !geoIds.cityId },
            ].map((field) => {
              const filtered = field.data.filter(i => (i.name || "").toLowerCase().includes((field.value || "").toLowerCase()));
              return (
                <div key={field.label} className="relative">
                  <label className="text-sm text-zinc-400 tracking-widest">{field.label}</label>
                  <div className="relative">
                    <input 
                      disabled={field.disabled}
                      value={field.value}
                      placeholder={field.disabled ? "Menunggu pilihan sebelumnya..." : `Cari ${field.label}...`}
                      onFocus={() => setActiveDropdown(field.label)}
                      onBlur={() => {
                        // Dropdown tertutup saat tidak fokus
                        setTimeout(() => setActiveDropdown(null), 200);
                      }}
                      onChange={e => {
                        setActiveDropdown(field.label);
                        setFormData({...formData, [field.nameKey]: e.target.value});
                        setGeoIds({...geoIds, [field.idKey]: ""});
                      }}
                      className={`w-full h-11 px-3 border text-sm outline-none transition-all ${field.disabled ? 'bg-zinc-50 border-zinc-100' : 'bg-white border-zinc-200 focus:border-black'}`}
                    />
                    <div className="absolute right-3 top-3.5 flex items-center gap-2">
                       {field.idValue && <CheckCircle2 size={14} className="text-green-600" />}
                       <ChevronDown size={14} className="text-zinc-300" />
                    </div>
                    {activeDropdown === field.label && filtered.length > 0 && (
                      <div className="absolute top-12 left-0 w-full bg-white border border-black z-[100] max-h-40 overflow-y-auto shadow-xl">
                        {filtered.map(item => (
                          <div key={item.id} onMouseDown={() => selectRegion(field, item)} className="px-4 py-3 text-xs hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0">
                            {item.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section: Logistik */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 tracking-widest">Kode Pos</label>
              <div className="relative">
                <select 
                  className="w-full h-11 px-3 border border-zinc-200 text-sm outline-none bg-white appearance-none disabled:bg-zinc-50"
                  value={formData.postalCode}
                  onChange={e => setFormData({...formData, postalCode: e.target.value})}
                  disabled={!geoIds.districtId}
                >
                  <option value="">Pilih</option>
                  {postalOptions.map((p, i) => {
                    const codeOnly = p.split(" - ")[0]; 
                    return <option key={i} value={codeOnly}>{p}</option>;
                  })}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-4 text-zinc-300 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 tracking-widest">Lion ID</label>
              <div className={`h-11 px-3 border flex items-center justify-between transition-all ${geoIds.lionDistrictId ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-50 border-zinc-100 text-zinc-300 italic'}`}>
                <span className="text-xs font-mono">{geoIds.lionDistrictId || "Auto-detected"}</span>
                {geoIds.lionDistrictId && <CheckCircle2 size={12} className="text-zinc-900" />}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400 tracking-widest">Alamat Lengkap</label>
            <textarea 
              placeholder="Nomor Rumah, Nama Jalan, RT/RW, Patokan"
              className="w-full min-h-[80px] p-3 border border-zinc-200 text-sm outline-none focus:border-black resize-none" 
              value={formData.fullAddress} 
              maxLength={100}
              onChange={e => setFormData({...formData, fullAddress: e.target.value})} 
            />
          </div>

          {/* Section: Meta (Optional Labels & Main) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex gap-2 h-9">
              {['Rumah', 'Kantor'].map(l => (
                <button 
                  key={l} type="button" 
                  onClick={() => setFormData({...formData, label: formData.label === l ? "" : l})} 
                  className={`px-4 text-sm border transition-all ${formData.label === l ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer h-5 w-5 cursor-pointer appearance-none border border-zinc-300 checked:bg-black checked:border-black transition-all" 
                  checked={formData.isMain} 
                  onChange={e => setFormData({...formData, isMain: e.target.checked})} 
                />
                <CheckIcon size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 left-1 pointer-events-none" />
              </div>
              <span className="text-sm text-zinc-500 group-hover:text-black transition-colors">Utama</span>
            </label>
          </div>

          {/* Submit */}
          <button 
            onClick={handleManualSubmit}
            disabled={isLoading || !geoIds.lionDistrictId}
            className="w-full py-4 bg-black text-white text-sm hover:bg-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Simpan Alamat"}
          </button>
        </div>
      </div>
    </div>
  );
}