import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';


// ============================================================
// CREATE EXPENSE
// ============================================================

function CreateExpense() {

    const { groupId } = useParams();
    const navigate = useNavigate();


    // ============================================================
    // INFORMATIONS DEPENSE
    // ============================================================

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('DZD');
    const [expenseDate, setExpenseDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [payerId, setPayerId] = useState('');


    // ============================================================
    // DONNEES GROUPE
    // ============================================================

    const [members, setMembers] = useState([]);
    const [categories, setCategories] = useState([]);


    // ============================================================
    // PARTICIPANTS
    // ============================================================

    const [participants, setParticipants] = useState([]);


    // ============================================================
    // MODE DE PARTAGE
    // ============================================================

    const [splitMode, setSplitMode] = useState('equal');


    // ============================================================
    // VALEURS DES MODES
    // ============================================================

    const [exactAmounts, setExactAmounts] = useState({});
    const [shares, setShares] = useState({});
    const [percentages, setPercentages] = useState({});


    // ============================================================
    // ETATS
    // ============================================================

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');


   // ============================================================
// CHARGER GROUPE + MEMBRES + CATEGORIES
// ============================================================

useEffect(() => {

    if (!groupId) {
        return;
    }

    const loadData = async () => {

        try {

            setLoading(true);
            setError('');

            // ====================================================
            // GROUPE ET MEMBRES
            // ====================================================

            const groupResponse =
                await api.get(
                    `/groups/${groupId}`
                );

            const groupMembers =
                groupResponse.data?.members || [];

            setMembers(
                groupMembers.map(member => ({
                    id: Number(member.user_id),
                    name:
                        `${member.first_name || ''} ${member.last_name || ''}`.trim()
                }))
            );


            // ====================================================
            // CATEGORIES
            // ====================================================

            const categoriesResponse =
                await api.get(
                    `/groups/${groupId}/categories`
                );

            setCategories(
                categoriesResponse.data || []
            );

        } catch (error) {

            console.error(
                'Erreur lors du chargement :',
                error
            );

            setError(
                error.response?.data?.message ||
                'Impossible de charger les données.'
            );

        } finally {

            setLoading(false);

        }

    };

    loadData();

}, [groupId]);
    // ============================================================
    // PARTICIPANT
    // ============================================================

    const handleParticipantChange = (memberId) => {

        if (participants.includes(memberId)) {

            setParticipants(
                previous =>
                    previous.filter(
                        id => id !== memberId
                    )
            );


            // ==================================================
            // SUPPRIMER ANCIENNE VALEUR EXACTE
            // ==================================================

            setExactAmounts(previous => {

                const updated = {
                    ...previous
                };

                delete updated[memberId];

                return updated;
            });


            // ==================================================
            // SUPPRIMER ANCIENNE VALEUR PART
            // ==================================================

            setShares(previous => {

                const updated = {
                    ...previous
                };

                delete updated[memberId];

                return updated;
            });


            // ==================================================
            // SUPPRIMER ANCIENNE VALEUR POURCENTAGE
            // ==================================================

            setPercentages(previous => {

                const updated = {
                    ...previous
                };

                delete updated[memberId];

                return updated;
            });

        } else {

            setParticipants(previous => [
                ...previous,
                memberId
            ]);
        }
    };


    // ============================================================
    // MONTANT EN CENTIMES
    // ============================================================

    const getAmountCents = () => {

        const value =
            Number(amount);

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {

            return 0;
        }

        return Math.round(
            value * 100
        );
    };


    // ============================================================
    // EQUAL
    // ============================================================

    const getEqualAmounts = () => {

        const amountCents =
            getAmountCents();


        if (
            amountCents <= 0 ||
            participants.length === 0
        ) {

            return {};
        }


        const baseCents =
            Math.floor(
                amountCents /
                participants.length
            );


        const result = {};

        let totalAssigned = 0;


        participants.forEach(
            (participantId, index) => {

                let cents;


                // ==================================================
                // DERNIER PARTICIPANT = RESTE
                // ==================================================

                if (
                    index ===
                    participants.length - 1
                ) {

                    cents =
                        amountCents -
                        totalAssigned;

                } else {

                    cents = baseCents;

                    totalAssigned += cents;
                }


                result[participantId] =
                    cents / 100;
            }
        );


        return result;
    };


    // ============================================================
    // EXACT
    // ============================================================

    const getExactTotalCents = () => {

        return participants.reduce(
            (total, participantId) => {

                const value =
                    Number(
                        exactAmounts[participantId] || 0
                    );


                if (!Number.isFinite(value)) {

                    return total;
                }


                return (
                    total +
                    Math.round(value * 100)
                );

            },
            0
        );
    };


    const getExactTotal = () => {

        return (
            getExactTotalCents() /
            100
        );
    };


    // ============================================================
    // SHARES
    // ============================================================

    const getTotalShares = () => {

        return participants.reduce(
            (total, participantId) => {

                const value =
                    Number(
                        shares[participantId] || 0
                    );


                if (
                    !Number.isFinite(value) ||
                    value < 0
                ) {

                    return total;
                }


                return total + value;

            },
            0
        );
    };


    const getShareAmounts = () => {

        const totalShares =
            getTotalShares();

        const amountCents =
            getAmountCents();


        if (
            totalShares <= 0 ||
            amountCents <= 0 ||
            participants.length === 0
        ) {

            return {};
        }


        const result = {};

        let totalAssigned = 0;


        participants.forEach(
            (participantId, index) => {

                const value =
                    Number(
                        shares[participantId] || 0
                    );


                let cents;


                // ==================================================
                // DERNIER PARTICIPANT = RESTE
                // ==================================================

                if (
                    index ===
                    participants.length - 1
                ) {

                    cents =
                        amountCents -
                        totalAssigned;

                } else {

                    cents =
                        Math.floor(
                            (
                                amountCents *
                                value
                            ) /
                            totalShares
                        );

                    totalAssigned += cents;
                }


                result[participantId] =
                    cents / 100;
            }
        );


        return result;
    };


    // ============================================================
    // PERCENTAGE
    // ============================================================

    const getTotalPercentage = () => {

        return participants.reduce(
            (total, participantId) => {

                const value =
                    Number(
                        percentages[participantId] || 0
                    );


                if (
                    !Number.isFinite(value) ||
                    value < 0
                ) {

                    return total;
                }


                return total + value;

            },
            0
        );
    };


    const getPercentageAmounts = () => {

        const amountCents =
            getAmountCents();

        const totalPercentage =
            getTotalPercentage();


        if (
            amountCents <= 0 ||
            totalPercentage !== 100 ||
            participants.length === 0
        ) {

            return {};
        }


        const result = {};

        let totalAssigned = 0;


        participants.forEach(
            (participantId, index) => {

                const percentage =
                    Number(
                        percentages[participantId] || 0
                    );


                let cents;


                // ==================================================
                // DERNIER PARTICIPANT = RESTE
                // ==================================================

                if (
                    index ===
                    participants.length - 1
                ) {

                    cents =
                        amountCents -
                        totalAssigned;

                } else {

                    cents =
                        Math.floor(
                            (
                                amountCents *
                                percentage
                            ) / 100
                        );

                    totalAssigned += cents;
                }


                result[participantId] =
                    cents / 100;
            }
        );


        return result;
    };


    // ============================================================
    // VALEURS CALCULEES
    // ============================================================

    const expenseAmount =
        Number(amount || 0);

    const exactTotal =
        getExactTotal();

    const totalShares =
        getTotalShares();

    const totalPercentage =
        getTotalPercentage();


    // ============================================================
    // VALIDATION EXACT
    // ============================================================

    const hasInvalidExactAmount =
        participants.some(
            participantId => {

                const value =
                    Number(
                        exactAmounts[participantId] || 0
                    );

                return (
                    !Number.isFinite(value) ||
                    value < 0
                );
            }
        );


    const isExactValid =
        expenseAmount > 0 &&
        participants.length > 0 &&
        !hasInvalidExactAmount &&
        getExactTotalCents() ===
            getAmountCents();


    // ============================================================
    // VALIDATION SHARES
    // ============================================================

    const hasInvalidShares =
        participants.some(
            participantId => {

                const value =
                    Number(
                        shares[participantId] || 0
                    );

                return (
                    !Number.isFinite(value) ||
                    value <= 0
                );
            }
        );


    const isSharesValid =
        expenseAmount > 0 &&
        participants.length > 0 &&
        totalShares > 0 &&
        !hasInvalidShares;


    // ============================================================
    // VALIDATION PERCENTAGE
    // ============================================================

    const hasInvalidPercentage =
        participants.some(
            participantId => {

                const value =
                    Number(
                        percentages[participantId] || 0
                    );

                return (
                    !Number.isFinite(value) ||
                    value < 0 ||
                    value > 100
                );
            }
        );


    const isPercentageValid =
        expenseAmount > 0 &&
        participants.length > 0 &&
        !hasInvalidPercentage &&
        Math.round(
            totalPercentage * 100
        ) === 10000;


    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError('');


        // ========================================================
        // TITRE
        // ========================================================

        if (!title.trim()) {

            setError(
                'Le titre est obligatoire.'
            );

            return;
        }


        // ========================================================
        // MONTANT
        // ========================================================

        const numericAmount =
            Number(amount);


        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            setError(
                'Le montant doit être supérieur à 0.'
            );

            return;
        }


        // ========================================================
        // DATE
        // ========================================================

        if (!expenseDate) {

            setError(
                'La date est obligatoire.'
            );

            return;
        }


        // ========================================================
        // CATEGORIE
        // ========================================================

        if (!categoryId) {

            setError(
                'Sélectionnez une catégorie.'
            );

            return;
        }


        // ========================================================
        // PAYEUR
        // ========================================================

        if (!payerId) {

            setError(
                'Sélectionnez un payeur.'
            );

            return;
        }


        const numericPayerId =
            Number(payerId);


        const payerExists =
            members.some(
                member =>
                    member.id ===
                    numericPayerId
            );


        if (!payerExists) {

            setError(
                'Le payeur doit être un membre du groupe.'
            );

            return;
        }


        // ========================================================
        // PARTICIPANTS
        // ========================================================

        if (participants.length === 0) {

            setError(
                'Sélectionnez au moins un participant.'
            );

            return;
        }


        // ========================================================
        // VALIDATION MODE EXACT
        // ========================================================

        if (
            splitMode === 'exact' &&
            !isExactValid
        ) {

            setError(
                'La somme des montants exacts doit être égale au montant total et aucun montant ne peut être négatif.'
            );

            return;
        }


        // ========================================================
        // VALIDATION MODE SHARES
        // ========================================================

        if (
            splitMode === 'shares' &&
            !isSharesValid
        ) {

            setError(
                'Chaque participant doit avoir un nombre de parts supérieur à 0.'
            );

            return;
        }


        // ========================================================
        // VALIDATION MODE PERCENTAGE
        // ========================================================

        if (
            splitMode === 'percentage' &&
            !isPercentageValid
        ) {

            setError(
                'La somme des pourcentages doit être exactement égale à 100 %.'
            );

            return;
        }


        try {

            setSubmitting(true);


            // ====================================================
            // PREPARER PARTICIPANTS
            // ====================================================

            let formattedParticipants = [];


            // ====================================================
            // EQUAL
            // ====================================================

            if (splitMode === 'equal') {

                formattedParticipants =
                    participants.map(
                        userId => ({
                            userId:
                                Number(userId)
                        })
                    );
            }


            // ====================================================
            // EXACT
            // ====================================================

            if (splitMode === 'exact') {

                formattedParticipants =
                    participants.map(
                        userId => ({

                            userId:
                                Number(userId),

                            amount:
                                Number(
                                    exactAmounts[userId]
                                )

                        })
                    );
            }


            // ====================================================
            // SHARES
            // ====================================================

            if (splitMode === 'shares') {

                formattedParticipants =
                    participants.map(
                        userId => ({

                            userId:
                                Number(userId),

                            shares:
                                Number(
                                    shares[userId]
                                )

                        })
                    );
            }


            // ====================================================
            // PERCENTAGE
            // ====================================================

            if (splitMode === 'percentage') {

                formattedParticipants =
                    participants.map(
                        userId => ({

                            userId:
                                Number(userId),

                            percentage:
                                Number(
                                    percentages[userId]
                                )

                        })
                    );
            }


            // ====================================================
            // REQUETE POST
            // ====================================================

            await api.post(
                `/groups/${groupId}/expenses`,
                {
                    payerId:
                        Number(payerId),

                    categoryId:
                        Number(categoryId),

                    title:
                        title.trim(),

                    amount:
                        numericAmount,

                    currency,

                    exchangeRate:
                        1,

                    splitMode,

                    expenseDate,

                    participants:
                        formattedParticipants
                }
            );


            // ====================================================
            // REDIRECTION
            // ====================================================

            navigate(
                `/groups/${groupId}/expenses`
            );

        } catch (error) {

            console.error(
                'Erreur lors de la création :',
                error
            );

            setError(
                error.response?.data?.message ||
                'Une erreur est survenue lors de la création de la dépense.'
            );

        } finally {

            setSubmitting(false);
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <p>
                Chargement du formulaire...
            </p>
        );
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div>

            {/* ====================================================
                RETOUR
            ==================================================== */}

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


            <h1>
                Ajouter une dépense
            </h1>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <p style={{ color: 'red' }}>
                    {error}
                </p>

            )}


            <form onSubmit={handleSubmit}>


                {/* =================================================
                    INFORMATIONS
                ================================================= */}

                <div>

                    <label>
                        Titre
                    </label>

                    <br />

                    <input
                        type="text"
                        value={title}
                        onChange={event =>
                            setTitle(
                                event.target.value
                            )
                        }
                        placeholder="Ex : Restaurant"
                    />

                </div>


                <br />


                {/* =================================================
                    MONTANT
                ================================================= */}

                <div>

                    <label>
                        Montant
                    </label>

                    <br />

                    <input
                        type="number"
                       min="1"
                       step="1"
                        value={amount}
                            
                        onChange={event =>
                            setAmount(
                                event.target.value
                            )
                        }
                        placeholder="Ex : 3000"
                    />

                </div>


                <br />


                {/* =================================================
                    DEVISE
                ================================================= */}

                <div>

                    <label>
                        Devise
                    </label>

                    <br />

                    <select
                        value={currency}
                        onChange={event =>
                            setCurrency(
                                event.target.value
                            )
                        }
                    >

                        <option value="DZD">
                            DZD
                        </option>

                        <option value="EUR">
                            EUR
                        </option>

                    </select>

                </div>


                <br />


                {/* =================================================
                    DATE
                ================================================= */}

                <div>

                    <label>
                        Date
                    </label>

                    <br />

                    <input
                        type="date"
                        value={expenseDate}
                        onChange={event =>
                            setExpenseDate(
                                event.target.value
                            )
                        }
                    />

                </div>


                <br />


                {/* =================================================
                    CATEGORIE
                ================================================= */}

                <div>

                    <label>
                        Catégorie
                    </label>

                    <br />

                    <select
                        value={categoryId}
                        onChange={event =>
                            setCategoryId(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            Choisir une catégorie
                        </option>


                        {categories.map(
                            category => (

                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <hr />


                {/* =================================================
                    PAYEUR
                ================================================= */}

                <h2>
                    Payeur
                </h2>


                <select
                    value={payerId}
                    onChange={event =>
                        setPayerId(
                            event.target.value
                        )
                    }
                >

                    <option value="">
                        Choisir le payeur
                    </option>


                    {members.map(
                        member => (

                            <option
                                key={member.id}
                                value={member.id}
                            >
                                {member.name}
                            </option>

                        )
                    )}

                </select>


                <hr />


                {/* =================================================
                    PARTICIPANTS
                ================================================= */}

                <h2>
                    Participants
                </h2>


                {members.map(
                    member => (

                        <div key={member.id}>

                            <label>

                                <input
                                    type="checkbox"
                                    checked={
                                        participants.includes(
                                            member.id
                                        )
                                    }
                                    onChange={() =>
                                        handleParticipantChange(
                                            member.id
                                        )
                                    }
                                />

                                {' '}

                                {member.name}

                            </label>

                        </div>

                    )
                )}


                <p>

                    Nombre de participants :{' '}

                    {participants.length}

                </p>


                <hr />


                {/* =================================================
                    MODE DE PARTAGE
                ================================================= */}

                <h2>
                    Mode de partage
                </h2>


                <select
                    value={splitMode}
                    onChange={event =>
                        setSplitMode(
                            event.target.value
                        )
                    }
                >

                    <option value="equal">
                        Égal
                    </option>

                    <option value="exact">
                        Montants exacts
                    </option>

                    <option value="shares">
                        Parts
                    </option>

                    <option value="percentage">
                        Pourcentages
                    </option>

                </select>


                {/* =================================================
                    EQUAL
                ================================================= */}

                {splitMode === 'equal' && (

                    <div>

                        <h3>
                            Répartition égale
                        </h3>


                        {Object.entries(
                            getEqualAmounts()
                        ).map(
                            ([userId, value]) => {

                                const member =
                                    members.find(
                                        item =>
                                            item.id ===
                                            Number(userId)
                                    );


                                return (

                                    <p key={userId}>

                                        <strong>
                                            {member?.name ||
                                                `Utilisateur #${userId}`}
                                        </strong>

                                        {' → '}

                                        {value.toFixed(2)}

                                        {' '}

                                        {currency}

                                    </p>
                                );
                            }
                        )}

                    </div>
                )}


                {/* =================================================
                    EXACT
                ================================================= */}

                {splitMode === 'exact' && (

                    <div>

                        <h3>
                            Montants exacts
                        </h3>


                        {participants.map(
                            participantId => {

                                const member =
                                    members.find(
                                        item =>
                                            item.id ===
                                            participantId
                                    );


                                return (

                                    <div
                                        key={
                                            participantId
                                        }
                                    >

                                        <label>
                                            {member?.name}
                                        </label>


                                        <br />


                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                exactAmounts[
                                                    participantId
                                                ] ?? ''
                                            }
                                            onChange={event =>
                                                setExactAmounts(
                                                    previous => ({

                                                        ...previous,

                                                        [participantId]:
                                                            event.target.value

                                                    })
                                                )
                                            }
                                        />

                                        {' '}

                                        {currency}

                                    </div>
                                );
                            }
                        )}


                        <p>

                            Total :{' '}

                            {exactTotal.toFixed(2)}

                            {' '}

                            {currency}

                        </p>


                        <p>

                            Dépense :{' '}

                            {expenseAmount.toFixed(2)}

                            {' '}

                            {currency}

                        </p>


                        {isExactValid ? (

                            <p>
                                ✅ Répartition correcte
                            </p>

                        ) : (

                            <p>
                                ❌ La somme doit être égale au montant.
                            </p>

                        )}

                    </div>
                )}


                {/* =================================================
                    SHARES
                ================================================= */}

                {splitMode === 'shares' && (

                    <div>

                        <h3>
                            Répartition par parts
                        </h3>


                        {participants.map(
                            participantId => {

                                const member =
                                    members.find(
                                        item =>
                                            item.id ===
                                            participantId
                                    );


                                return (

                                    <div
                                        key={
                                            participantId
                                        }
                                    >

                                        <label>
                                            {member?.name}
                                        </label>


                                        <br />


                                        <input
                                            type="number"
                                            min="0.01"
                                            step="1"
                                            value={
                                                shares[
                                                    participantId
                                                ] ?? ''
                                            }
                                            onChange={event =>
                                                setShares(
                                                    previous => ({

                                                        ...previous,

                                                        [participantId]:
                                                            event.target.value

                                                    })
                                                )
                                            }
                                        />


                                        <p>

                                            Montant :{' '}

                                            {(
                                                getShareAmounts()[
                                                    participantId
                                                ] || 0
                                            ).toFixed(2)}

                                            {' '}

                                            {currency}

                                        </p>

                                    </div>
                                );
                            }
                        )}


                        <p>

                            Total des parts :{' '}

                            {totalShares}

                        </p>


                        {isSharesValid ? (

                            <p>
                                ✅ Répartition valide
                            </p>

                        ) : (

                            <p>
                                ❌ Chaque participant doit avoir des parts positives.
                            </p>

                        )}

                    </div>
                )}


                {/* =================================================
                    PERCENTAGE
                ================================================= */}

                {splitMode === 'percentage' && (

                    <div>

                        <h3>
                            Répartition par pourcentages
                        </h3>


                        {participants.map(
                            participantId => {

                                const member =
                                    members.find(
                                        item =>
                                            item.id ===
                                            participantId
                                    );


                                return (

                                    <div
                                        key={
                                            participantId
                                        }
                                    >

                                        <label>
                                            {member?.name}
                                        </label>


                                        <br />


                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={
                                                percentages[
                                                    participantId
                                                ] ?? ''
                                            }
                                            onChange={event =>
                                                setPercentages(
                                                    previous => ({

                                                        ...previous,

                                                        [participantId]:
                                                            event.target.value

                                                    })
                                                )
                                            }
                                        />

                                        {' '}%


                                        <p>

                                            Montant :{' '}

                                            {(
                                                getPercentageAmounts()[
                                                    participantId
                                                ] || 0
                                            ).toFixed(2)}

                                            {' '}

                                            {currency}

                                        </p>

                                    </div>
                                );
                            }
                        )}


                        <p>

                            Total :{' '}

                            {totalPercentage.toFixed(2)}

                            {' '}%

                        </p>


                        {isPercentageValid ? (

                            <p>
                                ✅ 100 %
                            </p>

                        ) : (

                            <p>
                                ❌ Le total doit être 100 %.
                            </p>

                        )}

                    </div>
                )}


                {/* =================================================
                    APERCU FINAL
                ================================================= */}

                <hr />


                <h2>
                    Aperçu de la répartition
                </h2>


                {participants.length === 0 ? (

                    <p>
                        Sélectionnez des participants.
                    </p>

                ) : (

                    participants.map(
                        participantId => {

                            const member =
                                members.find(
                                    item =>
                                        item.id ===
                                        participantId
                                );


                            let participantAmount = 0;


                            // ==========================================
                            // EQUAL
                            // ==========================================

                            if (
                                splitMode === 'equal'
                            ) {

                                participantAmount =
                                    getEqualAmounts()[
                                        participantId
                                    ] || 0;
                            }


                            // ==========================================
                            // EXACT
                            // ==========================================

                            if (
                                splitMode === 'exact'
                            ) {

                                participantAmount =
                                    Number(
                                        exactAmounts[
                                            participantId
                                        ] || 0
                                    );
                            }


                            // ==========================================
                            // SHARES
                            // ==========================================

                            if (
                                splitMode === 'shares'
                            ) {

                                participantAmount =
                                    getShareAmounts()[
                                        participantId
                                    ] || 0;
                            }


                            // ==========================================
                            // PERCENTAGE
                            // ==========================================

                            if (
                                splitMode === 'percentage'
                            ) {

                                participantAmount =
                                    getPercentageAmounts()[
                                        participantId
                                    ] || 0;
                            }


                            return (

                                <p
                                    key={
                                        participantId
                                    }
                                >

                                    <strong>
                                        {member?.name ||
                                            `Utilisateur #${participantId}`}
                                    </strong>

                                    {' → '}

                                    {participantAmount.toFixed(2)}

                                    {' '}

                                    {currency}

                                </p>
                            );
                        }
                    )
                )}


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <br />


                <button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? 'Création...'
                        : 'Ajouter la dépense'}
                </button>

            </form>

        </div>
    );
}


export default CreateExpense;