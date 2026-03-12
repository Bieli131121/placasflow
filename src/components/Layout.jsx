// src/components/Layout.jsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/',           icon: '📊', label: 'Dashboard',  end: true },
  { to: '/pedidos',    icon: '📋', label: 'Pedidos' },
  { to: '/clientes',   icon: '👥', label: 'Clientes' },
  { to: '/fabricas',   icon: '🏭', label: 'Fábricas' },
  { to: '/financeiro', icon: '💰', label: 'Financeiro' },
]

const bottomNavItems = [
  { to: '/',             icon: '📊', label: 'Início',    end: true },
  { to: '/pedidos',      icon: '📋', label: 'Pedidos' },
  { to: '/clientes',     icon: '👥', label: 'Clientes' },
  { to: '/financeiro',   icon: '💰', label: 'Financeiro' },
  { to: '/pedidos/novo', icon: '➕', label: 'Novo' },
]

export default function Layout() {
  const { user, userProfile, logout, updateNome, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [saving, setSaving] = useState(false)

  const displayName = userProfile?.nome || user?.displayName || user?.email?.split('@')[0] || 'Usuário'

  const handleLogout = async () => {
    await logout()
    toast.success('Até logo!')
    navigate('/login')
  }

  const openProfile = () => {
    setNovoNome(displayName)
    setShowProfile(true)
  }

  const handleSaveNome = async () => {
    if (!novoNome.trim()) return toast.error('Nome não pode ser vazio')
    setSaving(true)
    try {
      await updateNome(novoNome.trim())
      toast.success('Nome atualizado!')
      setShowProfile(false)
    } catch {
      toast.error('Erro ao salvar nome')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header>
        <div className="logo">Placas<span>Flow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={openProfile}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.35rem 0.75rem', cursor: 'pointer', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}
          >
            <span style={{ fontSize: '1rem' }}>{isAdmin ? '👑' : '👤'}</span>
            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <div className="layout">
        <nav className="sidebar">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 1.5rem' }} />
          <NavLink to="/pedidos/novo" className="nav-item"><span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>➕</span>Novo Pedido</NavLink>
          <NavLink to="/clientes/novo" className="nav-item"><span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>👤</span>Novo Cliente</NavLink>
          <NavLink to="/fabricas/nova" className="nav-item"><span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>🔧</span>Nova Fábrica</NavLink>
          {isAdmin && (
            <>
              <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 1.5rem' }} />
              <NavLink to="/admin" className="nav-item">
                <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>👑</span>Admin
              </NavLink>
            </>
          )}
        </nav>

        <main>
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {bottomNavItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
              <span className="bnav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{isAdmin ? '👑 Meu Perfil (Admin)' : '👤 Meu Perfil'}</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowProfile(false)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="detail-item">
                <div className="detail-label">E-mail</div>
                <div className="detail-value">{user?.email}</div>
              </div>
              {isAdmin && (
                <div style={{ background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--accent)' }}>
                  👑 Você é o administrador do sistema
                </div>
              )}
              <div className="form-group">
                <label>Nome de exibição</label>
                <input
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  placeholder="Seu nome"
                  onKeyDown={e => e.key === 'Enter' && handleSaveNome()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowProfile(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveNome} disabled={saving}>
                {saving ? 'Salvando...' : '💾 Salvar Nome'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
