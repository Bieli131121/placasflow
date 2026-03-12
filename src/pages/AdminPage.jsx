// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth, ADMIN_EMAIL } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { isAdmin, adminUpdateNome, register } = useAuth()
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [editando, setEditando] = useState(null)
  const [novoNome, setNovoNome] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', senha: '', nome: '' })
  const [addingUser, setAddingUser] = useState(false)

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    const unsub = onSnapshot(collection(db, 'usuarios'), snap => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => a.nome?.localeCompare(b.nome)))
    })
    return unsub
  }, [isAdmin])

  const abrirEdicao = (u) => {
    setEditando(u)
    setNovoNome(u.nome || '')
  }

  const salvarNome = async () => {
    if (!novoNome.trim()) return toast.error('Nome não pode ser vazio')
    setSaving(true)
    try {
      await adminUpdateNome(editando.id, novoNome.trim())
      toast.success(`Nome de ${editando.email} atualizado!`)
      setEditando(null)
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.senha || !newUser.nome) return toast.error('Preencha todos os campos')
    if (newUser.senha.length < 6) return toast.error('Senha deve ter pelo menos 6 caracteres')
    setAddingUser(true)
    try {
      await register(newUser.email, newUser.senha, newUser.nome)
      toast.success(`Usuário ${newUser.nome} criado!`)
      setShowAddUser(false)
      setNewUser({ email: '', senha: '', nome: '' })
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') toast.error('E-mail já cadastrado')
      else toast.error('Erro ao criar usuário')
    } finally {
      setAddingUser(false)
    }
  }

  if (!isAdmin) return null

  return (
    <>
      <div className="page-header">
        <div className="page-title">👑 Painel <span>Admin</span></div>
        <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>➕ Novo Usuário</button>
      </div>

      <div style={{ background: 'rgba(240,192,64,0.06)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
        👑 Como administrador, você pode alterar o nome de exibição de qualquer usuário e criar novos acessos.
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>
            Usuários do Sistema ({usuarios.length})
          </span>
        </div>

        {/* Desktop table */}
        <div className="table-desktop">
          <table>
            <thead>
              <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Cadastro</th><th>Ação</th></tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.nome || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    {u.email === ADMIN_EMAIL
                      ? <span className="badge badge-production">👑 Admin</span>
                      : <span className="badge badge-mercosul">👤 Usuário</span>
                    }
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(u)}>✏️ Editar nome</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-list">
          {usuarios.map(u => (
            <div key={u.id} className="mobile-card">
              <div className="mobile-card-header">
                <div>
                  <div className="mobile-card-title">{u.nome || '—'}</div>
                  <div className="mobile-card-sub">{u.email}</div>
                </div>
                {u.email === ADMIN_EMAIL
                  ? <span className="badge badge-production">👑 Admin</span>
                  : <span className="badge badge-mercosul">👤 Usuário</span>
                }
              </div>
              <div className="mobile-card-row">
                <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(u)}>✏️ Editar nome</button>
              </div>
            </div>
          ))}
        </div>

        {usuarios.length === 0 && (
          <div className="empty"><div className="empty-icon">👥</div><p>Nenhum usuário encontrado.</p></div>
        )}
      </div>

      {/* Modal editar nome */}
      {editando && (
        <div className="modal-overlay" onClick={() => setEditando(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">✏️ Editar Nome</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setEditando(null)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="detail-item">
                <div className="detail-label">E-mail do usuário</div>
                <div className="detail-value">{editando.email}</div>
              </div>
              <div className="form-group">
                <label>Novo nome de exibição</label>
                <input
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  placeholder="Nome do usuário"
                  onKeyDown={e => e.key === 'Enter' && salvarNome()}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarNome} disabled={saving}>
                {saving ? 'Salvando...' : '💾 Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo usuário */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">➕ Novo Usuário</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowAddUser(false)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nome de exibição</label>
                <input value={newUser.nome} onChange={e => setNewUser(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: João Silva" />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
              </div>
              <div className="form-group">
                <label>Senha (mínimo 6 caracteres)</label>
                <input type="password" value={newUser.senha} onChange={e => setNewUser(f => ({ ...f, senha: e.target.value }))} placeholder="••••••••" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddUser(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAddUser} disabled={addingUser}>
                {addingUser ? 'Criando...' : '✅ Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
