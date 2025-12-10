import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ChefHat, User, ShieldCheck, MonitorPlay } from 'lucide-react';

const Login: React.FC = () => {
  const { setUserRole } = useApp();

  const RoleButton = ({ role, icon: Icon, label, color }: { role: UserRole, icon: any, label: string, color: string }) => (
    <button 
      onClick={() => setUserRole(role)}
      className={`group relative overflow-hidden bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center gap-4 w-full`}
    >
      <div className={`p-4 rounded-full ${color} text-white transition-transform group-hover:scale-110 duration-300`}>
        <Icon className="w-8 h-8" />
      </div>
      <span className="font-bold text-lg text-gray-800">{label}</span>
      <div className={`absolute bottom-0 left-0 w-full h-1 ${color.replace('bg-', 'bg-')}`}></div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
            <div className="inline-block p-4 bg-orange-600 rounded-2xl shadow-lg mb-4 transform rotate-3">
                 <h1 className="text-5xl font-extrabold text-white">نجف</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">مرحباً بك في نظام مطعم نجف</h2>
            <p className="text-gray-500 mt-2">اختر طريقة الدخول للمتابعة</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <RoleButton role={UserRole.CUSTOMER} icon={User} label="طلب طعام (عميل)" color="bg-orange-500" />
          <RoleButton role={UserRole.KITCHEN} icon={ChefHat} label="المطبخ (استلام)" color="bg-blue-500" />
          <RoleButton role={UserRole.MANAGER} icon={MonitorPlay} label="مشرف صالة" color="bg-purple-500" />
          <RoleButton role={UserRole.ADMIN} icon={ShieldCheck} label="الإدارة العليا" color="bg-slate-800" />
        </div>
        
        <div className="mt-12 text-center text-gray-400 text-sm">
            &copy; 2024 Najaf Restaurant System. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;