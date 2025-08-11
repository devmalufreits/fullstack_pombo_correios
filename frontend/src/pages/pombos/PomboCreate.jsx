import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pombosAPI } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';

export default function PomboCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ apelido: '', velocidade: '', data_nascimento: '' });
  const [foto, setFoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const toast = useToast();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.apelido || !form.velocidade || !form.data_nascimento) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    // Validação: data de nascimento não pode ser futura
    if (form.data_nascimento && form.data_nascimento > today) {
      setError('A data de nascimento não pode ser maior que a data atual.');
      return;
    }

    const fd = new FormData();
    fd.append('apelido', form.apelido);
    fd.append('velocidade', String(form.velocidade));
    fd.append('data_nascimento', form.data_nascimento);
    if (foto) fd.append('foto', foto);

    try {
      setSubmitting(true);
      await pombosAPI.create(fd);
      toast.success('Pombo cadastrado com sucesso');
      navigate('/pombos');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao cadastrar pombo';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Adicionar Pombo</h2>
        <Link to="/pombos" className="btn-outline">Voltar</Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 card">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apelido *</label>
          <input
            type="text"
            name="apelido"
            className="input-field"
            placeholder="Ex.: Flash"
            value={form.apelido}
            onChange={onChange}
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
            placeholder="Ex.: 45.5"
            value={form.velocidade}
            onChange={onChange}
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
          />
          <p className="mt-1 text-xs text-gray-500">Formatos: jpg, jpeg, png, gif. Máx: 5MB.</p>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
          <Link to="/pombos" className="btn-outline">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
