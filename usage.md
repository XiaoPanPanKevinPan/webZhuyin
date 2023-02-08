# How to import 如何匯入函式庫
此函式庫適用於有 ES6 支援之 JavaScript 執行環境。

若你在瀏覽器中的 `<script>` 嘗試匯入此函式庫，請加上 `type="module"`，如：
```html
	<script type="module">
		import ... // 參見下方
	</script>
```
。

常見的匯入方法：
1. 分項目匯入（須放在程式開始處）
```js
import {sliceText, parseZhuyin, rubyHTML, rubyCSS} from "./webZhuyin.js";

sliceText("你好"); // ['你', '好']

// 此時亦可重命名
import {sliceText as zySliceText, parseZhuyin as zyParse} from "./webZhuyin.js";

	zySliceText("早安"); // ['早', '安']
```

2. 作為一個物件匯入
```js
// way 1: 須在程式之始
import * as webZhuyin from "./webZhuyin.js";
webZhuyin.sliceText("你好"); // 回傳：['你', '好']

// way 2: 
import("./webZhuyin.js").then(webZhuyin=>{
	webZhuyin.sliceText("你好"); // 回傳：['你', '好']
});

// way 3: 執行環境須支援 ES2022 之 Top-level await
//        或者此段程式碼位於 async function 之中
	const webZhuyin = await import("./webZhuyin.js");
```

# `webZhuyin.js`

## 符號－聲調陣列
陣列，長度為 2，形如 `[symbol, tone]`。
- `symbol`: 字串，為注音的聲母、介音或韻母符號所組成。依預期，應如 `"ㄗㄠ"`、`"ㄢ"`、`"ㄚ"` 這類。
- `tone`: 字串，為聲調符號。依預期，應如 `"ˇ"`、`"ˉ`、`"ˉ"`。即，只該有 `ˉˊˇˋ˙˙˪˫ㆴㆵㆶㆷ` 其中任一個符號。

## sliceText() 
將給定字串`text`按字分離成陣列。`[`及`]`包夾處被視為一字，並保持在陣列內的同一個元素中。可在`[`, `]`及`\`之前加上`\`以避免他們被轉義。

### 語法
```js
sliceText(text);
```

### 參數
- `text`
	字串，為將被分析者，預設值為 ""。

### 回傳值
一個陣列，陣列中的子元素皆為字串。

### 範例
```js
sliceText("壬戌之秋"); // ['壬', '戌', '之', '秋']

// 使用方括號以保持文字（如，日後的動態組字）
sliceText("[⿰亻竒]歌而和之"); // ['⿰亻竒', '歌', '而', '和', '之']

// 使用反斜線避免字符被轉義
let text = "有書名曰\\[維基大典\\]";
console.log(text); // > 有書名曰\[維基大典\]
sliceText(text); // ['有', '書', '名', '曰', '[',  '維','基', '大', '典', ']']
```

## parseZhuyin()
將一串注音分割依音節分離成陣列，再將各音節分離成「注音符號」字串與「聲調」字串。可以選擇性地指定第一聲的符號。

### 語法
```js
parseZhuyin(zhuyin);
parseZhuyin(zhuyin, options);
```

### 參數
- `zhuyin`
	字串。此字串為一串注音，應呈現 `{注音}{空格}{注音}{空格}{注音}{空格}...{注音}` 之模式，``{注音}`處應呈 `{注音符號}{聲調符號}` 之形式，或以 `'` 作為佔位符。例如 `ㄗㄠˇ ㄢˉ ㄚˉ` 為一種。
- `options`（可不填）
	物件，用於設定注音的解析方式，預設值為 `{}`。可能包含下述選項：
	- `defaultTone`（可不填）
		字串，用於指定有注音符號而缺聲調符號時，自動加上的聲調。預設值為 "ˉ"。

### 回傳值
一個陣列，以多個 [符號－聲調陣列](#符號－聲調陣列) 為元素。譬如 `[ [ 'ㄗㄠ', 'ˇ' ], [ 'ㄢ', 'ˉ' ], [ 'ㄚ', 'ˉ' ] ]`。

### 詳細說明
從連續的空格、換行處（可交錯）切開，或聲調符號 `ˉˊˇˋ˙˙˪˫ㆴㆵㆶㆷ` 之後分開音節。接下來，從聲調符號之前，挨個音節被分成`[symb, tone]`（`symb` 為注音符號，`tone` 為聲調符號）。而如果`symb`是佔位符`"'"`，則換成空字串`""`；如果`tone`不存在而`symb`不是`""`，則`tone = defaultTone`。

### 範例
```
parseZhuyin("ㄔˉ ㄅㄚ˙"); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]
parseZhuyin("ㄔˉ ㄅㄚ˙ "); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ], [ '', '' ] ]
parseZhuyin("ㄔ ㄅㄚ˙"); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]
parseZhuyin("ㄔˉ ㄅㄚ", {defaultTone: "˙"}); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]

```

## habitualizeZhuyin()
將注音依照慣用法調整。

### 語法
```js
habitualizeZhuyin(zhuyin)
habitualizeZhuyin(zhuyin, options)
```

### 參數
- `zhuyin`
	陣列，由 [符號－聲調陣列]( #符號－聲調陣列 ) 為元素而組成。譬如 `[ [ 'ㄏㄠ', 'ˇ' ], [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]`。

- `options`（可不填）
	物件，用於設定習慣化的方式。預設值為 `{}`。可能包含下述選項：
	- `clearFirstTone`（可不填）
		布林值，預設為 `true`。`true` 則將所有 tone 中的 'ˉ' 替換成 ""。
	- `qinShengAsSymbolPrefix`（可不填）
		布林值，預設為 `true`。`true` 時，若 `tone` 之值為 '˙'，則將 `[symb, tone]` 變換（map，或稱映射）為 `[tone + symb, ""]`。
	- `symbolYiToHanziYi`（可不填）
		布林值，預設為 `false`。`true` 則將所有 symb 中的注音 'ㄧ' 替換成漢字 "一"。

### 回傳值
一個陣列，以多個 [符號－聲調陣列]( #符號－聲調陣列 ) 為元素。譬如 [ [ 'ㄏㄠ', 'ˇ' ], [ 'ㄔ', '' ], [ '˙ㄅㄚ', '' ] ]。

### 範例
```
wz.habitualizeZhuyin([[ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ]]);
	// [ [ 'ㄔ', '' ], [ '˙ㄅㄚ', '' ] ]
wz.habitualizeZhuyin([[ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ]], {qinShengAsSymbolPrefix: false});
	// [ [ 'ㄔ', '' ], [ 'ㄅㄚ', '˙' ] ]
wz.habitualizeZhuyin([[ 'ㄅㄧㄝ', 'ˊ' ]], {symbolYiToHanziYi: true});
	// [ [ 'ㄅ一ㄝ', 'ˊ' ] ]
```

## rubyHTML()
給定文字、注音，設定渲染模式（直書且注音在右、橫書且注音在上、橫書且注音在右），以產生 HTML。

### 語法
```js
```

#### 參數
- ``
	Some description.

#### 回傳值
Description.

### 範例
```js

```

##
Description. 

### 語法
```js
```

#### 參數
- ``
	Some description.

#### 回傳值
Description.

### 範例
```js

```

##
Description. 

### 語法
```js
```

#### 參數
- ``
	Some description.

#### 回傳值
Description.

### 範例
```js

```
