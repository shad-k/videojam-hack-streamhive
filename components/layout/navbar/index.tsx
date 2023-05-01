import React from "react";
import Link from "next/link";
import NavUserProfile from "./navUserProfile";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";

export default function Navbar() {
  const session = useSession();
  const { address } = useAccount();
  const [userSignedIn, setUserSignedIn] = React.useState(false);

  const toggleTheme = () => {
    const theme = localStorage.getItem("theme") ?? "night";

    if (theme === "night") {
      localStorage.setItem("theme", "cupcake");
      document.documentElement.setAttribute("data-theme", "cupcake");
    } else {
      localStorage.setItem("theme", "night");
      document.documentElement.setAttribute("data-theme", "night");
    }
  };

  React.useEffect(() => {
    if (
      localStorage.theme === "night" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.setAttribute("data-theme", "night");
      localStorage.setItem("theme", "night");
    } else {
      document.documentElement.setAttribute("data-theme", "cupcake");
      localStorage.setItem("theme", "cupcake");
    }
  }, []);

  React.useEffect(() => {
    if (address) {
      (async () => {
        // check if address already exists in db
        const user = await fetch("/api/user", {
          method: "POST",
          body: JSON.stringify({
            address,
          }),
        })
          .then((res) => res.json())
          .catch((error) => console.log(error));
        if (user) {
          setUserSignedIn(true);
        } else {
          setUserSignedIn(false);
        }
      })();
    }
  }, [address, session.status]);

  return (
    <div className="navbar">
      <div className="flex-1">
        <Link href="/" className="text-2xl font-semibold text-accent">
          StreamHive
        </Link>
      </div>
      {address && !userSignedIn && (
        <Link href="/sell" className="btn btn-primary mx-4">
          Join as Seller
        </Link>
      )}
      <NavUserProfile />
      <div className="mx-4">
        <div className="inline-block w-10">
          <input
            type="checkbox"
            className="checkbox"
            id="checkbox"
            onClick={toggleTheme}
          />
          <label
            htmlFor="checkbox"
            className="checkbox-label border border-secondary"
          >
            <span>🌞</span>
            <span>🌚</span>
            <span className="ball"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
