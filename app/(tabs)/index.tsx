import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput, // Se añade TextInput para los campos del formulario de contacto
  Alert, // Se añade Alert para las notificaciones
} from 'react-native';

// IMPORTANTE: Se asume que la librería 'react-native-webview' ya está instalada.
import WebView from 'react-native-webview';

// Obtener el ancho de la pantalla para responsividad
const { width } = Dimensions.get('window');
const isMobile = width < 768;

// =========================================================================
// 1. CONFIGURACIÓN Y DATOS MOCKEADOS
// =========================================================================

// Colores de los temas
const COLORS = {
  // Genshin: Azul claro, verde, blanco
  genshin: {
    primary: '#4CAF50', // Verde
    secondary: '#81C784', // Verde claro
    background: '#E1F5FE', // Azul claro
    text: '#1B5E20', // Verde oscuro
    cardBg: '#FFFFFF',
    cardBorder: '#81C784',
  },
  // Honkai: Negro, azul oscuro, púrpura estelar
  honkai: {
    primary: '#7E57C2', // Púrpura
    secondary: '#5E35B1', // Púrpura oscuro
    background: '#121212', // Negro muy oscuro
    text: '#BBDEFB', // Azul claro (como estrellas)
    cardBg: '#212121',
    cardBorder: '#7E57C2',
  },
  // Zenless: Negro, fucsia, azul neón
  zenless: {
    primary: '#F50057', // Fucsia neón
    secondary: '#00BCD4', // Azul neón
    background: '#000000', // Negro
    text: '#F50057', // Fucsia neón
    cardBg: '#1A1A1A',
    cardBorder: '#F50057',
  },
  // Home/Contacto/Enka
  home: {
    primary: '#3F51B5',
    secondary: '#303F9F',
    background: '#FFFFFF',
    text: '#212121',
    cardBg: '#FAFAFA',
    cardBorder: '#E0E0E0',
  },
};

// Datos para las páginas de los juegos
const GAMES_DATA = {
  genshin: {
    title: "Genshin Impact",
    tagline: "Un Mundo de Fantasía, Aventura y Exploración Infinita.",
    trama: "En el vasto mundo de Teyvat, eres un viajero de otro mundo que llega a esta tierra en busca de tu gemelo perdido. Explora siete naciones, cada una con su propia cultura y Arconte, mientras desentrañas los misterios del mundo y la verdad de la caída de Khaenri'ah.",
    trailerText: "Tráiler disponible aquí (requiere librería de video nativa)",
    theme: 'genshin',
  },
  honkai: {
    title: "Honkai: Star Rail",
    tagline: "Embárcate en un Viaje Estelar a Través de Galaxias Desconocidas.",
    trama: "Como un 'Trazacaminos' (Trailblazer) con un Estelaron (Stellaron) incrustado en tu cuerpo, viajas a bordo del Expreso Astral a través del universo. Lidera a un equipo de compañeros extravagantes y valientes para resolver la crisis del Estelaron y desafiar los designios de los Eones.",
    trailerText: "Tráiler disponible aquí (requiere librería de video nativa)",
    theme: 'honkai',
  },
  zenless: {
    title: "Zenless Zone Zero",
    tagline: "El Neon Cyberpunk se Encuentra con la Acción Extrema de Roguelite.",
    trama: "El mundo ha sido devastado por fenómenos sobrenaturales llamados 'Hollows'. En la última metrópolis, Nueva Eridu, operas como un 'Proxy', guiando a la gente a través de las dimensiones del Hollow. Lucha contra monstruos y descubre los secretos que se esconden tras esta calamidad urbana.",
    trailerText: "Tráiler disponible aquí (requiere librería de video nativa)",
    theme: 'zenless',
  },
};

