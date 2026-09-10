

-- ============================================================
-- 1. USERS (6)
-- ============================================================

INSERT INTO users (first_name, last_name, email, phone, password_hash, profile_picture) VALUES
('Amine',   'Belkacem', 'amine.belkacem@example.com', NULL,            '$2b$10$fakehash.amine.000000000000000000', NULL),
('Sofiane', 'Haddad',   NULL,                          '+213555112233', '$2b$10$fakehash.sofiane.00000000000000000', NULL),
('Lina',    'Cherif',   'lina.cherif@example.com',     NULL,            '$2b$10$fakehash.lina.0000000000000000000', NULL),
('Yacine',  'Meziane',  NULL,                          '+213661223344', '$2b$10$fakehash.yacine.00000000000000000', NULL),
('Nassim',  'Boudiaf',  'nassim.boudiaf@example.com',  NULL,            '$2b$10$fakehash.nassim.00000000000000000', NULL),
('Karim',   'Zidane',   NULL,                          '+213770334455', '$2b$10$fakehash.karim.000000000000000000', NULL);
-- id : 1 Amine, 2 Sofiane, 3 Lina, 4 Yacine, 5 Nassim, 6 Karim

-- ============================================================
-- 2. GROUPS (4)
-- ============================================================

INSERT INTO groups (name, type, default_currency, is_archived) VALUES
('Weekend Béjaïa',   'voyage',      'DZD', FALSE),
('Coloc Alger',      'colocation',  'DZD', FALSE),
('Mouton de l''Aïd', 'evenement',   'DZD', FALSE),
('Voyage Tipaza',    'voyage',      'DZD', TRUE);
-- id : 1 Béjaïa, 2 Coloc, 3 Aïd, 4 Tipaza (archivé)

-- ============================================================
-- 3. GROUP_MEMBERS
-- ============================================================

INSERT INTO group_members (group_id, user_id, role) VALUES
(1, 1, 'admin'), (1, 2, 'member'), (1, 3, 'member'),
(2, 2, 'admin'), (2, 3, 'member'), (2, 4, 'member'), (2, 6, 'member'),
(3, 3, 'admin'), (3, 1, 'member'), (3, 4, 'member'), (3, 5, 'member'), (3, 6, 'member'),
(4, 1, 'admin'), (4, 2, 'member');

-- ============================================================
-- 4. CATEGORIES
-- ============================================================

INSERT INTO categories (group_id, name, name_ar, icon) VALUES
(NULL, 'Loyer',      'إيجار',     'home'),
(NULL, 'Courses',    'تسوق',      'shopping-cart'),
(NULL, 'Transport',  'نقل',       'car'),
(NULL, 'Restaurant', 'مطعم',      'utensils'),
(NULL, 'Factures',   'فواتير',    'file-text'),
(NULL, 'Santé',      'صحة',       'heart-pulse'),
(NULL, 'Loisirs',    'ترفيه',     'gamepad-2'),
(NULL, 'Événement',  'مناسبة',    'party-popper'),
(NULL, 'Autre',      'أخرى',      'more-horizontal'),
(3,    'Mouton',     'خروف',      'sheep');
-- id : 1 Loyer ... 9 Autre, 10 Mouton (groupe 3)

-- ============================================================
-- 5. EXPENSES
-- ============================================================

INSERT INTO expenses (group_id, payer_id, category_id, created_by, title, amount, currency, exchange_rate, split_mode, expense_date) VALUES
(1, 1, 3, 1, 'Essence jusqu''à Béjaïa', 3000.00, 'DZD', NULL, 'equal', '2026-08-15'),
(1, 3, 2, 3, 'Courses pour le weekend', 1000.00, 'DZD', NULL, 'equal', '2026-08-15'),
(2, 2, 1, 2, 'Loyer janvier', 32000.00, 'DZD', NULL, 'equal', '2026-01-05'),
(2, 4, 5, 4, 'Facture Sonelgaz', 4500.00, 'DZD', NULL, 'percentage', '2026-01-10'),
(2, 6, 2, 6, 'Courses communes', 6000.00, 'DZD', NULL, 'shares', '2026-01-12'),
(3, 5, 10, 5, 'Participation mouton (virement depuis la France)', 50.00, 'EUR', 145.0000, 'equal', '2026-05-20'),
(3, 1, 8, 1, 'Décoration et préparatifs Aïd', 5000.00, 'DZD', NULL, 'exact', '2026-05-22');
-- id : 1..7 dans l'ordre ci-dessus

