import Card from "@/components/post/card";
import { Post } from "@prisma/client";
import axios from "axios";
import React from "react";

export default function Browse() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  React.useEffect(() => {
    (async () => {
      const res = await axios.get("/api/posts");
      setPosts(res.data.posts);
    })();
  }, []);
  return (
    <div className="w-full">
      <h1 className="my-8 text-3xl">Latest Posts</h1>
      <div className="grid grid-cols-3 gap-3">
        {posts.map((post) => {
          return <Card key={post.postId} post={post} />;
        })}
      </div>
    </div>
  );
}
