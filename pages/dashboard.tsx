import React from "react";
import Identicon from "identicon.js";
import { useAccount } from "wagmi";
import Image from "next/image";
import { Post, User } from "@prisma/client";
import Link from "next/link";

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const [avatar, setAvatar] = React.useState<string>();
  const [user, setUser] = React.useState<User>();
  const [posts, setPosts] = React.useState<Post[]>();

  React.useEffect(() => {
    if (isConnected && address) {
      setAvatar(new Identicon(address, 128).toString());
      (async () => {
        const { user } = await fetch("/api/user", {
          method: "POST",
          body: JSON.stringify({
            address,
          }),
        }).then((res) => res.json());
        setUser(user);
      })();
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
              <div className="stat-title text-success-content">Followers</div>
              <div className="stat-value text-success-content">
                {user.followerCount}
              </div>
            </div>
          )}
        </div>
        <div className="stats bg-info text-info-content w-1/4">
          {user && (
            <div className="stat place-items-center text-success-content">
              <div className="stat-title text-success-content">Following</div>
              <div className="stat-value text-success-content">
                {user.followingCount}
              </div>
            </div>
          )}
        </div>
      </div>
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
              <span className="text-lg">You have not created any posts.</span>
              <Link href="/create" className="btn btn-accent btn-lg my-4">
                Create A Post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {posts &&
                posts.map((post) => {
                  return (
                    <Link href={`/post/${post.playbackId}`} key={post.postId}>
                      {post.thumbnailUrl && (
                        <div className="h-40 w-40 rounded-sm">
                          <img
                            src={post.thumbnailUrl}
                            alt=""
                            width="160"
                            height="160"
                          />
                        </div>
                      )}
                      {post.title}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      )}
      {!address && (
        <h1 className="text-center text-3xl italic text-error">
          Please connect your wallet
        </h1>
      )}
    </div>
  );
}
