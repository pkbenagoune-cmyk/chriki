
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function CreateGroup() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCreateGroup = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/groups', {
        name: name,
        type: type,
        default_currency: defaultCurrency
      });

      console.log('Groupe créé avec succès', response.data);

      navigate(`/groups/${response.data.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du groupe', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Créer un groupe</h1>

      <form onSubmit={handleCreateGroup}>

        <div>
          <label>Nom du groupe</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label>Type du groupe</label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">Choisir un type</option>
            <option value="trip">Voyage</option>
            <option value="home">Maison</option>
            <option value="event">Événement</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label>Devise</label>
          <select
            value={defaultCurrency}
            onChange={(event) => setDefaultCurrency(event.target.value)}
          >
            <option value="">Choisir une devise</option>
            <option value="DZD">DZD</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Création en cours...' : 'Créer le groupe'}
        </button>

      </form>
    </div>
  );
}

export default CreateGroup;
