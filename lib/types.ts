export type PriceTier = {
  /** Cumulative fill fraction at which this tier ends. e.g. 0.2 = first 20% */
  threshold: number;
  /** Price for units priced under this tier */
  price_cents: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  /** Hex like "#FFFFFF" for color variants. Null for non-color variants. */
  swatch_hex: string | null;
  sort_order: number;
};

export type ProductSpec = {
  /** Spec row label, e.g. "Driver" */
  label: string;
  /** Boringgg's value, e.g. "11mm graphene" */
  ours: string;
  /** Comparable brand's value */
  theirs: string;
};

export type Product = {
  id: string;
  name: string;
  image_url: string;
  description: string | null;
  moq: number;
  base_price_cents: number;
  price_curve: PriceTier[];
  manufacturer: string;
  manufacturer_clients: string[];
  est_production_cost_cents: number;
  comparable_brand_name: string;
  comparable_brand_price_cents: number;
  /** Brand website used in the InfoModal "vs." link. External URL. */
  comparable_brand_url: string | null;
  /** @deprecated kept for back-compat; ignored by the InfoModal gallery. */
  in_use_image_url: string | null;
  /** Image 2 of 3 in InfoModal: illustrates the product's benefits. */
  image_benefits_url: string | null;
  /** Image 3 of 3 in InfoModal: what's in the box. */
  image_in_box_url: string | null;
  /** Items shipped in the box. */
  in_box: string[];
  /** Spec comparison vs. comparable brand. */
  specs: ProductSpec[];
  /** One-sentence headline health / wellness benefit. */
  health_benefit: string | null;
  /** Slug used to pick the category icon shown on the card. */
  category: string;
  /** Optional variants (e.g. colors). Empty array = no variant choice. */
  variants: ProductVariant[];
  created_at: string;
};

export type Batch = {
  id: string;
  product_id: string;
  start_at: string;
  end_at: string;
  units_reserved: number;
  status: "active" | "closed" | "fulfilled";
  created_at: string;
};

export type Reservation = {
  id: string;
  user_id: string;
  batch_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price_cents: number;
  total_paid_cents: number;
  stripe_payment_intent_id: string | null;
  status: "pending" | "paid" | "refunded";
  created_at: string;
  paid_at: string | null;
  refunded_at: string | null;
};

export type Referral = {
  id: string;
  inviter_id: string;
  invited_phone: string;
  created_at: string;
};

export type ProductWithBatch = Product & {
  batch: Batch;
};

export type ReservationWithProduct = Reservation & {
  batch: Batch & { product: Product };
};
