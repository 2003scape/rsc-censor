const FORCE_LOWERCASE = true;

const CHAR_CODES = {};

for (let i = 32; i < 127; i++) {
    CHAR_CODES[String.fromCharCode(i)] = i;
}

function toCharArray(s) {
    let a = new Uint16Array(s.length);

    for (let i = 0; i < s.length; i += 1) {
        a[i] = s.charCodeAt(i);
    }

    return a;
}

function fromCharArray(a) {
    return Array.from(a).map(c => String.fromCharCode(c)).join('');
}

function isNotLowerCase(c) {
    if (c < CHAR_CODES.a || c > CHAR_CODES.z) {
        return true;
    }

    return c === CHAR_CODES.v || c === CHAR_CODES.x || c === CHAR_CODES.j ||
        c === CHAR_CODES.q || c === CHAR_CODES.z;
}

function isLetter(c) {
    return c >= CHAR_CODES.a && c <= CHAR_CODES.z || c >= CHAR_CODES.A &&
        c <= CHAR_CODES.Z;
}

function isDigit(c) {
    return c >= CHAR_CODES[0] && c <= CHAR_CODES[9];
}

function isSpecial(c) {
    return !isLetter(c) && !isDigit(c);
}

function isLowerCase(c) {
    return c >= CHAR_CODES.a && c <= CHAR_CODES.z;
}

function isUpperCase(c) {
    return c >= CHAR_CODES.A && c <= CHAR_CODES.Z;
}

function getCharId(c) {
    if (c >= CHAR_CODES.a && c <= CHAR_CODES.z) {
        return c - 96;
    }

    if (c === CHAR_CODES['\'']) {
        return 28;
    }

    if (c >= CHAR_CODES[0] && c <= CHAR_CODES[9]) {
        return c - 19;
    }

    return 27;
}

function getAsteriskCount(input, input1, len) {
    if (len === 0) {
        return 2;
    }

    for (let j = len - 1; j >= 0; j--) {
        if (!isSpecial(input[j])) {
            break;
        }

        if (input[j] === CHAR_CODES[','] || input[j] === CHAR_CODES['.']) {
            return 3;
        }
    }

    let filtered = 0;

    for (let l = len - 1; l >= 0; l--) {
        if (!isSpecial(input1[l])) {
            break;
        }

        if (input1[l] === CHAR_CODES['*']) {
            filtered++;
        }
    }

    if (filtered >= 3) {
        return 4;
    }

    return isSpecial(input[len - 1]) ? 1 : 0;
}

function getAsteriskCount2(input, input1, len) {
    if ((len + 1) === input.length) {
        return 2;
    }

    for (let i = len + 1; i < input.length; i++) {
        if (!isSpecial(input[i])) {
            break;
        }

        if (input[i] === CHAR_CODES['\\'] || input[i] === CHAR_CODES['/']) {
            return 3;
        }
    }

    let filtered = 0;

    for (let i = len + 1; i < input.length; i++) {
        if (!isSpecial(input1[i])) {
            break;
        }

        if (input1[i] === CHAR_CODES['*']) {
            filtered++;
        }
    }

    if (filtered >= 5) {
        return 4;
    }

    return isSpecial(input[len + 1]) ? 1 : 0;
}

function stripLowerCase(input, output) {
    for (let i = 0; i < input.length; i++) {
        if (output[i] !== CHAR_CODES['*'] && isUpperCase(input[i])) {
            output[i] = input[i];
        }
    }
}

function toLowerCase(input) {
    let isUpper = true;

    for (let i = 0; i < input.length; i++) {
        let current = input[i];

        if (isLetter(current)) {
            if (isUpper) {
                if (isLowerCase(current)) {
                    isUpper = false;
                }
            } else if (isUpperCase(current)) {
                input[i] = ((current + 97) - 65);
            }
        } else {
            isUpper = true;
        }
    }
}

