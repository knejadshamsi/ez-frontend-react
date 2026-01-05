import type { CarDistribution } from '~ez/stores/types';

export const MINIMUM_PERCENTAGE = 5;

// Finds the category with the largest percentage among enabled categories
export const findBiggestCategory = (
  distribution: CarDistribution,
  enabledCategories: Record<string, boolean>,
  excludeCategory?: string
): { key: string; value: number } => {
  return Object.entries(distribution)
    .filter(([key]) => enabledCategories[key] && key !== excludeCategory)
    .reduce(
      (max, [key, value]) => (value > max.value ? { key, value } : max),
      { key: '', value: 0 }
    );
};

// Redistributes percentage when disabling a category (remove from the largest)
export const redistributeOnDisable = (
  distribution: CarDistribution,
  disabledCategory: string,
  enabledCategories: Record<string, boolean>
): CarDistribution => {
  const removedPercentage = distribution[disabledCategory];

  const biggest = findBiggestCategory(distribution, enabledCategories, disabledCategory);

  return {
    ...distribution,
    [biggest.key]: distribution[biggest.key] + removedPercentage,
    [disabledCategory]: 0
  };
};

// Redistributes percentage when re-enabling a category (take from the largest)
export const redistributeOnEnable = (
  distribution: CarDistribution,
  enabledCategory: string,
  enabledCategories: Record<string, boolean>,
  minimumPercentage: number = MINIMUM_PERCENTAGE
): CarDistribution => {
  const biggest = findBiggestCategory(distribution, enabledCategories);

  return {
    ...distribution,
    [biggest.key]: distribution[biggest.key] - minimumPercentage,
    [enabledCategory]: minimumPercentage
  };
};

// Counts how many categories are currently enabled
export const countEnabledCategories = (enabledCategories: Record<string, boolean>): number => {
  return Object.values(enabledCategories).filter(v => v).length;
};
