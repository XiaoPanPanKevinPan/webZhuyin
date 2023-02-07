export function sliceText(text="") {
	// e.g. text == "你好嗎" or "你好[嗎]"

	// use '[' and ']' to combine text, and a '\' to escape

	let parsed = [];
	let combine = false, tmp = "";

	for(let i = 0; i < text.length; i++){
		if(!combine){
			if(text[i] == '[') combine = true;
			else if(text[i] == '\\') parsed.push(text[++i] ?? "");
			else parsed.push(text[i]);
		} else {
			if(text[i] == ']') {
				combine = false;
				parsed.push(tmp);
				tmp = "";
			} else if(text[i] == '\\') tmp += text[++i] ?? "";
			else tmp += text[i];
		}
	}

	if (tmp != "") parsed.push(tmp);
	parsed = parsed.map(x => x.replaceAll(/ /g, "&nbsp;")); // Firefox compatibility
	return parsed;
	// ["你", "好", "嗎", ...]
}

export function parseZhuyin(zhuyin = "", {firstTone = "&nbsp;"} = {}) {
	// zhuyin == "ㄋㄧˇ ㄏㄠˇ ㄇㄚ˙ " or "ㄋㄧˇㄏㄠˇㄇㄚ˙"
	return zhuyin
		.split(/[\ \n]+|(?<=[ˉˊˇˋ˙])/)
		.map(zhuyin => zhuyin.split(/(?=[ˉˊˇˋ˙])/))
		.map(([symb = "", tone = "&nbsp;"]) => [
			symb == "'" ? "" : symb,
			tone == 'ˉ' ? firstTone : tone
		]);
	// [["ㄋㄧ", "ˇ"], ["ㄏㄠ", "ˇ"], ["ㄇㄚ", "˙"], ...]
}

