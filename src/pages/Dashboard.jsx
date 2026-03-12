// src/pages/Dashboard.jsx
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import { statusBadge, tipoBadge, formatVal, formatDate } from '../components/Badge'

const quickBtns = [
  { to: '/clientes/novo', icon: '👤', label: 'Cadastrar Cliente',       sub: 'Nome, CPF, RG, endereço',   hover: '#a78bfa' },
  { to: '/fabricas/nova', icon: '🏭', label: 'Cadastrar Fábrica',       sub: 'Nome, CNPJ, endereço',      hover: '#e07830' },
  { to: '/pedidos/novo',  icon: '🪪', label: 'Cadastrar Veículo e Placa', sub: 'Novo pedido de placa',   hover: '#f0c040' },
  { to: '/financeiro',    icon: '💰', label: 'Controle Financeiro',     sub: 'Clientes e fábrica',        hover: '#34d399' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: pedidos } = useCollection('pedidos')
  const { data: clientes } = useCollection('clientes')
  const { data: fabricas } = useCollection('fabricas')

  const stats = [
    { label: 'Total de Pedidos', value: pedidos.length,                                            color: 'var(--blue)' },
    { label: 'Pendentes',        value: pedidos.filter(p => p.status === 'Pendente').length,       color: 'var(--orange)' },
    { label: 'Em Produção',      value: pedidos.filter(p => p.status === 'Em Produção').length,    color: 'var(--accent)' },
    { label: 'Entregues',        value: pedidos.filter(p => p.status === 'Entregue').length,       color: 'var(--green)' },
    { label: 'Clientes',         value: clientes.length,                                            color: 'var(--purple)' },
    { label: 'Fábricas',         value: fabricas.length,                                            color: 'var(--accent2)' },
  ]

  return (
    <>
      <div className="page-header">
        <div className="page-title">Bem-vindo ao <span>PlacasFlow</span></div>
      </div>

      {/* Stats */}
      <div className="stats">
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `2px solid ${s.color}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '1rem' }}>
          ⚡ Acesso Rápido
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {quickBtns.map(b => (
            <button
              key={b.to}
              className="quick-btn"
              onClick={() => navigate(b.to)}
              onMouseOver={e => { e.currentTarget.style.borderColor = b.hover; e.currentTarget.style.background = `${b.hover}10` }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
            >
              <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{b.icon}</span>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>{b.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{b.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Pedidos Recentes</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/pedidos')}>
            Ver todos →
          </button>
        </div>
        {pedidos.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🪪</div>
            <p>Nenhum pedido ainda.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Placa</th><th>Tipo</th><th>Status</th><th>Valor</th><th>Data</th></tr>
            </thead>
            <tbody>
              {pedidos.slice(0, 6).map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/pedidos')}>
                  <td className="td-id">#{p.id.slice(-5)}</td>
                  <td>{p.nomeCliente}</td>
                  <td><b>{p.placa}</b></td>
                  <td>{tipoBadge(p.tipo)}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>{formatVal(p.valor)}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
