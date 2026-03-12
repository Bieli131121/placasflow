// src/components/Badge.jsx
export function statusBadge(s) {
  const map = { 'Pendente': 'pending', 'Em Produção': 'production', 'Entregue': 'done', 'Cancelado': 'cancelled' }
  return <span className={`badge badge-${map[s] || 'pending'}`}>{s}</span>
}

export function tipoBadge(t) {
  const map = { 'Automóvel': 'mercosul', 'Motocicleta': 'moto', 'Reboque': 'production' }
  return <span className={`badge badge-${map[t] || 'mercosul'}`}>{t}</span>
}

export function pagCliStatusBadge(s) {
  if (s === 'Pago') return <span className="badge badge-done">✅ Pago</span>
  if (s === 'Parcelado') return <span className="badge badge-production">📆 Parcelado</span>
  return <span className="badge badge-pending">⏳ Aguardando</span>
}

export function pagFabStatusBadge(s) {
  if (s === 'Pago') return <span className="badge badge-done">✅ Pago</span>
  return <span className="badge badge-cancelled">🔴 A pagar</span>
}

export function formatVal(v) {
  if (!v && v !== 0) return '—'
  return 'R$ ' + parseFloat(v).toFixed(2).replace('.', ',')
}

export function formatDate(d) {
  if (!d) return '—'
  const date = d?.toDate ? d.toDate() : new Date(d)
  return date.toLocaleDateString('pt-BR')
}
