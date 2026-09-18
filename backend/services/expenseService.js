const pool = require('../config/database');
const activityService = require('./activityService');


// ============================================================
// HELPERS - ARGENT
// ============================================================

// Convertit un montant en centimes sans utiliser les floats
const toCents = (value) => {

    if (value === null || value === undefined || value === '') {
        throw new Error('Amount is required');
    }

    const text = String(value).trim();

    // Vérifier d'abord que le format du montant est correct
    if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
        throw new Error('Amount must have at most 2 decimal places');
    }

    const parts = text.split('.');

    const euros = Number(parts[0]);
    const decimals = parts[1] || '';

    const cents = Number(
        decimals.padEnd(2, '0')
    );

    const totalCents = euros * 100 + cents;

    // Le montant doit être strictement positif
    if (totalCents <= 0) {
        throw new Error('Amount must be positive');
    }

    return totalCents;
};

// Convertit les centimes en montant SQL NUMERIC
const centsToAmount = (cents) => {
    return (cents / 100).toFixed(2);
};


// ============================================================
// VALIDATION PARTICIPANTS
// ============================================================

const validateParticipantIds = (participants) => {

    if (!Array.isArray(participants) || participants.length === 0) {
        throw new Error('At least one participant is required');
    }

    const ids = participants.map(
        participant => Number(participant.userId)
    );

    if (
        ids.some(
            id => !Number.isInteger(id) || id <= 0
        )
    ) {
        throw new Error('Invalid participant');
    }

    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
        throw new Error(
            'A participant cannot appear more than once'
        );
    }

    return uniqueIds;
};


// ============================================================
// VERIFIER LES MEMBRES
// ============================================================

const verifyGroupMembers = async (
    client,
    groupId,
    userIds
) => {

    const result = await client.query(
        `SELECT user_id
         FROM group_members
         WHERE group_id = $1
         AND user_id = ANY($2::int[])`,
        [groupId, userIds]
    );

    if (result.rows.length !== userIds.length) {
        throw new Error(
            'All participants must be members of this group'
        );
    }
};


// ============================================================
// VERIFIER CATEGORIE
// ============================================================

const verifyCategory = async (
    client,
    groupId,
    categoryId
) => {

    const result = await client.query(
        `SELECT id
         FROM categories
         WHERE id = $1
         AND (
             group_id IS NULL
             OR group_id = $2
         )`,
        [categoryId, groupId]
    );

    if (result.rows.length === 0) {
        throw new Error(
            'Category not found for this group'
        );
    }
};


// ============================================================
// VERIFIER PAYEUR
// ============================================================

const verifyPayer = async (
    client,
    groupId,
    payerId
) => {

    const result = await client.query(
        `SELECT user_id
         FROM group_members
         WHERE group_id = $1
         AND user_id = $2`,
        [groupId, payerId]
    );

    if (result.rows.length === 0) {
        throw new Error(
            'Payer is not a member of this group'
        );
    }
};


// ============================================================
// CREER LES PARTS
// ============================================================

