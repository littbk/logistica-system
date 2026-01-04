import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import './App.css'

function App() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [newOrder, setNewOrder] = useState({ customerName: '', description: '', totalValue: '' })

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    fetch('http://localhost:8080/orders')
      .then(res => res.json())
      .then(data => setOrders(data.sort((a, b) => b.id - a.id)))

    const socket = new SockJS('http://localhost:8080/ws')
    const stompClient = Stomp.over(socket)
    stompClient.debug = null

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/orders', (message) => {
        const updatedOrder = JSON.parse(message.body)

        setOrders(prevOrders => {
          const exists = prevOrders.find(o => o.id === updatedOrder.id)

          if (exists) {
            return prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
          } else {
            return [updatedOrder, ...prevOrders]
          }
        })
      })
    })

    return () => { if (stompClient && stompClient.connected) stompClient.disconnect() }
  }, [])

  const handleCreateOrder = (e) => {
    e.preventDefault()
    if (!newOrder.customerName || !newOrder.totalValue) return;

    fetch('http://localhost:8080/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).then(() => {
      setNewOrder({ customerName: '', description: '', totalValue: '' })
    })
  }

  const handleChangeStatus = (id, newStatus) => {
    fetch(`http://localhost:8080/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
  }

  const getStatusColor = (status) => {
    if (status === 'CREATED') return '#3b82f6'
    if (status === 'PREPARING') return '#f59e0b'
    if (status === 'DELIVERED') return '#10b981'
    if (status === 'CANCELED') return '#ef4444'
    return '#6b7280'
  }

  const filteredOrders = orders.filter(o => filter === 'ALL' || o.status === filter)

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>

      <header className="sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>📦 Logística</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%', width: '35px', height: '35px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Alternar Tema"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="form-card">
          <h3>Novo Pedido</h3>
          <form onSubmit={handleCreateOrder}>
            <input
              placeholder="Nome do Cliente"
              value={newOrder.customerName}
              onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })}
            />
            <input
              placeholder="Descrição (ex: Notebook)"
              value={newOrder.description}
              onChange={e => setNewOrder({ ...newOrder, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Valor (R$)"
              value={newOrder.totalValue}
              onChange={e => setNewOrder({ ...newOrder, totalValue: e.target.value })}
            />
            <button type="submit">Criar Pedido</button>
          </form>
        </div>

        <div className="filters">
          <h3>Filtros</h3>
          <button onClick={() => setFilter('ALL')} className={filter === 'ALL' ? 'active' : ''}>Todos</button>
          <button onClick={() => setFilter('CREATED')} className={filter === 'CREATED' ? 'active' : ''}>Criados</button>
          <button onClick={() => setFilter('PREPARING')} className={filter === 'PREPARING' ? 'active' : ''}>Na Cozinha</button>
          <button onClick={() => setFilter('DELIVERED')} className={filter === 'DELIVERED' ? 'active' : ''}>Entregues</button>
          <button onClick={() => setFilter('CANCELED')} className={filter === 'CANCELED' ? 'active' : ''}>🚫 Cancelados</button>
        </div>
      </header>

      <main className="content-area">
        <div className="header-info">
          <h1>Painel de Controle</h1>
          <p>Total de Pedidos: <strong>{filteredOrders.length}</strong></p>
        </div>

        <div className="grid-cards">
          {filteredOrders.map(order => (
            <div key={order.id} className="card">
              <div className="card-header">
                <span className="id-badge">#{order.id}</span>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                  {order.status}
                </span>
              </div>

              <h3>{order.customerName}</h3>
              <p className="desc">{order.description}</p>
              <p className="price">R$ {order.totalValue}</p>

              <div className="actions">
                {order.status === 'CREATED' && (
                  <button onClick={() => handleChangeStatus(order.id, 'PREPARING')}>
                    👨‍🍳 Preparar
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button onClick={() => handleChangeStatus(order.id, 'DELIVERED')} style={{ background: '#10b981' }}>
                    ✅ Concluir
                  </button>
                )}

                  {(order.status !== 'DELIVERED' && order.status !== 'CANCELED') && (
                  <button
                    onClick={() => handleChangeStatus(order.id, 'CANCELED')}
                    style={{
                      background: '#ef4444',
                      width: '42px',
                      height: '42px',
                      padding: '0',
                      fontSize: '1.3rem',
                      flex: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Cancelar Pedido"
                  >
                    🗑️
                  </button>
                )}

              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  )
}


export default App