function wordToHash(word) {
    if (word.length > 6) {
        return 0;
    }

    let hash = 0;

    for (let i = 0; i < word.length; i++) {
        let c = word[word.length - i - 1];

        if (c >= CHAR_CODES.a && c <= CHAR_CODES.z) {
            hash = (hash * 38 + c - 96) | 0;
        } else if (c === CHAR_CODES['\'']) {
            hash = (hash * 38 + 27) | 0;
        } else if (c >= CHAR_CODES[0] && c <= CHAR_CODES[9]) {
            hash = (hash * 38 + c - 20) | 0;
        } else if (c !== 0) {
            return 0;
        }
    }

    return hash;
}

function charIdToChar(charId) {
    if (charId === 0) {
        return '?';
    } else if (charId === 28) {
        return '\'';
    }

    enc = String.fromCharCode(charId + 20);

    if (/0-9/.test(enc)) {
        return enc;
    }

    if (charId + 96 === 123) {
        return null;
    }

    return String.fromCharCode(charId + 96);
}

function hashToWord(hash) {
    let word = '';

    while (hash > 0 && word.length <= 6) {
        const id = hash % 38;

        if (id === 27) {
            word += '\'';
        } else {
            word += charIdToChar(id);
        }

        hash = (hash / 38) | 0;
    }

    return word;
}

function indexOfDigit(input, fromIndex) {
    for (let i = fromIndex; i < input.length && i >= 0; i++) {
        if (input[i] >= CHAR_CODES[0] && input[i] <= CHAR_CODES[9]) {
            return i;
        }
    }

    return -1;
}

function indexOfNonDigit(input, fromIndex) {
    for (let i = fromIndex; i < input.length && i >= 0; i++) {
        if (input[i] < CHAR_CODES[0] || input[i] > CHAR_CODES[9]) {
            return i;
        }
    }

    return input.length;
}

function compareCharIds(data, previous, current) {
    let first = 0;

    if (data[first][0] === previous && data[first][1] === current) {
        return true;
    }

    let last = data.length - 1;

    if (data[last][0] === previous && data[last][1] === current) {
        return true;
    }

    while (first !== last && (first + 1) !== last) {
        const middle = Math.floor((first + last) / 2);

        if (data[middle][0] === previous && data[middle][1] === current) {
            return true;
        }

        if (previous < data[middle][0] || previous === data[middle][0] &&
            current < data[middle][1]) {
            last = middle;
        } else {
            first = middle;
        }
    }

    return false;
}

