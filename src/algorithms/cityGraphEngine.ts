/**
 * Jaipur Smart Route Navigator Engine
 * 
 * Clean, simplified, and uncluttered geographic graph for Jaipur:
 * - 14 Core Primary Landmarks & Junctions displayed on the default map
 * - Full catalog of famous Jaipur landmarks available via searchable selection
 * - Minimal intersecting roads with clear, readable typography
 * - Mathematically admissible Euclidean straight-line heuristic for A*
 * - Pure distance priority for Dijkstra's Algorithm
 * - Complete snapshot generation for forward/backward step execution
 */

import {
  CityNode,
  CityEdge,
  AlgorithmType,
  CityGraphSnapshot,
  CityGraphEvent,
  CityGraphResult,
  SearchStatus,
} from '../types/cityGraph';

// Clean SVG Coordinate bounds (comfortable breathing room)
export const MAP_VIEWBOX_WIDTH = 900;
export const MAP_VIEWBOX_HEIGHT = 620;

// Coordinate scale: ~22 SVG pixels approx = 1 km
export const DISTANCE_SCALE = 22;

export function calculateEuclideanHeuristic(a: CityNode, b: CityNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rawDist = Math.sqrt(dx * dx + dy * dy);
  return Math.max(1, Math.round(rawDist / DISTANCE_SCALE));
}

