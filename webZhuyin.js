export function sliceText(text = "") {
	// e.g., text == "你好嗎" or "你好[嗎]"
	// use '[' and ']' to combine text, and a '\' to escape

	let unparsed = [...text], parsed = [];
		// the reason to create unparsed rather than directly use text is
		// doing so might break user-perceived unicode chars
		// refer: https://stackoverflow.com/questions/4547609/how-to-get-character-array-from-a-string/34717402#34717402
	let combine = false, tmp = "";

	for(let i = 0; i < unparsed.length; i++){
		if(!combine){
			if(unparsed[i] == '[') combine = true;
			else if(unparsed[i] == '\\') parsed.push(unparsed[++i] ?? "");
			else parsed.push(unparsed[i]);
		} else {
			if(unparsed[i] == ']') {
				combine = false;
				parsed.push(tmp);
				tmp = "";
			} else if(unparsed[i] == '\\') tmp += unparsed[++i] ?? "";
			else tmp += unparsed[i];
		}
	}
	if (tmp != "") parsed.push(tmp);

	return parsed;
	// ["你", "好", "嗎", ...]
}

export function parseZhuyin(zhuyin = "", {defaultTone = "ˉ"} = {}) {
	// zhuyin == "ㄋㄧˇ ㄏㄠˇ ㄇㄚ˙ " or "ㄋㄧˇㄏㄠˇㄇㄚ˙"
	return zhuyin
		.split(/[\ \n]+|(?<=[ˉˊˇˋ˙˪˫ㆴㆵㆶㆷ])/)
		.map(zhuyin => zhuyin.split(/(?=[ˉˊˇˋ˙˙˪˫ㆴㆵㆶㆷ])/))
		.map(([symb = "", tone = undefined]) => [
			symb == "'" ? "" : symb,
			tone != undefined ?
				tone :
				(symb != "'" && symb != "") ? defaultTone : ""
		]);
	// [["ㄋㄧ", "ˇ"], ["ㄏㄠ", "ˇ"], ["ㄇㄚ", "˙"], ...]
}

export function habitualizeZhuyin(
	zhuyin,
	{
		clearFirstTone = true,
		qinShengAsSymbolPrefix = true,
		symbolYiToHanziYi = false
	} = {}
){
	if(clearFirstTone)
		zhuyin = zhuyin.map(([symb, tone]) =>
			[symb, tone.replaceAll(/ˉ/g, "")]);
	if(qinShengAsSymbolPrefix)
		zhuyin = zhuyin.map(([symb, tone]) =>
			tone == "˙" ? ["˙" + symb, ""] : [symb, tone]
	);
	if(symbolYiToHanziYi)
		zhuyin = zhuyin.map(([symb, tone]) =>
			[symb.replaceAll(/ㄧ/g, "一"), tone]);
	return zhuyin;
}

export function rubyHTML(
	text = [],
	zhuyin = [],
	type = "horiRight",
	{
		withCSS = false,
		withFontFace = true,
		fontFor = "all",
		addCSS = "",

		addId = "",
		addClass = "",
		fallbackSymbol: {
			before: fsBef = "",
			after: fsAft = ""
		} = {},
		userSelectable = false
	} = {}
){
	if(["vert", "horiUp", "horiRight"].indexOf(type) == -1)
		throw `option.type == "${type}" 無效。此函數預期收到 "vert", "horiUp" 或 "horiRight" 作為輸出模式。`;

	text = text.map(x => x.replaceAll(/ /g, "&nbsp;"));
		// Firefox compatibility: a mere ' ' as the text to be annotated cause the
		// line extremely high

	let mainHTML = "",
		rpBef = !fsBef ? "" : `<rp>${fsBef}</rp>`,
		rpAft = !fsAft ? "" : `<rp>${fsAft}</rp>`;

	switch(type) {
		case "vert": {
			mainHTML += "<ruby>";
			for(let i = 0; i < text.length; i++) {
				let [symb = "", tone = ""] = zhuyin[i] ?? [];
				tone = tone.replaceAll(" ", "&nbsp;");
					// 不然 Chrome 會跑版
				let inRt = tone == "" ?
					`${symb}<span hidden>&nbsp;</span>` :
						// 如上，避免 Chrome 跑版
					`${symb}<span>${tone}</span>`;
				mainHTML += `${text[i]}${rpBef}<rt>${inRt}</rt>${rpAft}${fsAft}`;
			}
			mainHTML += "</ruby>";
		} break;

		case "horiUp": {
			mainHTML += "<ruby>";
			for(let i = 0; i < text.length; i++) {
				let [symb = "", tone = ""] = zhuyin[i] ?? [];
				let inRt = tone == "" ?
					`${symb}` :
					`${symb}<span>${tone}</span>`;
				mainHTML += `${text[i]}${rpBef}<rt>${inRt}</rt>${rpAft}${fsAft}`;
			}
			mainHTML += "</ruby>";
		}; break;

		case "horiRight": {
			for(let i = 0; i < text.length; i++) {
				let [symb = "", tone = ""] = zhuyin[i] ?? [];
				let inRt = `${symb}<span>${tone}</span>`;
				mainHTML += `<ruby>${text[i]}${rpBef}<rt>${inRt}</rt>${rpAft}${fsAft}</ruby>`;
			}
		}; break;
		default:
			throw "這個世界瘋了，怎麽有 type 可以通過前面的檢查？";
	}

	let containerClass = "";

	switch(type){
		case "vert":
			containerClass = "zhuyinVert";
			break;
		case "horiUp":
			containerClass = "zhuyinHoriUp";
			break;
		default:
		case "horiRight":
			containerClass = "zhuyinHoriRight";
			break;
	};

	let classAttr = `class="${containerClass} ${addClass} ${!userSelectable ? "rtUnselectable" : ""}"`,
		idAttr = addId ? `id="${addId}" ` : "",
	    styleElem =	!withCSS
			? ""
			: `<style>${rubyCSS(type, {addId, addClass, withFontFace, fontFor})}${addCSS}</style>`;

	return `<div ${idAttr}${classAttr}>${styleElem}${mainHTML}</div>`;
}

