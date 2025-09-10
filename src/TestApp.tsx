import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀 AgentBooster</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          React está funcionando correctamente
        </p>
        <div style={{
          background: 'rgba(0, 255, 0, 0.2)',
          padding: '10px 20px',
          borderRadius: '10px',
          display: 'inline-block'
        }}>
          ✅ Aplicación React activa
        </div>
        <p style={{ marginTop: '20px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'underline' }}>
            Ir a la aplicación principal
          </a>
        </p>
      </div>
    </div>
  );
};

export default TestApp;
