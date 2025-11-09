/**
 * Ficha de producto: 75QNED93A6A
 *
 * Contiene los datos de un producto específico (TV).
 * Se registra en la base de datos global.
 */

const S75QNED93A6A_DATA = {
    "model": "75QNED93A6A",
    "schema_key": "tvs",
    "attributes": {
        "display_tipo_pantalla": "4K QNED MiniLED",
        "display_resolucion_pantalla": "4K Ultra HD (3,840 x 2,160)",
        "display_tipo_retroiluminacion": "Mini LED",
        "display_tasa_refresco": "120Hz Nativos (VRR 144Hz)",
        "display_wide_color_gamut": "Dynamic QNED Color Pro",
        "procesado_procesador_imagen": "Procesador 4K IA α8 Gen2",
        "procesado_escalado_ia": "Super Escalado 4K con IA α8",
        "procesado_dynamic_tone_mapping": "Si (Dynamic Tone Mapping Pro)",
        "procesado_seleccion_genero_ia": "Si (SDR/HDR)",
        "procesado_hdr": "Dolby Vision / HDR10 / HLG",
        "procesado_filmmaker_mode": "Si",
        "procesado_tecnologia_atenuacion": "Precision Dimming Pro",
        "procesado_motion": "Motion Pro",
        "procesado_modos_imagen": "10 modos",
        "procesado_hfr": "4K 120 fps (HDMI)",
        "procesado_ai_picture_pro": "Si",
        "procesado_auto_calibrado": "Si",
        "procesado_qms": "Si",
        "gaming_free_sync": "Si",
        "gaming_hgig_mode": "Si",
        "gaming_game_optimizer": "Si (Game Dashboard)",
        "gaming_allm": "Si",
        "gaming_vrr": "Si (Hasta 144Hz)",
        "gaming_dolby_vision_gaming": "Si",
        "audio_dolby_atmos": "Si",
        "audio_sonido_ia": "α8 AI Sound Pro (Virtual 9.1.2 Up-mix)",
        "audio_dialogos_claros": "Si (Regulación Auto Volumen)",
        "audio_wisa_ready": "Si (Up to 2.1 Channel)",
        "audio_lg_sound_sync": "Si",
        "audio_sound_mode_share": "Si",
        "audio_salida_simultanea": "Si",
        "audio_bluetooth_surround": "Si (Reproducción en 2 sentidos)",
        "audio_salida_w": "40W",
        "audio_calibracion_acustica_ia": "Si",
        "audio_codecs": "AC4, AC3(Dolby Digital), EAC3, HE-AAC, AAC, MP2, MP3, PCM, WMA, apt-X (Refer to manual)",
        "audio_direccion_altavoces": "Salida hacia Abajo",
        "audio_sistema_altavoces": "2.2 Canales",
        "audio_wow_orchestra": "Si",
        "smart_sistema_operativo": "WebOS 25",
        "smart_apple_airplay": "Si",
        "smart_camara_usb": "Si",
        "smart_ai_chatbot": "Si",
        "smart_siempre_lista": "Si",
        "smart_navegador_web": "Si",
        "smart_google_cast": "Si",
        "smart_google_home": "Si",
        "smart_home_hub": "Si",
        "smart_reconocimiento_voz": "Si",
        "smart_lg_channels": "Si",
        "smart_magic_remote": "Incluido",
        "smart_multipantalla": "Si",
        "smart_remote_app": "Si (LG ThinQ)",
        "smart_id_voz": "Si",
        "smart_apple_home": "Si",
        "con_hdmi_earc_puerto": "eARC (HDMI 3)",
        "con_bluetooth_version": "Si (v 5.3)",
        "con_ethernet": "1ud",
        "con_hdmi_cec_simplink": "Si",
        "con_optica": "1ud",
        "con_ranura_ci": "1x (Excepto UK, Irlanda)",
        "con_hdmi_num_puertos": "4ud (Soporta 4K 120Hz, eARC, VRR, ALLM, QMS (Puerto 4)",
        "con_rf_in": "2ud",
        "con_usb_num_puertos": "2ud (v 2.0)",
        "con_wifi_version": "Si (Wi-Fi 6)",
        "accesibilidad_alto_contraste": "Si",
        "accesibilidad_escala_grises": "Si",
        "accesibilidad_invertir_colores": "Si",
        "dim_sin_peana_mm": "1667 x 955 x 58,8",
        "dim_con_peana_mm": "1667 x 1028 x 402",
        "dim_embalaje_mm": "2060 x 1103 x 164",
        "dim_peana_mm": "550 x 402",
        "peso_sin_peana_kg": "25,7",
        "peso_con_peana_kg": "27,6",
        "peso_embalaje_kg": "38",
        "dim_vesa_mm": "400 x 300",
        "power_voltaje": "AC 100~240V 50-60Hz",
        "power_standby_w": "Under 0.5W",
        "acc_mando_distancia": "Magic Remote MR25GA / MR25GB (UK, Italia)",
        "acc_cable_alimentacion": "Si (Desenchufable)",
        "radio_recepcion_analogica": "Si",
        "radio_recepcion_digital": "DVB-T2/T (Terrestre), DVB-C (Cable), DVB-",
        "info_ean": "8806096416754"
    }
};

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este producto
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(S75QNED93A6A_DATA);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}
