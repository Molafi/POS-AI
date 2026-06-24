import type { ABCItem, EMAResult, RecommendedProduct } from '@shared/types';

/**
 * Levenshtein Distance - Classic dynamic programming implementation.
 * Computes the minimum number of single-character edits (insertions,
 * deletions, substitutions) required to transform string `a` into string `b`.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Create a 2D matrix of size (m+1) x (n+1)
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  // Base cases: transforming empty string to/from a prefix
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Characters match, no edit needed
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Deletion
          dp[i][j - 1],     // Insertion
          dp[i - 1][j - 1]  // Substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Fuzzy search using Levenshtein distance.
 * Returns items sorted by similarity to the query.
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getLabel: (item: T) => string,
  maxDistance: number = 3
): T[] {
  const lowerQuery = query.toLowerCase();

  const scored = items
    .map((item) => {
      const label = getLabel(item).toLowerCase();

      // Exact substring match gets distance 0
      if (label.includes(lowerQuery)) {
        return { item, distance: 0 };
      }

      // Check each word in the label
      const words = label.split(/\s+/);
      let minDistance = Infinity;
      for (const word of words) {
        const dist = levenshteinDistance(lowerQuery, word);
        minDistance = Math.min(minDistance, dist);
      }

      // Also check against full label for short queries
      const fullDist = levenshteinDistance(lowerQuery, label);
      minDistance = Math.min(minDistance, fullDist);

      return { item, distance: minDistance };
    })
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return scored.map(({ item }) => item);
}

/**
 * Co-occurrence Matrix - Recommend products frequently bought together.
 * Given a matrix of product pair co-occurrence counts and a set of current
 * cart product IDs, returns recommended products sorted by total score.
 *
 * @param coOccurrenceData - Array of { productAId, productBId, count } records
 * @param cartProductIds - Set of product IDs currently in the cart
 * @param productNames - Map of productId to product name for display
 * @param limit - Maximum number of recommendations to return
 */
export function getCoOccurrenceRecommendations(
  coOccurrenceData: { productAId: string; productBId: string; count: number }[],
  cartProductIds: Set<string>,
  productNames: Map<string, string>,
  limit: number = 5
): RecommendedProduct[] {
  // Build a score map: for each product NOT in the cart, accumulate
  // co-occurrence counts from all products that ARE in the cart
  const scoreMap = new Map<string, number>();

  for (const { productAId, productBId, count } of coOccurrenceData) {
    // If A is in cart and B is not, recommend B
    if (cartProductIds.has(productAId) && !cartProductIds.has(productBId)) {
      const current = scoreMap.get(productBId) || 0;
      scoreMap.set(productBId, current + count);
    }
    // If B is in cart and A is not, recommend A
    if (cartProductIds.has(productBId) && !cartProductIds.has(productAId)) {
      const current = scoreMap.get(productAId) || 0;
      scoreMap.set(productAId, current + count);
    }
  }

  // Convert to sorted array and return top N
  const recommendations: RecommendedProduct[] = Array.from(scoreMap.entries())
    .map(([productId, score]) => ({
      productId,
      name: productNames.get(productId) || 'Unknown Product',
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
}

/**
 * Exponential Moving Average (EMA) calculation.
 * EMA(t) = alpha * sales(t) + (1 - alpha) * EMA(t-1)
 *
 * Uses smoothing factor alpha = 0.3 (giving 70% weight to previous EMA).
 *
 * @param salesData - Array of { date, amount } sorted chronologically
 * @param alpha - Smoothing factor (default 0.3)
 * @returns Array of EMA results with date, actual value, and EMA value
 */
export function calculateEMA(
  salesData: { date: string; amount: number }[],
  alpha: number = 0.3
): EMAResult[] {
  if (salesData.length === 0) {
    return [];
  }

  const results: EMAResult[] = [];

  // Initialize EMA with the first data point
  let ema = salesData[0].amount;
  results.push({
    date: salesData[0].date,
    actual: salesData[0].amount,
    ema,
  });

  // Calculate EMA for subsequent data points
  for (let i = 1; i < salesData.length; i++) {
    const actual = salesData[i].amount;
    ema = alpha * actual + (1 - alpha) * ema;
    results.push({
      date: salesData[i].date,
      actual,
      ema,
    });
  }

  return results;
}

/**
 * ABC Analysis - Classify products by revenue contribution.
 * Sort products by revenue descending, compute cumulative percentage:
 * - Category A: 0-80% of cumulative revenue (top sellers)
 * - Category B: 80-95% of cumulative revenue (moderate sellers)
 * - Category C: 95-100% of cumulative revenue (low sellers)
 *
 * @param products - Array of { productId, name, revenue } data
 * @returns Array of ABCItem with classification
 */
export function performABCAnalysis(
  products: { productId: string; name: string; revenue: number }[]
): ABCItem[] {
  if (products.length === 0) {
    return [];
  }

  // Calculate total revenue
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

  if (totalRevenue === 0) {
    // If no revenue, classify all as C
    return products.map((p) => ({
      productId: p.productId,
      name: p.name,
      revenue: 0,
      percentage: 0,
      cumulativePercentage: 0,
      category: 'C' as const,
    }));
  }

  // Sort by revenue descending
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue);

  // Calculate individual percentage and cumulative percentage
  let cumulativeRevenue = 0;
  const results: ABCItem[] = sorted.map((product) => {
    cumulativeRevenue += product.revenue;
    const percentage = (product.revenue / totalRevenue) * 100;
    const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100;

    // Classify based on cumulative percentage
    let category: 'A' | 'B' | 'C';
    if (cumulativePercentage <= 80) {
      category = 'A';
    } else if (cumulativePercentage <= 95) {
      category = 'B';
    } else {
      category = 'C';
    }

    return {
      productId: product.productId,
      name: product.name,
      revenue: product.revenue,
      percentage,
      cumulativePercentage,
      category,
    };
  });

  return results;
}
