import { useAccount } from "wagmi";
import Dashboard from "./Dashboard";
import Connect from "./Connect";

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const account = useAccount();
  return (
    <div className="flex flex-col space-y-4 container mx-auto w-full">
      <div className="w-full flex flex-row justify-center mt-4 items-center">
        <span className="font-bold text-4xl mb-4">Escrow DApp</span>
        {account && (
          <span className="ml-auto border boder-black p-4 rounded-md shadow-md">
            {account.address}
          </span>
        )}
      </div>
      <div className="flex flex-row items-center p-6 space-x-2 justify-center w-full">
        {!account.isConnected ? <Connect /> : <Dashboard />}
      </div>
    </div>
  );
}

export default App;