// Datos de personajes
const CHARACTERS_DATA = {
  genshin: [
    {
      name: "Nahida",
      imgUrl: "https://placehold.co/150x200/50C878/FFFFFF?text=Nahida",
      build: { arma: "Sueños Flotantes", reliquias: "Recuerdos del Bosque", stats: "Maestría Elemental" },
      equipo: ["Nilou", "Kuki Shinobu", "Viajero (Dendro)"],
    },
    {
      name: "Venti",
      imgUrl: "https://static.wikia.nocookie.net/gen-impact/images/4/4c/Venti_Card.png/revision/latest/scale-to-width-down/1000?cb=20210303043437&path-prefix=es",
      build: { arma: "Elegía del Fin", reliquias: "Sombra Verde Esmeralda", stats: "Recarga de Energía" },
      equipo: ["Ganyu", "Mona", "Bennett"],
    },
  ],
  honkai: [
    {
      name: "Kafka",
      imgUrl: "https://placehold.co/150x200/9370DB/FFFFFF?text=Kafka",
      build: { conoLuz: "Paciencia es lo Único", reliquias: "Prisionero en Grillete", ornamentos: "Estación Sellaespacios" },
      equipo: ["Black Swan", "Ruan Mei", "Luocha"],
    },
    {
      name: "Bronya",
      imgUrl: "https://placehold.co/150x200/4169E1/FFFFFF?text=Bronya",
      build: { conoLuz: "Por la Noche Sin Fin", reliquias: "Mensajera del Espacio", ornamentos: "Fuerzas de Combate" },
      equipo: ["Seele", "Sparkle", "Gepard"],
    },
  ],
  zenless: [
    {
      name: "Nekomata",
      imgUrl: "https://placehold.co/150x200/FF00FF/000000?text=Nekomata",
      build: { arma: "Cat's Paw (Tono)", buildSet: "Carga de Ciclón", cadenas: "Daño CRIT" },
      equipo: ["Billy Kid", "Agent 11"],
    },
    {
      name: "Billy Kid",
      imgUrl: "https://placehold.co/150x200/40E0D0/000000?text=Billy+Kid",
      build: { arma: "Revolver Rápido (Tono)", buildSet: "Estrella de la Mañana", cadenas: "Ataque/Tasa CRIT" },
      equipo: ["Nekomata", "Nicole"],
    },
  ],
};

// =========================================================================
// 2. COMPONENTES REUTILIZABLES
// =========================================================================

