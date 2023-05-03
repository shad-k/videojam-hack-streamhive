import Browse from "@/components/browse";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold">
              Welcome to <span className="text-warning">StreamHive</span>
            </h1>
            <h5 className="font-light text-error">
              Create, Stream, Connect and Sell for Crypto
            </h5>
            <p className="py-6">
              A decentralized video e-commerce platform to buy the best products
              introduced to you by your favorite creators
            </p>
            <Link href="#browse" scroll={true} className="btn btn-accent">
              Start Browsing
            </Link>
          </div>
        </div>
      </div>
      <div id="browse" className="my-8">
        <Browse />
      </div>
    </>
  );
}
