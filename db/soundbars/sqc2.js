/**
 * Datos del Modelo: SQC2
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const SQC2 = {
    "model": "SQC2",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "2.1",
        "general_potencia_salida_w": "300",
        "con_usb": "1",
        "con_optica": "1",
        "audio_dolby_digital": "Si",
        "smart_remote_app": "Si"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(SQC2);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}