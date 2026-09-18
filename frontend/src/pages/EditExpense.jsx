import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../api/api';


// ============================================================
// EDIT EXPENSE
// ============================================================

function EditExpense() {

    const { groupId, expenseId } = useParams();

    const navigate = useNavigate();


    // ============================================================
    // STATES
    // ============================================================

    const [expense, setExpense] = useState(null);

    const [members, setMembers] = useState([]);

    const [categories, setCategories] = useState([]);


    const [title, setTitle] = useState('');

    const [amount, setAmount] = useState('');

    const [payer, setPayer] = useState('');

    const [category, setCategory] = useState('');

    const [currency, setCurrency] = useState('DZD');

    const [exchangeRate, setExchangeRate] = useState('1');

    const [splitMode, setSplitMode] = useState('equal');

    const [date, setDate] = useState('');


    const [participants, setParticipants] = useState([]);


    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);


    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');


    // ============================================================
    // CHARGER DEPENSE + MEMBRES + CATEGORIES
    // ============================================================

    useEffect(() => {

        if (!groupId || !expenseId) {
            return;
        }


        const fetchData = async () => {

            try {

                setLoading(true);

                setError('');


                const [
                    expenseResponse,
                    membersResponse,
                    categoriesResponse
                ] = await Promise.all([

                    api.get(
                        `/groups/${groupId}/expenses/${expenseId}`
                    ),

                    api.get(
                        `/groups/${groupId}`
                    ),

                    api.get(
                        `/groups/${groupId}/categories`
                    )

                ]);


                // ====================================================
                // DEPENSE
                // ====================================================

                const expenseData =
                    expenseResponse.data;


                setExpense(expenseData);


                setTitle(
                    expenseData.title || ''
                );


                setAmount(
                    expenseData.amount !== null &&
                    expenseData.amount !== undefined
                        ? String(expenseData.amount)
                        : ''
                );


                setPayer(
                    expenseData.payer_id !== null &&
                    expenseData.payer_id !== undefined
                        ? String(expenseData.payer_id)
                        : ''
                );


                setCategory(
                    expenseData.category_id !== null &&
                    expenseData.category_id !== undefined
                        ? String(expenseData.category_id)
                        : ''
                );


                setCurrency(
                    expenseData.currency || 'DZD'
                );


                setExchangeRate(
                    expenseData.exchange_rate !== null &&
                    expenseData.exchange_rate !== undefined
                        ? String(expenseData.exchange_rate)
                        : '1'
                );


                setSplitMode(
                    expenseData.split_mode || 'equal'
                );


                setDate(
                    expenseData.expense_date || ''
                );


                // ====================================================
                // PARTICIPANTS EXISTANTS
                // ====================================================

                setParticipants(

                    (expenseData.shares || []).map(
                        (share) => ({

                            userId:
                                String(
                                    share.user_id
                                ),

                            amount:
                                share.share_amount !== null &&
                                share.share_amount !== undefined
                                    ? String(
                                        share.share_amount
                                    )
                                    : '',

                            shares:
                                expenseData.split_mode === 'shares'
                                    ? String(
                                        share.share_value ?? ''
                                    )
                                    : '',

                            percentage:
                                expenseData.split_mode === 'percentage'
                                    ? String(
                                        share.share_value ?? ''
                                    )
                                    : ''
                        })
                    )
                );


                // ====================================================
                // MEMBRES
                // ====================================================

                setMembers(
                    membersResponse.data?.members || []
                );


                // ====================================================
                // CATEGORIES
                // ====================================================

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
                    'Impossible de charger la dépense.'
                );

            } finally {

                setLoading(false);
            }
        };


        fetchData();

    }, [groupId, expenseId]);


    // ============================================================
    // VERIFIER PARTICIPANT
    // ============================================================

    const isParticipant = (userId) => {

        return participants.some(
            (participant) =>
                Number(participant.userId) ===
                Number(userId)
        );
    };


    // ============================================================
    // AJOUTER PARTICIPANT
    // ============================================================

    const addParticipant = (userId) => {

        if (isParticipant(userId)) {
            return;
        }


        setParticipants((current) => [

            ...current,

            {
                userId: String(userId),
                amount: '',
                shares: '1',
                percentage: ''
            }

        ]);
    };


    // ============================================================
    // SUPPRIMER PARTICIPANT
    // ============================================================

    const removeParticipant = (userId) => {

        setParticipants((current) =>

            current.filter(
                (participant) =>
                    Number(participant.userId) !==
                    Number(userId)
            )

        );
    };


    // ============================================================
    // MODIFIER VALEUR PARTICIPANT
    // ============================================================

    const updateParticipantValue = (
        userId,
        field,
        value
    ) => {

        setParticipants((current) =>

            current.map(
                (participant) =>

                    Number(participant.userId) ===
                    Number(userId)

                        ? {
                            ...participant,
                            [field]: value
                        }

                        : participant
            )

        );
    };


    // ============================================================
    // MONTANT NUMERIQUE
    // ============================================================

    const numericAmount =
        Number(amount);


    // ============================================================
    // TOTAL MONTANTS EXACTS
    // ============================================================

    const getExactTotal = () => {

        return participants.reduce(
            (total, participant) =>

                total +
                Number(
                    participant.amount || 0
                ),

            0
        );
    };


    // ============================================================
    // TOTAL PARTS
    // ============================================================

    const getSharesTotal = () => {

        return participants.reduce(
            (total, participant) =>

                total +
                Number(
                    participant.shares || 0
                ),

            0
        );
    };


    // ============================================================
    // TOTAL POURCENTAGES
    // ============================================================

    const getPercentageTotal = () => {

        return participants.reduce(
            (total, participant) =>

                total +
                Number(
                    participant.percentage || 0
                ),

            0
        );
    };


    // ============================================================
    // CALCUL PARTS EGALES
    // ============================================================

    const getEqualAmounts = () => {

        if (
            participants.length === 0 ||
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            return [];
        }


        const totalCents =
            Math.round(
                numericAmount * 100
            );


        const participantCount =
            participants.length;


        const baseCents =
            Math.floor(
                totalCents /
                participantCount
            );


        const remainder =
            totalCents -
            baseCents * participantCount;


        return participants.map(
            (_, index) => {

                const cents =
                    index === participantCount - 1

                        ? baseCents + remainder

                        : baseCents;


                return cents / 100;
            }
        );
    };


    // ============================================================
    // VALIDATION
    // ============================================================

    const validateForm = () => {


        // ========================================================
        // INFORMATIONS GENERALES
        // ========================================================

        if (!title.trim()) {

            return 'Le titre est obligatoire.';
        }


        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            return 'Le montant doit être supérieur à 0.';
        }


        if (!payer) {

            return 'Veuillez choisir le payeur.';
        }


        if (!category) {

            return 'Veuillez choisir une catégorie.';
        }


        if (!date) {

            return 'Veuillez choisir une date.';
        }


        // ========================================================
        // PARTICIPANTS
        // ========================================================

        if (participants.length === 0) {

            return 'Ajoutez au moins un participant.';
        }


        // ========================================================
        // MODE EQUAL
        // ========================================================

        if (splitMode === 'equal') {

            return null;
        }


        // ========================================================
        // MODE EXACT
        // ========================================================

        if (splitMode === 'exact') {

            const invalid =
                participants.some(
                    (participant) => {

                        const value =
                            Number(
                                participant.amount
                            );


                        return (
                            !Number.isFinite(value) ||
                            value <= 0
                        );
                    }
                );


            if (invalid) {

                return (
                    'Chaque montant exact doit être supérieur à 0.'
                );
            }


            const total =
                getExactTotal();


            if (
                Math.round(total * 100) !==
                Math.round(numericAmount * 100)
            ) {

                return (
                    'La somme des montants exacts doit être égale au montant total.'
                );
            }
        }


        // ========================================================
        // MODE SHARES
        // ========================================================

        if (splitMode === 'shares') {

            const invalid =
                participants.some(
                    (participant) => {

                        const value =
                            Number(
                                participant.shares
                            );


                        return (
                            !Number.isFinite(value) ||
                            value <= 0
                        );
                    }
                );


            if (invalid) {

                return (
                    'Chaque valeur de part doit être supérieure à 0.'
                );
            }


            if (getSharesTotal() <= 0) {

                return (
                    'Le nombre total de parts doit être supérieur à 0.'
                );
            }
        }


        // ========================================================
        // MODE PERCENTAGE
        // ========================================================

        if (splitMode === 'percentage') {

            const invalid =
                participants.some(
                    (participant) => {

                        const value =
                            Number(
                                participant.percentage
                            );


                        return (
                            !Number.isFinite(value) ||
                            value <= 0 ||
                            value > 100
                        );
                    }
                );


            if (invalid) {

                return (
                    'Chaque pourcentage doit être entre 0 et 100.'
                );
            }


            const total =
                getPercentageTotal();


            if (
                Math.round(total * 100) !==
                10000
            ) {

                return (
                    'La somme des pourcentages doit être égale à 100 %.'
                );
            }
        }


        return null;
    };


    // ============================================================
    // CHANGER MODE DE PARTAGE
    // ============================================================

    const handleSplitModeChange = (event) => {

        const newMode =
            event.target.value;


        setSplitMode(newMode);


        setParticipants(
            (current) =>

                current.map(
                    (participant) => ({

                        userId:
                            participant.userId,

                        amount:
                            newMode === 'exact'
                                ? ''
                                : '',

                        shares:
                            newMode === 'shares'
                                ? '1'
                                : '',

                        percentage:
                            newMode === 'percentage'
                                ? ''
                                : ''
                    })
                )
        );
    };


    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        setError('');

        setSuccess('');


        // ========================================================
        // VALIDATION
        // ========================================================

        const validationError =
            validateForm();


        if (validationError) {

            setError(
                validationError
            );

            return;
        }


        try {

            setSaving(true);


            // ====================================================
            // FORMATER PARTICIPANTS
            // ====================================================

            const formattedParticipants =
                participants.map(
                    (participant) => {

                        const result = {

                            userId:
                                Number(
                                    participant.userId
                                )
                        };


                        if (splitMode === 'exact') {

                            result.amount =
                                Number(
                                    participant.amount
                                );
                        }


                        if (splitMode === 'shares') {

                            result.shares =
                                Number(
                                    participant.shares
                                );
                        }


                        if (splitMode === 'percentage') {

                            result.percentage =
                                Number(
                                    participant.percentage
                                );
                        }


                        return result;
                    }
                );


            // ====================================================
            // PAYLOAD
            // ====================================================

            const payload = {

                title:
                    title.trim(),

                amount:
                    numericAmount,

                payerId:
                    Number(payer),

                categoryId:
                    Number(category),

                currency:
                    currency || 'DZD',

                exchangeRate:
                    exchangeRate === ''
                        ? null
                        : Number(exchangeRate),

                splitMode,

                expenseDate:
                    date,

                participants:
                    formattedParticipants
            };


            // ====================================================
            // PATCH
            // ====================================================

            await api.patch(
                `/groups/${groupId}/expenses/${expenseId}`,
                payload
            );


            // ====================================================
            // SUCCES
            // ====================================================

            setSuccess(
                'La dépense a été modifiée avec succès.'
            );


            setTimeout(() => {

                navigate(
                    `/groups/${groupId}/expenses/${expenseId}`
                );

            }, 800);

        } catch (error) {

            console.error(
                'Erreur lors de la modification :',
                error
            );


            setError(
                error.response?.data?.message ||
                'Impossible de modifier la dépense.'
            );

        } finally {

            setSaving(false);
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <p>
                Chargement de la dépense...
            </p>
        );
    }


    // ============================================================
    // DEPENSE INTROUVABLE
    // ============================================================

    if (!expense) {

        return (

            <div>

                <p style={{ color: 'red' }}>

                    {error ||
                        'Dépense introuvable.'}

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
    // CALCUL APERCU EQUAL
    // ============================================================

    const equalAmounts =
        getEqualAmounts();


    // ============================================================
    // UI
    // ============================================================

    return (

        <div>


            {/* ================================================== */}
            {/* RETOUR */}
            {/* ================================================== */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/groups/${groupId}/expenses/${expenseId}`
                    )
                }
            >
                ← Retour à la dépense
            </button>


            <h1>
                Modifier la dépense
            </h1>


            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (

                <p style={{ color: 'red' }}>
                    {error}
                </p>
            )}


            {/* ================================================== */}
            {/* SUCCESS */}
            {/* ================================================== */}

            {success && (

                <p style={{ color: 'green' }}>
                    {success}
                </p>
            )}


            <form onSubmit={handleSubmit}>


                {/* =================================================
                    TITRE
                ================================================= */}

                <div>

                    <label>
                        Titre :
                    </label>

                    <br />

                    <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value
                            )
                        }
                        placeholder="Ex: Restaurant"
                    />

                </div>


                <br />


                {/* =================================================
                    MONTANT
                ================================================= */}

                <div>

                    <label>
                        Montant :
                    </label>

                    <br />

                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(event) =>
                            setAmount(
                                event.target.value
                            )
                        }
                    />

                    {' '}

                    {currency}

                </div>


                <br />


                {/* =================================================
                    DEVISE
                ================================================= */}

                <div>

                    <label>
                        Devise :
                    </label>

                    <br />

                    <input
                        type="text"
                        value={currency}
                        onChange={(event) =>
                            setCurrency(
                                event.target.value
                            )
                        }
                    />

                </div>


                <br />


                {/* =================================================
                    TAUX DE CHANGE
                ================================================= */}

                <div>

                    <label>
                        Taux de change :
                    </label>

                    <br />

                    <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={exchangeRate}
                        onChange={(event) =>
                            setExchangeRate(
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
                        Catégorie :
                    </label>

                    <br />

                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            Choisir une catégorie
                        </option>

                        {categories.map(
                            (item) => (

                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <br />


                {/* =================================================
                    PAYEUR
                ================================================= */}

                <div>

                    <label>
                        Payé par :
                    </label>

                    <br />

                    <select
                        value={payer}
                        onChange={(event) =>
                            setPayer(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            Choisir le payeur
                        </option>

                        {members.map(
                            (member) => (

                                <option
                                    key={member.user_id}
                                    value={member.user_id}
                                >
                                    {member.first_name}{' '}
                                    {member.last_name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <br />


                {/* =================================================
                    DATE
                ================================================= */}

                <div>

                    <label>
                        Date :
                    </label>

                    <br />

                    <input
                        type="date"
                        value={date}
                        onChange={(event) =>
                            setDate(
                                event.target.value
                            )
                        }
                    />

                </div>


                <br />


                {/* =================================================
                    MODE DE PARTAGE
                ================================================= */}

                <div>

                    <label>
                        Mode de partage :
                    </label>

                    <br />

                    <select
                        value={splitMode}
                        onChange={
                            handleSplitModeChange
                        }
                    >

                        <option value="equal">
                            Parts égales
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

                </div>


                <br />


                {/* =================================================
                    PARTICIPANTS
                ================================================= */}

                <h2>
                    Participants
                </h2>


                {members.map(
                    (member) => {

                        const selected =
                            isParticipant(
                                member.user_id
                            );


                        return (

                            <div
                                key={member.user_id}
                                style={{
                                    marginBottom: '10px'
                                }}
                            >

                                <label>

                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() =>
                                            selected
                                                ? removeParticipant(
                                                    member.user_id
                                                )
                                                : addParticipant(
                                                    member.user_id
                                                )
                                        }
                                    />

                                    {' '}

                                    {member.first_name}{' '}
                                    {member.last_name}

                                </label>

                            </div>
                        );
                    }
                )}


                <hr />


                {/* =================================================
                    VALEURS PARTICIPANTS
                ================================================= */}

                {participants.map(
                    (participant, index) => {

                        const member =
                            members.find(
                                (item) =>
                                    Number(
                                        item.user_id
                                    ) ===
                                    Number(
                                        participant.userId
                                    )
                            );


                        return (

                            <div
                                key={participant.userId}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    borderRadius: '8px'
                                }}
                            >

                                <h3>

                                    {member?.first_name}{' '}
                                    {member?.last_name}

                                </h3>


                                {/* =================================
                                    EQUAL
                                ================================= */}

                                {splitMode === 'equal' && (

                                    <p>

                                        Part :{' '}

                                        <strong>

                                            {(
                                                equalAmounts[index] ||
                                                0
                                            ).toFixed(2)}

                                            {' '}

                                            {currency}

                                        </strong>

                                    </p>

                                )}


                                {/* =================================
                                    EXACT
                                ================================= */}

                                {splitMode === 'exact' && (

                                    <div>

                                        <label>
                                            Montant :
                                        </label>

                                        <br />

                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={
                                                participant.amount
                                            }
                                            onChange={(event) =>
                                                updateParticipantValue(
                                                    participant.userId,
                                                    'amount',
                                                    event.target.value
                                                )
                                            }
                                        />

                                        {' '}

                                        {currency}

                                    </div>

                                )}


                                {/* =================================
                                    SHARES
                                ================================= */}

                                {splitMode === 'shares' && (

                                    <div>

                                        <label>
                                            Parts :
                                        </label>

                                        <br />

                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={
                                                participant.shares
                                            }
                                            onChange={(event) =>
                                                updateParticipantValue(
                                                    participant.userId,
                                                    'shares',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>

                                )}


                                {/* =================================
                                    PERCENTAGE
                                ================================= */}

                                {splitMode === 'percentage' && (

                                    <div>

                                        <label>
                                            Pourcentage :
                                        </label>

                                        <br />

                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max="100"
                                            value={
                                                participant.percentage
                                            }
                                            onChange={(event) =>
                                                updateParticipantValue(
                                                    participant.userId,
                                                    'percentage',
                                                    event.target.value
                                                )
                                            }
                                        />

                                        {' %'}

                                    </div>

                                )}

                            </div>
                        );
                    }
                )}


                {/* =================================================
                    APERCU
                ================================================= */}

                <hr />

                <h2>
                    Aperçu
                </h2>


                {/* =================================================
                    EQUAL
                ================================================= */}

                {splitMode === 'equal' && (

                    <div>

                        {participants.length > 0 &&
                        numericAmount > 0 ? (

                            <div>

                                <p>
                                    Répartition :
                                </p>


                                {equalAmounts.map(
                                    (value, index) => {

                                        const member =
                                            members.find(
                                                (item) =>
                                                    Number(
                                                        item.user_id
                                                    ) ===
                                                    Number(
                                                        participants[index].userId
                                                    )
                                            );


                                        return (

                                            <p
                                                key={
                                                    participants[index].userId
                                                }
                                            >

                                                {member?.first_name}{' '}
                                                {member?.last_name}

                                                {' : '}

                                                <strong>

                                                    {value.toFixed(2)}
                                                    {' '}
                                                    {currency}

                                                </strong>

                                            </p>
                                        );
                                    }
                                )}

                            </div>

                        ) : (

                            <p>
                                Ajoutez des participants.
                            </p>
                        )}

                    </div>
                )}


                {/* =================================================
                    EXACT
                ================================================= */}

                {splitMode === 'exact' && (

                    <p>

                        Total des montants :{' '}

                        <strong>

                            {getExactTotal().toFixed(2)}
                            {' '}
                            {currency}

                        </strong>


                        {' '}


                        {Math.round(
                            getExactTotal() * 100
                        ) ===
                        Math.round(
                            numericAmount * 100
                        ) &&
                        numericAmount > 0 && (

                            <span>
                                ✅ Somme correcte
                            </span>
                        )}

                    </p>
                )}


                {/* =================================================
                    SHARES
                ================================================= */}

                {splitMode === 'shares' && (

                    <div>

                        <p>

                            Nombre total de parts :{' '}

                            <strong>
                                {getSharesTotal()}
                            </strong>

                        </p>


                        {getSharesTotal() > 0 &&
                        numericAmount > 0 && (

                            <p>

                                Montant par unité de part :{' '}

                                <strong>

                                    {(
                                        numericAmount /
                                        getSharesTotal()
                                    ).toFixed(2)}

                                    {' '}

                                    {currency}

                                </strong>

                            </p>
                        )}

                    </div>
                )}


                {/* =================================================
                    PERCENTAGE
                ================================================= */}

                {splitMode === 'percentage' && (

                    <p>

                        Total :{' '}

                        <strong>

                            {getPercentageTotal().toFixed(2)}
                            {' %'}

                        </strong>


                        {' '}


                        {Math.round(
                            getPercentageTotal() * 100
                        ) === 10000 && (

                            <span>
                                ✅ Somme correcte
                            </span>
                        )}

                    </p>
                )}


                <br />


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                    type="submit"
                    disabled={saving}
                >

                    {saving
                        ? 'Modification...'
                        : 'Enregistrer les modifications'}

                </button>

            </form>

        </div>
    );
}


// ============================================================
// EXPORT
// ============================================================

export default EditExpense;