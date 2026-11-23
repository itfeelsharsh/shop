/**
 * Product Options / Variants
 *
 * A single, shared source of truth for purchasable product options
 * (size, colour, capacity, pack size, etc.).
 *
 * There are no hard-coded category presets. Options are learned from real
 * catalogue usage (existing products in the same category/brand), generated
 * on demand by AI, or added manually in the admin panel.
 *
 * Product document shape:
 *   options: [
 *     { name: "Size", values: ["S", "M", "L"], required: true },
 *     { name: "Colour", values: ["Black", "White"], required: true }
 *   ]
 *
 * Cart line shape:
 *   { productId, quantity, lineId, selectedOptions: { "Size": "M" } }
 */

const clean = (value) => String(value ?? '').trim();

/**
 * Trim and discard empty option groups / values.
 */
export const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options
    .map((group) => ({
      name: clean(group?.name),
      values: Array.isArray(group?.values)
        ? Array.from(new Set(group.values.map(clean).filter(Boolean)))
        : [],
      required: group?.required !== false,
    }))
    .filter((group) => group.name && group.values.length > 0);
};

/**
 * Merge any number of option group arrays into one deduplicated list.
 * Group names and values are matched case-insensitively while preserving the
 * first casing that was seen. Usage counts are summed when present.
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

    (Array.isArray(raw?.values) ? raw.values : []).forEach((value) => {
      const cleaned = clean(value);
      if (!cleaned) return;
      if (!entry.values.some((existing) => existing.toLowerCase() === cleaned.toLowerCase())) {
        entry.values.push(cleaned);
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
 * Returns groups ordered by how many products use them.
 */
export const collectOptionGroups = (items) => {
  const byName = new Map();

  (items || []).forEach((item) => {
    normalizeOptions(item?.options).forEach((group) => {
      const key = group.name.toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, {
          name: group.name,
          values: [],
          required: false,
          usage: 0,
        });
      }

      const entry = byName.get(key);
      entry.usage += 1;

      group.values.forEach((value) => {
        if (!entry.values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
          entry.values.push(value);
        }
      });
    });
  });

  return Array.from(byName.values()).sort(
    (a, b) => b.usage - a.usage || a.name.localeCompare(b.name)
  );
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
 * First-value selection for required groups, used to make the product page
 * feel instant. Optional groups start unselected ("Any").
 */
export const buildDefaultSelection = (options) => {
  const selection = {};
  normalizeOptions(options).forEach((group) => {
    if (group.required) selection[group.name] = group.values[0];
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
 * Human readable variant label, e.g. "Size: M • Colour: Black".
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

export default {
  normalizeOptions,
  mergeOptionGroups,
  collectOptionGroups,
  hasOptions,
  productRequiresSelection,
  buildDefaultSelection,
  getOptionKey,
  getCartLineId,
  getOptionSummary,
  getItemOptionLabel,
};
