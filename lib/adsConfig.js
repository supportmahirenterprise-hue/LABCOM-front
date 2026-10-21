export const DEFAULT_ADS_CONFIG = {
  key: "ads_config",
  adsEnabled: true,
  publisherId: "ca-pub-9861920280316596",
  autoAdsEnabled: true,
  slots: {
    rightSkyscraper: {
      id: "rightSkyscraper",
      name: "Right Side Skyscraper",
      description: "Appears on wide desktop screens (1400px+) in the right gutter without shifting workspace content.",
      enabled: true,
      mode: "adsense", // "adsense" | "custom"
      slotId: "2412795862",
      customCode: "",
      minWidth: 1400,
    },
    bottomBanner: {
      id: "bottomBanner",
      name: "Bottom Results Banner",
      description: "Appears below tool actions and results with 24px policy safety spacing.",
      enabled: false,
      mode: "adsense",
      slotId: "",
      customCode: "",
      minWidth: 0,
    },
  },
  updatedAt: new Date().toISOString(),
};