// Full Jaipur landmark nodes: 14 Core nodes (isCore: true) + secondary destinations
export const ALL_JAIPUR_NODES: CityNode[] = [
  // --- CORE 14 LOCATIONS DISPLAYED ON THE DEFAULT MAP ---
  {
    id: 'muj',
    name: 'Manipal Univ (MUJ)',
    x: 100,
    y: 490,
    category: 'transit',
    iconName: 'GraduationCap',
    zone: 'West Jaipur / Ajmer Road',
    description: 'Dehmi Kalan, NH-48 Ajmer Expressway (Default Starting Point)',
    isCore: true,
  },
  {
    id: 'bhankrota_jct',
    name: 'Bhankrota Junction',
    x: 230,
    y: 430,
    category: 'junction',
    iconName: 'Waypoints',
    zone: 'Ajmer Road Corridor',
    description: 'Bypass connecting Ajmer Road to central Jaipur & southern bypass',
    isCore: true,
  },
  {
    id: 'jaipur_junction',
    name: 'Jaipur Railway Station',
    x: 370,
    y: 360,
    category: 'transit',
    iconName: 'Train',
    zone: 'Central West Jaipur',
    description: 'Main central railway terminus of Jaipur',
    isCore: true,
  },
  {
    id: 'mi_road',
    name: 'MI Road / Ajmeri Gate',
    x: 480,
    y: 350,
    category: 'shopping',
    iconName: 'Store',
    zone: 'Central Jaipur',
    description: 'Commercial spine and western gateway to Pink City',
    isCore: true,
  },
  {
    id: 'city_palace',
    name: 'City Palace',
    x: 540,
    y: 260,
    category: 'heritage',
    iconName: 'Castle',
    zone: 'Pink City (Walled City)',
    description: 'Historic royal palace complex in the heart of the Pink City',
    isCore: true,
  },
  {
    id: 'hawa_mahal',
    name: 'Hawa Mahal',
    x: 640,
    y: 260,
    category: 'heritage',
    iconName: 'Castle',
    zone: 'Pink City (Walled City)',
    description: 'Palace of Winds with 953 ornate jharokhas',
    isCore: true,
  },
  {
    id: 'albert_hall',
    name: 'Albert Hall Museum',
    x: 490,
    y: 440,
    category: 'museum',
    iconName: 'Landmark',
    zone: 'Ram Niwas Garden',
    description: 'Oldest museum in Rajasthan, Indo-Saracenic masterpiece',
    isCore: true,
  },
  {
    id: 'jln_marg',
    name: 'JLN Marg Corridor',
    x: 610,
    y: 460,
    category: 'junction',
    iconName: 'Waypoints',
    zone: 'South-Central Jaipur',
    description: 'Arterial academic & commercial avenue connecting to Airport',
    isCore: true,
  },
  {
    id: 'patrika_gate',
    name: 'Patrika Gate',
    x: 650,
    y: 540,
    category: 'park',
    iconName: 'Landmark',
    zone: 'Jawahar Circle, South Jaipur',
    description: 'Iconic ornate pink archway at Jawahar Circle',
    isCore: true,
  },
  {
    id: 'airport',
    name: 'Jaipur Airport',
    x: 770,
    y: 540,
    category: 'transit',
    iconName: 'Plane',
    zone: 'South Jaipur / Sanganer',
    description: 'Jaipur International Airport (Terminal 2)',
    isCore: true,
  },
  {
    id: 'zorawar_singh_gate',
    name: 'Zorawar Singh Gate',
    x: 570,
    y: 175,
    category: 'junction',
    iconName: 'Waypoints',
    zone: 'North Pink City Gateway',
    description: 'Northern portal of Walled City leading toward Amer',
    isCore: true,
  },
  {
    id: 'nahargarh_fort',
    name: 'Nahargarh Fort',
    x: 440,
    y: 150,
    category: 'heritage',
    iconName: 'Shield',
    zone: 'Aravalli Hills Overlook',
    description: 'Historic hilltop fort offering panoramic views of Jaipur',
    isCore: true,
  },
  {
    id: 'jal_mahal',
    name: 'Jal Mahal',
    x: 670,
    y: 175,
    category: 'heritage',
    iconName: 'Waves',
    zone: 'Amer Road',
    description: 'Water palace situated in Man Sagar Lake',
    isCore: true,
  },
  {
    id: 'amber_fort',
    name: 'Amber Fort',
    x: 740,
    y: 95,
    category: 'heritage',
    iconName: 'Crown',
    zone: 'North Jaipur / Amer',
    description: 'UNESCO World Heritage hill fortress (Default Destination)',
    isCore: true,
  },

  // --- SECONDARY DESTINATIONS (AVAILABLE IN SEARCHABLE DROPDOWN) ---
  {
    id: 'birla_mandir',
    name: 'Birla Mandir',
    x: 550,
    y: 470,
    category: 'temple',
    iconName: 'Church',
    zone: 'Moti Dungri / JLN Marg',
    description: 'Pure white marble temple of Laxmi Narayan',
    isCore: false,
  },
  {
    id: 'moti_dungri',
    name: 'Moti Dungri Ganesh',
    x: 570,
    y: 495,
    category: 'temple',
    iconName: 'Church',
    zone: 'Moti Dungri Hill',
    description: 'Historic and revered Lord Ganesha temple',
    isCore: false,
  },
  {
    id: 'wtp',
    name: 'World Trade Park (WTP)',
    x: 630,
    y: 505,
    category: 'shopping',
    iconName: 'Building2',
    zone: 'South Jaipur / Malviya Nagar',
    description: 'Iconic blue glass twin-tower mall',
    isCore: false,
  },
  {
    id: 'gaurav_tower',
    name: 'Gaurav Tower (GT)',
    x: 605,
    y: 520,
    category: 'shopping',
    iconName: 'Store',
    zone: 'Malviya Nagar',
    description: 'Premier shopping and street food hub',
    isCore: false,
  },
  {
    id: 'gt_central',
    name: 'GT Central',
    x: 650,
    y: 515,
    category: 'shopping',
    iconName: 'ShoppingBag',
    zone: 'Malviya Nagar',
    description: 'Entertainment mall with multiplex',
    isCore: false,
  },
  {
    id: 'jantar_mantar',
    name: 'Jantar Mantar',
    x: 575,
    y: 280,
    category: 'museum',
    iconName: 'Compass',
    zone: 'Pink City Core',
    description: 'UNESCO World Heritage astronomical observatory',
    isCore: false,
  },
  {
    id: 'govind_dev_ji',
    name: 'Govind Dev Ji Temple',
    x: 540,
    y: 220,
    category: 'temple',
    iconName: 'Church',
    zone: 'City Palace Complex',
    description: 'Sacred temple of Jaipur royal family',
    isCore: false,
  },
  {
    id: 'city_palace_museum',
    name: 'City Palace Museum',
    x: 520,
    y: 245,
    category: 'museum',
    iconName: 'Landmark',
    zone: 'City Palace Complex',
    description: 'Royal textiles, armory, and Gangajali urns',
    isCore: false,
  },
  {
    id: 'johari_bazaar',
    name: 'Johari Bazaar',
    x: 620,
    y: 310,
    category: 'shopping',
    iconName: 'Gem',
    zone: 'Walled Pink City',
    description: 'World-renowned jewelry and gemstone bazaar',
    isCore: false,
  },
  {
    id: 'bapu_bazaar',
    name: 'Bapu Bazaar',
    x: 560,
    y: 330,
    category: 'shopping',
    iconName: 'ShoppingBag',
    zone: 'Walled Pink City',
    description: 'Famous for camel leather footwear and textiles',
    isCore: false,
  },
  {
    id: 'nehru_bazaar',
    name: 'Nehru Bazaar',
    x: 520,
    y: 335,
    category: 'shopping',
    iconName: 'ShoppingBag',
    zone: 'Walled Pink City',
    description: 'Traditional perfumery and fabrics market',
    isCore: false,
  },
  {
    id: 'tripolia_bazaar',
    name: 'Tripolia Bazaar',
    x: 570,
    y: 295,
    category: 'shopping',
    iconName: 'ShoppingBag',
    zone: 'Walled Pink City',
    description: 'Traditional lac bangles and brassware market',
    isCore: false,
  },
  {
    id: 'museum_of_legacies',
    name: 'Museum of Legacies',
    x: 505,
    y: 315,
    category: 'museum',
    iconName: 'BookOpen',
    zone: 'Kishanpole Bazaar',
    description: 'Indigenous Rajasthani craft and cultural exhibits',
    isCore: false,
  },
  {
    id: 'central_park',
    name: 'Central Park',
    x: 450,
    y: 400,
    category: 'park',
    iconName: 'Trees',
    zone: 'Statue Circle',
    description: 'Vast urban park with jogging track & tall tricolor',
    isCore: false,
  },
  {
    id: 'ram_niwas',
    name: 'Ram Niwas Garden',
    x: 480,
    y: 415,
    category: 'park',
    iconName: 'Trees',
    zone: 'Central Jaipur',
    description: 'Historical garden surrounding Albert Hall Museum',
    isCore: false,
  },
  {
    id: 'raj_mandir',
    name: 'Raj Mandir Cinema',
    x: 440,
    y: 350,
    category: 'shopping',
    iconName: 'Film',
    zone: 'Panch Batti / MI Road',
    description: 'Famous Art Deco opulent movie palace',
    isCore: false,
  },
  {
    id: 'sindhi_camp',
    name: 'Sindhi Camp Bus Stand',
    x: 410,
    y: 340,
    category: 'transit',
    iconName: 'Bus',
    zone: 'Station Road',
    description: 'Central interstate bus terminal',
    isCore: false,
  },
  {
    id: 'jaigarh_fort',
    name: 'Jaigarh Fort',
    x: 700,
    y: 110,
    category: 'heritage',
    iconName: 'Shield',
    zone: 'Amer Hills',
    description: 'Victory fort housing the Jaivana cannon',
    isCore: false,
  },
  {
    id: 'wax_museum',
    name: 'Jaipur Wax Museum',
    x: 420,
    y: 130,
    category: 'museum',
    iconName: 'Sparkles',
    zone: 'Nahargarh Fort',
    description: 'Wax figures gallery & Sheesh Mahal at Nahargarh',
    isCore: false,
  },
  {
    id: 'panna_meena',
    name: 'Panna Meena ka Kund',
    x: 760,
    y: 80,
    category: 'heritage',
    iconName: 'Gem',
    zone: 'Amer Old Town',
    description: '16th-century geometric stepwell',
    isCore: false,
  },
  {
    id: 'anokhi_museum',
    name: 'Anokhi Museum of Printing',
    x: 780,
    y: 95,
    category: 'museum',
    iconName: 'Palette',
    zone: 'Amer Old Town',
    description: 'Woodblock textile printing museum in Chanwar Haveli',
    isCore: false,
  },
  {
    id: 'kanak_vrindavan',
    name: 'Kanak Vrindavan Garden',
    x: 670,
    y: 140,
    category: 'park',
    iconName: 'Trees',
    zone: 'Amer Valley',
    description: 'Lush terraced valley garden below Nahargarh',
    isCore: false,
  },
  {
    id: 'nahargarh_bio_park',
    name: 'Nahargarh Biological Park',
    x: 760,
    y: 40,
    category: 'park',
    iconName: 'Trees',
    zone: 'Delhi Highway',
    description: 'Zoo and safari park past Amer on Delhi Highway',
    isCore: false,
  },
  {
    id: 'gaitore',
    name: 'Gaitore Ki Chhatriyan',
    x: 530,
    y: 160,
    category: 'heritage',
    iconName: 'Landmark',
    zone: 'Foothills of Nahargarh',
    description: 'Royal cenotaphs and carved marble chhatris',
    isCore: false,
  },
  {
    id: 'garh_ganesh',
    name: 'Garh Ganesh Temple',
    x: 510,
    y: 140,
    category: 'temple',
    iconName: 'Church',
    zone: 'Nahargarh Foothills',
    description: 'Ancient fortress temple on hilltop',
    isCore: false,
  },
  {
    id: 'sisodia_rani',
    name: 'Sisodia Rani Garden',
    x: 740,
    y: 380,
    category: 'heritage',
    iconName: 'Trees',
    zone: 'Agra Road',
    description: 'Historic tiered garden palace with painted pavilions',
    isCore: false,
  },
  {
    id: 'galtaji_temple',
    name: 'Galtaji Temple',
    x: 730,
    y: 320,
    category: 'temple',
    iconName: 'Church',
    zone: 'Galta Gorge',
    description: 'Sacred pilgrimage site with natural springs',
    isCore: false,
  },
  {
    id: 'khole_ke_hanumanji',
    name: 'Khole Ke Hanuman Ji',
    x: 730,
    y: 220,
    category: 'temple',
    iconName: 'Church',
    zone: 'Delhi Bypass',
    description: 'Scenic temple valley on Delhi bypass',
    isCore: false,
  },
  {
    id: 'akshardham',
    name: 'Akshardham Temple',
    x: 300,
    y: 410,
    category: 'temple',
    iconName: 'Church',
    zone: 'Vaishali Nagar',
    description: 'Ornate carved stone temple complex',
    isCore: false,
  },
  {
    id: 'durgapura_station',
    name: 'Durgapura Station',
    x: 540,
    y: 520,
    category: 'transit',
    iconName: 'Train',
    zone: 'Tonk Road',
    description: 'Satellite railway station on Tonk Road',
    isCore: false,
  },
  {
    id: 'gandhinagar_station',
    name: 'Gandhinagar Station',
    x: 575,
    y: 460,
    category: 'transit',
    iconName: 'Train',
    zone: 'JLN Marg / Bajaj Nagar',
    description: 'Landmark railway station near University of Rajasthan',
    isCore: false,
  },
  {
    id: 'jawahar_circle',
    name: 'Jawahar Circle Park',
    x: 650,
    y: 520,
    category: 'park',
    iconName: 'Trees',
    zone: 'South Jaipur',
    description: 'Circular park with fountain surrounding Patrika Gate',
    isCore: false,
  },
  {
    id: 'smriti_van',
    name: 'Smriti Van',
    x: 645,
    y: 480,
    category: 'park',
    iconName: 'Trees',
    zone: 'JLN Marg',
    description: 'Biodiversity forest park',
    isCore: false,
  },
  {
    id: 'narayan_singh_circle',
    name: 'Narayan Singh Circle',
    x: 520,
    y: 440,
    category: 'transit',
    iconName: 'Compass',
    zone: 'JLN Marg North',
    description: 'Key transit circle on Tonk Road / JLN Marg',
    isCore: false,
  },
];

