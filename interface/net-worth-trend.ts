export type NetWorthTrendItem = {
  periodStartDate: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
};

export type NetWorthTrendQueryRequest = {
  dateFrom?: string;
  dateTo?: string;
};

export type NetWorthTrendResponse = {
  items: readonly NetWorthTrendItem[];
};
