// Generates a random prompt from a dynamic template.
// Supports {A|B|C} syntax with arbitrary nesting and __wildcard__ syntax.
// wildcards: { name: ['value1', 'value2', ...] }
function generate(template, wildcards = {}) {
    let result = template;
    let prev;
    do {
        prev = result;
        result = result.replace(/\{([^{}]*)\}/g, (match, inner) => {
            const options = inner.split('|');
            return options[Math.floor(Math.random() * options.length)];
        });
        result = result.replace(/__([a-zA-Z0-9_-]+?)__/g, (match, name) => {
            const options = wildcards[name.toLowerCase()];
            if (!options || options.length === 0) return match;
            return options[Math.floor(Math.random() * options.length)];
        });
    } while (result !== prev);
    return result;
}
