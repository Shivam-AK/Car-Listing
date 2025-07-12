import userExists from "@/lib/userExists";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

export default async function Header({ isAdminPage = false }) {
  const user = await userExists();

  const isAdmin = user?.role === "ADMIN" || user?.role === "DEALERSHIP";

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <h1 className="size-0 truncate">Vahiql Listing</h1>
      <div className="flex-between mx-auto gap-x-2 px-4 py-2">
        <Link href={isAdminPage ? "/admin" : "/"} className="relative flex">
          <Image
            src="/logo.png"
            alt="Vahiql Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
          {isAdminPage && (
            <span className="absolute right-0 text-xs font-extralight">
              admin
            </span>
          )}
        </Link>

        <nav className="mb:space-x-4 flex items-center space-x-2.5">
          {isAdminPage ? (
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft />
                <span className="hidden sm:inline">Back to App</span>
              </Button>
            </Link>
          ) : (
            <SignedIn>
              <Link href="/saved-cars">
                <Button>
                  <Heart />
                  <span className="hidden sm:inline">Saved Cars</span>
                </Button>
              </Link>

              {!isAdmin ? (
                <Link href="/reservations">
                  <Button variant="outline">
                    <CarFront />
                    <span className="hidden sm:inline">My Reservations</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/admin">
                  <Button variant="outline">
                    <Layout />
                    <span className="hidden sm:inline">Admin Portal</span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}

          <SignedOut>
            {!isAdminPage && (
              <SignInButton forceRedirectUrl="/">
                <Button variant="outline">Login</Button>
              </SignInButton>
            )}
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>

          {isAdminPage && (
            <SidebarTrigger className="inline-flex size-9 border shadow md:hidden" />
          )}
        </nav>
      </div>
    </header>
  );
}
