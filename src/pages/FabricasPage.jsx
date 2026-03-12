// src/pages/FabricasPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import { formatDate } from '../components/Badge'
import toast from 'react-hot-toast'

export default function FabricasPage() {
  const navigate = useNavigate()
  const { data: fabricas, remove } = useCollection('fabricas')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const list = fabricas.filter(f => {
    const q = search.toLowerCase()
    return !q || [f.nome, f.cnpj, f.cidade].some(x => (x || '').toLowerCase().includes(q))
  })

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta fábrica?')) return
    await remove(id)
    setSelected(null)
    toast.success('Fábrica excluída.')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Fábricas de <span>Placas</span></div>
        <button className="btn btn-primary" onClick={() => navigate('/fabricas/nova')}>🏭 Nova Fábrica</button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input className="search-input" placeholder="🔍  Buscar por nome, CNPJ, cidade..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {list.length === 0 ? (
          <div className="empty"><div className="empty-icon">🏭</div><p>Nenhuma fábrica cadastrada.</p></div>
        ) : (
          <table>
            <thead>
              <tr><th>Nome / Razão Social</th><th>CNPJ</th><th>Cidade / UF</th><th>Endereço</th><th>Cadastro</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {list.map(f => (
                <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(f)}>
                  <td><div style={{ fontWeight: 500 }}>{f.nome}</div></td>
                  <td>{f.cnpj || '—'}</td>
                  <td>{f.cidade || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[f.logradouro, f.numero, f.bairro].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{formatDate(f.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}><button className="btn btn-ghost btn-sm" onClick={() => setSelected(f)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.nome}</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-label">Nome / Razão Social</div><div className="detail-value">{selected.nome}</div></div>
                <div className="detail-item"><div className="detail-label">CNPJ</div><div className="detail-value">{selected.cnpj || '—'}</div></div>
                <div className="detail-item" style={{ gridColumn: '1/-1' }}>
                  <div className="detail-label">Endereço Completo</div>
                  <div className="detail-value">{[selected.logradouro, selected.numero && `nº ${selected.numero}`, selected.bairro, selected.cidade, selected.cep].filter(Boolean).join(', ') || '—'}</div>
                </div>
                <div className="detail-item"><div className="detail-label">Cadastro</div><div className="detail-value">{formatDate(selected.createdAt)}</div></div>
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
