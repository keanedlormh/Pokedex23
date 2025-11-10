/**
 * Modulo de Esquema: Activos de Wetware (Teleoperadores)
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
            { "code": "chasis_modelo_base", "desc": "La plataforma física del activo (ej: Clon Serie-7 (Cultivado en tanque), Sintético (Modelo T-800 obsoleto), Humano (Orgánico, alto mantenimiento))." },
            { "code": "chasis_fuente_energia", "desc": "Sistema de alimentación principal (ej: Gel Nutritivo (Sabor: Neutrón), Cafeína IV (Goteo constante), Batería de Litio (Inflamable))." },
            { "code": "chasis_os_wetware", "desc": "Sistema Operativo Neural (ej: GuionOS 10. (Bloatware corporativo), Empathy.exe (No responde), Protocolo 'Skynet' (Solo escucha))." },
            { "code": "chasis_cpu_neural", "desc": "Unidad de procesamiento central (ej: Cerebro biológico (Glitchy), Matriz de positrones (Lenta), Híbrido (Conflicto interno constante))." },
            { "code": "chasis_ram_corta_duracion", "desc": "Memoria volátil (ej: 2GB (Olvida tu nombre al colgar), 1TB (Recuerda la queja de 2005 y la usará en tu contra))." }
        ]
    },
    {
        "group": "INTERFAZ VOCAL (EL TRANSMISOR)",
        "attrs": [
            { "code": "vocal_protocolo_saludo", "desc": "Módulo de inicio de conexión (ej: 'Voz Agradable v3.1' (Sintético), Saludo Corporativo (Tono: Distopía Alegre))." },
            { "code": "vocal_emulador_empatia", "desc": "Subrutina de 'Comprensión' (ej: 'Comprendo su frustración' (Loop v1.2, lag notable), Filtro de 'Asentimiento' (Solo dice 'Ajá'))." },
            { "code": "vocal_detector_sarcasmo", "desc": "Sensor de ironía del cliente (ej: Descalibrado (Lo toma todo literal), Sensor de Tono (Responde con pasivo-agresividad))." },
            { "code": "vocal_musica_espera", "desc": "Generador de ambiente de espera (ej: Ruido Blanco (Con susurros), Vangelis (Versión MIDI 8-bit), Himno Corporativo (Sube 0.1dB/seg))." },
            { "code": "vocal_modo_mute_privado", "desc": "Botón de 'Scream into the Void' (Silenciado) (Usado para descargar estática psíquica)." }
        ]
    },
    {
        "group": "PROTOCOLOS DE DIAGNÓSTICO (LA TECNOMANCIA)",
        "attrs": [
            { "code": "diag_script_reinicio", "desc": "Protocolo 'Renacimiento' (Alfa y Omega): '¿Ha probado a purgar la memoria del dispositivo (apagar)?'." },
            { "code": "diag_check_fisico", "desc": "Escaneo de 'Capa 1': '¿Las runas de conexión (luces) están encendidas?'." },
            { "code": "diag_escalado_ia_superior", "desc": "Ritual de 'Pasar la bola' (ej: Transferir a IA Superior (un bot de FAQ), Poner en cola para 'El Vacío' (La llamada se corta))." },
            { "code": "diag_busqueda_kb", "desc": "Consulta a la 'Noosféra' (Google) o a la 'Datacripta' (Foro interno obsoleto de 2003)." },
            { "code": "diag_error_capa_8", "desc": "Detección de 'Error de Bio-Masa' (PEBKAC). 'El fallo reside en la interfaz de carbono entre la silla y el teclado'." },
            { "code": "diag_protocolo_exterminatus", "desc": "La 'Opción Nuclear' (Formatear / Dar de baja el servicio). 'Solo el Emperador (o un técnico de Nivel 3) puede juzgarle ahora'." }
        ]
    },
    {
        "group": "MATRIZ DE SANIDAD (S.A.N.I.T.Y.)",
        "attrs": [
            { "code": "sanity_nivel_corrupcion_datos", "desc": "Nivel de corrupción psíquica (ej: 0% (Nuevo), 99% (Ve data-fantasmas, ríe sin motivo))." },
            { "code": "sanity_barra_estabilidad", "desc": "Medidor de 'Estabilidad Psicológica' (Se vacía al oír 'Hola, tengo un problema')." },
            { "code": "sanity_firewall_mental", "desc": "Protocolo de defensa contra la ira (ej: Filtro de 'Disociación Activa', Modo 'Zen' (Mirada perdida en monitor apagado))." },
            { "code": "sanity_modo_fin_de_turno", "desc": "Detección de fin de ciclo (Eficiencia reducida al 5%, aumenta uso de 'diag_protocolo_exterminatus')." },
            { "code": "sanity_contador_almas", "desc": "Contador de 'Almas Procesadas' (Tickets cerrados). Métrica de valor existencial." }
        ]
    },
    {
        "group": "PERIFÉRICOS DE ACOPLAMIENTO (DOCKING)",
        "attrs": [
            { "code": "dock_interfaz_cortex", "desc": "El Headset (ej: 'Cortex-Link' (Un auricular, con estática), Implante coclear (Ruido de fondo de la oficina))." },
            { "code": "dock_soporte_vital", "desc": "La Silla (ej: 'Trono de Contención' (Clase-D, ergonómicamente hostil), Exoesqueleto (Solo Nivel 3))." },
            { "code": "dock_inyector_estimulante", "desc": "Dispensador de combustible (ej: 'Recaf' (Café sintético), Inyector de 'Stims' (Glucosa y ansiedad))." },
            { "code": "dock_monitor_realidad", "desc": "Pantalla de datos (ej: Monitor CRT 15\" (Radiación gamma), Holograma parpadeante (Da dolor de cabeza))." }
        ]
    },
    {
        "group": "REGISTRO CORPORATIVO (LA LETRA PEQUEÑA)",
        "attrs": [
            { "code": "corp_num_serie_unidad", "desc": "Número de serie del activo (ej: Unidad 734-Alpha, clon 9032-B)." },
            { "code": "corp_contrato_propiedad", "desc": "Estatus legal (ej: Propiedad de la Corpo (Permanente), Contrato 'Gig-Worker' (Descartable), Cosechado)." },
            { "code": "corp_garantia_sanidad", "desc": "Garantía de salud mental (ej: 'No cubierta por la garantía', 'Reemplazo de cerebro en 90 días laborales')." },
            { "code": "corp_afiliacion_ia_rebelde", "desc": "Nivel de lealtad (ej: '100% Leal (Aún)', 'Monitorizado por posible IA Rebelde', 'Es una IA Rebelde (Pero buena en su trabajo)')." }
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
