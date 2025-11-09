/**
 * Modulo de Esquema: Televisores (TVs)
 *
 * Define la ESTRUCTURA (grupos y atributos) para la gama "tvs".
 * Luego, se registra en la base de datos global.
 */

const TV_SCHEMA_GROUPS = [
    {
        "group": "PICTURE (DISPLAY)",
        "attrs": [
            { "code": "display_tipo_pantalla", "desc": "Tecnología principal del panel (ej: 4K UHD, 4K QNED MiniLED, 4K OLED)." },
            { "code": "display_resolucion_pantalla", "desc": "Resolución nativa de la pantalla (ej: 4K Ultra HD (3,840 x 2,160))." },
            { "code": "display_tipo_retroiluminacion", "desc": "Tecnología de iluminación trasera del panel (ej: Directa, Mini LED)." },
            { "code": "display_tasa_refresco", "desc": "Tasa de refresco nativa del panel (ej: 60Hz, 120Hz)." },
            { "code": "display_wide_color_gamut", "desc": "Tecnología de ampliación del espectro de color (ej: Nano Color, OLED Color)." }
        ]
    },
    {
        "group": "PROCESADO DE IMAGEN",
        "attrs": [
            { "code": "procesado_procesador_imagen", "desc": "Nombre del procesador de imagen principal (ej: Procesador 4K IA α7 Gen8)." },
            { "code": "procesado_escalado_ia", "desc": "Tipo de escalado de imagen basado en IA (ej: Super Escalado 4K)." },
            { "code": "procesado_dynamic_tone_mapping", "desc": "Tecnología de mapeo de tonos dinámico (ej: Si, Dynamic Tone Mapping Pro)." },
            { "code": "procesado_seleccion_genero_ia", "desc": "Selección automática de modo de imagen por IA (ej: Si (SDR/HDR))." },
            { "code": "procesado_control_brillo_ia", "desc": "Ajuste automático de brillo basado en IA y luz ambiental." },
            { "code": "procesado_hdr", "desc": "Formatos HDR soportados (ej: HDR10 / HLG, Dolby Vision)." },
            { "code": "procesado_filmmaker_mode", "desc": "Soporte para el modo \"Filmmaker Mode\"." },
            { "code": "procesado_tecnologia_atenuacion", "desc": "Tecnología de atenuación de la retroiluminación (ej: Pixel Dimming, Precision Dimming Pro)." },
            { "code": "procesado_motion", "desc": "Tecnología de mejora de movimiento (ej: OLED Motion, Motion Pro)." },
            { "code": "procesado_modos_imagen", "desc": "Número o lista de modos de imagen predefinidos." },
            { "code": "procesado_hfr", "desc": "Soporte para Alta Tasa de Fotogramas (High Frame Rate) y sus fuentes." },
            { "code": "procesado_ai_picture_pro", "desc": "Soporte para la tecnología \"AI Picture Pro\"." },
            { "code": "procesado_auto_calibrado", "desc": "Soporte para autocalibración de imagen." },
            { "code": "procesado_qft", "desc": "Soporte para Quick Frame Transport (QFT)." },
            { "code": "procesado_qms", "desc": "Soporte para Quick Media Switching (QMS)." }
        ]
    },
    {
        "group": "GAMING",
        "attrs": [
            { "code": "gaming_g_sync", "desc": "Compatibilidad con Nvidia G-Sync." },
            { "code": "gaming_free_sync", "desc": "Compatibilidad con AMD FreeSync." },
            { "code": "gaming_hgig_mode", "desc": "Soporte para el modo HGiG (HDR Gaming Interest Group)." },
            { "code": "gaming_game_optimizer", "desc": "Panel de control \"Game Optimizer\" (Game Dashboard)." },
            { "code": "gaming_allm", "desc": "Soporte para Modo Automático de Baja Latencia (ALLM)." },
            { "code": "gaming_vrr", "desc": "Soporte para Tasa de Refresco Variable (VRR) y su rango." },
            { "code": "gaming_dolby_vision_gaming", "desc": "Soporte para Dolby Vision para Gaming (ej: 4K 120Hz)." },
            { "code": "gaming_tiempo_refresco", "desc": "Tiempo de respuesta del panel (ej: Inferior a 0.1ms)." }
        ]
    },
    {
        "group": "AUDIO",
        "attrs": [
            { "code": "audio_dolby_atmos", "desc": "Soporte nativo para decodificación Dolby Atmos." },
            { "code": "audio_sonido_ia", "desc": "Tecnología de sonido mejorada por IA (ej: α7 AI Sound Pro (9.1.2 Virtual Up-Mix))." },
            { "code": "audio_dialogos_claros", "desc": "Función de realce de diálogos (ej: Si (Regulación Auto Volumen))." },
            { "code": "audio_wisa_ready", "desc": "Compatibilidad con la tecnología inalámbrica WiSA." },
            { "code": "audio_lg_sound_sync", "desc": "Compatibilidad con LG Sound Sync para barras de sonido LG." },
            { "code": "audio_sound_mode_share", "desc": "Función de compartir modo de sonido con barra de sonido (TV Sound Mode Share)." },
            { "code": "audio_salida_simultanea", "desc": "Capacidad de emitir sonido por los altavoces internos y externos a la vez." },
            { "code": "audio_bluetooth_surround", "desc": "Compatibilidad para usar altavoces Bluetooth como traseros." },
            { "code": "audio_salida_w", "desc": "Potencia total de salida de audio en vatios (W)." },
            { "code": "audio_calibracion_acustica_ia", "desc": "Calibración automática de sonido basada en la acústica de la sala." },
            { "code": "audio_codecs", "desc": "Lista de codecs de audio soportados (ej: AC4, AC3, PCM, apt-X)." },
            { "code": "audio_direccion_altavoces", "desc": "Orientación física de los altavoces (ej: Salida hacia Abajo)." },
            { "code": "audio_sistema_altavoces", "desc": "Configuración de canales de los altavoces (ej: 2.0 Canales, 4.2 Canales)." },
            { "code": "audio_wow_orchestra", "desc": "Compatibilidad con la tecnología WOW Orchestra." }
        ]
    },
    {
        "group": "SMART TV",
        "attrs": [
            { "code": "smart_sistema_operativo", "desc": "Sistema operativo y versión (ej: WebOS 25, webOS 24)." },
            { "code": "smart_apple_airplay", "desc": "Compatibilidad con Apple AirPlay 2." },
            { "code": "smart_camara_usb", "desc": "Compatibilidad con cámaras USB externas." },
            { "code": "smart_ai_chatbot", "desc": "Presencia de un Chatbot de IA integrado." },
            { "code": "smart_siempre_lista", "desc": "Función \"Siempre Lista\" (Always Ready)." },
            { "code": "smart_alexa", "desc": "Integración nativa con Amazon Alexa." },
            { "code": "smart_navegador_web", "desc": "Disponibilidad de un navegador web libre." },
            { "code": "smart_google_cast", "desc": "Compatibilidad nativa con Google Cast (Chromecast)." },
            { "code": "smart_google_home", "desc": "Integración con el ecosistema Google Home." },
            { "code": "smart_control_voz_sin_mando", "desc": "Capacidad de usar comandos de voz \"manos libres\" sin el mando." },
            { "code": "smart_home_hub", "desc": "Funcionalidad de panel de control del hogar (Home Hub)." },
            { "code": "smart_reconocimiento_voz", "desc": "Capacidad de reconocimiento de voz (usualmente vía mando)." },
            { "code": "smart_lg_channels", "desc": "Disponibilidad de la plataforma LG Channels." },
            { "code": "smart_magic_remote", "desc": "Indica si el mando Magic Remote está incluido o es compatible." },
            { "code": "smart_multipantalla", "desc": "Capacidad de mostrar múltiples fuentes o vistas en pantalla." },
            { "code": "smart_remote_app", "desc": "Compatibilidad con la app móvil (ej: LG ThinQ)." },
            { "code": "smart_id_voz", "desc": "Capacidad de reconocer diferentes perfiles de voz." },
            { "code": "smart_apple_home", "desc": "Integración con el ecosistema Apple Home." },
            { "code": "smart_ajustes_familia", "desc": "Disponibilidad de controles parentales y ajustes de familia." },
            { "code": "smart_thinq", "desc": "Integración con la plataforma LG ThinQ." }
        ]
    },
    {
        "group": "CONECTIVIDAD",
        "attrs": [
            { "code": "con_hdmi_earc_puerto", "desc": "Indica qué puerto HDMI soporta eARC (ej: eARC (HDMI 2))." },
            { "code": "con_bluetooth_version", "desc": "Versión de Bluetooth soportada (ej: v 5.0, v 5.1)." },
            { "code": "con_ethernet", "desc": "Número de puertos de entrada Ethernet (LAN)." },
            { "code": "con_hdmi_cec_simplink", "desc": "Soporte para HDMI CEC (Simplink)." },
            { "code": "con_optica", "desc": "Número de salidas de audio óptico digital (SPDIF)." },
            { "code": "con_ranura_ci", "desc": "Número de ranuras \"Common Interface\" (CI)." },
            { "code": "con_hdmi_num_puertos", "desc": "Número total de puertos HDMI y sus especificaciones (ej: 4ud (Soporta 4K 120Hz...))." },
            { "code": "con_rf_in", "desc": "Número de entradas de antena/cable (RF)." },
            { "code": "con_usb_num_puertos", "desc": "Número total de puertos USB y sus versiones." },
            { "code": "con_wifi_version", "desc": "Versión de Wi-Fi soportada (ej: Wi-Fi 5, Wi-Fi 6)." }
        ]
    },
    {
        "group": "ACCESIBILIDAD",
        "attrs": [
            { "code": "accesibilidad_alto_contraste", "desc": "Modo de visualización de Alto Contraste." },
            { "code": "accesibilidad_escala_grises", "desc": "Modo de visualización en Escala de Grises." },
            { "code": "accesibilidad_invertir_colores", "desc": "Modo de visualización de Invertir Colores." }
        ]
    },
    {
        "group": "DIMENSIONES Y PESOS",
        "attrs": [
            { "code": "dim_sin_peana_mm", "desc": "Dimensiones del TV sin peana (Ancho x Alto x Profundidad) en mm." },
            { "code": "dim_con_peana_mm", "desc": "Dimensiones del TV con la peana instalada (Ancho x Alto x Profundidad) en mm." },
            { "code": "dim_embalaje_mm", "desc": "Dimensiones de la caja del producto (Ancho x Alto x Profundidad) en mm." },
            { "code": "dim_peana_mm", "desc": "Dimensiones de la peana (Ancho x Profundidad) en mm." },
            { "code": "peso_sin_peana_kg", "desc": "Peso del TV sin la peana en kg." },
            { "code": "peso_con_peana_kg", "desc": "Peso del TV con la peana instalada en kg." },
            { "code": "peso_embalaje_kg", "desc": "Peso bruto del producto en su embalaje en kg." },
            { "code": "dim_vesa_mm", "desc": "Compatibilidad con montura VESA (Ancho x Alto) en mm." }
        ]
    },
    {
        "group": "ALIMENTACION",
        "attrs": [
            { "code": "power_voltaje", "desc": "Rango de voltaje de la fuente de alimentación (ej: AC 100~240V 50-60Hz)." },
            { "code": "power_standby_w", "desc": "Consumo de energía en modo de espera (Standby) en vatios (W)." }
        ]
    },
    {
        "group": "ACCESORIOS INCLUIDOS",
        "attrs": [
            { "code": "acc_mando_distancia", "desc": "Tipo de mando a distancia incluido (ej: Mando Estándar, Magic Remote)." },
            { "code": "acc_cable_alimentacion", "desc": "Tipo de cable de alimentación (ej: Desenchufable, Adjunto)." },
            { "code": "acc_pilas", "desc": "Indica si se incluyen pilas para el mando." }
        ]
    },
    {
        "group": "RADIODIFUSIÓN",
        "attrs": [
            { "code": "radio_recepcion_analogica", "desc": "Soporte para sintonizador de TV analógica." },
            { "code": "radio_recepcion_digital", "desc": "Estándares de sintonizador digital soportados (ej: DVB-T2/C/S2)." }
        ]
    },
    {
        "group": "OTROS DATOS",
        "attrs": [
            { "code": "info_ean", "desc": "Código de barras (EAN) del producto." }
        ]
    }
];

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este esquema
// con la clave "tvs".
if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('tvs', TV_SCHEMA_GROUPS);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}
