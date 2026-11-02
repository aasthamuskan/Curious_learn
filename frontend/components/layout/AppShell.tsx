"use client";

import React from "react";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";

/**
 * AppShellProps — yeh interface define karta hai ki AppShell ko
 * kya props milenge. `children` matlab jo bhi content andar pass hoga.
 */
interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — poore app ka outer layout wrapper hai yeh component.
 *
 * Isme teen cheezein hain:
 *  1. Header — top navigation bar (desktop ke liye)
 *  2. main — actual page content yahan render hoga (children)
 *  3. MobileNavigation — neeche wali nav bar (sirf mobile par dikhti hai)
 *
 * Yeh component saare pages ko wrap karta hai taaki layout consistent rahe.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    // Full-screen dark background, white text, flex column layout
    <div className="min-h-screen bg-[#131f24] text-white flex flex-col font-sans">

      {/* Top header bar — logo, navigation links, user avatar, etc. */}
      <Header />

      {/* Main content area — yahan actual page ka UI aayega */}
      {/* pb-20 mobile par bottom nav ke liye extra padding deta hai */}
      <main className="flex-1 pb-20 md:pb-8 max-w-6xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* Mobile bottom navigation bar — sirf chhoti screens par visible */}
      <MobileNavigation />
    </div>
  );
};
