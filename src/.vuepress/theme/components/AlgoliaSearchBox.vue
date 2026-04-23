<template>
  <div class="algolia-search-wrapper search-box">
    <input
      ref="input"
      class="search-query"
      :placeholder="placeholder"
      aria-label="Search"
      autocomplete="off"
      spellcheck="false"
      @input="onInput"
      @focus="focused = true"
      @blur="onBlur"
      @keyup.enter="go(focusIndex)"
      @keyup.up="onUp"
      @keyup.down="onDown"
      @keydown.esc="close"
    >
    <div v-if="!focused && !query" class="search-hotkeys-wrapper" @click="$refs.input.focus()">
    <kbd class="search-hotkey">{{ isMac ? '⌘' : 'Ctrl' }}</kbd>
    <kbd class="search-hotkey">K</kbd>
    </div>

    <ul
      v-if="showSuggestions"
      class="suggestions"
      @mouseleave="unfocus"
    >
      <li
        v-for="(s, i) in hits"
        :key="s.objectID || i"
        class="suggestion"
        :class="{ focused: i === focusIndex }"
        @mousedown.prevent="go(i)"
        @mouseenter="focus(i)"
      >
        <a :href="s._url" @click.prevent>
          <div class="suggestion-hierarchy">
            <span
              v-for="(level, li) in s._levels"
              :key="li"
              class="suggestion-level"
              :class="'suggestion-level-' + li"
              v-html="level"
            ></span>
          </div>
          <div
            v-if="s._contentHighlighted"
            class="suggestion-content"
            v-html="s._contentHighlighted"
          ></div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import algoliasearch from 'algoliasearch/lite'
import instantsearch from 'instantsearch.js'
import { connectSearchBox, connectHits } from 'instantsearch.js/es/connectors'
import { highlight, snippet } from 'instantsearch.js/es/helpers'

