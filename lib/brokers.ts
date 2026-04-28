export type Broker = {
  name: string;
  slug: string;
  domain: string;
  description: string;
  features: string[];
  affiliateUrl: string;
  commission: string;
  minDeposit: string;
  color: string;
};

/**
 * Broker data with placeholder affiliate links.
 * Replace `affiliateUrl` values with your real affiliate tracking URLs
 * once you've been approved by each program.
 */
export const BROKERS: Broker[] = [
  {
    name: "eToro",
    slug: "etoro",
    domain: "etoro.com",
    description:
      "Social trading platform with copy-trading features. Trade stocks, ETFs, and crypto commission-free.",
    features: ["Commission-free stocks", "Copy trading", "Fractional shares"],
    affiliateUrl: "https://etoro.com/?ref=STOCKOMETER_PLACEHOLDER",
    commission: "$0",
    minDeposit: "$50",
    color: "#00c853",
  },
  {
    name: "Robinhood",
    slug: "robinhood",
    domain: "robinhood.com",
    description:
      "Commission-free investing with a clean, beginner-friendly interface. Stocks, options, and crypto.",
    features: ["$0 commissions", "Fractional shares", "Cash management"],
    affiliateUrl: "https://robinhood.com/?ref=STOCKOMETER_PLACEHOLDER",
    commission: "$0",
    minDeposit: "$0",
    color: "#00c805",
  },
  {
    name: "Interactive Brokers",
    slug: "ibkr",
    domain: "interactivebrokers.com",
    description:
      "Professional-grade trading platform with access to 150+ markets in 33 countries.",
    features: ["Low margin rates", "150+ markets", "Advanced tools"],
    affiliateUrl:
      "https://interactivebrokers.com/?ref=STOCKOMETER_PLACEHOLDER",
    commission: "$0 (IBKR Lite)",
    minDeposit: "$0",
    color: "#d81b3e",
  },
  {
    name: "Webull",
    slug: "webull",
    domain: "webull.com",
    description:
      "Advanced charting and analysis tools with commission-free trading for stocks, options, and ETFs.",
    features: ["$0 commissions", "Extended hours", "Paper trading"],
    affiliateUrl: "https://webull.com/?ref=STOCKOMETER_PLACEHOLDER",
    commission: "$0",
    minDeposit: "$0",
    color: "#f05a28",
  },
  {
    name: "Charles Schwab",
    slug: "schwab",
    domain: "schwab.com",
    description:
      "Full-service broker with comprehensive research, banking, and wealth management services.",
    features: ["$0 online trades", "Research & tools", "24/7 support"],
    affiliateUrl: "https://schwab.com/?ref=STOCKOMETER_PLACEHOLDER",
    commission: "$0",
    minDeposit: "$0",
    color: "#00a0df",
  },
  {
    name: "Fidelity",
    slug: "fidelity",
    domain: "fidelity.com",
    description:
      "Top-rated broker with excellent research, no minimums, and fractional share trading.",
    features: ["$0 commissions", "No minimums", "Fractional shares"],
    affiliateUrl: "https://fidelity.com/?ref=STOCKOMETER_PLACEHOLDER",
    commission: "$0",
    minDeposit: "$0",
    color: "#4a8c50",
  },
];
