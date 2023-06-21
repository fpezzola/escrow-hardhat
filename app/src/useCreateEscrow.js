import { useContractWrite } from "wagmi";
import EscrowsManager from "./artifacts/contracts/EscrowsManager.sol/EscrowsManager.json";
import { ESCROW_MANAGER } from "./constants";
import { useCallback } from "react";

function useCreateEscrow() {
  const { writeAsync, isLoading } = useContractWrite({
    address: ESCROW_MANAGER,
    abi: EscrowsManager.abi,
    functionName: "newEscrow",
  });
  const newEscrow = useCallback(
    (name, arbiter, beneficiary, value, expiresIn) => {
      return writeAsync({
        args: [name, arbiter, beneficiary, expiresIn],
        value,
      });
    },
    [writeAsync]
  );
  return { isLoading, newEscrow };
}

export default useCreateEscrow;
