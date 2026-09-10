import { useState } from 'react';
import api from '../api/api';

function JoinGroup() {
  const [code, setCode] = useState('');

  const handleJoinGroup = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/invitations/join', {
        code: code
      });

      console.log('Groupe rejoint avec succès', response.data);
    } catch (error) {
      console.error('Erreur lors de la tentative de rejoindre le groupe', error);
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
          />
        </div>

        <button type="submit">
          Rejoindre le groupe
        </button>

      </form>
    </div>
  );
}

export default JoinGroup;