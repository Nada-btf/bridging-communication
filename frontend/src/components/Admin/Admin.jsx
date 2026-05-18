import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Admin.css';

const Admin = () => {
  const { isAdmin, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data state
  const [stats, setStats]               = useState({ activeUsers: 0, totalTranslations: 0 });
  const [analytics, setAnalytics]       = useState(null);
  const [signs, setSigns]               = useState([]);
  const [users, setUsers]               = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [logs, setLogs]                 = useState([]);

  // UI state
  const [signSearch, setSignSearch]     = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [newSign, setNewSign]           = useState({ gesture: '', meaning: '', category: '' });
  const [batchData, setBatchData]       = useState('');
  const [batchProcessing, setBatchProcessing] = useState(false);

  // ── Data fetching ──────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, signsRes, usersRes, analyticsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSigns(),
        adminAPI.getUsers(),
        adminAPI.getAnalytics().catch(() => ({ data: null })),
      ]);
      setStats(statsRes.data   || { activeUsers: 0, totalTranslations: 0 });
      setSigns(signsRes.data   || []);
      setUsers(usersRes.data   || []);
      setAnalytics(analyticsRes.data || null);

      try {
        const actRes = await adminAPI.getRecentActivity();
        setRecentActivity(actRes.data || []);
      } catch { setRecentActivity([]); }
    } catch (err) {
      console.error('Admin fetch error:', err);
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await adminAPI.getLogs();
      setLogs(res.data || []);
    } catch { setLogs([]); }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchDashboard();
  }, [isAdmin, fetchDashboard]);

  useEffect(() => {
    if (activeTab === 'logs')       fetchLogs();
  }, [activeTab, fetchLogs]);

  // ── Sign Management ────────────────────────────────────────
  const handleAddSign = async () => {
    if (!newSign.gesture || !newSign.meaning) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      if (newSign.id) {
        await adminAPI.updateSign(newSign.id, {
          gesture: newSign.gesture, meaning: newSign.meaning, category: newSign.category || 'General',
        });
        showToast('Sign updated successfully');
      } else {
        await adminAPI.addSign({
          gesture: newSign.gesture, meaning: newSign.meaning, category: newSign.category || 'General',
        });
        showToast('Sign added successfully');
      }
      setShowAddModal(false);
      setNewSign({ gesture: '', meaning: '', category: '' });
      await fetchDashboard();
    } catch (err) {
      showToast('Failed to save sign', 'error');
    }
  };

  const handleDeleteSign = async (id) => {
    if (!window.confirm('Delete this sign? This cannot be undone.')) return;
    try {
      await adminAPI.deleteSign(id);
      showToast('Sign deleted');
      await fetchDashboard();
    } catch { showToast('Failed to delete sign', 'error'); }
  };

  const handleBatchUpdate = async () => {
    setBatchProcessing(true);
    try {
      const updates = JSON.parse(batchData);
      if (!Array.isArray(updates)) throw new Error('Expected a JSON array');
      await Promise.all(
        updates.map(({ id, ...fields }) => {
          if (!id) throw new Error('Each entry must have an "id" field');
          return adminAPI.updateSign(id, fields);
        })
      );
      showToast(`Batch update completed — ${updates.length} sign(s) updated`);
      setShowBatchModal(false);
      setBatchData('');
      await fetchDashboard();
    } catch (err) {
      showToast(`Batch failed: ${err.message}`, 'error');
    } finally {
      setBatchProcessing(false);
    }
  };

  // ── User Management ────────────────────────────────────────
  const handleBlockUser = async (userId, currentBlocked) => {
    try {
      await adminAPI.blockUser(userId, !currentBlocked);
      showToast(`User ${!currentBlocked ? 'blocked' : 'unblocked'} successfully`);
      await fetchDashboard();
    } catch { showToast('Failed to update user status', 'error'); }
  };

  // ── Utilities ──────────────────────────────────────────────
  const exportToCSV = () => {
    const rows = [['ID', 'Gesture', 'Meaning', 'Category'], ...signs.map(s => [s.id, s.gesture, s.meaning, s.category])];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `signs_${Date.now()}.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('CSV exported');
  };

  const getRelativeTime = (ts) => {
    if (!ts) return 'Just now';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  const filteredSigns = signs.filter(s =>
    !signSearch || s.meaning?.toLowerCase().includes(signSearch.toLowerCase()) ||
    s.gesture?.toLowerCase().includes(signSearch.toLowerCase())
  );

  // ── Guards ─────────────────────────────────────────────────
  if (!isAdmin) return (
    <div className="admin-access-denied">
      <div className="access-denied-icon">⛔</div>
      <h2>Access Denied</h2>
      <p>This area is restricted to administrators only.</p>
    </div>
  );

  if (loading) return (
    <div className="admin-loading">
      <LoadingSpinner size="medium" text="Loading dashboard..." />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <p>Manage your sign language translation platform</p>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="admin-tabs">
        {[
          { key: 'dashboard',  label: '📊 Dashboard'                     },
          { key: 'signs',      label: `🖐️ Signs (${signs.length})`       },
          { key: 'users',      label: `👥 Users (${users.length})`       },
          { key: 'analytics',  label: '📈 Analytics'                     },
          { key: 'logs',       label: '📋 Logs'                          },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: Dashboard
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-tab">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info"><h3>{stats.activeUsers}</h3><p>Active Users</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-info"><h3>{stats.totalTranslations}</h3><p>Total Translations</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🖐️</div>
              <div className="stat-info"><h3>{signs.length}</h3><p>Signs in Database</p></div>
            </div>

          </div>

          <div className="recent-activity">
            <h3>Recent Translations</h3>
            <div className="activity-list">
              {recentActivity.length === 0
                ? <div className="activity-empty"><p>No activity yet. Translations appear here as users start.</p></div>
                : recentActivity.map(a => (
                  <div className="activity-item" key={a.id}>
                    <span className="activity-icon">{a.icon}</span>
                    <span className="activity-text">{a.text}</span>
                    <span className="activity-time">{getRelativeTime(a.time)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: Sign Management
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'signs' && (
        <div className="signs-tab">
          <div className="tab-actions">
            <div className="admin-search">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search signs by gesture or meaning…"
                value={signSearch}
                onChange={e => setSignSearch(e.target.value)}
              />
              {signSearch && <button className="clear-btn" onClick={() => setSignSearch('')}>✕</button>}
            </div>
            <div className="tab-action-btns">
              <button className="btn-primary" onClick={() => { setNewSign({ gesture:'', meaning:'', category:'' }); setShowAddModal(true); }}>
                + Add Sign
              </button>
              <button className="btn-outline" onClick={() => setShowBatchModal(true)}>📦 Batch Update</button>
              <button className="btn-outline" onClick={exportToCSV}>📥 Export CSV</button>
            </div>
          </div>

          <div className="admin-table-container">
            {filteredSigns.length === 0
              ? <div className="empty-state"><p>{signSearch ? `No results for "${signSearch}"` : 'No signs yet. Click + Add Sign.'}</p></div>
              : (
                <table className="admin-table">
                  <thead>
                    <tr><th>#ID</th><th>Gesture</th><th>Meaning / Word</th><th>Category</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredSigns.map(sign => (
                      <tr key={sign.id}>
                        <td className="sign-id">#{sign.id}</td>
                        <td><span className="gesture-icon">{sign.gesture || '🤟'}</span></td>
                        <td className="sign-meaning">{sign.meaning}</td>
                        <td><span className="category-badge">{sign.category || 'General'}</span></td>
                        <td>
                          <div className="row-actions">
                            <button className="action-btn edit" title="Edit" onClick={() => { setNewSign(sign); setShowAddModal(true); }}>✎</button>
                            <button className="action-btn delete" title="Delete" onClick={() => handleDeleteSign(sign.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
          <p className="table-count">Showing {filteredSigns.length} of {signs.length} signs</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: User Management
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="users-tab">
          <div className="admin-table-container">
            {users.length === 0
              ? <div className="empty-state"><p>No users yet.</p></div>
              : (
                <table className="admin-table">
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Type</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className={u.blocked ? 'blocked-row' : ''}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar-sm">{u.name?.charAt(0)?.toUpperCase() || '?'}</div>
                            <span>{u.name || '—'}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td><span className={`type-badge ${u.type}`}>{u.type}</span></td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                        <td><span className={`status-pill ${u.blocked ? 'blocked' : 'active'}`}>{u.blocked ? 'Blocked' : 'Active'}</span></td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              className={`action-btn ${u.blocked ? 'unblock' : 'block'}`}
                              onClick={() => handleBlockUser(u.id, u.blocked)}
                            >
                              {u.blocked ? '✅ Unblock' : '🚫 Block'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: Analytics
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="analytics-tab">
          {!analytics
            ? <div className="empty-state"><p>Analytics unavailable. Is MongoDB connected?</p></div>
            : (
              <>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-info"><h3>{analytics.totalTranslations}</h3><p>Total Translations</p></div></div>
                  <div className="stat-card"><div className="stat-icon">🖐️</div><div className="stat-info"><h3>{analytics.totalSigns}</h3><p>Signs in Database</p></div></div>
                  <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-info"><h3>{analytics.totalUsers}</h3><p>Registered Users</p></div></div>
                </div>

                <div className="analytics-row">
                  {/* Direction split */}
                  <div className="analytics-card">
                    <h3>Translation Direction</h3>
                    <div className="direction-chart">
                      {Object.entries(analytics.directionSplit).map(([dir, count]) => {
                        const total = Object.values(analytics.directionSplit).reduce((a,b) => a+b, 0) || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={dir} className="direction-row">
                            <span className="dir-label">{dir === 'sign-to-speech' ? '🗣️ Sign→Speech' : '🖐️ Speech→Sign'}</span>
                            <div className="dir-bar-wrap">
                              <div className="dir-bar" style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="dir-pct">{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* User type breakdown */}
                  <div className="analytics-card">
                    <h3>User Types</h3>
                    <div className="user-type-chart">
                      {Object.entries(analytics.userTypeBreakdown).map(([type, count]) => (
                        <div key={type} className="type-stat">
                          <span className={`type-dot ${type}`}></span>
                          <span className="type-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                          <span className="type-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Translations by day mini chart */}
                <div className="analytics-card full-width">
                  <h3>Translations (Last 7 Days)</h3>
                  {analytics.translationsByDay.length === 0
                    ? <p className="muted-text">No translation data yet.</p>
                    : (
                      <div className="bar-chart">
                        {(() => {
                          const max = Math.max(...analytics.translationsByDay.map(d => d.count), 1);
                          return analytics.translationsByDay.map(d => (
                            <div key={d.date} className="bar-col">
                              <div className="bar-fill" style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }} title={`${d.count} translations`}></div>
                              <span className="bar-label">{d.date.slice(5)}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    )
                  }
                </div>
              </>
            )
          }
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: Admin Activity Logs
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'logs' && (
        <div className="logs-tab">
          {logs.length === 0
            ? <div className="empty-state"><p>No admin actions recorded yet. Actions appear here once you start managing the system.</p></div>
            : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr><th>Time</th><th>Admin</th><th>Action</th><th>Detail</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td className="log-time">{getRelativeTime(log.timestamp)}</td>
                        <td>{log.adminEmail}</td>
                        <td><span className={`action-tag ${log.action.includes('DELETE') || log.action.includes('BLOCK') ? 'danger' : log.action.includes('ADD') ? 'success' : 'info'}`}>{log.action}</span></td>
                        <td className="log-detail">{log.detail || '—'}</td>
                        <td><span className={`status-pill ${log.status}`}>{log.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: Add / Edit Sign
      ══════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{newSign.id ? 'Edit Sign' : 'Add New Sign'}</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Gesture Icon / Emoji</label>
                <input type="text" value={newSign.gesture}
                  onChange={e => setNewSign({ ...newSign, gesture: e.target.value })}
                  placeholder="e.g., 🤟, 👋, 👍" />
              </div>
              <div className="form-group">
                <label>Meaning / Word <span className="required">*</span></label>
                <input type="text" value={newSign.meaning}
                  onChange={e => setNewSign({ ...newSign, meaning: e.target.value })}
                  placeholder="e.g., Hello, I love you, Goodbye" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={newSign.category} onChange={e => setNewSign({ ...newSign, category: e.target.value })}>
                  <option value="">Select category</option>
                  <option value="Greeting">Greeting</option>
                  <option value="Emotion">Emotion</option>
                  <option value="Question">Question</option>
                  <option value="Direction">Direction</option>
                  <option value="Food">Food</option>
                  <option value="Numbers">Numbers</option>
                  <option value="Alphabet">Alphabet</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddSign}>
                {newSign.id ? '💾 Update' : '+ Add Sign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: Batch Update
      ══════════════════════════════════════════════════════════ */}
      {showBatchModal && (
        <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Batch Update Signs</h2>
              <button className="modal-close" onClick={() => setShowBatchModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>JSON Array of Updates</label>
                <textarea rows={10} value={batchData}
                  onChange={e => setBatchData(e.target.value)}
                  placeholder={`[\n  {"id": 1, "meaning": "Hello (updated)"},\n  {"id": 2, "gesture": "👋", "category": "Greeting"}\n]`}
                />
              </div>
              <div className="info-box">
                <strong>💡 Format:</strong> JSON array where each object has an <code>id</code> and any fields to update: <code>gesture</code>, <code>meaning</code>, <code>category</code>.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowBatchModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleBatchUpdate} disabled={batchProcessing}>
                {batchProcessing ? '⏳ Processing…' : '⚡ Apply Batch Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;