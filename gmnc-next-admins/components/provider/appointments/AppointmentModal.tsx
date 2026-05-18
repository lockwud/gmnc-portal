'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DUMMY_PATIENTS = [
  { id: 'p1', fullName: 'Robert Wilson' },
  { id: 'p2', fullName: 'Jane Smith' },
  { id: 'p3', fullName: 'John Doe' },
  { id: 'p4', fullName: 'Maria Garcia' },
  { id: 'p5', fullName: 'David Lee' },
  { id: 'p6', fullName: 'Lisa Anderson' },
];

const DUMMY_PROVIDERS = [
  {
    id: 'sp1',
    fullName: 'Dr. Sarah Johnson',
    profession: 'Cardiologist',
    facilityName: 'Heart Health Clinic',
  },
  {
    id: 'sp2',
    fullName: 'Dr. Michael Brown',
    profession: 'General Practitioner',
    facilityName: 'City Medical Center',
  },
  {
    id: 'sp3',
    fullName: 'Dr. Emily Davis',
    profession: 'Physical Therapist',
    facilityName: 'Wellness Center',
  },
  {
    id: 'sp4',
    fullName: 'Dr. James Wilson',
    profession: 'Orthopedic Surgeon',
    facilityName: 'Bone & Joint Center',
  },
  {
    id: 'sp5',
    fullName: 'Dr. Patricia Moore',
    profession: 'Dentist',
    facilityName: 'Smile Dental',
  },
];

export default function AppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    patientId: '',
    providerId: '',
    appointmentDate: '',
    appointmentTime: '',
    reasonText: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.providerId) {
      newErrors.providerId = 'Provider is required';
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Date is required';
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Appointment created:', formData);
    setFormData({
      patientId: '',
      providerId: '',
      appointmentDate: '',
      appointmentTime: '',
      reasonText: '',
    });
    onSuccess();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (!isOpen) return null;

  const selectedPatient = DUMMY_PATIENTS.find(
    (p) => p.id === formData.patientId
  );
  const selectedProvider = DUMMY_PROVIDERS.find(
    (p) => p.id === formData.providerId
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Patient
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a patient</option>
              {DUMMY_PATIENTS.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
            )}
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Provider
            </label>
            <select
              name="providerId"
              value={formData.providerId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.providerId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a provider</option>
              {DUMMY_PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.fullName} - {provider.profession}
                </option>
              ))}
            </select>
            {errors.providerId && (
              <p className="text-red-500 text-sm mt-1">{errors.providerId}</p>
            )}
          </div>

          {/* Provider Details (Read-only) */}
          {selectedProvider && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Provider Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>
                  <p className="font-medium">Facility:</p>
                  <p>{selectedProvider.facilityName}</p>
                </div>
                <div>
                  <p className="font-medium">Profession:</p>
                  <p>{selectedProvider.profession}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.appointmentDate
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.appointmentDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.appointmentDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock size={16} className="inline mr-2" />
                Time
              </label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.appointmentTime
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.appointmentTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.appointmentTime}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Reason for Appointment
            </label>
            <textarea
              name="reasonText"
              value={formData.reasonText}
              onChange={handleChange}
              placeholder="Enter the reason for this appointment (optional)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Summary */}
          {formData.patientId && formData.providerId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Patient:</span>{' '}
                  {selectedPatient?.fullName}
                </p>
                <p>
                  <span className="font-medium">Provider:</span>{' '}
                  {selectedProvider?.fullName}
                </p>
                {formData.appointmentDate && (
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(formData.appointmentDate).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                )}
                {formData.appointmentTime && (
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {formData.appointmentTime}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}