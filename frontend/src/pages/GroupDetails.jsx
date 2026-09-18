
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);

    useEffect(() => {
        const getGroupDetails = async () => {
            try {
                const response = await api.get(`/groups/${groupId}`);
                setGroup(response.data);
            } catch (error) {
                console.error(
                    'Erreur lors de la récupération du groupe',
                    error
                );
            }
        };

        getGroupDetails();
    }, [groupId]);

    if (!group) {
        return <p>Chargement...</p>;
    }

    return (
        <div>
            <h1>{group.name}</h1>

            <p>Type : {group.type}</p>

            <p>Devise : {group.default_currency}</p>

            <button
                onClick={() =>
                    navigate(`/groups/${groupId}/activities`)
                }
            >
                Voir l'activité
            </button>

            <h2>Membres</h2>

            {group.members.map((member) => (
                <div key={member.user_id}>
                    <p>
                        {member.first_name} {member.last_name}
                    </p>

                    <p>Rôle : {member.role}</p>
                </div>
            ))}
        </div>
    );
}

export default GroupDetails;

