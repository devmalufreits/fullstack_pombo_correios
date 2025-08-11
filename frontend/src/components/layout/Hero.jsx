import React from 'react';
import pigeon from '../../assets/pigeon.svg';

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50">
      <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/60 border border-sky-200 rounded-full px-2 py-1">
              Entregas rápidas, estilo clássico
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
              Pombos-Correio que levam sua mensagem com carinho
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-prose">
              Cadastre pombos, clientes e cartas. Acompanhe as entregas com um toque de nostalgia
              e um layout moderno.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="/pombos/novo" className="btn-primary">Adicionar Pombo</a>
              <a href="/cartas/novo" className="btn-outline">Enviar Carta</a>
            </div>
          </div>
          <div className="relative flex justify-end">
            <img src={pigeon} alt="Ilustração de um pombo" className="w-56 sm:w-64 md:w-72 lg:w-80 drop-shadow-md select-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
