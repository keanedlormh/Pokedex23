/**
 * Datos del Modelo: S70TY
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const S70TY = {
    "model": "S70TY",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "3.1.1",
        "general_potencia_salida_w": "400",
        "dim_principal_mm": "950 x 63 x 115",
        "dim_subwoofer_mm": "200 x 377 x 285",
        "hdmi_passthrough": "Si",
        "hdmi_vrr_allm": "Si",
        "hdmi_120hz": "Si",
        "audio_dolby_atmos": "Si",
        "audio_dolby_digital": "Si",
        "audio_dtsx": "Si",
        "audio_dts_digital_surround": "Si",
        "hires_muestreo": "24bit/96kHz",
        "modo_ai_sound_pro": "Si",
        "smart_wow_interface": "Si",
        "smart_wow_orchestra": "Si",
        "acc_tv_synergy_bracket": "Si"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(S70TY);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}