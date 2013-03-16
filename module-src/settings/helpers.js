/*jslint plusplus: true, white: true, browser: true */

/**
 * Normalize a setting to the correct type and value
 *
 * @param {mixed} value        The current value
 * @param {mixed} defaultValue The default value
 *
 * @return {mixed} The normalized setting
 */
function normalizeSetting(value, defaultValue)
{
    var result;

    if (value === undefined || value === null) {
        return defaultValue;
    }

    switch (typeof defaultValue) {
        case 'string':
            result = String(value);
            break;

        case 'boolean':
            result = Boolean(value && value !== 'false');
            break;

        case 'number':
            result = Number(value);
            if (isNaN(result)) {
                result = defaultValue;
            }
            break;

        case 'object':
            if (typeof value === 'object') {
                result = value;
            } else if (typeof value === 'string') {
                try {
                    result = JSON.parse(value);
                } catch (e) {
                    result = defaultValue;
                }
            } else {
                result = defaultValue;
            }
            break;

    }

    return result;
}

/**
 * Create a default settings object based on the default values and configured overrides
 *
 * @param {object} defaults The default settings object
 * @param {object} defaults The overridden settings object
 *
 * @return {object} The created object
 */
function makeDefaultSettingsObject(defaults, overrides)
{
    var key, result = {};
    overrides = overrides || {};

    for (key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            result[key] = defaults[key];
        }
    }

    for (key in overrides) {
        if (overrides.hasOwnProperty(key)) {
            result[key] = overrides[key];
        }
    }

    // internal use, force value
    result.currentSavedVersion = '0.0.0.0';

    return result;
}