function compareLettersSymbols(filterChar, currentChar, nextChar) {
    filterChar = String.fromCharCode(filterChar);
    currentChar = String.fromCharCode(currentChar);
    nextChar = String.fromCharCode(nextChar);

    if (filterChar === '*') {
        return 0;
    } else if (filterChar === currentChar) {
        return 1;
    } else if (filterChar >= 'a' && filterChar <= 'z') {
        if (filterChar === 'e') {
            return currentChar === '3' ? 1 : 0;
        } else if (filterChar === 't') {
            return currentChar === '7' ? 1 : 0;
        } else if (filterChar === 'a') {
            return currentChar === '4' || currentChar === '@' ? 1 : 0;
        } else if (filterChar === 'o') {
            if (currentChar === '0' || currentChar === '*') {
                return 1;
            }

            return currentChar === '(' && nextChar === ')' ? 2 : 0;
        } else if (filterChar === 'i') {
            return (
                currentChar === 'y' || currentChar === 'l' ||
                currentChar === 'j' || currentChar === 'l' ||
                currentChar === '!' || currentChar === ':' ||
                currentChar === ';' ? 1 : 0);
        } else if (filterChar === 'n') {
            return 0;
        } else if (filterChar === 's') {
            return (
                currentChar === '5' || currentChar === 'z' ||
                currentChar === '$' ? 1 : 0);
        } else if (filterChar === 'r') {
            return 0;
        } else if (filterChar === 'h') {
            return 0;
        } else if (filterChar === 'l') {
            return currentChar === '1' ? 1 : 0;
        } else if (filterChar === 'd') {
            return 0;
        } else if (filterChar === 'c') {
            return currentChar === '(' ? 1 : 0;
        } else if (filterChar === 'u') {
            return currentChar === 'v' ? 1 : 0;
        } else if (filterChar === 'm') {
            return 0;
        } else if (filterChar === 'f') {
            return currentChar === 'p' && nextChar === 'h' ? 2 : 0;
        } else if (filterChar === 'p') {
            return 0;
        } else if (filterChar === 'g') {
            return currentChar === '9' || currentChar === '6' ? 1 : 0;
        } else if (filterChar === 'w') {
            return currentChar === 'v' && nextChar === 'v' ? 2 : 0;
        } else if (filterChar === 'y') {
            return 0;
        } else if (filterChar === 'b') {
            return currentChar === '1' && nextChar === '3' ? 2 : 0;
        } else if (filterChar === 'v') {
            return 0;
        } else if (filterChar === 'k') {
            return 0;
        } else if (filterChar === 'x') {
            return currentChar === ')' && nextChar === '(' ? 2 : 0;
        } else if (filterChar === 'j') {
            return 0;
        } else if (filterChar === 'q') {
            return 0;
        } else if (filterChar === 'z') {
            return 0;
        }
    } else if (filterChar >= '0' && filterChar <= '9') {
        if (filterChar === '0') {
            if (currentChar === 'o' || currentChar === 'O') {
                return 1;
            }

            return currentChar === '(' && nextChar === ')' ? 2 : 0;
        } else if (filterChar === '1') {
            return currentChar !== 'l' ? 0 : 1;
        } else if (filterChar === '2') {
            return 0;
        } else if (filterChar === '3') {
            return 0;
        } else if (filterChar === '4') {
            return 0;
        } else if (filterChar === '5') {
            return 0;
        } else if (filterChar === '6') {
            return 0;
        } else if (filterChar === '7') {
            return 0;
        } else if (filterChar === '8') {
            return 0;
        } else if (filterChar === '9') {
            return 0;
        }
    } else if (filterChar === '-') {
        return 0;
    } else if (filterChar === ',') {
        return currentChar === '.' ? 1 : 0;
    } else if (filterChar === '.') {
        return currentChar === ',' ? 1 : 0;
    } else if (filterChar === '(') {
        return 0;
    } else if (filterChar === ')') {
        return 0;
    } else if (filterChar === '!') {
        return currentChar === 'i' ? 1 : 0;
    } else if (filterChar === '\'') {
        return 0;
    }

    return 0;
}

function compareLettersNumbers(filterChar, currentChar, nextChar) {
    filterChar = String.fromCharCode(filterChar);
    currentChar = String.fromCharCode(currentChar);
    nextChar = String.fromCharCode(nextChar);

    if (filterChar === currentChar) {
        return 1;
    } else if (filterChar === 'e' && currentChar === '3') {
        return 1;
    } else if (filterChar === 't' && (currentChar === '7' ||
        currentChar === '+')) {
        return 1;
    } else if (filterChar === 'a' && (currentChar === '4' ||
        currentChar === '@')) {
        return 1;
    } else if (filterChar === 'o' && currentChar === '0') {
        return 1;
    } else if (filterChar === 'i' && currentChar === '1') {
        return 1;
    } else if (filterChar === 's' && currentChar === '5') {
        return 1;
    } else if (filterChar === 'f' && currentChar === 'p' && nextChar === 'h') {
        return 2;
    }

    return filterChar === 'g' && currentChar === '9' ? 1 : 0;
}

class WordFilter {
    constructor(fragments, bad, host, tld) {
        this.loadBad(bad);
        this.loadHost(host);
        this.loadFragments(fragments);
        this.loadTld(tld);
    }

    loadTld(buffer) {
        const wordCount = buffer.getInt4() >>> 0;

        this.tldList = [];
        this.tldType = new Int32Array(wordCount);

        for (let i = 0; i < wordCount; i++) {
            this.tldType[i] = buffer.getUByte();

            const tld = new Uint16Array(buffer.getUByte());

            for (let j = 0; j < tld.length; j++) {
                tld[j] = buffer.getUByte();
            }

            this.tldList.push(tld);
        }
    }

