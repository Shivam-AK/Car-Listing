import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default async function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main className="mt-16">{children}</main>
      <Footer />
    </>
  );
}
