import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

function ActivityFeed() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getActivities = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get(
                    `/groups/${groupId}/activities`
                );

                setActivities(response.data || []);

            } catch (error) {
                console.error(
                    'Erreur lors de la récupération des activités',
                    error
                );

                setError(
                    error.response?.data?.message ||
                    'Impossible de récupérer les activités.'
                );

            } finally {
                setLoading(false);
            }
        };

        getActivities();
    }, [groupId]);

    const getUserName = (activity) => {
        if (activity.first_name || activity.last_name) {
            return `${activity.first_name || ''} ${activity.last_name || ''}`.trim();
        }

        return `Utilisateur #${activity.user_id}`;
    };

    const getActionText = (activity) => {
        switch (activity.action_type) {
            case 'expense_created':
                return 'a créé une dépense';

            case 'expense_updated':
                return 'a modifié une dépense';

            case 'expense_deleted':
                return 'a supprimé une dépense';

            case 'group_created':
                return 'a créé le groupe';

            case 'group_updated':
                return 'a modifié le groupe';

            case 'group_archived':
                return 'a archivé le groupe';

            case 'member_joined':
                return 'a rejoint le groupe';

            case 'member_removed':
                return 'a retiré un membre';

            case 'invitation_created':
                return 'a créé une invitation';

            default:
                return activity.action_type || 'a effectué une action';
        }
    };

    const getMetadata = (metadata) => {
        if (!metadata) {
            return {};
        }

        if (typeof metadata === 'object') {
            return metadata;
        }

        try {
            return JSON.parse(metadata);
        } catch (error) {
            return {};
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return '';
        }

        return new Date(date).toLocaleString('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    if (loading) {
        return <p>Chargement des activités...</p>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>

                <button onClick={() => navigate(`/groups/${groupId}`)}>
                    Retour au groupe
                </button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={() => navigate(`/groups/${groupId}`)}>
                ← Retour au groupe
            </button>

            <h1>Activité du groupe</h1>

            {activities.length === 0 ? (
                <p>Aucune activité pour le moment.</p>
            ) : (
                <div>
                    {activities.map((activity) => {
                        const metadata = getMetadata(activity.metadata);

                        return (
                            <div
                                key={activity.id}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    borderRadius: '8px'
                                }}
                            >
                                <p>
                                    <strong>
                                        {getUserName(activity)}
                                    </strong>{' '}
                                    {getActionText(activity)}
                                </p>

                                {metadata.title && (
                                    <p>
                                        Dépense : <strong>{metadata.title}</strong>
                                    </p>
                                )}

                                {metadata.amount !== undefined && (
                                    <p>
                                        Montant :{' '}
                                        <strong>
                                            {metadata.amount}
                                        </strong>
                                    </p>
                                )}

                                <small>
                                    {formatDate(activity.created_at)}
                                </small>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ActivityFeed;