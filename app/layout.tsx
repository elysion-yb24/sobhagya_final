import { Poppins, EB_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Suspense } from "react";
import Loading from "./rashi/[name]/loading";
import ClientLayout from "./ClientLayout";
import ClientPathname from "./components/ClientPathname"; // Import the client component
import { WalletBalanceProvider } from "@/app/components/astrologers/WalletBalanceContext";
import AuthErrorHandler from "@/app/components/AuthErrorHandler";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins"
});

const ebGaramond = EB_Garamond({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-eb-garamond"
});

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${poppins.variable} ${ebGaramond.variable}`}>
        <Suspense fallback={<Loading />}>
          <WalletBalanceProvider>
            <AuthErrorHandler />
            <Header />
            <ClientLayout>
              <main className="min-h-screen pt-16 md:pt-16 lg:pt-20">{children}</main>
            </ClientLayout>
            <Footer />
          </WalletBalanceProvider>
        </Suspense>
      </body>
    </html>
  );
}