-- ============================================================
-- 6. EXPENSE_SHARES
-- ============================================================

INSERT INTO expense_shares (expense_id, user_id, share_value, share_amount) VALUES
(1, 1, NULL, 1000.00), (1, 2, NULL, 1000.00), (1, 3, NULL, 1000.00);

INSERT INTO expense_shares (expense_id, user_id, share_value, share_amount) VALUES
(2, 1, NULL, 333.33), (2, 2, NULL, 333.33), (2, 3, NULL, 333.34);

INSERT INTO expense_shares (expense_id, user_id, share_value, share_amount) VALUES
(3, 2, NULL, 8000.00), (3, 3, NULL, 8000.00), (3, 4, NULL, 8000.00), (3, 6, NULL, 8000.00);

INSERT INTO expense_shares (expense_id, user_id, share_value, share_amount) VALUES
(4, 2, 25.00, 1125.00), (4, 3, 25.00, 1125.00), (4, 4, 25.00, 1125.00), (4, 6, 25.00, 1125.00);

INSERT INTO expense_shares (expense_id, user_id, share_value, share_amount) VALUES
(5, 2, 2, 3000.00), (5, 3, 1, 1500.00), (5, 4, 1, 1500.00);

INSERT INTO expense_shares (expense_id, user_id, share_value, share_amount) VALUES
(6, 1, NULL, 1450.00), (6, 3, NULL, 1450.00), (6, 4, NULL, 1450.00), (6, 5, NULL, 1450.00), (6, 6, NULL, 1450.00);

INSERT INTO expense_shares (expense_id, user_id, share_value, share_amount) VALUES
(7, 1, 1500.00, 1500.00), (7, 3, 1000.00, 1000.00), (7, 4, 1000.00, 1000.00), (7, 5, 1000.00, 1000.00), (7, 6, 500.00, 500.00);

-- ============================================================
-- 7. SETTLEMENTS
-- ============================================================

INSERT INTO settlements (group_id, payer_id, receiver_id, amount, payment_method, settlement_date, created_by) VALUES
(1, 2, 1, 1000.00, 'baridimob', '2026-08-20', 2),
(2, 4, 2, 8000.00, 'ccp', '2026-01-15', 4),
(3, 6, 3, 500.00, 'cash', '2026-05-25', 3);

-- ============================================================
-- 8. INVITATIONS
-- ============================================================

INSERT INTO invitations (group_id, code, created_by, expires_at, is_revoked) VALUES
(1, 'BJA123', 1, CURRENT_TIMESTAMP + INTERVAL '7 days', FALSE),
(2, 'COL456', 2, CURRENT_TIMESTAMP - INTERVAL '2 days', FALSE),
(3, 'AID789', 3, CURRENT_TIMESTAMP + INTERVAL '7 days', TRUE);

-- ============================================================
-- 9. COMMENTS
-- ============================================================

INSERT INTO comments (expense_id, user_id, content) VALUES
(1, 2, 'C''était pour l''essence jusqu''à Béjaïa, on a fait le plein deux fois'),
(3, 3, 'Loyer de janvier, viré à temps ce mois-ci'),
(6, 1, 'Merci Nassim d''avoir participé depuis la France !');

-- ============================================================
-- 10. ACTIVITIES
-- ============================================================

INSERT INTO activities (group_id, user_id, action_type, entity_type, entity_id, metadata) VALUES
(1, 1, 'expense_created',    'expense',    1, '{"title": "Essence jusqu''à Béjaïa", "amount": 3000.00}'),
(1, 3, 'expense_created',    'expense',    2, '{"title": "Courses pour le weekend", "amount": 1000.00}'),
(1, 2, 'settlement_recorded','settlement', 1, '{"amount": 1000.00, "method": "baridimob"}'),
(2, 2, 'member_joined',      'group_member', 4, '{"user": "Yacine Meziane"}'),
(2, 4, 'settlement_recorded','settlement', 2, '{"amount": 8000.00, "method": "ccp"}'),
(3, 5, 'expense_created',    'expense',    6, '{"title": "Participation mouton", "amount": 50.00, "currency": "EUR"}'),
(3, 6, 'settlement_recorded','settlement', 3, '{"amount": 500.00, "method": "cash"}');