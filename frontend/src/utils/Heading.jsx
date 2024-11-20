import { Node } from '@tiptap/core';

const Heading = Node.create({
  name: 'heading',

  addOptions() {
    return {
      levels: [2],
      HTMLAttributes: {
        class: 'question-text',
      },
    }
  },

  content: 'inline*',
  group: 'block',
  defining: true,
  selectable: false,

  addAttributes() {
    return {
      level: {
        default: 2,
        parseHTML: element => element.hasAttribute('data-level')
            ? parseInt(element.getAttribute('data-level'), 10)
            : 2,
        renderHTML: attributes => ({
          'data-level': attributes.level,
        }),
      },
    }
  },

  parseHTML() {
    return this.options.levels.map(level => ({
      tag: `h${level}`,
    }))
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level)
        ? node.attrs.level
        : this.options.levels[0]
    return [`h${level}`, this.options.HTMLAttributes, 0]
  },

  addCommands() {
    return {
      toggleHeading: attributes => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false
        }

        return commands.toggleNode('heading', 'paragraph', attributes)
      },
    }
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce((items, level) => ({
      ...items,
      [`Mod-Alt-${level}`]: () => this.editor.commands.toggleHeading({ level }),
    }), {})
  },
})

export default Heading;