export function rubyHTML(
	text = [],
	zhuyin = [],
	type = "horiRight",
	{
		withCSS = false,
		addClass = "",
		addId = "",
		fallbackSymbol: {
			before: fsBef = "",
			after: fsAft = ""
		} = {},
		userSelectable = false
	} = {}
){
	let mainHTML = "",
		rpBef = !fsBef ? "" : `<rp>${fsBef}</rp>`,
		rpAft = !fsAft ? "" : `<rp>${fsAft}</rp>`;

	if(type == "horiRight") {
		for(let i = 0; i < text.length; i++) {
			let [symb = "", tone = ""] = zhuyin[i] ?? [];
			let inRt = !tone ? "" : tone == '˙' ? `˙${symb}` : `${symb}<span class="tone">${tone}</span>`;
			mainHTML += `<ruby>${text[i]}${rpBef}<rt>${inRt}</rt>${rpAft}${fsAft}</ruby>`;
		}
	} else {
		mainHTML += "<ruby>"
		for(let i = 0; i < text.length; i++) {
			let [symb = "", tone = ""] = zhuyin[i] ?? [];
			let inRt = !tone ? "" : tone == '˙' ? `˙${symb}` : `${symb}<span class="tone">${tone}</span>`;
			mainHTML += `${text[i]}${rpBef}<rt>${inRt}</rt>${rpAft}${fsAft}`;
		}
		mainHTML += "</ruby>";
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
	let classAttr = `class="${containerClass} ${addClass} ${!userSelectable ? "rtUnselectable" : ""}"`;
	let idAttr = addId ? `id="${addId}"` : "",
	    styleElem = !withCSS ? "" : `<style>${rubyCSS(type, {addId, addClass})}</style>`;

	return `<div ${idAttr} ${classAttr}>${styleElem}${mainHTML}</div>`;
}

/*--- deal with CSS ---*/
const fontface = `@font-face {
	font-family: "TW-Moe-Std-Kai";
	src:
		local("TW-Moe-Std-Kai"),
		url("https://gist.githubusercontent.com/XiaoPanPanKevinPan/e064a6ca6b35a964e0a927bf2f2ecc84/raw/fb85739e5a3906d2b99fa29f29349779e658b690/edukai-4.0.ttf") format("truetype"),
			/* 教育部正楷體*/
		local("TW-Kai"),
			/* 全字庫正楷體*/
		local("DFKai-SB"),
			/* 微軟標楷體 */
		local("BiauKai")
			/* 蘋果標楷體 */
		;
}`;

const horiUpCSS = ({queryPrefix}) => `${fontface}
${queryPrefix}.zhuyinHoriUp {
	padding-top: 0.5em;
}
${queryPrefix}.zhuyinHoriUp ruby {
	line-height: 1.5em;
	font-family: "TW-Moe-Std-Kai";
}
${queryPrefix}.zhuyinHoriUp rt {
	font-size: 0.3em;

	text-align: center;
	text-justify: none;

	translate: 0 calc(-1em / 9);
}
${queryPrefix}.zhuyinHoriUp.rtUnselectable rt {
	user-select: none;
}
${queryPrefix}.zhuyinHoriUp rt .tone {
	font-size: calc(5em / 9);

	display: inline-block;
	width: 0px;
	transform: translate(calc(-3em / 5), calc(-9em / 5));
}`;

const horiRightCSS = ({queryPrefix}) => `${fontface}
${queryPrefix}.zhuyinHoriRight ruby{
	display: inline-block;
	font-family: "TW-Moe-Std-Kai";
}
${queryPrefix}.zhuyinHoriRight rt{
	display: inline-grid;
	vertical-align: middle;
	writing-mode: vertical-lr;
	text-orientation: upright;

	font-size: 0.3em;

	width: calc(1em / 0.3 * 0.5);
	padding-left: calc(1em / 9);
}
${queryPrefix}.zhuyinHoriRight.rtUnselectable rt {
	user-select: none;
}
${queryPrefix}.zhuyinHoriRight rt .tone{
	font-size: calc(5em / 9);
	text-align: end;
	padding-bottom: calc(9em / 5 * (2 / 3));
}`;

const vertCSS = ({queryPrefix})=> `${fontface}
${queryPrefix}.zhuyinVert{
	writing-mode: vertical-rl;
	overflow: auto;
	width: 100%;
	max-height: 100%;
}
${queryPrefix}.zhuyinVert ruby{
	ruby-position: over;
	font-family: "TW-Moe-Std-Kai";
}
${queryPrefix}.zhuyinVert rt{
	writing-mode: vertical-lr;
	text-orientation: upright;

	font-size: 0.3em;

	/*translate: calc(1em / 9); -- not working on Firefox and causing weird look on Chrome*/
	translate: calc(-1em + (1em / 9));
		/* this code is used to correct the weird behaviour of Chrome,
		   ( rt move right unintentionally as .tone is translated to the right)
		   and it has no effect in Firefox, fortunately. */

	text-align: center;
	text-justify: none;
}
${queryPrefix}.zhuyinVert.rtUnselectable rt {
	user-select: none;
}
${queryPrefix}.zhuyinVert rt .tone{
	font-size: calc(5em / 9);
	display: inline-block;
	height: 0;
	translate: calc(9em / 5 * 1) -2em;
	text-orientation: upright;
}`;

export function rubyCSS(type, {addId = "", addClass = ""} = {}){
	let shorten = x => x.replaceAll(/\n|\t/g, " ").replaceAll(/\/\*.*?\*\//g, "").replaceAll(/  +/g, " ");
	let queryPrefix = ""
		+ (!addId ? "" : `#${addId}`)
		+ (!addClass ? "" : `.${addClass.trim().replaceAll(/ +/, ".")}`);
	switch(type){
		case "vert":
			return shorten(vertCSS({queryPrefix}));

		case "horiUp":
			return shorten(horiUpCSS({queryPrefix}));

		default:
		case "horiRight":
			return shorten(horiRightCSS({queryPrefix}));
	}
}
