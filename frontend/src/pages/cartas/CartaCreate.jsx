import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartasAPI, clientesAPI, pombosAPI } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';

export default function CartaCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mensagem: '', remetente_id: '', destinatario_id: '', pombo_id: '' });
  const [clientes, setClientes] = useState([]);
  const [pombos, setPombos] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [cliRes, pomRes] = await Promise.all([
          clientesAPI.getAll({ limit: 100 }),
          pombosAPI.getAvailable(),
        ]);
        if (!active) return;
        const cliData = cliRes.data?.data || cliRes.data || [];
        const pomData = pomRes.data?.data || pomRes.data || [];
        setClientes(Array.isArray(cliData) ? cliData : cliData.items || []);
        setPombos(Array.isArray(pomData) ? pomData : pomData.items || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        if (active) setLoadingOptions(false);
      }
    }
    loadOptions();
    return () => {
      active = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.mensagem || !form.remetente_id || !form.destinatario_id || !form.pombo_id) {
      setError('Preencha mensagem, remetente, destinatário e selecione um pombo.');
      return;
    }
    if (form.remetente_id === form.destinatario_id) {
      setError('Remetente e destinatário devem ser diferentes.');
      return;
    }

    const payload = {
      mensagem: form.mensagem,
      remetente_id: Number(form.remetente_id),
      destinatario_id: Number(form.destinatario_id),
      pombo_id: Number(form.pombo_id),
    };

    try {
      setSubmitting(true);
      await cartasAPI.create(payload);
      toast.success('Carta cadastrada com sucesso');
      navigate('/cartas');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao cadastrar carta';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Adicionar Carta</h2>
        <Link to="/cartas" className="btn-outline">Voltar</Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 card">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
          <textarea
            name="mensagem"
            className="input-field"
            rows={4}
            placeholder="Escreva sua mensagem..."
            value={form.mensagem}
            onChange={onChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remetente *</label>
            <select
              name="remetente_id"
              className="input-field"
              value={form.remetente_id}
              onChange={onChange}
              disabled={loadingOptions}
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} (#{c.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destinatário *</label>
            <select
              name="destinatario_id"
              className="input-field"
              value={form.destinatario_id}
              onChange={onChange}
              disabled={loadingOptions}
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} (#{c.id})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pombo *</label>
          <select
            name="pombo_id"
            className="input-field"
            value={form.pombo_id}
            onChange={onChange}
            disabled={loadingOptions}
            required
          >
            <option value="">Selecione um pombo disponível</option>
            {pombos.map((p) => (
              <option key={p.id} value={p.id}>{p.apelido} (#{p.id})</option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" className="btn-primary" disabled={submitting || loadingOptions}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
          <Link to="/cartas" className="btn-outline">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
