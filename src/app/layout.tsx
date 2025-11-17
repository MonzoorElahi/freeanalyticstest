import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "WooCommerce Analytics Dashboard",
  description: "Modern analytics dashboard for WooCommerce stores",
  icons: {
    icon: "https://ci3.googleusercontent.com/meips/ADKq_NaE_oWXdD1JtInFmEcyVBj_2iUGqAxLkH0Puq4Ekzxkyax7RMFeP15ETdyAMHq5uOOPBgLceV0_auWlExOTyX-lgGdqQeIVkItlVKEtBkvGtzmTPczB_vJ5ZmQyow=s0-d-e1-ft#https://media.marka-img.com/2496c9ee/xtzZUEqs8oyai7SQP486DHaNA4VbUp.png",
    apple: "https://ci3.googleusercontent.com/meips/ADKq_NaE_oWXdD1JtInFmEcyVBj_2iUGqAxLkH0Puq4Ekzxkyax7RMFeP15ETdyAMHq5uOOPBgLceV0_auWlExOTyX-lgGdqQeIVkItlVKEtBkvGtzmTPczB_vJ5ZmQyow=s0-d-e1-ft#https://media.marka-img.com/2496c9ee/xtzZUEqs8oyai7SQP486DHaNA4VbUp.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
