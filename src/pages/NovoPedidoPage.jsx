// src/pages/NovoPedidoPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import toast from 'react-hot-toast'

const TIPOS_PLACA = ['Automóvel', 'Motocicleta', 'Reboque']

export default function NovoPedidoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const editando = location.state?.pedido || null

  const { data: clientes } = useCollection('clientes')
  const { data: fabricas } = useCollection('fabricas')
  const { add, update } = useCollection('pedidos')

  const [form, setForm] = useState({
    clienteId: '', nomeCliente: '', cpf: '', tel: '', responsavel: '',
    placa: '', tipo: '', modelo: '', cor: '', fabricaId: '',
    valor: '', pagamento: 'Aguardando', forma: 'Pix', status: 'Pendente',
    pagFabStatus: 'A pagar', pagFabValor: '', pagFabForma: 'Pix', obs: ''
  })

  useEffect(() => {
    if (editando) setForm({ ...editando })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClienteSelect = (id) => {
    const c = clientes.find(x => x.id === id)
    if (c) setForm(f => ({ ...f, clienteId: id, nomeCliente: c.nome, cpf: c.cpf, tel: c.tel }))
    else set('clienteId', '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nomeCliente || !form.placa || !form.tipo) return toast.error('Preencha os campos obrigatórios (*)')
    if (editando) {
      const { id, createdAt, ...dados } = form
      await update(editando.id, { ...dados, placa: form.placa.toUpperCase() })
      toast.success('Pedido atualizado!')
    } else {
      await add({ ...form, placa: form.placa.toUpperCase() })
      toast.success('Pedido criado!')
    }
    navigate('/pedidos')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">{editando ? 'Editar' : 'Novo'} <span>Pedido</span></div>
        <button className="btn btn-ghost" onClick={() => navigate('/pedidos')}>← Voltar</button>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="section-divider">Dados do Cliente</div>
          <div className="form-group full">
            <label>Vincular Cliente Cadastrado</label>
            <select value={form.clienteId} onChange={e => handleClienteSelect(e.target.value)}>
              <option value="">Selecione um cliente cadastrado...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.cpf}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Nome do Cliente *</label>
            <input value={form.nomeCliente} onChange={e => set('nomeCliente', e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label>CPF / CNPJ</label>
            <input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input value={form.tel} onChange={e => set('tel', e.target.value)} placeholder="(00) 00000-0000" />
          </div>
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
