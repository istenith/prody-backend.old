Directory structure
---
## Project Folder
```
├── build.sh
├── docs
│   ├── design_guide.md
│   └── getting_started.md
├── less
├── less-watch-compiler.config.json
├── npm_global_installs.sh
├── pug
│   ├── bases
│   └── pages
├── README.md
├── resources
│   ├── files
│   └── images
└── scripts
```

## Final builds folder
As the builds directory represents the website following directory structure should be assumed in source files.
```
builds/
├── index.html
├── pages
│   └── todo.html
├── resources
│   ├── files
│   │   └── how_to.pdf
│   └── images
│   	└── logos
│       	└── iste_logo.png
├── scripts
│   └── es6.js
└── styles
    └── stylesheet.css
```

File names
---
File names in `snake_case` are prefered to avoid problems due to case insensitive systems such as `MacOS` and `Windows`.

Effects
-
CSS effects and animations should be prefered over `javascript` due to their sheer performance benefits.

Markup
-
Avoid code repetition by using features of `pug` and `less`

**Example**
instead of
```pug
ul
	li 1
	li 2
	li 3
	li 4
	li 5
```
use
```
ul
	- var numbers = [1,2,3,4,5]
	each number in numbers
		li #{number}
```
Though longer, this code is easily maintainable. In case if we want to change `li` to `li.btn` this would require only one change. Also appending a new element is easier as only `js` array needs to updated.


```pug
div
	-
		var peeps = [
			{
				"name":"alpha beta",
				"quot":"push boys",
				"imag":"./resources/images/143.jpg"
			}
			//.
			//.
			//.
		]
	each peep in peeps:
		.space
			img(src=peep.imag)
			.name #{peep.name}
			.quot #{peep.quot}

```
