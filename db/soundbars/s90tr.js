/**
 * Datos del Modelo: S90TR
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const S90TR = {
    "model": "S90TR",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "7.1.3",
        "general_potencia_salida_w": "670",
        "general_num_altavoces": "11",
        "dim_principal_mm": "1250 x 63 x 135",
        "dim_subwoofer_mm": "201,7 x 407,0 x 403,0",
        "dim_traseros_mm": "100,0 x 176,5 x 120,0",
        "peso_principal_kg": "5,65",
        "peso_subwoofer_kg": "10,0",
        "peso_traseros_kg": "2,34",
        "peso_bruto_kg": "25,3",
        "con_hdmi_in": "1",
        "con_hdmi_out": "1",
        "con_usb": "1",
        "con_optica": "1",
        "con_bluetooth_codec": "SBC/AAC",
        "con_wifi": "Si",
        "con_preparado_traseros": "Si",
        "con_chromecast": "Si",
        "con_airplay2": "Si",
        "con_spotify_connect": "Si",
        "con_tidal_connect": "Si",
        "con_google_home": "Si",
        "con_alexa": "Si",
        "hdmi_arc": "Si",
        "hdmi_earc": "Si",
        "hdmi_cec_simplink": "Si",
        "hdmi_passthrough": "Si",
        "hdmi_passthrough_4k": "Si",
        "hdmi_vrr_allm": "Si",
        "hdmi_120hz": "Si",
        "hdmi_hdr10": "Si",
        "hdmi_dolby_vision": "Si",
        "audio_dolby_atmos": "Si",
        "audio_dolby_digital": "Si",
        "audio_dtsx": "Si",
        "audio_dts_digital_surround": "Si",
        "audio_aac": "Si",
        "audio_aac_plus": "Si",
        "hires_muestreo": "24bit/96kHz",
        "hires_upsampling": "24bit/96kHz",
        "modo_ai_sound_pro": "Si",
        "modo_standard": "Si",
        "modo_cinema": "Si",
        "modo_game": "Si",
        "modo_musica": "Si",
        "modo_clear_voice_pro": "Si",
        "modo_deportes": "Si",
        "modo_bass_blast": "Si",
        "smart_remote_app": "Si",
        "smart_ai_room_calibration": "Si",
        "smart_control_modos_barra": "Si",
        "smart_tv_sound_mode_share": "Si",
        "smart_wow_interface": "Si",
        "smart_wow_orchestra": "Si",
        "acc_mando_distancia": "Si",
        "acc_tarjeta_garantia": "Si",
        "acc_cable_hdmi": "Si",
        "acc_soporte_pared": "Si"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(S90TR);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}