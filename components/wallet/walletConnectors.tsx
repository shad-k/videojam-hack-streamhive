import { useConnect } from "wagmi";

export default function WalletConnectors() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  return (
    <div className="flex flex-col space-y-2">
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
          className="btn"
        >
          {connector.name}
          {!connector.ready && " (unsupported)"}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  );
}
