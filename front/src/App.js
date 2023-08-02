//import ReactDom from 'react-dom/client';
import React from 'react';
import './App.css';
import Home from './pages';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Harvest from './pages/harvest';

// https://www.npmjs.com/package/react-router-dom

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} exact />
      <Route path="/Harvest" element={<Harvest/>} exact />
    </Routes>
    </BrowserRouter>
  );
}
// const root = ReactDom.createRoot(document.getElementById('root'));
// root.render(<App />);