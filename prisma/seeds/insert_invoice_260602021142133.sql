-- Invoice seed: Rivers State University Teaching Hospital
-- Replace :createdById with the actual UUID of an existing admin user.

BEGIN;

INSERT INTO invoices (
  id, "invoiceNumber", status, "clientName", "clientEmail", "clientAddress",
  "issueDate", "dueDate", currency, subtotal, "taxRate", "taxAmount", discount, "grandTotal",
  notes, "createdById", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '260602021142133',
  'SAVED',
  'PATRICK ISAIAH EFFIONG',
  'patient.131474@rusth.ng',
  'Rivers State University Teaching Hospital',
  '2026-06-02T14:11:53Z',
  '2026-06-02T14:11:53Z',
  'NGN',
  2230000,
  0,
  0,
  0,
  2230000,
  'Cashier: godspowerr pepple | Source: MedixTrak — xtrak.cinfores.net | Patient ID: 131474',
  :createdById,
  NOW(),
  NOW()
);

-- Store the newly created invoice ID for line item inserts
-- (Run this after obtaining the invoice ID from the INSERT above)
-- Replace :invoiceId with the actual invoice UUID.

INSERT INTO line_items (id, description, quantity, "unitPrice", total, "invoiceId")
VALUES
  (gen_random_uuid(), 'CONSULTATION FEE - A&E',            1, 200000,   200000,   :invoiceId),
  (gen_random_uuid(), 'BED FEE - A&E',                     1, 1000000,  1000000,  :invoiceId),
  (gen_random_uuid(), 'PCV - A&E',                         1, 100000,   100000,   :invoiceId),
  (gen_random_uuid(), 'URINALYSIS - A&E',                  1, 200000,   200000,   :invoiceId),
  (gen_random_uuid(), 'C-SPINE COLLAR (SOFT/PHIL/COMP) - A&E', 1, 550000, 550000, :invoiceId),
  (gen_random_uuid(), 'RANDOM BLOOD SUGAR - ACCUCHECK',    1, 150000,   150000,   :invoiceId),
  (gen_random_uuid(), 'EHR FEE (PORTAL CHARGE)',           1, 30000,    30000,    :invoiceId);

COMMIT;
