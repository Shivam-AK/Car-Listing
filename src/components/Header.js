import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";

export default function Header({ isAdminPage = false }) {
  const isAdmin = true;

  return (
    <header className="fixed top-0 z-50 bg-white/80 backdrop-blur-md w-full border-b">
      <nav className="mx-auto px-4 py-2 flex items-center justify-between">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex">
          <Image
            src="/logo.png"
            alt="Vahiql Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
          {isAdminPage && (
            <span className="text-xs font-extralight">admin</span>
          )}
        </Link>

        <div className="flex items-center space-x-4">
          {isAdminPage ? (
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft />
                <span>Back to App</span>
              </Button>
            </Link>
          ) : (
            <SignedIn>
              <Link href="/saved-cars">
                <Button>
                  <Heart />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>

              {!isAdmin ? (
                <Link href="/reservations">
                  <Button variant="outline">
                    <CarFront />
                    <span className="hidden md:inline">My Reservations</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/admin">
                  <Button variant="outline">
                    <Layout />
                    <span className="hidden md:inline">Admin Portal</span>
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
        </div>
      </nav>
    </header>
  );
}
