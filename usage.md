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

// 懶惰一點，全部匯入
import * from "./webZhuyin.js"

sliceText("你好");
```

2. 作為一個物件匯入
```js
// way 1: 須在程式之始
import * as wz from "./webZhuyin.js";
wz.sliceText("你好"); // 回傳：['你', '好']

// way 2: 
import("./webZhuyin.js").then(webZhuyin=>{
	webZhuyin.sliceText("你好"); // 回傳：['你', '好']
});

// way 3: 執行環境須支援 ES2022 之 Top-level await
//        或者此段程式碼位於 async function 之中
const webZhuyin = await import("./webZhuyin.js");
```

# `webZhuyin.js`
請注意，本文件假設使用者使用 2. 所提及 `import * as wz from ...`，所以請視情況調整呼叫函數的方式。

## 符號－聲調陣列
**專有名詞** 陣列，長度為 2，形如 `[symbol, tone]`。
- `symbol`: 字串，為注音的聲母、介音或韻母符號所組成。依預期，應如 `"ㄗㄠ"`、`"ㄢ"`、`"ㄚ"` 這類。
- `tone`: 字串，為聲調符號。依預期，應如 `"ˇ"`、`"ˉ`、`"ˉ"`。即，只該有 `ˉˊˇˋ˙˙˪˫ㆴㆵㆶㆷ` 其中任一個符號。

## wz.sliceText() 
將給定字串`text`按字分離成陣列。`[`及`]`包夾處被視為一字，並保持在陣列內的同一個元素中。可在`[`, `]`及`\`之前加上`\`以避免他們被轉義。

### 語法
```js
wz.sliceText(text);
```

### 參數
- `text`
	字串，為將被分析者，預設值為 ""。

### 回傳值
一個陣列，陣列中的子元素皆為字串。

### 範例
```js
wz.sliceText("壬戌之秋"); // ['壬', '戌', '之', '秋']

// 使用方括號以保持文字（如，日後的動態組字）
wz.sliceText("[⿰亻竒]歌而和之"); // ['⿰亻竒', '歌', '而', '和', '之']

// 使用反斜線避免字符被轉義
let text = "有書名曰\\[維基大典\\]";
console.log(text); // > 有書名曰\[維基大典\]
wz.sliceText(text); // ['有', '書', '名', '曰', '[',  '維','基', '大', '典', ']']
```

## wz.parseZhuyin()
將一串注音分割依音節分離成陣列，再將各音節分離成「注音符號」字串與「聲調」字串。可以選擇性地指定第一聲的符號。

### 語法
```js
wz.parseZhuyin(zhuyin);
wz.parseZhuyin(zhuyin, options);
```

### 參數
- `zhuyin`
	字串。此字串為一串注音，應呈現 `{注音}{空格}{注音}{空格}{注音}{空格}...{注音}` 之模式，`{注音}`處應呈 `{注音符號}{聲調符號}` 之形式，或以 `'` 作為佔位符。例如 `ㄗㄠˇ ㄢˉ ㄚˉ` 為一種。
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
wz.parseZhuyin("ㄔˉ ㄅㄚ˙"); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]
wz.parseZhuyin("ㄔˉ ㄅㄚ˙ "); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ], [ '', '' ] ]
wz.parseZhuyin("ㄔ ㄅㄚ˙"); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]
wz.parseZhuyin("ㄔˉ ㄅㄚ", {defaultTone: "˙"}); // [ [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]

```

## wz.habitualizeZhuyin()
將注音依照慣用法調整。

### 語法
```js
wz.habitualizeZhuyin(zhuyin)
wz.habitualizeZhuyin(zhuyin, options)
```

### 參數
- `zhuyin`
	陣列，由 [符號－聲調陣列]( #符號－聲調陣列 ) 為元素而組成。譬如 `[ [ 'ㄏㄠ', 'ˇ' ], [ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ] ]`。

- `options`（可不填）
	物件，用於設定習慣化的方式。預設值為 `{}`。可能包含下述選項：
	- `clearFirstTone`（可不填）
		布林，預設為 `true`。`true` 則將所有 tone 中的 'ˉ' 替換成 ""。
	- `qinShengAsSymbolPrefix`（可不填）
		布林，預設為 `true`。`true` 時，若 `tone` 之值為 '˙'，則將 `[symb, tone]` 變換（map，或稱映射）為 `[tone + symb, ""]`。
	- `symbolYiToHanziYi`（可不填）
		布林，預設為 `false`。`true` 則將所有 symb 中的注音 'ㄧ' 替換成漢字 "一"。

### 回傳值
一個陣列，以多個 [符號－聲調陣列]( #符號－聲調陣列 ) 為元素。譬如 `[ [ 'ㄏㄠ', 'ˇ' ], [ 'ㄔ', '' ], [ '˙ㄅㄚ', '' ] ]`。

### 範例
```
wz.habitualizeZhuyin([[ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ]]);
	// [ [ 'ㄔ', '' ], [ '˙ㄅㄚ', '' ] ]
