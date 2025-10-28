export type Coin = {
  id: string;
  name: string;
  symbol: string;
  network: string;
  icon: string;
  address: string;
  current_price_naira: number;
  available_balance: number;
  decimals: number;
  status: string;
};

export type SellEstimate = {
  success: boolean;
  coin: {
    name: string;
    symbol: string;
    network: string;
    icon: string;
  };
  crypto_amount: string;
  current_rate: number;
  gross_amount: number;
  service_charge: number;
  net_amount: number;
  our_wallet_address: string;
  minimum_amount: number;
  note: string;
};

export type BuyCryptoResponse = {
  success: boolean;
  transaction_id: string;
  coin: {
    name: string;
    symbol: string;
    network: string;
    icon: string;
  };
  amount_naira: number;
  crypto_amount: number;
  exchange_rate: number;
  service_charge: number;
  total_deducted: number;
  user_wallet_address: string;
  status: string;
  message: string;
  estimated_delivery: string;
};

export type CoinSellAddress = {
  success: boolean;
  coin: {
    id: string;
    name: string;
    symbol: string;
    network: string;
    icon: string;
    our_wallet_address: string;
    current_rate_naira: number;
    service_charge: number;
    minimum_amount: number;
    decimals: number;
  };
};
