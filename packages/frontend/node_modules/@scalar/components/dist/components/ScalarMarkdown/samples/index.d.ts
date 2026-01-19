export declare const samples: [{
    readonly label: "Document";
    readonly key: "document";
    readonly value: "\n# One morning, when Gregor Samsa woke from troubled dreams.\nOne morning, when Gregor Samsa woke from troubled dreams, he found himself *transformed* in his bed into a horrible  [vermin](http://en.wikipedia.org/wiki/Vermin \"Wikipedia Vermin\"). He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover **strong** it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, link waved about helplessly as he looked. <cite>“What's happened to me?”</cite> he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.\n\n## The bedding was hardly able to cover it.\n\nIt showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer a solid fur muff into which her entire forearm disappeared..\n\n### Things we know about Gregor's sleeping habits.\n\n- He always slept on his right side.\n- He has to get up early (to start another dreadful day).\n- He has a drawer and a alarm clock next to his bed.\n- His mother calls him when he gets up to late.\n\nFirst he wanted to stand up quietly and undisturbed, get dressed, above all have breakfast, and only then consider further action, for (he noticed this clearly) by thinking things over in bed he would not reach a reasonable conclusion. He remembered that he had already often felt a light pain or other in bed, perhaps the result of an awkward lying position, which later turned out to be purely imaginary when he stood up, and he was eager to see how his present fantasies would gradually dissipate. That the change in his voice was nothing other than the onset of a real chill, an occupational illness of commercial travelers, of that he had not the slightest doubt.\n";
}, {
    readonly label: "Alerts";
    readonly key: "alerts";
    readonly value: "\n> [!NOTE]  \n> Highlights information that users should take into account, even when skimming.\n\n> [!TIP]\n> Optional information to help a user be more successful.\n\n> [!IMPORTANT]  \n> Crucial information necessary for users to succeed.\n\n> [!WARNING]  \n> Critical content demanding immediate user attention due to potential risks.\n\n> [!CAUTION]\n> Negative potential consequences of an action.\n";
}, {
    readonly label: "Blockquotes";
    readonly key: "blockquotes";
    readonly value: "\nNormal Blockquote\n\n> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,\n> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.\n> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.\n>\n> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse\n> id sem consectetuer libero luctus adipiscing.\n\n---\n\nBlockquote with hard wraps and no additional `>`\n\n> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,\nconsectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.\nVestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.\n>\n> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse\nid sem consectetuer libero luctus adipiscing.\n\n---\n\nBlockquote with nested blockquote\n\n> This is the first level of quoting.\n>\n> > This is nested blockquote.\n>\n> Back to the first level.\n\n---\n\nBlockquote with nested markdown content\n\n> ## This is a header.\n>\n> 1.  This is the first list item.\n> 2.  This is the second list item.\n>\n> Here's some example code:\n>\n>     return shell_exec(\"echo $input | $markdown_script\");\n";
}, {
    readonly label: "Codeblocks";
    readonly key: "codeblocks";
    readonly value: "\nCodeblock via indent\n\n    tell application \"Foo\"\n        beep\n    end tell\n\n---\n\nCodeblock via backticks\n\n```javascript\nconst message = 'this is a code block'\n\nconsole.log(message)\n```\n\n---\n\nCodeblock with HTML\n\n```html\n<div class=\"footer\">&copy; 2004 Foo Corporation</div>\n```\n\n---\n\nCodeblock with markdown\n\n\n```md\n# Title\n\nI should not be **bold**.\n```\n";
}, {
    readonly label: "Headers";
    readonly key: "headers";
    readonly value: "\nATX Headers (Prefixed with `#`'s')\n\n# This is a first level header\n\n## This is a second level header\n\n### This is a third level header\n\n#### This is a fourth level header\n\n##### This is a fifth level header\n\n###### This is a sixth level header\n\n---\n\nATX Headers (Prefixed and suffixed with `#`'s')\n\n# This is a first level header #\n\n## This is a second level header ##\n\n### This is a third level header ###\n\n#### This is a fourth level header ####\n\n##### This is a fifth level header #####\n\n###### This is a sixth level header ######\n\n---\n\nSetext Headers\n\nThis is a first level heading\n=============================\n\nThis is a second level heading\n------------------------------\n";
}, {
    readonly label: "HTML";
    readonly key: "html";
    readonly value: "\nSummary / Details\n\n<details>\n  <summary>Using Details Tags</summary>\n  <p>HTML Example</p>\n</details>\n\n---\n\nDescription List\n\n<dl>\n  <dt>Beast of Bodmin</dt>\n  <dd>A large feline inhabiting Bodmin Moor.</dd>\n  <dt>Morgawr</dt>\n  <dd>A sea serpent.</dd>\n  <dt>Owlman</dt>\n  <dd>A giant owl-like creature.</dd>\n</dl>\n";
}, {
    readonly label: "Inline";
    readonly key: "inline";
    readonly value: "\nParagraph with inline elements\n\nThis is a demo paragraph with **bold text**, _italic text_, a [link](https://example.com), and some `inline code` to show various Markdown inline elements.\n\n---\n\nLink\n\nThis is [an example](http://example.com/) inline link.\n\nThis [link](http://example.com/ \"Title\") has a title attribute.\n\n---\n\nEmphasis\n\n_single asterisks_\n\n_single underscores_\n\n**double asterisks**\n\n**double underscores**\n\n---\n\nInline Code\n\nUse the `printf()` function.\n\n---\n\nEmoji\n\n:sparkles:\n";
}, {
    readonly label: "Unordered Lists";
    readonly key: "lists-unordered";
    readonly value: "\nUnordered list\n\n- Red\n- Green\n- Blue\n\n---\n\nUnordered list with mixed symbols\n\n- Red\n+ Green\n* Blue\n\n---\n\nNested unordered lists \n\n- Level 1\n- Level 1\n    - Level 2\n    - Level 2\n        - Level 3\n        - Level 3\n            - Level 4\n            - Level 4\n                  - Level 5\n                  - Level 5\n                      - Level 6\n                      - Level 6\n                          - Level 7\n                          - Level 7\n                              - Level 8\n                              - Level 8\n    - Level 2\n    - Level 2\n\n---\n\nList with inline elements\n\n- This is a [link](https://scalar.com) and a bunch more content forcing the line to wrap to the next line. This is some **bold text** and some *italic text* and some more text to make sure it wraps.\n- This is some `inline code` and a math formula: (E = mc^2)\n";
}, {
    readonly label: "Ordered Lists";
    readonly key: "lists-ordered";
    readonly value: "\nOrdered list\n\n1.  Bird\n1.  McHale\n1.  Parish\n\n---\n\nOrdered list with mixed numbers\n\n1.  Bird\n3.  McHale\n2.  Parish\n\n---\n\nNested ordered lists \n\n1. Level 1\n1. Level 1\n    1. Level 2\n    1. Level 2\n        1. Level 3\n        1. Level 3\n            1. Level 4\n            1. Level 4\n                1. Level 5\n                1. Level 5\n                    1. Level 6\n                    1. Level 6\n                        1. Level 7\n                        1. Level 7\n                            1. Level 8\n                            1. Level 8\n    1. Level 2\n    1. Level 2\n\n---\n\nList with inline elements\n\n1.  This is a [link](https://scalar.com) and a bunch more content forcing the line to wrap to the next line. This is some **bold text** and some *italic text* and some more text to make sure it wraps.\n2.  This is some `inline code` and a math formula: (E = mc^2)\n";
}, {
    readonly label: "Task Lists";
    readonly key: "lists-task";
    readonly value: "\nTask list\n\n- [x] Write the press release\n- [ ] Update the website\n- [ ] Contact the media\n\n---\n\nTask list with nested lists\n\n- [x] Write the press release\n    - [x] Draft the content\n    - [x] Review with the team\n- [ ] Update the website\n    - Unordered sublist item\n    - Another sublist item\n- [ ] Update the website\n    1. Ordered sublist item\n    2. Another sublist item\n- [ ] Contact the media\n\n---\n\nTask Lists with inline elements\n\n- [x] This is a [link](https://scalar.com) and a bunch more content forcing the line to wrap to the next line. This is some **bold text** and some *italic text* and some more text to make sure it wraps.\n- [ ] This is some `inline code` and a math formula: (E = mc^2)\n";
}, {
    readonly label: "Mixed Lists";
    readonly key: "lists-mixed";
    readonly value: "\nNested mixed lists \n\n* ul level 1\n* ul level 1\n    1. ol level 2\n    1. ol level 2\n        * ul level 3\n        * ul level 3\n    1. ol level 2\n    1. ol level 2\n\n---\n\nWith task lists\n\n- Unordered item\n- [x] Completed task\n- [ ] Incomplete task\n    1. Ordered item\n    - [x] Completed sub-task\n    2. Ordered item\n        - [x] Completed sub-task\n        - [ ] Incomplete sub-Task\n    - Unordered item\n    - [ ] Incomplete sub-Task\n";
}, {
    readonly label: "List Interactions";
    readonly key: "lists-interactions";
    readonly value: "\n\nList with blockquote\n\n*   A list item with a blockquote:\n\n    > This is a blockquote\n    > inside a list item.\n\n---\n\nList with codeblock\n\n*   A list item with a code block:\n\n        <code goes here>\n";
}, {
    readonly label: "List Edge Cases";
    readonly key: "lists-edge-cases";
    readonly value: "\nEscaped ordered list\n\n1994. Was a good year (this should not be a list item)\n";
}, {
    readonly label: "Paragraphs";
    readonly key: "paragraphs";
    readonly value: "\nA paragraph is simply one or more consecutive lines of text, separated\nby one or more blank lines. (A blank line is any line that looks like a\nblank line -- a line containing nothing but spaces or tabs is considered\nblank.) Normal paragraphs should not be indented with spaces or tabs.\n\n---\n\nLine with a soft break\n...following line.\n\nLine with a hard break  \n...following line.\n\n--- \n\nLine with several blank lines after...\n\n\n\n...following paragraph.\n";
}, {
    readonly label: "Tables";
    readonly key: "tables";
    readonly value: "\nBasic Table\n\n| Syntax                                            | Description |\n| ------------------------------------------------- | ----------- |\n| Header                                            | Title       |\n| Paragraph                                         | Text        |\n| Superlongtextinasinglecolumnshouldwrapatsomepoint | Text        |\n\n\n---\n\nTable with alignment\n\n| Syntax      | Description | Test Text     |\n| :---        |    :----:   |          ---: |\n| Header      | Title       | Here's this   |\n| Paragraph   | Text        | And more      |\n";
}];
//# sourceMappingURL=index.d.ts.map