/**
 * Datos del Modelo: S20A
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const S20A = {
    "model": "S20A",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "2.0",
        "general_potencia_salida_w": "50",
        "general_num_altavoces": "4",
        "dim_principal_mm": "650 x 63 x 99",
        "dim_caja_mm": "898 x 145 x 123",
        "peso_principal_kg": "2,2",
        "peso_bruto_kg": "2,8",
        "potencia_consumo_stb_principal_w": "0.5",
        "potencia_consumo_principal_w": "15",
        "con_hdmi_out": "1",
        "con_usb": "1",
        "con_bluetooth_version": "5.3",
        "con_bluetooth_codec": "SBC / AAC",
        "hdmi_arc": "Si",
        "hdmi_cec_simplink": "Si",
        "hdmi_version": "1.4",
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
        "smart_wow_orchestra": "Si",
        "acc_mando_distancia": "Si",
        "acc_tarjeta_garantia": "Si"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(S20A);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}