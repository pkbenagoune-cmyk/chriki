import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../api/api';


// ============================================================
// EXPENSES PAGE
// ============================================================

function Expenses() {

    const { groupId } = useParams();

    const navigate = useNavigate();


    // ============================================================
    // STATES
    // ============================================================

    const [expenses, setExpenses] = useState([]);

    const [categories, setCategories] = useState([]);

    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');


    // ============================================================
    // FILTERS
    // ============================================================

    const [categoryId, setCategoryId] = useState('');

    const [memberId, setMemberId] = useState('');

    const [search, setSearch] = useState('');

    const [startDate, setStartDate] = useState('');

    const [endDate, setEndDate] = useState('');


    // ============================================================
    // PAGINATION
    // ============================================================

    const [page, setPage] = useState(1);

    const [limit] = useState(10);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });


    // ============================================================
    // LOAD MEMBERS + CATEGORIES
    // ============================================================

    useEffect(() => {

        if (!groupId) {
            return;
        }

        const loadFilters = async () => {

            try {

                const [
                    groupResponse,
                    categoriesResponse
                ] = await Promise.all([

                    api.get(
                        `/groups/${groupId}`
                    ),

                    api.get(
                        `/groups/${groupId}/categories`
                    )

                ]);


                // ====================================================
                // MEMBERS
                // ====================================================

                setMembers(
                    groupResponse.data?.members || []
                );


                // ====================================================
                // CATEGORIES
                // ====================================================

                setCategories(
                    categoriesResponse.data || []
                );

            } catch (error) {

                console.error(
                    'Erreur lors du chargement des filtres :',
                    error
                );

                setError(
                    error.response?.data?.message ||
                    'Impossible de charger les données du groupe.'
                );
            }
        };

        loadFilters();

    }, [groupId]);


    // ============================================================
    // LOAD EXPENSES
    // ============================================================

    useEffect(() => {

        if (!groupId) {
            return;
        }

        const loadExpenses = async () => {

            try {

                setLoading(true);

                setError('');


                const response = await api.get(
                    `/groups/${groupId}/expenses`,
                    {
                        params: {
                            page,
                            limit,
                            categoryId: categoryId || undefined,
                            memberId: memberId || undefined,
                            search: search || undefined,
                            startDate: startDate || undefined,
                            endDate: endDate || undefined
                        }
                    }
                );


                // ====================================================
                // EXPENSES
                // ====================================================

                setExpenses(
                    response.data?.expenses || []
                );


                // ====================================================
                // PAGINATION
                // ====================================================

                setPagination(
                    response.data?.pagination || {
                        page: 1,
                        limit,
                        total: 0,
                        totalPages: 1
                    }
                );

            } catch (error) {

                console.error(
                    'Erreur lors du chargement des dépenses :',
                    error
                );

                setError(
                    error.response?.data?.message ||
                    'Impossible de charger les dépenses.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadExpenses();

    }, [
        groupId,
        page,
        limit,
        categoryId,
        memberId,
        search,
        startDate,
        endDate
    ]);


    // ============================================================
    // RESET FILTERS
    // ============================================================

    const resetFilters = () => {

        setCategoryId('');

        setMemberId('');

        setSearch('');

        setStartDate('');

        setEndDate('');

        setPage(1);
    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {

        if (!date) {
            return '-';
        }

        return new Date(date).toLocaleDateString(
            'fr-FR'
        );
    };


    // ============================================================
    // FORMAT AMOUNT
    // ============================================================

    const formatAmount = (amount, currency) => {

        const number = Number(amount);

        if (Number.isNaN(number)) {
            return `0.00 ${currency || ''}`;
        }

        return `${number.toFixed(2)} ${currency || 'DZD'}`;
    };


    // ============================================================
    // SPLIT MODE LABEL
    // ============================================================

    const getSplitModeLabel = (mode) => {

        switch (mode) {

            case 'equal':
                return 'Égal';

            case 'exact':
                return 'Montants exacts';

            case 'shares':
                return 'Parts';

            case 'percentage':
                return 'Pourcentage';

            default:
                return mode || '-';
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div>

                <button
                    onClick={() =>
                        navigate(`/groups/${groupId}`)
                    }
                >
                    ← Retour au groupe
                </button>

                <h1>Dépenses</h1>

                <p>
                    Chargement des dépenses...
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

                <button
                    onClick={() =>
                        navigate(`/groups/${groupId}`)
                    }
                >
                    ← Retour au groupe
                </button>

                <h1>Dépenses</h1>

                <p>
                    {error}
                </p>

                <button
                    onClick={() => window.location.reload()}
                >
                    Réessayer
                </button>

            </div>
        );
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div>

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div>

                <button
                    onClick={() =>
                        navigate(`/groups/${groupId}`)
                    }
                >
                    ← Retour au groupe
                </button>

                <h1>
                    Dépenses du groupe
                </h1>

                <button
                    onClick={() =>
                        navigate(
                            `/groups/${groupId}/expenses/new`
                        )
                    }
                >
                    + Ajouter une dépense
                </button>

            </div>


            {/* ================================================== */}
            {/* FILTERS */}
            {/* ================================================== */}

            <div>

                <h2>
                    Filtres
                </h2>


                {/* SEARCH */}

                <div>

                    <label>
                        Recherche
                    </label>

                    <input
                        type="text"
                        placeholder="Rechercher une dépense..."
                        value={search}
                        onChange={(event) => {

                            setSearch(
                                event.target.value
                            );

                            setPage(1);
                        }}
                    />

                </div>


                {/* CATEGORY */}

                <div>

                    <label>
                        Catégorie
                    </label>

                    <select
                        value={categoryId}
                        onChange={(event) => {

                            setCategoryId(
                                event.target.value
                            );

                            setPage(1);
                        }}
                    >

                        <option value="">
                            Toutes les catégories
                        </option>

                        {categories.map((category) => (

                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>

                        ))}

                    </select>

                </div>


                {/* MEMBER */}

                <div>

                    <label>
                        Membre
                    </label>

                    <select
                        value={memberId}
                        onChange={(event) => {

                            setMemberId(
                                event.target.value
                            );

                            setPage(1);
                        }}
                    >

                        <option value="">
                            Tous les membres
                        </option>

                        {members.map((member) => (

                            <option
                                key={member.user_id}
                                value={member.user_id}
                            >
                                {member.first_name} {member.last_name}
                            </option>

                        ))}

                    </select>

                </div>


                {/* START DATE */}

                <div>

                    <label>
                        Du
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) => {

                            setStartDate(
                                event.target.value
                            );

                            setPage(1);
                        }}
                    />

                </div>


                {/* END DATE */}

                <div>

                    <label>
                        Au
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) => {

                            setEndDate(
                                event.target.value
                            );

                            setPage(1);
                        }}
                    />

                </div>


                {/* RESET */}

                <button
                    onClick={resetFilters}
                >
                    Réinitialiser
                </button>

            </div>


            {/* ================================================== */}
            {/* TOTAL */}
            {/* ================================================== */}

            <p>
                Total : {pagination.total || 0} dépense(s)
            </p>


            {/* ================================================== */}
            {/* EXPENSE LIST */}
            {/* ================================================== */}

            {expenses.length === 0 ? (

                <div>

                    <p>
                        Aucune dépense trouvée.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/groups/${groupId}/expenses/new`
                            )
                        }
                    >
                        Ajouter la première dépense
                    </button>

                </div>

            ) : (

                <div>

                    {expenses.map((expense) => (

                        <div
                            key={expense.id}
                            onClick={() =>
                                navigate(
                                    `/groups/${groupId}/expenses/${expense.id}`
                                )
                            }
                            style={{
                                border: '1px solid #ddd',
                                padding: '15px',
                                marginBottom: '10px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >

                            {/* TITLE */}

                            <h3>
                                {expense.title}
                            </h3>


                            {/* AMOUNT */}

                            <p>
                                <strong>
                                    {formatAmount(
                                        expense.amount,
                                        expense.currency
                                    )}
                                </strong>
                            </p>


                            {/* CATEGORY */}

                            <p>
                                Catégorie :{' '}
                                {expense.category_name || '-'}
                            </p>


                            {/* PAYER */}

                            <p>
                                Payé par :{' '}

                                {expense.payer_first_name || ''}
                                {' '}
                                {expense.payer_last_name || ''}
                            </p>


                            {/* DATE */}

                            <p>
                                Date :{' '}
                                {formatDate(
                                    expense.expense_date
                                )}
                            </p>


                            {/* SPLIT MODE */}

                            <p>
                                Répartition :{' '}

                                {getSplitModeLabel(
                                    expense.split_mode
                                )}
                            </p>

                        </div>

                    ))}

                </div>

            )}


            {/* ================================================== */}
            {/* PAGINATION */}
            {/* ================================================== */}

            {pagination.totalPages > 1 && (

                <div>

                    <button
                        disabled={page <= 1}
                        onClick={() =>
                            setPage(
                                (currentPage) =>
                                    currentPage - 1
                            )
                        }
                    >
                        ← Précédent
                    </button>


                    <span>
                        {' '}
                        Page {pagination.page || page}
                        {' '}
                        /{' '}
                        {pagination.totalPages}
                        {' '}
                    </span>


                    <button
                        disabled={
                            page >= pagination.totalPages
                        }
                        onClick={() =>
                            setPage(
                                (currentPage) =>
                                    currentPage + 1
                            )
                        }
                    >
                        Suivant →
                    </button>

                </div>

            )}

        </div>
    );
}


// ============================================================
// EXPORT
// ============================================================

export default Expenses;