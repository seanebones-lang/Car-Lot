import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaleStore } from '../../stores/useSaleStore';
import { useCarStore } from '../../stores/useCarStore';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { Sale } from '../../types';

interface SaleFormProps {
  sale?: Sale | null;
  onClose: () => void;
  onSave: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ sale, onClose, onSave }) => {
  const { t } = useTranslation();
  const { createSale } = useSaleStore();
  const { cars, fetchCars } = useCarStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const [formData, setFormData] = useState<Partial<Sale>>({
    carId: 0,
    customerId: 0,
    saleDate: new Date().toISOString().split('T')[0],
    price: 0,
    tax: 0,
    financing: '',
    notes: '',
  });

  useEffect(() => {
    fetchCars();
    fetchCustomers();
  }, [fetchCars, fetchCustomers]);

  useEffect(() => {
    if (sale) {
      setFormData(sale);
    }
  }, [sale]);

  const handleCarChange = (carId: number) => {
    const car = cars.find((c) => c.id === carId);
    if (car) {
      setFormData({
        ...formData,
        carId,
        price: car.price,
      });
    }
  };

  const handlePriceChange = (price: number) => {
    const tax = price * 0.08; // 8% tax example
    setFormData({
      ...formData,
      price,
      tax,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSale(formData as Omit<Sale, 'id'>);
      toast.success(t('common.success'));
      onSave();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const availableCars = cars.filter((c) => c.status === 'available');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('sales.createSale')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sales.selectCar')} *
              </label>
              <select
                value={formData.carId}
                onChange={(e) => handleCarChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={0}>Select Vehicle</option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} - ${car.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sales.selectCustomer')} *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={0}>Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('sales.saleDate')} *
            </label>
            <input
              type="date"
              value={formData.saleDate}
              onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sales.price')} *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sales.tax')}
              </label>
              <input
                type="number"
                value={formData.tax}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financing
            </label>
            <input
              type="text"
              value={formData.financing}
              onChange={(e) => setFormData({ ...formData, financing: e.target.value })}
              placeholder="e.g., Cash, Loan, Lease"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('inventory.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
