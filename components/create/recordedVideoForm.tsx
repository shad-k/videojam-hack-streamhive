import React, { ChangeEvent, FormEvent } from "react";
import { useAccount, useContract, useSigner } from "wagmi";
import axios from "axios";
import lighthouse from "@lighthouse-web3/sdk";

import StreamHiveAbi from "@/contracts/StreamHive.json";
import { ethers } from "ethers";
import { useRouter } from "next/router";

export default function RecordedVideoForm() {
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string>();
  const [videoUrl, setVideoUrl] = React.useState<string>();

  const { data: signer } = useSigner();

  const contract = useContract({
    address: process.env.NEXT_PUBLIC_CONTRACT as `0x${string}`,
    abi: StreamHiveAbi,
    signerOrProvider: signer,
  });

  const router = useRouter();

  const uploadVideoFile = async (e: ChangeEvent) => {
    const output = await lighthouse.upload(
      e,
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY as string
    );
    setVideoUrl(output.data.Hash);
  };

  const uploadFile = async (e: ChangeEvent) => {
    const output = await lighthouse.upload(
      e,
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY as string
    );
    setThumbnailUrl(
      `https://gateway.lighthouse.storage/ipfs/${output.data.Hash}`
    );
  };

  const createPost = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formEl = event.target as HTMLFormElement;

    const title = formEl.streamTitle.value;
    const description = formEl.description.value;

    if (!title) {
      alert("Please enter a stream title");
      return;
    }
    if (!videoUrl) {
      alert("Please select a video file");
      return;
    }

    try {
      const playbackId = videoUrl;

      if (!contract) {
        console.log("contract not present");
        return;
      }

      const filter = contract.filters.PostCreated(null, address);

      await contract.createPost(Date.now(), Date.now(), playbackId, false);
      contract.once(filter, async (postId) => {
        await axios.post("/api/posts/create", {
          postId: postId.toNumber(),
          title,
          description,
          playbackId,
          isLiveStream: false,
          creatorAddress: address,
          thumbnailUrl,
        });

        router.push("/dashboard");
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form className="my-8 w-full" onSubmit={createPost}>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Live stream title:</span>
        </label>
        <input
          type="text"
          name="streamTitle"
          placeholder="Hello world"
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Live stream description:</span>
        </label>
        <textarea
          name="description"
          className="textarea textarea-bordered h-24"
          placeholder="Description"
        ></textarea>
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Video file:</span>
        </label>

        <input
          type="file"
          name="videoFile"
          accept={"video/*"}
          className="file-input w-full"
          onChange={(e) => uploadVideoFile(e)}
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Thumbnail image:</span>
        </label>

        <input
          type="file"
          name="thumbnail"
          className="file-input w-full"
          onChange={(e) => uploadFile(e)}
        />
      </div>
      <button
        type="submit"
        className={`btn w-full btn-accent mt-4 mx-auto ${
          isSubmitting ? "loading" : ""
        }`}
        disabled={isSubmitting || !address}
      >
        {address ? "Create" : "Connect Wallet"}
      </button>
    </form>
  );
}
