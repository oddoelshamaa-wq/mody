import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Plus, Minus, X, CreditCard, Banknote, MapPin, ChefHat } from 'lucide-react';

const CustomerApp: React.FC = () => {
  const { products, cart, addToCart, removeFromCart, updateCartItemQuantity, placeOrder } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState<'MENU' | 'CHECKOUT'>('MENU');
  
  // Checkout Form State
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', payment: 'CASH' as 'CASH' | 'CARD' });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder(formData);
    setOrderPlaced(true);
    // ---------------------------------------------------------
    // التحكم في مدة عرض رسالة النجاح (3000 = 3 ثواني)
    // ---------------------------------------------------------
    setTimeout(() => {
        setOrderPlaced(false);
        setView('MENU');
        setIsCartOpen(false);
        setFormData({ name: '', phone: '', address: '', payment: 'CASH' });
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
           <ChefHat className="text-white w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح!</h2>
        <p className="text-gray-600">شكراً لك، مطعم نجف سيقوم بتحضير طعامك اللذيذ فوراً.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* 
         ---------------------------------------------------------
         Header Section (رأس الصفحة)
         غير اسم المطعم هنا
         ---------------------------------------------------------
      */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 space-x-reverse cursor-pointer" onClick={() => setView('MENU')}>
            {/* Logo Box */}
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              نجف
            </div>
            {/* Brand Name */}
            <h1 className="text-2xl font-bold text-gray-800">مطعم نجف</h1>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-orange-50 rounded-full transition-colors"
          >
            <ShoppingCart className="w-7 h-7 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === 'MENU' ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {products.map(product => (
               <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col">
                 <div className="h-48 overflow-hidden relative group">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <span className="text-white font-bold text-sm bg-orange-500 px-3 py-1 rounded-full">{product.category}</span>
                    </div>
                 </div>
                 <div className="p-5 flex flex-col flex-grow">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                     <span className="font-bold text-orange-600 text-lg">{product.price} ر.س</span>
                   </div>
                   <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
                   {/* Add to Cart Button */}
                   <button 
                     onClick={() => addToCart(product)}
                     className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium active:scale-95 transform duration-100"
                   >
                     <Plus className="w-4 h-4" />
                     إضافة للسلة
                   </button>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">إتمام الطلب</h2>
            <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input required type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <input required type="tel" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالتفصيل</label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
                        <textarea required className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-orange-500 outline-none transition" rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">طريقة الدفع</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setFormData({...formData, payment: 'CASH'})}
                            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.payment === 'CASH' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}
                        >
                            <Banknote className="w-6 h-6" />
                            <span className="font-medium">كاش عند الاستلام</span>
                        </div>
                        <div 
                            onClick={() => setFormData({...formData, payment: 'CARD'})}
                            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.payment === 'CARD' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}
                        >
                            <CreditCard className="w-6 h-6" />
                            <span className="font-medium">شبكة / مدى</span>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between text-lg font-bold mb-4">
                        <span>الإجمالي</span>
                        <span>{cartTotal} ر.س</span>
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setView('MENU')} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">عودة للقائمة</button>
                        <button type="submit" className="flex-[2] py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 font-bold">تأكيد الطلب</button>
                    </div>
                </div>
            </form>
          </div>
        )}
      </main>

      {/* Cart Sidebar/Modal Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                سلة المشتريات
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBagIcon />
                  <p className="mt-4">السلة فارغة، أضف بعض الطعام اللذيذ!</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border shadow-sm">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                        <span className="font-bold text-orange-600 text-sm">{item.price * item.quantity} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                         <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                            <button onClick={() => updateCartItemQuantity(item.id, -1)} className="p-1 hover:text-red-500 disabled:opacity-50"><Minus className="w-4 h-4" /></button>
                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateCartItemQuantity(item.id, 1)} className="p-1 hover:text-green-500"><Plus className="w-4 h-4" /></button>
                         </div>
                         <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs hover:underline">حذف</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">المجموع الكلي</span>
                <span className="text-2xl font-bold text-gray-900">{cartTotal} ر.س</span>
              </div>
              <button 
                disabled={cart.length === 0}
                onClick={() => {
                  setIsCartOpen(false);
                  setView('CHECKOUT');
                }}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                إتمام الشراء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShoppingBagIcon = () => (
  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

export default CustomerApp;