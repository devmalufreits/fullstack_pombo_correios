import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientesAPI } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';

export default function ClienteEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ nome: '', email: '', data_nascimento: '', endereco: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    setLoading(true);
    clientesAPI
      .getById(id)
      .then((res) => {
        if (!active) return;
        const c = res.data?.data || res.data || {};
        setForm({
          nome: c.nome || '',
          email: c.email || '',
          data_nascimento: c.data_nascimento ? c.data_nascimento.substring(0, 10) : '',
          endereco: c.endereco || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nome || !form.email) {
      setError('Preencha nome e email.');
      return;
    }

    try {
      setSubmitting(true);
      await clientesAPI.update(id, form);
      toast.success('Cliente atualizado com sucesso');
      navigate('/clientes');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao atualizar cliente';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Carregando cliente...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Editar Cliente</h2>
        <Link to="/clientes" className="btn-outline">Voltar</Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 card">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            type="text"
            name="nome"
            className="input-field"
            placeholder="Ex.: João Silva"
            value={form.nome}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
          <input
            type="date"
            name="data_nascimento"
            className="input-field"
            value={form.data_nascimento}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <input
            type="text"
            name="endereco"
            className="input-field"
            placeholder="Rua, número, bairro"
            value={form.endereco}
            onChange={onChange}
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
          <Link to="/clientes" className="btn-outline">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
