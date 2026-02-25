import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const TransportTracker = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('All');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();

      const now = new Date();
      const mappedRoutes = data.map((item) => {
        const arrivalMinutes = item.id; 
        
        return {
          id: item.id,
          routeNumber: `Route ${item.userId}`,
          destination: item.title + ' Station',
          arrivalMinutes: arrivalMinutes,
        };
      });

      mappedRoutes.sort((a, b) => a.arrivalMinutes - b.arrivalMinutes);
      
      setRoutes(mappedRoutes);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransportData();
  }, [fetchTransportData]);

  useEffect(() => {
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchTransportData();
      }, 30000);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchTransportData]);

  const filteredRoutes = selectedRoute === 'All' 
    ? routes 
    : routes.filter(route => route.routeNumber === selectedRoute); 

  const nextArrivingId = filteredRoutes.length > 0 ? filteredRoutes[0].id : null;
  const availableRoutes = ['All', 'Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5'];

  return (
    <div className="tracker-wrapper">
      <div className="tracker-container">
        
        <div className="tracker-header">
          <h2>🚌 Transport Tracker</h2>
          <div className="time-text">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--'}
          </div>
        </div>


        <div className="controls">
          <select 
            className="control-select"
            value={selectedRoute} 
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            {availableRoutes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <button 
            className="btn-refresh"
            onClick={fetchTransportData} 
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? '⏳ Refreshing...' : '🔄 Refresh Now'}
          </button>

          <button 
            className={`btn-toggle ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏱️ Auto-Refresh: ON' : '⏱️ Auto-Refresh: OFF'}
          </button>
        </div>

        {error && <div className="error-msg">Error: {error}</div>}

        {!isLoading && filteredRoutes.length === 0 && !error && (
          <div className="empty-msg">No transport found for this route. 🚏</div>
        )}

        <div>
          {filteredRoutes.map((route) => {
            const isNext = route.id === nextArrivingId;
            return (
              <div 
                key={route.id} 
                className={`card ${isNext ? 'card-next' : ''}`}
              >
                <div>
                  <h4>{route.routeNumber}</h4>
                  <div className="time-text">Towards: {route.destination}</div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <h3 className="arrival-time">
                    {route.arrivalMinutes} min
                  </h3>
                  {isNext && <span className="badge">Next Arriving</span>}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default TransportTracker;