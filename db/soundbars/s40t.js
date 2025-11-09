/**
 * Datos del Modelo: S40T
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const S40T = {
    "model": "S40T",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "2.1",
        "general_potencia_salida_w": "300",
        "general_num_altavoces": "3",
        "dim_principal_mm": "720 x 63 x 87",
        "dim_subwoofer_mm": "171 x 320 x 252",
        "peso_principal_kg": "1,65",
        "peso_subwoofer_kg": "4,2",
        "peso_bruto_kg": "7,6",
        "potencia_consumo_stb_principal_w": "0.5",
        "potencia_consumo_principal_w": "22",
        "potencia_consumo_stb_subwoofer_w": "0.5",
        "potencia_consumo_subwoofer_w": "35",
        "con_hdmi_out": "1",
        "con_usb": "1",
        "con_optica": "1",
        "con_bluetooth_version": "5.3",
        "con_bluetooth_codec": "SBC/AAC",
        "hdmi_arc": "Si",
        "hdmi_cec_simplink": "Si",
        "audio_dolby_digital": "Si",
        "audio_dts_digital_surround": "Si",
        "audio_aac": "Si",
        "modo_ai_sound_pro": "Si",
        "modo_standard": "Si",
        "modo_cinema": "Si",
        "modo_game": "Si",
        "smart_remote_app": "Si",
        "smart_control_modos_barra": "Si",
        "smart_tv_sound_mode_share": "Si",
        "smart_wow_interface": "Si",
        "acc_mando_distancia": "Si",
        "acc_tarjeta_garantia": "Si"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(S40T);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}