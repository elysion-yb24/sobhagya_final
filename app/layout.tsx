import { Inter, EB_Garamond, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/app/components/ConditionalHeader";
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins"
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
          content="width=device-width, initial-scale=1, viewport-fit=cover" 
        />
        <meta name="theme-color" content="#F7941D" />
      </head>
      <body className={`${inter.variable} ${ebGaramond.variable} ${poppins.variable}`}>
        <Suspense fallback={<Loading />}>
          <WalletBalanceProvider>
            <SessionManagerProvider>  {/* 👈 wrap everything inside */}
              <AuthErrorHandler />
              <ConditionalHeader />
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