// Clean road network connecting the core backbone + secondary feeds
export const ALL_JAIPUR_EDGES: CityEdge[] = [
  // --- PRIMARY CORE BACKBONE (MINIMAL INTERSECTIONS) ---
  { id: 'e_muj_bhankrota', source: 'muj', target: 'bhankrota_jct', weight: 14, label: 'NH-48 Ajmer Expressway' },
  { id: 'e_bhankrota_jaipurjct', source: 'bhankrota_jct', target: 'jaipur_junction', weight: 10, label: '200 Ft / Civil Lines Link' },
  { id: 'e_jaipurjct_miroad', source: 'jaipur_junction', target: 'mi_road', weight: 3, label: 'Station Road' },
  { id: 'e_miroad_citypalace', source: 'mi_road', target: 'city_palace', weight: 3, label: 'Pink City Spine' },
  { id: 'e_citypalace_hawamahal', source: 'city_palace', target: 'hawa_mahal', weight: 2, label: 'Badi Chaupar' },
  { id: 'e_citypalace_zorawar', source: 'city_palace', target: 'zorawar_singh_gate', weight: 3, label: 'Amer Road Gateway' },
  { id: 'e_hawamahal_zorawar', source: 'hawa_mahal', target: 'zorawar_singh_gate', weight: 3, label: 'Subhash Chowk' },
  { id: 'e_zorawar_jalmahal', source: 'zorawar_singh_gate', target: 'jal_mahal', weight: 3, label: 'Lakefront Highway' },
  { id: 'e_jalmahal_amber', source: 'jal_mahal', target: 'amber_fort', weight: 4, label: 'Amer Highway' },
  { id: 'e_jalmahal_nahargarh', source: 'jal_mahal', target: 'nahargarh_fort', weight: 5, label: 'Nahargarh Ghat Road' },
  { id: 'e_nahargarh_amber', source: 'nahargarh_fort', target: 'amber_fort', weight: 4, label: 'Ridgeline Road' },

  // --- SOUTHERN ARTERY TO AIRPORT & PATRIKA GATE ---
  { id: 'e_miroad_alberthall', source: 'mi_road', target: 'albert_hall', weight: 3, label: 'Ram Niwas Approach' },
  { id: 'e_alberthall_jln', source: 'albert_hall', target: 'jln_marg', weight: 3, label: 'JLN Marg' },
  { id: 'e_jln_patrika', source: 'jln_marg', target: 'patrika_gate', weight: 4, label: 'Jawahar Circle Link' },
  { id: 'e_patrika_airport', source: 'patrika_gate', target: 'airport', weight: 3, label: 'Airport Road' },
  { id: 'e_bhankrota_patrika', source: 'bhankrota_jct', target: 'patrika_gate', weight: 16, label: 'South Ring Bypass' },
  { id: 'e_jaipurjct_alberthall', source: 'jaipur_junction', target: 'albert_hall', weight: 4, label: 'Prithviraj Road' },

  // --- SECONDARY FEEDS (CLEAN PROXIMITY HOOKS) ---
  { id: 'e_citypalace_jantarmantar', source: 'city_palace', target: 'jantar_mantar', weight: 1, label: 'Observatory Lane' },
  { id: 'e_citypalace_govinddev', source: 'city_palace', target: 'govind_dev_ji', weight: 1, label: 'Jaleb Chowk' },
  { id: 'e_citypalace_palacemuseum', source: 'city_palace', target: 'city_palace_museum', weight: 1, label: 'Mubarak Mahal' },
  { id: 'e_hawamahal_johari', source: 'hawa_mahal', target: 'johari_bazaar', weight: 1, label: 'Johari Bazaar' },
  { id: 'e_miroad_bapu', source: 'mi_road', target: 'bapu_bazaar', weight: 1, label: 'Bapu Bazaar' },
  { id: 'e_miroad_nehru', source: 'mi_road', target: 'nehru_bazaar', weight: 1, label: 'Nehru Bazaar' },
  { id: 'e_miroad_legacies', source: 'mi_road', target: 'museum_of_legacies', weight: 1, label: 'Kishanpole Bazaar' },
  { id: 'e_citypalace_tripolia', source: 'city_palace', target: 'tripolia_bazaar', weight: 1, label: 'Tripolia Bazaar' },
  { id: 'e_alberthall_birla', source: 'albert_hall', target: 'birla_mandir', weight: 2, label: 'Tilak Nagar Link' },
  { id: 'e_birla_motidungri', source: 'birla_mandir', target: 'moti_dungri', weight: 1, label: 'Moti Dungri Hill' },
  { id: 'e_jln_wtp', source: 'jln_marg', target: 'wtp', weight: 2, label: 'Malviya Nagar High Street' },
  { id: 'e_wtp_gt', source: 'wtp', target: 'gaurav_tower', weight: 1, label: 'GT Link' },
  { id: 'e_wtp_gtc', source: 'wtp', target: 'gt_central', weight: 1, label: 'GT Central Link' },
  { id: 'e_wtp_patrika', source: 'wtp', target: 'patrika_gate', weight: 2, label: 'Jawahar Circle North' },
  { id: 'e_miroad_centralpark', source: 'mi_road', target: 'central_park', weight: 2, label: 'Statue Circle' },
  { id: 'e_alberthall_ramniwas', source: 'albert_hall', target: 'ram_niwas', weight: 1, label: 'Ram Niwas Path' },
  { id: 'e_miroad_rajmandir', source: 'mi_road', target: 'raj_mandir', weight: 1, label: 'Panch Batti' },
  { id: 'e_jaipurjct_sindhicamp', source: 'jaipur_junction', target: 'sindhi_camp', weight: 2, label: 'Station Road' },
  { id: 'e_amber_jaigarh', source: 'amber_fort', target: 'jaigarh_fort', weight: 2, label: 'Fort Way' },
  { id: 'e_nahargarh_wax', source: 'nahargarh_fort', target: 'wax_museum', weight: 1, label: 'Fort Courtyard' },
  { id: 'e_amber_panna', source: 'amber_fort', target: 'panna_meena', weight: 1, label: 'Amer Stepwell Path' },
  { id: 'e_amber_anokhi', source: 'amber_fort', target: 'anokhi_museum', weight: 2, label: 'Chanwar Haveli' },
  { id: 'e_jalmahal_kanak', source: 'jal_mahal', target: 'kanak_vrindavan', weight: 2, label: 'Kanak Ghati' },
  { id: 'e_amber_bio', source: 'amber_fort', target: 'nahargarh_bio_park', weight: 4, label: 'Delhi Highway' },
  { id: 'e_zorawar_gaitore', source: 'zorawar_singh_gate', target: 'gaitore', weight: 2, label: 'Cenotaphs Way' },
  { id: 'e_gaitore_garhganesh', source: 'gaitore', target: 'garh_ganesh', weight: 2, label: 'Hill Steps' },
  { id: 'e_alberthall_sisodia', source: 'albert_hall', target: 'sisodia_rani', weight: 4, label: 'Ghat Ki Guni' },
  { id: 'e_hawamahal_galtaji', source: 'hawa_mahal', target: 'galtaji_temple', weight: 4, label: 'Galta Pass' },
  { id: 'e_jalmahal_khole', source: 'jal_mahal', target: 'khole_ke_hanumanji', weight: 3, label: 'Delhi Bypass' },
  { id: 'e_bhankrota_akshardham', source: 'bhankrota_jct', target: 'akshardham', weight: 4, label: 'Vaishali Bypass' },
  { id: 'e_akshardham_jaipurjct', source: 'akshardham', target: 'jaipur_junction', weight: 5, label: 'Queens Road' },
  { id: 'e_jln_gandhinagar', source: 'jln_marg', target: 'gandhinagar_station', weight: 2, label: 'Bajaj Nagar' },
  { id: 'e_jln_durgapura', source: 'jln_marg', target: 'durgapura_station', weight: 3, label: 'Tonk Road' },
  { id: 'e_patrika_jawaharcircle', source: 'patrika_gate', target: 'jawahar_circle', weight: 1, label: 'Circle Promenade' },
  { id: 'e_jln_smritivan', source: 'jln_marg', target: 'smriti_van', weight: 2, label: 'Forest Drive' },
  { id: 'e_alberthall_narayansingh', source: 'albert_hall', target: 'narayan_singh_circle', weight: 1, label: 'Museum Road' },
];