const createShares = async (
    client,
    expenseId,
    amountCents,
    splitMode,
    participants
) => {

    const participantIds =
        validateParticipantIds(participants);


    // ========================================================
    // MODE EQUAL
    // ========================================================

    if (splitMode === 'equal') {

        const count = participants.length;

        const baseCents =
            Math.floor(amountCents / count);

        let totalAssigned = 0;

        for (let i = 0; i < count; i++) {

            let shareCents;

            if (i === count - 1) {

                // Le reste va toujours au dernier participant
                shareCents =
                    amountCents - totalAssigned;

            } else {

                shareCents = baseCents;

                totalAssigned += shareCents;
            }

            if (shareCents <= 0) {
                throw new Error(
                    'Invalid share amount'
                );
            }

            await client.query(
                `INSERT INTO expense_shares
                (
                    expense_id,
                    user_id,
                    share_value,
                    share_amount
                )
                VALUES ($1, $2, $3, $4)`,
                [
                    expenseId,
                    participantIds[i],
                    null,
                    centsToAmount(shareCents)
                ]
            );
        }

        return;
    }


    // ========================================================
    // MODE EXACT
    // ========================================================

    if (splitMode === 'exact') {

        let totalCents = 0;

        const amounts = [];

        for (const participant of participants) {

            const cents =
                toCents(participant.amount);

            if (cents <= 0) {
                throw new Error(
                    'Each exact amount must be positive'
                );
            }

            totalCents += cents;

            amounts.push(cents);
        }

        if (totalCents !== amountCents) {
            throw new Error(
                'The sum of exact amounts must equal the total expense amount'
            );
        }

        for (let i = 0; i < participants.length; i++) {

            await client.query(
                `INSERT INTO expense_shares
                (
                    expense_id,
                    user_id,
                    share_value,
                    share_amount
                )
                VALUES ($1, $2, $3, $4)`,
                [
                    expenseId,
                    participantIds[i],
                    centsToAmount(amounts[i]),
                    centsToAmount(amounts[i])
                ]
            );
        }

        return;
    }


    // ========================================================
    // MODE SHARES
    // ========================================================

    if (splitMode === 'shares') {

        let totalShares = 0;

        const shareValues = [];

        for (const participant of participants) {

            const value =
                Number(participant.shares);

            if (
                !Number.isFinite(value) ||
                value <= 0
            ) {
                throw new Error(
                    'Each share value must be positive'
                );
            }

            totalShares += value;

            shareValues.push(value);
        }

        if (totalShares <= 0) {
            throw new Error(
                'The total number of shares must be greater than 0'
            );
        }

        let totalAssigned = 0;

        for (let i = 0; i < participants.length; i++) {

            let shareCents;

            if (i === participants.length - 1) {

                shareCents =
                    amountCents - totalAssigned;

            } else {

                shareCents =
                    Math.floor(
                        (
                            amountCents *
                            shareValues[i]
                        ) /
                        totalShares
                    );

                totalAssigned += shareCents;
            }

            if (shareCents <= 0) {
                throw new Error(
                    'Invalid share amount'
                );
            }

            await client.query(
                `INSERT INTO expense_shares
                (
                    expense_id,
                    user_id,
                    share_value,
                    share_amount
                )
                VALUES ($1, $2, $3, $4)`,
                [
                    expenseId,
                    participantIds[i],
                    shareValues[i],
                    centsToAmount(shareCents)
                ]
            );
        }

        return;
    }


    // ========================================================
    // MODE PERCENTAGE
    // ========================================================

    if (splitMode === 'percentage') {

        let totalPercentage = 0;

        const percentages = [];

        for (const participant of participants) {

            const percentage =
                Number(participant.percentage);

            if (
                !Number.isFinite(percentage) ||
                percentage <= 0 ||
                percentage > 100
            ) {
                throw new Error(
                    'Each percentage must be between 0 and 100'
                );
            }

            // Pourcentage avec maximum 2 décimales
            if (
                !/^\d+(\.\d{1,2})?$/.test(
                    String(participant.percentage)
                )
            ) {
                throw new Error(
                    'Percentage must have at most 2 decimal places'
                );
            }

            totalPercentage += percentage;

            percentages.push(percentage);
        }

        // On travaille en centièmes de pourcentage
        const percentageCents =
            Math.round(totalPercentage * 100);

        if (percentageCents !== 10000) {
            throw new Error(
                'The sum of percentages must equal 100'
            );
        }

        let totalAssigned = 0;

        for (let i = 0; i < participants.length; i++) {

            let shareCents;

            if (i === participants.length - 1) {

                shareCents =
                    amountCents - totalAssigned;

            } else {

                shareCents =
                    Math.floor(
                        (
                            amountCents *
                            percentages[i]
                        ) / 100
                    );

                totalAssigned += shareCents;
            }

            if (shareCents <= 0) {
                throw new Error(
                    'Invalid share amount'
                );
            }

            await client.query(
                `INSERT INTO expense_shares
                (
                    expense_id,
                    user_id,
                    share_value,
                    share_amount
                )
                VALUES ($1, $2, $3, $4)`,
                [
                    expenseId,
                    participantIds[i],
                    percentages[i],
                    centsToAmount(shareCents)
                ]
            );
        }

        return;
    }


    throw new Error('Invalid split mode');
};


