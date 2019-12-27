const JagBuffer = require('@2003scape/rsc-archiver/src/jag-buffer');

const {
    WordFilter, toCharArray, fromCharArray, wordToHash, hashToWord,
    charIdToChar, getCharId
} = require('./word-filter');

const { JagArchive } = require('@2003scape/rsc-archiver');

function parseIgnore(ignore) {
    if (!ignore) {
        return null;
    }

    return ignore.map(charIds => {
        return {
            prefix: charIdToChar(charIds[0]),
            postfix: charIdToChar(charIds[1]),
        };
    });
}

function encodeWordBuffer(words) {
    const wordBuffers = [];

    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(words.length, 0);

    wordBuffers.push(lengthBuffer);

    for (const { word, ignore } of words) {
        const wordBuffer = Buffer.alloc(word.length + 5);
        wordBuffer[0] = word.length;
        wordBuffer.write(word, 1);
        wordBuffer.writeUInt32BE(ignore ? ignore.length : 0,
            word.length + 1);
        wordBuffers.push(wordBuffer);

        if (ignore && ignore.length) {
            const ignoreBuffer = Buffer.alloc(ignore.length * 2);

            let offset = 0;

            for (let { prefix, postfix } of ignore) {
                if (prefix) {
                    prefix = prefix.charCodeAt(0);
                }

                if (postfix) {
                    postfix = postfix.charCodeAt(0);
                }

                ignoreBuffer[offset] = getCharId(prefix);
                ignoreBuffer[offset + 1] = getCharId(postfix);
                offset += 2;
            }

            wordBuffers.push(ignoreBuffer);
        }
    }

    return Buffer.concat(wordBuffers);
}

class Censor {
    constructor() {
        this.fragments = [];
        this.badWords = [];
        this.hosts = [];
        this.tlds = [];
        this.ignore = ['cook', 'cook\'s', 'cooks', 'seeks', 'sheet'];
    }

    loadArchive(buffer) {
        const archive = new JagArchive();
        archive.readArchive(buffer);

        this.fragmentsBuffer = new JagBuffer(
            archive.getEntry('fragmentsenc.txt'));
        this.badWordsBuffer = new JagBuffer(archive.getEntry('badenc.txt'));
        this.hostsBuffer = new JagBuffer(archive.getEntry('hostenc.txt'));
        this.tldsBuffer = new JagBuffer(archive.getEntry('tldlist.txt'));

        this.parseBuffers();
    }

    parseBuffers() {
        this.wordFilter = new WordFilter(
            this.fragmentsBuffer,
            this.badWordsBuffer,
            this.hostsBuffer,
            this.tldsBuffer);

        this.wordFilter.ignore = this.ignore;

        this.badWords = [];

        for (let i = 0; i < this.wordFilter.badList.length; i+= 1) {
            const word = fromCharArray(this.wordFilter.badList[i]);
            const ignore = parseIgnore(this.wordFilter.badCharIds[i]);
            this.badWords.push({ word, ignore });
        }

        this.hosts = [];

        for (let i = 0; i < this.wordFilter.hostList.length; i+= 1) {
            const word = fromCharArray(this.wordFilter.hostList[i]);
            const ignore = parseIgnore(this.wordFilter.hostCharIds[i]);
            this.hosts.push({ word, ignore });
        }

        this.tlds = [];

        for (let i = 0; i < this.wordFilter.tldList.length; i+= 1) {
            const word = fromCharArray(this.wordFilter.tldList[i]);
            const type = this.wordFilter.tldType[i];
            this.tlds.push({ word, type });
        }

        this.fragments = Array.from(this.wordFilter.hashFragments)
            .map(hashToWord);
    }

    toFragmentsEnc() {
        const fragmentBuffer = Buffer.alloc(4 + (2 * this.fragments.length));
        fragmentBuffer.writeUInt32BE(this.fragments.length);

        let offset = 4;

        for (const fragment of this.fragments) {
            const hash = wordToHash(toCharArray(fragment));
            fragmentBuffer.writeUInt16BE(hash, offset);
            offset += 2;
        }

        return fragmentBuffer;
    }

    toBadEnc() {
        return encodeWordBuffer(this.badWords);
    }

    toHostEnc() {
        return encodeWordBuffer(this.hosts);
    }

    toTldListEnc() {
        const tldBuffers = [];

        const lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32BE(this.tlds.length, 0);
        tldBuffers.push(lengthBuffer);

        for (const { word, type } of this.tlds) {
            const tldBuffer = Buffer.alloc(2 + word.length);
            tldBuffer[0] = type;
            tldBuffer[1] = word.length;
            tldBuffer.write(word, 2);
            tldBuffers.push(tldBuffer);
        }

        return Buffer.concat(tldBuffers);
    }

    populateBuffers() {
        this.fragmentsBuffer = new JagBuffer(this.toFragmentsEnc());
        this.badWordsBuffer = new JagBuffer(this.toBadEnc());
        this.hostsBuffer = new JagBuffer(this.toHostEnc());
        this.tldsBuffer = new JagBuffer(this.toTldListEnc());

        this.wordFilter = new WordFilter(
            this.fragmentsBuffer,
            this.badWordsBuffer,
            this.hostsBuffer,
            this.tldsBuffer);

        this.wordFilter.ignore = this.ignore;
    }

    censorMessage(message) {
        return this.wordFilter.filter(message);
    }

    toString() {
        return `[object Censor (${this.badWords.length} badWords, ` +
            `${this.hosts.length} hosts, ${this.tlds.length} TLDs, ` +
            `${this.fragments.length} fragments)]`;
    }

    toArchive() {
        const archive = new JagArchive();

        archive.putEntry('fragmentsenc.txt', this.fragmentsBuffer.data);
        archive.putEntry('badenc.txt', this.badWordsBuffer.data);
        archive.putEntry('hostenc.txt', this.hostsBuffer.data);
        archive.putEntry('tldlist.txt', this.tldsBuffer.data);

        return archive.toArchive(false);
    }
}

module.exports = Censor;
