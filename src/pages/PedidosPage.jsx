// src/pages/PedidosPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import { statusBadge, tipoBadge, pagCliStatusBadge, pagFabStatusBadge, formatVal, formatDate } from '../components/Badge'
import toast from 'react-hot-toast'

export default function PedidosPage() {
  const navigate = useNavigate()
  const { data: pedidos, update, remove } = useCollection('pedidos')
  const { data: fabricas } = useCollection('fabricas')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [selected, setSelected] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPagCliModal, setShowPagCliModal] = useState(false)
  const [showPagFabModal, setShowPagFabModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [pagCliForm, setPagCliForm] = useState({ pagamento: '', forma: '' })
  const [pagFabForm, setPagFabForm] = useState({ pagFabStatus: '', pagFabValor: '', pagFabForma: '' })

  const list = pedidos.filter(p => {
    const q = search.toLowerCase()
    const match = !q || [p.nomeCliente, p.placa, p.cpf, p.modelo].some(x => (x || '').toLowerCase().includes(q))
    return match && (!filterStatus || p.status === filterStatus) && (!filterTipo || p.tipo === filterTipo)
  })

  const handleDelete = async (id) => {
    if (!confirm('Excluir este pedido?')) return
    await remove(id)
    setSelected(null)
    toast.success('Pedido excluído.')
  }

  const handleUpdateStatus = async () => {
    await update(selected.id, { status: newStatus })
    setShowStatusModal(false)
    setSelected(prev => ({ ...prev, status: newStatus }))
    toast.success('Status atualizado!')
  }

  const handleSavePagCli = async () => {
    await update(selected.id, pagCliForm)
    setShowPagCliModal(false)
    setSelected(prev => ({ ...prev, ...pagCliForm }))
    toast.success('Pagamento do cliente atualizado!')
  }

  const handleSavePagFab = async () => {
    await update(selected.id, pagFabForm)
    setShowPagFabModal(false)
    setSelected(prev => ({ ...prev, ...pagFabForm }))
    toast.success('Pagamento à fábrica atualizado!')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Todos os <span>Pedidos</span></div>
        <button className="btn btn-primary" onClick={() => navigate('/pedidos/novo')}>➕ Novo Pedido</button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input className="search-input" placeholder="🔍  Buscar por cliente, placa, CPF..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {['Pendente','Em Produção','Entregue','Cancelado'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
            <option value="">Todos os tipos</option>
            {['Mercosul','Moto','Especial','Colecionador'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {list.length === 0 ? (
          <div className="empty"><div className="empty-icon">🔍</div><p>Nenhum pedido encontrado.</p></div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Placa</th><th>Tipo</th><th>Status</th><th>Valor</th><th>Cliente Pagou?</th><th>Fábrica Paga?</th><th>Data</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}>
                  <td className="td-id">#{p.id.slice(-5)}</td>
                  <td><div style={{ fontWeight: 500 }}>{p.nomeCliente}</div><div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{p.cpf}</div></td>
                  <td><b>{p.placa}</b><div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{p.modelo}</div></td>
                  <td>{tipoBadge(p.tipo)}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>{formatVal(p.valor)}</td>
                  <td>{pagCliStatusBadge(p.pagamento || 'Aguardando')}</td>
                  <td>{pagFabStatusBadge(p.pagFabStatus || 'A pagar')}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{formatDate(p.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(p)}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DETALHE */}
      {selected && !showStatusModal && !showPagCliModal && !showPagFabModal && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Pedido #{selected.id.slice(-5)} — {selected.nomeCliente}</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="detail-grid">
                {[
                  ['Status', statusBadge(selected.status)],
                  ['Tipo de Placa', tipoBadge(selected.tipo)],
                  ['Cliente', selected.nomeCliente],
                  ['CPF / CNPJ', selected.cpf || '—'],
                  ['Telefone', selected.tel || '—'],
                  ['Responsável', selected.responsavel || '—'],
                  ['Placa', <b style={{ fontSize: '1.1rem' }}>{selected.placa}</b>],
                  ['Modelo / Cor', `${selected.modelo || '—'} ${selected.cor ? '/ ' + selected.cor : ''}`],
                ].map(([label, value]) => (
                  <div key={label} className="detail-item">
                    <div className="detail-label">{label}</div>
                    <div className="detail-value">{value}</div>
                  </div>
                ))}
                <div className="detail-item"><div className="detail-label">Valor do Pedido</div><div className="detail-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatVal(selected.valor)}</div></div>
                <div className="detail-item"><div className="detail-label">Recebimento Cliente</div><div className="detail-value">{pagCliStatusBadge(selected.pagamento || 'Aguardando')}</div></div>
                <div className="detail-item"><div className="detail-label">Pagamento Fábrica</div><div className="detail-value">{pagFabStatusBadge(selected.pagFabStatus || 'A pagar')}</div></div>
                <div className="detail-item"><div className="detail-label">Valor Fábrica</div><div className="detail-value">{formatVal(selected.pagFabValor)}</div></div>
                <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Fábrica Vinculada</div><div className="detail-value">{fabricas.find(f => f.id === selected.fabricaId)?.nome || '—'}</div></div>
                <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Data</div><div className="detail-value">{formatDate(selected.createdAt)}</div></div>
                {selected.obs && <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Observações</div><div className="detail-value">{selected.obs}</div></div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>🗑 Excluir</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setNewStatus(selected.status); setShowStatusModal(true) }}>📋 Status</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setPagCliForm({ pagamento: selected.pagamento || 'Aguardando', forma: selected.forma || 'Pix' }); setShowPagCliModal(true) }}>💳 Cliente</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setPagFabForm({ pagFabStatus: selected.pagFabStatus || 'A pagar', pagFabValor: selected.pagFabValor || '', pagFabForma: selected.pagFabForma || 'Pix' }); setShowPagFabModal(true) }}>🏭 Fábrica</button>
              <button className="btn btn-primary btn-sm" onClick={() => setSelected(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STATUS */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Atualizar Status</div><button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowStatusModal(false)}>✕</button></div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label>Novo Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {['Pendente','Em Produção','Entregue','Cancelado'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowStatusModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpdateStatus}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAG CLIENTE */}
      {showPagCliModal && (
        <div className="modal-overlay" onClick={() => setShowPagCliModal(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">💳 Recebimento do Cliente</div><button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowPagCliModal(false)}>✕</button></div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Pedido #{selected?.id.slice(-5)} — {selected?.nomeCliente} | Placa: {selected?.placa} | Valor: {formatVal(selected?.valor)}</p>
              <div className="form-group">
                <label>Status do Recebimento</label>
                <select value={pagCliForm.pagamento} onChange={e => setPagCliForm(f => ({ ...f, pagamento: e.target.value }))}>
                  {['Aguardando','Pago','Parcelado'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select value={pagCliForm.forma} onChange={e => setPagCliForm(f => ({ ...f, forma: e.target.value }))}>
                  {['Pix','Dinheiro','Cartão de Débito','Cartão de Crédito','Boleto'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPagCliModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePagCli}>✅ Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAG FABRICA */}
      {showPagFabModal && (
        <div className="modal-overlay" onClick={() => setShowPagFabModal(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">🏭 Pagamento à Fábrica</div><button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowPagFabModal(false)}>✕</button></div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Status do Pagamento à Fábrica</label>
                <select value={pagFabForm.pagFabStatus} onChange={e => setPagFabForm(f => ({ ...f, pagFabStatus: e.target.value }))}>
                  {['A pagar','Pago'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Valor pago à fábrica (R$)</label>
                <input type="number" placeholder="0,00" value={pagFabForm.pagFabValor} onChange={e => setPagFabForm(f => ({ ...f, pagFabValor: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select value={pagFabForm.pagFabForma} onChange={e => setPagFabForm(f => ({ ...f, pagFabForma: e.target.value }))}>
                  {['Pix','Transferência','Dinheiro','Boleto'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPagFabModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePagFab}>✅ Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
