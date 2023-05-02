import LiveStreamForm from "@/components/create/liveStreamForm";
import RecordedVideoForm from "@/components/create/recordedVideoForm";
import React from "react";

export default function Create() {
  const [isLiveStream, setIsLiveStream] = React.useState<boolean>(true);
  return (
    <div>
      <h1 className="text-3xl font-bold">Create a new Post</h1>

      <div className="tabs tabs-boxed justify-center mt-10 border border-slate-800">
        <a
          className={`tab ${isLiveStream ? "tab-active" : ""}`}
          onClick={() => setIsLiveStream(true)}
        >
          Create Live Stream
        </a>
        <a
          className={`tab ${!isLiveStream ? "tab-active" : ""}`}
          onClick={() => setIsLiveStream(false)}
        >
          Upload a Video
        </a>
      </div>
      {isLiveStream ? (
        <LiveStreamForm />
      ) : (
        <div>
          <RecordedVideoForm />
        </div>
      )}
    </div>
  );
}
