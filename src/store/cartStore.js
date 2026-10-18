import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('LocalStorage quota limit reached:', e);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, tshirtType = '') => {
        const type = tshirtType || product.tshirt_type || ''
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) =>
            (i.id === product.id || i.product?.id === product.id) &&
            i.size === size &&
            (i.tshirtType || '') === type
        );

        if (existingIndex >= 0) {
          const updated = [...items];
          updated[existingIndex].quantity += 1;
          set({ items: updated });
        } else {
          // Keep cart lightweight so it never bloats storage
          const cleanImage =
            typeof product.image_url === 'string' &&
            product.image_url.startsWith('data:') &&
            product.image_url.length > 60000
              ? ''
              : product.image_url;

          const cleanProduct = {
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            image_url: cleanImage,
            tshirt_type: type,
          };

          const newItem = {
            id: product.id,
            product: cleanProduct,
            name: product.name,
            price: Number(product.price) || 0,
            image: cleanImage,
            size,
            tshirtType: type,
            quantity: 1,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId, size, tshirtType) => {
        set({
          items: get().items.filter(
            (i) =>
              !(
                (i.id === productId || i.product?.id === productId) &&
                i.size === size &&
                (tshirtType === undefined || (i.tshirtType || '') === (tshirtType || ''))
              )
          ),
        });
      },

      increaseQuantity: (productId, size, tshirtType) => {
        const updated = get().items.map((i) => {
          if (
            (i.id === productId || i.product?.id === productId) &&
            i.size === size &&
            (tshirtType === undefined || (i.tshirtType || '') === (tshirtType || ''))
          ) {
            return { ...i, quantity: i.quantity + 1 };
          }
          return i;
        });
        set({ items: updated });
      },

      decreaseQuantity: (productId, size, tshirtType) => {
        const item = get().items.find(
          (i) =>
            (i.id === productId || i.product?.id === productId) &&
            i.size === size &&
            (tshirtType === undefined || (i.tshirtType || '') === (tshirtType || ''))
        );
        if (!item) return;

        if (item.quantity <= 1) {
          get().removeItem(productId, size, tshirtType);
        } else {
          const updated = get().items.map((i) => {
            if (
              (i.id === productId || i.product?.id === productId) &&
              i.size === size &&
              (tshirtType === undefined || (i.tshirtType || '') === (tshirtType || ''))
            ) {
              return { ...i, quantity: i.quantity - 1 };
            }
            return i;
          });
          set({ items: updated });
        }
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        const updated = get().items.map((i) =>
          (i.id === productId || i.product?.id === productId) && i.size === size
            ? { ...i, quantity }
            : i
        );
        set({ items: updated });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce(
          (sum, i) => sum + (Number(i.price) || Number(i.product?.price) || 0) * i.quantity,
          0
        ),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 's2-cart',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
