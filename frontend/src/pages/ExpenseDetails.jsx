import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import api from '../api/api';


// ============================================================
// EXPENSE DETAILS
// ============================================================

function ExpenseDetails() {

    const { groupId, expenseId } = useParams();

    const navigate = useNavigate();


    // ============================================================
    // STATES
    // ============================================================

    const [expense, setExpense] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    const [history, setHistory] = useState([]);

    const [historyLoading, setHistoryLoading] = useState(true);

    const [historyError, setHistoryError] = useState('');

    const [deleting, setDeleting] = useState(false);


    // ============================================================
    // LOAD EXPENSE DETAILS
    // ============================================================

    useEffect(() => {

        if (!groupId || !expenseId) {
            return;
        }

        const fetchExpenseDetails = async () => {

            try {

                setLoading(true);

                setError('');


                const response = await api.get(
                    `/groups/${groupId}/expenses/${expenseId}`
                );


                setExpense(response.data);

            } catch (error) {

                console.error(
                    'Erreur lors du chargement de la dépense :',
                    error
                );


                setError(
                    error.response?.data?.message ||
                    'Impossible de charger la dépense.'
                );

            } finally {

                setLoading(false);
            }
        };


        fetchExpenseDetails();

    }, [groupId, expenseId]);


    // ============================================================
    // LOAD EXPENSE HISTORY
    // ============================================================

    useEffect(() => {

        if (!groupId || !expenseId) {
            return;
        }

        const fetchHistory = async () => {

            try {

                setHistoryLoading(true);

                setHistoryError('');


                const response = await api.get(
                    `/groups/${groupId}/expenses/${expenseId}/history`
                );


                setHistory(
                    response.data || []
                );

            } catch (error) {

                console.error(
                    "Erreur lors du chargement de l'historique :",
                    error
                );


                setHistoryError(
                    error.response?.data?.message ||
                    "Impossible de charger l'historique."
                );

            } finally {

                setHistoryLoading(false);
            }
        };


        fetchHistory();

    }, [groupId, expenseId]);


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {

        if (!date) {
            return 'Date inconnue';
        }

        return new Date(date).toLocaleDateString(
            'fr-FR'
        );
    };


    // ============================================================
    // FORMAT DATE + TIME
    // ============================================================

    const formatDateTime = (date) => {

        if (!date) {
            return 'Date inconnue';
        }

        return new Date(date).toLocaleString(
            'fr-FR'
        );
    };


    // ============================================================
    // FORMAT MONEY
    // ============================================================

    const formatMoney = (amount) => {

        const value = Number(amount);

        if (!Number.isFinite(value)) {
            return '0.00';
        }

        return value.toFixed(2);
    };


    // ============================================================
    // FORMAT SPLIT MODE
    // ============================================================

    const getSplitModeLabel = (mode) => {

        switch (mode) {

            case 'equal':
                return 'Parts égales';

            case 'exact':
                return 'Montants exacts';

            case 'shares':
                return 'Parts';

            case 'percentage':
                return 'Pourcentages';

            default:
                return mode || 'Inconnu';
        }
    };


    // ============================================================
    // FORMAT HISTORY ACTION
    // ============================================================

    const getHistoryActionLabel = (actionType) => {

        switch (actionType) {

            case 'created':
                return 'a créé la dépense';

            case 'updated':
                return 'a modifié la dépense';

            case 'deleted':
                return 'a supprimé la dépense';

            default:
                return actionType || 'a effectué une action';
        }
    };


    // ============================================================
    // PARSE HISTORY DATA
    // ============================================================

    const parseHistoryData = (data) => {

        if (!data) {
            return null;
        }


        if (typeof data === 'object') {
            return data;
        }


        try {

            return JSON.parse(data);

        } catch {

            return null;
        }
    };


    // ============================================================
    // DELETE EXPENSE
    // ============================================================

    const handleDelete = async () => {

        const confirmed = window.confirm(
            'Voulez-vous vraiment supprimer cette dépense ?'
        );


        if (!confirmed) {
            return;
        }


        try {

            setDeleting(true);


            await api.delete(
                `/groups/${groupId}/expenses/${expenseId}`
            );


            navigate(
                `/groups/${groupId}/expenses`
            );

        } catch (error) {

            console.error(
                'Erreur lors de la suppression de la dépense :',
                error
            );


            alert(
                error.response?.data?.message ||
                'Impossible de supprimer la dépense.'
            );

        } finally {

            setDeleting(false);
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div>

                <p>
                    Chargement de la dépense...
                </p>

            </div>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (

            <div>

                <p style={{ color: 'red' }}>
                    {error}
                </p>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/groups/${groupId}/expenses`
                        )
                    }
                >
                    ← Retour aux dépenses
                </button>

            </div>
        );
    }


    // ============================================================
    // EXPENSE NOT FOUND
    // ============================================================

    if (!expense) {

        return (

            <div>

                <p>
                    Dépense introuvable.
                </p>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/groups/${groupId}/expenses`
                        )
                    }
                >
                    ← Retour aux dépenses
                </button>

            </div>
        );
    }


    // ============================================================
    // SHARES
    // ============================================================

    const shares = Array.isArray(expense.shares)
        ? expense.shares
        : [];


    // ============================================================
    // TOTAL SHARES
    // ============================================================

    const totalShares = shares.reduce(
        (total, share) => {

            return (
                total +
                Number(
                    share.share_amount || 0
                )
            );

        },
        0
    );


    // ============================================================
    // EXPENSE AMOUNT
    // ============================================================

    const expenseAmount =
        Number(expense.amount || 0);


    // ============================================================
    // CHECK TOTAL
    // ============================================================

    const sharesMatchAmount =
        Math.abs(
            totalShares -
            expenseAmount
        ) < 0.01;


    // ============================================================
    // PAYER NAME
    // ============================================================

    const payerName = expense.payer

        ? `${expense.payer.first_name || ''} ${expense.payer.last_name || ''}`.trim()

        : `Utilisateur #${expense.payer_id || '?'}`;


    // ============================================================
    // UI
    // ============================================================

    return (

        <div>


            {/* ================================================== */}
            {/* ACTIONS */}
            {/* ================================================== */}

            <div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/groups/${groupId}/expenses`
                        )
                    }
                >
                    ← Retour aux dépenses
                </button>


                {' '}


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/groups/${groupId}/expenses/${expenseId}/edit`
                        )
                    }
                >
                    ✏️ Modifier la dépense
                </button>


                {' '}


                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                >
                    {deleting
                        ? 'Suppression...'
                        : '🗑️ Supprimer la dépense'}
                </button>

            </div>


            <br />


            {/* ================================================== */}
            {/* MAIN INFORMATION */}
            {/* ================================================== */}

            <h1>
                {expense.title}
            </h1>


            <h2>

                {formatMoney(
                    expense.amount
                )}

                {' '}

                {expense.currency}

            </h2>


            {/* ================================================== */}
            {/* PAYER */}
            {/* ================================================== */}

            <p>

                <strong>
                    Payé par :
                </strong>

                {' '}

                {payerName}

            </p>


            {/* ================================================== */}
            {/* CATEGORY */}
            {/* ================================================== */}

            <p>

                <strong>
                    Catégorie :
                </strong>

                {' '}

                {expense.category_name ||
                    'Aucune catégorie'}

            </p>


            {/* ================================================== */}
            {/* SPLIT MODE */}
            {/* ================================================== */}

            <p>

                <strong>
                    Mode de partage :
                </strong>

                {' '}

                {getSplitModeLabel(
                    expense.split_mode
                )}

            </p>


            {/* ================================================== */}
            {/* EXPENSE DATE */}
            {/* ================================================== */}

            <p>

                <strong>
                    Date :
                </strong>

                {' '}

                {formatDate(
                    expense.expense_date
                )}

            </p>


            {/* ================================================== */}
            {/* EXCHANGE RATE */}
            {/* ================================================== */}

            {expense.exchange_rate !== null &&
                expense.exchange_rate !== undefined && (

                    <p>

                        <strong>
                            Taux de change :
                        </strong>

                        {' '}

                        {expense.exchange_rate}

                    </p>
                )}


            <hr />


            {/* ================================================== */}
            {/* PARTICIPANTS */}
            {/* ================================================== */}

            <h2>
                Participants
            </h2>


            {shares.length === 0 ? (

                <p>
                    Aucun participant.
                </p>

            ) : (

                <div>

                    {shares.map((share) => {

                        const participantName =
                            `${share.first_name || ''} ${share.last_name || ''}`.trim()
                            || `Utilisateur #${share.user_id}`;


                        return (

                            <div
                                key={share.user_id}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    borderRadius: '8px'
                                }}
                            >

                                {/* ================================= */}
                                {/* USER */}
                                {/* ================================= */}

                                <p>

                                    <strong>
                                        {participantName}
                                    </strong>

                                </p>


                                {/* ================================= */}
                                {/* AMOUNT */}
                                {/* ================================= */}

                                <p>

                                    <strong>
                                        Montant :
                                    </strong>

                                    {' '}

                                    {formatMoney(
                                        share.share_amount
                                    )}

                                    {' '}

                                    {expense.currency}

                                </p>


                                {/* ================================= */}
                                {/* SHARE VALUE */}
                                {/* ================================= */}

                                {share.share_value !== null &&
                                    share.share_value !== undefined && (

                                        <p>

                                            <strong>

                                                {expense.split_mode ===
                                                'percentage'

                                                    ? 'Pourcentage :'

                                                    : expense.split_mode ===
                                                      'shares'

                                                    ? 'Parts :'

                                                    : expense.split_mode ===
                                                      'exact'

                                                    ? 'Montant exact :'

                                                    : 'Valeur :'}

                                            </strong>

                                            {' '}

                                            {share.share_value}

                                            {expense.split_mode ===
                                                'percentage' &&
                                                ' %'}

                                        </p>

                                    )}

                            </div>
                        );
                    })}


                    {/* ================================================= */}
                    {/* TOTAL */}
                    {/* ================================================= */}

                    <hr />


                    <p>

                        <strong>
                            Total des parts :
                        </strong>

                        {' '}

                        {formatMoney(
                            totalShares
                        )}

                        {' '}

                        {expense.currency}

                    </p>


                    <p>

                        <strong>
                            Montant de la dépense :
                        </strong>

                        {' '}

                        {formatMoney(
                            expense.amount
                        )}

                        {' '}

                        {expense.currency}

                    </p>


                    {/* ================================================= */}
                    {/* VALIDATION */}
                    {/* ================================================= */}

                    <p
                        style={{
                            color: sharesMatchAmount
                                ? 'green'
                                : 'red'
                        }}
                    >

                        {sharesMatchAmount

                            ? '✓ La répartition correspond au montant total.'

                            : '⚠ La répartition ne correspond pas au montant total.'}

                    </p>

                </div>
            )}


            {/* ================================================== */}
            {/* HISTORY */}
            {/* ================================================== */}

            <hr />


            <h2>
                Historique des modifications
            </h2>


            {/* ================================================== */}
            {/* HISTORY LOADING */}
            {/* ================================================== */}

            {historyLoading && (

                <p>
                    Chargement de l'historique...
                </p>

            )}


            {/* ================================================== */}
            {/* HISTORY ERROR */}
            {/* ================================================== */}

            {!historyLoading &&
                historyError && (

                    <p style={{ color: 'red' }}>
                        {historyError}
                    </p>

                )}


            {/* ================================================== */}
            {/* NO HISTORY */}
            {/* ================================================== */}

            {!historyLoading &&
                !historyError &&
                history.length === 0 && (

                    <p>
                        Aucune modification enregistrée.
                    </p>

                )}


            {/* ================================================== */}
            {/* HISTORY LIST */}
            {/* ================================================== */}

            {!historyLoading &&
                !historyError &&
                history.length > 0 && (

                    <div>

                        {history.map((item) => {

                            const oldData =
                                parseHistoryData(
                                    item.old_data
                                );


                            const newData =
                                parseHistoryData(
                                    item.new_data
                                );


                            const userName =
                                `${item.first_name || ''} ${item.last_name || ''}`.trim()
                                || `Utilisateur #${item.user_id}`;


                            return (

                                <div
                                    key={item.id}
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '15px',
                                        marginBottom: '10px',
                                        borderRadius: '8px'
                                    }}
                                >

                                    {/* ================================= */}
                                    {/* USER + ACTION */}
                                    {/* ================================= */}

                                    <p>

                                        <strong>
                                            {userName}
                                        </strong>

                                        {' '}

                                        {getHistoryActionLabel(
                                            item.action_type
                                        )}

                                    </p>


                                    {/* ================================= */}
                                    {/* ACTION TYPE */}
                                    {/* ================================= */}

                                    <p>

                                        <strong>
                                            Action :
                                        </strong>

                                        {' '}

                                        {item.action_type}

                                    </p>


                                    {/* ================================= */}
                                    {/* DATE */}
                                    {/* ================================= */}

                                    <p>

                                        <strong>
                                            Date :
                                        </strong>

                                        {' '}

                                        {formatDateTime(
                                            item.created_at
                                        )}

                                    </p>


                                    {/* ================================= */}
                                    {/* OLD DATA */}
                                    {/* ================================= */}

                                    {oldData && (

                                        <div>

                                            <p>

                                                <strong>
                                                    Anciennes données :
                                                </strong>

                                            </p>


                                            <pre
                                                style={{
                                                    background: '#f5f5f5',
                                                    padding: '10px',
                                                    overflowX: 'auto'
                                                }}
                                            >
                                                {JSON.stringify(
                                                    oldData,
                                                    null,
                                                    2
                                                )}
                                            </pre>

                                        </div>

                                    )}


                                    {/* ================================= */}
                                    {/* NEW DATA */}
                                    {/* ================================= */}

                                    {newData && (

                                        <div>

                                            <p>

                                                <strong>
                                                    Nouvelles données :
                                                </strong>

                                            </p>


                                            <pre
                                                style={{
                                                    background: '#f5f5f5',
                                                    padding: '10px',
                                                    overflowX: 'auto'
                                                }}
                                            >
                                                {JSON.stringify(
                                                    newData,
                                                    null,
                                                    2
                                                )}
                                            </pre>

                                        </div>

                                    )}

                                </div>
                            );
                        })}

                    </div>

                )}


            <br />


            {/* ================================================== */}
            {/* BACK TO GROUP */}
            {/* ================================================== */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/groups/${groupId}`
                    )
                }
            >
                ← Retour au groupe
            </button>

        </div>
    );
}


// ============================================================
// EXPORT
// ============================================================

export default ExpenseDetails;