/**
 * Modulo de Esquema: Teleoperadores de Soporte Técnico (TST)
 *
 * Define la ESTRUCTURA (grupos y atributos) para la gama "teleoperadores".
 * Estos "electrodomésticos" son cruciales para el equilibrio kármico 
 * del universo tecnológico, absorbiendo la ira para que el cosmos no colapse.
 * * Tono: Místico-Cínico (Nivel de Paciencia: Bajo)
 */

const TELEOPERADOR_SCHEMA_GROUPS = [
    {
        "group": "NÚCLEO Y ALIMENTACIÓN (LA CHISPA VITAL)",
        "attrs": [
            { "code": "core_placa_base", "desc": "Modelo de la unidad (ej: TST Nivel 1 (Carne de cañón), TST Nivel 2 (Sabe buscar en Google))." },
            { "code": "core_fuente_energia", "desc": "Sistema de alimentación principal (ej: Cafeína (mín. 800mg/día), Desesperación residual, Batería social (en rojo))." },
            { "code": "core_sistema_operativo", "desc": "Software de gestión de protocolos (ej: ManualDeProcedimientos v1.3 (sin parches), GuionOS (modo lectura))." },
            { "code": "core_ram", "desc": "Memoria volátil (ej: 2 KB (solo retiene el número de caso actual), 1 GB (recuerda la llamada de ayer y guarda rencor))." },
            { "code": "core_modo_standby", "desc": "Consumo en espera (ej: Mirada perdida en monitor (consumo 'Casi Nulo'), Murmullos ininteligibles)." }
        ]
    },
    {
        "group": "INTERFAZ DE COMUNICACIÓN (VOCALIZADOR DE GUIONES)",
        "attrs": [
            { "code": "comms_protocolo_saludo", "desc": "Protocolo de inicio de conexión (ej: Saludo corporativo (Tono: Entusiasmo Forzado 2.0))." },
            { "code": "comms_filtro_ira", "desc": "Módulo de 'Comprendo su frustración' (Activación automática al detectar 80dB)." },
            { "code": "comms_detector_sarcasmo", "desc": "Sensor de ironía del cliente (ej: Desactivado por defecto (ahorra CPU y salud mental))." },
            { "code": "comms_generador_musica_espera", "desc": "Generador de ambiente (ej: Vivaldi en 8-bits (loop 30s), 'El Silencio' (versión instrumental))." },
            { "code": "comms_modulador_empatia", "desc": "Emulación de empatía (ej: Nivel 1 (Robótico), Nivel 2 (Suena casi humano))." },
            { "code": "comms_modo_mute", "desc": "Botón de 'Sigh' (suspiro) silenciado (Estadística de uso: 15 veces/llamada)." }
        ]
    },
    {
        "group": "KIT DE HERRAMIENTAS MÍSTICAS (TROUBLESHOOTING)",
        "attrs": [
            { "code": "diag_reinicio_universal", "desc": "Solución Mística Nivel 9: '¿Ha probado a apagar y encender?'." },
            { "code": "diag_check_cables", "desc": "El encantamiento de '¿Está bien enchufado?' (Resuelve el 40% de los casos)." },
            { "code": "diag_escalado_problema", "desc": "Ritual de 'Pasar la bola' (Requiere sacrificio de 15 min de espera y re-explicar todo)." },
            { "code": "diag_busqueda_kb", "desc": "Consulta al Oráculo (Base de datos interna) (Tasa de éxito: 12%)." },
            { "code": "diag_culpabilidad_usuario", "desc": "Detección de 'Error Capa 8' (PEBKAC / 'El problema está entre la silla y el teclado')." },
            { "code": "diag_formateo_ultima_ratio", "desc": "La 'Opción Nuclear' (Cuando todo lo demás falla, o es hora de comer)." }
        ]
    },
    {
        "group": "MÓDULO DE RESILIENCIA (PSIQUE)",
        "attrs": [
            { "code": "psy_barra_paciencia", "desc": "Barra de maná (Decreciente, no se regenera en turno, se reinicia al fichar)." },
            { "code": "psy_protocolo_fin_de_turno", "desc": "Purga de memoria RAM (Olvido instantáneo de la llamada anterior al colgar)." },
            { "code": "psy_sindrome_impostor", "desc": "Activado permanentemente (Miedo a preguntas que no están en el guion)." },
            { "code": "psy_deteccion_viernes_tarde", "desc": "Sensor de fin de semana (Eficiencia reducida al 10%, aumenta la tasa de 'formateo_ultima_ratio')." },
            { "code": "psy_contador_tickets", "desc": "Número de tickets cerrados (Métrica principal de valor existencial)." }
        ]
    },
    {
        "group": "PERIFÉRICOS INCLUIDOS (KIT DE SUPERVIVENCIA)",
        "attrs": [
            { "code": "acc_headset", "desc": "Auriculares (ej: Monoaural (para oír el caos de la oficina), Biaural (un lado no funciona))." },
            { "code": "acc_silla", "desc": "Soporte físico (ej: Silla Ergonómica (Clase C, nivel de 'ñic' 8/10))." },
            { "code": "acc_taza", "desc": "Receptáculo de combustible (ej: Taza 'World's Okayest Employee' (manchada))." },
            { "code": "acc_manual_procedimientos", "desc": "El 'Grimorio' (Manual de 400 páginas, usado como posavasos o para calzar la mesa)." }
        ]
    },
    {
        "group": "DATOS DEL FABRICANTE (SINDICATO)",
        "attrs": [
            { "code": "info_ean_contrato", "desc": "Código de barras del tipo de contrato (ej: EAN-13 (Temporal), EAN-8 (Prácticas))." },
            { "code": "info_garantia_mental", "desc": "Garantía de salud mental (ej: 0 días, 'Trae tu propio psicólogo')." }
        ]
    }
];

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este esquema
// con la clave "teleoperadores".
if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('teleoperadores', TELEOPERADOR_SCHEMA_GROUPS);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}