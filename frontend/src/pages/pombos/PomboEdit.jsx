import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { pombosAPI } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';

export default function PomboEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [form, setForm] = useState({ apelido: '', velocidade: '', data_nascimento: '', ativo: true, aposentado: false });
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await pombosAPI.getById(id);
        if (!active) return;
        const p = res.data?.data || res.data || {};
        setForm({
          apelido: p.apelido || '',
          velocidade: p.velocidade ?? '',
          data_nascimento: p.data_nascimento ? p.data_nascimento.slice(0, 10) : '',
          ativo: !!p.ativo,
          aposentado: !!p.aposentado,
        });
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Erro ao carregar pombo';
        setError(msg);
        toast.error(msg);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, toast]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.apelido || !form.velocidade || !form.data_nascimento) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.data_nascimento && form.data_nascimento > today) {
      setError('A data de nascimento não pode ser maior que a data atual.');
      return;
    }

    const fd = new FormData();
    fd.append('apelido', form.apelido);
    fd.append('velocidade', String(form.velocidade));
    fd.append('data_nascimento', form.data_nascimento);
    // ativo/aposentado geralmente são controlados por endpoints específicos, então não enviar aqui
    if (foto) fd.append('foto', foto);

    try {
      setSubmitting(true);
      await pombosAPI.update(id, fd);
      toast.success('Pombo atualizado com sucesso');
      navigate('/pombos');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao atualizar pombo';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Carregando dados do pombo...</div>;
  if (error) return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Editar Pombo</h2>
        <Link to="/pombos" className="btn-outline">Voltar</Link>
      </div>
      <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
    </div>
  );

  const isReadOnly = !!form.aposentado;

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Editar Pombo #{id}</h2>
        <Link to="/pombos" className="btn-outline">Voltar</Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
      )}
      {isReadOnly && (
        <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
          Este pombo está aposentado. Edições não são permitidas.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 card">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apelido *</label>
          <input
            type="text"
            name="apelido"
            className="input-field"
            value={form.apelido}
            onChange={onChange}
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Velocidade (km/h) *</label>
          <input
            type="number"
            step="0.1"
            min="0"
            name="velocidade"
            className="input-field"
            value={form.velocidade}
            onChange={onChange}
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
          <input
            type="date"
            name="data_nascimento"
            className="input-field"
            max={today}
            value={form.data_nascimento}
            onChange={onChange}
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700"
            disabled={isReadOnly}
          />
        </div>

        <div className="pt-2 flex gap-3">
          {!isReadOnly && (
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar alterações'}
            </button>
          )}
          <Link to="/pombos" className="btn-outline">{isReadOnly ? 'Voltar' : 'Cancelar'}</Link>
        </div>
      </form>
    </div>
  );
}
