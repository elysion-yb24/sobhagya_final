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
import { Toaster } from "react-hot-toast";

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
  title: "Sobhagya Bhakti — Har Hindu Ka Bharosa",
  description: "Sobhagya Bhakti — Har Hindu Ka Bharosa. Your trusted astrology consultation platform for accurate predictions and expert guidance.",
  icons: {
    icon: "/sobhagya-logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, viewport-fit=cover" 
        />
        <meta name="theme-color" content="#F7941D" />
      </head>
      <body className={`${inter.variable} ${ebGaramond.variable} ${poppins.variable}`} suppressHydrationWarning>
        <Suspense fallback={<Loading />}>
          <WalletBalanceProvider>
            <SessionManagerProvider>  {/* 👈 wrap everything inside */}
              <AuthErrorHandler />
              <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
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
