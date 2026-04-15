import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { FiUser, FiLogOut, FiPackage, FiChevronDown } from 'react-icons/fi'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

interface UserMenuProps {
  textColor: string; // Untuk passing warna text (putih/hitam) berdasarkan scroll
}

export default function UserMenu({ textColor }: UserMenuProps) {
  const { data: session, status } = useSession()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          {/* Trigger Icon User */}
          <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors duration-300">
            <div className={`flex items-center ${textColor}`}>
              <FiUser size={20} />
            </div>
          </NavigationMenuTrigger>

          {/* Isi Dropdown */}
          <NavigationMenuContent>
            <ul className="w-[160px] bg-white text-slate-900 shadow-2xl animate-in fade-in duration-200 p-0 m-0">
              {status === "authenticated" ? (
                <>
                  {/* Header Info User */}
                  <li className="p-3 border-b border-slate-50 bg-slate-50/50 rounded-lg">
                    <p className="font-semibold truncate text-orange-600">{session.user?.name}</p>
                  </li>

                  {/* Menu Links */}
                  <li>
                    <NavigationMenuLink href="/user/profile" className="flex items-center gap-3 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                        <FiUser size={15} /> Profile Saya
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink  href="/user/orders" className="flex items-center gap-3 hover:bg-slate-100 rounded-lg transition-colors text-slate-60" >
                        <FiPackage size={15} /> Pesanan Saya
                    </NavigationMenuLink>
                  </li>

                  <div className="h-px bg-slate-100" />

                  {/* Logout Button */}
                  <li>
                    <button 
                      onClick={() => signOut()} 
                      className="flex w-full items-center gap-3 text-sm p-3 font-semibold text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FiLogOut size={15} /> Logout
                    </button>
                  </li>
                </>
              ) : (
                /* Jika Belum Login */
                <li className="p-1">
                  <NavigationMenuLink href="/auth/login" className="flex items-center justify-center w-full p-3 bg-[#1D1E20] text-white text-[10px] font-bold rounded-lg hover:bg-indigo-600 transition-all uppercase tracking-[0.2em]">
                      Login / Register
                  </NavigationMenuLink>
                </li>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}