// app/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Book A Shipment", href: "/" },
  { label: "Profile", href: "/profile" },
  { label: "Tracking", href: "/tracking" },
  { label: "Cancel Waybill", href: "/cancel-waybill" },
  { label: "Bulk Booking", href: "/bulk-waybill" },
  { label: "Register Pickup", href: "/register-pickup" },
  { label: "Reports", href: "/reports" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <nav className="flex h-16 items-center gap-8">
          {menu.map(item => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-sm font-medium transition-colors
                  ${active
                    ? "text-blue-600 border-b-2 border-blue-600 h-full flex items-center"
                    : "text-gray-700 hover:text-blue-600"}
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
