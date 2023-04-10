import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from 'component/header/header';
import Overview from 'pages/overview/overview';
import './App.css';

function App() {

  return (
    <BrowserRouter>
    <div className="container">
      <div className="main">
        <Header />
        <Routes>
          <Route path='/' element={<Navigate to='/overview' />} />
          <Route path='/overview' element={<Overview />} />
        </Routes>
      </div>
    </div>
  </BrowserRouter>
  );
}

export default App;
