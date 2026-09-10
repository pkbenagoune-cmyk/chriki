import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

function Groups() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const response = await api.get('/groups');

        setGroups(response.data);
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des groupes',
          error
        );
      }
    };

    getGroups();
  }, []);

  return (
    <div>
      <h1>Mes groupes</h1>

      <Link to="/groups/create">
        Créer un groupe
      </Link>

      <br />

      <Link to="/groups/join">
        Rejoindre un groupe
      </Link>

      <h2>Mes groupes</h2>

      {groups.map((group) => (
        <div key={group.id}>

          <Link to={`/groups/${group.id}`}>
            <h3>{group.name}</h3>
          </Link>

          <p>Type : {group.type}</p>
          <p>Devise : {group.default_currency}</p>
          <p>Rôle : {group.role}</p>

        </div>
      ))}
    </div>
  );
}

export default Groups;