// ============================================================
// VERIFICATION FINALE DES PARTS
// ============================================================

const verifySharesTotal = async (
    client,
    expenseId,
    amountCents
) => {

    const result = await client.query(
        `SELECT
            COALESCE(
                SUM(
                    ROUND(share_amount * 100)
                ),
                0
            ) AS total_cents
         FROM expense_shares
         WHERE expense_id = $1`,
        [expenseId]
    );

    const totalCents =
        Number(result.rows[0].total_cents);

    if (totalCents !== amountCents) {

        throw new Error(
            'Share calculation error: shares do not sum to the total amount'
        );
    }
};


// ============================================================
// CREATE EXPENSE
// ============================================================

const createExpense = async (
    groupId,
    payerId,
    categoryId,
    createdBy,
    title,
    amount,
    currency,
    exchangeRate,
    splitMode,
    expenseDate,
    participants
) => {

    if (!groupId) {
        throw new Error('Group ID is required');
    }

    if (!payerId) {
        throw new Error('Payer ID is required');
    }

    if (!categoryId) {
        throw new Error('Category ID is required');
    }

    if (!createdBy) {
        throw new Error('Creator ID is required');
    }

    if (!title || !title.trim()) {
        throw new Error('Expense title is required');
    }

    if (!expenseDate) {
        throw new Error('Expense date is required');
    }

    const amountCents =
        toCents(amount);

    if (amountCents <= 0) {
        throw new Error('Amount must be positive');
    }

    const validModes = [
        'equal',
        'exact',
        'shares',
        'percentage'
    ];

    if (!validModes.includes(splitMode)) {
        throw new Error('Invalid split mode');
    }

    const participantIds =
        validateParticipantIds(participants);


    const client = await pool.connect();

    try {

        await client.query('BEGIN');


        // ====================================================
        // VERIFIER LE GROUPE
        // ====================================================

        const groupResult = await client.query(
            `SELECT id, is_archived
             FROM groups
             WHERE id = $1`,
            [groupId]
        );

        if (groupResult.rows.length === 0) {
            throw new Error('Group not found');
        }

        if (groupResult.rows[0].is_archived) {
            throw new Error(
                'Cannot create an expense in an archived group'
            );
        }


        // ====================================================
        // VERIFICATIONS
        // ====================================================

        await verifyPayer(
            client,
            groupId,
            Number(payerId)
        );

        await verifyPayer(
            client,
            groupId,
            Number(createdBy)
        );

        await verifyCategory(
            client,
            groupId,
            Number(categoryId)
        );

        await verifyGroupMembers(
            client,
            groupId,
            participantIds
        );


        // ====================================================
        // CREER LA DEPENSE
        // ====================================================

        const expenseResult = await client.query(
            `INSERT INTO expenses
            (
                group_id,
                payer_id,
                category_id,
                created_by,
                title,
                amount,
                currency,
                exchange_rate,
                split_mode,
                expense_date
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                groupId,
                Number(payerId),
                Number(categoryId),
                Number(createdBy),
                title.trim(),
                centsToAmount(amountCents),
                currency || 'DZD',
                exchangeRate || null,
                splitMode,
                expenseDate
            ]
        );

        const expense =
            expenseResult.rows[0];


        // ====================================================
        // CREER LES PARTS
        // ====================================================

        await createShares(
            client,
            expense.id,
            amountCents,
            splitMode,
            participants
        );


        // ====================================================
        // VERIFICATION EXACTE
        // ====================================================

        await verifySharesTotal(
            client,
            expense.id,
            amountCents
        );


       // ============================================================
// HISTORIQUE - CREATION
// ============================================================

await client.query(
    `INSERT INTO expense_history
    (
        expense_id,
        group_id,
        user_id,
        action_type,
        old_data,
        new_data
    )
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [
        expense.id,
        Number(groupId),
        Number(createdBy),
        'created',
        null,
        JSON.stringify({
            expense,
            shares: participants
        })
    ]
);
        // ====================================================
        // ACTIVITE
        // ====================================================

        await activityService.createActivity(
            groupId,
            Number(createdBy),
            'expense_created',
            'expense',
            expense.id,
            JSON.stringify({
                title: expense.title,
                amount: expense.amount
            }),
            client
        );


        // ====================================================
        // COMMIT
        // ====================================================

        await client.query('COMMIT');


        return expense;

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
};


// ============================================================
// GET GROUP EXPENSES
// ============================================================

const getGroupExpenses = async (
    groupId,
    categoryId,
    memberId,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 10
) => {

    if (!groupId) {
        throw new Error('Group ID is required');
    }


    // ========================================================
    // PAGINATION
    // ========================================================

    const currentPage =
        Math.max(
            parseInt(page, 10) || 1,
            1
        );

    const currentLimit =
        Math.min(
            Math.max(
                parseInt(limit, 10) || 10,
                1
            ),
            100
        );

    const offset =
        (currentPage - 1) * currentLimit;


    // ========================================================
    // CONDITIONS
    // ========================================================

    const conditions = [
        'e.group_id = $1'
    ];

    const values = [
        Number(groupId)
    ];


    // ========================================================
    // CATEGORIE
    // ========================================================

    if (categoryId) {

        values.push(Number(categoryId));

        conditions.push(
            `e.category_id = $${values.length}`
        );
    }


    // ========================================================
    // MEMBRE
    // ========================================================

    // ========================================================
// FILTRE PAR MEMBRE
// ========================================================

if (memberId) {

    values.push(Number(memberId));

    conditions.push(`
        (
            e.payer_id = $${values.length}
            OR EXISTS (
                SELECT 1
                FROM expense_shares es
                WHERE es.expense_id = e.id
                AND es.user_id = $${values.length}
            )
        )
    `);
}


    // ========================================================
    // RECHERCHE
    // ========================================================

    if (search && search.trim()) {

        values.push(
            `%${search.trim()}%`
        );

        conditions.push(
            `e.title ILIKE $${values.length}`
        );
    }


    // ========================================================
    // DATE DEBUT
    // ========================================================

    if (startDate) {

        values.push(startDate);

        conditions.push(
            `e.expense_date >= $${values.length}`
        );
    }


    // ========================================================
    // DATE FIN
    // ========================================================

    if (endDate) {

        values.push(endDate);

        conditions.push(
            `e.expense_date <= $${values.length}`
        );
    }


    const whereQuery =
        conditions.join(' AND ');


    // ========================================================
    // COUNT
    // ========================================================

    const countResult = await pool.query(
        `SELECT COUNT(*) AS total
         FROM expenses e
         WHERE ${whereQuery}`,
        values
    );

    const total =
        parseInt(
            countResult.rows[0].total,
            10
        );


    // ========================================================
    // DEPENSES
    // ========================================================

    const dataValues = [
        ...values,
        currentLimit,
        offset
    ];

    const result = await pool.query(
    `SELECT
        e.*,

        c.name AS category_name,
        c.name_ar AS category_name_ar,

        u.first_name AS payer_first_name,
        u.last_name AS payer_last_name

     FROM expenses e

     LEFT JOIN categories c
        ON e.category_id = c.id

     LEFT JOIN users u
        ON e.payer_id = u.id

     WHERE ${whereQuery}

     ORDER BY
        e.expense_date DESC,
        e.id DESC

     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    dataValues
);

    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages =
        Math.ceil(
            total / currentLimit
        );


    return {
        expenses: result.rows,

        pagination: {
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages,

            hasNextPage:
                currentPage < totalPages,

            hasPreviousPage:
                currentPage > 1
        }
    };
};


// ============================================================
// GET EXPENSE DETAILS
// ============================================================

const getExpenseDetails = async (
    groupId,
    expenseId
) => {

    if (!groupId) {
        throw new Error('Group ID is required');
    }

    if (!expenseId) {
        throw new Error('Expense ID is required');
    }


    // ========================================================
    // DEPENSE
    // ========================================================

    const expenseResult = await pool.query(
        `SELECT
            e.*,

            c.name AS category_name,
            c.name_ar AS category_name_ar,

            u.id AS payer_user_id,
            u.first_name AS payer_first_name,
            u.last_name AS payer_last_name

         FROM expenses e

         LEFT JOIN categories c
            ON e.category_id = c.id

         LEFT JOIN users u
            ON e.payer_id = u.id

         WHERE e.id = $1
         AND e.group_id = $2`,
        [
            Number(expenseId),
            Number(groupId)
        ]
    );


    if (expenseResult.rows.length === 0) {

        throw new Error(
            'Expense not found'
        );
    }


    const expense =
        expenseResult.rows[0];


    // ========================================================
    // PARTS
    // ========================================================

    const sharesResult = await pool.query(
        `SELECT
            es.id,
            es.user_id,
            es.share_value,
            es.share_amount,

            u.first_name,
            u.last_name

         FROM expense_shares es

         JOIN users u
            ON es.user_id = u.id

         WHERE es.expense_id = $1

         ORDER BY es.id`,
        [Number(expenseId)]
    );


    return {
        ...expense,

        payer: expense.payer_user_id
            ? {
                id: expense.payer_user_id,
                first_name:
                    expense.payer_first_name,
                last_name:
                    expense.payer_last_name
            }
            : null,

        shares:
            sharesResult.rows
    };
};


// ============================================================
// UPDATE EXPENSE
// ============================================================

const updateExpense = async (
    groupId,
    expenseId,
    userId,
    userRole,
    data
) => {

    if (!groupId) {
        throw new Error('Group ID is required');
    }

    if (!expenseId) {
        throw new Error('Expense ID is required');
    }

    if (!userId) {
        throw new Error('User ID is required');
    }


    const client =
        await pool.connect();

    try {

        await client.query('BEGIN');


        // ====================================================
        // RECUPERER LA DEPENSE
        // ====================================================

        const expenseResult =
            await client.query(
                `SELECT *
                 FROM expenses
                 WHERE id = $1
                 AND group_id = $2`,
                [
                    Number(expenseId),
                    Number(groupId)
                ]
            );


        if (expenseResult.rows.length === 0) {

            throw new Error(
                'Expense not found'
            );
        }


        const expense =
            expenseResult.rows[0];


        // ====================================================
        // PERMISSIONS
        // ====================================================

        if (
            Number(expense.created_by) !==
                Number(userId)
            &&
            userRole !== 'admin'
        ) {

            throw new Error(
                'You are not allowed to update this expense'
            );
        }


        // ====================================================
        // ANCIENNES PARTS
        // ====================================================

        const oldSharesResult =
            await client.query(
                `SELECT
                    user_id,
                    share_value,
                    share_amount
                 FROM expense_shares
                 WHERE expense_id = $1
                 ORDER BY id`,
                [Number(expenseId)]
            );


        const oldShares =
            oldSharesResult.rows;


        // ====================================================
        // VALEURS FINALES
        // ====================================================

        const title =
            data.title !== undefined
                ? data.title
                : expense.title;

        const finalCategoryId =
            data.categoryId !== undefined
                ? Number(data.categoryId)
                : Number(expense.category_id);

        const finalPayerId =
            data.payerId !== undefined
                ? Number(data.payerId)
                : Number(expense.payer_id);

        const finalCurrency =
            data.currency !== undefined
                ? data.currency
                : expense.currency;

        const finalExchangeRate =
            data.exchangeRate !== undefined
                ? data.exchangeRate
                : expense.exchange_rate;

        const finalExpenseDate =
            data.expenseDate !== undefined
                ? data.expenseDate
                : expense.expense_date;

        const finalSplitMode =
            data.splitMode !== undefined
                ? data.splitMode
                : expense.split_mode;


        const finalAmountCents =
            data.amount !== undefined
                ? toCents(data.amount)
                : toCents(expense.amount);


        // ====================================================
        // VALIDATIONS
        // ====================================================

        if (!title || !title.trim()) {
            throw new Error(
                'Expense title is required'
            );
        }

        if (finalAmountCents <= 0) {
            throw new Error(
                'Amount must be positive'
            );
        }

        const validModes = [
            'equal',
            'exact',
            'shares',
            'percentage'
        ];

        if (
            !validModes.includes(
                finalSplitMode
            )
        ) {
            throw new Error(
                'Invalid split mode'
            );
        }


        await verifyCategory(
            client,
            groupId,
            finalCategoryId
        );

        await verifyPayer(
            client,
            groupId,
            finalPayerId
        );


        // ====================================================
        // PARTICIPANTS
        // ====================================================

        const participants =
            data.participants;


        const splitChanged =
            finalSplitMode !==
            expense.split_mode;

        const amountChanged =
            finalAmountCents !==
            toCents(expense.amount);


        if (
            (splitChanged || amountChanged)
            &&
            participants === undefined
        ) {

            throw new Error(
                'Participants are required when changing the amount or split mode'
            );
        }


        if (
            participants !== undefined
        ) {

            const participantIds =
                validateParticipantIds(
                    participants
                );

            await verifyGroupMembers(
                client,
                groupId,
                participantIds
            );
        }


        // ====================================================
        // UPDATE DES INFORMATIONS
        // ====================================================

        await client.query(
            `UPDATE expenses
             SET
                category_id = $1,
                payer_id = $2,
                title = $3,
                amount = $4,
                currency = $5,
                exchange_rate = $6,
                split_mode = $7,
                expense_date = $8,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
             AND group_id = $10`,
            [
                finalCategoryId,
                finalPayerId,
                title.trim(),
                centsToAmount(
                    finalAmountCents
                ),
                finalCurrency,
                finalExchangeRate,
                finalSplitMode,
                finalExpenseDate,
                Number(expenseId),
                Number(groupId)
            ]
        );


        // ====================================================
        // UPDATE DES PARTS
        // ====================================================

        if (
            participants !== undefined
        ) {

            await client.query(
                `DELETE FROM expense_shares
                 WHERE expense_id = $1`,
                [Number(expenseId)]
            );


            await createShares(
                client,
                Number(expenseId),
                finalAmountCents,
                finalSplitMode,
                participants
            );


            await verifySharesTotal(
                client,
                Number(expenseId),
                finalAmountCents
            );
        }


        // ====================================================
        // NOUVELLES DONNEES
        // ====================================================

        const newExpenseResult =
            await client.query(
                `SELECT *
                 FROM expenses
                 WHERE id = $1`,
                [Number(expenseId)]
            );

        const newExpense =
            newExpenseResult.rows[0];


        const newSharesResult =
            await client.query(
                `SELECT
                    user_id,
                    share_value,
                    share_amount
                 FROM expense_shares
                 WHERE expense_id = $1
                 ORDER BY id`,
                [Number(expenseId)]
            );


        // ============================================================
// HISTORIQUE - MODIFICATION
// ============================================================

await client.query(
    `INSERT INTO expense_history
    (
        expense_id,
        group_id,
        user_id,
        action_type,
        old_data,
        new_data
    )
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [
        Number(expenseId),
        Number(groupId),
        Number(userId),
        'updated',

        JSON.stringify({
            expense,
            shares: oldShares
        }),

        JSON.stringify({
            expense: newExpense,
            shares: newSharesResult.rows
        })
    ]
);

        // ====================================================
        // ACTIVITE
        // ====================================================

        await activityService.createActivity(
            groupId,
            Number(userId),
            'expense_updated',
            'expense',
            Number(expenseId),
            JSON.stringify({
                title:
                    newExpense.title,
                amount:
                    newExpense.amount,
                splitMode:
                    newExpense.split_mode
            }),
            client
        );


        // ====================================================
        // COMMIT
        // ====================================================

        await client.query('COMMIT');


        return await getExpenseDetails(
            groupId,
            expenseId
        );

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
};


// ============================================================
// GET EXPENSE HISTORY
// ============================================================

const getExpenseHistory = async (
    groupId,
    expenseId
) => {

    if (!groupId) {
        throw new Error(
            'Group ID is required'
        );
    }

    if (!expenseId) {
        throw new Error(
            'Expense ID is required'
        );
    }


    // ========================================================
    // VERIFIER LA DEPENSE
    // ========================================================

    const expenseResult =
        await pool.query(
            `SELECT id
             FROM expenses
             WHERE id = $1
             AND group_id = $2`,
            [
                Number(expenseId),
                Number(groupId)
            ]
        );


    if (expenseResult.rows.length === 0) {

        throw new Error(
            'Expense not found'
        );
    }


    // ========================================================
    // HISTORIQUE
    // ========================================================

    const historyResult =
        await pool.query(
            `SELECT
                eh.id,
                eh.expense_id,
                eh.user_id,

                u.first_name,
                u.last_name,

                eh.action_type,
                eh.old_data,
                eh.new_data,
                eh.created_at

             FROM expense_history eh

             JOIN users u
                ON eh.user_id = u.id

             WHERE eh.expense_id = $1

             ORDER BY
                eh.created_at DESC,
                eh.id DESC`,
            [Number(expenseId)]
        );


    return historyResult.rows;
};


// ============================================================
// DELETE EXPENSE
// ============================================================

const deleteExpense = async (
    groupId,
    expenseId,
    userId,
    userRole
) => {

    if (!groupId) {
        throw new Error(
            'Group ID is required'
        );
    }

    if (!expenseId) {
        throw new Error(
            'Expense ID is required'
        );
    }

    if (!userId) {
        throw new Error(
            'User ID is required'
        );
    }


    const client =
        await pool.connect();

    try {

        await client.query('BEGIN');


        // ====================================================
        // DEPENSE
        // ====================================================

        const expenseResult =
            await client.query(
                `SELECT *
                 FROM expenses
                 WHERE id = $1
                 AND group_id = $2`,
                [
                    Number(expenseId),
                    Number(groupId)
                ]
            );


        if (expenseResult.rows.length === 0) {

            throw new Error(
                'Expense not found'
            );
        }


        const expense =
            expenseResult.rows[0];


        // ====================================================
        // PERMISSIONS
        // ====================================================

        if (
            Number(expense.created_by) !==
                Number(userId)
            &&
            userRole !== 'admin'
        ) {

            throw new Error(
                'You are not allowed to delete this expense'
            );
        }
        
        // ====================================================
// RECUPERER LES ANCIENNES PARTS
// ====================================================

const oldSharesResult = await client.query(
    `SELECT
        user_id,
        share_value,
        share_amount
     FROM expense_shares
     WHERE expense_id = $1
     ORDER BY id`,
    [Number(expenseId)]
);

const oldShares = oldSharesResult.rows;

   // ============================================================
// HISTORIQUE - SUPPRESSION
// ============================================================

await client.query(
    `INSERT INTO expense_history
    (
        expense_id,
        group_id,
        user_id,
        action_type,
        old_data,
        new_data
    )
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [
        Number(expenseId),
        Number(groupId),
        Number(userId),
        'deleted',

        JSON.stringify({
            expense,
            shares: oldShares
        }),

        null
    ]
);
        // ====================================================
        // ACTIVITE
        // ====================================================

        await activityService.createActivity(
            groupId,
            Number(userId),
            'expense_deleted',
            'expense',
            Number(expenseId),
            JSON.stringify({
                title: expense.title,
                amount: expense.amount
            }),
            client
        );


        // ====================================================
        // SUPPRESSION
        // ====================================================

        await client.query(
            `DELETE FROM expenses
             WHERE id = $1
             AND group_id = $2`,
            [
                Number(expenseId),
                Number(groupId)
            ]
        );


        // ====================================================
        // COMMIT
        // ====================================================

        await client.query('COMMIT');


        return {
            message:
                'Expense deleted successfully'
        };

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    createExpense,
    getGroupExpenses,
    getExpenseDetails,
    updateExpense,
    getExpenseHistory,
    deleteExpense
};