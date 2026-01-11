import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ShiftForm from './ShiftForm';
import EmployeeForm from './EmployeeForm';

const localizer = momentLocalizer(moment);

const Scheduling: React.FC = () => {
  const { t } = useTranslation();
  const { shifts, employees, fetchShifts, fetchEmployees } = useScheduleStore();
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
    const start = moment().startOf('month').toISOString();
    const end = moment().endOf('month').toISOString();
    fetchShifts(start, end);
  }, [fetchShifts, fetchEmployees]);

  const events = shifts.map((shift) => {
    const employee = employees.find((e) => e.id === shift.employeeId);
    return {
      id: shift.id,
      title: employee?.name || 'Unknown',
      start: new Date(`${shift.date}T${shift.startTime}`),
      end: new Date(`${shift.date}T${shift.endTime}`),
    };
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('scheduling.title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmployeeForm(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Manage Employees
          </button>
          <button
            onClick={() => {
              setEditingShift(null);
              setShowShiftForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            {t('scheduling.addShift')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={(event) => {
            const shift = shifts.find((s) => s.id === event.id);
            if (shift) {
              setEditingShift(shift);
              setShowShiftForm(true);
            }
          }}
        />
      </div>

      {showShiftForm && (
        <ShiftForm
          shift={editingShift}
          onClose={() => {
            setShowShiftForm(false);
            setEditingShift(null);
          }}
          onSave={() => {
            setShowShiftForm(false);
            setEditingShift(null);
            const start = moment().startOf('month').toISOString();
            const end = moment().endOf('month').toISOString();
            fetchShifts(start, end);
          }}
        />
      )}

      {showEmployeeForm && (
        <EmployeeForm
          onClose={() => setShowEmployeeForm(false)}
          onSave={() => {
            setShowEmployeeForm(false);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
};

export default Scheduling;
