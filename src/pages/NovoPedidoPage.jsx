// src/pages/NovoPedidoPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import toast from 'react-hot-toast'

const TIPOS_PLACA = ['Automóvel', 'Motocicleta', 'Reboque']

export default function NovoPedidoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const editando = location.state?.pedido || null

  const { data: clientes, add: addCliente } = useCollection('clientes')
  const { data: fabricas } = useCollection('fabricas')
  const { add, update } = useCollection('pedidos')

  const [form, setForm] = useState({
    clienteId: '', nomeCliente: '', cpf: '', tel: '', responsavel: '',
    placa: '', tipo: '', modelo: '', cor: '', fabricaId: '',
    valor: '', pagamento: 'Aguardando', forma: 'Pix', status: 'Pendente',
    pagFabStatus: 'A pagar', pagFabValor: '', pagFabForma: 'Pix', obs: ''
  })

  // busca CPF/nome
  const [cpfBusca, setCpfBusca] = useState('')
  const [nomeBusca, setNomeBusca] = useState('')
  const [clienteEncontrado, setClienteEncontrado] = useState(null) // cliente do banco
  const [clienteNovo, setClienteNovo] = useState(false) // não encontrou, vai cadastrar
  const [buscaFeita, setBuscaFeita] = useState(false)
  const [sugestoes, setSugestoes] = useState([])
  const [showSugestoes, setShowSugestoes] = useState(false)
  const nomeRef = useRef(null)

  useEffect(() => {
    if (editando) {
      setForm({ ...editando })
      setCpfBusca(editando.cpf || '')
      setNomeBusca(editando.nomeCliente || '')
      setBuscaFeita(true)
    }
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Busca por CPF (ao sair do campo)
  const buscarPorCPF = () => {
    const cpf = cpfBusca.replace(/\D/g, '')
    if (!cpf || cpf.length < 6) return
    const found = clientes.find(c => c.cpf && c.cpf.replace(/\D/g, '') === cpf)
    if (found) {
      aplicarCliente(found)
      toast.success(`✅ Cliente encontrado: ${found.nome}`)
    } else if (cpf.length >= 11) {
      setClienteNovo(true)
      setClienteEncontrado(null)
      setBuscaFeita(true)
      setForm(f => ({ ...f, cpf: cpfBusca, clienteId: '' }))
      toast('⚠️ CPF não cadastrado — preencha os dados para cadastrar.', { icon: '📝' })
    }
  }

  // Sugestões ao digitar nome
  const handleNomeChange = (v) => {
    setNomeBusca(v)
    set('nomeCliente', v)
    if (v.length >= 3) {
      const matches = clientes.filter(c =>
        c.nome && c.nome.toLowerCase().includes(v.toLowerCase())
      ).slice(0, 5)
      setSugestoes(matches)
      setShowSugestoes(matches.length > 0)
    } else {
      setSugestoes([])
      setShowSugestoes(false)
    }
  }

  const aplicarCliente = (c) => {
    setClienteEncontrado(c)
    setClienteNovo(false)
    setBuscaFeita(true)
    setCpfBusca(c.cpf || '')
    setNomeBusca(c.nome || '')
    setForm(f => ({
      ...f,
      clienteId: c.id,
      nomeCliente: c.nome,
      cpf: c.cpf || '',
      tel: c.tel || '',
    }))
    setSugestoes([])
    setShowSugestoes(false)
  }

  const limparCliente = () => {
    setCpfBusca('')
    setNomeBusca('')
    setClienteEncontrado(null)
    setClienteNovo(false)
    setBuscaFeita(false)
    setForm(f => ({ ...f, clienteId: '', nomeCliente: '', cpf: '', tel: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nomeCliente || !form.placa || !form.tipo) return toast.error('Preencha os campos obrigatórios (*)')
    try {
      let clienteId = form.clienteId

      // Se cliente novo, cadastra automaticamente
      if (clienteNovo && !editando) {
        const novoCliente = await addCliente({
          nome: form.nomeCliente,
          cpf: form.cpf,
          tel: form.tel,
        })
        clienteId = novoCliente.id
        toast.success(`👤 Cliente "${form.nomeCliente}" cadastrado automaticamente!`)
      }

      if (editando) {
        const { id, createdAt, updatedAt, ...dados } = form
        await update(editando.id, { ...dados, clienteId, placa: form.placa.toUpperCase() })
        toast.success('Pedido atualizado!')
      } else {
        await add({ ...form, clienteId, placa: form.placa.toUpperCase() })
        toast.success('Pedido criado!')
      }
      navigate('/pedidos')
    } catch (err) {
      console.error('Erro ao salvar pedido:', err)
      toast.error('Erro ao salvar: ' + err.message)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">{editando ? 'Editar' : 'Novo'} <span>Pedido</span></div>
        <button className="btn btn-ghost" onClick={() => navigate('/pedidos')}>← Voltar</button>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">

          {/* ── BLOCO BUSCA CLIENTE ── */}
          <div className="section-divider">Identificação do Cliente</div>

          {/* Card de status do cliente */}
          {buscaFeita && (
            <div className="form-group full">
              <div style={{
                padding: '0.9rem 1.1rem',
                borderRadius: 10,
                border: `1.5px solid ${clienteEncontrado ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.4)'}`,
                background: clienteEncontrado ? 'rgba(52,211,153,0.07)' : 'rgba(251,191,36,0.07)',
                display: 'flex', alignItems: 'center', gap: '0.8rem'
              }}>
                <span style={{ fontSize: '1.4rem' }}>{clienteEncontrado ? '✅' : '📝'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: clienteEncontrado ? 'var(--green)' : 'var(--orange)' }}>
                    {clienteEncontrado ? `Cliente encontrado: ${clienteEncontrado.nome}` : 'Cliente novo — será cadastrado ao salvar'}
                  </div>
                  {clienteEncontrado && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                      CPF: {clienteEncontrado.cpf || '—'} · Tel: {clienteEncontrado.tel || '—'}
                    </div>
                  )}
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={limparCliente}>↩ Trocar</button>
              </div>
            </div>
          )}

          {/* Campos de busca */}
          {!buscaFeita && (
            <>
              <div className="form-group">
                <label>CPF / CNPJ <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(busca automática)</span></label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    value={cpfBusca}
                    onChange={e => setCpfBusca(e.target.value)}
                    onBlur={buscarPorCPF}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscarPorCPF())}
                    placeholder="000.000.000-00"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={buscarPorCPF} style={{ whiteSpace: 'nowrap' }}>🔍 Buscar</button>
                </div>
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>Nome Completo *</label>
                <input
                  ref={nomeRef}
                  value={nomeBusca}
                  onChange={e => handleNomeChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSugestoes(false), 180)}
                  placeholder="Digite o nome completo..."
                />
                {showSugestoes && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: '#1c2030', border: '1px solid var(--border)', borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', overflow: 'hidden'
                  }}>
                    {sugestoes.map(c => (
                      <div
                        key={c.id}
                        onMouseDown={() => aplicarCliente(c)}
                        style={{
                          padding: '0.7rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                          transition: 'background 0.1s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,247,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>CPF: {c.cpf || '—'} · Tel: {c.tel || '—'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Campos preenchidos (editáveis se cliente novo) */}
          {buscaFeita && (
            <>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  value={form.nomeCliente}
                  onChange={e => set('nomeCliente', e.target.value)}
                  readOnly={!!clienteEncontrado}
                  style={{ opacity: clienteEncontrado ? 0.6 : 1, cursor: clienteEncontrado ? 'default' : 'text' }}
                />
              </div>
              <div className="form-group">
                <label>CPF / CNPJ</label>
                <input
                  value={form.cpf}
                  onChange={e => set('cpf', e.target.value)}
                  readOnly={!!clienteEncontrado}
                  style={{ opacity: clienteEncontrado ? 0.6 : 1, cursor: clienteEncontrado ? 'default' : 'text' }}
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input value={form.tel} onChange={e => set('tel', e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Responsável</label>
            <select value={form.responsavel} onChange={e => set('responsavel', e.target.value)}>
              <option value="">Selecione...</option>
              {['Atendente 1','Atendente 2','Atendente 3'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="section-divider">Veículo e Placa</div>
          <div className="form-group">
            <label>Número da Placa *</label>
            <input value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="ABC1D23" />
          </div>
          <div className="form-group">
            <label>Tipo de Placa *</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              <option value="">Selecione...</option>
              {TIPOS_PLACA.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Modelo do Veículo</label>
            <input value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="Ex: HB20, Civic, CG 160" />
          </div>
          <div className="form-group">
            <label>Cor do Veículo</label>
            <input value={form.cor} onChange={e => set('cor', e.target.value)} placeholder="Prata, Preto..." />
          </div>

          <div className="section-divider">Fábrica Responsável</div>
          <div className="form-group full">
            <label>Vincular Fábrica</label>
            <select value={form.fabricaId} onChange={e => set('fabricaId', e.target.value)}>
              <option value="">Selecione a fábrica...</option>
              {fabricas.map(f => <option key={f.id} value={f.id}>{f.nome}{f.cidade ? ' — ' + f.cidade : ''}</option>)}
            </select>
          </div>

          <div className="section-divider">Pagamento</div>
          <div className="form-group">
            <label>Valor cobrado do cliente (R$) *</label>
            <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="0,00" step="0.01" min="0" />
          </div>
          <div className="form-group">
            <label>Valor pago à fábrica (R$)</label>
            <input type="number" value={form.pagFabValor} onChange={e => set('pagFabValor', e.target.value)} placeholder="0,00" step="0.01" min="0" />
          </div>
          <div className="form-group">
            <label>Status do Pagamento (Cliente)</label>
            <select value={form.pagamento} onChange={e => set('pagamento', e.target.value)}>
              {['Aguardando','Pago','Parcelado'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Forma de Pagamento</label>
            <select value={form.forma} onChange={e => set('forma', e.target.value)}>
              {['Pix','Dinheiro','Cartão de Débito','Cartão de Crédito','Boleto'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status do Pedido</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {['Pendente','Em Produção','Entregue','Cancelado'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status Pagamento Fábrica</label>
            <select value={form.pagFabStatus} onChange={e => set('pagFabStatus', e.target.value)}>
              {['A pagar','Pago'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label>Observações</label>
            <textarea value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Informações adicionais..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/pedidos')}>Cancelar</button>
          <button type="submit" className="btn btn-primary">
            {editando ? '💾 Salvar Alterações' : '💾 Salvar Pedido'}
          </button>
        </div>
      </form>
    </>
  )
}
