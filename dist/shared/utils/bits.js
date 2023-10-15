"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 
var bits;
(function (bits_1) {
    class array {
        _buffer;
        // 
        constructor(buffer) {
            this._buffer = buffer instanceof Buffer ? buffer : buffer instanceof array ? buffer.buffer : Buffer.from([]);
            // 
            return new Proxy(this, {
                get: (target, property, reciever) => {
                    if (property.toString().match(/^([0-9])+$/g)) {
                        const index = parseInt(property.toString());
                        const bit_byte_index = Math.floor(index / 8);
                        const bit_index_in_byte = index % 8;
                        // console.log(bit_byte_index, bit_index_in_byte);
                        const byte_ = 0b100000000 + this.buffer[bit_byte_index];
                        const bit = bits.slice(byte_, bit_index_in_byte + 1, bit_index_in_byte + 2);
                        return bit;
                    }
                    else {
                        return this[property];
                    }
                },
                set: (target, property, value, reciever) => {
                    if (property.toString().match(/^([0-9])+$/g)) {
                        const index = parseInt(property.toString());
                    }
                    else {
                        this[property] = value;
                    }
                    return true;
                }
            });
        }
        // 
        get buffer() { return this._buffer; }
    }
    bits_1.array = array;
    // 
    function length(unsigned) {
        return unsigned === 0 ? 0 : Math.floor(Math.log(unsigned) / Math.log(2)) + 1;
    }
    bits_1.length = length;
    function slice(unsigned, start = 0, end = length(unsigned)) {
        const bitlength = length(unsigned);
        const a = unsigned >> (bitlength - (1 + end - 1));
        const b = unsigned >> (bitlength - (1 + end - 1)) >> (end - start) << (end - start);
        return a ^ b;
    }
    bits_1.slice = slice;
    function from(unsigneds, unsignedlength = -1) {
        let result = [];
        // 
        for (let n_index = 0; n_index < unsigneds.length; ++n_index) {
            const n = unsigneds[n_index];
            const bitlength = length(n);
            for (let i = 0; i < Math.min(unsignedlength, unsignedlength - bitlength); ++i)
                result.push(0);
            for (let i = 0; i < bitlength; ++i)
                result.push(bits.slice(n, i, i + 1));
        }
        // 
        return result;
    }
    bits_1.from = from;
    function to(bits, unsignedlength = -1) {
        if (unsignedlength > 0 && bits.length % unsignedlength != 0)
            throw new Error("bit count not compatible with unsigned length.");
        // 
        let unsigneds = [];
        // 
        let m = unsignedlength > 0 ? unsignedlength : 1;
        let unsigned = 0b1;
        let i;
        for (i = 0; i < bits.length; ++i) {
            if (i % m == 0) {
                if (i != 0) {
                    unsigned = unsigned ^ (0b1 << (m));
                    unsigneds.push(unsigned);
                }
                unsigned = 0b1;
            }
            unsigned = (unsigned << 1) | bits[i];
        }
        if (i !== 0) {
            unsigned = unsigned ^ (0b1 << (m));
            unsigneds.push(unsigned);
        }
        // 
        return unsigneds;
    }
    bits_1.to = to;
})(bits || (bits = {}));
exports.default = bits;
