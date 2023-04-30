import React, { FormEvent } from "react";
import { useAccount, useNetwork, useSignMessage } from "wagmi";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";

import ConnectWallet from "@/components/wallet/connectWallet";
import Link from "next/link";

export default function SellerLandingPage() {
  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const session = useSession();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = React.useState(false);
  const [doesUserExist, setUserExists] = React.useState(false);

  React.useEffect(() => {
    if (address) {
      (async () => {
        setIsLoading(true);
        // check if address already exists in db
        const user = await fetch("/api/user", {
          method: "POST",
          body: JSON.stringify({
            address,
          }),
        }).then((res) => res.json());
        if (user) {
          // if it does redirect to seller dashboard
          setUserExists(true);
        } else {
          // if it doesn't show onboarding form and get signature and create user
          setUserExists(false);
        }
        setIsLoading(false);
      })();
    }
  }, [address, session.status]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
      await signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        name: (event.target as HTMLFormElement).userName.value,
        email: (event.target as HTMLFormElement).email.value,
      });
    } catch (error) {
      window.alert(error);
    }
  };

  return (
    <div className="h-full w-full max-w-lg border border-slate-800 rounded p-6 flex flex-col items-center justify-center">
      <h1 className="font-bold text-3xl mb-10">Join as Seller</h1>
      {!address && <ConnectWallet />}
      {address && isLoading && <div>Loading...</div>}
      {address && !doesUserExist && !isLoading && (
        <form
          className="w-full space-y-4 flex flex-col items-center justify-center"
          onSubmit={handleLogin}
        >
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              name="address"
              readOnly
              value={address}
              className="input input-secondary input-bordered w-full cursor-not-allowed"
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              name="userName"
              placeholder="Enter your name"
              className="input input-secondary input-bordered w-full"
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email (optional)</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="input input-secondary input-bordered w-full"
            />
          </div>
          <button type="submit" className="btn">
            Sign In as Seller
          </button>
        </form>
      )}
      {address && doesUserExist && (
        <Link href="/sell/dashboard">Go To Dashboard</Link>
      )}
    </div>
  );
}
