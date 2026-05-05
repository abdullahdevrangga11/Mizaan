-- Mock LAZ partners (5)
INSERT INTO public.laz (wallet_address, slug, name, registration_number, region, jurisdiction_level, status) VALUES
  ('LzxDDY1...', 'dompet-dhuafa-yogya', 'Dompet Dhuafa Yogya', 'BAZNAS-LAZ-DIY-04', 'DI Yogyakarta', 'PROVINCIAL', 'ACTIVE'),
  ('LzxRZN1...', 'rumah-zakat', 'Rumah Zakat', 'BAZNAS-LAZ-NAT-12', 'Indonesia', 'NATIONAL', 'ACTIVE'),
  ('LzxIZI1...', 'izi-indonesia', 'Inisiatif Zakat Indonesia', 'BAZNAS-LAZ-NAT-08', 'Indonesia', 'NATIONAL', 'ACTIVE'),
  ('LzxBAY1...', 'baznas-yogya', 'BAZNAS Yogyakarta', 'BAZNAS-DIY-01', 'DI Yogyakarta', 'PROVINCIAL', 'ACTIVE'),
  ('LzxUGM1...', 'laz-ugm', 'LAZ UGM Yogyakarta', 'BAZNAS-LAZ-DIY-08', 'DI Yogyakarta', 'PROVINCIAL', 'ACTIVE')
ON CONFLICT (slug) DO NOTHING;

-- Mustahik are seeded via scripts/seed-mustahik.ts (TS, not SQL)
