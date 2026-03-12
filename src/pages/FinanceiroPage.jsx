// src/pages/FinanceiroPage.jsx
import { useState, useMemo } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { pagCliStatusBadge, pagFabStatusBadge, formatVal, formatDate } from '../components/Badge'
import toast from 'react-hot-toast'

const TIPOS = ['Automóvel', 'Motocicleta', 'Reboque']

const parseValor = (v) => {
  if (!v && v !== 0) return 0
  const s = String(v).trim()
  if (s.includes(',')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
  return parseFloat(s) || 0
}

const FILTROS_TEMPO = [
  { label: 'Tudo', dias: null },
  { label: '7 dias', dias: 7 },
  { label: '15 dias', dias: 15 },
  { label: '30 dias', dias: 30 },
]

export default function FinanceiroPage() {
  const { data: pedidos, update } = useCollection('pedidos')
  const { data: fabricas } = useCollection('fabricas')
  const [tab, setTab] = useState('lucro')
  const [filtroDias, setFiltroDias] = useState(null)
  const [searchCli, setSearchCli] = useState('')
  const [filterCli, setFilterCli] = useState('')
  const [filterTipoCli, setFilterTipoCli] = useState('')
  const [searchFab, setSearchFab] = useState('')
  const [filterFab, setFilterFab] = useState('')
  const [editId, setEditId] = useState(null)
  const [pagCliForm, setPagCliForm] = useState({ pagamento: 'Aguardando', forma: 'Pix' })
  const [pagFabForm, setPagFabForm] = useState({ pagFabStatus: 'A pagar', pagFabValor: '', pagFabForma: 'Pix' })
  const [showPagCliModal, setShowPagCliModal] = useState(false)
  const [showPagFabModal, setShowPagFabModal] = useState(false)

  // ── Pedidos filtrados por tempo ──
  const pedidosFiltrados = useMemo(() => {
    if (!filtroDias) return pedidos
    const limite = new Date()
    limite.setDate(limite.getDate() - filtroDias)
    return pedidos.filter(p => {
      const data = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt)
      return data >= limite
    })
  }, [pedidos, filtroDias])

  // ── Cálculos dos cards ──
  const totalRecebido  = pedidosFiltrados.filter(p => p.pagamento === 'Pago').reduce((s, p) => s + parseValor(p.valor), 0)
  const totalAReceber  = pedidosFiltrados.filter(p => p.pagamento !== 'Pago').reduce((s, p) => s + parseValor(p.valor), 0)
  const totalPagoFab   = pedidosFiltrados.filter(p => p.pagFabStatus === 'Pago').reduce((s, p) => s + parseValor(p.pagFabValor), 0)
  const totalAPagarFab = pedidosFiltrados.filter(p => p.pagFabStatus !== 'Pago').reduce((s, p) => s + parseValor(p.pagFabValor), 0)

  // Lucro Realizado: cliente pagou E fábrica foi paga
  const lucroRealizado = pedidosFiltrados
    .filter(p => p.pagamento === 'Pago' && p.pagFabStatus === 'Pago')
    .reduce((s, p) => s + (parseValor(p.valor) - parseValor(p.pagFabValor)), 0)

  // Lucro Projetado: todos os pedidos do período
  const lucroProjetado = pedidosFiltrados.reduce((s, p) => s + (parseValor(p.valor) - parseValor(p.pagFabValor)), 0)

  // ── Lucro por tipo ──
  const lucroPorTipo = TIPOS.map(tipo => {
    const deste = pedidosFiltrados.filter(p => p.tipo === tipo)
    const recebido = deste.reduce((s, p) => s + parseValor(p.valor), 0)
    const pagoFab  = deste.reduce((s, p) => s + parseValor(p.pagFabValor), 0)
    return { tipo, qtd: deste.length, recebido, pagoFab, lucro: recebido - pagoFab }
  })

  // ── Lucro por pedido ──
  const pedidosComLucro = pedidosFiltrados.map(p => ({
    ...p,
    lucro: parseValor(p.valor) - parseValor(p.pagFabValor)
  }))

  // ── Listas filtradas ──
  const listCli = pedidosFiltrados.filter(p => {
    const q = searchCli.toLowerCase()
    const match = !q || [p.nomeCliente, p.placa, p.cpf].some(x => (x || '').toLowerCase().includes(q))
    const statusOk = !filterCli || (p.pagamento || 'Aguardando') === filterCli
    const tipoOk   = !filterTipoCli || (p.tipo || '') === filterTipoCli
    return match && statusOk && tipoOk
  })

  const listFab = pedidosFiltrados.filter(p => {
    const q = searchFab.toLowerCase()
    const fab = fabricas.find(f => f.id === p.fabricaId)
    const match = !q || [p.nomeCliente, p.placa, fab?.nome || ''].some(x => (x || '').toLowerCase().includes(q))
    return match && (!filterFab || (p.pagFabStatus || 'A pagar') === filterFab)
  })

  const abrirPagCli = (p) => { setEditId(p.id); setPagCliForm({ pagamento: p.pagamento || 'Aguardando', forma: p.forma || 'Pix' }); setShowPagCliModal(true) }
  const salvarPagCli = async () => { await update(editId, pagCliForm); setShowPagCliModal(false); toast.success('Pagamento do cliente atualizado!') }
  const marcarPagoCli = async (id) => { await update(id, { pagamento: 'Pago' }); toast.success('Marcado como recebido!') }

  const abrirPagFab = (p) => { setEditId(p.id); setPagFabForm({ pagFabStatus: p.pagFabStatus || 'A pagar', pagFabValor: p.pagFabValor || '', pagFabForma: p.pagFabForma || 'Pix' }); setShowPagFabModal(true) }
  const salvarPagFab = async () => { await update(editId, pagFabForm); setShowPagFabModal(false); toast.success('Pagamento à fábrica atualizado!') }
  const marcarPagoFab = async (id) => { await update(id, { pagFabStatus: 'Pago' }); toast.success('Pagamento à fábrica confirmado!') }

  const tabStyle = (key) => ({
    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem',
    padding: '0.7rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer',
    color: tab === key ? 'var(--accent)' : 'var(--muted)',
    borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
    marginBottom: -1, transition: 'all 0.15s'
  })

  const btnFiltroStyle = (dias) => ({
    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem',
    padding: '0.4rem 0.9rem', border: '1px solid', borderRadius: '999px',
    cursor: 'pointer', transition: 'all 0.15s',
    background: filtroDias === dias ? 'var(--accent)' : 'transparent',
    color: filtroDias === dias ? '#fff' : 'var(--muted)',
    borderColor: filtroDias === dias ? 'var(--accent)' : 'var(--border)',
  })

  return (
    <>
      <div className="page-header">
        <div className="page-title">Controle <span>Financeiro</span></div>
      </div>

      {/* Filtro de tempo */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, marginRight: '0.3rem' }}>📅 Período:</span>
        {FILTROS_TEMPO.map(f => (
          <button key={String(f.dias)} style={btnFiltroStyle(f.dias)} onClick={() => setFiltroDias(f.dias)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards resumo */}
      <div className="stats">
        {[
          { label: '💰 Recebido (Clientes)',  value: totalRecebido,  color: 'var(--green)'  },
          { label: '⏳ A Receber (Clientes)', value: totalAReceber,  color: 'var(--orange)' },
          { label: '✅ Pago (Fábricas)',      value: totalPagoFab,   color: 'var(--blue)'   },
          { label: '🔴 A Pagar (Fábricas)',   value: totalAPagarFab, color: 'var(--red)'    },
          { label: '📈 Lucro Realizado',      value: lucroRealizado, color: lucroRealizado >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: '🔮 Lucro Projetado',      value: lucroProjetado, color: lucroProjetado >= 0 ? 'var(--purple)' : 'var(--red)' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ borderTop: `2px solid ${c.color}` }}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color: c.color, fontSize: '1.2rem' }}>{formatVal(c.value)}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          ['lucro',    '📈 Lucro'],
          ['clientes', '👤 Recebimentos'],
          ['fabrica',  '🏭 Pagamentos Fábrica'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={tabStyle(key)}>{label}</button>
        ))}
      </div>

      {/* ── ABA LUCRO ── */}
      {tab === 'lucro' && (
        <>
          {/* Cards lucro destaque */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ borderTop: '2px solid var(--green)', padding: '1.2rem' }}>
              <div className="stat-label">✅ Lucro Realizado</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: lucroRealizado >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'Syne, sans-serif' }}>{formatVal(lucroRealizado)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Clientes pagos + fábricas pagas</div>
            </div>
            <div className="stat-card" style={{ borderTop: '2px solid var(--purple)', padding: '1.2rem' }}>
              <div className="stat-label">🔮 Lucro Projetado</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: lucroProjetado >= 0 ? 'var(--purple)' : 'var(--red)', fontFamily: 'Syne, sans-serif' }}>{formatVal(lucroProjetado)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Todos os pedidos do período</div>
            </div>
          </div>

          {/* Lucro por tipo */}
          <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
            <div className="table-toolbar">
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>📊 Lucro por Tipo de Placa</span>
            </div>
            <table>
              <thead>
                <tr><th>Tipo</th><th>Qtd</th><th>Faturado</th><th>Pago à Fábrica</th><th>Lucro</th><th>Lucro Médio / Placa</th></tr>
              </thead>
              <tbody>
                {lucroPorTipo.map(r => (
                  <tr key={r.tipo}>
                    <td style={{ fontWeight: 600 }}>{r.tipo}</td>
                    <td><span className="badge badge-mercosul">{r.qtd}</span></td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>{formatVal(r.recebido)}</td>
                    <td style={{ color: 'var(--blue)', fontWeight: 600 }}>{formatVal(r.pagoFab)}</td>
                    <td style={{ color: r.lucro >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{formatVal(r.lucro)}</td>
                    <td style={{ color: 'var(--muted)' }}>{r.qtd > 0 ? formatVal(r.lucro / r.qtd) : '—'}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700 }}>
                  <td>TOTAL</td>
                  <td><span className="badge badge-mercosul">{pedidosFiltrados.length}</span></td>
                  <td style={{ color: 'var(--green)' }}>{formatVal(lucroPorTipo.reduce((s, r) => s + r.recebido, 0))}</td>
                  <td style={{ color: 'var(--blue)' }}>{formatVal(lucroPorTipo.reduce((s, r) => s + r.pagoFab, 0))}</td>
                  <td style={{ color: lucroProjetado >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatVal(lucroProjetado)}</td>
                  <td style={{ color: 'var(--muted)' }}>{pedidosFiltrados.length > 0 ? formatVal(lucroProjetado / pedidosFiltrados.length) : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lucro por pedido */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>🧾 Lucro por Pedido</span>
            </div>
            <table>
              <thead>
                <tr><th>Pedido</th><th>Cliente</th><th>Placa</th><th>Tipo</th><th>Valor Cliente</th><th>Valor Fábrica</th><th>Lucro</th></tr>
              </thead>
              <tbody>
                {pedidosComLucro.map(p => (
                  <tr key={p.id}>
                    <td className="td-id">#{p.id.slice(-5)}</td>
                    <td style={{ fontWeight: 500 }}>{p.nomeCliente}</td>
                    <td><b>{p.placa}</b></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{p.tipo}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>{formatVal(p.valor)}</td>
                    <td style={{ color: 'var(--blue)', fontWeight: 600 }}>{p.pagFabValor ? formatVal(p.pagFabValor) : '—'}</td>
                    <td style={{ color: p.lucro >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{formatVal(p.lucro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pedidosComLucro.length === 0 && (
              <div className="empty"><div className="empty-icon">📊</div><p>Nenhum pedido no período selecionado.</p></div>
            )}
          </div>
        </>
      )}

      {/* ── ABA CLIENTES ── */}
      {tab === 'clientes' && (
        <div className="table-wrap">
          <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <input className="search-input" placeholder="🔍  Buscar por placa, cliente..." value={searchCli} onChange={e => setSearchCli(e.target.value)} />
            <select className="filter-select" value={filterCli} onChange={e => setFilterCli(e.target.value)}>
              <option value="">Todos os status</option>
              {['Aguardando', 'Pago', 'Parcelado'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={filterTipoCli} onChange={e => setFilterTipoCli(e.target.value)}>
              <option value="">Todos os tipos</option>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {listCli.length === 0 ? (
            <div className="empty"><div className="empty-icon">💳</div><p>Nenhum pedido encontrado.</p></div>
          ) : (
            <table>
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Placa</th><th>Valor</th><th>Recebimento</th><th>Ação</th></tr></thead>
              <tbody>
                {listCli.map(p => (
                  <tr key={p.id}>
                    <td className="td-id">#{p.id.slice(-5)}</td>
                    <td><div style={{ fontWeight: 500 }}>{p.nomeCliente}</div><div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{formatDate(p.createdAt)}</div></td>
                    <td><b>{p.placa}</b><div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{p.tipo}</div></td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatVal(p.valor)}</td>
                    <td>{pagCliStatusBadge(p.pagamento || 'Aguardando')}<div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{p.forma}</div></td>
                    <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirPagCli(p)}>✏️ Alterar</button>
                      {(p.pagamento || 'Aguardando') !== 'Pago' && (
                        <button className="btn btn-sm" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.3)' }} onClick={() => marcarPagoCli(p.id)}>✅ Pago</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ABA FÁBRICA ── */}
      {tab === 'fabrica' && (
        <div className="table-wrap">
          <div className="table-toolbar">
            <input className="search-input" placeholder="🔍  Buscar por placa, cliente, fábrica..." value={searchFab} onChange={e => setSearchFab(e.target.value)} />
            <select className="filter-select" value={filterFab} onChange={e => setFilterFab(e.target.value)}>
              <option value="">Todos</option>
              {['A pagar', 'Pago'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {listFab.length === 0 ? (
            <div className="empty"><div className="empty-icon">🏭</div><p>Nenhum pedido encontrado.</p></div>
          ) : (
            <table>
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Placa</th><th>Fábrica</th><th>Valor Fábrica</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                {listFab.map(p => {
                  const fab = fabricas.find(f => f.id === p.fabricaId)
                  return (
                    <tr key={p.id}>
                      <td className="td-id">#{p.id.slice(-5)}</td>
                      <td><div style={{ fontWeight: 500 }}>{p.nomeCliente}</div><div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{formatDate(p.createdAt)}</div></td>
                      <td><b>{p.placa}</b></td>
                      <td style={{ fontSize: '0.85rem' }}>{fab?.nome || '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{p.pagFabValor ? formatVal(p.pagFabValor) : '—'}</td>
                      <td>{pagFabStatusBadge(p.pagFabStatus || 'A pagar')}<div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{p.pagFabForma}</div></td>
                      <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirPagFab(p)}>✏️ Alterar</button>
                        {(p.pagFabStatus || 'A pagar') !== 'Pago' && (
                          <button className="btn btn-sm" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.3)' }} onClick={() => marcarPagoFab(p.id)}>✅ Pago</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Pag Cliente */}
      {showPagCliModal && (
        <div className="modal-overlay" onClick={() => setShowPagCliModal(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">💳 Recebimento do Cliente</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowPagCliModal(false)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Status do Recebimento</label>
                <select value={pagCliForm.pagamento} onChange={e => setPagCliForm(f => ({ ...f, pagamento: e.target.value }))}>
                  {['Aguardando', 'Pago', 'Parcelado'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select value={pagCliForm.forma} onChange={e => setPagCliForm(f => ({ ...f, forma: e.target.value }))}>
                  {['Pix', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'Boleto'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPagCliModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarPagCli}>✅ Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pag Fábrica */}
      {showPagFabModal && (
        <div className="modal-overlay" onClick={() => setShowPagFabModal(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🏭 Pagamento à Fábrica</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowPagFabModal(false)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Status</label>
                <select value={pagFabForm.pagFabStatus} onChange={e => setPagFabForm(f => ({ ...f, pagFabStatus: e.target.value }))}>
                  {['A pagar', 'Pago'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Valor pago à fábrica (R$)</label>
                <input type="number" placeholder="0,00" value={pagFabForm.pagFabValor} onChange={e => setPagFabForm(f => ({ ...f, pagFabValor: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select value={pagFabForm.pagFabForma} onChange={e => setPagFabForm(f => ({ ...f, pagFabForma: e.target.value }))}>
                  {['Pix', 'Transferência', 'Dinheiro', 'Boleto'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPagFabModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarPagFab}>✅ Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
