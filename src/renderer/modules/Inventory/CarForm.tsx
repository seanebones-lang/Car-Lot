import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCarStore } from '../../stores/useCarStore';
import { toast } from 'react-hot-toast';
import { X, Upload, Search } from 'lucide-react';
import { Car } from '../../types';

interface CarFormProps {
  car?: Car | null;
  onClose: () => void;
  onSave: () => void;
}

const CarForm: React.FC<CarFormProps> = ({ car, onClose, onSave }) => {
  const { t } = useTranslation();
  const { createCar, updateCar } = useCarStore();
  const [formData, setFormData] = useState<Partial<Car>>({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    status: 'available',
    notes: '',
  });
  const [decodingVin, setDecodingVin] = useState(false);

  useEffect(() => {
    if (car) {
      setFormData(car);
    }
  }, [car]);

  const handleDecodeVin = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      toast.error('Please enter a valid 17-character VIN');
      return;
    }

    setDecodingVin(true);
    try {
      const result = await window.electronAPI.vin.decode(formData.vin);
      if (result.success && result.data) {
        setFormData((prev) => ({
          ...prev,
          make: result.data.make || prev.make,
          model: result.data.model || prev.model,
          year: result.data.year || prev.year,
        }));
        toast.success('VIN decoded successfully');
      } else {
        toast.error(result.error || 'Failed to decode VIN');
      }
    } catch (error) {
      toast.error('Failed to decode VIN');
    } finally {
      setDecodingVin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (car?.id) {
        await updateCar(car.id, formData);
      } else {
        await createCar(formData as Omit<Car, 'id'>);
      }
      toast.success(t('common.success'));
      onSave();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload to userData/photos/
      // For now, create a local object URL
      const photoPath = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, photoPath }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {car ? t('inventory.editCar') : t('inventory.addCar')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* VIN with Decode Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('inventory.vin')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={17}
                required
              />
              <button
                type="button"
                onClick={handleDecodeVin}
                disabled={decodingVin || !formData.vin || formData.vin.length !== 17}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {decodingVin ? t('common.loading') : t('inventory.decodeVin')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.make')}
              </label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.model')}
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.year')}
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.price')}
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('inventory.status')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Car['status'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="available">{t('inventory.available')}</option>
              <option value="sold">{t('inventory.sold')}</option>
              <option value="pending">{t('inventory.pending')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('inventory.photo')}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {formData.photoPath && (
                <img
                  src={formData.photoPath}
                  alt="Car preview"
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </div>
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

export default CarForm;
