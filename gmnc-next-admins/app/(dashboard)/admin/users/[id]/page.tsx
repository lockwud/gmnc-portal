"use client";

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Clock, 
  History, 
  User as UserIcon,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Activity,
  Key
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// Mock function to get user by ID
const getUserById = (id: string) => ({
  id,
  name: 'Dr. Louisa Parker',
  email: 'louisa@example.com',
  phone: '+233 24 555 0101',
  role: 'provider',
  status: 'Active',
  address: '123 Medical Drive, Accra, Ghana',
  joined: 'Oct 12, 2023',
  lastLogin: '2 hours ago',
  bio: 'Specialist Neurologist with over 10 years of experience in pediatric rehabilitation and brain health.',
  permissions: ['appointment.read', 'appointment.write', 'telehealth.start', 'patient.read'],
  activity: [
    { event: 'Logged in', time: '2 hours ago', ip: '192.168.1.1' },
    { event: 'Updated patient record', time: '5 hours ago', ip: '192.168.1.1' },
    { event: 'Started telehealth session', time: '1 day ago', ip: '192.168.1.5' },
    { event: 'Password changed', time: '1 month ago', ip: '10.0.0.4' },
  ]
});

function UserDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitiallyEditing = searchParams.get('edit') === 'true';
  
  const [user, setUser] = useState(getUserById(id as string));
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSave = () => {
    toast.success("User profile updated successfully");
    setIsEditing(false);
  };

  const handleDelete = () => {
    toast.success("User deleted successfully");
    router.push('/admin/users');
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="max-w-6xl mx-auto pb-20">
        <ConfirmDialog 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete User Account"
          description={`Are you sure you want to permanently delete the account for ${user.name}? This action is irreversible.`}
        />

        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to User List
          </button>
          
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <Button 
                  variant="gray" 
                  className="h-11 rounded-xl font-bold border border-slate-100 bg-white gap-2 hover:text-rose-600"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 size={18} />
                  Delete Account
                </Button>
                <Button 
                  className="h-11 rounded-xl font-bold bg-brand hover:bg-brand-hover text-white border-none gap-2 shadow-lg shadow-brand/20"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} />
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="gray" 
                  className="h-11 rounded-xl font-bold border border-slate-100 bg-white"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-2"
                  onClick={handleSave}
                >
                  <CheckCircle2 size={18} />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[40px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden ring-1 ring-slate-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 p-2 rounded-2xl border-4 border-white shadow-lg",
                  user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                )}>
                  <Shield size={16} className="text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.name}</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">{user.role}</p>
              
              <div className="flex gap-2 mt-6">
                <Badge color={user.status === 'Active' ? 'green' : 'gray'} className="px-3 py-1 rounded-lg">
                  {user.status}
                </Badge>
                <Badge color="gray" className="px-3 py-1 rounded-lg border-slate-100 text-slate-400 font-bold">
                  ID: {user.id}
                </Badge>
              </div>

              <div className="w-full h-px bg-slate-50 my-8" />

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-left">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail size={18} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-slate-900">{user.phone}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-slate-900">Accra, Ghana</p>
                   </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock size={18} className="text-emerald-500" />
                Session Information
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</span>
                   <span className="text-xs font-bold text-slate-900">{user.joined}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Login</span>
                   <span className="text-xs font-bold text-slate-900">{user.lastLogin}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Device</span>
                    <Badge color="gray" className="bg-slate-50 border-none font-bold">Chrome / Win11</Badge>
                </div>
              </div>
              <Button variant="gray" className="w-full mt-8 h-12 rounded-2xl border border-slate-100 text-slate-500 font-bold hover:text-rose-600 gap-2">
                 <Key size={18} />
                 Reset Password
              </Button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Form / Profile Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm"
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                 <UserIcon className="text-emerald-500" />
                 {isEditing ? 'Edit User Details' : 'General Information'}
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Full Name">
                    <Input defaultValue={user.name} disabled={!isEditing} className="h-12 rounded-2xl bg-slate-50/50" />
                  </FormField>
                  <FormField label="Email Address">
                    <Input defaultValue={user.email} disabled={!isEditing} className="h-12 rounded-2xl bg-slate-50/50" />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Phone Number">
                    <Input defaultValue={user.phone} disabled={!isEditing} className="h-12 rounded-2xl bg-slate-50/50" />
                  </FormField>
                  <Select 
                    label="Account Role" 
                    disabled={!isEditing}
                    defaultValue={user.role}
                    options={[
                      { label: 'Provider', value: 'provider' },
                      { label: 'Admin', value: 'admin' },
                      { label: 'Caregiver', value: 'caregiver' },
                    ]}
                  />
                </div>
                <FormField label="Personal Bio / Clinical Note">
                   <textarea 
                    disabled={!isEditing}
                    defaultValue={user.bio}
                    className="w-full min-h-[120px] p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white outline-none transition-all disabled:opacity-50"
                   />
                </FormField>
              </div>
            </motion.div>

            {/* Permissions Matrix */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm"
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Shield className="text-emerald-500" />
                   Assigned Permissions
                 </div>
                 <Badge color="green" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold">{user.permissions.length} Enabled</Badge>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.permissions.map((p) => (
                   <div key={p} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                      <span className="text-sm font-bold text-slate-700 font-mono">{p}</span>
                    </div>
                    {isEditing && (
                      <button className="text-rose-400 hover:text-rose-600 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-emerald-500 hover:text-emerald-500 transition-all">
                    + Add Custom Permission
                  </button>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm"
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                 <History className="text-emerald-500" />
                 Recent Activity Audit
              </h3>
              
              <div className="space-y-6">
                {user.activity.map((a, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== user.activity.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-slate-50" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 z-10">
                       <Activity size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <p className="text-sm font-bold text-slate-900 tracking-tight">{a.event}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Source IP: <span className="text-slate-900 font-mono">{a.ip}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function UserDetailPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <UserDetailContent />
    </React.Suspense>
  );
}

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
