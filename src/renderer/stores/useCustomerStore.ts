import { create } from 'zustand';
import { Customer, Lead } from '../types';

interface CustomerState {
  customers: Customer[];
  leads: Lead[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  fetchCustomerById: (id: number) => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  fetchLeads: () => Promise<void>;
  fetchLeadsByStatus: (status: string) => Promise<void>;
  createLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (id: number, lead: Partial<Lead>) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  leads: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const customers = await window.electronAPI.customers.getAll();
      set({ customers, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchCustomerById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const customer = await window.electronAPI.customers.getById(id);
      set({ selectedCustomer: customer, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  createCustomer: async (customer: Omit<Customer, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await window.electronAPI.customers.create(customer);
      set((state) => ({ customers: [newCustomer, ...state.customers], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  updateCustomer: async (id: number, customer: Partial<Customer>) => {
    set({ loading: true, error: null });
    try {
      const updatedCustomer = await window.electronAPI.customers.update(id, customer);
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updatedCustomer : c)),
        selectedCustomer: state.selectedCustomer?.id === id ? updatedCustomer : state.selectedCustomer,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  deleteCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.customers.delete(id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const leads = await window.electronAPI.leads.getAll();
      set({ leads, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchLeadsByStatus: async (status: string) => {
    set({ loading: true, error: null });
    try {
      const leads = await window.electronAPI.leads.getByStatus(status);
      set({ leads, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  createLead: async (lead: Omit<Lead, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const newLead = await window.electronAPI.leads.create(lead);
      set((state) => ({ leads: [newLead, ...state.leads], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  updateLead: async (id: number, lead: Partial<Lead>) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await window.electronAPI.leads.update(id, lead);
      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? updatedLead : l)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  setSelectedCustomer: (customer: Customer | null) => set({ selectedCustomer: customer }),
}));
