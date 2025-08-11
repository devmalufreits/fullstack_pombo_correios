import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartasAPI, clientesAPI } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';

export default function CartasList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientesMap, setClientesMap] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        // Load cartas
        const [cartasRes, clientesRes] = await Promise.all([
          cartasAPI.getAll({ limit: 200 }),
          clientesAPI.getAll({ limit: 1000 }),
        ]);
        if (!active) return;
        const cartasPayload = cartasRes.data?.data || cartasRes.data || [];
        const cartas = Array.isArray(cartasPayload) ? cartasPayload : cartasPayload.items || [];
        const clientesPayload = clientesRes.data?.data || clientesRes.data || [];
        const clientes = Array.isArray(clientesPayload) ? clientesPayload : clientesPayload.items || [];
        const map = {};
        clientes.forEach((c) => {
          map[c.id] = c.nome || c.name || `Cliente #${c.id}`;
        });
        setClientesMap(map);
        setData(cartas);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div>Carregando cartas...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cartas</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Total: {data.length}</div>
          <Link to="/cartas/novo" className="btn-primary">Adicionar Carta</Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remetente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatário</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pombo</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((carta) => (
              <tr key={carta.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{carta.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{clientesMap[carta.remetente_id] || carta.remetente_nome || carta.remetente_id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{clientesMap[carta.destinatario_id] || carta.destinatario_nome || carta.destinatario_id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{carta.pombo_id ?? '-'}</td>
                <td className="px-4 py-2 text-sm font-medium">{carta.status}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{carta.created_at ? new Date(carta.created_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    {carta.status === 'na_fila' && (
                      <button
                        className="btn-outline"
                        disabled={updatingId === carta.id}
                        onClick={async () => {
                          const ok = window.confirm(`Enviar carta #${carta.id}?`);
                          if (!ok) return;
                          try {
                            setUpdatingId(carta.id);
                            await cartasAPI.markAsSent(carta.id);
                            toast.success('Carta marcada como enviada');
                            // reload
                            const refreshed = await cartasAPI.getAll({ limit: 200 });
                            const payload = refreshed.data?.data || refreshed.data || [];
                            setData(Array.isArray(payload) ? payload : payload.items || []);
                          } catch (err) {
                            toast.error(err.response?.data?.message || err.message || 'Erro ao enviar carta');
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                      >
                        {updatingId === carta.id ? 'Enviando...' : 'Enviar'}
                      </button>
                    )}
                    {carta.status === 'enviado' && (
                      <>
                        <button
                          className="btn-outline"
                          disabled={updatingId === carta.id}
                          onClick={async () => {
                            const ok = window.confirm(`Marcar carta #${carta.id} como entregue?`);
                            if (!ok) return;
                            try {
                              setUpdatingId(carta.id);
                              await cartasAPI.markAsDelivered(carta.id);
                              toast.success('Carta marcada como entregue');
                              const refreshed = await cartasAPI.getAll({ limit: 200 });
                              const payload = refreshed.data?.data || refreshed.data || [];
                              setData(Array.isArray(payload) ? payload : payload.items || []);
                            } catch (err) {
                              toast.error(err.response?.data?.message || err.message || 'Erro ao marcar como entregue');
                            } finally {
                              setUpdatingId(null);
                            }
                          }}
                        >
                          {updatingId === carta.id ? 'Salvando...' : 'Entregar'}
                        </button>
                        <button
                          className="btn-outline"
                          disabled={updatingId === carta.id}
                          onClick={async () => {
                            const ok = window.confirm(`Mover carta #${carta.id} de volta para a fila?`);
                            if (!ok) return;
                            try {
                              setUpdatingId(carta.id);
                              await cartasAPI.updateStatus(carta.id, 'na_fila');
                              toast.success('Carta movida para a fila');
                              const refreshed = await cartasAPI.getAll({ limit: 200 });
                              const payload = refreshed.data?.data || refreshed.data || [];
                              setData(Array.isArray(payload) ? payload : payload.items || []);
                            } catch (err) {
                              toast.error(err.response?.data?.message || err.message || 'Erro ao mover para fila');
                            } finally {
                              setUpdatingId(null);
                            }
                          }}
                        >
                          {updatingId === carta.id ? 'Movendo...' : 'Voltar para Fila'}
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
