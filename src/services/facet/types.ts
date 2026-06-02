export interface FacetResponse<T> {
  result: T;
}

export interface GetBalanceRequest {
  contract: string;
  account: string;
}

export interface GetPairsRequest {
  router: string;
  account: string;
}

export interface GetSimulateRequest {
  from: string;
  tx_payload: string;
}

export interface GetLastSwapPriceRequest {
  token_addresses: string[];
  eth_contract_address: string;
  router_address: string;
}

export interface PairsToken {
  address: string;
  name: string;
  symbol: string;
}

export interface PairsItem {
  token0: PairsToken;
  token1: PairsToken;
  lp_reserves: {
    token0: string;
    token1: string;
  };
  tvl_in_weth: string;
  user_balances: {
    lp: string;
    token0: string;
    token1: string;
  };
  user_allowances: {
    lp: string;
    token0: string;
    token1: string;
  };
}

export interface PairsData {
  [key: string]: PairsItem;
}

export interface ISwapToken {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  allowances: string;
  amount?: string;
  tvl_in_weth: string;
}

export interface ISwapTokenData {
  [key: string]: ISwapToken;
}

export interface SimulateResponse {
  transaction_receipt: {
    status: 'failure' | 'success';
    return_value: string[];
  };
}

export interface SwapLastPriceItem {
  token_address: string;
  last_swap_price: string;
}

export type GetBalanceResponse = Awaited<FacetResponse<string>>;
export type GetPairsResponse = Awaited<PairsData>;
export type GetSimulateResponse = Awaited<FacetResponse<SimulateResponse>>;
export type GetSwapLastPriceResponse = Awaited<FacetResponse<SwapLastPriceItem[]>>;
