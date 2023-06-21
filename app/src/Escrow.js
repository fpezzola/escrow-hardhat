import { ethers } from "ethers";
import { useAccount, useContractWrite } from "wagmi";
import Button from "./components/Button";
import EscrowDef from "./artifacts/contracts/Escrow.sol/Escrow.json";
export const STATUS_COLOR = {
  0: "bg-yellow-500",
  1: "bg-green-500",
  2: "bg-red-500",
  3: "bg-blue-500",
};

const FieldList = ({ children }) => {
  return <ul className="space-y-2">{children}</ul>;
};

const Field = ({ title, children }) => {
  return (
    <li className="flex flex-col space-y-1/2">
      <div className="font-bold">{title}</div>
      <div>{children}</div>
    </li>
  );
};

const Status = ({ status }) => {
  if (status === 0) {
    return <span className="text-yellow-500">Pending approval</span>;
  }
  if (status === 1) {
    return <span className="text-green-500">Approved</span>;
  }
  if (status === 2) {
    return <span className="text-red-500">Expired</span>;
  }
  if (status === 3) {
    return <span className="text-blue-500">Depositor refunded</span>;
  }
};

export default function Escrow({
  depositor,
  contractAddress,
  arbiter,
  name,
  beneficiary,
  value,
  status,
  handleApprove,
  handleClaim,
}) {
  const account = useAccount();
  const { writeAsync: writeApprove } = useContractWrite({
    address: contractAddress,
    abi: EscrowDef.abi,
    functionName: "approve",
  });
  const { writeAsync: writeClaim } = useContractWrite({
    address: contractAddress,
    abi: EscrowDef.abi,
    functionName: "claim",
  });
  return (
    <div className="bg-gray-200 p-4 rounded-md">
      <FieldList>
        <Field title="Name">{name}</Field>
        <Field title="Depositor">{depositor}</Field>
        <Field title="Arbiter">{arbiter}</Field>
        <Field title="Beneficiary">{beneficiary}</Field>
        <Field title="Value (ETH)">
          {ethers.formatUnits(value).toString()}
        </Field>
        <Field title="Status">
          <Status status={status} />
        </Field>
        {status !== 1 && arbiter === account.address && (
          <Button
            type="button"
            className="text-xs bg-green-500"
            onClick={() => handleApprove(writeApprove)}
          >
            Approve
          </Button>
        )}
        {status === 2 && depositor === account.address && (
          <Button
            type="button"
            className="text-xs bg-red-500"
            onClick={() => handleClaim(writeClaim)}
          >
            Claim amount
          </Button>
        )}
      </FieldList>
    </div>
  );
}
