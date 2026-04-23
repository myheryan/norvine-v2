import { 
  User, MapPin, Lock,
  ShoppingBag, Ticket, Coins, 
  WalletCards
} from "lucide-react";

export const USER_MENU = [
  {
    title: "Akun Saya",
    icon: User,
    folder: "/user/account",
    submenu: [
      { label: "Profil", href: "/user/profile", icon: User },
      { label: "Alamat", href: "/user/address", icon: MapPin },
      { label: "Keamanan Password", href: "/user/password", icon: Lock },
    ]
  },
  {
    title: "Pesanan Saya",
    icon: ShoppingBag,
    folder: "/user/orders",
    href: "/user/orders"

  },
  {
    title: "Voucher & Koin",
    icon: Ticket,
    folder: "/user/voucher",
    submenu: [
      { label: "Voucher Norvine", href: "", icon: Ticket },
      { label: "Koin Loyalitas", href: "", icon: Coins },
    ]
  }
];