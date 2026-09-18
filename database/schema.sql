-- ============================================================
-- CHRIKI - DATABASE SCHEMA
-- ============================================================

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS expense_history;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS expense_shares;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    profile_picture VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT email_or_phone_required
        CHECK (
            email IS NOT NULL
            OR phone IS NOT NULL
        )
);


-- ============================================================
-- GROUPS
-- ============================================================

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,

    default_currency VARCHAR(10)
        NOT NULL
        DEFAULT 'DZD',

    is_archived BOOLEAN
        DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- GROUP MEMBERS
-- ============================================================

CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,

    group_id INTEGER
        NOT NULL
        REFERENCES groups(id),

    user_id INTEGER
        NOT NULL
        REFERENCES users(id),

    role VARCHAR(20)
        NOT NULL
        DEFAULT 'member'
        CHECK (role IN ('admin', 'member')),

    joined_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(group_id, user_id)
);


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,

    group_id INTEGER
        REFERENCES groups(id),

    name VARCHAR(50)
        NOT NULL,

    name_ar VARCHAR(50),

    icon VARCHAR(50),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- EXPENSES
-- ============================================================

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,

    group_id INTEGER
        NOT NULL
        REFERENCES groups(id),

    payer_id INTEGER
        NOT NULL
        REFERENCES users(id),

    category_id INTEGER
        NOT NULL
        REFERENCES categories(id),

    created_by INTEGER
        NOT NULL
        REFERENCES users(id),

    title VARCHAR(150)
        NOT NULL,

    amount NUMERIC(12,2)
        NOT NULL
        CHECK (amount > 0),

    currency VARCHAR(10)
        NOT NULL
        DEFAULT 'DZD',

    exchange_rate NUMERIC(10,4),

    split_mode VARCHAR(20)
        NOT NULL
        CHECK (
            split_mode IN (
                'equal',
                'exact',
                'shares',
                'percentage'
            )
        ),

    receipt_url VARCHAR(255),

    expense_date DATE
        NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- EXPENSE SHARES
-- ============================================================

CREATE TABLE expense_shares (
    id SERIAL PRIMARY KEY,

    expense_id INTEGER
        NOT NULL
        REFERENCES expenses(id)
        ON DELETE CASCADE,

    user_id INTEGER
        NOT NULL
        REFERENCES users(id),

    share_value NUMERIC(10,2),

    share_amount NUMERIC(12,2)
        NOT NULL
        CHECK (share_amount > 0),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(expense_id, user_id)
);


-- ============================================================
-- EXPENSE HISTORY
-- ============================================================

CREATE TABLE expense_history (
    id SERIAL PRIMARY KEY,

    expense_id INTEGER
        REFERENCES expenses(id)
        ON DELETE SET NULL,

    group_id INTEGER
        NOT NULL
        REFERENCES groups(id),

    user_id INTEGER
        NOT NULL
        REFERENCES users(id),

    action_type VARCHAR(20)
        NOT NULL
        CHECK (
            action_type IN (
                'created',
                'updated',
                'deleted'
            )
        ),

    old_data JSONB,

    new_data JSONB,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- SETTLEMENTS
-- ============================================================

CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,

    group_id INTEGER
        NOT NULL
        REFERENCES groups(id),

    payer_id INTEGER
        NOT NULL
        REFERENCES users(id),

    receiver_id INTEGER
        NOT NULL
        REFERENCES users(id),

    amount NUMERIC(12,2)
        NOT NULL
        CHECK (amount > 0),

    payment_method VARCHAR(20)
        NOT NULL
        CHECK (
            payment_method IN (
                'cash',
                'baridimob',
                'ccp',
                'transfer'
            )
        ),

    settlement_date DATE
        NOT NULL,

    created_by INTEGER
        NOT NULL
        REFERENCES users(id),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CHECK (payer_id != receiver_id)
);


-- ============================================================
-- INVITATIONS
-- ============================================================

CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,

    group_id INTEGER
        NOT NULL
        REFERENCES groups(id),

    code VARCHAR(6)
        NOT NULL
        UNIQUE,

    created_by INTEGER
        NOT NULL
        REFERENCES users(id),

    expires_at TIMESTAMP
        NOT NULL,

    is_revoked BOOLEAN
        DEFAULT FALSE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- COMMENTS
-- ============================================================

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,

    expense_id INTEGER
        NOT NULL
        REFERENCES expenses(id)
        ON DELETE CASCADE,

    user_id INTEGER
        NOT NULL
        REFERENCES users(id),

    content TEXT
        NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- ACTIVITIES
-- ============================================================

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,

    group_id INTEGER
        NOT NULL
        REFERENCES groups(id),

    user_id INTEGER
        NOT NULL
        REFERENCES users(id),

    action_type VARCHAR(30)
        NOT NULL,

    entity_type VARCHAR(20)
        NOT NULL,

    entity_id INTEGER,

    metadata JSONB,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Recherche des membres par utilisateur
CREATE INDEX idx_group_members_user
    ON group_members(user_id);

-- Recherche des membres par groupe
CREATE INDEX idx_group_members_group
    ON group_members(group_id);

-- Recherche des dépenses par groupe
CREATE INDEX idx_expenses_group
    ON expenses(group_id);

-- Recherche des parts d'une dépense
CREATE INDEX idx_expense_shares_expense
    ON expense_shares(expense_id);

-- Recherche des règlements par groupe
CREATE INDEX idx_settlements_group
    ON settlements(group_id);

-- Recherche des activités par groupe
CREATE INDEX idx_activities_group
    ON activities(group_id);