wz.habitualizeZhuyin([[ 'ㄔ', 'ˉ' ], [ 'ㄅㄚ', '˙' ]], {qinShengAsSymbolPrefix: false});
	// [ [ 'ㄔ', '' ], [ 'ㄅㄚ', '˙' ] ]
wz.habitualizeZhuyin([[ 'ㄅㄧㄝ', 'ˊ' ]], {symbolYiToHanziYi: true});
	// [ [ 'ㄅ一ㄝ', 'ˊ' ] ]
```

## wz.rubyHTML()
給定文字、注音，設定渲染模式（直橫書 & 注音位置），以產生 HTML。

### 語法
```js
wz.rubyHTML(text, zhuyin);
wz.rubyHTML(text, zhuyin, type);
wz.rubyHTML(text, zhuyin, type, options);
```

### 參數
- `text`
	陣列。由「待注音」的字串組成。如 `["天", "地", "，", "玄", "黃"]`。
- `zhuyin`
	陣列。由 [符號－聲調陣列]( #符號－聲調陣列 ) 組成。如 `[[ 'ㄊㄧㄢ', '' ], [ 'ㄉㄧ', 'ˋ' ], [ '', '' ], [ 'ㄒㄩㄢ', 'ˊ' ], [ 'ㄏㄨㄤ', 'ˊ' ]]`
- `type`（可不填）
	字串，其值應為 `"vert"`, `"horiUp"` 或 `"horiRight"`。預設值為 `"horiRight"`。
	- `"vert"`: 直書，注音在右。
	- `"horiUp"`: 橫書，注音在上。
	- `"horiRight"`: 橫書，注音在右。
- `options`（可不填）
	物件，指定渲染細節，預設值為 {}。可能包含如下選項：
	- `withCSS`（可不填）
		布林。指定是否產生帶有 CSS 樣式表 HTML 代碼。預設值為 `false`。若為 `true`，則將樣式打包進一個 `<style>` 標籤之中，並將此標籤作為子元素，以插入所產生的 HTML 元素代碼中。若為 `false`，請稍後使用 [rubyCSS]( #rubyCSS ) 產生樣式表，另行使用。
	- `addCSS`（可不填）
		字串。應為合乎規範的 CSS 規則。預設值為 `""`。*此字串僅在 `withCSS` 之值為 `true` 時被插入 `<style>` 標籤的結尾。*
	- `fontFor`（可不填）
		字串。控制預設字體的設定範圍。其值應為 `"all"`, `"zhuyin"` 或 `"none"`。預設值為 `"all"`。*此選項僅在 `withCSS` 之值為 `true` 時生效。*
		- `"all"`: 將預設字體套用在整個產生的 HTML 上。
		- `"zhuyin"`: 將預設字體套用在產生的注音上。在產生的 HTML 被插入之後，正文字體會與其正文插入位置的前後相同，而注音部分會使用預設字體。如此一來，在保持正文外觀的同時，可留下可預期的注音外觀。
		- `"none"`: 不套用預設字體。您可以使用 `addCSS` 選項或者其他方式，分別為正文與注音設定外觀。
	- `withFontface`（可不填）
		布林。預設值為 `true`。`true` 時將預設字體的字體來源插入至 `<style>` 標籤的開頭。若您在使用預設字體時，不想將此選項設為 true，則請使用。*此選項僅在 `withCSS` 值為 `true` 且 `fontFor` 值不為 `"none"` 時生效。*
	- `addClass`（可不填）
		字串。預設值為 `""`。設定後會被添加在產生的 HTML 元素代碼中，作為一部份的 class 值。請符合 HTML 對 class 值的規定，例如 "myZhuyin myText"
	- `addId`（可不填）
		字串。預設值為 `""`。設定後會被添加在產生的 HTML 元素代碼中，作為 id 值。請符合 HTML 對 id 值的規定。例如 "mainZhuyin"。
	- `fallbackSymbol`（可不填）
		物件。設定當瀏覽器不支援 `<ruby>` 標籤時，在注音前後顯示的符號。預設值為 `{}` 可以包含下列選項：
		- `before`（可不填）
			字串。被插入在注音前方。
		- `after`（可不填）
			字串。被插入在注音後方。

		譬如，before 設為 `"["`，after 設為 `"]"`，則對於支援的瀏覽器，顯示

		<ruby>字<rp>[</rp><rt>注音</rt><rp>]</rp></ruby>

		對於不支援的瀏覽器，顯示

		字[注音]

	- `userSelectable`（可不填）
		布林，設定檢視者是否可以選取注音。預設為 `false`。為 `true` 時，當檢視者將整段文字選取起來並複製時，會將正文連同注音以及注音前後的 `fallbackSymbol.before`、`fallbackSymbol.after` 選起來。為 `false` 時，只會複製到正文。

### 回傳值
字串，由 HTML 代碼組成。此 HTML 為一個母元素，內含多層、每層可能有多個子元素。

### 詳細說明
產生的 HTML 代碼格式大致如下：
```html
<!-- 先會生成 container 作為母元素 -->
<div id="{{ 放入 addId }}" class="... {{放入 addClass}} ...">
	<style>
		<!-- 這個 element 只有 withStyle == true 時才有，內置代碼會依需求變動 -->
		{{ 程式生成的 CSS Rules，詳見下述 }}
		{{ 放入 addCSS }}
	</style>
	{{ 這裡放主要的 HTML }}
