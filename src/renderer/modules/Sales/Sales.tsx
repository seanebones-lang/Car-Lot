import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaleStore } from '../../stores/useSaleStore';
import { useCarStore } from '../../stores/useCarStore';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { toast } from 'react-hot-toast';
import { Plus, FileText } from 'lucide-react';
import SaleList from './SaleList';
import SaleForm from './SaleForm';

const Sales: React.FC = () => {
  const { t } = useTranslation();
  const { fetchSales } = useSaleStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('sales.title')}</h1>
        <button
          onClick={() => {
            setEditingSale(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          {t('sales.createSale')}
        </button>
      </div>

      <SaleList
        onEdit={(sale) => {
          setEditingSale(sale);
          setShowForm(true);
        }}
      />

      {showForm && (
        <SaleForm
          sale={editingSale}
          onClose={() => {
            setShowForm(false);
            setEditingSale(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingSale(null);
            fetchSales();
          }}
        />
      )}
    </div>
  );
};

export default Sales;
