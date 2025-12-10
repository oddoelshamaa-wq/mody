import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import CustomerApp from './components/CustomerApp';
import AdminApp from './components/AdminApp';
import { UserRole } from './types';

const Main: React.FC = () => {
  const { userRole } = useApp();

  if (!userRole) {
    return <Login />;
  }

  if (userRole === UserRole.CUSTOMER) {
    return <CustomerApp />;
  }

  // Admin, Manager, Kitchen all share the Dashboard view but with different permissions handled inside
  return <AdminApp />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;