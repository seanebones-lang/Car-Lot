import { create } from 'zustand';
import { Sale } from '../types';

interface SaleState {
  sales: Sale[];
  selectedSale: Sale | null;
  loading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  fetchSaleById: (id: number) => Promise<void>;
  createSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  generateInvoice: (saleId: number) => Promise<void>;
  setSelectedSale: (sale: Sale | null) => void;
}

export const useSaleStore = create<SaleState>((set) => ({
  sales: [],
  selectedSale: null,
  loading: false,
  error: null,
  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const sales = await window.electronAPI.sales.getAll();
      set({ sales, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchSaleById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const sale = await window.electronAPI.sales.getById(id);
      set({ selectedSale: sale, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  createSale: async (sale: Omit<Sale, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const newSale = await window.electronAPI.sales.create(sale);
      set((state) => ({ sales: [newSale, ...state.sales], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  generateInvoice: async (saleId: number) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.sales.generateInvoice(saleId);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  setSelectedSale: (sale: Sale | null) => set({ selectedSale: sale }),
}));
