import React from "react";
import Link from "next/link";

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
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
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
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow rounded-box w-52"
          >
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="m-5">
        <div>
          <div className="inline-block w-10">
            <input
              type="checkbox"
              className="checkbox"
              id="checkbox"
              onClick={toggleTheme}
            />
            <label htmlFor="checkbox" className="checkbox-label">
              <span>🌞</span>
              <span>🌚</span>
              <span className="ball"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
