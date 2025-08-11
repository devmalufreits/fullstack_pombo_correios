import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientesAPI } from '../../services/api';

export default function ClientesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    clientesAPI
      .getAll({ page: 1, limit: 50 })
      .then((res) => {
        if (!active) return;
        const payload = res.data?.data || res.data || [];
        // algumas APIs retornam { data: [], total, page }
        setData(Array.isArray(payload) ? payload : payload.items || []);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div>Carregando clientes...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clientes</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Total: {data.length}</div>
          <Link to="/clientes/novo" className="btn-primary">Adicionar Cliente</Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{c.id}</td>
                <td className="px-4 py-2 text-sm text-gray-900 font-medium">{c.nome}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{c.email}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex gap-2">
                    <Link to={`/clientes/${c.id}/editar`} className="btn-outline">Editar</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
