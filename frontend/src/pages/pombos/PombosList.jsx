import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pombosAPI } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';

export default function PombosList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retiringId, setRetiringId] = useState(null);
  // toggling removed
  const toast = useToast();

  const loadPombos = () => {
    let active = true;
    setLoading(true);
    pombosAPI
      .getAll()
      .then((res) => {
        if (!active) return;
        setData(res.data?.data || res.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  };

  // toggle status functionality removido

  useEffect(() => {
    const cleanup = loadPombos();
    return cleanup;
  }, []);

  const aposentarPombo = async (id) => {
    setError(null);
    const pombo = data.find((p) => p.id === id);
    const ok = window.confirm(`Confirmar aposentadoria do pombo "${pombo?.apelido || id}"?`);
    if (!ok) return;
    try {
      setRetiringId(id);
      await pombosAPI.retire(id);
      toast.success('Pombo aposentado com sucesso');
      loadPombos();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao aposentar pombo');
      toast.error(err.response?.data?.message || err.message || 'Erro ao aposentar pombo');
    } finally {
      setRetiringId(null);
    }
  };

  if (loading) return <div>Carregando pombos...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pombos</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Total: {data.length}</div>
          <Link to="/pombos/novo" className="btn-primary">Adicionar Pombo</Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apelido</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Velocidade</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aposentado</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((pombo) => (
              <tr key={pombo.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{pombo.id}</td>
                <td className="px-4 py-2 text-sm text-gray-900 font-medium">{pombo.apelido}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{pombo.velocidade} km/h</td>
                <td className="px-4 py-2 text-sm">{pombo.ativo ? 'Sim' : 'Não'}</td>
                <td className="px-4 py-2 text-sm">{pombo.aposentado ? 'Sim' : 'Não'}</td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    {pombo.aposentado ? (
                      <span className="btn-outline cursor-not-allowed opacity-60 select-none">
                        Aposentado
                      </span>
                    ) : (
                      <>
                        <Link to={`/pombos/${pombo.id}/editar`} className="btn-outline">Editar</Link>
                        <button
                          className="btn-danger"
                          onClick={() => aposentarPombo(pombo.id)}
                          disabled={retiringId === pombo.id}
                        >
                          {retiringId === pombo.id ? 'Aposentando...' : 'Aposentar'}
                        </button>
                      </>
                    )}
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
