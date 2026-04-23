import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Suspense } from "react";
import Loading from "./rashi/[name]/loading";
import ClientLayout from "./ClientLayout";
import ClientPathname from "./components/ClientPathname";
import { WalletBalanceProvider } from "@/app/components/astrologers/WalletBalanceContext";
import AuthErrorHandler from "@/app/components/AuthErrorHandler";
import { SessionManagerProvider } from "@/app/components/astrologers/SessionManager";
import ConditionalFooter from "./components/ConditionalFooter"; 

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter"
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
    icon: "/sobhagya-logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
      </head>
      <body className={`${inter.variable} ${ebGaramond.variable}`}>
        <Suspense fallback={<Loading />}>
          <WalletBalanceProvider>
            <SessionManagerProvider>  {/* 👈 wrap everything inside */}
              <AuthErrorHandler />
              <Header />
               <ClientLayout>
                {children}
              </ClientLayout>
              <ConditionalFooter />
            </SessionManagerProvider>
          </WalletBalanceProvider>
        </Suspense>
      </body>
    </html>
  );
}
