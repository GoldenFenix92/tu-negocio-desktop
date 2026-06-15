import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Algo salió mal</h2>
          <p style={{ color: '#e74c3c' }}>{this.state.error?.message}</p>
          <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Recargar aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
