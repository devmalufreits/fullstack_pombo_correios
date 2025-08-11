import React from 'react';
import { Routes, Route, NavLink, Navigate, Link } from 'react-router-dom';
import PombosList from './pages/pombos/PombosList';
import PomboCreate from './pages/pombos/PomboCreate';
import PomboEdit from './pages/pombos/PomboEdit';
import ClientesList from './pages/clientes/ClientesList';
import ClienteCreate from './pages/clientes/ClienteCreate';
import ClienteEdit from './pages/clientes/ClienteEdit';
import CartasList from './pages/cartas/CartasList';
import CartaCreate from './pages/cartas/CartaCreate';
import pigeon from './assets/pigeon.svg';
import Intro from './pages/Intro';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={pigeon} alt="Pombo logo" className="h-8 w-8" />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">Delivery Pombos-Correio</span>
          </Link>
          <nav className="flex gap-2">
            <NavItem to="/pombos">Pombos</NavItem>
            <NavItem to="/clientes">Clientes</NavItem>
            <NavItem to="/cartas">Cartas</NavItem>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/pombos" element={<PombosList />} />
          <Route path="/pombos/novo" element={<PomboCreate />} />
          <Route path="/pombos/:id/editar" element={<PomboEdit />} />
          <Route path="/clientes" element={<ClientesList />} />
          <Route path="/clientes/novo" element={<ClienteCreate />} />
          <Route path="/clientes/:id/editar" element={<ClienteEdit />} />
          <Route path="/cartas" element={<CartasList />} />
          <Route path="/cartas/novo" element={<CartaCreate />} />
          <Route path="*" element={<div className="text-gray-700">Página não encontrada.</div>} />
        </Routes>
      </main>

      <footer className="mt-10 py-6 text-center text-sm text-gray-500">
        <span>© {new Date().getFullYear()} Pombos-Correio</span>
      </footer>
    </div>
  );
}