    loadBad(buffer) {
        const wordCount = buffer.getInt4() >>> 0;

        this.badList = [];
        this.badList.length = wordCount;
        this.badList.fill(null);
        this.badCharIds = [];
        this.badCharIds.length = wordCount;
        this.badCharIds.fill(null);

        this.readBuffer(buffer, this.badList, this.badCharIds);
    }

    loadHost(buffer) {
        const wordCount = buffer.getInt4() >>> 0;

        this.hostList = [];
        this.hostList.length = wordCount;
        this.hostList.fill(null);
        this.hostCharIds = [];
        this.hostCharIds.length = wordCount;
        this.hostCharIds.fill(null);

        this.readBuffer(buffer, this.hostList, this.hostCharIds);
    }

    loadFragments(buffer) {
        this.hashFragments = new Int32Array(buffer.getInt4() >>> 0);

        for (let i = 0; i < this.hashFragments.length; i++) {
            this.hashFragments[i] = buffer.getUShort();
        }
    }

    readBuffer(buffer, wordList, charIds) {
        for (let i = 0; i < wordList.length; i++) {
            const currentWord = new Uint16Array(buffer.getUByte());

            for (let j = 0; j < currentWord.length; j++) {
                currentWord[j] = buffer.getUByte();
            }

            wordList[i] = currentWord;

            const ids = [];
            ids.length = buffer.getInt4() >>> 0;

            for (let j = 0; j < ids.length; j++) {
                ids[j] = [
                    (buffer.getUByte() & 0xff),
                    (buffer.getUByte() & 0xff)];
            }

            if (ids.length > 0) {
                charIds[i] = ids;
            }
        }
    }

    filter(input) {
        let inputChars = toCharArray(input.toLowerCase());

        this.applyDotSlashFilter(inputChars);
        this.applyBadWordFilter(inputChars);
        this.applyHostFilter(inputChars);
        this.filterDigits(inputChars);

        for (let i = 0; i < this.ignore.length; i++) {
            for (let j = -1;
                (j = input.indexOf(this.ignore[i], j + 1)) !== -1;) {
                let ignoreWordChars = toCharArray(this.ignore[i]);

                for (let k = 0; k < ignoreWordChars.length; k++) {
                    inputChars[k + j] = ignoreWordChars[k];
                }
            }
        }

        if (FORCE_LOWERCASE) {
            stripLowerCase(toCharArray(input), inputChars);
            toLowerCase(inputChars);
        }

        return fromCharArray(inputChars);
    }

    applyBadWordFilter(input) {
        for (let i = 0; i < 2; i++) {
            for (let j = this.badList.length - 1; j >= 0; j--) {
                this.applyWordFilter(
                    input, this.badList[j], this.badCharIds[j]);
            }
        }
    }

    applyHostFilter(input) {
        for (let i = this.hostList.length - 1; i >= 0; i--) {
            this.applyWordFilter(input, this.hostList[i], this.hostCharIds[i]);
        }
    }

    applyDotSlashFilter(input) {
        let input1 = input.slice();
        let dot = toCharArray('dot');
        this.applyWordFilter(input1, dot, null);

        let input2 = input.slice();
        let slash = toCharArray('slash');
        this.applyWordFilter(input2, slash, null);

        for (let i = 0; i < this.tldList.length; i++) {
            this.applyTldFilter(
                input, input1, input2, this.tldList[i], this.tldType[i]);
        }
    }

