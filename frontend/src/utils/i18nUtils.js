/**
 * Utility to format a string into a translation key (snake_case)
 * and attempt to translate it using i18next.
 * 
 * @param {string} text - The text to translate (e.g., "Direct Expense")
 * @param {function} t - The translation function from useTranslation
 * @param {string} namespace - Optional namespace (default: 'modules')
 * @returns {string} - The translated text or original text if no translation found
 */
export const translateDynamic = (text, t, namespace = 'modules') => {
    if (!text || typeof text !== 'string') return text;
    
    // Create a key: "Direct Expense" -> "direct_expense"
    // Also handle cases like "Sub-Group" -> "sub_group"
    const key = text.toLowerCase().trim().replace(/[- ]/g, '_');
    
    // Try to translate with the given namespace
    // We pass the original text as the second argument which acts as a fallback
    // i18next will return the fallback if the key is not found
    return t(`${namespace}:${key}`, text);
};
