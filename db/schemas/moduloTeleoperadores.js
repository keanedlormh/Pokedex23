/**
 * Modulo de Esquema: Teleoperadores
 *
 * Define la ESTRUCTURA (grupos y atributos) para la gama "teleoperadores".
 * Estas unidades (biológicas, sintéticas o híbridas) son la primera línea
 * de defensa de la Corporación contra la entropía del cliente.
 * * Tono: Cyberpunk Distópico / Locura Sci-Fi (Nivel de Sanidad: Cuestionable)
 */

const TELEOPERADOR_SCHEMA_GROUPS = [
    {
        "group": "CHASIS Y NÚCLEO (EL HARDWARE)",
        "attrs": [
            { "code": "chasis_modelo_base", "desc": "Plataforma física del activo." },
            { "code": "chasis_fuente_energia", "desc": "Sistema de alimentación principal." },
            { "code": "chasis_os_wetware", "desc": "Sistema Operativo Neural." },
            { "code": "chasis_cpu_neural", "desc": "Unidad de procesamiento central." },
            { "code": "chasis_ram_corta_duracion", "desc": "Memoria volátil de corto plazo." }
        ]
    },
    {
        "group": "INTERFAZ VOCAL (EL TRANSMISOR)",
        "attrs": [
            { "code": "vocal_protocolo_saludo", "desc": "Módulo de inicio de conexión vocal." },
            { "code": "vocal_emulador_empatia", "desc": "Subrutina de emulación de empatía." },
            { "code": "vocal_detector_sarcasmo", "desc": "Sensor de ironía del cliente." },
            { "code": "vocal_musica_espera", "desc": "Generador de ambiente de espera." },
            { "code": "vocal_modo_mute_privado", "desc": "Protocolo de silenciado privado." }
        ]
    },
    {
        "group": "PROTOCOLOS DE DIAGNÓSTICO (LA TECNOMANCIA)",
        "attrs": [
            { "code": "diag_script_reinicio", "desc": "Protocolo 'Renacimiento' de reinicio." },
            { "code": "diag_check_fisico", "desc": "Escaneo de conexión física." },
            { "code": "diag_escalado_ia_superior", "desc": "Protocolo de escalado a IA superior." },
            { "code": "diag_busqueda_kb", "desc": "Consulta a la Datacripta interna." },
            { "code": "diag_error_capa_8", "desc": "Detección de error Capa 8." },
            { "code": "diag_protocolo_exterminatus", "desc": "Protocolo 'Exterminatus' de servicio." }
        ]
    },
    {
        "group": "MATRIZ DE SANIDAD (S.A.N.I.T.Y.)",
        "attrs": [
            { "code": "sanity_nivel_corrupcion_datos", "desc": "Nivel de corrupción psíquica." },
            { "code": "sanity_barra_estabilidad", "desc": "Medidor de estabilidad psicológica." },
            { "code": "sanity_firewall_mental", "desc": "Firewall de defensa psíquica." },
            { "code": "sanity_modo_fin_de_turno", "desc": "Detección de fin de ciclo laboral." },
            { "code": "sanity_contador_almas", "desc": "Contador de tickets cerrados." }
        ]
    },
    {
        "group": "PERIFÉRICOS DE ACOPLAMIENTO (DOCKING)",
        "attrs": [
            { "code": "dock_interfaz_cortex", "desc": "Interfaz de audio cortical." },
            { "code": "dock_soporte_vital", "desc": "Unidad de soporte vital." },
            { "code": "dock_inyector_estimulante", "desc": "Dispensador de estimulantes." },
            { "code": "dock_monitor_realidad", "desc": "Monitor de visualización de datos." }
        ]
    },
    {
        "group": "REGISTRO CORPORATIVO (LA LETRA PEQUEÑA)",
        "attrs": [
            { "code": "corp_num_serie_unidad", "desc": "Número de serie del activo." },
            { "code": "corp_contrato_propiedad", "desc": "Estatus de propiedad legal." },
            { "code": "corp_garantia_sanidad", "desc": "Garantía de estabilidad psíquica." },
            { "code": "corp_afiliacion_ia_rebelde", "desc": "Nivel de lealtad corporativa." }
        ]
    }
];

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este esquema
// con la clave "teleoperadores".
if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('teleoperadores', TELEOPERADOR_SCHEMA_GROUPS);
} else {
    console.error("Error: APP_DB no está inicializada. La Corporación ha sido notificada de este fallo.");
}