<div>
```
其中，
- 如果有設定 addID 或 addClass，則會自動將 `<style>` 中的每條 CSS Rules 前方加上 ID 與 Class selector，以限縮 CSS 應用的範圍。
- 程式生成的 CSS Rules，是使用 `wz.rubyCSS(type, {addId: addId, addClass: addClass, fontFor: fontFor})` 的回傳值，詳見 [rubyCSS()]( #rubyCSS() )。若 `withCSS` 值為 `false`，則可以稍後以該函數生成，從而
- 最外層母元素的 class 值，會依據 `type` 而有差異。
	|     `type`    | class 包含      |
	|:-------------:|-----------------|
	|    `"vert"`   | zhuyinVert      |
	|   `"horiUp"`  | zhuyinHoriUp    |
	| `"horiRight`  | zhuyinHoriRight |
  亦會依據 `userSelectable` 有所差異。若 `userSelectable` 值為 `false`，則將包含 rtUnselectable。
		
- 主要的 HTML，以及最外層母元素的 class 值，會依據 `type` 而有差異。
	|     `type`    | 主要的 HTML                                                                       |
	|:-------------:|-----------------------------------------------------------------------------------|
	|    `"vert"`   | 一個 `<ruby>` 元素，內含多個 {{ 字與注音 }}                                       |
	|   `"horiUp"`  | 一個 `<ruby>` 元素，內含多個 {{ 字與注音 }}                                       |
	| `"horiRight"` | 多個 `<ruby>` 元素，每個內含 {{ 字與注音 }}，以免網頁自動斷行時，字與注音不同行。 |

- 上述的 {{ 字與注音 }} 形式如下
	```html
	<!-- 下方 i 為 [0, text.length) 之間的整數。令 [symb, tone] = zhuyin[i] -->

	{{text[i]}}
	<rp>{{ 放入 fallbackSymbol.before。若 == "" 則無此元素 }}</rp>
	<rt>
		{{ symbol }}
		<span>{{ tone }}</span>
	</rt>
	<rp>{{ 放入 fallbackSymbol.after。若 == "" 則無此元素 }}</rp>
	```
	考量瀏覽器相容性，程式會自動將 `symb` 中的空格全部替換為 `&nbsp;`；而 `type` 值為 `"vert"` 時，`tone` 值若為 `""`，則將 `<span>{{ tone }}</span>` 換為 `<span hidden>&nbsp;</span>`

### 範例
```js
let zhuyin1 = wz.parseZhuyin("ㄌㄧㄠˋ ㄑㄧㄠˋ ㄔㄨㄣˉ ㄈㄥˉ"),
    zhuyin2 = wz.parseZhuyin("ㄌㄧㄠˋ ㄑㄧㄠˋ ㄔㄨㄣˉ ㄈㄥˉ ㄔㄨㄟˉ ");
zhuyin1 = wz.habitualize(zhuyin1);
zhuyin2 = wz.habitualize(zhuyin2);

	// zhuyin1 == [ [ 'ㄌㄧㄠ', 'ˋ' ], [ 'ㄑㄧㄠ', 'ˋ' ], [ 'ㄔㄨㄣ', '' ], [ 'ㄈㄥ', '' ] ]
	// zhuyin2 == [ [ 'ㄌㄧㄠ', 'ˋ' ], [ 'ㄑㄧㄠ', 'ˋ' ], [ 'ㄔㄨㄣ', '' ], [ 'ㄈㄥ', '' ], [ 'ㄔㄨㄟ', '' ], [ '', '' ] ]

wz.rubyHTML(sliceText("料峭春風"));
wz.rubyHTML(sliceText("料峭春風"));
	// 上述二者效果皆同，因為此程式會依照正文字數上注音，
	// 所以如果注音比正文多，便無法顯示。反之，
	// 會出現缺少注音的正文文字
```

## wz.rubyCSS()
生成 CSS 代碼。配合 `withCSS` 值為 `false` 透過`wz.rubyHTML()` 產生的 HTML，可以用來減少網頁中的代碼重複。

### 語法
```js
	rubyCSS(type);
	rubyCSS(type, options);
```

### 參數
- `type`（可不填）
	應與 rubyHTML() 一致
	字串，其值應為 `"vert"`, `"horiUp"` 或 `"horiRight"`。預設值為 `"horiRight"`。
	- `"vert"`: 直書，注音在右。
	- `"horiUp"`: 橫書，注音在上。
	- `"horiRight"`: 橫書，注音在右。
- `options`（可不填）
	物件。下方各選項之值應與呼叫 `rubyHTML()` 時使用的相應值相同。預設值為 `{}`。
	- `addId`
	- `addClass`
	- `fontFor`
	- `withFontface`

### 回傳值
Description.

### 範例
```js

```

##
Description. 

### 語法
```js
```

### 參數
- ``
	Some description.

### 回傳值
Description.

### 範例
```js

```