    applyTldFilter(input, input1, input2, tld, type) {
        if (tld.length > input.length) {
            return;
        }

        for (let i = 0; i <= input.length - tld.length; i++) {
            let inputCharCount = i;
            let l = 0;

            while (inputCharCount < input.length) {
                let i1 = 0;
                let current = input[inputCharCount];
                let next = 0;

                if (inputCharCount + 1 < input.length) {
                    next = input[inputCharCount + 1];
                }

                if (l < tld.length &&
                    (i1 = compareLettersNumbers(tld[l], current, next)) > 0) {
                    inputCharCount += i1;
                    l++;
                    continue;
                }

                if (l === 0) {
                    break;
                }

                if ((i1 = compareLettersNumbers(tld[l - 1], current, next)) > 0) {
                    inputCharCount += i1;
                    continue;
                }

                if (l >= tld.length || !isSpecial(current)) {
                    break;
                }

                inputCharCount++;
            }

            if (l >= tld.length) {
                let flag = false;
                let startMatch = getAsteriskCount(input, input1, i);
                let endMatch =
                    getAsteriskCount2(input, input2, inputCharCount - 1);

                if (type === 1 && startMatch > 0 && endMatch > 0) {
                    flag = true;
                }

                if (type === 2 &&
                    (startMatch > 2 && endMatch > 0 ||
                        startMatch > 0 && endMatch > 2)) {
                    flag = true;
                }

                if (type === 3 && startMatch > 0 && endMatch > 2) {
                    flag = true;
                }

                if (flag) {
                    let l1 = i;
                    let i2 = inputCharCount - 1;

                    if (startMatch > 2) {
                        if (startMatch === 4) {
                            let flag1 = false;

                            for (let k2 = l1 - 1; k2 >= 0; k2--) {
                                if (flag1) {
                                    if (input1[k2] !== CHAR_CODES['*']) {
                                        break;
                                    }

                                    l1 = k2;
                                } else if (input1[k2] === CHAR_CODES['*']) {
                                    l1 = k2;
                                    flag1 = true;
                                }
                            }
                        }

                        let flag2 = false;

                        for (let l2 = l1 - 1; l2 >= 0; l2--) {
                            if (flag2) {
                                if (isSpecial(input[l2])) {
                                    break;
                                }

                                l1 = l2;
                            } else if (!isSpecial(input[l2])) {
                                flag2 = true;
                                l1 = l2;
                            }
                        }
                    }

                    if (endMatch > 2) {
                        if (endMatch === 4) {
                            let flag3 = false;

                            for (let i3 = i2 + 1; i3 < input.length; i3++) {
                                if (flag3) {
                                    if (input2[i3] !== CHAR_CODES['*']) {
                                        break;
                                    }

                                    i2 = i3;
                                } else if (input2[i3] === CHAR_CODES['*']) {
                                    i2 = i3;
                                    flag3 = true;
                                }
                            }
                        }

                        let flag4 = false;

                        for (let j3 = i2 + 1; j3 < input.length; j3++) {
                            if (flag4) {
                                if (isSpecial(input[j3])) {
                                    break;
                                }

                                i2 = j3;
                            } else if (!isSpecial(input[j3])) {
                                flag4 = true;
                                i2 = j3;
                            }
                        }
                    }

                    for (let j2 = l1; j2 <= i2; j2++) {
                        input[j2] = CHAR_CODES['*'];
                    }
                }
            }
        }
    }

