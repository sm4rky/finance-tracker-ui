export type PlaidInstitutionIcon = {
  src: string;
  alt: string;
};

const PLAID_INSTITUTION_ICON_BY_NORMALIZED_NAME: Record<
  string,
  PlaidInstitutionIcon
> = {
  americanexpress: {
    src: "/plaid-americanexpress.png",
    alt: "American Express logo",
  },
  bankofamerica: {
    src: "/plaid-bankofamerica.png",
    alt: "Bank of America logo",
  },
  betterment: {
    src: "/plaid-betterment.png",
    alt: "Betterment logo",
  },
  capitalone: {
    src: "/plaid-capitalone.png",
    alt: "Capital One logo",
  },
  charlesschwab: {
    src: "/plaid-charlesschwab.png",
    alt: "Charles Schwab logo",
  },
  chase: {
    src: "/plaid-chase.png",
    alt: "Chase logo",
  },
  citi: {
    src: "/plaid-citibank.png",
    alt: "Citi logo",
  },
  citibank: {
    src: "/plaid-citibank.png",
    alt: "Citibank logo",
  },
  citizens: {
    src: "/plaid-citizens.png",
    alt: "Citizens logo",
  },
  citizensbank: {
    src: "/plaid-citizens.png",
    alt: "Citizens Bank logo",
  },
  frost: {
    src: "/plaid-frost.png",
    alt: "Frost logo",
  },
  frostbank: {
    src: "/plaid-frost.png",
    alt: "Frost Bank logo",
  },
  huntington: {
    src: "/plaid-huntington.png",
    alt: "Huntington logo",
  },
  huntingtonbank: {
    src: "/plaid-huntington.png",
    alt: "Huntington Bank logo",
  },
  navyfederal: {
    src: "/plaid-navyfederalcreditunion.png",
    alt: "Navy Federal logo",
  },
  navyfederalcreditunion: {
    src: "/plaid-navyfederalcreditunion.png",
    alt: "Navy Federal Credit Union logo",
  },
  pnc: {
    src: "/plaid-pnc.png",
    alt: "PNC logo",
  },
  pncbank: {
    src: "/plaid-pnc.png",
    alt: "PNC Bank logo",
  },
  regions: {
    src: "/plaid-regions.png",
    alt: "Regions logo",
  },
  regionsbank: {
    src: "/plaid-regions.png",
    alt: "Regions Bank logo",
  },
  td: {
    src: "/plaid-td.png",
    alt: "TD logo",
  },
  tdbank: {
    src: "/plaid-td.png",
    alt: "TD Bank logo",
  },
  usaa: {
    src: "/plaid-usaa.png",
    alt: "USAA logo",
  },
  usbank: {
    src: "/plaid-usbank.png",
    alt: "U.S. Bank logo",
  },
  wellsfargo: {
    src: "/plaid-wellsfargo.png",
    alt: "Wells Fargo logo",
  },
};

function normalizeInstitutionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

export function getPlaidInstitutionIcon(
  institutionName: string | null | undefined,
): PlaidInstitutionIcon | null {
  const trimmed = institutionName?.trim();
  if (!trimmed) return null;

  return (
    PLAID_INSTITUTION_ICON_BY_NORMALIZED_NAME[
      normalizeInstitutionName(trimmed)
    ] ?? null
  );
}
