/**
 * Datos del Modelo: SQC4R
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const SQC4R = {
    "model": "SQC4R",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "4.1",
        "general_potencia_salida_w": "220",
        "dim_principal_mm": "660 x 56 x 99",
        "dim_subwoofer_mm": "185.5 x 303 x 205",
        "dim_traseros_mm": "88 x 80 x 122",
        "dim_caja_mm": "726x223x372",
        "peso_principal_kg": "1,31",
        "peso_subwoofer_kg": "2,94",
        "peso_traseros_kg": "0,73",
        "peso_bruto_kg": "7,91",
        "con_usb": "1",
        "con_optica": "1",
        "con_bluetooth_version": "4.0",
        "audio_dolby_digital": "Si",
        "audio_lpcm": "Si",
        "modo_standard": "Si",
        "modo_bass_blast": "Si",
        "acc_mando_distancia": "Si (HA2)",
        "acc_tarjeta_garantia": "Si",
        "acc_pilas": "Si (AAA x 2)"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(SQC4R);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}