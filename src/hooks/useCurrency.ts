interface CurrencyInfo {
  code: "GHS";
  symbol: string;
  isGhana: true;
  convert: (ghs: number) => number;
}

export function useCurrency(): CurrencyInfo {
  return {
    code: "GHS",
    symbol: "GH₵",
    isGhana: true,
    convert: (ghs: number) => ghs,
  };
}

