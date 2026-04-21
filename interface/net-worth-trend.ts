export type NetWorthTrendItem = {
  periodStartDate: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
};

export type NetWorthTrendResponse = {
  items: readonly NetWorthTrendItem[];
};

export type NetWorthTrendQueryRequest = {
  dateFrom?: string;
  dateTo?: string;
};
