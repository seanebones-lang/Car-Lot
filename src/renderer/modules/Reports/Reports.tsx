import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCarStore } from '../../stores/useCarStore';
import { useSaleStore } from '../../stores/useSaleStore';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import dayjs from 'dayjs';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { cars, fetchCars } = useCarStore();
  const { sales, fetchSales } = useSaleStore();
  const { leads, fetchLeads } = useCustomerStore();
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  useEffect(() => {
    fetchCars();
    fetchSales();
    fetchLeads();
  }, [fetchCars, fetchSales, fetchLeads]);

  const totalInventoryValue = cars
    .filter((c) => c.status === 'available')
    .reduce((sum, car) => sum + car.price, 0);

  const salesThisMonth = sales.filter((sale: any) => {
    const saleDate = dayjs(sale.saleDate);
    return saleDate.isAfter(dayjs(dateRange.start)) && saleDate.isBefore(dayjs(dateRange.end).add(1, 'day'));
  });

  const totalSales = salesThisMonth.reduce((sum: number, sale: any) => sum + sale.price + sale.tax, 0);
  const activeLeads = leads.filter((l) => l.status !== 'converted' && l.status !== 'lost').length;

  const salesByMonth = sales.reduce((acc: any, sale: any) => {
    const month = dayjs(sale.saleDate).format('MMM YYYY');
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += sale.price + sale.tax;
    return acc;
  }, {});

  const salesChartData = Object.entries(salesByMonth).map(([month, total]) => ({
    month,
    total: Number(total),
  }));

  const inventoryByMake = cars.reduce((acc: any, car) => {
    if (!acc[car.make]) {
      acc[car.make] = 0;
    }
    acc[car.make]++;
    return acc;
  }, {});

  const inventoryChartData = Object.entries(inventoryByMake).map(([make, count]) => ({
    make,
    count: Number(count),
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('reports.title')}</h1>

      {/* Date Range Filter */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t('reports.totalInventory')}</h3>
          <p className="text-3xl font-bold text-blue-600">${totalInventoryValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t('reports.salesThisMonth')}</h3>
          <p className="text-3xl font-bold text-green-600">${totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t('reports.activeLeads')}</h3>
          <p className="text-3xl font-bold text-purple-600">{activeLeads}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Inventory by Make</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="make" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
