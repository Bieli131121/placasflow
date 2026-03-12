// src/pages/NovaFabricaPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import toast from 'react-hot-toast'

export default function NovaFabricaPage() {
  const navigate = useNavigate()
  const { add } = useCollection('fabricas')
  const [form, setForm] = useState({ nome: '', cnpj: '', cep: '', cidade: '', logradouro: '', numero: '', bairro: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.cnpj) return toast.error('Preencha Nome e CNPJ (*)')
    await add(form)
    toast.success(`Fábrica "${form.nome}" cadastrada!`)
    navigate('/fabricas')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Nova <span>Fábrica</span></div>
        <button className="btn btn-ghost" onClick={() => navigate('/fabricas')}>← Voltar</button>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="section-divider">Dados da Empresa</div>
          <div className="form-group full"><label>Nome / Razão Social *</label><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome da fábrica" /></div>
          <div className="form-group full"><label>CNPJ *</label><input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" maxLength={18} /></div>

          <div className="section-divider">Endereço</div>
          <div className="form-group"><label>CEP</label><input value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" maxLength={9} /></div>
          <div className="form-group"><label>Cidade / UF</label><input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Ex: São Paulo / SP" /></div>
          <div className="form-group full"><label>Logradouro</label><input value={form.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder="Rua, Av., Rodovia..." /></div>
          <div className="form-group"><label>Número</label><input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" /></div>
          <div className="form-group"><label>Bairro</label><input value={form.bairro} onChange={e => set('bairro', e.target.value)} placeholder="Bairro" /></div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/fabricas')}>Cancelar</button>
          <button type="submit" className="btn btn-primary">💾 Salvar Fábrica</button>
        </div>
      </form>
    </>
  )
}
