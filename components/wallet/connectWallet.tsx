import dynamic from "next/dynamic";

const WalletConnectors = dynamic(() => import("./walletConnectors"), {
  loading: () => null,
  ssr: false,
});

export default function ConnectWallet() {
  return (
    <>
      {/* The button to open modal */}

      {/* The button to open modal */}
      <label htmlFor="connect-wallet-modal" className="btn btn-accent">
        Connect Wallet
      </label>

      {/* Put this part before </body> tag */}
      <input
        type="checkbox"
        id="connect-wallet-modal"
        className="modal-toggle"
      />
      <label htmlFor="connect-wallet-modal" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <WalletConnectors />
        </label>
      </label>
    </>
  );
}
