import React from "react";
import { useAccount } from "wagmi";
import { signOut } from "next-auth/react";
import ConnectWallet from "@/components/wallet/connectWallet";
import Identicon from "identicon.js";
import Image from "next/image";
import Link from "next/link";

export default function NavUserProfile() {
  const { isConnected, address } = useAccount();
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
            <Link href="/dashboard" className="justify-between">
              Dashboard
            </Link>
          </li>
          <li>
            <button onClick={() => signOut()}>Logout</button>
          </li>
        </ul>
      </div>
    </div>
  );
}
