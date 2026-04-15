"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { USER_MENU } from "@/constants/user-menu";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user?: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
  pathname: string;
}

export default function Sidebar({ pathname, user }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Otomatis buka accordion di desktop jika ada submenu aktif
  useEffect(() => {
    const activeGroup = USER_MENU.find((group) =>
      group.submenu?.some((sub) => pathname.startsWith(sub.href))
    );
    if (activeGroup && !openMenus.includes(activeGroup.title)) {
      setOpenMenus((prev) => [...prev, activeGroup.title]);
    }
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const userName = user?.name || "Member";
  const userEmail = user?.email || "norvine.member@mail.com";
  const userImageUrl = user?.image || "";
  
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* ====================================================================
          DESKTOP SIDEBAR 
          ==================================================================== */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col h-[calc(100vh-80px)] sticky top-0 px-6 py-8 border-r border-zinc-100">
        {/* User Card */}
        <div className="flex items-center gap-4 px-3 mb-10 py-4 rounded-3xl bg-zinc-50/80 border border-zinc-100 shadow-sm">
          <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-sm overflow-hidden">
            <AvatarImage src={userImageUrl} className="object-cover" />
            <AvatarFallback className="bg-zinc-900 text-white font-bold text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-zinc-900 truncate tracking-tight">
              {userName}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest truncate">
              Premium Member
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {USER_MENU.map((group, index) => {
            const isOpen = openMenus.includes(group.title);
            const isGroupActive = group.submenu?.some(sub => pathname === sub.href) || pathname === group.href;

            return (
              <div key={`desktop-group-${group.title}-${index}`} className="mb-2">
                {group.submenu ? (
                  <button 
                    onClick={() => toggleMenu(group.title)}
                    className={cn(
                      "flex items-center justify-between w-full p-2 rounded-2xl transition-all group",
                      isOpen ? "bg-zinc-100/50" : "hover:bg-zinc-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl transition-all",
                        isGroupActive ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" : "bg-zinc-100 text-zinc-600"
                      )}>
                        <group.icon size={18} strokeWidth={2.5} />
                      </div>
                      <span className={cn(
                        "text-sm font-bold transition-colors",
                        isGroupActive ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-900"
                      )}>
                        {group.title}
                      </span>
                    </div>
                    <ChevronRight size={16} className={cn(
                      "text-zinc-300 transition-transform duration-300", 
                      isOpen && "rotate-90 text-zinc-900"
                    )} />
                  </button>
                ) : (
                  <Link 
                    href={group.href || "#"}
                    className={cn(
                      "flex items-center gap-3 w-full p-2 rounded-2xl transition-all",
                      isGroupActive ? "bg-zinc-100/50" : "hover:bg-zinc-50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl transition-all",
                      isGroupActive ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" : "bg-zinc-100 text-zinc-600"
                    )}>
                      <group.icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className={cn(
                        "text-sm font-bold",
                        isGroupActive ? "text-zinc-900" : "text-zinc-500"
                    )}>
                      {group.title}
                    </span>
                  </Link>
                )}

                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out pl-12 space-y-1",
                  isOpen && group.submenu ? "max-h-60 opacity-100 py-2" : "max-h-0 opacity-0"
                )}>
                  {group.submenu?.map((sub, subIndex) => {
                    const isActive = pathname === sub.href;
                    return (
                      <Link 
                        key={`desktop-sub-${sub.label}-${subIndex}`} 
                        href={sub.href} 
                        className={cn(
                          "flex items-center gap-3 py-1.5 text-sm transition-all relative group",
                          isActive ? "text-zinc-900 font-bold" : "text-zinc-500 hover:text-zinc-900"
                        )}
                      >
                        {sub.label}
                        {isActive && (
                          <span className="absolute left-[-18px] w-1.5 h-1.5 rounded-full bg-zinc-900" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Desktop */}
        <div className="pt-6 mt-4 border-t border-zinc-100">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-4 w-full p-3 rounded-2xl text-zinc-500 hover:text-red-600 hover:bg-red-50/50 transition-all group font-bold text-xs uppercase tracking-[0.2em]"
          >
            <LogOut size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* ====================================================================
          MOBILE BOTTOM NAVIGATION (Ala Telegram)
          ==================================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-100 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-between max-w-md mx-auto">
          {USER_MENU.slice(0, 4).map((group, idx) => {
            const isActive = pathname === group.href || group.submenu?.some(sub => pathname === sub.href);
            return (
              <Link 
                key={`mobile-nav-${idx}`}
                href={group.href || (group.submenu ? group.submenu[0].href : "#")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all relative px-2",
                  isActive ? "text-zinc-900" : "text-zinc-400"
                )}
              >
                <div className={cn("p-1.5 rounded-xl transition-all", isActive && "bg-zinc-100")}>
                  <group.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {group.title.split(" ")[0]}
                </span>
                {isActive && <span className="absolute -top-1 w-1 h-1 rounded-full bg-zinc-900" />}
              </Link>
            );
          })}

          {/* Trigger Drawer Profile */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="flex flex-col items-center gap-1 text-zinc-400"
          >
            <div className="p-1.5">
              <Avatar className="h-6 w-6 rounded-lg border border-zinc-200 overflow-hidden">
                <AvatarImage src={userImageUrl} className="object-cover" />
                <AvatarFallback className="text-[8px] bg-zinc-900 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
          </button>
        </nav>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300",
        isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )} onClick={() => setIsMobileOpen(false)}>
        <div 
          className={cn(
            "fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out p-6 flex flex-col",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Profile Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-50">
             <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm overflow-hidden">
                <AvatarImage src={userImageUrl} className="object-cover" />
                <AvatarFallback className="bg-zinc-900 text-white font-bold">{userInitials}</AvatarFallback>
             </Avatar>
             <div className="min-w-0">
                <h3 className="font-bold text-zinc-900 truncate">{userName}</h3>
                <p className="text-[10px] text-zinc-400 truncate">{userEmail}</p>
             </div>
          </div>

          {/* Full Menu List in Drawer */}
          <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
            {USER_MENU.map((group, idx) => (
              <div key={`drawer-group-${idx}`} className="space-y-3">
                <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{group.title}</h4>
                <div className="grid gap-1">
                  {group.submenu ? group.submenu.map((sub, sIdx) => (
                    <Link 
                      key={`drawer-sub-${sIdx}`} 
                      href={sub.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-xl text-sm font-bold transition-colors",
                        pathname === sub.href ? "bg-zinc-50 text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                      )}
                    >
                      <sub.icon size={16} />
                      {sub.label}
                    </Link>
                  )) : (
                    <Link 
                      href={group.href || "#"}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-xl text-sm font-bold transition-colors",
                        pathname === group.href ? "bg-zinc-50 text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                      )}
                    >
                      <group.icon size={16} />
                      {group.title}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sign Out Drawer */}
          <button 
            onClick={() => signOut()}
            className="mt-auto pt-6 border-t border-zinc-50 flex items-center gap-3 text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors"
          >
            <LogOut size={18} />
            Logout Account
          </button>
        </div>
      </div>
    </>
  );
}