export const DEFAULT_CITY_NODES = ALL_JAIPUR_NODES;
export const DEFAULT_CITY_EDGES = ALL_JAIPUR_EDGES;

export interface RunCitySearchOptions {
  algorithm: AlgorithmType;
  nodes: CityNode[];
  edges: CityEdge[];
  startId: string;
  destinationId: string;
}

interface PQItem {
  nodeId: string;
  f: number;
  g: number;
  h: number;
  order: number;
}

export function generateCityGraphSnapshots(options: RunCitySearchOptions): {
  snapshots: CityGraphSnapshot[];
  result: CityGraphResult;
} {
  const { algorithm, nodes, edges, startId, destinationId } = options;
  const snapshots: CityGraphSnapshot[] = [];

  const nodeMap = new Map<string, CityNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(startId);
  const destNode = nodeMap.get(destinationId);

  if (!startNode || !destNode) {
    const emptyResult: CityGraphResult = {
      algorithm,
      found: false,
      pathNodeIds: [],
      pathEdgeIds: [],
      pathNames: [],
      totalCost: null,
      roadsTraveled: null,
      nodesExpanded: 0,
      cellsExplored: 0,
      status: 'failure',
    };
    return { snapshots: [], result: emptyResult };
  }

  // Build Adjacency List for Undirected Roads
  interface NeighborEdge {
    targetId: string;
    edgeId: string;
    weight: number;
    roadName?: string;
  }
  const adj = new Map<string, NeighborEdge[]>();
  nodes.forEach((n) => adj.set(n.id, []));

  edges.forEach((edge) => {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      adj.get(edge.source)!.push({
        targetId: edge.target,
        edgeId: edge.id,
        weight: edge.weight,
        roadName: edge.label,
      });
      adj.get(edge.target)!.push({
        targetId: edge.source,
        edgeId: edge.id,
        weight: edge.weight,
        roadName: edge.label,
      });
    }
  });

  const frontierSet = new Set<string>();
  const exploredSet = new Set<string>();
  const gScores: Record<string, number> = {};
  const hScores: Record<string, number> = {};
  const fScores: Record<string, number> = {};
  const parentMap: Record<string, string> = {};
  const parentEdgeMap: Record<string, string> = {};

  let nodesExpanded = 0;
  let orderCounter = 0;

  // Initialize start node
  const startH = algorithm === 'astar' ? calculateEuclideanHeuristic(startNode, destNode) : 0;
  gScores[startId] = 0;
  hScores[startId] = startH;
  fScores[startId] = startH;
  frontierSet.add(startId);

  const pq: PQItem[] = [
    {
      nodeId: startId,
      f: fScores[startId],
      g: 0,
      h: startH,
      order: orderCounter++,
    },
  ];

  const takeSnapshot = (
    event: CityGraphEvent,
    activeNodeId: string | null,
    inspectingNodeId: string | null,
    inspectingEdgeId: string | null,
    status: SearchStatus,
    currentPathNodes: string[] = [],
    currentPathEdges: string[] = [],
    pathCost: number | null = null,
    pathLength: number | null = null
  ) => {
    snapshots.push({
      stepIndex: snapshots.length,
      event,
      activeNodeId,
      inspectingNodeId,
      inspectingEdgeId,
      frontierNodeIds: Array.from(frontierSet),
      exploredNodeIds: Array.from(exploredSet),
      gScores: { ...gScores },
      hScores: { ...hScores },
      fScores: { ...fScores },
      parentMap: { ...parentMap },
      pathNodeIds: [...currentPathNodes],
      pathEdgeIds: [...currentPathEdges],
      status,
      nodesExpanded,
      cellsExplored: exploredSet.size,
      pathCost,
      pathLength,
    });
  };

  // Initial Step
  takeSnapshot(
    {
      stepNumber: 0,
      type: 'start',
      heading: 'Navigation Started',
      explanation:
        algorithm === 'astar'
          ? `A* begins at ${startNode.name} targeting ${destNode.name}. Accumulated distance g=0 km, straight-line heuristic h=${startH} km. Total priority f(n) = ${startH} km.`
          : `Dijkstra begins at ${startNode.name} targeting ${destNode.name}. Initial road distance g=0 km. Dijkstra expands nodes radially without heuristic.`,
      whatNext: `Extract the location with the lowest priority score from the frontier queue.`,
      currentNodeId: startId,
      g: 0,
      h: startH,
      f: startH,
    },
    startId,
    null,
    null,
    'running'
  );

  // Edge case: Start equals Destination
  if (startId === destinationId) {
    nodesExpanded = 1;
    exploredSet.add(startId);
    takeSnapshot(
      {
        stepNumber: snapshots.length,
        type: 'complete',
        heading: 'Start is the Destination',
        explanation: `Start and destination are identical (${startNode.name}). Travel distance is 0 km.`,
        whatNext: 'Search completed.',
        currentNodeId: startId,
        g: 0,
        h: 0,
        f: 0,
      },
      startId,
      null,
      null,
      'success',
      [startId],
      [],
      0,
      0
    );

    return {
      snapshots,
      result: {
        algorithm,
        found: true,
        pathNodeIds: [startId],
        pathEdgeIds: [],
        pathNames: [startNode.name],
        totalCost: 0,
        roadsTraveled: 0,
        nodesExpanded: 1,
        cellsExplored: 1,
        status: 'success',
      },
    };
  }

  let destinationReached = false;
  let finalPathNodeIds: string[] = [];
  let finalPathEdgeIds: string[] = [];

  // Main Priority Loop
  while (pq.length > 0) {
    pq.sort((a, b) => {
      if (algorithm === 'astar') {
        if (a.f !== b.f) return a.f - b.f;
        if (a.h !== b.h) return a.h - b.h;
        return a.order - b.order;
      } else {
        if (a.g !== b.g) return a.g - b.g;
        return a.order - b.order;
      }
    });

    const currentItem = pq.shift()!;
    const currentId = currentItem.nodeId;
    const currentNode = nodeMap.get(currentId)!;

    if (exploredSet.has(currentId)) {
      continue;
    }

    nodesExpanded++;
    frontierSet.delete(currentId);
    exploredSet.add(currentId);

    const currentG = gScores[currentId];
    const currentH = hScores[currentId] ?? 0;
    const currentF = fScores[currentId];

    takeSnapshot(
      {
        stepNumber: snapshots.length,
        type: 'select_node',
        heading:
          algorithm === 'astar'
            ? `A* selects ${currentNode.name}`
            : `Dijkstra selects ${currentNode.name}`,
        explanation:
          algorithm === 'astar'
            ? `A* selects ${currentNode.name} with lowest f(n) = ${currentF} km (traveled g = ${currentG} km + straight-line h = ${currentH} km).`
            : `Dijkstra selects ${currentNode.name} with lowest accumulated travel distance g = ${currentG} km.`,
        whatNext: `Inspect connecting road corridors from ${currentNode.name}.`,
        currentNodeId: currentId,
        g: currentG,
        h: currentH,
        f: currentF,
      },
      currentId,
      null,
      null,
      'running'
    );

    // Goal Check upon popping
    if (currentId === destinationId) {
      destinationReached = true;

      const reconstructedNodes: string[] = [];
      const reconstructedEdges: string[] = [];
      let traceId: string | undefined = destinationId;

      while (traceId) {
        reconstructedNodes.unshift(traceId);
        const parentId: string | undefined = parentMap[traceId];
        const edgeId: string | undefined = parentEdgeMap[traceId];
        if (edgeId) reconstructedEdges.unshift(edgeId);
        traceId = parentId;
      }

      finalPathNodeIds = reconstructedNodes;
      finalPathEdgeIds = reconstructedEdges;
      const totalCost = currentG;
      const roadCount = reconstructedEdges.length;

      takeSnapshot(
        {
          stepNumber: snapshots.length,
          type: 'destination_reached',
          heading: `Destination Reached: ${destNode.name}`,
          explanation: `Optimal route confirmed! Total travel distance: ${totalCost} km across ${roadCount} road corridors.`,
          whatNext: 'Backtracking shortest route for vehicle animation.',
          currentNodeId: destinationId,
          g: totalCost,
          h: 0,
          f: currentF,
        },
        destinationId,
        null,
        null,
        'running'
      );

      // Backtracking animation steps
      const animatedNodes: string[] = [];
      const animatedEdges: string[] = [];
      for (let i = 0; i < reconstructedNodes.length; i++) {
        animatedNodes.push(reconstructedNodes[i]);
        if (i > 0 && reconstructedEdges[i - 1]) {
          animatedEdges.push(reconstructedEdges[i - 1]);
        }
        const isLast = i === reconstructedNodes.length - 1;
        const nNode = nodeMap.get(reconstructedNodes[i])!;

        takeSnapshot(
          {
            stepNumber: snapshots.length,
            type: isLast ? 'complete' : 'reconstruct_step',
            heading: isLast ? 'Shortest Route Confirmed' : `Tracing: ${nNode.name}`,
            explanation: isLast
              ? `Optimal route: ${reconstructedNodes.map((id) => nodeMap.get(id)?.name).join(' → ')}. Total: ${totalCost} km.`
              : `Navigating via ${nNode.name} (${gScores[reconstructedNodes[i]]} km from start).`,
            whatNext: isLast ? 'Route calculation complete.' : 'Continuing route backtracking...',
            currentNodeId: reconstructedNodes[i],
            g: gScores[reconstructedNodes[i]],
            h: hScores[reconstructedNodes[i]],
            f: fScores[reconstructedNodes[i]],
          },
          reconstructedNodes[i],
          null,
          null,
          isLast ? 'success' : 'running',
          [...animatedNodes],
          [...animatedEdges],
          totalCost,
          roadCount
        );
      }

      break;
    }

    // Inspect connecting roads
    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      const neighborNode = nodeMap.get(neighbor.targetId)!;
      const roadLabel = neighbor.roadName || 'Road';

      if (exploredSet.has(neighbor.targetId)) {
        takeSnapshot(
          {
            stepNumber: snapshots.length,
            type: 'road_already_explored',
            heading: `Checking Road to ${neighborNode.name}`,
            explanation: `Connected via ${roadLabel} (${neighbor.weight} km), but ${neighborNode.name} is already explored with optimal distance ${gScores[neighbor.targetId]} km. Skipping.`,
            whatNext: `Checking other road connections from ${currentNode.name}...`,
            currentNodeId: currentId,
            neighborNodeId: neighbor.targetId,
            edgeId: neighbor.edgeId,
            g: gScores[neighbor.targetId],
          },
          currentId,
          neighbor.targetId,
          neighbor.edgeId,
          'running'
        );
        continue;
      }

      const tentativeG = currentG + neighbor.weight;
      const currentNeighborG = gScores[neighbor.targetId];
      const isCheaper = currentNeighborG === undefined || tentativeG < currentNeighborG;

      if (isCheaper) {
        const prevCost = currentNeighborG;
        const neighborH =
          algorithm === 'astar' ? calculateEuclideanHeuristic(neighborNode, destNode) : 0;
        const tentativeF = tentativeG + neighborH;

        gScores[neighbor.targetId] = tentativeG;
        hScores[neighbor.targetId] = neighborH;
        fScores[neighbor.targetId] = tentativeF;
        parentMap[neighbor.targetId] = currentId;
        parentEdgeMap[neighbor.targetId] = neighbor.edgeId;

        frontierSet.add(neighbor.targetId);

        pq.push({
          nodeId: neighbor.targetId,
          f: tentativeF,
          g: tentativeG,
          h: neighborH,
          order: orderCounter++,
        });

        takeSnapshot(
          {
            stepNumber: snapshots.length,
            type: 'update_route',
            heading:
              prevCost === undefined
                ? `Discovered ${neighborNode.name}`
                : `Cheaper Route to ${neighborNode.name}`,
            explanation:
              prevCost === undefined
                ? algorithm === 'astar'
                  ? `Reached ${neighborNode.name} via ${roadLabel} (+${neighbor.weight} km). Road cost g = ${tentativeG} km, heuristic h = ${neighborH} km, f = ${tentativeF} km. Added to frontier.`
                  : `Reached ${neighborNode.name} via ${roadLabel} (+${neighbor.weight} km). Distance g = ${tentativeG} km. Added to frontier.`
                : `Found a shorter connection to ${neighborNode.name}! New distance: ${tentativeG} km < previous ${prevCost} km. Route updated.`,
            whatNext: 'Evaluating remaining connecting roads or expanding next frontier location.',
            currentNodeId: currentId,
            neighborNodeId: neighbor.targetId,
            edgeId: neighbor.edgeId,
            g: tentativeG,
            h: neighborH,
            f: tentativeF,
            prevCost,
            newCost: tentativeG,
          },
          currentId,
          neighbor.targetId,
          neighbor.edgeId,
          'running'
        );
      }
    }
  }

  // If priority queue emptied without reaching destination
  if (!destinationReached) {
    takeSnapshot(
      {
        stepNumber: snapshots.length,
        type: 'no_route',
        heading: 'No Road Route Exists',
        explanation: `Frontier empty. All reachable city locations (${exploredSet.size}) explored, but ${destNode.name} cannot be reached from ${startNode.name}.`,
        whatNext: 'Search terminated without route.',
        currentNodeId: undefined,
      },
      null,
      null,
      null,
      'failure',
      [],
      [],
      null,
      null
    );

    return {
      snapshots,
      result: {
        algorithm,
        found: false,
        pathNodeIds: [],
        pathEdgeIds: [],
        pathNames: [],
        totalCost: null,
        roadsTraveled: null,
        nodesExpanded,
        cellsExplored: exploredSet.size,
        status: 'failure',
      },
    };
  }

  return {
    snapshots,
    result: {
      algorithm,
      found: true,
      pathNodeIds: finalPathNodeIds,
      pathEdgeIds: finalPathEdgeIds,
      pathNames: finalPathNodeIds.map((id) => nodeMap.get(id)?.name || id),
      totalCost: finalPathNodeIds.length > 0 ? gScores[destinationId] : 0,
      roadsTraveled: finalPathEdgeIds.length,
      nodesExpanded,
      cellsExplored: exploredSet.size,
      status: 'success',
    },
  };
}

