// src/App.jsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import PedidosPage from './pages/PedidosPage'
import NovoPedidoPage from './pages/NovoPedidoPage'
import ClientesPage from './pages/ClientesPage'
import NovoClientePage from './pages/NovoClientePage'
import FabricasPage from './pages/FabricasPage'
import NovaFabricaPage from './pages/NovaFabricaPage'
import FinanceiroPage from './pages/FinanceiroPage'
import AdminPage from './pages/AdminPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="pedidos/novo" element={<NovoPedidoPage />} />
        <Route path="pedidos/editar" element={<NovoPedidoPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/novo" element={<NovoClientePage />} />
        <Route path="fabricas" element={<FabricasPage />} />
        <Route path="fabricas/nova" element={<NovaFabricaPage />} />
        <Route path="financeiro" element={<FinanceiroPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1c2030',
              color: '#e8eaf0',
              border: '1px solid #272b3a',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
      </HashRouter>
    </AuthProvider>
  )
}
