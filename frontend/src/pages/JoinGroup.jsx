
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function JoinGroup() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleJoinGroup = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMessage('');

    const invitationCode = code.trim();

    if (!invitationCode) {
      setErrorMessage('Veuillez entrer un code d’invitation.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/invitations/join', {
        code: invitationCode
      });

      console.log(
        'Groupe rejoint avec succès',
        response.data
      );

      navigate(`/groups/${response.data.group_id}`);
    } catch (error) {
      console.error(
        'Erreur lors de la tentative de rejoindre le groupe',
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
        'Impossible de rejoindre le groupe.'
      );

      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Rejoindre un groupe</h1>

      <form onSubmit={handleJoinGroup}>

        <div>
          <label>Code d'invitation</label>

          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Exemple : 288C51"
            disabled={loading}
          />
        </div>

        {errorMessage && (
          <p>{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Connexion au groupe...'
            : 'Rejoindre le groupe'}
        </button>

      </form>
    </div>
  );
}

export default JoinGroup;
