/**
 * Product Options / Variants
 *
 * Canonical shape:
 *   options: [
 *     {
 *       name: "Storage",
 *       required: true,
 *       values: [
 *         { label: "256GB", priceDelta: 0 },
 *         { label: "512GB", priceDelta: 20000 }
 *       ]
 *     }
 *   ]
 *
 * Legacy products may still store values as plain strings. Everything is
 * normalised on read, so no migration is required.
 */

const clean = (value) => String(value ?? '').trim();

export const normalizeOptionValue = (value) => {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string' || typeof value === 'number') {
    const label = clean(value);
    return label ? { label, priceDelta: 0 } : null;
  }

  const label = clean(value.label ?? value.value ?? value.name ?? value.title);
  if (!label) return null;

  const rawDelta =
    value.priceDelta ??
    value.price_delta ??
    value.extraPrice ??
    value.extra_price ??
    0;
  const numericDelta = Number(rawDelta);

  return {
    label,
    priceDelta: Number.isFinite(numericDelta) ? Math.round(numericDelta) : 0,
  };
};

export const getOptionValueLabel = (value) =>
  normalizeOptionValue(value)?.label || '';

export const getOptionValuePriceDelta = (value) =>
  normalizeOptionValue(value)?.priceDelta || 0;

/**
 * Trim and discard empty option groups / values. Duplicate labels are merged,
 * preferring the first non-zero price delta.
 */
export const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];

  return options
    .map((group) => {
      const values = [];
      const seen = new Set();

      (Array.isArray(group?.values) ? group.values : []).forEach((raw) => {
        const value = normalizeOptionValue(raw);
        if (!value) return;

        const key = value.label.toLowerCase();
        if (seen.has(key)) {
          const existing = values.find((entry) => entry.label.toLowerCase() === key);
          if (existing && !existing.priceDelta && value.priceDelta) {
            existing.priceDelta = value.priceDelta;
          }
          return;
        }

        seen.add(key);
        values.push(value);
      });

      return {
        name: clean(group?.name),
        values,
        required: group?.required !== false,
      };
    })
    .filter((group) => group.name && group.values.length > 0);
};

/**
 * Merge option groups into one deduplicated list. Preserves price deltas and
 * sums usage counts when present.
 */
export const mergeOptionGroups = (groups) => {
  const byName = new Map();

  (groups || []).forEach((raw) => {
    const name = clean(raw?.name);
    if (!name) return;

    const key = name.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, {
        name,
        values: [],
        required: raw?.required !== false,
        usage: 0,
      });
    }

    const entry = byName.get(key);
    if (raw?.required === true) entry.required = true;
    if (Number.isFinite(raw?.usage)) entry.usage += raw.usage;

    (Array.isArray(raw?.values) ? raw.values : []).forEach((rawValue) => {
      const value = normalizeOptionValue(rawValue);
      if (!value) return;

      const existing = entry.values.find(
        (item) => item.label.toLowerCase() === value.label.toLowerCase()
      );

      if (existing) {
        if (!existing.priceDelta && value.priceDelta) {
          existing.priceDelta = value.priceDelta;
        }
      } else {
        entry.values.push(value);
      }
    });
  });

  return Array.from(byName.values())
    .filter((group) => group.values.length > 0)
    .map(({ name, values, required, usage }) => ({
      name,
      values,
      required,
      ...(usage ? { usage } : {}),
    }));
};

/**
 * Aggregate option groups used by a list of products.
 */
export const collectOptionGroups = (items) => {
  const groups = (items || []).flatMap((item) => normalizeOptions(item?.options));
  return mergeOptionGroups(groups).map((group) => {
    const usage = (items || []).filter((item) =>
      normalizeOptions(item?.options).some(
        (entry) => entry.name.toLowerCase() === group.name.toLowerCase()
      )
    ).length;
    return { ...group, usage };
  });
};

/**
 * Ensure the cheapest value in each group is the base (0 delta).
 * Useful for AI-generated option groups.
 */
export const balanceOptionDeltas = (options) =>
  normalizeOptions(options).map((group) => {
    const cheapest = Math.min(...group.values.map((value) => value.priceDelta));
    if (cheapest === 0) return group;
    return {
      ...group,
      values: group.values.map((value) => ({
        ...value,
        priceDelta: value.priceDelta - cheapest,
      })),
    };
  });

/**
 * Sum the extra price for the currently selected option values.
 */
export const getOptionPriceDelta = (options, selectedOptions = {}) => {
  const selection = selectedOptions || {};

  return normalizeOptions(options).reduce((total, group) => {
    const selectedLabel = clean(selection[group.name]);
    if (!selectedLabel) return total;

    const match = group.values.find(
      (value) => value.label.toLowerCase() === selectedLabel.toLowerCase()
    );

    return total + (match?.priceDelta || 0);
  }, 0);
};

/**
 * Final unit price = product base price + selected option deltas.
 */
export const getUnitPrice = (product, selectedOptions = {}) => {
  const basePrice = Number(product?.price ?? product?.sellingPrice ?? 0) || 0;
  const delta = getOptionPriceDelta(product?.options, selectedOptions);
  return Math.max(1, Math.round(basePrice + delta));
};

/**
 * True when the product has at least one option group.
 */
export const hasOptions = (product) => normalizeOptions(product?.options).length > 0;

/**
 * True when a customer must pick a value before adding to cart.
 */
export const productRequiresSelection = (product) =>
  normalizeOptions(product?.options).some((group) => group.required);

/**
 * First-value selection for required groups. Optional groups start unselected.
 */
export const buildDefaultSelection = (options) => {
  const selection = {};
  normalizeOptions(options).forEach((group) => {
    if (group.required) selection[group.name] = group.values[0].label;
  });
  return selection;
};

/**
 * Stable cart line id: one line per product + option combination.
 */
export const getOptionKey = (selectedOptions = {}) =>
  Object.keys(selectedOptions || {})
    .filter((key) => clean(selectedOptions[key]))
    .sort()
    .map((key) => `${clean(key)}=${clean(selectedOptions[key])}`)
    .join('|');

export const getCartLineId = (productId, selectedOptions = {}) => {
  const key = getOptionKey(selectedOptions);
  return key ? `${productId}::${key}` : productId;
};

/**
 * Human readable variant label, e.g. "Storage: 512GB • Colour: Black".
 */
export const getOptionSummary = (selectedOptions = {}) =>
  Object.entries(selectedOptions || {})
    .filter(([, value]) => clean(value))
    .map(([key, value]) => `${key}: ${clean(value)}`)
    .join(' • ');

/**
 * Safe fallback for legacy orders that stored a plain `variant` string.
 */
export const getItemOptionLabel = (item) => {
  if (!item) return '';
  if (item.selectedOptions && typeof item.selectedOptions === 'object') {
    return getOptionSummary(item.selectedOptions);
  }
  return clean(item.variant);
};

const productOptions = {
  normalizeOptionValue,
  normalizeOptions,
  mergeOptionGroups,
  collectOptionGroups,
  getOptionPriceDelta,
  getUnitPrice,
  balanceOptionDeltas,
  getOptionValueLabel,
  getOptionValuePriceDelta,
  hasOptions,
  productRequiresSelection,
  buildDefaultSelection,
  getOptionKey,
  getCartLineId,
  getOptionSummary,
  getItemOptionLabel,
};

export default productOptions;
