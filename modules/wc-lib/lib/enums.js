/**
 * The type of change that should re-render
 * a template. Can be combined to cover
 * multiple change types. For example
 * `CHANGE_TYPE.PROP | CHANGE_TYPE.THEME`
 * will re-render on both changes
 */
export var CHANGE_TYPE;
(function (CHANGE_TYPE) {
    /**
     * Never re-render. This allows
     * for optimizing out the
     * rendering of this template
     */
    CHANGE_TYPE[CHANGE_TYPE["NEVER"] = 0] = "NEVER";
    /**
     * Manually re-render. Functionally
     * equivalent to NEVER rerender
     */
    CHANGE_TYPE[CHANGE_TYPE["MANUAL"] = 0] = "MANUAL";
    /**
     * A property change
     */
    CHANGE_TYPE[CHANGE_TYPE["PROP"] = 1] = "PROP";
    /**
     * A theme change
     */
    CHANGE_TYPE[CHANGE_TYPE["THEME"] = 2] = "THEME";
    /**
     * Language changes
     */
    CHANGE_TYPE[CHANGE_TYPE["LANG"] = 4] = "LANG";
    /**
     * Subtree property changes
     */
    CHANGE_TYPE[CHANGE_TYPE["SUBTREE_PROPS"] = 8] = "SUBTREE_PROPS";
    /**
     * Global property changes
     */
    CHANGE_TYPE[CHANGE_TYPE["GLOBAL_PROPS"] = 16] = "GLOBAL_PROPS";
    /**
     * Any change
     */
    // 31 = 1 | 2 | 4 | 8 | 16 | 32
    CHANGE_TYPE[CHANGE_TYPE["ALWAYS"] = 63] = "ALWAYS";
    /**
     * A forced user-engaged change
     */
    // 127 = 1 | 2 | 4 | 8 | 16 | 32 | 64
    CHANGE_TYPE[CHANGE_TYPE["FORCE"] = 127] = "FORCE";
})(CHANGE_TYPE || (CHANGE_TYPE = {}));
/**
 * Basic property types for properties
 */
export var PROP_TYPE;
(function (PROP_TYPE) {
    /**
     * A string
     */
    PROP_TYPE["STRING"] = "string";
    /**
     * A number
     */
    PROP_TYPE["NUMBER"] = "number";
    /**
     * A boolean
     */
    PROP_TYPE["BOOL"] = "bool";
    /**
     * A required string (shortcut for {type: PROP_TYPE.STRING, required: true })
     */
    PROP_TYPE["STRING_REQUIRED"] = "string_required";
    /**
     * A required number (shortcut for {type: PROP_TYPE.NUMBER, required: true })
     */
    PROP_TYPE["NUMBER_REQUIRED"] = "number_required";
    /**
     * A required boolean (shortcut for {type: PROP_TYPE.BOOL, required: true })
     */
    PROP_TYPE["BOOL_REQUIRED"] = "bool_required";
    /**
     * An optional string (shortcut for {type: PROP_TYPE.STRING, required: false })
     */
    PROP_TYPE["STRING_OPTIONAL"] = "string_optional";
    /**
     * An optional number (shortcut for {type: PROP_TYPE.NUMBER, required: false })
     */
    PROP_TYPE["NUMBER_OPTIONAL"] = "number_optional";
    /**
     * An optional boolean (shortcut for {type: PROP_TYPE.BOOL, required: false })
     */
    PROP_TYPE["BOOL_OPTIONAL"] = "bool_optional";
})(PROP_TYPE || (PROP_TYPE = {}));
//# sourceMappingURL=enums.js.map