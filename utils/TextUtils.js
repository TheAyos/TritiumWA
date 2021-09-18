class Text {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    static scriptify(text) {
        /* prettier-ignore */
        const map = { 0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫", a: "𝒶", b: "𝒷", c: "𝒸", d: "𝒹", e: "𝑒", f: "𝒻", g: "𝑔", h: "𝒽", i: "𝒾", j: "𝒿", k: "𝓀", l: "𝓁", m: "𝓂", n: "𝓃", o: "𝑜", p: "𝓅", q: "𝓆", r: "𝓇", s: "𝓈", t: "𝓉", u: "𝓊", v: "𝓋", w: "𝓌", x: "𝓍", y: "𝓎", z: "𝓏", A: "𝒜", B: "𝐵", C: "𝒞", D: "𝒟", E: "𝐸", F: "𝐹", G: "𝒢", H: "𝐻", I: "𝐼", J: "𝒥", K: "𝒦", L: "𝐿", M: "𝑀", N: "𝒩", O: "𝒪", P: "𝒫", Q: "𝒬", R: "𝑅", S: "𝒮", T: "𝒯", U: "𝒰", V: "𝒱", W: "𝒲", X: "𝒳", Y: "𝒴", Z: "𝒵" };
        return applyCharMap(map, text);
    }

    static superScriptify(text) {
        /* prettier-ignore */
        const map = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ", q: "q", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ", A: "ᴬ", B: "ᴮ", C: "ᶜ", D: "ᴰ", E: "ᴱ", F: "ᶠ", G: "ᴳ", H: "ᴴ", I: "ᴵ", J: "ᴶ", K: "ᴷ", L: "ᴸ", M: "ᴹ", N: "ᴺ", O: "ᴼ", P: "ᴾ", Q: "Q", R: "ᴿ", S: "ˢ", T: "ᵀ", U: "ᵁ", V: "ⱽ", W: "ᵂ", X: "ˣ", Y: "ʸ", Z: "ᶻ", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾" };
        return applyCharMap(map, text);
    }

    static underline(text, double = false) {
        return double ? text.split('').join('̳') + '̳' : text.split('').join('̲') + '̲';
    }

    static uppercase(text) {
        return text
            .split('')
            .map((c, i) => (i % 2 ? c.toUpperCase() : c))
            .join('');
    }

    static vaporwave(text) {
        return text
            .split('')
            .map((c) => (c.charCodeAt(0) >= 33 && c.charCodeAt(0) <= 126 ? String.fromCharCode(c.charCodeAt(0) - 33 + 65281) : c))
            .join('');
    }

    static vaporwaveText(text) {
        /* prettier-ignore */
        const map = { " ": "　", "`": "`", 1: "１", 2: "２", 3: "３", 4: "４", 5: "５", 6: "６", 7: "７", 8: "８", 9: "９", 0: "０", "-": "－", "=": "＝", "~": "~", "!": "！", "@": "＠", "#": "＃", $: "＄", "%": "％", "^": "^", "&": "＆", "*": "＊", "(": "（", ")": "）", _: "_", "+": "＋", q: "ｑ", w: "ｗ", e: "ｅ", r: "ｒ", t: "ｔ", y: "ｙ", u: "ｕ", i: "ｉ", o: "ｏ", p: "ｐ", "[": "[", "]": "]", "\\": "\\", Q: "Ｑ", W: "Ｗ", E: "Ｅ", R: "Ｒ", T: "Ｔ", Y: "Ｙ", U: "Ｕ", I: "Ｉ", O: "Ｏ", P: "Ｐ", "{": "{", "}": "}", "|": "|", a: "ａ", s: "ｓ", d: "ｄ", f: "ｆ", g: "ｇ", h: "ｈ", j: "ｊ", k: "ｋ", l: "ｌ", ";": "；", "'": "＇", A: "Ａ", S: "Ｓ", D: "Ｄ", F: "Ｆ", G: "Ｇ", H: "Ｈ", J: "Ｊ", K: "Ｋ", L: "Ｌ", ":": "：", '"': '"', z: "ｚ", x: "ｘ", c: "ｃ", v: "ｖ", b: "ｂ", n: "ｎ", m: "ｍ", ",": "，", ".": "．", "/": "／", Z: "Ｚ", X: "Ｘ", C: "Ｃ", V: "Ｖ", B: "Ｂ", N: "Ｎ", M: "Ｍ", "<": "<", ">": ">", "?": "？",  };

        const numSpaces = text.split(' ').length;
        text = applyCharMap(map, text);
        let asianChars = getAsianChars(Math.max(3, numSpaces));
        if (numSpaces > 6)
            asianChars = asianChars
                .split('')
                .map((c) => c + ['', '　'][Math.round(Math.random() * 0.6)])
                .join('');
        const outputs = [];
        outputs.push(text + '　' + asianChars);
        outputs.push(
            text
                .replace(/　/g, '░')
                .replace(/ａｅ/, 'æ')
                .replace(/Ａ/g, 'Λ')
                .replace(/Ｅ/g, function () {
                    return Math.random() > 0.5 ? 'Ξ' : 'Σ';
                })
                .replace(/Ｏ/g, '♢') +
                '　（' +
                asianChars +
                '）',
        );
        return outputs.join('\n\n');
    }

    static frame(text) {
        return '【' + text + '】';
    }

    static sparkles(text) {
        return '˜”*°•.˜”*°• ' + text + ' •°*”˜.•°*”˜';
    }

    static kirbyHug(text) {
        return '(っ◔◡◔)っ ♥ ' + text + ' ♥';
    }

    static firework(text) {
        return text.split('').join('҉') + '҉';
    }

    static flourish(text) {
        /* prettier-ignore */
        const flourishArray = [ '★·.·´¯`·.·★ [[text]] ★·.·´¯`·.·★', '▁ ▂ ▄ ▅ ▆ ▇ █ [[text]] █ ▇ ▆ ▅ ▄ ▂ ▁', '°°°·.°·..·°¯°·._.· [[text]] ·._.·°¯°·.·° .·°°°', '¸,ø¤º°`°º¤ø,¸¸,ø¤º° [[text]] °º¤ø,¸¸,ø¤º°`°º¤ø,¸', 'ıllıllı [[text]] ıllıllı', '•?((¯°·._.• [[text]] •._.·°¯))؟•', '▌│█║▌║▌║ [[text]] ║▌║▌║█│▌', '×º°”˜`”°º× [[text]] ×º°”˜`”°º×', '•]••´º´•» [[text]] «•´º´••[•', '*•.¸♡ [[text]] ♡¸.•*', '╰☆☆ [[text]] ☆☆╮', '.•°¤*(¯`★´¯)*¤° [[text]] °¤*(¯´★`¯)*¤°•.', '(¯´•._.• [[text]] •._.•´¯)', '¸„.-•~¹°”ˆ˜¨ [[text]] ¨˜ˆ”°¹~•-.„¸', '░▒▓█ [[text]] █▓▒░', '░▒▓█►─═  [[text]] ═─◄█▓▒░', '★彡 [[text]] 彡★', '•´¯`•. [[text]] .•´¯`•', "§.•´¨'°÷•..× [[text]] ×,.•´¨'°÷•..§", '•°¯`•• [[text]] ••´¯°•', '(¯`*•.¸,¤°´✿.｡.:* [[text]] *.:｡.✿`°¤,¸.•*´¯)', "|!¤*'~``~'*¤!| [[text]] |!¤*'~``~'*¤!|", '•._.••´¯``•.¸¸.•` [[text]] `•.¸¸.•´´¯`••._.•', '¸„.-•~¹°”ˆ˜¨ [[text]] ¨˜ˆ”°¹~•-.„¸', '(¯´•._.• [[text]] •._.•´¯)', '••¤(`×[¤ [[text]] ¤]×´)¤••', '•´¯`•» [[text]] «•´¯`•', ' .o0×X×0o. [[text]] .o0×X×0o.', '¤¸¸.•´¯`•¸¸.•..>> [[text]] <<..•.¸¸•´¯`•.¸¸¤', '—(••÷[ [[text]] ]÷••)—', '¸,ø¤º°`°º¤ø,¸ [[text]] ¸,ø¤º°`°º¤ø,¸', '`•.¸¸.•´´¯`••._.• [[text]] •._.••`¯´´•.¸¸.•`', ",-*' ^ '~*-.,_,.-*~ [[text]] ~*-.,_,.-*~' ^ '*-,", '`•.,¸¸,.•´¯ [[text]] ¯`•.,¸¸,.•´', '↤↤↤↤↤ [[text]] ↦↦↦↦↦', '➶➶➶➶➶ [[text]] ➷➷➷➷➷', '↫↫↫↫↫ [[text]] ↬↬↬↬↬', '·.¸¸.·♩♪♫ [[text]] ♫♪♩·.¸¸.·', '【｡_｡】 [[text]] 【｡_｡】', ']|I{•------» [[text]] «------•}I|[', '▀▄▀▄▀▄ [[text]] ▄▀▄▀▄▀', '(-_-) [[text]] (-_-)', '•´¯`•. [[text]] .•´¯`•', "-漫~*'¨¯¨'*·舞~ [[text]] ~舞*'¨¯¨'*·~漫-", '๑۞๑,¸¸,ø¤º°`°๑۩ [[text]] ๑۩ ,¸¸,ø¤º°`°๑۞๑', '.•°¤*(¯`★´¯)*¤° [[text]] °¤*(¯´★`¯)*¤°•.', '••.•´¯`•.•• [[text]] ••.•´¯`•.••', '¤¸¸.•´¯`•¸¸.•..>> [[text]] <<..•.¸¸•´¯`•.¸¸¤', '◦•●◉✿ [[text]] ✿◉●•◦', '╚»★«╝ [[text]] ╚»★«╝', '-·=»‡«=·- [[text]] -·=»‡«=·-', '∙∙·▫▫ᵒᴼᵒ▫ₒₒ▫ᵒᴼᵒ▫ₒₒ▫ᵒᴼᵒ [[text]] ᵒᴼᵒ▫ₒₒ▫ᵒᴼᵒ▫ₒₒ▫ᵒᴼᵒ▫▫·∙∙', '¸¸♬·¯·♩¸¸♪·¯·♫¸¸ [[text]] ¸¸♫·¯·♪¸¸♩·¯·♬¸¸', 'ஜ۩۞۩ஜ [[text]] ஜ۩۞۩ஜ', '¤ (¯´☆✭.¸_)¤ [[text]] ¤(_¸.✭☆´¯) ¤', '(¯`·.¸¸.·´¯`·.¸¸.-> [[text]] <-.¸¸.·´¯`·.¸¸.·´¯)', '✿.｡.:* ☆:**:. [[text]] .:**:.☆*.:｡.✿', '.•♫•♬• [[text]] •♬•♫•.', 'ღ(¯`◕‿◕´¯) ♫ ♪ ♫ [[text]] ♫ ♪ ♫ (¯`◕‿◕´¯)ღ', '«-(¯`v´¯)-« [[text]] »-(¯`v´¯)-»'];
        return flourishArray[Math.floor(Math.random() * flourishArray.length)].replace('[[text]]', text);
    }

    static futureGlyphs(text) {
        /* prettier-ignore */
        const futureAlienCharMap = { 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", a: "ᗩ", b: "ᗷ", c: "ᑢ", d: "ᕲ", e: "ᘿ", f: "ᖴ", g: "ᘜ", h: "ᕼ", i: "ᓰ", j: "ᒚ", k: "ᖽᐸ", l: "ᒪ", m: "ᘻ", n: "ᘉ", o: "ᓍ", p: "ᕵ", q: "ᕴ", r: "ᖇ", s: "S", t: "ᖶ", u: "ᑘ", v: "ᐺ", w: "ᘺ", x: "᙭", y: "ᖻ", z: "ᗱ", A: "ᗩ", B: "ᗷ", C: "ᑢ", D: "ᕲ", E: "ᘿ", F: "ᖴ", G: "ᘜ", H: "ᕼ", I: "ᓰ", J: "ᒚ", K: "ᖽᐸ", L: "ᒪ", M: "ᘻ", N: "ᘉ", O: "ᓍ", P: "ᕵ", Q: "ᕴ", R: "ᖇ", S: "S", T: "ᖶ", U: "ᑘ", V: "ᐺ", W: "ᘺ", X: "᙭", Y: "ᖻ", Z: "ᗱ"};
        return applyCharMap(futureAlienCharMap, text);
    }
}

module.exports = Text;

function applyCharMap(map, text) {
    let out = '';
    for (const c of text.split('')) {
        if (map[c] !== undefined) out += map[c];
        else if (map[c.toLowerCase()] !== undefined) out += map[c.toLowerCase()];
        else out += c;
    }
    return out;
}

function getAsianChars(n) {
    if (!n) n = 1;
    /* prettier-ignore */
    const chars = "リサフランク現代のコンピュ竹内 まりや若者が履く流行のスニーカー真夜中のドアホットドッグマスターストライカーソニーブギ新しい日の誕生ライフ - ヒスイ蒸気波 無線゠ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺ・ーヽヾヿぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ゙゚゛゜ゝゞゟ亜哀挨愛曖悪握圧扱宛嵐安案暗以衣位囲医依委威為畏胃尉異移萎偉椅彙意違維慰遺緯域育壱逸茨芋引印因咽姻員院淫陰飲隠韻右宇羽雨唄鬱畝浦運雲永泳英映栄営詠影鋭衛易疫益液駅悦越謁閲円延沿炎怨宴媛援園煙猿遠鉛塩演縁艶汚王凹央応往押旺欧殴桜翁奥横岡屋億憶臆虞乙俺卸音恩温穏下化火加可仮何花佳価果河苛科";
    let str = '';
    for (let i = 0; i < n; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
