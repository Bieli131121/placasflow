// src/pages/NovoClientePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import toast from 'react-hot-toast'

export default function NovoClientePage() {
  const navigate = useNavigate()
  const { add } = useCollection('clientes')
  const [form, setForm] = useState({ nome: '', cpf: '', rg: '', tel: '', email: '', cep: '', cidade: '', logradouro: '', numero: '', bairro: '', complemento: '', obs: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.cpf || !form.tel) return toast.error('Preencha Nome, CPF e Telefone (*)')
    await add(form)
    toast.success(`Cliente ${form.nome} cadastrado!`)
    navigate('/clientes')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Novo <span>Cliente</span></div>
        <button className="btn btn-ghost" onClick={() => navigate('/clientes')}>← Voltar</button>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="section-divider">Dados Pessoais</div>
          <div className="form-group full"><label>Nome Completo *</label><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo do cliente" /></div>
          <div className="form-group"><label>CPF *</label><input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" maxLength={14} /></div>
          <div className="form-group"><label>RG</label><input value={form.rg} onChange={e => set('rg', e.target.value)} placeholder="00.000.000-0" maxLength={12} /></div>
          <div className="form-group"><label>Telefone *</label><input value={form.tel} onChange={e => set('tel', e.target.value)} placeholder="(00) 00000-0000" maxLength={15} /></div>
          <div className="form-group"><label>E-mail</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" /></div>

          <div className="section-divider">Endereço</div>
          <div className="form-group"><label>CEP</label><input value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" maxLength={9} /></div>
          <div className="form-group"><label>Cidade / UF</label><input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Cidade / UF" /></div>
          <div className="form-group full"><label>Logradouro</label><input value={form.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder="Rua, Av., Alameda..." /></div>
          <div className="form-group"><label>Número</label><input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" /></div>
          <div className="form-group"><label>Bairro</label><input value={form.bairro} onChange={e => set('bairro', e.target.value)} placeholder="Bairro" /></div>
          <div className="form-group full"><label>Complemento</label><input value={form.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Apto, Bloco, Casa..." /></div>

          <div className="section-divider">Observações</div>
          <div className="form-group full"><label>Observações</label><textarea value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Informações adicionais..." /></div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/clientes')}>Cancelar</button>
          <button type="submit" className="btn btn-primary">💾 Salvar Cliente</button>
        </div>
      </form>
    </>
  )
}
