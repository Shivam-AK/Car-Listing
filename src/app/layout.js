import { Inter } from "next/font/google";
import "@/app/globals.css";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const ClerkProvider = dynamic(() =>
  import("@clerk/nextjs").then((mod) => mod.ClerkProvider)
);

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    template: "%s | Vehiql AI",
    default: "Vehiql AI",
  },
  description: "Find Your Dream Car with Vehiql AI.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {children}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