/**
 * Helper to compute visible nodes and edges for the clean map display:
 * Shows core 14 locations by default, plus start & destination if outside core,
 * plus any landmark along the calculated route.
 */
export function getVisibleCityGraph(
  startId: string,
  destinationId: string,
  pathNodeIds: string[] = [],
  allNodes: CityNode[] = ALL_JAIPUR_NODES,
  allEdges: CityEdge[] = ALL_JAIPUR_EDGES
): { visibleNodes: CityNode[]; visibleEdges: CityEdge[] } {
  const visibleNodeIdSet = new Set<string>();

  // 1. Add all core nodes
  allNodes.forEach((n) => {
    if (n.isCore) visibleNodeIdSet.add(n.id);
  });

  // 2. Add start and destination nodes
  visibleNodeIdSet.add(startId);
  visibleNodeIdSet.add(destinationId);

  // 3. Add any intermediate path nodes
  pathNodeIds.forEach((id) => visibleNodeIdSet.add(id));

  const visibleNodes = allNodes.filter((n) => visibleNodeIdSet.has(n.id));

  // Only include edges whose endpoints are visible
  const visibleEdges = allEdges.filter(
    (e) => visibleNodeIdSet.has(e.source) && visibleNodeIdSet.has(e.target)
  );

  return { visibleNodes, visibleEdges };
}
