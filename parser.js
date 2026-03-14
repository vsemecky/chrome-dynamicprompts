// Generates a random prompt from a dynamic template.
// Supports:
//   {A|B|C}               — pick one randomly
//   {2$$A|B|C}            — pick exactly 2, join with ", "
//   {1-2$$A|B|C}          — pick 1 or 2, join with ", "
//   {-2$$A|B|C}           — pick 1 to 2 (lower bound defaults to 1)
//   {1-$$A|B|C}           — pick 1 to all (upper bound defaults to max)
//   {2$$ and $$A|B|C}     — pick 2, join with " and "
//   {1-2$$ and $$A|B|C}   — pick 1 or 2, join with " and "
//   __wildcard__          — random line from wildcards[name]
// wildcards: { name: ['value1', 'value2', ...] }
function generate(template, wildcards = {}) {
    let result = template;
    let prev;
    do {
        prev = result;
        result = result.replace(/\{([^{}]*)\}/g, (match, inner) => {
            return resolveVariant(inner);
        });
        result = result.replace(/__([a-zA-Z0-9_-]+?)__/g, (match, name) => {
            const options = wildcards[name.toLowerCase()];
            if (!options || options.length === 0) return match;
            return options[Math.floor(Math.random() * options.length)];
        });
    } while (result !== prev);
    return result;
}

function resolveVariant(inner) {
    const parts = inner.split('$$');
    const countStr = parts[0].trim();

    let min, max, separator, optionsStr;

    const rangeMatch = parts.length >= 2 && countStr.match(/^(\d*)-(\d*)$/);
    if (rangeMatch) {
        min = rangeMatch[1] ? parseInt(rangeMatch[1]) : 1;
        max = rangeMatch[2] ? parseInt(rangeMatch[2]) : null; // null = number of options
        separator = parts.length >= 3 ? parts[1] : ', ';
        optionsStr = parts[parts.length - 1];
    } else {
        const count = parseInt(countStr);
        if (!isNaN(count) && parts.length >= 2) {
            min = max = count;
            separator = parts.length >= 3 ? parts[1] : ', ';
            optionsStr = parts[parts.length - 1];
        } else {
            return pickRandom(inner.split('|'), 1, ', ');
        }
    }

    const options = optionsStr.split('|');
    const resolvedMax = Math.min(max !== null ? max : options.length, options.length);
    const resolvedMin = Math.min(min, resolvedMax);
    const count = resolvedMin + Math.floor(Math.random() * (resolvedMax - resolvedMin + 1));
    return pickRandom(options, count, separator);
}

function pickRandom(options, count, separator) {
    if (count === 1) {
        return options[Math.floor(Math.random() * options.length)];
    }
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, options.length)).join(separator);
}
