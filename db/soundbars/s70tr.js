/**
 * Datos del Modelo: S70TR
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const S70TR = {
    "model": "S70TR",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "5.1.1",
        "general_potencia_salida_w": "500",
        "dim_principal_mm": "950 x 63 x 115",
        "dim_subwoofer_mm": "200 x 377 x 285",
        "dim_traseros_mm": "100,0 x 176,5 x 120,0",
        "peso_principal_kg": "3,0",
        "peso_subwoofer_kg": "5,7",
        "peso_traseros_kg": "2,1",
        "peso_bruto_kg": "15,4",
        "con_hdmi_in": "1",
        "con_hdmi_out": "1",
        "con_usb": "1",
        "con_optica": "1",
        "con_bluetooth_codec": "SBC/AAC",
        "con_preparado_traseros": "Si",
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
        "hires_muestreo": "24bit/96kHz",
        "modo_ai_sound_pro": "Si",
        "modo_standard": "Si",
        "modo_cinema": "Si",
        "modo_game": "Si",
        "modo_musica": "Si",
        "modo_clear_voice_pro": "Si",
        "modo_deportes": "Si",
        "modo_bass_blast": "Si",
        "smart_remote_app": "Si",
        "smart_control_modos_barra": "Si",
        "smart_tv_sound_mode_share": "Si",
        "smart_wow_interface": "Si",
        "smart_wow_orchestra": "Si",
        "acc_mando_distancia": "Si",
        "acc_tarjeta_garantia": "Si",
        "acc_cable_hdmi": "Si",
        "acc_soporte_pared": "Si",
        "acc_tv_synergy_bracket": "Si"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(S70TR);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}