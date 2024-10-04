# Canvas Overview

## Prefer doing instead of reading?

We recommend you check out [https://app.moment.dev](https://app.moment.dev) and try out our onboarding canvas.

## What is a Canvas?

A canvas is a collaboration space where you can easily create and share with your colleagues.

First, let’s walk through the different parts of the canvas.

### Cells

Canvases are made up **cells**. There are 2 types of cells: **rich text cells** and **code cells**.

#### Rich Text Cells

Editing rich text works the same way as in any text editor.
You can highlight text to apply formatting or use markdown syntax.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/277457f4-6e42-41e6-bc18-e3864b301842.png)

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/3191f89f-b0fd-493e-910a-65c64d10b34c.png)

In addition to editing text, you can insert dynamic content in a canvas with code cells.

#### Code Cells

There are also code cells.
Code cells are runnable snippets of Javascript.
You can do everything you can normally do with browser-based Javascript!
Like import libraries, run functions, and make API calls.
You can also write custom components with React, and they'll be rendered in the cell.

Code cells can also reference each other.
We’ve included a dependency graph in the lower left part of the screen to help you see the relationships between code cells.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/2770ac6a-6ad6-45a2-ac13-693e1c570a18.png)

You can also copy a cell and edit it below:

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/5c90fba0-f710-4937-b543-1f7de9a10295.png)

### Code Editor

Select any code cell, and click the Toggle code editor icon in the blue bar.
This button will bring up an in-app code editor.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/e5f592ba-11dd-4a1b-929f-f85a2965608a.png)

After making some edits, press the Run cell button or press `shift` + `return`.
This will also save your changes!

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/ee8f364d-0020-4d61-96b9-89d7f66e60ea.png)

If you run a cell, it updates the values of every cell that depends on it.
You can use the code editor to hack _any_ code cell in Moment.
Try it on any interesting snippets you find.

#### Deeper Dive on Imports

In the code editor, you may see the components like this one, `CountdownTimerAlpha`.
This is a React component we’ve created in our [standard library](https://app.moment.dev/@moment/stdlib).
You can edit any of the properties either in the code editor or in the inspect tab.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/7ea330ba-9333-4207-821c-7051ce52e877.png)

Where is `CountdownTimerAlpha` coming from?
If you search the canvas, you'll see an `import` code cell.
The line below will be added automatically when you select the Countdown Timer component from the component tab.

`import { DataGridAlphaV2, ButtonAlpha, CountdownTimerAlpha, InputSelectAlpha } from "@moment/stdlib"`

If you click on @moment/stdlib at the end of the import line, it will open the [Standard Components canvas](https://app.moment.dev/@moment/stdlib) (or Stdlib).
You can read about this component in detail on the [Countdown Timer](https://app.moment.dev/@moment/stdlib/countdown-timer) page.

### Properties Pane

The properties pane lives on the right side of the canvas and is accessible with the buttons shown below.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/7ff3b0ac-2bbe-43bb-92d0-2baf75598a17.png)

### Components Tab

The components tab has a list of code templates you can use in your canvases.

Start by toggling the components tab, or pressing `ctrl/⌘` + `p`.
Once you insert a component (either by pressing return or dragging it into the canvas), it creates a fully editable copy.
Some templates also include an import cell, which can be placed anywhere in the document—order doesn’t matter.
We usually organize import cells at the bottom, but you can move them up and down the page as you need.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/abbed90c-1bfb-4de9-955d-8d218e1c8b54.png)

### Inspect Tab

Some components also have properties that are editable in a UI instead of a code editor.
These are linked to properties in the code, so you can edit them in either the UI or in code.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/b096e1e9-02e7-4aa9-b6bf-67ed4e7f84d7.png)

If the code editor and inspect tab are both open and you change a property in the inspect tab, you'll notice how changes happen in all three locations.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/8ece5b07-45c1-4a29-9fcd-9757b7f28249.png)

### Comments Tab

You can add comments to any cell.
Highlight text or select a code cell, and click the Add Comment button to leave a comment.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/8d568434-11f5-44e7-9a12-46a71a55f11d.png)

### History Tab

Changes you make in a Moment canvas are saved regularly as drafts.
You can see your and others' drafts in the history tab.

Pressing the Save button creates an official numbered version of the canvas, which you can go back to at any point.

![](https://moment-canvas-user-uploads-west2.s3.us-west-2.amazonaws.com/5e4f2b1c-246f-4a00-a38a-68e9cb54d833.png)

### Navigation Pane

Finally, you’ll see the navigation pane on the left side of the canvas, which contains pages and a code cell dependency graph.
Canvases are made up of individual pages, which can help organize canvases that are getting long.
