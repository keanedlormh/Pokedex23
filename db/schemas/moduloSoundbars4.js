/**
 * Modulo de Esquema: soundbars
 */

const SOUNDBARS_SCHEMA_GROUPS = [
    {
        "group": "GENERAL",
        "attrs": [
            {
                "code": "general_num_canales",
                "desc": "Número de canales de audio del sistema."
            },
            {
                "code": "general_potencia_salida_w",
                "desc": "Potencia total de salida de audio del sistema (W)."
            },
            {
                "code": "general_num_altavoces",
                "desc": "Número total de altavoces físicos (drivers) en el sistema."
            },
            {
                "code": "payaso",
                "desc": "Número de runas cuánticas"
            }
        ]
    },
    {
        "group": "DIMENSIONES Y PESO",
        "attrs": [
            {
                "code": "dim_principal_mm",
                "desc": "Dimensiones unidad principal (An x Al x Pr) en mm."
            },
            {
                "code": "dim_subwoofer_mm",
                "desc": "Dimensiones subwoofer (An x Al x Pr) en mm."
            },
            {
                "code": "dim_traseros_mm",
                "desc": "Dimensiones altavoces traseros (An x Al x Pr) en mm."
            },
            {
                "code": "dim_caja_mm",
                "desc": "Dimensiones del embalaje (caja) (An x Al x Pr) en mm."
            },
            {
                "code": "peso_principal_kg",
                "desc": "Peso unidad principal (kg)."
            },
            {
                "code": "peso_subwoofer_kg",
                "desc": "Peso subwoofer (kg)."
            },
            {
                "code": "peso_traseros_kg",
                "desc": "Peso altavoces traseros (kg)."
            },
            {
                "code": "peso_bruto_kg",
                "desc": "Peso bruto total (con embalaje) (kg)."
            }
        ]
    },
    {
        "group": "POTENCIA (Consumo Eléctrico)",
        "attrs": [
            {
                "code": "potencia_consumo_stb_principal_w",
                "desc": "Consumo Standby (STB) unidad principal (W)."
            },
            {
                "code": "potencia_consumo_principal_w",
                "desc": "Consumo en funcionamiento unidad principal (W)."
            },
            {
                "code": "potencia_consumo_stb_subwoofer_w",
                "desc": "Consumo Standby (STB) subwoofer (W)."
            },
            {
                "code": "potencia_consumo_subwoofer_w",
                "desc": "Consumo en funcionamiento subwoofer (W)."
            },
            {
                "code": "potencia_consumo_stb_traseros_w",
                "desc": "Consumo Standby (STB) altavoces traseros (W)."
            },
            {
                "code": "potencia_consumo_traseros_w",
                "desc": "Consumo en funcionamiento altavoces traseros (W)."
            }
        ]
    },
    {
        "group": "CONECTIVIDAD (Puertos Físicos)",
        "attrs": [
            {
                "code": "con_hdmi_in",
                "desc": "Número de puertos de entrada HDMI."
            },
            {
                "code": "con_hdmi_out",
                "desc": "Número de puertos de salida HDMI (al TV)."
            },
            {
                "code": "con_usb",
                "desc": "Número de puertos USB."
            },
            {
                "code": "con_optica",
                "desc": "Número de puertos de entrada de audio óptico."
            }
        ]
    },
    {
        "group": "CONECTIVIDAD (Inalámbrica y Red)",
        "attrs": [
            {
                "code": "con_bluetooth_version",
                "desc": "Versión de Bluetooth."
            },
            {
                "code": "con_bluetooth_codec",
                "desc": "Codecs de audio Bluetooth soportados."
            },
            {
                "code": "con_wifi",
                "desc": "Conectividad Wi-Fi integrada."
            },
            {
                "code": "con_preparado_traseros",
                "desc": "Preparado para altavoces traseros (kit opcional)."
            },
            {
                "code": "con_chromecast",
                "desc": "Google Chromecast integrado."
            },
            {
                "code": "con_airplay2",
                "desc": "Apple AirPlay 2."
            },
            {
                "code": "con_spotify_connect",
                "desc": "Spotify Connect."
            },
            {
                "code": "con_tidal_connect",
                "desc": "Tidal Connect."
            },
            {
                "code": "con_google_home",
                "desc": "Integración con Google Home."
            },
            {
                "code": "con_alexa",
                "desc": "Integración con Amazon Alexa."
            }
        ]
    },
    {
        "group": "SOPORTE HDMI (Funciones)",
        "attrs": [
            {
                "code": "hdmi_arc",
                "desc": "Soporte para ARC (Audio Return Channel)."
            },
            {
                "code": "hdmi_earc",
                "desc": "Soporte para eARC (Enhanced ARC)."
            },
            {
                "code": "hdmi_cec_simplink",
                "desc": "Soporte para CEC (Simplink)."
            },
            {
                "code": "hdmi_passthrough",
                "desc": "Capacidad de Pass-through de video."
            },
            {
                "code": "hdmi_passthrough_4k",
                "desc": "Soporte para Pass-through de 4K."
            },
            {
                "code": "hdmi_vrr_allm",
                "desc": "Soporte para VRR / ALLM (Gaming)."
            },
            {
                "code": "hdmi_120hz",
                "desc": "Soporte para Pass-through de 120Hz."
            },
            {
                "code": "hdmi_hdr10",
                "desc": "Soporte para Pass-through de HDR10."
            },
            {
                "code": "hdmi_dolby_vision",
                "desc": "Soporte para Pass-through de Dolby Vision."
            },
            {
                "code": "hdmi_version",
                "desc": "Versión del estándar HDMI."
            }
        ]
    },
    {
        "group": "FORMATOS DE AUDIO (Decodificadores)",
        "attrs": [
            {
                "code": "audio_dolby_atmos",
                "desc": "Decodificador Dolby Atmos."
            },
            {
                "code": "audio_dolby_digital",
                "desc": "Decodificador Dolby Digital."
            },
            {
                "code": "audio_dtsx",
                "desc": "Decodificador DTS:X."
            },
            {
                "code": "audio_dts_digital_surround",
                "desc": "Decodificador DTS Digital Surround."
            },
            {
                "code": "audio_aac",
                "desc": "Decodificador AAC."
            },
            {
                "code": "audio_aac_plus",
                "desc": "Decodificador AAC+."
            },
            {
                "code": "audio_lpcm",
                "desc": "Decodificador LPCM."
            },
            {
                "code": "audio_mqa",
                "desc": "Decodificador MQA."
            }
        ]
    },
    {
        "group": "HI-RESOLUTION AUDIO (Calidad)",
        "attrs": [
            {
                "code": "hires_muestreo",
                "desc": "Tasa de muestreo (Hi-Res Audio)."
            },
            {
                "code": "hires_upsampling",
                "desc": "Capacidad de re-escalado (Upsampling)."
            }
        ]
    },
    {
        "group": "EFECTOS DE SONIDO (Modos)",
        "attrs": [
            {
                "code": "modo_ai_sound_pro",
                "desc": "Modo AI Sound Pro."
            },
            {
                "code": "modo_standard",
                "desc": "Modo Estándar."
            },
            {
                "code": "modo_cinema",
                "desc": "Modo Cine."
            },
            {
                "code": "modo_game",
                "desc": "Modo Videojuegos."
            },
            {
                "code": "modo_musica",
                "desc": "Modo Música."
            },
            {
                "code": "modo_clear_voice_pro",
                "desc": "Modo Clear Voice Pro (Diálogos)."
            },
            {
                "code": "modo_deportes",
                "desc": "Modo Deportes."
            },
            {
                "code": "modo_bass_blast",
                "desc": "Modo Bass Blast (Bajos Potentes)."
            }
        ]
    },
    {
        "group": "FACILIDADES (Funciones Smart/TV)",
        "attrs": [
            {
                "code": "smart_remote_app",
                "desc": "Compatible con App (iOS/Android)."
            },
            {
                "code": "smart_ai_room_calibration",
                "desc": "Calibración de sala por IA."
            },
            {
                "code": "smart_control_modos_barra",
                "desc": "Control de modos desde el menú del TV."
            },
            {
                "code": "smart_tv_sound_mode_share",
                "desc": "TV Sound Mode Share."
            },
            {
                "code": "smart_wow_interface",
                "desc": "WOW Interface."
            },
            {
                "code": "smart_wow_orchestra",
                "desc": "WOW Orchestra."
            }
        ]
    },
    {
        "group": "ACCESORIOS (Incluidos)",
        "attrs": [
            {
                "code": "acc_mando_distancia",
                "desc": "Mando a distancia."
            },
            {
                "code": "acc_tarjeta_garantia",
                "desc": "Tarjeta de garantía."
            },
            {
                "code": "acc_cable_hdmi",
                "desc": "Cable HDMI."
            },
            {
                "code": "acc_cable_optico",
                "desc": "Cable de audio óptico."
            },
            {
                "code": "acc_soporte_pared",
                "desc": "Soporte de pared."
            },
            {
                "code": "acc_pilas",
                "desc": "Pilas (para el mando)."
            },
            {
                "code": "acc_tv_synergy_bracket",
                "desc": "Soporte 'Synergy' para TV específico."
            }
        ]
    },
    {
        "group": "Locura",
        "attrs": [
            {
                "code": "crazy",
                "desc": "Sugusantos"
            }
        ]
    }
];

if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('soundbars', SOUNDBARS_SCHEMA_GROUPS);
} else {
    console.error("Error: APP_DB no inicializada.");
}
