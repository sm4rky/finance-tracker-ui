import type { LinkedBankResponse } from "@/interface/plaid";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import { getAllAccountIds } from "@/lib/linked-bank-accounts";
import { PAYMENT_CHANNELS } from "@/lib/payment-channel";
import { PFC_PRIMARY } from "@/lib/pfc-primary";
import { getDateRangeForPreset } from "@/lib/transactions-date-range";

export type TransactionsFilterState = {
  accountIds?: string[];
  includeUnlinkedTransactions?: boolean;
  pfcPrimaryList?: string[];
  customCategorySetId?: string;
  customCategoryIds?: string[];
  paymentChannels?: string[];
  pending?: boolean;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  amountFlow?: string | null;
};

export function areTransactionsFiltersEqual(
  a: TransactionsFilterState,
  b: TransactionsFilterState,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function getDefaultTransactionsFilter(
  banks: LinkedBankResponse[] | undefined,
  categorySet: ProfileCustomCategorySetResponse | null = null,
): TransactionsFilterState {
  const { dateFrom, dateTo } = getDateRangeForPreset("this_month");
  const customCategoryIds = categorySet
    ? categorySet.categories.map((category) => category.id)
    : undefined;

  return {
    accountIds: getAllAccountIds(banks),
    includeUnlinkedTransactions: true,
    pfcPrimaryList: categorySet ? undefined : [...PFC_PRIMARY],
    customCategorySetId: categorySet?.id,
    customCategoryIds,
    paymentChannels: [...PAYMENT_CHANNELS],
    pending: undefined,
    dateFrom,
    dateTo,
    amountMin: undefined,
    amountMax: undefined,
    amountFlow: null,
  };
}

export function sanitizeTransactionsFilter(
  filter: TransactionsFilterState,
  banks: LinkedBankResponse[] | undefined,
  categorySet: ProfileCustomCategorySetResponse | null = null,
): TransactionsFilterState {
  const validAccountIds = new Set(getAllAccountIds(banks));
  const categoryIds = categorySet
    ? categorySet.categories.map((category) => category.id)
    : [...PFC_PRIMARY];
  const validCategoryIds = new Set(categoryIds);
  const validChannelIds = new Set<string>(PAYMENT_CHANNELS);
  const resolvedSetId = categorySet?.id ?? null;
  const filterSetId = filter.customCategorySetId ?? null;
  const categorySetChanged = resolvedSetId !== filterSetId;
  const customCategorySetId = categorySet?.id;

  const accountIds =
    validAccountIds.size === 0 && filter.accountIds?.length
      ? filter.accountIds
      : filter.accountIds === undefined
        ? [...validAccountIds]
        : filter.accountIds.filter((id) => validAccountIds.has(id));

  const pfcPrimaryList = customCategorySetId
    ? undefined
    : categorySetChanged || filter.pfcPrimaryList === undefined
      ? categoryIds
      : filter.pfcPrimaryList.filter((code) => validCategoryIds.has(code));
  const customCategoryIds = customCategorySetId
    ? categorySetChanged || filter.customCategoryIds === undefined
      ? categoryIds
      : filter.customCategoryIds.filter((id) => validCategoryIds.has(id))
    : undefined;

  const paymentChannels =
    filter.paymentChannels === undefined
      ? [...PAYMENT_CHANNELS]
      : filter.paymentChannels.filter((channel) =>
          validChannelIds.has(channel),
        );

  return {
    ...filter,
    accountIds,
    includeUnlinkedTransactions: filter.includeUnlinkedTransactions ?? true,
    pfcPrimaryList,
    customCategorySetId: customCategorySetId ?? undefined,
    customCategoryIds,
    paymentChannels,
  };
}