/*--- deal with CSS ---*/
export const fontFace = `
@font-face {
	font-family: "TW-MOE-Std-Kai";
	src:
		local("TW-MOE-Std-Kai"),
		url("https://gist.githubusercontent.com/XiaoPanPanKevinPan/e064a6ca6b35a964e0a927bf2f2ecc84/raw/fb85739e5a3906d2b99fa29f29349779e658b690/edukai-4.0.ttf") format("truetype");
	unicode-range: U+0000-FEFF;
		/*排除全形標點符號*/
}
@font-face {
	font-family: "TW-Kai";
	src: local("TW-Kai"), url("https://raw.githubusercontent.com/XiaoPanPanKevinPan/fontCollection/main/TW-Kai-98_1.ttf") format("truetype");
	unicode-range: U+0000-FFFF;
}
@font-face {
	font-family: "TW-Kai";
	src: local("TW-Kai-Ext-B"), url("https://raw.githubusercontent.com/XiaoPanPanKevinPan/fontCollection/main/TW-Kai-Ext-B-98_1.ttf") format("truetype");
	unicode-range: U+20000-2FFFF;
}
@font-face {
	font-family: "TW-Kai";
	src: local("TW-Kai-Plus"), url("https://github.com/XiaoPanPanKevinPan/fontCollection/blob/main/TW-Kai-Plus-98_1.ttf") format("truetype");
	unicode-range: U+F0000-FFFFF;
}
`;

export const fontFamily = `"TW-MOE-Std-Kai", "TW-Kai", "DFKai-SB", "BiauKai"`;
	/*教育部正楷體、全字庫正楷體、微軟標楷體、蘋果標楷體*/

const fontFamilyRule = `font-family: ${fontFamily};`

const vertCSS = ({queryPrefix, addCSS, fontFor, withFontFace})=> `
${withFontFace && fontFor != "none" ? fontFace : ""}

${queryPrefix}.zhuyinVert{
	writing-mode: vertical-rl;
	overflow: auto;
	width: 100%;
	max-height: 100%;

	box-sizing: border-box;

	/* 1 + ((1 - 2/9) * 2 + 1) * 0.3 ~= 1.8 */
	line-height: 1.8em;
	${fontFor == "all" ? fontFamilyRule : ""}

	padding-right: 0.25em;
}
${queryPrefix}.zhuyinVert ruby{
	ruby-position: over;
}
${queryPrefix}.zhuyinVert rt{
	writing-mode: vertical-lr;
	text-orientation: upright;

	${fontFor == "zhuyin" ? fontFamilyRule : ""}
	font-size: 0.3em;

	translate: calc((-1em + 2em / 9) + (1em / 9));
		/* this code is used to correct the weird behaviour of Chrome,
		   ( rt move right unintentionally as .tone is translated to the right)
		   and it has no effect in Firefox, fortunately. */
	margin-left: calc(0.5em + 1em / 9);
		/* Firefox Only - margin-left and -right doesn't work in Chrome */

	text-align: center;
	text-justify: none;
}
${queryPrefix}.zhuyinVert.rtUnselectable rt, ${queryPrefix}.zhuyinVert.rtUnselectable rp {
	user-select: none;
}
${queryPrefix}.zhuyinVert rt span:last-of-type{
	display: inline-block;
	height: 0;
	translate: calc(1em - 2em / 9) calc(-1em - 5em / 8 + 2em / 9);
		/* Fonts, by default, have set the tone symbols' size according to the standard (5/9) of zhuyin symbol.	(1 - 5/9) / 2 = 2/9 is the space around. */
	text-orientation: upright;
}`;

