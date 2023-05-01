import React, { ChangeEvent, FormEvent } from "react";
import {
  LocalizationProvider,
  MobileDateTimePicker,
  StaticDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAccount, useContract, useSigner } from "wagmi";
import axios from "axios";
import lighthouse from "@lighthouse-web3/sdk";

import StreamHiveAbi from "@/contracts/StreamHive.json";
import { ethers } from "ethers";
import { useRouter } from "next/router";

export default function LiveStreamForm() {
  const { address } = useAccount();
  const [startTime, setStartTime] = React.useState<number | null>();
  const [endTime, setEndTime] = React.useState<number | null>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string>();

  const { data: signer } = useSigner();

  const contract = useContract({
    address: process.env.NEXT_PUBLIC_CONTRACT as `0x${string}`,
    abi: StreamHiveAbi,
    signerOrProvider: signer,
  });

  const router = useRouter();

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
    if (!startTime) {
      alert("Please select a stream start time");
      return;
    }
    if (!endTime) {
      alert("Please select a stream end time");
      return;
    }

    try {
      const createStreamRes = await axios.post("/api/huddle01/create-room", {
        title,
        description,
        startTime,
        endTime,
        hostWallets: [address],
      });
      const playbackId = ethers.utils.formatBytes32String(
        createStreamRes.data.stream.data.roomId
      );

      if (!contract) {
        console.log("contract not present");
        return;
      }

      await contract.createPost(startTime, endTime, playbackId, true);
      contract.on("PostCreated", async (postId) => {
        await axios.post("/api/posts/create", {
          postId: postId.toNumber(),
          title,
          description,
          startTime,
          endTime,
          playbackId: createStreamRes.data.stream.data.roomId,
          isLiveStream: true,
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
          <span className="label-text">Thumbnail image:</span>
        </label>

        <input
          type="file"
          name="thumbnail"
          className="file-input w-full"
          onChange={(e) => uploadFile(e)}
        />
      </div>
      <div className="form-control w-full text-info-content">
        <label className="label">
          <span className="label-text">Start Date and Time</span>
        </label>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MobileDateTimePicker
            disablePast
            onChange={(val: Date | null) => setStartTime(val?.valueOf())}
          />
        </LocalizationProvider>
      </div>
      <div className="form-control w-full text-primary-content">
        <label className="label">
          <span className="label-text">End Date and Time</span>
        </label>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MobileDateTimePicker
            onChange={(val: Date | null) => setEndTime(val?.valueOf())}
            disablePast
          />
        </LocalizationProvider>
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
