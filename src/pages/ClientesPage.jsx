// src/pages/ClientesPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import { formatDate } from '../components/Badge'
import toast from 'react-hot-toast'

export default function ClientesPage() {
  const navigate = useNavigate()
  const { data: clientes, remove } = useCollection('clientes')
  const { data: pedidos } = useCollection('pedidos')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const list = clientes.filter(c => {
    const q = search.toLowerCase()
    return !q || [c.nome, c.cpf, c.rg, c.tel, c.email].some(x => (x || '').toLowerCase().includes(q))
  })

  const handleDelete = async (id) => {
    if (!confirm('Excluir este cliente?')) return
    await remove(id)
    setSelected(null)
    toast.success('Cliente excluído.')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Cadastro de <span>Clientes</span></div>
        <button className="btn btn-primary" onClick={() => navigate('/clientes/novo')}>👤 Novo Cliente</button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input className="search-input" placeholder="🔍  Buscar por nome, CPF, RG, telefone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {list.length === 0 ? (
          <div className="empty"><div className="empty-icon">👥</div><p>Nenhum cliente cadastrado.</p></div>
        ) : (
          <table>
            <thead>
              <tr><th>Nome</th><th>CPF</th><th>RG</th><th>Telefone</th><th>Cidade</th><th>Pedidos</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {list.map(c => {
                const nPedidos = pedidos.filter(p => p.clienteId === c.id).length
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                    <td><div style={{ fontWeight: 500 }}>{c.nome}</div><div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.email}</div></td>
                    <td>{c.cpf || '—'}</td>
                    <td>{c.rg || '—'}</td>
                    <td>{c.tel || '—'}</td>
                    <td>{c.cidade || '—'}</td>
                    <td><span className="badge badge-mercosul">{nPedidos}</span></td>
                    <td onClick={e => e.stopPropagation()}><button className="btn btn-ghost btn-sm" onClick={() => setSelected(c)}>Ver</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.nome}</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="detail-grid">
                {[
                  ['Nome Completo', selected.nome],
                  ['CPF', selected.cpf || '—'],
                  ['RG', selected.rg || '—'],
                  ['Telefone', selected.tel || '—'],
                  ['E-mail', selected.email || '—'],
                  ['Cadastro', formatDate(selected.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="detail-item">
                    <div className="detail-label">{label}</div>
                    <div className="detail-value">{value}</div>
                  </div>
                ))}
                <div className="detail-item" style={{ gridColumn: '1/-1' }}>
                  <div className="detail-label">Endereço</div>
                  <div className="detail-value">{[selected.logradouro, selected.numero && `nº ${selected.numero}`, selected.bairro, selected.cidade, selected.cep].filter(Boolean).join(', ') || '—'}</div>
                </div>
                {selected.obs && <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Observações</div><div className="detail-value">{selected.obs}</div></div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>🗑 Excluir</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