const horiUpCSS = ({queryPrefix, addCSS, fontFor, withFontFace})=> `
${withFontFace && fontFor != "none" ? fontFace : ""}

${queryPrefix}.zhuyinHoriUp {
	padding-top: 0.5em;
	box-sizing: border-box;
	${fontFor == "all" ? fontFamilyRule : ""}
}
${queryPrefix}.zhuyinHoriUp ruby {
	/* (1 + 5/9) * 0.3 ~= 1.5em, 與 .zhuyinVert 統一 => 1.8em */
	line-height: 1.8em;
}
${queryPrefix}.zhuyinHoriUp rt {
	${fontFor == "zhuyin" ? fontFamilyRule : ""};
	font-size: 0.3em;

	text-align: center;
	text-justify: none;

	/* Chrome Only - translate doesn't work in Firefox */
	translate: 0 calc(-1em / 9);
	/* Firefox Only - margin-top and -bottom doesn't work in Chrome */
	margin-bottom: 0 calc(-1em / 9);
}
${queryPrefix}.zhuyinHoriUp.rtUnselectable rt, ${queryPrefix}.zhuyinHoriUp.rtUnselectable rp {
	user-select: none;
}
${queryPrefix}.zhuyinHoriUp rt span:last-of-type {
	display: inline-block;
	width: 0px;
	translate: calc(-0.3em - 2em / 9) calc(-1em + 2em / 9);
}`;

const horiRightCSS = ({queryPrefix, addCSS, fontFor, withFontFace})=> `
${withFontFace && fontFor != "none" ? fontFace : ""}

${queryPrefix}.zhuyinHoriRight {
	${fontFor == "all" ? fontFamilyRule : ""}
	box-sizing: border-box;
}
${queryPrefix}.zhuyinHoriRight ruby{
	display: inline-block;
	line-height: 1.3;
		/*to create similar spacing as .zhuyinVert & .~HoriUp*/
}
${queryPrefix}.zhuyinHoriRight rt{
	display: inline-grid;
	vertical-align: middle;
	writing-mode: vertical-lr;
	text-orientation: upright;

	${fontFor == "zhuyin" ? fontFamilyRule : ""};
	font-size: 0.3em;

	width: calc(1em / 0.3 * 0.5);
	padding-left: calc(1em / 9);
}
${queryPrefix}.zhuyinHoriRight.rtUnselectable rt, ${queryPrefix}.zhuyinHoriRight.rtUnselectable rp {
	user-select: none;
}
${queryPrefix}.zhuyinHoriRight rt span:last-of-type {
	text-align: end;
	margin-bottom: calc(5em / 8 - 2em / 9);
	margin-left: calc(-2em / 9);
}`;

export function rubyCSS(type, {
	addId = "",
	addClass = "",
	fontFor = "all",
	withFontFace = true
} = {}){
	if(["all", "zhuyin", "none"].indexOf(fontFor) == -1)
		throw `option.fontFor == ${fontFor} 無效。此程式預期收到 "all", "zhuyin" 或 "none" 作為其值。`

	let shorten = x => x.replaceAll(/\n|\t/g, " ")
		.replaceAll(/\/\*.*?\*\//g, "")
		.replaceAll(/  +/g, " ")
		.replaceAll(/ ?{ ?/g, "{")
		.replaceAll(/ ?} ?/g, "}")
		.replaceAll(/ ?: ?/g, ":")
		.replaceAll(/ ?\; ?/g, ";");
	let queryPrefix = ""
		+ (!addId ? "" : `#${addId}`)
		+ (!addClass ? "" : `.${addClass.trim().replaceAll(/ +/, ".")}`);
	let	tmp = "",
		options = {
			queryPrefix,
			fontFor,
			withFontFace
		};

	switch(type){
		case "vert":
			tmp = vertCSS(options);
			break;

		case "horiUp":
			tmp = horiUpCSS(options);
			break;

		default:
		case "horiRight":
			tmp = horiRightCSS(options);
			break;
	}

	return shorten(tmp);
}