// Componente Header (MODIFICADO para mostrar el usuario)
const Header = ({ setCurrentPage, currentTheme, user }) => {
  const theme = COLORS[currentTheme];
  // 1. Definir el texto del logo/saludo
  // MODIFICACIÓN: Ya que se elimina el login, el saludo es estático.
  const userGreeting = 'HoYo-Fanverse';

  const navItems = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'genshin', label: 'Genshin', icon: '🍃' },
    { id: 'honkai', label: 'Honkai', icon: '🌌' },
    { id: 'zenless', label: 'Zenless', icon: '⚡' },
    { id: 'enka', label: 'Enka Network', icon: '🔗' },
    // 2. Usar 'Contacto' de forma estática
    { id: 'contacto', label: 'Contacto', icon: '📧' }, 
  ];

  return (
    <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
      {/* 3. Usar el saludo estático */}
      <Text style={[styles.logo, { color: theme.primary }]}>{userGreeting}</Text>
      <ScrollView horizontal={true} contentContainerStyle={styles.navContainer} showsHorizontalScrollIndicator={false}>
        {navItems.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setCurrentPage(item.id)}
            style={[styles.navButton, { backgroundColor: currentTheme === item.id ? theme.primary : 'transparent' }]}
          >
            <Text style={[styles.navButtonText, { color: currentTheme === item.id ? COLORS.home.background : theme.text }]}>
              {item.icon} {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Componente Footer
const Footer = ({ currentTheme }) => {
  const theme = COLORS[currentTheme];
  return (
    <View style={[styles.footer, { backgroundColor: theme.cardBg, borderTopColor: theme.cardBorder }]}>
      <Text style={[styles.footerText, { color: theme.text }]}>
        Fanpage creada por Kuzunoha | © Derechos de HoYoverse
      </Text>
    </View>
  );
};

// Componente de Tarjeta de Personaje
const CharacterCard = ({ character, theme }) => (
  <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
    {/* Imagen Placeholder (se usaría <Image> de react-native en un proyecto real) */}
    <View style={[styles.charImagePlaceholder, { borderColor: theme.primary }]}>
      <Text style={styles.charImageText}>{character.name.charAt(0)}</Text>
    </View>
    <Text style={[styles.charName, { color: theme.primary, fontFamily: theme === COLORS.zenless ? 'monospace' : 'System' }]}>{character.name}</Text>

    {/* Sección Build */}
    <View style={styles.buildSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>⚔️ BUILD RECOMENDADA</Text>
      {Object.entries(character.build).map(([key, value]) => (
        <Text key={key} style={[styles.buildText, { color: theme.text }]}>
          <Text style={{ fontWeight: 'bold', color: theme.primary }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text> {value}
        </Text>
      ))}
    </View>

    {/* Sección Equipos */}
    <View style={styles.buildSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>👥 MEJORES EQUIPOS</Text>
      <Text style={[styles.buildText, { color: theme.text }]}>{character.equipo.join(' | ')}</Text>
    </View>
  </View>
);

// =========================================================================
// 3. PÁGINAS DE CONTENIDO ESPECÍFICO
// =========================================================================

// Página de Personajes de Juego
const CharacterPage = ({ gameId, setCurrentPage }) => {
  const game = GAMES_DATA[gameId];
  const characters = CHARACTERS_DATA[gameId];
  const theme = COLORS[game.theme];
  const isZenless = gameId === 'zenless';

  return (
    <ScrollView style={[styles.pageContainer, { backgroundColor: theme.background }]}>
      <View style={styles.contentPadding}>
        <Text style={[styles.pageTitle, { color: theme.text, fontFamily: isZenless ? 'monospace' : 'System' }]}>
          Personajes de {game.title}
        </Text>
        <Text style={[styles.pageSubtitle, { color: theme.text }]}>
          Explora los héroes, sus mejores *builds* y sus composiciones de equipo ideales.
        </Text>

        {/* Botón de regreso */}
        <TouchableOpacity
          onPress={() => setCurrentPage(gameId)}
          style={[styles.backButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.buttonText}>← Volver a la página de {game.title}</Text>
        </TouchableOpacity>

        {/* Grid de Personajes */}
        <View style={styles.charGrid}>
          {characters.map((char, index) => (
            <CharacterCard key={index} character={char} theme={theme} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};


// Página principal del Juego
const GamePage = ({ gameId, setCurrentPage }) => {
  const game = GAMES_DATA[gameId];
  const theme = COLORS[game.theme];

  const handleDownload = (platform) => {
    // En React Native, usamos Linking para abrir URLs externas
    alert(`Descargando ${game.title} para ${platform}.`);
  };

  return (
    <ScrollView style={[styles.pageContainer, { backgroundColor: theme.background }]}>
      <View style={styles.contentPadding}>
        {/* 1. Sección Hero */}
        <View style={[styles.heroSection, { backgroundColor: theme.primary }]}>
          <Text style={[styles.heroTitle, { color: COLORS.home.background }]}>{game.title}</Text>
          <Text style={[styles.heroTagline, { color: COLORS.home.background }]}>{game.tagline}</Text>
          <TouchableOpacity
            onPress={() => setCurrentPage(`${gameId}_personajes`)}
            style={styles.heroButton}
          >
            <Text style={[styles.buttonText, { color: theme.primary }]}>⚡ Explorar Personajes</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Sección Historia */}
        <View style={[styles.sectionCard, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionHeader, { color: theme.primary }]}>🍃 Trama y Lore</Text>
          <Text style={[styles.sectionText, { color: theme.text }]}>{game.trama}</Text>
        </View>

        {/* 3. Sección Personajes (Link) */}
        <View style={[styles.sectionCard, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={[styles.sectionHeader, { color: theme.primary }]}>👥 El Elenco de Héroes</Text>
            <Text style={[styles.sectionText, { color: theme.text, maxWidth: width * 0.6 }]}>Conoce sus habilidades, *builds* y mejores equipos.</Text>
          </View>
          <TouchableOpacity
            onPress={() => setCurrentPage(`${gameId}_personajes`)}
            style={[styles.ctaButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.buttonText}>Ver Personajes</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Sección Gameplay (Video Placeholder) */}
        <View style={[styles.sectionCard, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionHeader, { color: theme.primary }]}>🌌 Gameplay y Tráiler</Text>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>{game.trailerText}</Text>
          </View>
        </View>

        {/* 5. Sección Descarga */}
        <View style={[styles.sectionCard, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionHeader, { color: theme.primary }]}>⬇️ ¡Juega Ahora!</Text>
          <View style={styles.downloadButtons}>
            {['PC', 'Android', 'iOS'].map(platform => (
              <TouchableOpacity
                key={platform}
                onPress={() => handleDownload(platform)}
                style={[styles.downloadButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.buttonText}>{platform}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <Footer currentTheme={game.theme} />
    </ScrollView>
  );
};


// Página de Bienvenida (Landing Page)
const HomePage = ({ setCurrentPage }) => {
  const theme = COLORS.home;

  return (
    <View style={[styles.pageContainer, styles.homeContainer, { backgroundColor: theme.background }]}>
      <View style={styles.contentPadding}>
        <Text style={[styles.homeTitle, { color: theme.text }]}>
          Bienvenidos a la Fanpage HoYo-Verse
        </Text>
        <Text style={[styles.pageSubtitle, { color: theme.text }]}>
          Explora los vastos mundos de Teyvat, el Expreso Astral y Nueva Eridu. Tu aventura comienza aquí.
        </Text>

        <View style={styles.gameButtonGrid}>
          {Object.keys(GAMES_DATA).map(gameId => {
            const gameTheme = COLORS[gameId];
            return (
              <TouchableOpacity
                key={gameId}
                onPress={() => setCurrentPage(gameId)}
                style={[styles.gameButton, { backgroundColor: gameTheme.primary }]}
              >
                <Text style={styles.gameButtonIcon}>{GAMES_DATA[gameId].title.charAt(0)}</Text>
                <Text style={styles.gameButtonText}>{GAMES_DATA[gameId].title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.homeFooterText}>
          Haz clic en cualquier juego para empezar tu exploración.
        </Text>
      </View>
    </View>
  );
};

// Página de Enka Network
const EnkaNetworkPage = ({ setCurrentPage }) => {
  const theme = COLORS.home;
  const enkaUrl = "https://enka.network/";

  return (
    <View style={[styles.pageContainer, { backgroundColor: theme.background }]}>
      {/* Título de la sección */}
      <Text style={[styles.pageTitle, { color: theme.primary, marginVertical: 10 }]}>
        Enka Network 🔗
      </Text>
      
      {/* Contenedor del WebView (ahora REAL) */}
      <WebView
        // La fuente de la URL que queremos mostrar
        source={{ uri: enkaUrl }}
        // El estilo es crucial para que ocupe todo el espacio disponible
        style={styles.webViewContainer} 
        
        // Opciones comunes para el WebView:
        startInLoadingState={true} // Muestra un indicador de carga
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {/* Botón de regreso */}
      <TouchableOpacity
        onPress={() => setCurrentPage('home')}
        style={[styles.backButton, { backgroundColor: theme.secondary, marginVertical: 10, alignSelf: 'center' }]}
      >
        <Text style={[styles.buttonText, { color: COLORS.home.background }]}>← Volver a Inicio</Text>
      </TouchableOpacity>
    </View>
  );
};


// Página de Contacto (MODIFICADA para ser solo un formulario de contacto)
const ContactPage = ({ setCurrentPage }) => {
  const theme = COLORS.home;
  const CONTACT_EMAIL = 'lgalllegossierra1@gmail.com'; // El correo proporcionado

  
  return (
    <ScrollView style={[styles.pageContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.contactCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.pageTitle, { color: theme.primary }]}>📧 Contacto Fanpage</Text>
        <Text style={[styles.pageSubtitle, { color: theme.text, marginBottom: 20 }]}>
          Envía tus preguntas, sugerencias o reportes a través de este formulario.
        </Text>
        
        {/* Información de Contacto Estática */}
        <View style={styles.contactInfoGroup}>
          <Text style={[styles.formLabel, { color: theme.text }]}>Correo Directo:</Text>
          <Text style={[styles.contactEmail, { color: theme.text, fontWeight: 'bold' }]}>{CONTACT_EMAIL}</Text>
          <Text style={[styles.pageSubtitle, { color: theme.text, fontSize: 14, marginTop: 5 }]}>
            Puedes escribir directamente a esta dirección.
          </Text>
        </View>
  
      </View>
    </ScrollView>
  );
};


// =========================================================================
// 4. COMPONENTE PRINCIPAL DE LA APLICACIÓN (APP) (MODIFICADO)
// =========================================================================

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  // Se elimina el estado 'user'

  const currentTheme = useMemo(() => {
    if (currentPage.includes('genshin')) return 'genshin';
    if (currentPage.includes('honkai')) return 'honkai';
    if (currentPage.includes('zenless')) return 'zenless';
    if (currentPage === 'contacto' || currentPage === 'enka') return 'home';
    return 'home';
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'genshin':
      case 'honkai':
      case 'zenless':
        return <GamePage gameId={currentPage} setCurrentPage={setCurrentPage} />;
      case 'genshin_personajes':
      case 'honkai_personajes':
      case 'zenless_personajes':
        const gameId = currentPage.split('_')[0];
        return <CharacterPage gameId={gameId} setCurrentPage={setCurrentPage} />;
      case 'enka':
        return <EnkaNetworkPage setCurrentPage={setCurrentPage} />;
      case 'contacto':
        // EL COMPONENTE YA NO RECIBE PROPS DE AUTENTICACIÓN
        return <ContactPage 
            setCurrentPage={setCurrentPage} 
        />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* SE PASA 'user=null' O SE ELIMINA LA PROP YA QUE NO SE USA */}
      <Header 
          setCurrentPage={setCurrentPage} 
          currentTheme={currentTheme} 
          // user={user} // Ya no se necesita, pero se mantiene si el Header lo espera
      />
      <View style={styles.mainContent}>
        {renderPage()}
      </View>
      <Footer currentTheme={currentTheme} />
    </SafeAreaView>
  );
};

export default App;

// =========================================================================
// 5. ESTILOS NATIVOS (StyleSheet)
// =========================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.home.background,
  },
  mainContent: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
    paddingBottom: 40,
  },

  // --- Header Styles ---
  header: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  navButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    // Nota: 'transition' no es nativo en React Native, pero se mantiene para claridad
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // --- Footer Styles ---
  footer: {
    padding: 15,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },

  // --- Home Page Styles ---
  homeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeTitle: {
    fontSize: isMobile ? 32 : 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  homeFooterText: {
    textAlign: 'center',
    marginTop: 30,
    color: COLORS.home.text,
    fontSize: 14,
  },
  gameButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
    gap: 15,
  },
  gameButton: {
    width: isMobile ? '45%' : 150,
    height: 150,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gameButtonIcon: {
    fontSize: 40,
    color: 'white',
    marginBottom: 5,
  },
  gameButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

  // --- General Page Styles ---
  pageTitle: {
    fontSize: isMobile ? 32 : 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  pageSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  // --- Game Page Styles ---
  heroSection: {
    padding: isMobile ? 30 : 50,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: isMobile ? 36 : 56,
    fontWeight: '900',
    textAlign: 'center',
  },
  heroTagline: {
    fontSize: isMobile ? 18 : 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: COLORS.home.background,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: '#333',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: 'white',
    fontStyle: 'italic',
  },
  downloadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    gap: 10,
  },
  downloadButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },

  // --- Characters Page Styles ---
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  charGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 15,
  },
  card: {
    width: isMobile ? '100%' : '48%', // 2 cards per row on wider screens
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 5,
  },
  charImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DDD',
  },
  charImageText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  charName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buildSection: {
    width: '100%',
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  buildText: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },

  // --- Contact Page Styles ---
  contactCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    elevation: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    fontSize: 16,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top', // Para que el texto empiece arriba en Android
    paddingTop: 10,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  contactInfoGroup: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
  },
  contactEmail: {
    fontSize: 18,
    color: COLORS.home.primary,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.home.cardBorder,
    marginVertical: 15,
  },
  // --- Enka Network Page Styles ---
  webViewContainer: {
    // Estilos que deberían aplicarse al WebView
    flex: 1, // Es crucial para que ocupe espacio
    minHeight: 400, 
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden', // Para contener el webview
  },
  enkaButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  }
});