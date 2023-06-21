import { ESCROW_MANAGER } from "./constants";
import EscrowsManager from "./artifacts/contracts/EscrowsManager.sol/EscrowsManager";
import { useContractRead } from "wagmi";
function useEscrows({ page, onlyScoped } = { page: 1, onlyScoped: true }) {
  return useContractRead({
    address: ESCROW_MANAGER,
    abi: EscrowsManager.abi,
    functionName: "listEscrows",
    args: [page, 10, onlyScoped],
  });
}

export default useEscrows;
