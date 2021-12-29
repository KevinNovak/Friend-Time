---
description: Guide on how to translate Friend Time.
---

# Translation Guide

## **JSON and Text Editors**

Friend Time stores language data in JSON files. [JSON](https://en.wikipedia.org/wiki/JSON) is a format for storing data in an easy to read way. You may be familiar with similar data formats such as [YAML](https://en.wikipedia.org/wiki/YAML) \(YML\).

**Example JSON File**:

![](../.gitbook/assets/image%20%2816%29.png)

If you are not familiar with JSON you can still provide a translation, however you must be aware of which parts of JSON are translatable, and which are not. In the above example the parts in **blue** are called "keys", and should be left alone. While the parts in **orange** are called "values", which can be translated.

It is also recommended to have a text editor that supports JSON, so that you can get pretty coloring like the example above, thus making it easier to read.

**Recommended Text Editors with JSON Support**:

* [Notepad++](https://notepad-plus-plus.org/)
* [Sublime Text](https://www.sublimetext.com/)
* [VSCode](https://code.visualstudio.com/)

## **Translation Guidelines**

### Leave As Is

The following should **NOT** be changed:

* **JSON Keys and Structure**
  * See the [above section](translation-guide.md#json-and-text-editors) for more information.
* **Variables**
  * Look like this`{{MY_VARIABLE}}`
  * These will end up getting filled in by the bot.
* **References**
  * Look like this `{{REF:my.reference}}`
  * It's important to understand how these work for translations.
  * Anytime you see a REF, it will end up getting filled in with whatever text it points to in the `refs` section of the language file.
  * For example `{{REF:bot.name}}` will get filled in with whatever text is in `refs.bot.name` \("Friend Time"\).
* **Markdown Formatting**
  * These are special character that provide:
    * bold \(\*\*\)
    * italic \(\*\)
    * underline \(\_\_\)
    * code \(\`\)
    * link \[This is a link\]\(http://google.com/\)
  * See [here ](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-)for more information about markdown.
* **Colors**
  * Look like this: `#0099ff`
* **Emojis**
* **Links**
* **Bot Name**

In addition to the above, the following should be kept **as similar as possible** unless inappropriate for the language:

* **Capitalization**
* **Punctuation**
* **Spacing**
* **Order of Sentences**

### Translate

Translate **regular text**, **commands**, **settings**, etc. Anything that is not part of the above list of items to leave alone.

### Special Cases

There are a few fields which have special cases:

* `ref.meta.language`
  * Should be an ISO 639-1 language code.
  * [See here for a list of possible language codes](https://www.andiamo.co.uk/resources/iso-language-codes/).
* `ref.meta.locale`
  * Should be the same as `ref.meta.language`.
* `ref.meta.translators`
  * Provide your discord tag here and a link to a profile or social media of your choice.
* `regexes.meta.language`
  * Should include:
    * The language code from `ref.meta.language`
    * The language name from `ref.meta.languageDisplay`

### Translating Regexes

You may notice the `regexes` section of the translation file looks a little odd. Each value in the regex section should look something like this:

`/\b(find|f|lookup|search)\b/i`

You can essentially ignore everything except for this part:

`find|f|lookup|search`

Which is just **a list of words** the user can type in place of a certain command, separated by tall lines \(\|\).

When translating the `regexes` section, just focus on translating these words and adding or removing words from the list as you see necessary.

