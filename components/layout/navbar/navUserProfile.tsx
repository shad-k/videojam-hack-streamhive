import React from "react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import ConnectWallet from "@/components/wallet/connectWallet";
import SignIn from "@/components/wallet/signin";
import Identicon from "identicon.js";
import Image from "next/image";

export default function NavUserProfile() {
  const { isConnected, address } = useAccount();
  console.log(isConnected);
  const [avatar, setAvatar] = React.useState<string>();

  React.useEffect(() => {
    if (isConnected && address) {
      setAvatar(new Identicon(address, 40).toString());
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return <ConnectWallet />;
  }

  return (
    <div className="flex-none">
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          {avatar && (
            <div className="w-10 rounded-full">
              <Image
                width="40"
                height="40"
                src={`data:image/png;base64,${avatar}`}
                alt={avatar}
              />
            </div>
          )}
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
  );
}
