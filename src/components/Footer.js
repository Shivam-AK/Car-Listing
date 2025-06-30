import Link from "next/link";

const socialLink = [
  { title: "Portfolio", url: "https://shibhu.com/" },
  { title: "Github", url: "https://github.com/Shivam-AK/" },
  {
    title: "Linked In",
    url: "https://www.linkedin.com/in/shivam-web-developer-designer/",
  },
];

export default function Footer() {
  return (
    <footer className="flex flex-col justify-between gap-8 bg-black px-5 py-20 text-white lg:px-10">
      <div className="flex flex-col justify-between gap-10">
        <div className="flex w-full flex-col gap-3">
          <h2 className="text-3xl font-semibold">VEHIQL</h2>
          <div>
            <p className="text-base text-gray-200">
              Designed and Developed by{" "}
              <a
                href="https://shibhu.com"
                target="_blank"
                className="text-cyan-400"
              >
                Shivam Kumar
              </a>{" "}
              using Next.js
            </p>
            <p className="text-base text-gray-200">
              © copyright Shibhu.com 2025 - 2026. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex w-full justify-around gap-14">
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-lg font-semibold underline underline-offset-8">
              PAGE
            </h3>

            <Link href="/cars" className="hover:text-cyan-400">
              All Cars
            </Link>
            <Link href="/saved-cars" className="hover:text-cyan-400">
              Saved Cars
            </Link>
            <Link href="/reservations" className="hover:text-cyan-400">
              Reservations
            </Link>
          </div>
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-lg font-semibold underline underline-offset-8">
              SOCIAL
            </h3>
            {socialLink.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                className="hover:text-cyan-400"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