    applyWordFilter(input, word, charIds) {
        if (word.length > input.length) {
            return;
        }

        for (let i = 0; i <= input.length - word.length; i++) {
            let inputCharCount = i;
            let k = 0;
            let specialChar = false;

            while (inputCharCount < input.length) {
                let l = 0;
                let inputChar = input[inputCharCount];
                let nextChar = 0;

                if ((inputCharCount + 1) < input.length) {
                    nextChar = input[inputCharCount + 1];
                }

                if (k < word.length &&
                    (l = compareLettersSymbols(
                        word[k], inputChar, nextChar)) > 0) {
                    inputCharCount += l;
                    k++;
                    continue;
                }

                if (k === 0) {
                    break;
                }

                if ((l = compareLettersSymbols(
                    word[k - 1], inputChar, nextChar)) > 0) {
                    inputCharCount += l;
                    continue;
                }

                if (k >= word.length || !isNotLowerCase(inputChar)) {
                    break;
                }

                if (isSpecial(inputChar) && inputChar !== CHAR_CODES['\'']) {
                    specialChar = true;
                }

                inputCharCount++;
            }

            if (k >= word.length) {
                let filter = true;

                if (!specialChar) {
                    let prevChar = CHAR_CODES[' '];

                    if ((i - 1) >= 0) {
                        prevChar = input[i - 1];
                    }

                    let curChar = CHAR_CODES[' '];

                    if (inputCharCount < input.length) {
                        curChar = input[inputCharCount];
                    }

                    let prevId = getCharId(prevChar);
                    let curId = getCharId(curChar);

                    if (charIds && compareCharIds(charIds, prevId, curId)) {
                        filter = false;
                    }
                } else {
                    let flag2 = false;
                    let flag3 = false;

                    if ((i - 1) < 0 || isSpecial(input[i - 1]) &&
                        input[i - 1] !== CHAR_CODES['\'']) {
                        flag2 = true;
                    }

                    if (inputCharCount >= input.length ||
                        isSpecial(input[inputCharCount]) &&
                        input[inputCharCount] !== CHAR_CODES['\'']) {
                        flag3 = true;
                    }

                    if (!flag2 || !flag3) {
                        let flag4 = false;
                        let j1 = i - 2;

                        if (flag2) {
                            j1 = i;
                        }

                        for (; !flag4 && j1 < inputCharCount; j1++) {
                            if (j1 >= 0 && (!isSpecial(input[j1]) ||
                                input[j1] === CHAR_CODES['\''])) {
                                let ac2 = new Uint16Array(3);
                                let k1;

                                for (k1 = 0; k1 < 3; k1++) {
                                    if ((j1 + k1) >= input.length ||
                                        isSpecial(input[j1 + k1]) &&
                                        input[j1 + k1] !== CHAR_CODES['\'']) {
                                        break;
                                    }

                                    ac2[k1] = input[j1 + k1];
                                }

                                let flag5 = true;

                                if (k1 === 0) {
                                    flag5 = false;
                                }

                                if (k1 < 3 && j1 - 1 >= 0 &&
                                    (!isSpecial(input[j1 - 1]) ||
                                        input[j1 - 1] === CHAR_CODES['\''])) {
                                    flag5 = false;
                                }

                                if (flag5 &&
                                    !this.containsFragmentHashes(ac2)) {
                                    flag4 = true;
                                }
                            }
                        }

                        if (!flag4) {
                            filter = false;
                        }
                    }
                }

                if (filter) {
                    for (let j = i; j < inputCharCount; j++) {
                        input[j] = CHAR_CODES['*'];
                    }
                }
            }
        }
    }

    filterDigits(input) {
        let digitIndex = 0;
        let fromIndex = 0;
        let k = 0;
        let l = 0;

        while ((digitIndex = indexOfDigit(input, fromIndex)) !== -1) {
            let flag = false;

            for (let i = fromIndex; i >= 0 && i < digitIndex && !flag; i++) {
                if (!isSpecial(input[i]) && !isNotLowerCase(input[i])) {
                    flag = true;
                }
            }

            if (flag) {
                k = 0;
            }

            if (k === 0) {
                l = digitIndex;
            }

            fromIndex = indexOfNonDigit(input, digitIndex);

            let j1 = 0;

            for (let k1 = digitIndex; k1 < fromIndex; k1++) {
                j1 = (j1 * 10 + input[k1]) - 48;
            }

            if (j1 > 255 || fromIndex - digitIndex > 8) {
                k = 0;
            } else {
                k++;
            }

            if (k === 4) {
                for (let i = l; i < fromIndex; i++) {
                    input[i] = CHAR_CODES['*'];
                }

                k = 0;
            }
        }
    }

    containsFragmentHashes(input) {
        let notNum = true;

        for (let i = 0; i < input.length; i++) {
            if (!isDigit(input[i]) && input[i] !== 0) {
                notNum = false;
            }
        }

        if (notNum) {
            return true;
        }

        const inputHash = wordToHash(input);
        let first = 0;
        let last = this.hashFragments.length - 1;

        if (inputHash === this.hashFragments[first] ||
            inputHash === this.hashFragments[last]) {
            return true;
        }

        while (first !== last && first + 1 !== last) {
            const middle = Math.floor((first + last) / 2);

            if (inputHash === this.hashFragments[middle]) {
                return true;
            }

            if (inputHash < this.hashFragments[middle]) {
                last = middle;
            } else {
                first = middle;
            }
        }

        return false;
    }
}

module.exports = {
    WordFilter, fromCharArray, toCharArray, wordToHash, charIdToChar,
    getCharId, hashToWord };
