-- FairDrive Seed Data
-- Top 20 makes for Canadian market + popular models from NHTSA vPIC API
-- Regions: major Canadian metro areas

-- ============================================================
-- REGIONS
-- ============================================================
INSERT INTO regions (name, province, country, slug) VALUES
  ('Vancouver',   'BC', 'CA', 'vancouver-bc'),
  ('Toronto',     'ON', 'CA', 'toronto-on'),
  ('Montreal',    'QC', 'CA', 'montreal-qc'),
  ('Calgary',     'AB', 'CA', 'calgary-ab'),
  ('Edmonton',    'AB', 'CA', 'edmonton-ab'),
  ('Ottawa',      'ON', 'CA', 'ottawa-on'),
  ('Winnipeg',    'MB', 'CA', 'winnipeg-mb'),
  ('Quebec City', 'QC', 'CA', 'quebec-city-qc'),
  ('Hamilton',    'ON', 'CA', 'hamilton-on'),
  ('Victoria',    'BC', 'CA', 'victoria-bc'),
  ('Halifax',     'NS', 'CA', 'halifax-ns'),
  ('Saskatoon',   'SK', 'CA', 'saskatoon-sk'),
  ('Regina',      'SK', 'CA', 'regina-sk'),
  ('Kelowna',     'BC', 'CA', 'kelowna-bc'),
  ('London',      'ON', 'CA', 'london-on');

-- ============================================================
-- MAKES
-- ============================================================
INSERT INTO makes (name, slug) VALUES
  ('Toyota',        'toyota'),
  ('Honda',         'honda'),
  ('Ford',          'ford'),
  ('Chevrolet',     'chevrolet'),
  ('Hyundai',       'hyundai'),
  ('Kia',           'kia'),
  ('Nissan',        'nissan'),
  ('Mazda',         'mazda'),
  ('Subaru',        'subaru'),
  ('Volkswagen',    'volkswagen'),
  ('BMW',           'bmw'),
  ('Mercedes-Benz', 'mercedes-benz'),
  ('Audi',          'audi'),
  ('Tesla',         'tesla'),
  ('Jeep',          'jeep'),
  ('Ram',           'ram'),
  ('GMC',           'gmc'),
  ('Lexus',         'lexus'),
  ('Acura',         'acura'),
  ('Dodge',         'dodge');

-- ============================================================
-- MODELS  (current + recent models available in Canada)
-- ============================================================

-- Toyota
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Corolla',        'corolla'),
  ('Camry',          'camry'),
  ('RAV4',           'rav4'),
  ('Highlander',     'highlander'),
  ('4Runner',        '4runner'),
  ('Tacoma',         'tacoma'),
  ('Tundra',         'tundra'),
  ('Prius',          'prius'),
  ('Supra',          'supra'),
  ('C-HR',           'c-hr'),
  ('Corolla Cross',  'corolla-cross'),
  ('GR86',           'gr86'),
  ('bZ4X',           'bz4x'),
  ('Crown',          'crown'),
  ('Grand Highlander','grand-highlander'),
  ('Sienna',         'sienna'),
  ('Sequoia',        'sequoia'),
  ('Venza',          'venza'),
  ('GR Corolla',     'gr-corolla'),
  ('RAV4 Prime',     'rav4-prime')
) AS v(name, slug) WHERE m.slug = 'toyota';

-- Honda
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Civic',     'civic'),
  ('Accord',    'accord'),
  ('CR-V',      'cr-v'),
  ('HR-V',      'hr-v'),
  ('Pilot',     'pilot'),
  ('Passport',  'passport'),
  ('Odyssey',   'odyssey'),
  ('Ridgeline', 'ridgeline'),
  ('Insight',   'insight'),
  ('Prologue',  'prologue')
) AS v(name, slug) WHERE m.slug = 'honda';

-- Ford
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('F-150',         'f-150'),
  ('Escape',        'escape'),
  ('Explorer',      'explorer'),
  ('Edge',          'edge'),
  ('Bronco',        'bronco'),
  ('Bronco Sport',  'bronco-sport'),
  ('Mustang',       'mustang'),
  ('Maverick',      'maverick'),
  ('Ranger',        'ranger'),
  ('Expedition',    'expedition'),
  ('Mustang Mach-E','mustang-mach-e'),
  ('F-250',         'f-250'),
  ('F-350',         'f-350')
) AS v(name, slug) WHERE m.slug = 'ford';

