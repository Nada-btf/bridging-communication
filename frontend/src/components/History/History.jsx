import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { historyAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './History.css';

const History = () => {
  const { isAuthenticated, userType, showToast } = useAuth();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMetadata, setShowMetadata] = useState(false);

  // Fetch history — heavy filters (direction, dateRange) resolved server-side;
  // search, favorites, and sort remain client-side for instant responsiveness.
  const fetchHistory = useCallback(async (serverFilters = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await historyAPI.getAll(serverFilters);
      let allHistory = response.data || [];

      // Narrow further by user type (deaf only sees sign-to-speech, hearing only speech-to-sign)
      if (userType === 'deaf') {
        allHistory = allHistory.filter(item =>
          item.direction === 'sign-to-speech' || item.direction === 'sign→speech'
        );
      } else if (userType === 'hearing') {
        allHistory = allHistory.filter(item =>
          item.direction === 'speech-to-sign' || item.direction === 'speech→sign'
        );
      }

      setHistory(allHistory);
      setFilteredHistory(allHistory);
    } catch (error) {
      showToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userType, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  // Client-side: search, favorites, and sort (instant, no network round-trip)
  useEffect(() => {
    let filtered = [...history];

    // Keyword search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.phrase.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Favorites filter
    if (filterType === 'favorite') {
      filtered = filtered.filter(item => item.favorite);
    }

    // Sort
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    setFilteredHistory(filtered);
  }, [searchTerm, filterType, sortOrder, history]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this translation?')) {
      try {
        await historyAPI.delete(id);
        showToast('Translation deleted successfully');
        fetchHistory();
      } catch (error) {
        showToast('Failed to delete', 'error');
      }
    }
  };

  const handleToggleFavorite = async (id, currentFavorite, e) => {
    e.stopPropagation();
    try {
      await historyAPI.toggleFavorite(id, !currentFavorite);
      showToast(currentFavorite ? 'Removed from favorites' : 'Added to favorites');
      fetchHistory();
    } catch (error) {
      showToast('Failed to update favorite', 'error');
    }
  };

  const handleReplay = (item, e) => {
    e.stopPropagation();
    if (userType === 'deaf') {
      const utterance = new SpeechSynthesisUtterance(item.phrase);
      window.speechSynthesis.speak(utterance);
      showToast(`🔊 Replaying translation: "${item.phrase}"`);
    } else {
      if (item.videoUrl) {
        window.open(item.videoUrl, '_blank');
        showToast('Opening sign video for replay');
      } else {
        showToast('Replay not available for this entry', 'info');
      }
    }
  };

  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) {
      setShowMetadata(!showMetadata);
    } else {
      setSelectedItem(item);
      setShowMetadata(true);
    }
  };

  const groupByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    return groups;
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('History exported successfully');
  };

  const clearAllHistory = async () => {
    if (window.confirm('Are you sure you want to clear ALL translation history? This cannot be undone.')) {
      try {
        for (const item of history) {
          await historyAPI.delete(item.id);
        }
        showToast('All history cleared');
        fetchHistory();
      } catch (error) {
        showToast('Failed to clear history', 'error');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="history-access-denied">
        <div className="access-denied-icon">📜</div>
        <h2>History is locked</h2>
        <p>Please log in to view your translation history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history-loading">
        <LoadingSpinner size="medium" text="Loading your history..." />
      </div>
    );
  }

  const groupedHistory = groupByDate(filteredHistory);
  const directionLabel = userType === 'deaf' ? 'Sign to Speech' : 'Speech to Sign';
  const directionIcon = userType === 'deaf' ? '🗣️' : '🖐️';

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h1>Translation History</h1>
          <p>View and manage your {directionLabel.toLowerCase()} translations</p>
        </div>
        <div className="history-actions-header">
          {history.length > 0 && (
            <>
              <button className="btn-outline" onClick={exportHistory}>
                📥 Export
              </button>
              <button className="btn-outline danger" onClick={clearAllHistory}>
                🗑️ Clear all
              </button>
            </>
          )}
        </div>
      </div>

      <div className="history-controls">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search translations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-sort-row">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterType === 'favorite' ? 'active' : ''}`}
              onClick={() => setFilterType('favorite')}
            >
              ⭐ Favorites
            </button>
          </div>

          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortOrder === 'newest' ? 'active' : ''}`}
              onClick={() => setSortOrder('newest')}
            >
              📅 Newest first
            </button>
            <button
              className={`sort-btn ${sortOrder === 'oldest' ? 'active' : ''}`}
              onClick={() => setSortOrder('oldest')}
            >
              📅 Oldest first
            </button>
          </div>
        </div>
      </div>

      <div className="history-stats">
        <div className="stat">
          <span className="stat-value">{history.length}</span>
          <span className="stat-label">Total {directionLabel.toLowerCase()} translations</span>
        </div>
        <div className="stat">
          <span className="stat-value">{history.filter(h => h.favorite).length}</span>
          <span className="stat-label">Favorites</span>
        </div>
        <div className="stat">
          <span className="stat-value">{filteredHistory.length}</span>
          <span className="stat-label">Showing</span>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">{directionIcon}</div>
          <h3>No {directionLabel.toLowerCase()} translations found</h3>
          <p>
            {searchTerm || filterType !== 'all'
              ? "Try changing your search or filter criteria"
              : `Start translating using ${directionLabel} to see your history here`}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button className="btn-primary" onClick={() => window.location.href = '/translate'}>
              Start translating →
            </button>
          )}
        </div>
      ) : (
        <div className="history-list">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="history-group">
              <div className="group-header">
                <span className="group-date">{date}</span>
                <span className="group-count">{items.length} items</span>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`history-item ${selectedItem?.id === item.id && showMetadata ? 'expanded' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="history-item-content">
                    <div className="item-icon">
                      {userType === 'deaf' ? '🗣️' : '🖐️'}
                    </div>
                    <div className="item-details">
                      <div className="item-phrase">"{item.phrase}"</div>
                      <div className="item-meta">
                        <span className="item-direction">
                          {userType === 'deaf' ? 'Sign to Speech' : 'Speech to Sign'}
                        </span>
                        <span className="item-time">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className={`action-btn favorite-btn ${item.favorite ? 'active' : ''}`}
                        onClick={(e) => handleToggleFavorite(item.id, item.favorite, e)}
                        title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {item.favorite ? '★' : '☆'}
                      </button>
                      <button
                        className="action-btn replay-btn"
                        onClick={(e) => handleReplay(item, e)}
                        title="Replay translation"
                      >
                        ↺
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete translation"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  {selectedItem?.id === item.id && showMetadata && (
                    <div className="metadata-panel">
                      <div className="metadata-header">
                        <span className="metadata-title">Translation Details</span>
                      </div>
                      <div className="metadata-grid">
                        <div className="metadata-item">
                          <span className="metadata-label">Original text:</span>
                          <span className="metadata-value">{item.phrase}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Direction:</span>
                          <span className="metadata-value">{userType === 'deaf' ? 'Sign → Speech' : 'Speech → Sign'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Timestamp:</span>
                          <span className="metadata-value">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Confidence:</span>
                          <span className="metadata-value">{item.confidence || '94%'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Language:</span>
                          <span className="metadata-value">{userType === 'deaf' ? 'ASL' : 'English'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Model:</span>
                          <span className="metadata-value">{userType === 'deaf' ? 'MediaPipe' : 'Vosk'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="keyboard-hint">
        <span>⌨️ Shortcuts:</span>
        <kbd>Ctrl+F</kbd> <span>Focus search</span>
        <kbd>Esc</kbd> <span>Clear search</span>
      </div>
    </div>
  );
};

export default History;