import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Suspense } from "react";
import Loading from "./rashi/[name]/loading";
import ClientLayout from "./ClientLayout";
import ClientPathname from "./components/ClientPathname"; // Import the client component
import { WalletBalanceProvider } from "@/app/components/astrologers/WalletBalanceContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sobhagya",
  description: "Your trusted astrology consultation platform",
  icons: {
    icon: "/sobhagya_logo.avif",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<Loading />}>
          <WalletBalanceProvider>
            <Header />
            <ClientLayout>
              <main className="min-h-screen pt-20">{children}</main>
            </ClientLayout>
            <Footer />
          </WalletBalanceProvider>
        </Suspense>
      </body>
    </html>
  );
}
