import { evm_rpc } from "../../../declarations/evm_rpc";
import { RpcService } from "../../../declarations/evm_rpc/evm_rpc.did";

export async function getBalance(address: string): Promise<number> {
  const rpcService: RpcService = {
    EthSepolia: {
      Alchemy: null,
    },
  };

  // {\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"" # address # "\", \"latest\"],\"id\":1}";
  const payload = {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address, "latest"],
    id: 1,
  };

  const maxResponseBytes = 800;

  const balance = await evm_rpc.request(address);
  return balance;
}
