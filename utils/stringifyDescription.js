const stringifyForEveryThing = (descriptions) => {
    let jsonStr = JSON.stringify(descriptions, function (key, value) {
        // the replacer function is looking for some typed arrays.
        // If found, it replaces it by a trio
        if (
            value instanceof Int8Array ||
            value instanceof Uint8Array ||
            value instanceof Uint8ClampedArray ||
            value instanceof Int16Array ||
            value instanceof Uint16Array ||
            value instanceof Int32Array ||
            value instanceof Uint32Array ||
            value instanceof Float32Array ||
            value instanceof Float64Array
        ) {
            var replacement = {
                constructor: value.constructor.name,
                data: Array.apply([], value),
                flag: "FLAG_TYPED_ARRAY",
            };
            return replacement;
        }
        return value;
    });

    return jsonStr;
};

module.exports ={ stringifyForEveryThing } ;