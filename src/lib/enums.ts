/**
 * The type of change that should re-render
 * a template. Can be combined to cover
 * multiple change types. For example
 * `CHANGE_TYPE.PROP | CHANGE_TYPE.THEME`
 * will re-render on both changes
 */
export enum CHANGE_TYPE {
    /**
     * Never re-render. This allows
     * for optimizing out the
     * rendering of this template
     */
    NEVER = 0,
    /**
     * Manually re-render. Functionally
     * equivalent to NEVER rerender
     */
    MANUAL = 0,
    /**
     * A property change
     */
    PROP = 1,
    /**
     * A theme change
     */
    THEME = 2,
    /**
     * Language changes
     */
    LANG = 4,
    /**
     * Subtree property changes
     */
    SUBTREE_PROPS = 8,
    /**
     * Global property changes
     */
    GLOBAL_PROPS = 16,
    /**
     * Any change
     */
    // 31 = 1 | 2 | 4 | 8 | 16 | 32
    ALWAYS = 63,
    /**
     * A forced user-engaged change
     */
    // 127 = 1 | 2 | 4 | 8 | 16 | 32 | 64
    FORCE = 127,
}

/**
 * Basic property types for properties
 */
export enum PROP_TYPE {
    /**
     * A string
     */
    STRING = 'string',
    /**
     * A number
     */
    NUMBER = 'number',
    /**
     * A boolean
     */
    BOOL = 'bool',
    /**
     * A required string (shortcut for {type: PROP_TYPE.STRING, required: true })
     */
    STRING_REQUIRED = 'string_required',
    /**
     * A required number (shortcut for {type: PROP_TYPE.NUMBER, required: true })
     */
    NUMBER_REQUIRED = 'number_required',
    /**
     * A required boolean (shortcut for {type: PROP_TYPE.BOOL, required: true })
     */
    BOOL_REQUIRED = 'bool_required',
    /**
     * An optional string (shortcut for {type: PROP_TYPE.STRING, required: false })
     */
    STRING_OPTIONAL = 'string_optional',
    /**
     * An optional number (shortcut for {type: PROP_TYPE.NUMBER, required: false })
     */
    NUMBER_OPTIONAL = 'number_optional',
    /**
     * An optional boolean (shortcut for {type: PROP_TYPE.BOOL, required: false })
     */
    BOOL_OPTIONAL = 'bool_optional',
}
