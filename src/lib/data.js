import { supabase } from './supabase';

const LOCAL_CATEGORIES_KEY = 's2_custom_categories';
const LOCAL_PRODUCTS_KEY = 's2_custom_products';

export function getLocalCategories() {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCategory(category) {
  try {
    const current = getLocalCategories();
    const updated = [category, ...current.filter((c) => c.id !== category.id)];
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteLocalCategory(categoryId) {
  try {
    const current = getLocalCategories();
    const updated = current.filter((c) => c.id !== categoryId);
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalProduct(product) {
  try {
    const current = getLocalProducts();
    const updated = [product, ...current.filter((p) => p.id !== product.id)];
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteLocalProduct(productId) {
  try {
    const current = getLocalProducts();
    const updated = current.filter((p) => p.id !== productId);
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Fetch all categories added by the admin.
 * Pulls from Supabase, or from local admin storage if Supabase is not connected.
 * Never returns hardcoded pre-seeded categories.
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // continue to local storage check
  }

  // If no Supabase data, check what the admin added locally
  return getLocalCategories();
}

/**
 * Fetch single category by ID or slug.
 */
export async function getCategoryByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch {
    // continue to local
  }

  const localList = getLocalCategories();
  return (
    localList.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null
  );
}

/**
 * Fetch products inside a specific category added by the admin.
 */
export async function getProductsByCategory(category) {
  if (!category || !category.id) return [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // continue to local
  }

  const localList = getLocalProducts();
  return localList.filter((p) => p.category_id === category.id);
}
