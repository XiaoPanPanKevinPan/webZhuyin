const createInputEvents = (options) => ({
	beforeInput: new InputEvent("beforeinput", options),
	input: new InputEvent("input", options)
});

export function translator(e){
	// `e` should be an keydown event

	const orig = "1qaz2wsxedcrfv5tgbyhnujm8ik,9ol.0p;/-= 6347'",
	      symb = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ ˉˊˇˋ˙'";
	const loc = orig.indexOf(e.key);
	if(loc == -1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.code.match(/^Numpad.*/))
		return;
	e.preventDefault();

	// translate key to zhuyin symbols
	let newstr = "", t = e.target;

	newstr += symb[loc];
	if(" 6347'".indexOf(e.key) != -1) newstr += " ";

	// create input events
	const {beforeInput: eBeforeInput, input: eInput} =
		createInputEvents({
			inputType: "insertText",
			data: newstr,
			isComposing: false
		});

	// dispatch beforeinput event
	t.dispatchEvent(eBeforeInput);

	// insert text
	t.setRangeText(newstr, t.selectionStart, t.selectionEnd, "end");

	// dispatch input event
	t.dispatchEvent(eInput);

	return;
};

export function createZhuyinTextarea(){
	let elem = document.createElement("textarea");
	elem.addEventListener("keydown", translator);

	return elem;
}

