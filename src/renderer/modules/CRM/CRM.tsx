import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { toast } from 'react-hot-toast';
import { Plus, Users, TrendingUp, Search } from 'lucide-react';
import CustomerList from './CustomerList';
import LeadList from './LeadList';
import CustomerForm from './CustomerForm';
import LeadForm from './LeadForm';

const CRM: React.FC = () => {
  const { t } = useTranslation();
  const { fetchCustomers, fetchLeads } = useCustomerStore();
  const [activeTab, setActiveTab] = useState<'customers' | 'leads'>('customers');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingLead, setEditingLead] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
    fetchLeads();
  }, [fetchCustomers, fetchLeads]);

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('crm.title')}</h1>
        <div className="flex gap-2">
          {activeTab === 'customers' ? (
            <button
              onClick={() => {
                setEditingCustomer(null);
                setShowCustomerForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              {t('crm.addCustomer')}
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingLead(null);
                setShowLeadForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              {t('crm.addLead')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('crm.customers')}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'leads'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('crm.leads')}
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'customers' ? (
        <CustomerList onEdit={handleEditCustomer} />
      ) : (
        <LeadList onEdit={handleEditLead} />
      )}

      {/* Forms */}
      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowCustomerForm(false);
            setEditingCustomer(null);
          }}
          onSave={() => {
            setShowCustomerForm(false);
            setEditingCustomer(null);
            fetchCustomers();
          }}
        />
      )}

      {showLeadForm && (
        <LeadForm
          lead={editingLead}
          onClose={() => {
            setShowLeadForm(false);
            setEditingLead(null);
          }}
          onSave={() => {
            setShowLeadForm(false);
            setEditingLead(null);
            fetchLeads();
          }}
        />
      )}
    </div>
  );
};

export default CRM;