-- Chevrolet
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Silverado',   'silverado'),
  ('Equinox',     'equinox'),
  ('Traverse',    'traverse'),
  ('Tahoe',       'tahoe'),
  ('Suburban',    'suburban'),
  ('Colorado',    'colorado'),
  ('Camaro',      'camaro'),
  ('Corvette',    'corvette'),
  ('Blazer',      'blazer'),
  ('Trax',        'trax'),
  ('Trailblazer', 'trailblazer'),
  ('Bolt EV',     'bolt-ev'),
  ('Bolt EUV',    'bolt-euv'),
  ('Malibu',      'malibu')
) AS v(name, slug) WHERE m.slug = 'chevrolet';

-- Hyundai
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Tucson',     'tucson'),
  ('Santa Fe',   'santa-fe'),
  ('Elantra',    'elantra'),
  ('Sonata',     'sonata'),
  ('Kona',       'kona'),
  ('Palisade',   'palisade'),
  ('Venue',      'venue'),
  ('Ioniq 5',    'ioniq-5'),
  ('Ioniq 6',    'ioniq-6'),
  ('Santa Cruz', 'santa-cruz'),
  ('Accent',     'accent'),
  ('Ioniq 5 N',  'ioniq-5-n')
) AS v(name, slug) WHERE m.slug = 'hyundai';

-- Kia
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Forte',     'forte'),
  ('K5',        'k5'),
  ('Sportage',  'sportage'),
  ('Sorento',   'sorento'),
  ('Telluride', 'telluride'),
  ('Seltos',    'seltos'),
  ('Soul',      'soul'),
  ('Niro',      'niro'),
  ('Stinger',   'stinger'),
  ('EV6',       'ev6'),
  ('EV9',       'ev9'),
  ('Rio',       'rio'),
  ('Carnival',  'carnival')
) AS v(name, slug) WHERE m.slug = 'kia';

-- Nissan
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Rogue',      'rogue'),
  ('Sentra',     'sentra'),
  ('Altima',     'altima'),
  ('Pathfinder', 'pathfinder'),
  ('Kicks',      'kicks'),
  ('Murano',     'murano'),
  ('Frontier',   'frontier'),
  ('Armada',     'armada'),
  ('Leaf',       'leaf'),
  ('Maxima',     'maxima'),
  ('Versa',      'versa'),
  ('Ariya',      'ariya'),
  ('Z',          'z')
) AS v(name, slug) WHERE m.slug = 'nissan';

-- Mazda
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Mazda3',  'mazda3'),
  ('CX-5',   'cx-5'),
  ('CX-30',  'cx-30'),
  ('CX-50',  'cx-50'),
  ('CX-90',  'cx-90'),
  ('CX-70',  'cx-70'),
  ('MX-5',   'mx-5'),
  ('CX-9',   'cx-9'),
  ('Mazda6', 'mazda6'),
  ('MX-30',  'mx-30')
) AS v(name, slug) WHERE m.slug = 'mazda';

-- Subaru
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Outback',    'outback'),
  ('Forester',   'forester'),
  ('Crosstrek',  'crosstrek'),
  ('Impreza',    'impreza'),
  ('WRX',        'wrx'),
  ('Legacy',     'legacy'),
  ('Ascent',     'ascent'),
  ('BRZ',        'brz'),
  ('Solterra',   'solterra')
) AS v(name, slug) WHERE m.slug = 'subaru';

-- Volkswagen
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Jetta',             'jetta'),
  ('Tiguan',            'tiguan'),
  ('Atlas',             'atlas'),
  ('Golf',              'golf'),
  ('Taos',              'taos'),
  ('ID.4',              'id4'),
  ('Atlas Cross Sport', 'atlas-cross-sport'),
  ('Arteon',            'arteon'),
  ('Golf GTI',          'golf-gti'),
  ('Golf R',            'golf-r'),
  ('ID. Buzz',          'id-buzz')
) AS v(name, slug) WHERE m.slug = 'volkswagen';

