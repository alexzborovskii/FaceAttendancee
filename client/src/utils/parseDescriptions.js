function unDoStringify(retrivedObj) {
    let decodedJson = JSON.parse(retrivedObj, function (key, value) {
        // function looks for the typed array flag
        try {
            if (value.flag && value.flag === "FLAG_TYPED_ARRAY") {
                // if found, we convert it back to a typed array
                const replacement = new Float32Array(value.data)
                return replacement;
            }
        } catch (e) {
            console.log(e)
        }

        // if flag not found no conversion is done
        return value;
    });
    return decodedJson;
}

module.exports = { unDoStringify };
