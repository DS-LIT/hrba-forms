// App.jsx
import React from 'react';
import AppRoutes from './routes/appRoute';
import './App.css';
import AppBar from './components/appBar';

function App() {
  return (
    <div className='App'>
      <div className='container'>
        <AppBar />
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;