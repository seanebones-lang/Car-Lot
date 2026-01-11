import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSaleStore } from '../../stores/useSaleStore';
import { toast } from 'react-hot-toast';
import { FileText } from 'lucide-react';
import dayjs from 'dayjs';

interface SaleListProps {
  onEdit: (sale: any) => void;
}

const SaleList: React.FC<SaleListProps> = ({ onEdit }) => {
  const { t } = useTranslation();
  const { sales, loading, generateInvoice } = useSaleStore();

  const handleGenerateInvoice = async (saleId: number) => {
    try {
      await generateInvoice(saleId);
      toast.success('Invoice generated');
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale: any) => (
            <tr key={sale.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {dayjs(sale.saleDate).format('MMM D, YYYY')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sale.year} {sale.make} {sale.model}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sale.customerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${sale.price.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${sale.tax.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => sale.id && handleGenerateInvoice(sale.id)}
                  className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  Invoice
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sales.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {t('sales.title')} - {t('common.search')}
        </div>
      )}
    </div>
  );
};

export default SaleList;
