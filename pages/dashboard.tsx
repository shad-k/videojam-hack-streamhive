import React, { FormEvent } from "react";
import Identicon from "identicon.js";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import Image from "next/image";
import { Post, User } from "@prisma/client";
import Link from "next/link";
import Card from "@/components/post/card";
import axios from "axios";
import StreamHiveAbi from "@/contracts/StreamHive.json";
import ERC20Abi from "@/contracts/ERC20.json";
import { BigNumber, BigNumberish, ethers } from "ethers";

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const [avatar, setAvatar] = React.useState<string>();
  const [user, setUser] = React.useState<User>();
  const [posts, setPosts] = React.useState<Post[]>();
  const [stats, setStats] = React.useState<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
  }>();
  const [tokenAddress, setTokenAddress] = React.useState<string>();
  const [totalSupply, setTotalSupply] = React.useState<BigNumber>(
    BigNumber.from(0)
  );
  const [creatingToken, setCreatingToken] = React.useState<boolean>(false);

  const [showPosts, setShowPosts] = React.useState<boolean>(true);

  const contract = useContract({
    address: process.env.NEXT_PUBLIC_CONTRACT as `0x${string}`,
    abi: StreamHiveAbi,
    signerOrProvider: signer,
  });
  const erc20Contract = useContract({
    address: tokenAddress,
    abi: ERC20Abi,
    signerOrProvider: signer,
  });

  React.useEffect(() => {
    if (isConnected && address) {
      setAvatar(new Identicon(address, 128).toString());
    }
  }, [isConnected, address]);

  React.useEffect(() => {
    if (isConnected && address) {
      setAvatar(new Identicon(address, 128).toString());
      (async () => {
        try {
          const { user } = await fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({
              address,
            }),
          }).then((res) => res.json());
          setUser(user);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [isConnected, address]);

  React.useEffect(() => {
    if (isConnected && address) {
      (async () => {
        try {
          const { posts } = await fetch("/api/posts", {
            method: "POST",
            body: JSON.stringify({
              address,
            }),
          }).then((res) => res.json());
          setPosts(posts);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [isConnected, address]);

  React.useEffect(() => {
    if (isConnected && address) {
      (async () => {
        try {
          const {
            data: { postsCount, followersCount, followingCount },
          } = await axios.post("/api/user/stats", {
            address,
          });
          setStats({
            postsCount,
            followersCount,
            followingCount,
          });
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [address, isConnected]);

  React.useEffect(() => {
    if (contract && address) {
      (async () => {
        const tokenAddress = await contract.creatorTokens(address);
        if (tokenAddress !== ethers.constants.AddressZero) {
          setTokenAddress(tokenAddress);
        }
      })();
    }
  }, [contract, address]);

  React.useEffect(() => {
    if (tokenAddress && erc20Contract) {
      (async () => {
        try {
          const totalSupply = await erc20Contract.totalSupply();
          setTotalSupply(totalSupply);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [erc20Contract, tokenAddress]);

  const launchToken = async (event: FormEvent) => {
    event.preventDefault();

    setCreatingToken(true);

    const formEl = event.target as HTMLFormElement;
    const name = formEl.tokenName.value;
    const symbol = formEl.tokenSymbol.value;
    const totalSupply = formEl.tokenTotalSupply.value;

    if (!name || !symbol || !totalSupply) {
      alert("Please enter all the values");
      return;
    }

    if (!contract) {
      alert("Something went wrong");
      return;
    }

    await contract.launchToken(name, symbol, totalSupply);

    const filter = contract.filters.TokenCreated(null, address);
    contract.once(filter, (tokenAddress) => {
      setTokenAddress(tokenAddress);
      setCreatingToken(false);
    });
  };

  const sendToken = async (event: FormEvent) => {
    event.preventDefault();

    const formEl = event.target as HTMLFormElement;
    const amount = formEl.amount.value;
    const addresses = formEl.addresses.value;

    if (addresses.length === 0) {
      alert("Please enter at least one address");
      return;
    }

    if (!amount) {
      alert("Please enter amount");
      return;
    }

    if (!erc20Contract) {
      alert("Something went wrong");
      return;
    }
    const addressesArr = addresses.split(",");
    const parsedAmount = ethers.utils.parseEther(amount);
    addressesArr.forEach(async (address: string) => {
      await erc20Contract.transfer(address.trim(), parsedAmount);
    });
  };

  if (isConnected && !user) {
    return (
      <div>
        <h1 className="text-xl font-bold text-center mb-2">
          Please join as seller
        </h1>
        <Link href="/sell" className="btn btn-info btn-lg">
          Join as Seller
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px]">
      <div className="flex justify-center flex-col w-full">
        {avatar && (
          <div className="w-32 rounded-full overflow-hidden">
            <Image
              width="128"
              height="128"
              src={`data:image/png;base64,${avatar}`}
              alt={avatar}
            />
          </div>
        )}
        {user && (
          <h2 className="mt-4 mb-1 font-semibold text-xl">{user.name}</h2>
        )}
        {user && <h4 className="text-sm">{user.address}</h4>}
      </div>
      <div className="flex items-center justify-around my-8 min-h-[100px]">
        <div className="stats bg-success text-success-content w-1/4">
          {user && (
            <div className="stat place-items-center text-success-content">
              <div className="stat-title text-success-content">Posts</div>
              <div className="stat-value text-success-content">
                {stats?.postsCount}
              </div>
            </div>
          )}
        </div>
        <div className="stats bg-info text-info-content w-1/4">
          {user && (
            <div className="stat place-items-center text-success-content">
              <div className="stat-title text-success-content">Followers</div>
              <div className="stat-value text-success-content">
                {stats?.followersCount}
              </div>
            </div>
          )}
        </div>
        <div className="stats bg-error text-info-content w-1/4">
          {user && (
            <div className="stat place-items-center text-success-content">
              <div className="stat-title text-success-content">Following</div>
              <div className="stat-value text-success-content">
                {stats?.followingCount}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border border-slate-800 rounded-lg mt-8 pb-8">
        {!address ? (
          <h1 className="text-center text-3xl italic text-error">
            Please connect your wallet
          </h1>
        ) : (
          <>
            <div className="tabs tabs-boxed w-full mx-auto justify-center">
              <button
                className={`tab w-1/2 ${showPosts ? "tab-active" : ""}`}
                onClick={() => setShowPosts(true)}
              >
                Posts
              </button>
              <button
                className={`tab w-1/2 ${!showPosts ? "tab-active" : ""}`}
                onClick={() => setShowPosts(false)}
              >
                Token
              </button>
            </div>
            {showPosts ? (
              <div className="px-8">
                {address && (
                  <div className="my-8 flex flex-col">
                    <div className="flex items-center justify-between my-4">
                      <h2 className="text-2xl font-semibold">Your Posts</h2>
                      <Link href="/create" className="btn btn-accent btn-sm">
                        + Create New Post
                      </Link>
                    </div>
                    {posts && posts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center my-20">
                        <span className="text-lg">
                          You have not created any posts.
                        </span>
                        <Link
                          href="/create"
                          className="btn btn-accent btn-lg my-4"
                        >
                          Create A Post
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {posts &&
                          posts.map((post) => {
                            return <Card key={post.postId} post={post} />;
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8">
                {tokenAddress ? (
                  <div className="flex flex-col space-y-4">
                    <div>Token Address: {tokenAddress}</div>
                    <div>
                      Total Supply:{" "}
                      {ethers.utils.formatEther(totalSupply as BigNumberish)}
                    </div>
                    <form onSubmit={sendToken} className="!mt-8">
                      <h4 className="mb-1 text-xl">Send Token</h4>
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Amount:</span>
                        </label>
                        <input
                          type="number"
                          name="amount"
                          placeholder="1.0"
                          className="input input-bordered w-full"
                        />
                      </div>
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">
                            Enter addresses (comma separated):
                          </span>
                        </label>
                        <textarea
                          name="addresses"
                          className="textarea textarea-bordered h-24"
                          placeholder="Addresses"
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-accent my-6">
                        Send Tokens
                      </button>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={launchToken} className="w-full">
                    <h4 className="text-xl text-center w-full">Create Token</h4>
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Token Name:</span>
                      </label>
                      <input
                        type="text"
                        name="tokenName"
                        placeholder="MyToken"
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Token Symbol:</span>
                      </label>
                      <input
                        type="text"
                        name="tokenSymbol"
                        placeholder="MTK"
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Total Supply:</span>
                      </label>
                      <input
                        type="number"
                        name="tokenTotalSupply"
                        placeholder="1000"
                        className="input input-bordered w-full"
                      />
                    </div>
                    <button
                      type="submit"
                      className={`btn btn-accent ${
                        creatingToken ? "loading" : ""
                      }`}
                    >
                      Create Token
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
