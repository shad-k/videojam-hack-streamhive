import React from "react";
import Link from "next/link";
import NavUserProfile from "./navUserProfile";

export default function Navbar() {
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

  return (
    <div className="navbar">
      <div className="flex-1">
        <Link href="/" className="text-2xl font-semibold text-accent">
          StreamHive
        </Link>
      </div>
      <NavUserProfile />
      <div className="m-5">
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
