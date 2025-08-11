import React from 'react';
import { Link } from 'react-router-dom';
import pigeon from '../assets/pigeon.svg';

export default function Intro() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-neutral2/20 bg-gradient-to-br from-accent/10 via-white to-primary/10">
        <div className="px-6 py-12 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-neutral3 bg-white/60 border border-neutral2/30 rounded-full px-2 py-1">
                Bem-vindo
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-neutral3">
                Olá, Sr Moraes Moreira!
              </h2>
              <p className="mt-3 text-base text-neutral2 max-w-prose">
                Este é o sistema de entrega com pombos-correio. Gerencie pombos, clientes e cartas com simplicidade e elegância.
              </p>
              <div className="mt-5 flex gap-3">
                <Link to="/pombos" className="btn-primary">Ver Pombos</Link>
                <Link to="/cartas/novo" className="btn-secondary">Enviar Carta</Link>
              </div>
            </div>
            <div className="relative flex justify-end">
              <img src={pigeon} alt="Ilustração de um pombo" className="w-64 md:w-80 drop-shadow-md select-none animate-fade-in" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card-hover">
          <h3 className="text-neutral3 font-semibold">Pombos</h3>
          <p className="text-neutral2 text-sm mt-1">Cadastre, edite, ative/desative e aposente pombos.</p>
          <div className="mt-3"><Link to="/pombos" className="btn-outline">Ir para Pombos</Link></div>
        </div>
        <div className="card-hover">
          <h3 className="text-neutral3 font-semibold">Clientes</h3>
          <p className="text-neutral2 text-sm mt-1">Gerencie remetentes e destinatários.</p>
          <div className="mt-3"><Link to="/clientes" className="btn-outline">Ir para Clientes</Link></div>
        </div>
        <div className="card-hover">
          <h3 className="text-neutral3 font-semibold">Cartas</h3>
          <p className="text-neutral2 text-sm mt-1">Crie e acompanhe o status das cartas.</p>
          <div className="mt-3"><Link to="/cartas" className="btn-outline">Ir para Cartas</Link></div>
        </div>
      </section>
    </div>
  );
}
