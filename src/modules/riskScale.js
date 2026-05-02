export const RISK_SCALE = {
  1: {
    label: "Safe",
    color: "#38b66b",
  },
  2: {
    label: "Caution",
    color: "#e7c94b",
  },
  3: {
    label: "Elevated Risk",
    color: "#e98a3a",
  },
  4: {
    label: "High Risk",
    color: "#d84e4b",
  },
  5: {
    label: "Do Not Travel",
    color: "#8f1f36",
  },
};

export function getRiskMeta(level) {
  return RISK_SCALE[level] || {
    label: "Unknown",
    color: "#87939a",
  };
}

export function hasSourceDisagreement(sources = []) {
  const normalizedLevels = new Set(
    sources
      .map((source) => source.normalized_level)
      .filter((level) => Number.isInteger(level)),
  );

  return normalizedLevels.size > 1;
}