function clean (str) {
  if (!str) return ''
  const el = typeof document !== 'undefined' && document.createElement('textarea')
  if (el) { el.innerHTML = str; str = el.value }
  return str.replace(/^[#\s]+/g, '').trim()
}

export default {
  name: 'AlgoliaSearchBox',

  props: ['options'],

  data () {
    return {
      focused: false,
      focusIndex: 0,
      hits: [],
      query: '',
      refineQuery: null,
      searchInstance: null,
      isMac: false
    }
  },

  computed: {
    placeholder () {
      return this.$themeLocaleConfig.searchPlaceholder || this.$site.themeConfig.searchPlaceholder || 'Search...'
    },

    showSuggestions () {
      return this.focused && this.query && this.hits.length > 0
    }
  },

  watch: {
    $lang () {
      if (this.query && this.refineQuery) {
        this.refineQuery(this.query)
      }
    },

    options: {
      immediate: true,
      handler (val) {
        if (val && val.appId && val.apiKey && val.indexName) {
          this.$nextTick(() => this.initSearch(val))
        }
      }
    }
  },

  beforeDestroy () {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    if (this.searchInstance) {
      this.searchInstance.dispose()
    }
    document.removeEventListener('keydown', this.onHotkey)
  },

  methods: {
    initSearch (options) {
      if (this.searchInstance) {
        this.searchInstance.dispose()
      }

      const client = algoliasearch(options.appId, options.apiKey)
      const searchParams = options.searchParameters || {}

      const self = this

      this.searchInstance = instantsearch({
        indexName: options.indexName,
        searchClient: client,
        searchFunction: (helper) => {
          if (helper.state.query) {
            const lang = self.$lang || 'ru-RU'
            helper
              .setQueryParameter('attributesToSnippet', ['content:80'])
              .setQueryParameter('snippetEllipsisText', '…')
              .setQueryParameter('facetFilters', [`lang:${lang}`])
              .search()
          }
        }
      })

      const customSearchBox = connectSearchBox((renderOptions) => {
        self.refineQuery = renderOptions.refine
      })

      const customHits = connectHits((renderOptions) => {
        self.hits = renderOptions.items.map(item => {
          const hierarchy = item.hierarchy || {}

          const levels = []
          for (let i = 1; i <= 6; i++) {
            const key = `lvl${i}`
            if (!hierarchy[key]) break

            let val
            try {
              val = highlight({ attribute: `hierarchy.${key}`, hit: item })
            } catch (e) {
              val = hierarchy[key]
            }
            levels.push(clean(val))
          }

          if (levels.length === 0 && hierarchy.lvl0) {
            levels.push(clean(hierarchy.lvl0))
          }

          let contentHighlighted = ''
          if (item.content) {
            try {
              contentHighlighted = snippet({ attribute: 'content', hit: item })
            } catch (e) {
              contentHighlighted = item.content
            }
          }

          let url = item.url || ''
          if (url) {
            try {
              const parsed = new URL(url)
              url = parsed.pathname + parsed.hash
              url = url.replace(self.$site.base.replace(/\/$/, ''), '')
              if (!url.startsWith('/')) url = '/' + url
            } catch (e) {}
          }

          return {
            ...item,
            _levels: levels,
            _contentHighlighted: contentHighlighted,
            _url: url
          }
        })
      })

      this.searchInstance.addWidgets([
        customSearchBox({}),
        customHits({
          ...searchParams
        })
      ])

      this.searchInstance.start()
      this.isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)
      document.addEventListener('keydown', this.onHotkey)
    },

    onInput (e) {
      this.query = e.target.value
      this.focusIndex = 0
      if (this.debounceTimer) clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        if (this.refineQuery) {
          this.refineQuery(this.query)
        }
      }, 250)
    },

    go (i) {
      if (!this.showSuggestions) return
      const hit = this.hits[i]
      if (hit && hit._url) {
        const searchText = hit.content || ''
        const targetPath = hit._url.split('#')[0]
        const currentPath = this.$route.path

        this.query = ''
        this.$refs.input.value = ''
        this.hits = []
        this.focused = false
        this.$refs.input.blur()
        if (this.refineQuery) this.refineQuery('')

        const samePage = targetPath === currentPath || !targetPath

        this.$router.push(hit._url).catch(() => {})

        if (searchText) {
          if (samePage) {
            this.$nextTick(() => this.scrollToText(searchText))
          } else {
            const unwatch = this.$watch('$route', () => {
              unwatch()
              this.$nextTick(() => {
                setTimeout(() => this.scrollToText(searchText), 100)
              })
            })
          }
        }
      }
    },

    scrollToText (text) {
      if (!text || text.length < 8) return

      const container = document.querySelector('.theme-default-content') || document.querySelector('.page')
      if (!container) return

      const search = text.trim().toLowerCase()
      const words = search.split(/\s+/).filter(w => w.length > 3)
      if (words.length === 0) return

      const candidates = container.querySelectorAll('p, li, td, dd, blockquote')
      let bestEl = null
      let bestScore = 0

      candidates.forEach(el => {
        const elText = el.textContent.toLowerCase()
        let score = 0
        words.forEach(w => {
          if (elText.includes(w)) score++
        })
        if (score > bestScore) {
          bestScore = score
          bestEl = el
        }
      })

      if (bestEl && bestScore >= Math.min(words.length, 3)) {
        bestEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        bestEl.style.transition = 'background-color 0.3s'
        bestEl.style.backgroundColor = 'rgba(62, 175, 124, 0.15)'
        bestEl.style.borderRadius = '3px'
        setTimeout(() => {
          bestEl.style.backgroundColor = ''
          setTimeout(() => {
            bestEl.style.transition = ''
            bestEl.style.borderRadius = ''
          }, 300)
        }, 2000)
      }
    },

    close () {
      this.query = ''
      this.$refs.input.value = ''
      this.hits = []
      this.focused = false
      this.$refs.input.blur()
      if (this.refineQuery) this.refineQuery('')
    },

    onBlur () {
      setTimeout(() => { this.focused = false }, 150)
    },

    onUp () {
      if (this.showSuggestions) {
        this.focusIndex = this.focusIndex > 0
          ? this.focusIndex - 1
          : this.hits.length - 1
      }
    },

    onDown () {
      if (this.showSuggestions) {
        this.focusIndex = this.focusIndex < this.hits.length - 1
          ? this.focusIndex + 1
          : 0
      }
    },

    focus (i) { this.focusIndex = i },
    unfocus () { this.focusIndex = -1 },

    onHotkey (event) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        this.$refs.input.focus()
      }
    }
  }
}
</script>

