export function sliceText(text) {
	// use '[' and ']' to combine text, and a '\' to escape

	let parsed = [];
	let combine = false;

	for(let i = 0; i < text.length; i++){
		if(!combine){
			if(text[i] == '[') {
				combine = true;
				parsed.push(text[++i] ?? "");
			}else if(text[i] == '\\') parsed.push(text[++i] ?? "");
			else parsed.push(text[i]);
		} else {
			if(text[i] == ']') combine = false;
			else if(text[i] == '\\') parsed.push(parsed.pop() + (text[++i] ?? ""));
			else parsed.push(parsed.pop() + text[i]);
		}
	}
	return parsed;
	// ["你", "好", "嗎", ...]
}

export function parseZhuyin(zhuyin = "", {firstTone = "　"} = {}) {
	return zhuyin
		.split(/[\ \n]+|(?<=[ˉˊˇˋ˙])/)
		.map(zhuyin => zhuyin.split(/(?=[ˉˊˇˋ˙])/))
		.map(([symb = "", tone = "　"]) => [
			symb == "'" ? "" : symb,
			tone == 'ˉ' ? firstTone : tone
		]);
	// [["ㄋㄧ", "ˇ"], ["ㄏㄠ", "ˇ"], ["ㄇㄚ", "˙"], ...]
}

export function rubyHTML(
	origText = "",
	origZhuyin = "",
	type = "horiRight",
	{
		withCSS = false,
		addClass = "",
		addId = "",
		fallbackSymbol: {
			before: fsBef = "",
			after: fsAft = ""
		} = {}
	} = {}
){
	let text = sliceText(origText), zhuyin = parseZhuyin(origZhuyin);

	let mainHTML = "",
		rpBef = !fsBef ? "" : `<rp>${fsBef}</rp>`,
		rpAft = !fsAft ? "" : `<rp>${fsAft}</rp>`;

	for(let i = 0; i < text.length; i++) {
		let [symb = "", tone = ""] = zhuyin[i] ?? [];
		let inRt = !tone ? "" : tone == '˙' ? `˙${symb}` : `${symb}<span class="tone">${tone}</span>`;
		mainHTML += `${text[i]}${rpBef}<rt>${inRt}</rt>${rpAft}${fsAft}`;
	}

	let idAttr = addId ? `id="${addId}"` : "",
		styleElem = !withCSS ? "" : `<style>${rubyCSS(type, {addId, addClass})}</style>`;

	switch(type){
		case "vert":
			return `<div ${idAttr} class="zhuyinVertContainer ${addClass}"><ruby class="zhuyinVert">${styleElem}${mainHTML} </ruby></div>`

		case "horiUp":
			return `<ruby ${idAttr} class="zhuyinHoriUp ${addClass}">${styleElem}${mainHTML} </ruby>`

		default:
		case "horiRight":
			return `<ruby ${idAttr} class="zhuyinHoriRight ${addClass}">${styleElem}${mainHTML} </ruby>`
	};
	mainClass += ` ${addClass}`;

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

const horiUpCSS = (queryPrefix) => `${fontface}
${queryPrefix}.zhuyinHoriUp {
	line-height: 1.5em;
	font-family: "TW-Moe-Std-Kai";
}
${queryPrefix}.zhuyinHoriUp rt {
	font-size: 0.3em;
	text-justify: none;
	translate: 0 calc(-1em / 9);
	user-select: none;
}
${queryPrefix}.zhuyinHoriUp rt .tone {
	font-size: calc(5em / 9);

	display: inline-block;
	width: 0px;
	transform: translate(calc(-3em / 5), calc(-9em / 5));
}`;

const horiRightCSS = (queryPrefix) => `${fontface}
${queryPrefix}.zhuyinHoriRight {
	display: inline;
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

	user-select: none;
}
${queryPrefix}.zhuyinHoriRight rt .tone{
	font-size: calc(5em / 9);
	text-align: end;
	padding-bottom: calc(9em / 5 * (2 / 3));
}`;

const vertCSS = (queryPrefix)=> `${fontface}
${queryPrefix}.zhuyinVertContainer{
	writing-mode: vertical-rl
}
${queryPrefix} .zhuyinVert {
	ruby-position: over;
	font-family: "TW-Moe-Std-Kai";
}
${queryPrefix} .zhuyinVert rt{
	writing-mode: vertical-lr;
	text-orientation: upright;

	font-size: 0.3em;

	translate: calc(1em / 9);

	text-align: center;
	text-justify: none;

	user-select: none;
}
${queryPrefix} .zhuyinVert rt .tone{
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
			return shorten(vertCSS(queryPrefix));

		case "horiUp":
			return shorten(horiUpCSS(queryPrefix));

		default:
		case "horiRight":
			return shorten(horiRightCSS(queryPrefix));
	}
}
