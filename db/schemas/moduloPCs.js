/**
 * Modulo de Esquema: Portátiles (PCs)
 *
 * Define la ESTRUCTURA (grupos y atributos) para la gama "pcs".
 * Basado en la gama LG Gram y Ultra.
 * Luego, se registra en la base de datos global.
 */

const PC_SCHEMA_GROUPS = [
    {
        "group": "INFORMACIÓN BÁSICA",
        "attrs": [
            { "code": "info_categoria", "desc": "Categoría comercial del producto (ej: LG gram pro, Ultra PC)." },
            { "code": "info_nombre_producto", "desc": "Código de modelo específico." },
            { "code": "info_anyo_modelo", "desc": "Año de lanzamiento del modelo." },
            { "code": "info_ean", "desc": "Código de barras EAN del producto." }
        ]
    },
    {
        "group": "SISTEMA Y RENDIMIENTO",
        "attrs": [
            { "code": "sys_sistema_operativo", "desc": "Sistema operativo preinstalado y versión." },
            { "code": "sys_procesador_modelo", "desc": "Modelo detallado del procesador (CPU), Cores y Caché." },
            { "code": "sys_memoria_capacidad", "desc": "Cantidad total de memoria RAM." },
            { "code": "sys_memoria_tipo_velocidad", "desc": "Tipo de RAM (LPDDR5X, DDR4) y frecuencia (MHz)." },
            { "code": "sys_grafica_modelo", "desc": "Modelo de la tarjeta gráfica (GPU) y VRAM dedicada si aplica." },
            { "code": "sys_sistema_refrigeracion", "desc": "Tecnología de refrigeración (ej: Mega Cooling)." }
        ]
    },
    {
        "group": "PANTALLA (DISPLAY)",
        "attrs": [
            { "code": "display_tamano_pulgadas", "desc": "Diagonal de pantalla en pulgadas." },
            { "code": "display_tipo_panel", "desc": "Tecnología del panel (IPS, OLED)." },
            { "code": "display_resolucion_tipo", "desc": "Nombre comercial de la resolución (WQXGA, FHD, etc.)." },
            { "code": "display_resolucion_px", "desc": "Resolución en píxeles (Ancho x Alto)." },
            { "code": "display_relacion_aspecto", "desc": "Formato de la pantalla (ej: 16:10)." },
            { "code": "display_brillo_nits", "desc": "Brillo máximo del panel en nits." },
            { "code": "display_gamut_color", "desc": "Cobertura de color (DCI-P3, NTSC)." },
            { "code": "display_tasa_refresco", "desc": "Frecuencia de actualización de la pantalla (Hz)." },
            { "code": "display_tratamiento_antireflejos", "desc": "Tipo de acabado de la pantalla (Anti-glare)." },
            { "code": "display_tactil", "desc": "Indica si la pantalla es táctil." }
        ]
    },
    {
        "group": "ALMACENAMIENTO",
        "attrs": [
            { "code": "storage_ssd_capacidad", "desc": "Capacidad total del disco SSD principal." },
            { "code": "storage_ssd_tipo", "desc": "Tecnología del SSD (ej: NVMe Gen.4)." },
            { "code": "storage_ranuras_ssd", "desc": "Disponibilidad de ranuras extra para expansión." },
            { "code": "storage_ranura_tarjetas", "desc": "Tipo de lector de tarjetas integrado (Micro SD, UFS)." },
            { "code": "storage_seguridad_ssd", "desc": "Protocolos de seguridad de almacenamiento." }
        ]
    },
    {
        "group": "DISEÑO Y CONSTRUCCIÓN",
        "attrs": [
            { "code": "design_color", "desc": "Color del acabado exterior." },
            { "code": "design_material_chasis", "desc": "Materiales de construcción (ej: Magnesio y Nanocarbono)." },
            { "code": "design_durabilidad_militar", "desc": "Certificación de resistencia (MIL-STD-810H)." }
        ]
    },
    {
        "group": "DIMENSIONES Y PESO",
        "attrs": [
            { "code": "dim_producto_mm", "desc": "Dimensiones físicas del portátil (Ancho x Fondo x Alto)." },
            { "code": "dim_peso_kg", "desc": "Peso del portátil en Kg." },
            { "code": "dim_envio_mm", "desc": "Dimensiones de la caja de envío." },
            { "code": "dim_peso_envio_kg", "desc": "Peso total del paquete de envío." }
        ]
    },
    {
        "group": "BATERÍA Y POTENCIA",
        "attrs": [
            { "code": "power_bateria_wh", "desc": "Capacidad de la batería en Vatios-hora (Wh)." },
            { "code": "power_bateria_tipo", "desc": "Tecnología y celdas de la batería." },
            { "code": "power_autonomia_horas", "desc": "Duración estimada de la batería según pruebas estándar." },
            { "code": "power_adaptador_w", "desc": "Potencia del cargador incluido (W)." },
            { "code": "power_tipo_conector", "desc": "Tipo de conexión de carga (USB-C, propietario)." }
        ]
    },
    {
        "group": "CONECTIVIDAD Y REDES",
        "attrs": [
            { "code": "conn_wifi_modelo", "desc": "Estándar Wi-Fi y modelo del chip (ej: Wi-Fi 7, Intel BE201)." },
            { "code": "conn_bluetooth_version", "desc": "Versión de Bluetooth." },
            { "code": "conn_lan_ethernet", "desc": "Puerto Ethernet físico o necesidad de adaptador." }
        ]
    },
    {
        "group": "PUERTOS E INTERFAZ",
        "attrs": [
            { "code": "port_usb_a_cantidad", "desc": "Número y generación de puertos USB Tipo A." },
            { "code": "port_usb_c_thunderbolt", "desc": "Número de puertos USB-C y soporte Thunderbolt 4 / DisplayPort." },
            { "code": "port_hdmi_version", "desc": "Versión del puerto HDMI." },
            { "code": "port_salida_auriculares", "desc": "Tipo de jack de audio (ej: 3.5mm combo)." }
        ]
    },
    {
        "group": "MULTIMEDIA",
        "attrs": [
            { "code": "media_webcam_specs", "desc": "Resolución y características de la cámara web (IR, Micrófonos)." },
            { "code": "media_audio_tecnologia", "desc": "Tecnologías de mejora de audio (Dolby Atmos, DTS:X)." },
            { "code": "media_altavoces_potencia", "desc": "Configuración y potencia de los altavoces." }
        ]
    },
    {
        "group": "DISPOSITIVOS DE ENTRADA",
        "attrs": [
            { "code": "input_teclado_idioma", "desc": "Idioma y distribución del teclado." },
            { "code": "input_teclado_numerico", "desc": "Detalles del teclado numérico (columnas)." },
            { "code": "input_touchpad", "desc": "Características del panel táctil." },
            { "code": "input_botones_extra", "desc": "Botones adicionales (Copilot, Encendido)." }
        ]
    },
    {
        "group": "SEGURIDAD",
        "attrs": [
            { "code": "sec_huella_dactilar", "desc": "Sensor de huellas dactilares." },
            { "code": "sec_reconocimiento_facial", "desc": "Desbloqueo facial (Windows Hello)." },
            { "code": "sec_kensington_lock", "desc": "Ranura para candado de seguridad." },
            { "code": "sec_tpm", "desc": "Encriptación por hardware (fTPM)." },
            { "code": "sec_modo_seguro", "desc": "Modo seguro o 'Security Guard'." }
        ]
    },
    {
        "group": "SOFTWARE PREINSTALADO",
        "attrs": [
            { "code": "soft_lg_apps", "desc": "Suite de aplicaciones LG (Glance, Smart Assistant, etc.)." },
            { "code": "soft_mcafee", "desc": "Inclusión de prueba de McAfee." },
            { "code": "soft_microsoft_365", "desc": "Inclusión de prueba de Microsoft 365." },
            { "code": "soft_dolby_atmos", "desc": "Licencia de software Dolby Atmos." },
            { "code": "soft_intel_unision", "desc": "Software de conectividad Intel Unision." }
        ]
    },
    {
        "group": "ACCESORIOS",
        "attrs": [
            { "code": "acc_adaptador_red", "desc": "Inclusión de adaptador USB-C a RJ45." },
            { "code": "acc_otros", "desc": "Otros accesorios incluidos en la caja." }
        ]
    }
];

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este esquema
// con la clave "pcs".
if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('pcs', PC_SCHEMA_GROUPS);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}