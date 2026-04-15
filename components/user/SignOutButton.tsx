"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutTrigger() {
  return (
    <div 
      onClick={() => signOut({ callbackUrl: "/" })} 
      className="flex items-center p-2 gap-3 w-full cursor-pointer text-red-600 font-medium"
    >
      <LogOut className="h-5 w-5" /> 
      <span>Keluar</span>
    </div>
  );
}