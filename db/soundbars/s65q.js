/**
 * Datos del Modelo: S65Q
 *
 * Define el objeto para un único producto y lo registra
 * en la base de datos global.
 */

const S65Q = {
    "model": "S65Q",
    "schema_key": "soundbars",
    "attributes": {
        "general_num_canales": "3.1",
        "general_potencia_salida_w": "420",
        "audio_dolby_digital": "Si",
        "hires_muestreo": "24bit/96kHz"
    }
};

// --- REGISTRO ---
if (window.APP_DB && typeof window.APP_DB.registerProduct === 'function') {
    window.APP_DB.registerProduct(S65Q);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}