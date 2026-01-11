import React from 'react';
import { useTranslation } from 'react-i18next';
import { Car } from '../../types';
import { Edit, Trash2 } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (id: number) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {car.photoPath && (
        <img
          src={car.photoPath}
          alt={`${car.make} ${car.model}`}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">
              {car.year} {car.make} {car.model}
            </h3>
            <p className="text-sm text-gray-600">VIN: {car.vin}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(car.status)}`}>
            {t(`inventory.${car.status}`)}
          </span>
        </div>
        <p className="text-xl font-bold text-blue-600 mb-4">
          ${car.price.toLocaleString()}
        </p>
        {car.notes && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{car.notes}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(car)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            {t('common.edit')}
          </button>
          <button
            onClick={() => car.id && onDelete(car.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
