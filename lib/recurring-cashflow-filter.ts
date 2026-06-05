import type { LinkedBankResponse } from "@/interface/plaid";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import {
  type ProfileRecurringCashflowCalendarOccurrenceResponse,
  type ProfileRecurringCashflowResponse,
} from "@/interface/profile-recurring-cashflow";
import { getAllAccountIds } from "@/lib/linked-bank-accounts";
import { PFC_PRIMARY, UNCATEGORIZED_PFC_PRIMARY } from "@/lib/pfc-primary";
import { RECURRING_CASHFLOW_STATUSES } from "@/lib/recurring-cashflow-status";

export type RecurringCashflowsFilterState = {
  accountIds?: string[];
  includeUnlinked?: boolean;
  pfcPrimaryList?: string[];
  customCategorySetId?: string;
  customCategoryIds?: string[];
  statusList?: string[];
};

export function areRecurringCashflowsFiltersEqual(
  a: RecurringCashflowsFilterState,
  b: RecurringCashflowsFilterState,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function getDefaultRecurringCashflowsFilter(
  banks: LinkedBankResponse[] | undefined,
  categorySet: ProfileCustomCategorySetResponse | null = null,
): RecurringCashflowsFilterState {
  return {
    accountIds: getAllAccountIds(banks),
    includeUnlinked: true,
    pfcPrimaryList: categorySet ? undefined : [...PFC_PRIMARY],
    customCategorySetId: categorySet?.id,
    customCategoryIds: categorySet
      ? categorySet.categories.map((category) => category.id)
      : undefined,
    statusList: [...RECURRING_CASHFLOW_STATUSES],
  };
}

export function sanitizeRecurringCashflowsFilter(
  filter: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
  categorySet: ProfileCustomCategorySetResponse | null = null,
): RecurringCashflowsFilterState {
  const validAccountIds = new Set(getAllAccountIds(banks));
  const categoryIds = categorySet
    ? categorySet.categories.map((category) => category.id)
    : [...PFC_PRIMARY];
  const validCategoryIds = new Set(categoryIds);
  const validStatuses = new Set<string>(RECURRING_CASHFLOW_STATUSES);
  const resolvedSetId = categorySet?.id ?? null;
  const filterSetId = filter.customCategorySetId ?? null;
  const categorySetChanged = resolvedSetId !== filterSetId;
  const customCategorySetId = categorySet?.id;

  const accountIds =
    validAccountIds.size === 0 && filter.accountIds?.length
      ? filter.accountIds
      : filter.accountIds === undefined
        ? [...validAccountIds]
        : filter.accountIds.filter((accountId) =>
            validAccountIds.has(accountId),
          );

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

  const statusList =
    filter.statusList === undefined
      ? [...RECURRING_CASHFLOW_STATUSES]
      : filter.statusList.filter((status) => validStatuses.has(status));

  return {
    ...filter,
    accountIds,
    includeUnlinked: filter.includeUnlinked ?? true,
    pfcPrimaryList,
    customCategorySetId: customCategorySetId ?? undefined,
    customCategoryIds,
    statusList,
  };
}

export function filterRecurringCashflows(
  rows: ProfileRecurringCashflowResponse[],
  filterState: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
  categorySet: ProfileCustomCategorySetResponse | null = null,
): ProfileRecurringCashflowResponse[] {
  return rows.filter((row) =>
    matchesRecurringCashflowFilter(row, filterState, banks, categorySet),
  );
}

export function filterRecurringCalendarOccurrences(
  occurrences: ProfileRecurringCashflowCalendarOccurrenceResponse[],
  filterState: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
  categorySet: ProfileCustomCategorySetResponse | null = null,
): ProfileRecurringCashflowCalendarOccurrenceResponse[] {
  return occurrences.filter((occurrence) =>
    matchesRecurringCashflowFilter(occurrence, filterState, banks, categorySet),
  );
}

type ProfileRecurringCashflowItem =
  | ProfileRecurringCashflowResponse
  | ProfileRecurringCashflowCalendarOccurrenceResponse;

function matchesRecurringCashflowFilter(
  item: ProfileRecurringCashflowItem,
  filterState: RecurringCashflowsFilterState,
  banks: LinkedBankResponse[] | undefined,
  categorySet: ProfileCustomCategorySetResponse | null,
): boolean {
  const accountIds = filterState.accountIds ?? getAllAccountIds(banks);
  const includeUnlinked = filterState.includeUnlinked ?? true;
  const statusList = filterState.statusList ?? [...RECURRING_CASHFLOW_STATUSES];
  const linkedBankAccountId = item.linkedBankAccount?.id.trim() || null;

  if (linkedBankAccountId == null) {
    if (!includeUnlinked) return false;
  } else if (!accountIds.includes(linkedBankAccountId)) {
    return false;
  }

  if (!matchesCategoryFilter(item, filterState, categorySet)) {
    return false;
  }

  const status = item.status.trim().toLowerCase();
  if (!statusList.includes(status)) return false;

  return true;
}

function matchesCategoryFilter(
  item: ProfileRecurringCashflowItem,
  filterState: RecurringCashflowsFilterState,
  categorySet: ProfileCustomCategorySetResponse | null,
): boolean {
  const pfcPrimary = item.pfcPrimary?.trim() || UNCATEGORIZED_PFC_PRIMARY;

  if (!categorySet) {
    const pfcPrimaryList = filterState.pfcPrimaryList ?? [...PFC_PRIMARY];
    return pfcPrimaryList.includes(pfcPrimary);
  }

  const customCategoryIds =
    filterState.customCategoryIds ??
    categorySet.categories.map((category) => category.id);
  const selectedCategoryIdSet = new Set(customCategoryIds);

  return categorySet.categories.some(
    (category) =>
      selectedCategoryIdSet.has(category.id) &&
      category.pfcPrimaries.some(
        (mapping) => mapping.pfcPrimaryCode === pfcPrimary,
      ),
  );
}
