export const cropGuidesData = [
  {
    id: 'wheat',
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    season: 'Rabi (Winter)',
    icon: '🌾',
    color: 'from-amber-400 to-yellow-600',
    description: 'Wheat is the premier cereal staple across the Indus basin, thriving in mild winter temperatures and requiring regulated irrigation during tillering, booting, and grain filling stages.',
    requirements: {
      tempIdeal: [15, 25],
      tempRange: [4, 32],
      phRange: [6.0, 7.5],
      waterReq: '400 - 500 mm',
      soil: 'Well-drained fertile loamy or clay loam soil'
    },
    lifecycle: [
      {
        stage: 'Sowing & Germination',
        days: '1 - 15',
        desc: 'Seed imbibition and initial coleoptile emergence in moist, well-prepared seedbeds.',
        actions: ['Treat seeds with certified fungicide', 'Ensure proper soil moisture (Rauni irrigation)', 'Sow at optimal 4-5 cm depth']
      },
      {
        stage: 'Crown Root Initiation (CRI) & Tillering',
        days: '20 - 45',
        desc: 'Formation of secondary root systems and vegetative tillers.',
        actions: ['Apply first critical irrigation at CRI stage (20-25 days)', 'Top-dress first split of nitrogenous fertilizer', 'Scout for broadleaf and grassy weeds']
      },
      {
        stage: 'Stem Elongation & Booting',
        days: '50 - 85',
        desc: 'Rapid vertical growth and development of the flag leaf enclosing the young spike.',
        actions: ['Apply second/third irrigation avoiding waterlogging', 'Apply second urea dose before boot stage', 'Monitor for early signs of yellow/brown rust']
      },
      {
        stage: 'Heading & Flowering (Anthesis)',
        days: '90 - 110',
        desc: 'Spike emergence and pollination. Highly sensitive to heat stress and moisture deficit.',
        actions: ['Ensure adequate soil moisture during flowering', 'Avoid spraying harsh chemicals during peak anthesis', 'Scout for armyworms and aphid colonies']
      },
      {
        stage: 'Grain Filling & Maturity',
        days: '115 - 145',
        desc: 'Translocation of carbohydrates into the grain (milk and dough stages) leading to golden ripening.',
        actions: ['Final light irrigation during milky dough stage', 'Stop watering 10-14 days before harvest', 'Harvest when grain moisture drops below 12%']
      }
    ],
    threats: [
      'Leaf Rust (Puccinia triticina)',
      'Loose Smut (Ustilago nuda)',
      'Aphids (Sitobion avenae)',
      'Armyworm (Spodoptera litura)',
      'Terminal Heat Stress during grain fill'
    ]
  },
  {
    id: 'rice',
    name: 'Rice',
    scientificName: 'Oryza sativa',
    season: 'Kharif (Monsoon/Summer)',
    icon: '🌾',
    color: 'from-emerald-400 to-green-600',
    description: 'Rice is a water-intensive kharif staple cultivated across canal-fed plains, renowned for premium Basmati aromatic varieties.',
    requirements: {
      tempIdeal: [22, 32],
      tempRange: [18, 38],
      phRange: [5.5, 7.0],
      waterReq: '1100 - 1500 mm',
      soil: 'Heavy clay or clayey loam with low percolation'
    },
    lifecycle: [
      {
        stage: 'Nursery Raising & Sowing',
        days: '1 - 30',
        desc: 'Raising vigorous seedlings in nursery beds prior to puddle transplanting.',
        actions: ['Seed treatment with carbendazim or bio-inoculants', 'Maintain moist seedbed without submergence', 'Prepare main field by thorough puddling']
      },
      {
        stage: 'Transplanting & Tillering',
        days: '30 - 65',
        desc: 'Transplanting 25-30 day seedlings into puddled soils with shallow standing water.',
        actions: ['Maintain 2-3 cm standing water', 'Apply basal dose of DAP and Zinc sulfate', 'Split nitrogen at active tillering']
      },
      {
        stage: 'Panicle Initiation & Booting',
        days: '70 - 95',
        desc: 'Development of young panicles within the sheath.',
        actions: ['Increase water depth to 5 cm', 'Apply final booster nitrogen split', 'Scout for stem borer and leaf folder damage']
      },
      {
        stage: 'Flowering & Grain Filling',
        days: '100 - 125',
        desc: 'Emerged panicles pollinate and grains fill with starch.',
        actions: ['Maintain continuous moisture without water deficit', 'Scout for Bacterial Leaf Blight and Blast', 'Apply protective fungicide if humidity surges']
      },
      {
        stage: 'Maturity & Harvest',
        days: '130 - 150',
        desc: 'Canopy turns golden-yellow; grains harden.',
        actions: ['Drain field water 10 days before harvesting', 'Harvest when 85% grains turn straw-colored']
      }
    ],
    threats: [
      'Rice Blast (Magnaporthe oryzae)',
      'Bacterial Leaf Blight (Xanthomonas oryzae)',
      'Yellow Stem Borer (Scirpophaga incertulas)',
      'Rice Leaf Folder (Cnaphalocrocis medinalis)'
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    season: 'Kharif (Summer)',
    icon: '🌿',
    color: 'from-sky-400 to-indigo-600',
    description: 'Cotton is the primary commercial cash crop ("Silver Fiber") supporting regional textile economies, requiring meticulous pest management and heat tolerance.',
    requirements: {
      tempIdeal: [25, 35],
      tempRange: [18, 45],
      phRange: [6.5, 8.0],
      waterReq: '650 - 900 mm',
      soil: 'Deep, well-drained fertile alluvial loam'
    },
    lifecycle: [
      {
        stage: 'Sowing & Seedling Establishment',
        days: '1 - 25',
        desc: 'Sowing on raised beds/ridges with delinted certified seed.',
        actions: ['Use acid-delinted certified Bt hybrids', 'Sow on ridges with optimum row spacing', 'Monitor germination within 5-7 days']
      },
      {
        stage: 'Squaring & Vegetative Growth',
        days: '30 - 60',
        desc: 'Emergence of floral buds (squares) and branching.',
        actions: ['Apply first irrigation and interculturing', 'Monitor sucking pests (whitefly, jassids, thrips)', 'Apply balanced NPK and boron']
      },
      {
        stage: 'Flowering & Boll Setting',
        days: '65 - 105',
        desc: 'Blooms open and pollinate to form expanding cotton bolls.',
        actions: ['Maintain regular irrigation avoiding moisture stress', 'Scout for Pink & Spotted Bollworms', 'Apply foliar potassium nitrate for boll size']
      },
      {
        stage: 'Boll Maturation & Bursting',
        days: '110 - 150',
        desc: 'Bolls mature, desiccate, and burst open displaying white lint.',
        actions: ['Withhold late heavy irrigations to prevent vegetative flush', 'Manual picking in dry clean morning hours', 'Avoid contaminant mixing in picked lint']
      }
    ],
    threats: [
      'Cotton Leaf Curl Virus (CLCuV)',
      'Whitefly (Bemisia tabaci)',
      'Pink Bollworm (Pectinophora gossypiella)',
      'Bacterial Blight / Angular Leaf Spot'
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    season: 'Annual (Autumn / Spring)',
    icon: '🎋',
    color: 'from-lime-400 to-emerald-600',
    description: 'Sugarcane is a long-duration high-biomass industrial crop supplying sugar and bioenergy, requiring consistent moisture and deep furrow tillage.',
    requirements: {
      tempIdeal: [26, 36],
      tempRange: [15, 42],
      phRange: [6.0, 7.8],
      waterReq: '1500 - 2200 mm',
      soil: 'Deep well-drained loam to heavy alluvial soil'
    },
    lifecycle: [
      {
        stage: 'Sett Planting & Germination',
        days: '1 - 40',
        desc: 'Planting 2-3 budded setts in deep trenches/furrows.',
        actions: ['Treat setts with hot water or fungicide', 'Plant in furrows with good moisture', 'Apply basal phosphorus and potash']
      },
      {
        stage: 'Tillering (Formative Stage)',
        days: '45 - 120',
        desc: 'Prolific shoot emergence and subterranean root crown establishment.',
        actions: ['Frequent light irrigations', 'Apply urea in splits', 'Interculturing and earth-up ridges']
      },
      {
        stage: 'Grand Growth Stage',
        days: '125 - 270',
        desc: 'Rapid cane stalk elongation and internode multiplication.',
        actions: ['Ensure uninterrupted furrow irrigation', 'Scout for top borer and stem borers', 'Earthing up to prevent lodging']
      },
      {
        stage: 'Ripening & Maturation',
        days: '275 - 365',
        desc: 'Sucrose synthesis and storage in stalk internodes.',
        actions: ['Withhold irrigation 20 days prior to harvest', 'Test brix reading for peak sugar content', 'Harvest close to ground level']
      }
    ],
    threats: [
      'Sugarcane Smut (Sporisorium scitamineum)',
      'Red Rot (Colletotrichum falcatum)',
      'Top Borer (Scirpophaga excerptalis)',
      'Pyrilla (Pyrilla perpusilla)'
    ]
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    season: 'Spring / Autumn',
    icon: '🌽',
    color: 'from-amber-400 to-orange-500',
    description: 'A versatile cereal grown for grain and silage, renowned for high hybrid yields under modern ridge and drip agronomy.',
    requirements: {
      tempIdeal: [20, 30],
      tempRange: [12, 38],
      phRange: [5.8, 7.2],
      waterReq: '500 - 700 mm',
      soil: 'Well-drained deep fertile loamy soil'
    },
    lifecycle: [
      {
        stage: 'Emergence & Early Vegetative (V1-V6)',
        days: '1 - 25',
        desc: 'Rapid emergence and collar formation on ridges.',
        actions: ['Ensure uniform seed spacing and moisture', 'Apply pre-emergence herbicide', 'Apply early nitrogen split']
      },
      {
        stage: 'Tasseling & Silking (R1)',
        days: '50 - 65',
        desc: 'Pollen shedding from tassels and emergence of ear silks. Extremely sensitive to water stress.',
        actions: ['Never allow moisture stress during silking', 'Scout for Fall Armyworm (FAW) on whorls', 'Apply booster potassium and zinc']
      },
      {
        stage: 'Grain Fill & Dent Stage (R2-R5)',
        days: '70 - 100',
        desc: 'Kernel starch accumulation from milk to dent formation.',
        actions: ['Maintain moisture until black layer matures', 'Monitor foliar leaf blights', 'Scout ear worms']
      },
      {
        stage: 'Physiological Maturity & Harvest',
        days: '105 - 125',
        desc: 'Black layer forms at base of kernels indicating harvest maturity.',
        actions: ['Combine harvest at 18-20% kernel moisture', 'Dry grain to 14% for storage']
      }
    ],
    threats: [
      'Fall Armyworm (Spodoptera frugiperda)',
      'Maydis Leaf Blight (Bipolaris maydis)',
      'Common Rust (Puccinia sorghi)',
      'Stem Borer (Chilo partellus)'
    ]
  },
  {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    season: 'Autumn / Spring (Protected / Open)',
    icon: '🍅',
    color: 'from-red-500 to-rose-600',
    description: 'High-value vegetable crop requiring intensive canopy pruning, balanced calcium nutrition, and proactive blight prevention.',
    requirements: {
      tempIdeal: [18, 27],
      tempRange: [10, 34],
      phRange: [6.0, 6.8],
      waterReq: '400 - 600 mm',
      soil: 'Rich loamy soil with high organic matter'
    },
    lifecycle: [
      {
        stage: 'Transplanting & Vegetative Growth',
        days: '1 - 30',
        desc: 'Transplanting nursery seedlings into raised beds with staking/trellising.',
        actions: ['Prune bottom leaves to prevent soil-splash pathogen contact', 'Drench with bio-fungicide', 'Apply balanced NPK fertigation']
      },
      {
        stage: 'Flowering & Fruit Set',
        days: '35 - 60',
        desc: 'Yellow blossom clusters open and small green fruit emerge.',
        actions: ['Ensure adequate calcium to prevent Blossom End Rot', 'Avoid overhead sprinkler wetting', 'Scout for Early & Late Blight']
      },
      {
        stage: 'Fruit Sizing & Ripening',
        days: '65 - 100',
        desc: 'Fruit expands, changes from green to breaker stage and rich red.',
        actions: ['Apply potassium for fruit sugar and firm skin', 'Harvest at breaker/pink stage for transport', 'Regular picking every 3-4 days']
      }
    ],
    threats: [
      'Late Blight (Phytophthora infestans)',
      'Early Blight (Alternaria solani)',
      'Tomato Fruit Borer (Helicoverpa armigera)',
      'Whitefly / Tomato Leaf Curl Virus'
    ]
  },
  {
    id: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    season: 'Autumn / Winter',
    icon: '🥔',
    color: 'from-amber-600 to-stone-700',
    description: 'Major tuber cash crop grown on raised ridges across central Punjab plains, highly responsive to earthing-up and fungicide protection.',
    requirements: {
      tempIdeal: [15, 22],
      tempRange: [8, 28],
      phRange: [5.2, 6.5],
      waterReq: '450 - 650 mm',
      soil: 'Loose, friable sandy loam rich in organic matter'
    },
    lifecycle: [
      {
        stage: 'Sprouting & Emergence',
        days: '1 - 25',
        desc: 'Sprout development from certified seed tubers into emergent shoots.',
        actions: ['Plant certified seed tubers', 'Ensure friable ridge formation', 'Pre-emergence weed suppression']
      },
      {
        stage: 'Tuber Initiation & Bulking',
        days: '30 - 75',
        desc: 'Underground stolon tips swell to form tubers; rapid vegetative canopy.',
        actions: ['Perform earthing-up to prevent greening of tubers', 'Frequent regulated irrigations avoiding dry-wet cycles', 'Preventative sprays for Late Blight']
      },
      {
        stage: 'Canopy Senescence & Skin Curing',
        days: '80 - 110',
        desc: 'Vines dehaulmed/cut to harden tuber skin prior to digger harvesting.',
        actions: ['Dehaulm vines 10-14 days before harvest', 'Allow tuber skin to cure and harden in soil', 'Dig during dry sunny conditions']
      }
    ],
    threats: [
      'Late Blight (Phytophthora infestans)',
      'Early Blight (Alternaria solani)',
      'Potato Leafroll Virus (PLRV)',
      'Cutworms and Aphids'
    ]
  }
];
