/**
 * Product Options / Variants
 *
 * A single, shared source of truth for category-specific purchasable options
 * (size, wheel size, colour, pack size, etc.).
 *
 * Product document shape:
 *   options: [
 *     { name: "Frame Size", values: ["S", "M", "L"], required: true },
 *     { name: "Wheel Size", values: ["27.5\"", "29\""], required: true }
 *   ]
 *
 * Cart line shape:
 *   { productId, quantity, lineId, selectedOptions: { "Frame Size": "M" } }
 */

export const CATEGORY_OPTION_PRESETS = {
  // ── Stationery ──────────────────────────────────────────────────────────
  'Notebooks and Journals': [
    { name: 'Size', values: ['A5', 'A4', 'B5'], required: true },
    { name: 'Ruling', values: ['Lined', 'Plain', 'Grid', 'Dotted'], required: true },
    { name: 'Paper GSM', values: ['70 GSM', '90 GSM', '120 GSM'], required: false },
  ],
  'Pens and Pencils': [
    { name: 'Point Size', values: ['0.5 mm', '0.7 mm', '1.0 mm'], required: true },
    { name: 'Ink Colour', values: ['Blue', 'Black', 'Red'], required: true },
    { name: 'Pack Size', values: ['1', '5', '10', '20'], required: true },
  ],
  'Paper and Notepads': [
    { name: 'Size', values: ['A5', 'A4', 'Letter'], required: true },
    { name: 'Ruling', values: ['Lined', 'Plain', 'Grid'], required: true },
    { name: 'Sheets per Pack', values: ['50', '100', '200'], required: false },
  ],
  'Planners and Calendars': [
    { name: 'Year', values: ['2026', '2027'], required: true },
    { name: 'Size', values: ['A5', 'A4', 'Desk'], required: true },
    { name: 'Layout', values: ['Daily', 'Weekly', 'Monthly'], required: true },
  ],
  'Office Supplies': [
    { name: 'Pack Size', values: ['1', '5', '12', '24'], required: true },
    { name: 'Colour', values: ['Black', 'White', 'Assorted'], required: false },
  ],
  'Art Supplies': [
    { name: 'Set Size', values: ['12 Colours', '24 Colours', '36 Colours', '48 Colours'], required: true },
    { name: 'Tip Type', values: ['Fine', 'Brush', 'Chisel'], required: false },
  ],
  'Desk Accessories': [
    { name: 'Colour', values: ['Black', 'White', 'Walnut', 'Grey'], required: true },
    { name: 'Material', values: ['Metal', 'Wood', 'Plastic', 'Leather'], required: false },
  ],
  'Cards and Envelopes': [
    { name: 'Size', values: ['A6', 'A5', 'Square'], required: true },
    { name: 'Pack of', values: ['5', '10', '20', '50'], required: true },
    { name: 'Design', values: ['Minimal', 'Floral', 'Festive'], required: false },
  ],
  'Writing Accessories': [
    { name: 'Colour', values: ['Black', 'White', 'Tan'], required: true },
    { name: 'Size', values: ['Small', 'Medium', 'Large'], required: false },
  ],
  'Gift Wrap and Packaging': [
    { name: 'Size', values: ['Small', 'Medium', 'Large'], required: true },
    { name: 'Design', values: ['Minimal', 'Festive', 'Kraft'], required: true },
    { name: 'Pack of', values: ['1', '3', '6', '12'], required: false },
  ],

  // ── Everything else we sell ─────────────────────────────────────────────
  'Bicycles': [
    { name: 'Frame Size', values: ['XS', 'S', 'M', 'L', 'XL'], required: true },
    { name: 'Wheel Size', values: ['26"', '27.5"', '29"'], required: true },
    { name: 'Frame Material', values: ['Aluminium', 'Carbon Fibre', 'Steel'], required: false },
    { name: 'Colour', values: ['Matte Black', 'Glacier White', 'Forest Green'], required: true },
  ],
  'Bike Accessories': [
    { name: 'Size', values: ['One Size', 'S', 'M', 'L'], required: false },
    { name: 'Colour', values: ['Black', 'White', 'Grey'], required: true },
  ],
  'Fitness Equipment': [
    { name: 'Weight', values: ['2 kg', '5 kg', '10 kg', '20 kg'], required: false },
    { name: 'Size', values: ['Small', 'Medium', 'Large'], required: false },
    { name: 'Colour', values: ['Black', 'Grey', 'Red'], required: true },
  ],
  'Electronics': [
    { name: 'Storage', values: ['64 GB', '128 GB', '256 GB', '512 GB'], required: false },
    { name: 'Colour', values: ['Black', 'Silver', 'White'], required: true },
  ],
  'Audio': [
    { name: 'Colour', values: ['Black', 'White', 'Blue'], required: true },
    { name: 'Connectivity', values: ['Bluetooth', 'Wired', 'USB-C'], required: false },
  ],
  'Apparel and Footwear': [
    { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
    { name: 'Colour', values: ['Black', 'White', 'Navy'], required: true },
    { name: 'Fit', values: ['Regular', 'Slim', 'Oversized'], required: false },
  ],
  'Home and Kitchen': [
    { name: 'Size', values: ['Small', 'Medium', 'Large'], required: true },
    { name: 'Colour', values: ['White', 'Black', 'Beige'], required: true },
    { name: 'Material', values: ['Ceramic', 'Glass', 'Stainless Steel'], required: false },
  ],
  'Beauty and Personal Care': [
    { name: 'Size', values: ['30 ml', '50 ml', '100 ml'], required: true },
    { name: 'Shade', values: ['Natural', 'Ivory', 'Tan'], required: false },
  ],
  'Toys and Games': [
    { name: 'Age Group', values: ['3+', '6+', '12+'], required: true },
    { name: 'Colour', values: ['Multicolour', 'Black', 'White'], required: false },
  ],
  'Musical Instruments': [
    { name: 'Size', values: ['Small', 'Medium', 'Full Size'], required: true },
    { name: 'Colour', values: ['Natural', 'Black', 'Sunburst'], required: true },
    { name: 'Handedness', values: ['Right-handed', 'Left-handed'], required: false },
  ],
  'Bags and Luggage': [
    { name: 'Size', values: ['Small', 'Medium', 'Large'], required: true },
    { name: 'Colour', values: ['Black', 'Tan', 'Olive'], required: true },
  ],
  'Jewellery and Watches': [
    { name: 'Size', values: ['S', 'M', 'L', 'One Size'], required: true },
    { name: 'Finish', values: ['Gold', 'Silver', 'Rose Gold'], required: true },
  ],
  'Health and Wellness': [
    { name: 'Size', values: ['30 caps', '60 caps', '90 caps'], required: true },
    { name: 'Flavour', values: ['Unflavoured', 'Vanilla', 'Chocolate'], required: false },
  ],
  'Automotive': [
    { name: 'Size', values: ['Universal', 'S', 'M', 'L'], required: false },
    { name: 'Colour', values: ['Black', 'Grey'], required: true },
  ],
};

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
 * Category-aware suggested options for the admin editor.
 */
export const getCategoryOptionPresets = (category) => {
  const key = clean(category);
  if (!key) return [];
  const exact = CATEGORY_OPTION_PRESETS[key];
  if (exact) return exact;
  const match = Object.keys(CATEGORY_OPTION_PRESETS).find(
    (name) => name.toLowerCase() === key.toLowerCase()
  );
  return match ? CATEGORY_OPTION_PRESETS[match] : [];
};

/**
 * True when the product has at least one option group.
 */
export const hasOptions = (product) => normalizeOptions(product?.options).length > 0;

/**
 * True when a customer must pick a value before adding to cart.
 * (All generated groups default to required, so this is normally true.)
 */
export const productRequiresSelection = (product) =>
  normalizeOptions(product?.options).some((group) => group.required);

/**
 * First-value selection, used to make the product page feel instant.
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
 * Human readable variant label, e.g. "Frame Size: M • Colour: Black".
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
  CATEGORY_OPTION_PRESETS,
  normalizeOptions,
  getCategoryOptionPresets,
  hasOptions,
  productRequiresSelection,
  buildDefaultSelection,
  getOptionKey,
  getCartLineId,
  getOptionSummary,
  getItemOptionLabel,
};
