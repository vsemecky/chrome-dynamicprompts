// Generates a random prompt from a dynamic template.
// Supports {A|B|C} syntax with arbitrary nesting.
function generate(template) {
    let result = template;
    let prev;
    do {
        prev = result;
        result = result.replace(/\{([^{}]*)\}/g, (match, inner) => {
            const options = inner.split('|');
            return options[Math.floor(Math.random() * options.length)];
        });
    } while (result !== prev);
    return result;
}
