import MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import footnote from 'markdown-it-footnote'
import deflist from 'markdown-it-deflist'
import abbr from 'markdown-it-abbr'
import mark from 'markdown-it-mark'
import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-toc-done-right'
import Prism from 'prismjs'

// 导入 Prism 的样式主题和语言包
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && Prism.languages[lang]) {
      try {
        return `<pre class="language-${lang}"><code>${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`
      } catch {
        return ''
      }
    }
    return `<pre class="language-text"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 配置插件
md.use(emoji)
  .use(sub)
  .use(sup)
  .use(footnote)
  .use(deflist)
  .use(abbr)
  .use(mark)
  .use(anchor, {
    permalink: anchor.permalink.ariaHidden({
      placement: 'before'
    })
  })
  .use(toc, {
    level: [1, 2, 3],
    listType: 'ul',
    containerClass: 'table-of-contents'
  })

// 自定义容器
md.use(require('markdown-it-container'), 'info', {
  validate: function(params: string) {
    return params.trim().match(/^info\s+(.*)$/)
  },
  render: function (tokens: any[], idx: number) {
    const m = tokens[idx].info.trim().match(/^info\s+(.*)$/)
    if (tokens[idx].nesting === 1) {
      return `<div class="custom-block info"><p class="custom-block-title">${md.utils.escapeHtml(m[1])}</p>\n`
    }
    return '</div>\n'
  }
})

md.use(require('markdown-it-container'), 'warning', {
  validate: function(params: string) {
    return params.trim().match(/^warning\s+(.*)$/)
  },
  render: function (tokens: any[], idx: number) {
    const m = tokens[idx].info.trim().match(/^warning\s+(.*)$/)
    if (tokens[idx].nesting === 1) {
      return `<div class="custom-block warning"><p class="custom-block-title">${md.utils.escapeHtml(m[1])}</p>\n`
    }
    return '</div>\n'
  }
})

md.use(require('markdown-it-container'), 'danger', {
  validate: function(params: string) {
    return params.trim().match(/^danger\s+(.*)$/)
  },
  render: function (tokens: any[], idx: number) {
    const m = tokens[idx].info.trim().match(/^danger\s+(.*)$/)
    if (tokens[idx].nesting === 1) {
      return `<div class="custom-block danger"><p class="custom-block-title">${md.utils.escapeHtml(m[1])}</p>\n`
    }
    return '</div>\n'
  }
})

export function renderMarkdown(content: string): string {
  return md.render(content)
} 