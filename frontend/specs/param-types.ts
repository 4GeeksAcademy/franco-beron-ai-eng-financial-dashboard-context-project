import type {
  BusinessType,
  Category,
  GroupBy,
  OperationType,
} from "./api-types";

/**
 * Date range filter shared across specs.
 */
export interface DateRangeFilter {
  /**
   * Inclusive lower bound date in YYYY-MM-DD format.
   * Omit to apply no lower bound.
   */
  start_date?: string;
  /**
   * Inclusive upper bound date in YYYY-MM-DD format.
   * Omit to apply no upper bound.
   */
  end_date?: string;
}

/**
 * Query params accepted by GET /api/metrics.
 */
export interface MetricsParams extends DateRangeFilter {
  /** Optional category filter. */
  category?: Category;
  /** Optional operation type filter. */
  operation_type?: OperationType;
}

/**
 * Query params accepted by GET /api/metrics/alerts.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Alert sensitivity ratio.
   * OpenAPI-verified constraints: minimum 0, default 0.3, no maximum defined.
   */
  threshold?: number;
  /** Aggregation granularity. OpenAPI default: month. */
  group_by?: GroupBy;
  /** Optional business segment filter. */
  business_type?: BusinessType;
}

/**
 * Query params accepted by GET /api/metrics/categories/top.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type to aggregate. OpenAPI default: outcome. */
  operation_type?: OperationType;
  /**
   * Number of rows to return.
   * OpenAPI-verified constraints: integer, minimum 1, maximum 20, default 5.
   */
  limit?: number;
  /** Optional business segment filter. */
  business_type?: BusinessType;
}
