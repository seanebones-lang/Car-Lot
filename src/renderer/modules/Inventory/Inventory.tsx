import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCarStore } from '../../stores/useCarStore';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Car as CarIcon } from 'lucide-react';
import CarCard from './CarCard';
import CarForm from './CarForm';

const Inventory: React.FC = () => {
  const { t } = useTranslation();
  const { cars, loading, fetchCars, searchCars, deleteCar } = useCarStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchCars(query);
    } else {
      fetchCars();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('common.delete') + '?')) {
      try {
        await deleteCar(id);
        toast.success(t('common.success'));
      } catch (error) {
        toast.error(t('common.error'));
      }
    }
  };

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCar(null);
  };

  const filteredCars = filterStatus === 'all' 
    ? cars 
    : cars.filter(car => car.status === filterStatus);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('inventory.title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          {t('inventory.addCar')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">{t('common.filter')}</option>
          <option value="available">{t('inventory.available')}</option>
          <option value="sold">{t('inventory.sold')}</option>
          <option value="pending">{t('inventory.pending')}</option>
        </select>
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p>{t('common.loading')}</p>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-12">
          <CarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('inventory.title')} - {t('common.search')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Car Form Modal */}
      {showForm && (
        <CarForm
          car={editingCar}
          onClose={handleCloseForm}
          onSave={() => {
            handleCloseForm();
            fetchCars();
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
