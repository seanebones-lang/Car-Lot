import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { toast } from 'react-hot-toast';
import { Edit, Calendar, User } from 'lucide-react';
import dayjs from 'dayjs';

interface LeadListProps {
  onEdit: (lead: any) => void;
}

const LeadList: React.FC<LeadListProps> = ({ onEdit }) => {
  const { t } = useTranslation();
  const { leads, loading, updateLead } = useCustomerStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLeads = filterStatus === 'all'
    ? leads
    : leads.filter(lead => lead.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">{t('common.filter')}</option>
          <option value="new">{t('crm.new')}</option>
          <option value="contacted">{t('crm.contacted')}</option>
          <option value="qualified">{t('crm.qualified')}</option>
          <option value="converted">{t('crm.converted')}</option>
          <option value="lost">{t('crm.lost')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{lead.customerName || 'Unknown'}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                {t(`crm.${lead.status}`)}
              </span>
            </div>
            {lead.followUpDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                {dayjs(lead.followUpDate).format('MMM D, YYYY')}
              </div>
            )}
            {lead.notes && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lead.notes}</p>
            )}
            <button
              onClick={() => onEdit(lead)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              {t('common.edit')}
            </button>
          </div>
        ))}
      </div>
      {filteredLeads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {t('crm.leads')} - {t('common.search')}
        </div>
      )}
    </div>
  );
};

export default LeadList;
