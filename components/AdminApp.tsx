import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, OrderStatus, Product } from '../types';
import { generateMenuDescription, analyzeSalesPattern } from '../services/geminiService';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  LogOut, 
  Bell, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChefHat,
  Sparkles,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminApp: React.FC = () => {
  const { userRole, setUserRole, orders, updateOrderStatus, products, addProduct, playNotificationSound, markOrderAsSeen } = useApp();
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'ORDERS' | 'MENU'>('DASHBOARD');
  
  // Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, category: '', description: '', image: '' });
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Play sound on new pending orders if on Orders page
  useEffect(() => {
    const hasNew = orders.some(o => o.isNew && o.status === OrderStatus.PENDING);
    if (hasNew) {
      playNotificationSound();
    }
  }, [orders, playNotificationSound]);

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    preparing: orders.filter(o => o.status === OrderStatus.PREPARING).length,
  };

  // Prepare chart data (Sales by Item Category)
  const salesData = orders.flatMap(o => o.items).reduce((acc: any, item) => {
    const existing = acc.find((d: any) => d.name === item.category);
    if (existing) {
        existing.sales += item.quantity;
    } else {
        acc.push({ name: item.category, sales: item.quantity });
    }
    return acc;
  }, []);

  const handleAiDescription = async () => {
    if (!newProduct.name) return;
    setIsGeneratingDesc(true);
    const desc = await generateMenuDescription(newProduct.name);
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const summary = `Total Orders: ${stats.totalOrders}, Revenue: ${stats.totalRevenue}, Top Categories: ${salesData.map((d:any) => d.name).join(', ')}`;
    const result = await analyzeSalesPattern(summary);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      addProduct({
        id: Date.now().toString(),
        name: newProduct.name!,
        price: Number(newProduct.price),
        category: newProduct.category || 'عام',
        description: newProduct.description || '',
        image: newProduct.image || `https://picsum.photos/400/400?random=${Date.now()}`
      });
      setNewProduct({ name: '', price: 0, category: '', description: '', image: '' });
      alert('تم إضافة المنتج بنجاح');
    }
  };

  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const styles = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [OrderStatus.PREPARING]: 'bg-blue-100 text-blue-800 border-blue-200',
      [OrderStatus.READY]: 'bg-purple-100 text-purple-800 border-purple-200',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 border-green-200',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
    };
    const labels = {
      [OrderStatus.PENDING]: 'انتظار',
      [OrderStatus.PREPARING]: 'قيد التحضير',
      [OrderStatus.READY]: 'جاهز للتسليم',
      [OrderStatus.DELIVERED]: 'تم التسليم',
      [OrderStatus.CANCELLED]: 'ملغي',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">نجف</div>
          <div>
            <h1 className="font-bold text-lg">لوحة التحكم</h1>
            <p className="text-xs text-slate-400">{userRole === UserRole.ADMIN ? 'مدير النظام' : 'مشرف طلبات'}</p>
          </div>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          {userRole === UserRole.ADMIN && (
            <button onClick={() => setCurrentView('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${currentView === 'DASHBOARD' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span>الرئيسية</span>
            </button>
          )}
          
          <button onClick={() => setCurrentView('ORDERS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${currentView === 'ORDERS' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <ShoppingBag className="w-5 h-5" />
            <span className="flex-grow text-right">الطلبات</span>
            {stats.pending > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stats.pending}</span>}
          </button>

          {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
            <button onClick={() => setCurrentView('MENU')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${currentView === 'MENU' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                <Utensils className="w-5 h-5" />
                <span>قائمة الطعام</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setUserRole(null)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800 transition">
            <LogOut className="w-5 h-5" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto relative">
        {/* Mobile Header */}
        <header className="bg-white p-4 shadow-sm md:hidden flex justify-between items-center sticky top-0 z-20">
            <div className="font-bold text-xl text-gray-800">نجف - لوحة التحكم</div>
            <div className="flex gap-4">
                <button onClick={() => setCurrentView('ORDERS')} className="relative">
                    <Bell className="w-6 h-6 text-gray-600" />
                    {stats.pending > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                <button onClick={() => setUserRole(null)}><LogOut className="w-6 h-6 text-red-500" /></button>
            </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {currentView === 'DASHBOARD' && userRole === UserRole.ADMIN && (
                <div className="space-y-8 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-100 rounded-xl text-orange-600"><ShoppingBag className="w-6 h-6" /></div>
                                <span className="text-sm font-bold text-gray-400">اليوم</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalOrders}</h3>
                            <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-100 rounded-xl text-green-600"><DollarSign className="w-6 h-6" /></div>
                                <span className="text-sm font-bold text-gray-400">اليوم</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalRevenue} ر.س</h3>
                            <p className="text-gray-500 text-sm">إجمالي الدخل</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600"><Clock className="w-6 h-6" /></div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.pending}</h3>
                            <p className="text-gray-500 text-sm">طلبات في الانتظار</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><ChefHat className="w-6 h-6" /></div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.preparing}</h3>
                            <p className="text-gray-500 text-sm">قيد التحضير</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-6 text-gray-800">مبيعات الأصناف</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                                        <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    مساعد الذكاء الاصطناعي
                                </h3>
                                <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-100">
                                    {isAnalyzing ? 'جاري التحليل...' : 'تحليل الأداء'}
                                </button>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-xl text-gray-600 text-sm leading-relaxed min-h-[150px]">
                                {aiAnalysis || "اضغط على زر التحليل للحصول على نصائح ذكية لتحسين مبيعات مطعمك بناءً على البيانات الحالية."}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {currentView === 'ORDERS' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">سجل الطلبات</h2>
                    <div className="grid gap-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">لا توجد طلبات حتى الآن</div>
                        ) : (
                            orders.map(order => (
                                <div 
                                    key={order.id} 
                                    className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${order.isNew ? 'border-orange-400 shadow-md ring-1 ring-orange-200' : 'border-gray-100'}`}
                                    onClick={() => markOrderAsSeen(order.id)}
                                >
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-lg text-gray-900">طلب #{order.id.slice(-4)}</span>
                                                <StatusBadge status={order.status} />
                                                {order.isNew && <span className="bg-red-500 text-white text-[10px] px-2 rounded-full animate-pulse">جديد</span>}
                                            </div>
                                            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleTimeString('ar-SA')} - {order.customerName}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === OrderStatus.PENDING && (
                                                <>
                                                    <button onClick={() => updateOrderStatus(order.id, OrderStatus.CANCELLED)} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold">رفض</button>
                                                    <button onClick={() => updateOrderStatus(order.id, OrderStatus.PREPARING)} className="px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-bold shadow-lg shadow-orange-200">قبول وتحضير</button>
                                                </>
                                            )}
                                            {order.status === OrderStatus.PREPARING && (
                                                <button onClick={() => updateOrderStatus(order.id, OrderStatus.READY)} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold">جاهز للتوصيل</button>
                                            )}
                                            {order.status === OrderStatus.READY && (
                                                <button onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)} className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold">تم التسليم</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-bold text-gray-700 mb-2 text-sm">تفاصيل العميل</h4>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p className="flex gap-2"><span className="text-gray-400">الهاتف:</span> {order.customerPhone}</p>
                                                <p className="flex gap-2"><span className="text-gray-400">العنوان:</span> {order.customerAddress}</p>
                                                <p className="flex gap-2"><span className="text-gray-400">الدفع:</span> {order.paymentMethod === 'CASH' ? 'كاش' : 'شبكة'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-700 mb-2 text-sm">الأصناف</h4>
                                            <ul className="space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between text-sm border-b border-dashed border-gray-100 pb-1 last:border-0">
                                                        <span className="text-gray-800">{item.quantity}x {item.name}</span>
                                                        <span className="font-medium text-gray-600">{item.price * item.quantity} ر.س</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-3 pt-2 border-t flex justify-between font-bold text-gray-900">
                                                <span>الإجمالي</span>
                                                <span>{order.totalAmount} ر.س</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {currentView === 'MENU' && (
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">إضافة منتج جديد</h2>
                    <form onSubmit={handleAddProduct} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                                <input required type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" 
                                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ر.س)</label>
                                <input required type="number" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" 
                                    value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                            <select className="w-full border rounded-lg p-2.5 outline-none bg-white" 
                                value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                <option value="">اختر القسم</option>
                                <option value="برجر">برجر</option>
                                <option value="بيتزا">بيتزا</option>
                                <option value="مكرونة">مكرونة</option>
                                <option value="مشروبات">مشروبات</option>
                                <option value="حلى">حلى</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">الوصف</label>
                                <button 
                                    type="button" 
                                    onClick={handleAiDescription}
                                    disabled={!newProduct.name || isGeneratingDesc}
                                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    {isGeneratingDesc ? 'جاري الكتابة...' : 'اكتب لي وصف بالذكاء الاصطناعي'}
                                </button>
                            </div>
                            <textarea className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none h-24" 
                                value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة (اختياري)</label>
                             <input type="text" placeholder="https://..." className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none" 
                                    value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                        </div>

                        <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                            إضافة المنتج للقائمة
                        </button>
                    </form>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminApp;