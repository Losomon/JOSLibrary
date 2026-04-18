// app/dashboard/admin/page.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [stats] = useState({
    totalMembers: 12847,
    membersGrowth: '+124 this month',
    booksInCirculation: 3421,
    totalBooks: 84210,
    overdueItems: 47,
    overdueChange: '↑ 8 from last week',
    finesOutstanding: 28540,
    fineAccounts: 89,
    aiQueriesToday: 1284,
    aiResponseTime: 'avg 2.3s response'
  })

  const [alerts, setAlerts] = useState([
    { id: '1', type: 'danger', icon: '🔴', title: '47 overdue books', message: '12 accounts exceed 30 days. Auto-suspend pending.', action: 'Review', link: '/dashboard/admin/overdue' },
    { id: '2', type: 'warning', icon: '🟡', title: 'Catalogue sync', message: '234 new acquisitions pending classification.', action: 'Assign', link: '/dashboard/admin/acquisitions' },
    { id: '3', type: 'info', icon: '🔵', title: 'AI Usage spike', message: 'Public AI hit 92% capacity at 14:00.', action: 'View Logs', link: '/dashboard/admin/ai-logs' },
  ])

  const [members] = useState([
    { id: '1', name: 'Jane Austen', cardNo: 'LIB-004821', type: 'Standard', booksOut: '3/5', status: 'Active' },
    { id: '2', name: 'Kofi Mensah', cardNo: 'LIB-003341', type: 'Scholar', booksOut: '8/15', status: 'Active' },
    { id: '3', name: 'Amina Wanjiku', cardNo: 'LIB-007712', type: 'Patron', booksOut: '2/∞', status: 'Overdue' },
    { id: '4', name: 'David Ochieng', cardNo: 'LIB-001198', type: 'Standard', booksOut: '5/5', status: 'Suspended' },
    { id: '5', name: 'Grace Njeri', cardNo: 'LIB-009003', type: 'Scholar', booksOut: '1/15', status: 'Active' },
  ])

  const [chartData] = useState([
    { day: 'Mon', value: 82 }, { day: 'Tue', value: 110 }, { day: 'Wed', value: 95 },
    { day: 'Thu', value: 143 }, { day: 'Fri', value: 127 }, { day: 'Sat', value: 68 }, { day: 'Sun', value: 41 },
  ])

  const [fineBreakdown] = useState([
    { type: 'Standard Members', amount: 18200, percentage: 64, color: 'var(--amber)' },
    { type: 'Scholar Members', amount: 7890, percentage: 28, color: 'var(--blue)' },
    { type: 'Patron Members', amount: 2450, percentage: 9, color: 'var(--gold)' },
  ])

  const getStatusPill = (status: string) => {
    switch(status) {
      case 'Active': return 'pill-g'
      case 'Overdue': return 'pill-r'
      case 'Suspended': return 'pill-a'
      default: return 'pill-b'
    }
  }

  const getTypePill = (type: string) => {
    switch(type) {
      case 'Standard': return 'pill-b'
      case 'Scholar': return 'pill-g'
      case 'Patron': return 'pill-a'
      default: return 'pill-b'
    }
  }

  return (
    <div className="dashboard-view">
      {/* Stats Strip */}
      <div className="stat-strip">
        <div className="stat-box g"><div className="stat-lbl">Total Members</div><div className="stat-num gold">{stats.totalMembers.toLocaleString()}</div><div className="stat-change">{stats.membersGrowth}</div></div>
        <div className="stat-box gr"><div className="stat-lbl">Books in Circulation</div><div className="stat-num green">{stats.booksInCirculation.toLocaleString()}</div><div className="stat-change">of {stats.totalBooks.toLocaleString()} total</div></div>
        <div className="stat-box r"><div className="stat-lbl">Overdue Items</div><div className="stat-num red">{stats.overdueItems}</div><div className="stat-change">{stats.overdueChange}</div></div>
        <div className="stat-box a"><div className="stat-lbl">Fines Outstanding</div><div className="stat-num amber">{stats.finesOutstanding.toLocaleString()}</div><div className="stat-change">Ksh · {stats.fineAccounts} accounts</div></div>
        <div className="stat-box b"><div className="stat-lbl">AI Queries Today</div><div className="stat-num blue">{stats.aiQueriesToday.toLocaleString()}</div><div className="stat-change">{stats.aiResponseTime}</div></div>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="panel">
          <div className="panel-head"><div className="panel-title">⚠ Active System Alerts</div><button className="panel-action" onClick={() => setAlerts([])}>Dismiss All</button></div>
          <div className="panel-body">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type === 'danger' ? 'alert-r' : alert.type === 'warning' ? 'alert-a' : 'alert-b'}`}>
                <span className="alert-icon">{alert.icon}</span>
                <div className="alert-text"><strong>{alert.title}</strong> — {alert.message}</div>
                <Link href={alert.link} className="act-btn">{alert.action}</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Row */}
      <div className="row row-main">
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Recent Member Activity</div><Link href="/dashboard/admin/members" className="panel-action">View All Members →</Link></div>
          <table className="data-table">
            <thead><tr><th>Member</th><th>Card No.</th><th>Type</th><th>Books Out</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td><strong>{member.name}</strong></td>
                  <td className="mono">{member.cardNo}</td>
                  <td><span className={`pill ${getTypePill(member.type)}`}>{member.type}</span></td>
                  <td>{member.booksOut}</td>
                  <td><span className={`pill ${getStatusPill(member.status)}`}>{member.status}</span></td>
                  <td><Link href={`/dashboard/admin/members?edit=${member.id}`} className="act-btn">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Activity Feed */}
          <div className="panel">
            <div className="panel-head"><div className="panel-title">Live Activity Feed</div></div>
            <div className="panel-body" style={{ padding: '0.8rem 1.2rem' }}>
              <div className="feed-item"><div className="feed-dot" style={{ background: 'var(--green)' }}></div><div className="feed-text"><strong>LIB-004821</strong> borrowed <strong>Things Fall Apart</strong></div><div className="feed-time">2m ago</div></div>
              <div className="feed-item"><div className="feed-dot" style={{ background: 'var(--red)' }}></div><div className="feed-text"><strong>LIB-007712</strong> overdue notice sent</div><div className="feed-time">14m ago</div></div>
              <div className="feed-item"><div className="feed-dot" style={{ background: 'var(--gold)' }}></div><div className="feed-text"><strong>LIB-003341</strong> renewed 3 books</div><div className="feed-time">31m ago</div></div>
              <div className="feed-item"><div className="feed-dot" style={{ background: 'var(--blue)' }}></div><div className="feed-text">New member <strong>Grace Njeri</strong> registered</div><div className="feed-time">1h ago</div></div>
            </div>
          </div>

          {/* Chart */}
          <div className="panel">
            <div className="panel-head"><div className="panel-title">Borrowing — Last 7 Days</div></div>
            <div className="panel-body">
              <div className="chart-bars">
                {chartData.map((item, idx) => {
                  const maxValue = Math.max(...chartData.map(d => d.value))
                  const height = Math.round((item.value / maxValue) * 70)
                  const colors = ['var(--gold)', 'var(--green)', 'var(--blue)', 'var(--gold)', 'var(--amber)', 'var(--blue)', 'var(--text3)']
                  return (
                    <div key={idx} className="bar-col">
                      <div className="bar-fill" style={{ height: `${height}px`, background: colors[idx] }}></div>
                      <div className="bar-label">{item.day}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Fine Breakdown */}
          <div className="panel">
            <div className="panel-head"><div className="panel-title">Outstanding Fines</div></div>
            <div className="panel-body">
              {fineBreakdown.map((fine, idx) => (
                <div key={idx} className="fine-bar-wrap">
                  <div className="fine-bar-top"><span>{fine.type}</span><span>Ksh {fine.amount.toLocaleString()}</span></div>
                  <div className="fine-bar"><div className="fine-bar-fill" style={{ width: `${fine.percentage}%`, background: fine.color }}></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Books */}
      <div className="panel">
        <div className="panel-head"><div className="panel-title">Overdue Books — Immediate Action Required</div><button className="panel-action" onClick={() => toast.success('Bulk notice sent')}>Send Bulk Notice</button></div>
        <table className="data-table">
          <thead><tr><th>Book Title</th><th>Author</th><th>Member</th><th>Due Date</th><th>Days Overdue</th><th>Fine (Ksh)</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><strong>Arrow of God</strong></td><td>Chinua Achebe</td><td className="mono">LIB-007712</td><td className="mono">Mar 18, 2026</td><td><span className="pill pill-r">30 days</span></td><td className="mono" style={{ color: 'var(--red)' }}>300</td><td><button className="act-btn warn" onClick={() => toast.info('Notice sent')}>Notify</button></td></tr>
            <tr><td><strong>Weep Not, Child</strong></td><td>Ngũgĩ wa Thiong'o</td><td className="mono">LIB-002234</td><td className="mono">Mar 28, 2026</td><td><span className="pill pill-r">20 days</span></td><td className="mono" style={{ color: 'var(--red)' }}>200</td><td><button className="act-btn warn" onClick={() => toast.info('Notice sent')}>Notify</button></td></tr>
            <tr><td><strong>Wizard of the Crow</strong></td><td>Ngũgĩ wa Thiong'o</td><td className="mono">LIB-005567</td><td className="mono">Apr 5, 2026</td><td><span className="pill pill-a">12 days</span></td><td className="mono" style={{ color: 'var(--amber)' }}>120</td><td><button className="act-btn warn" onClick={() => toast.info('Notice sent')}>Notify</button></td></tr>
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 1.3rem;
        }
        .stat-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        .stat-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1rem 1.1rem;
          position: relative;
          overflow: hidden;
          transition: border-color 0.18s;
        }
        .stat-box::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
        }
        .g::after { background: var(--gold); }
        .r::after { background: var(--red); }
        .gr::after { background: var(--green); }
        .b::after { background: var(--blue); }
        .a::after { background: var(--amber); }
        .stat-lbl {
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text3);
          margin-bottom: 0.45rem;
        }
        .stat-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.8rem;
          font-weight: 500;
          line-height: 1;
        }
        .stat-num.gold { color: var(--gold); }
        .stat-num.red { color: var(--red); }
        .stat-num.green { color: var(--green); }
        .stat-num.blue { color: var(--blue); }
        .stat-num.amber { color: var(--amber); }
        .stat-change {
          font-size: 0.66rem;
          color: var(--text3);
          margin-top: 0.3rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .panel-head {
          padding: 0.9rem 1.2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .panel-title {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .panel-action {
          font-size: 0.68rem;
          color: var(--gold);
          cursor: pointer;
          border: 1px solid rgba(201,168,76,0.22);
          padding: 0.28rem 0.65rem;
          border-radius: 3px;
          background: none;
          text-decoration: none;
        }
        .panel-body {
          padding: 1rem 1.2rem;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.76rem;
        }
        .data-table th {
          font-size: 0.59rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text3);
          padding: 0 0.75rem 0.55rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .data-table td {
          padding: 0.65rem 0.75rem;
          border-bottom: 1px solid var(--border);
          color: var(--text2);
          vertical-align: middle;
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
        }
        .pill {
          display: inline-block;
          font-size: 0.58rem;
          padding: 2px 7px;
          border-radius: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .pill-g { background: rgba(82,194,120,0.12); color: var(--green); }
        .pill-r { background: rgba(224,82,82,0.12); color: var(--red); }
        .pill-a { background: rgba(224,160,82,0.12); color: var(--amber); }
        .pill-b { background: rgba(82,148,224,0.12); color: var(--blue); }
        .act-btn {
          font-size: 0.62rem;
          padding: 2px 7px;
          border-radius: 3px;
          border: 1px solid var(--border2);
          background: none;
          color: var(--text2);
          cursor: pointer;
          text-decoration: none;
        }
        .act-btn.warn:hover {
          border-color: rgba(224,82,82,0.4);
          color: var(--red);
        }
        .row-main {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.2rem;
        }
        .feed-item {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--border);
        }
        .feed-item:last-child { border-bottom: none; }
        .feed-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .feed-text {
          font-size: 0.75rem;
          color: var(--text2);
          flex: 1;
          line-height: 1.45;
        }
        .feed-text strong { color: var(--text); font-weight: 500; }
        .feed-time {
          font-size: 0.63rem;
          color: var(--text3);
          white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
        }
        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 5px;
          height: 80px;
        }
        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .bar-fill {
          width: 100%;
          border-radius: 2px 2px 0 0;
          transition: height 0.6s ease;
          min-height: 3px;
        }
        .bar-label {
          font-size: 0.56rem;
          color: var(--text3);
          font-family: 'JetBrains Mono', monospace;
        }
        .fine-bar-wrap {
          margin-bottom: 0.75rem;
        }
        .fine-bar-top {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          margin-bottom: 0.28rem;
        }
        .fine-bar-top span:first-child { color: var(--text2); }
        .fine-bar-top span:last-child { color: var(--text); font-family: 'JetBrains Mono', monospace; }
        .fine-bar {
          height: 4px;
          background: var(--bg3);
          border-radius: 2px;
          overflow: hidden;
        }
        .fine-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.9s ease;
        }
        .alert-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 0.9rem;
          border-radius: 3px;
          margin-bottom: 0.45rem;
          font-size: 0.76rem;
        }
        .alert-r { background: rgba(224,82,82,0.07); border: 1px solid rgba(224,82,82,0.15); }
        .alert-a { background: rgba(224,160,82,0.07); border: 1px solid rgba(224,160,82,0.15); }
        .alert-b { background: rgba(82,148,224,0.07); border: 1px solid rgba(82,148,224,0.15); }
        .alert-icon { font-size: 14px; flex-shrink: 0; }
        .alert-text { flex: 1; color: var(--text2); line-height: 1.4; }
        .alert-text strong { color: var(--text); }
      `}</style>
    </div>
  )
}