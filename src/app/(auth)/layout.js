import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default async function AuthLayout({ children }) {
  return (
    <>
      <Header />
      <main className="mt-16 flex justify-center p-40">{children}</main>
      <Footer />
    </>
  );
}
