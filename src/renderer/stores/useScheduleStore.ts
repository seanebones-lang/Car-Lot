import { create } from 'zustand';
import { Shift, Employee } from '../types';

interface ScheduleState {
  shifts: Shift[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchShifts: (start: string, end: string) => Promise<void>;
  fetchEmployees: () => Promise<void>;
  createShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: number, shift: Partial<Shift>) => Promise<void>;
  deleteShift: (id: number) => Promise<void>;
  createEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: number, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  shifts: [],
  employees: [],
  loading: false,
  error: null,
  fetchShifts: async (start: string, end: string) => {
    set({ loading: true, error: null });
    try {
      const shifts = await window.electronAPI.shifts.getByDateRange(start, end);
      set({ shifts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const employees = await window.electronAPI.employees.getAll();
      set({ employees, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  createShift: async (shift: Omit<Shift, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const newShift = await window.electronAPI.shifts.create(shift);
      set((state) => ({ shifts: [...state.shifts, newShift], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  updateShift: async (id: number, shift: Partial<Shift>) => {
    set({ loading: true, error: null });
    try {
      const updatedShift = await window.electronAPI.shifts.update(id, shift);
      set((state) => ({
        shifts: state.shifts.map((s) => (s.id === id ? updatedShift : s)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  deleteShift: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.shifts.delete(id);
      set((state) => ({
        shifts: state.shifts.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  createEmployee: async (employee: Omit<Employee, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const newEmployee = await window.electronAPI.employees.create(employee);
      set((state) => ({ employees: [...state.employees, newEmployee], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  updateEmployee: async (id: number, employee: Partial<Employee>) => {
    set({ loading: true, error: null });
    try {
      const updatedEmployee = await window.electronAPI.employees.update(id, employee);
      set((state) => ({
        employees: state.employees.map((e) => (e.id === id ? updatedEmployee : e)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  deleteEmployee: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.employees.delete(id);
      set((state) => ({
        employees: state.employees.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
