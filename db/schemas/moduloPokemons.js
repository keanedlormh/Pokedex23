/**
 * Modulo de Esquema: pokemons
 * (Generado por Admin Panel v3.0.0)
 */

const POKEMONS_SCHEMA_GROUPS = [
    {
        "group": "Tipo",
        "attrs": [
            {
                "code": "element",
                "desc": "Elemento"
            },
            {
                "code": "clase",
                "desc": "Clase"
            }
        ]
    },
    {
        "group": "Entorno",
        "attrs": [
            {
                "code": "social",
                "desc": "Grupo social"
            },
            {
                "code": "nature",
                "desc": "Medio natural"
            }
        ]
    }
];

// --- REGISTRO ---
// Comprueba si la BD global existe y registra este esquema
// con la clave "pokemons".
if (window.APP_DB && typeof window.APP_DB.registerSchema === 'function') {
    window.APP_DB.registerSchema('pokemons', POKEMONS_SCHEMA_GROUPS);
} else {
    console.error("Error: APP_DB no está inicializada. Asegúrate de que main.js se carga primero.");
}
