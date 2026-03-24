/**
 * Servicio de búsqueda de imágenes automáticas — Pexels.
 *
 * Regla de oro del diccionario: máximo 3 palabras en inglés por query.
 * Pexels intersecta todas las palabras; queries largas devuelven 0 resultados.
 * Queries cortas y concretas siempre ganan.
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE    = 'https://api.pexels.com/v1';

// ─────────────────────────────────────────────────────────────────────────────
// ANCLAS DE CATEGORÍA  (2-3 palabras, muy genéricas → siempre dan resultados)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_ANCHORS = {
    noticias:    'school news',
    eventos:     'school event',
    actividades: 'classroom children',
    logros:      'student award',
    anuncios:    'school announcement',
    general:     'school education',
};

// ─────────────────────────────────────────────────────────────────────────────
// DICCIONARIO SEMÁNTICO
// español normalizado → query Pexels en inglés (máx 3 palabras)
// ─────────────────────────────────────────────────────────────────────────────
const SEMANTIC = {

    // ── Deportes ──────────────────────────────────────────────────────────────
    futbol:          'soccer football',
    microfutbol:     'futsal indoor soccer',
    baloncesto:      'basketball court',
    basquetbol:      'basketball court',
    voleibol:        'volleyball sport',
    tenis:           'tennis racket',
    natacion:        'swimming pool',
    atletismo:       'athletics runners track',
    gimnasia:        'gymnastics sport',
    ciclismo:        'cycling bicycle',
    softball:        'softball baseball',
    beisbol:         'baseball sport',
    rugby:           'rugby team',
    porrismo:        'cheerleading performance',
    ajedrez:         'chess board',
    taekwondo:       'taekwondo martial arts',
    karate:          'karate children',
    judo:            'judo martial arts',
    esgrima:         'fencing sport',
    patinaje:        'skating children',
    deporte:         'sport school',
    deportes:        'sports school',
    deportivo:       'sport competition',
    campeonato:      'championship trophy',
    torneo:          'tournament sport',
    partido:         'sports match',
    olimpiada:       'school olympics',
    copa:            'trophy cup',
    medalla:         'medal award',
    cancha:          'sports field',
    entrenamiento:   'sports training',
    estadio:         'stadium crowd',
    arbitro:         'referee sport',
    competencia:     'sport competition',
    gol:             'soccer goal',
    equipo:          'sports team',

    // ── Materias académicas ───────────────────────────────────────────────────
    matematicas:     'mathematics classroom',
    matematica:      'math numbers',
    algebra:         'algebra equations',
    geometria:       'geometry shapes',
    calculo:         'calculus math',
    estadistica:     'statistics graphs',
    ciencias:        'science laboratory',
    fisica:          'physics experiment',
    quimica:         'chemistry laboratory',
    biologia:        'biology microscope',
    botanica:        'botany plants',
    zoologia:        'animals nature',
    anatomia:        'anatomy science',
    ecologia:        'ecology nature',
    historia:        'history museum',
    geografia:       'world map',
    sociales:        'social studies',
    ciudadania:      'civic community',
    etica:           'ethics school',
    ingles:          'english learning',
    frances:         'french language',
    aleman:          'german language',
    literatura:      'literature books',
    español:         'spanish language',
    linguistica:     'language books',
    filosofia:       'philosophy books',
    religion:        'religion school',
    tecnologia:      'technology computers',
    informatica:     'computer programming',
    robotica:        'robotics kids',
    programacion:    'coding computer',
    scratch:         'kids coding',
    electronica:     'electronics circuit',
    economia:        'economics finance',
    contabilidad:    'accounting finance',
    derecho:         'law books',
    psicologia:      'psychology education',
    pedagogia:       'teaching classroom',
    quinto:          'elementary school',
    cuarto:          'elementary students',
    tercero:         'school children',
    segundo:         'school children',
    primero:         'school children',
    preescolar:      'preschool children',
    bachillerato:    'high school students',
    primaria:        'elementary school',
    secundaria:      'middle school',

    // ── Arte y expresión ──────────────────────────────────────────────────────
    arte:            'art classroom',
    artes:           'arts crafts',
    musica:          'music instruments',
    canto:           'singing choir',
    teatro:          'theater stage',
    danza:           'dance performance',
    baile:           'dance school',
    pintura:         'painting art',
    dibujo:          'drawing sketch',
    escultura:       'sculpture clay',
    ceramica:        'ceramics pottery',
    tejido:          'knitting craft',
    fotografia:      'photography camera',
    origami:         'origami paper',
    manualidades:    'craft children',
    coro:            'choir singing',
    orquesta:        'orchestra music',
    banda:           'school band',
    actuacion:       'theater acting',
    creatividad:     'creative art',

    // ── Actividades escolares ─────────────────────────────────────────────────
    lectura:         'reading books',
    escritura:       'writing pen',
    leer:            'reading children',
    escribir:        'writing students',
    proyecto:        'school project',
    tarea:           'homework study',
    laboratorio:     'science lab',
    clase:           'classroom teacher',
    biblioteca:      'library books',
    cafeteria:       'school cafeteria',
    salon:           'classroom whiteboard',
    aula:            'classroom interior',
    auditorio:       'school auditorium',
    patio:           'school playground',
    recreo:          'school recess',
    campo:           'sports field',
    experimento:     'science experiment',
    exposicion:      'school exhibition',
    feria:           'school fair',
    presentacion:    'student presentation',
    debate:          'students debate',
    conferencia:     'school conference',
    taller:          'workshop learning',
    capacitacion:    'training workshop',
    seminario:       'seminar students',
    salida:          'school field trip',
    excursion:       'school trip',
    visita:          'school visit',
    paseo:           'school outdoor',
    estudio:         'study students',
    investigacion:   'research students',
    aprendizaje:     'learning children',
    educacion:       'education school',
    ensenanza:       'teaching classroom',

    // ── Agua, naturaleza y medio ambiente ─────────────────────────────────────
    agua:            'water nature',
    rio:             'river nature',
    lago:            'lake nature',
    lluvia:          'rain nature',
    mar:             'ocean sea',
    pez:             'fish water',
    peces:           'fish water',
    playa:           'beach nature',
    arbol:           'tree nature',
    arboles:         'trees forest',
    bosque:          'forest trees',
    naturaleza:      'nature outdoor',
    planta:          'plants green',
    plantas:         'plants nature',
    flor:            'flower nature',
    flores:          'flowers garden',
    jardin:          'garden plants',
    huerta:          'vegetable garden',
    siembra:         'planting garden',
    cosecha:         'harvest garden',
    semilla:         'seeds planting',
    tierra:          'soil earth',
    montaña:         'mountain nature',
    montana:         'mountain landscape',
    sol:             'sun outdoor',
    cielo:           'sky nature',
    animales:        'animals nature',
    animal:          'animal wildlife',
    pajaro:          'bird nature',
    mariposa:        'butterfly nature',
    prae:            'ecology school',
    medioambiente:   'environment nature',
    reciclaje:       'recycling eco',
    reciclado:       'recycling green',
    residuos:        'waste recycling',
    basura:          'trash recycling',
    compost:         'compost garden',
    compostaje:      'composting organic',
    sostenibilidad:  'sustainability green',
    verde:           'green nature',
    planeta:         'planet earth',
    contaminacion:   'pollution environment',
    energia:         'energy solar',
    solar:           'solar panels',
    aire:            'air sky',
    clima:           'climate nature',

    // ── Salud y bienestar ─────────────────────────────────────────────────────
    salud:           'health wellness',
    nutricion:       'healthy food',
    alimentos:       'food healthy',
    comida:          'food meal',
    fruta:           'fruit healthy',
    verdura:         'vegetables healthy',
    ejercicio:       'exercise fitness',
    vacuna:          'vaccination health',
    dentista:        'dental health',
    medico:          'doctor medical',
    higiene:         'hygiene cleanliness',
    bienestar:       'wellness school',
    derechos:        'children rights',
    convivencia:     'school community',
    bullying:        'respect school',
    inclusion:       'inclusion school',
    diversidad:      'diversity school',
    paz:             'peace community',
    valores:         'values school',

    // ── Celebraciones y fechas ────────────────────────────────────────────────
    graduacion:      'graduation ceremony',
    grado:           'graduation school',
    clausura:        'school graduation',
    izadabandera:    'flag ceremony',
    izada:           'flag school',
    bandera:         'flag patriotic',
    himno:           'anthem ceremony',
    actocivico:      'civic ceremony',
    navidad:         'christmas school',
    diciembre:       'christmas decoration',
    halloween:       'halloween children',
    carnaval:        'carnival costume',
    amor:            'friendship hearts',
    amistad:         'friendship children',
    festival:        'school festival',
    fiesta:          'party celebration',
    aniversario:     'anniversary celebration',
    independencia:   'independence flag',
    democracia:      'democracy voting',
    pazconvivencia:  'peace school',
    diaidioma:       'language day books',
    diamaestro:      'teachers day',
    diaestudiante:   'students school',
    diamadre:        'mothers day',
    diapadre:        'fathers day',
    diamujer:        'women empowerment',
    dianino:         'children playing',
    semanareceso:    'school vacation',
    inicioclases:    'back to school',
    findeano:        'school year end',
    septiembre:      'school september',
    octubre:         'autumn school',
    noviembre:       'autumn outdoor',
    enero:           'new year school',
    febrero:         'school winter',
    marzo:           'school spring',
    abril:           'school spring',
    mayo:            'school spring',
    junio:           'school summer',

    // ── Logros y reconocimientos ──────────────────────────────────────────────
    premio:          'award trophy',
    premios:         'awards ceremony',
    reconocimiento:  'recognition award',
    logro:           'achievement students',
    logros:          'achievements school',
    exito:           'success students',
    excelencia:      'academic excellence',
    honor:           'honor students',
    merito:          'merit award',
    beca:            'scholarship students',
    distincion:      'distinction award',
    olimpiadas:      'academic olympiad',
    simulacro:       'exam students',
    pruebasaber:     'test exam',
    icfes:           'exam students',
    evaluacion:      'evaluation students',
    calificacion:    'grades school',
    nota:            'report card',
    boletin:         'school report',

    // ── Personas ──────────────────────────────────────────────────────────────
    estudiante:      'student school',
    estudiantes:     'students classroom',
    alumno:          'student learning',
    alumnos:         'students school',
    docente:         'teacher classroom',
    docentes:        'teachers school',
    profesor:        'teacher whiteboard',
    profesora:       'teacher classroom',
    maestra:         'teacher children',
    director:        'school principal',
    rector:          'school principal',
    padres:          'parents school',
    familia:         'family school',
    acudiente:       'parents school',
    egresado:        'graduate alumni',
    personero:       'student council',
    gobiernoescolar: 'student government',
    comunidad:       'school community',
    nino:            'child school',
    ninos:           'children school',
    joven:           'youth student',
    jovenes:         'young students',

    // ── Administración e infraestructura ─────────────────────────────────────
    reunion:         'school meeting',
    jornada:         'school day',
    matricula:       'school enrollment',
    uniforme:        'school uniform',
    calendario:      'school calendar',
    horario:         'school schedule',
    inscripcion:     'school registration',
    admision:        'school admission',
    informe:         'school report',
    colegio:         'school building',
    escuela:         'school children',
    institucion:     'school institution',
    plantel:         'school campus',
    remodelacion:    'school renovation',
    obra:            'construction building',
    parque:          'school playground',
    instalaciones:   'school facilities',
    pileo:           'reading school',
    planlector:      'books reading',
    bilingue:        'bilingual school',
    bilingüismo:     'bilingual education',

    // ── Tecnología y medios ───────────────────────────────────────────────────
    computador:      'computer kids',
    computadora:     'computer classroom',
    tablet:          'tablet children',
    celular:         'phone school',
    internet:        'internet technology',
    red:             'network technology',
    virtual:         'virtual learning',
    digital:         'digital technology',
    video:           'video classroom',
    zoom:            'online learning',
    pantalla:        'screen technology',
};

// ─────────────────────────────────────────────────────────────────────────────
// ANCLAS POR TIPO DE ACTIVIDAD
// ─────────────────────────────────────────────────────────────────────────────
const ACTIVITY_TYPE_ANCHORS = {
    cuento:       'children storybook',
    colorear:     'coloring drawing children',
    numeros:      'math numbers children',
    rompecabezas: 'puzzle children',
    juego:        'children playing game',
    lectura:      'children reading book',
    manual:       'craft children art',
    otro:         'children learning school',
};

// ─────────────────────────────────────────────────────────────────────────────
// PALABRAS VACÍAS EN ESPAÑOL
// ─────────────────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'del', 'en', 'con', 'por', 'para', 'al', 'que',
    'se', 'su', 'sus', 'es', 'son', 'y', 'o', 'a', 'e',
    'como', 'mas', 'muy', 'no', 'si', 'ya', 'fue', 'ha',
    'este', 'esta', 'estos', 'estas', 'ese', 'esa',
    'nuestro', 'nuestra', 'nuestros', 'nuestras',
    'nuevo', 'nueva', 'gran', 'grandes', 'entre', 'sobre',
    'todo', 'todos', 'cada', 'dos', 'tres', 'ano', 'mes',
    'primer', 'primera', 'sera', 'ser', 'hay', 'han',
    'hace', 'hacer', 'tuvo', 'realizo', 'participo',
    'celebro', 'llevo', 'del', 'durante', 'ante',
]);

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES INTERNAS
// ─────────────────────────────────────────────────────────────────────────────

function normalize(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractSemanticTerms(text, maxHits = 3) {
    if (!text) return [];
    const words = normalize(text).split(' ');
    const hits  = [];
    const seen  = new Set();

    for (let i = 0; i < words.length && hits.length < maxHits; i++) {
        const word   = words[i];
        const bigram = i < words.length - 1 ? word + words[i + 1] : null;

        if (bigram && SEMANTIC[bigram] && !seen.has(bigram)) {
            seen.add(bigram);
            hits.push(SEMANTIC[bigram]);
        }
        if (SEMANTIC[word] && !seen.has(word)) {
            seen.add(word);
            hits.push(SEMANTIC[word]);
        }
    }
    return hits;
}

function extractRawKeywords(text, max = 2) {
    return normalize(text)
        .split(' ')
        .filter(w => w.length > 3 && !STOP_WORDS.has(w))
        .slice(0, max);
}

function buildQueryCandidates(category, title, excerpt = '') {
    const anchor   = CATEGORY_ANCHORS[category] || CATEGORY_ANCHORS.general;
    const fullText = `${title} ${excerpt}`;
    const semantic = extractSemanticTerms(fullText, 3);
    const raw      = extractRawKeywords(title, 2);

    const candidates = [];

    if (semantic.length >= 1) {
        // Combinación semántica + anchor
        candidates.push(`${anchor} ${semantic[0]}`);
        // Solo el hit semántico (sin anchor — query más simple, más resultados)
        candidates.push(semantic[0]);
    }
    if (semantic.length >= 2) {
        candidates.push(`${anchor} ${semantic[1]}`);
        candidates.push(semantic[1]);
    }
    if (semantic.length >= 3) {
        candidates.push(semantic[2]);
    }
    // Fallback con palabras crudas del título
    if (raw.length > 0) {
        candidates.push(`${anchor} ${raw.join(' ')}`);
        candidates.push(raw[0]); // una sola palabra cruda como último recurso
    }
    // Siempre terminar con el anchor solo
    candidates.push(anchor);

    return [...new Set(candidates)];
}

// ─────────────────────────────────────────────────────────────────────────────
// LLAMADA A PEXELS
// ─────────────────────────────────────────────────────────────────────────────
async function fetchPexels(query, count = 6, page = 1) {
    if (!PEXELS_API_KEY) return [];
    try {
        const url = `${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${count}&page=${page}&orientation=landscape&size=medium`;
        const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
        if (!response.ok) return [];
        const data = await response.json();
        return (data.photos || []).map(photo => ({
            url:          photo.src.large2x || photo.src.large,
            thumbnailUrl: photo.src.medium,
            alt:          photo.alt || query,
            photographer: photo.photographer,
            pexelsUrl:    photo.url,
        }));
    } catch {
        return [];
    }
}

async function tryCandidates(candidates, count = 6, page = 1) {
    for (const query of candidates) {
        const results = await fetchPexels(query, count, page);
        if (results.length > 0) return results;
    }
    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

export async function searchImages(query, count = 6) {
    if (!PEXELS_API_KEY) {
        console.warn('[ImageSearch] PEXELS_API_KEY no configurada.');
        return [];
    }
    return fetchPexels(query, count);
}

export async function suggestBlogImages(category, title, count = 6, page = 1) {
    const candidates = buildQueryCandidates(category, title, '');
    return tryCandidates(candidates, count, page);
}

export async function getAutoImage(category, title, excerpt = '') {
    const candidates = buildQueryCandidates(category, title, excerpt);
    const page   = Math.floor(Math.random() * 3) + 1;
    const images = await tryCandidates(candidates, 4, page);
    if (images.length === 0) return null;
    const picked = images[Math.floor(Math.random() * images.length)];
    return { url: picked.url, alt: title || category };
}

export async function getActivityImagePool(activityType, count = 5) {
    const anchor = ACTIVITY_TYPE_ANCHORS[activityType] || ACTIVITY_TYPE_ANCHORS.otro;
    const images = await fetchPexels(anchor, count);
    return images.map(img => img.url);
}

export async function getActivityTypeImage(activityType, itemTitle = '') {
    const anchor     = ACTIVITY_TYPE_ANCHORS[activityType] || ACTIVITY_TYPE_ANCHORS.otro;
    const candidates = [];
    if (itemTitle) {
        const semantic = extractSemanticTerms(itemTitle, 1);
        if (semantic.length > 0) candidates.push(`${anchor} ${semantic[0]}`);
    }
    candidates.push(anchor);
    const images = await tryCandidates(candidates, 4);
    if (images.length === 0) return null;
    return images[Math.floor(Math.random() * images.length)].url;
}
