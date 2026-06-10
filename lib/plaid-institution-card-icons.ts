export type PlaidInstitutionCardIcon = {
  src: string;
  alt: string;
};

const PLAID_INSTITUTION_CARD_ICON_BY_NORMALIZED_NAME: Record<
  string,
  PlaidInstitutionCardIcon
> = {
  academybank: {
    src: "/card-academybank.png",
    alt: "Academy Bank logo",
  },
  americanexpress: {
    src: "/card-americanexpress.png",
    alt: "American Express logo",
  },
  bankofamerica: {
    src: "/card-bankofamerica.png",
    alt: "Bank of America logo",
  },
  betterment: {
    src: "/card-betterment.png",
    alt: "Betterment logo",
  },
  capitalone: {
    src: "/card-capitalone.png",
    alt: "Capital One logo",
  },
  charlesschwab: {
    src: "/card-charlesschwab.png",
    alt: "Charles Schwab logo",
  },
  chase: {
    src: "/card-chase.png",
    alt: "Chase logo",
  },
  citi: {
    src: "/card-citibank.png",
    alt: "Citi logo",
  },
  citibank: {
    src: "/card-citibank.png",
    alt: "Citibank logo",
  },
  citizens: {
    src: "/card-citizens.png",
    alt: "Citizens logo",
  },
  citizensbank: {
    src: "/card-citizens.png",
    alt: "Citizens Bank logo",
  },
  discover: {
    src: "/card-discover.png",
    alt: "Discover logo",
  },
  frost: {
    src: "/card-frost.png",
    alt: "Frost logo",
  },
  frostbank: {
    src: "/card-frost.png",
    alt: "Frost Bank logo",
  },
  huntington: {
    src: "/card-hungington.png",
    alt: "Huntington logo",
  },
  huntingtonbank: {
    src: "/card-hungington.png",
    alt: "Huntington Bank logo",
  },
  navyfederal: {
    src: "/card-navyfederalcreditunion.png",
    alt: "Navy Federal logo",
  },
  navyfederalcreditunion: {
    src: "/card-navyfederalcreditunion.png",
    alt: "Navy Federal Credit Union logo",
  },
  pnc: {
    src: "/card-pnc.png",
    alt: "PNC logo",
  },
  pncbank: {
    src: "/card-pnc.png",
    alt: "PNC Bank logo",
  },
  regions: {
    src: "/card-regions.png",
    alt: "Regions logo",
  },
  regionsbank: {
    src: "/card-regions.png",
    alt: "Regions Bank logo",
  },
  td: {
    src: "/card-td.png",
    alt: "TD logo",
  },
  tdbank: {
    src: "/card-td.png",
    alt: "TD Bank logo",
  },
  usaa: {
    src: "/card-usaa.png",
    alt: "USAA logo",
  },
  usbank: {
    src: "/card-usbank.png",
    alt: "U.S. Bank logo",
  },
  wellsfargo: {
    src: "/card-wellsfargo.png",
    alt: "Wells Fargo logo",
  },
};

function normalizeInstitutionName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") ?? ""
  );
}

export function getPlaidInstitutionCardIcon(
  institutionName: string | null | undefined,
): PlaidInstitutionCardIcon | null {
  const trimmed = institutionName?.trim();
  if (!trimmed) return null;

  return (
    PLAID_INSTITUTION_CARD_ICON_BY_NORMALIZED_NAME[
      normalizeInstitutionName(trimmed)
    ] ?? null
  );
}