<style lang="stylus">
.algolia-search-wrapper
  display inline-block
  position relative
  margin-right 1rem

  input
    cursor text
    width 10rem
    height 2rem
    color lighten($textColor, 25%)
    display inline-block
    border 1px solid darken($borderColor, 10%)
    border-radius 2rem
    font-size 0.9rem
    line-height 2rem
    padding 0 0.5rem 0 2rem
    outline none
    transition all 0.2s ease
    background #fff url('/bot-doc/images/search.svg') 0.6rem 0.5rem no-repeat
    background-size 1rem

    &:focus
      cursor auto
      border-color $accentColor
      width 20rem

  .search-hotkeys-wrapper
    position absolute
    right 0.5rem
    top 50%
    transform translateY(-50%)
    display inline-flex
    align-items center
    gap 0.25rem
    cursor pointer

  .search-hotkey
    font-size 0.65rem
    font-family inherit
    color lighten($textColor, 50%)
    background #f1f3f5
    border 1px solid darken($borderColor, 5%)
    border-radius 3px
    height 1.3rem
    padding 0 0.35rem
    display inline-flex
    align-items center
    justify-content center
    cursor pointer
    pointer-events auto
    white-space nowrap

  .suggestions
    background #fff
    width 36rem
    max-height 70vh
    overflow-y auto
    position absolute
    top 2.4rem
    right 0
    border 1px solid darken($borderColor, 10%)
    border-radius 6px
    padding 0.4rem
    list-style-type none
    z-index 100
    box-shadow 0 4px 12px rgba(0, 0, 0, 0.1)
    margin 0

  .suggestion
    line-height 1.4
    padding 0.6rem 0.7rem
    border-radius 4px
    cursor pointer
    border-bottom 1px solid lighten($borderColor, 10%)

    &:last-child
      border-bottom none

    a
      white-space normal
      color lighten($textColor, 35%)
      text-decoration none
      display block

    .suggestion-hierarchy
      display flex
      flex-direction column

    .suggestion-level
      display block

      mark
        background rgba(62, 175, 124, 0.25)
        color inherit
        padding 0 2px
        border-radius 2px

    .suggestion-level-0
      font-size 1rem
      font-weight 700
      color $accentColor
      line-height 1.3

    .suggestion-level-1
      font-size 0.85rem
      font-weight 500
      color $textColor
      margin-top 0.1rem

    .suggestion-level-2
      font-size 0.78rem
      font-weight 400
      color lighten($textColor, 25%)
      margin-top 0.05rem

    .suggestion-level-3
      font-size 0.72rem
      font-weight 400
      color lighten($textColor, 40%)
      margin-top 0.05rem

    .suggestion-level-4
      font-size 0.68rem
      font-weight 400
      color lighten($textColor, 50%)

    .suggestion-content
      display block
      font-size 0.8rem
      color lighten($textColor, 20%)
      margin-top 0.35rem
      line-height 1.5

      mark
        background rgba(62, 175, 124, 0.2)
        color $textColor
        padding 0 1px
        border-radius 2px

    &.focused
      background-color #f3f4f5

      .suggestion-level-0
        color darken($accentColor, 15%)

@media (max-width: $MQNarrow)
  .algolia-search-wrapper
    input
      cursor pointer
      width 0
      border-color transparent
      position relative

      &:focus
        cursor text
        left 0
        width 10rem

@media (max-width: $MQMobile)
  .algolia-search-wrapper
    .suggestions
      right 0
      width calc(100vw - 4rem)

    input:focus
      width 8rem
</style>