-- BMW
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('3 Series', '3-series'),
  ('5 Series', '5-series'),
  ('X3',       'x3'),
  ('X5',       'x5'),
  ('X1',       'x1'),
  ('4 Series', '4-series'),
  ('7 Series', '7-series'),
  ('X7',       'x7'),
  ('i4',       'i4'),
  ('iX',       'ix'),
  ('2 Series', '2-series'),
  ('M3',       'm3'),
  ('M4',       'm4'),
  ('X2',       'x2'),
  ('X4',       'x4'),
  ('X6',       'x6'),
  ('i5',       'i5'),
  ('i7',       'i7')
) AS v(name, slug) WHERE m.slug = 'bmw';

-- Mercedes-Benz
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('C-Class',   'c-class'),
  ('E-Class',   'e-class'),
  ('GLC',       'glc'),
  ('GLE',       'gle'),
  ('A-Class',   'a-class'),
  ('CLA',       'cla'),
  ('GLB',       'glb'),
  ('GLA',       'gla'),
  ('S-Class',   's-class'),
  ('GLS',       'gls'),
  ('EQB',       'eqb'),
  ('EQE',       'eqe'),
  ('EQS',       'eqs'),
  ('AMG GT',    'amg-gt')
) AS v(name, slug) WHERE m.slug = 'mercedes-benz';

-- Audi
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('A4',        'a4'),
  ('A3',        'a3'),
  ('Q5',        'q5'),
  ('Q7',        'q7'),
  ('Q3',        'q3'),
  ('A5',        'a5'),
  ('A6',        'a6'),
  ('Q8',        'q8'),
  ('e-tron',    'e-tron'),
  ('e-tron GT', 'e-tron-gt'),
  ('RS 5',      'rs-5'),
  ('S4',        's4'),
  ('Q8 e-tron', 'q8-e-tron')
) AS v(name, slug) WHERE m.slug = 'audi';

-- Tesla
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Model 3',   'model-3'),
  ('Model Y',   'model-y'),
  ('Model S',   'model-s'),
  ('Model X',   'model-x'),
  ('Cybertruck', 'cybertruck')
) AS v(name, slug) WHERE m.slug = 'tesla';

-- Jeep
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Grand Cherokee',   'grand-cherokee'),
  ('Wrangler',         'wrangler'),
  ('Cherokee',         'cherokee'),
  ('Compass',          'compass'),
  ('Gladiator',        'gladiator'),
  ('Grand Cherokee L', 'grand-cherokee-l'),
  ('Wagoneer',         'wagoneer'),
  ('Grand Wagoneer',   'grand-wagoneer')
) AS v(name, slug) WHERE m.slug = 'jeep';

-- Ram
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('1500', '1500'),
  ('2500', '2500'),
  ('3500', '3500')
) AS v(name, slug) WHERE m.slug = 'ram';

-- GMC
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Sierra',  'sierra'),
  ('Terrain', 'terrain'),
  ('Acadia',  'acadia'),
  ('Yukon',   'yukon'),
  ('Canyon',  'canyon'),
  ('Hummer EV','hummer-ev')
) AS v(name, slug) WHERE m.slug = 'gmc';

-- Lexus
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('RX',  'rx'),
  ('NX',  'nx'),
  ('IS',  'is'),
  ('ES',  'es'),
  ('UX',  'ux'),
  ('GX',  'gx'),
  ('LX',  'lx'),
  ('TX',  'tx'),
  ('RZ',  'rz'),
  ('LC',  'lc')
) AS v(name, slug) WHERE m.slug = 'lexus';

-- Acura
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('TLX',       'tlx'),
  ('RDX',       'rdx'),
  ('MDX',       'mdx'),
  ('Integra',   'integra'),
  ('ZDX',       'zdx')
) AS v(name, slug) WHERE m.slug = 'acura';

-- Dodge
INSERT INTO models (make_id, name, slug)
SELECT m.id, v.name, v.slug FROM makes m,
(VALUES
  ('Charger',     'charger'),
  ('Durango',     'durango'),
  ('Challenger',  'challenger'),
  ('Hornet',      'hornet')
) AS v(name, slug) WHERE m.slug = 'dodge';
