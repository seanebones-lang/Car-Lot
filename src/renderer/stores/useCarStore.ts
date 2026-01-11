import { create } from 'zustand';
import { Car } from '../types';

interface CarState {
  cars: Car[];
  selectedCar: Car | null;
  loading: boolean;
  error: string | null;
  fetchCars: () => Promise<void>;
  fetchCarById: (id: number) => Promise<void>;
  createCar: (car: Omit<Car, 'id'>) => Promise<void>;
  updateCar: (id: number, car: Partial<Car>) => Promise<void>;
  deleteCar: (id: number) => Promise<void>;
  searchCars: (query: string) => Promise<void>;
  setSelectedCar: (car: Car | null) => void;
}

export const useCarStore = create<CarState>((set, get) => ({
  cars: [],
  selectedCar: null,
  loading: false,
  error: null,
  fetchCars: async () => {
    set({ loading: true, error: null });
    try {
      const cars = await window.electronAPI.cars.getAll();
      set({ cars, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchCarById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const car = await window.electronAPI.cars.getById(id);
      set({ selectedCar: car, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  createCar: async (car: Omit<Car, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const newCar = await window.electronAPI.cars.create(car);
      set((state) => ({ cars: [newCar, ...state.cars], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  updateCar: async (id: number, car: Partial<Car>) => {
    set({ loading: true, error: null });
    try {
      const updatedCar = await window.electronAPI.cars.update(id, car);
      set((state) => ({
        cars: state.cars.map((c) => (c.id === id ? updatedCar : c)),
        selectedCar: state.selectedCar?.id === id ? updatedCar : state.selectedCar,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  deleteCar: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.cars.delete(id);
      set((state) => ({
        cars: state.cars.filter((c) => c.id !== id),
        selectedCar: state.selectedCar?.id === id ? null : state.selectedCar,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  searchCars: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const cars = await window.electronAPI.cars.search(query);
      set({ cars, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  setSelectedCar: (car: Car | null) => set({ selectedCar: car }),
}));
