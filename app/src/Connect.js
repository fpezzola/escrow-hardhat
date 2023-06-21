import { useConnect } from "wagmi";
import Button from "./components/Button";
import Card from "./components/Card";

const Connect = () => {
  const { connectors, isLoading, pendingConnector, error, connect } =
    useConnect();
  return (
    <Card>
      <div className="flex flex-col space-y-2 justify-center">
        <span>You need to connect your wallet first...</span>
        {connectors.map((connector) => (
          <Button
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
            className="w-32"
          >
            {connector.name}
            {!connector.ready && " (unsupported)"}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              " (connecting)"}
          </Button>
        ))}

        {error && <div>{error.message}</div>}
      </div>
    </Card>
  );
};

export default Connect;
