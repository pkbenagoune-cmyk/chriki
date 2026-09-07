DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS expense_shares;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS activities;


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
    CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE groups(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    default_currency VARCHAR(10) NOT NULL DEFAULT 'DZD',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members(
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),  
    name VARCHAR(50) NOT NULL,
    name_ar VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses(
     id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    payer_id INTEGER REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'DZD',
    exchange_rate NUMERIC(10,4),
    split_mode VARCHAR(20) NOT NULL CHECK (split_mode IN ('equal', 'exact', 'shares', 'percentage')),
    receipt_url VARCHAR(255),
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense_shares (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    share_value NUMERIC(10,2),
    share_amount NUMERIC(12,2) NOT NULL CHECK (share_amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(expense_id, user_id)
);

CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    payer_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'baridimob', 'ccp', 'transfer')),
    settlement_date DATE NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (payer_id != receiver_id)
);

CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    code VARCHAR(6) NOT NULL UNIQUE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    action_type VARCHAR(30) NOT NULL,
    entity_type VARCHAR(20) NOT NULL,
    entity_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



