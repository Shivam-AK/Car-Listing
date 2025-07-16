import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default async function AuthLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-center mt-16 min-h-[calc(100dvh-64px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
