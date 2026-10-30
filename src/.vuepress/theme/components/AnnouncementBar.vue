<template>
  <div class="announcement-bar" role="region" aria-label="Announcement">
    <span v-if="announcement.label" class="announcement-bar__label">{{ announcement.label }}</span>
    <span class="announcement-bar__text">{{ announcement.text }}</span>
    <template v-if="link">
      <a v-if="link.external" :href="link.to">{{ link.text }}</a>
      <RouterLink v-else :to="link.to">{{ link.text }}</RouterLink>
    </template>
  </div>
</template>

<script>
export default {
  name: 'AnnouncementBar',

  props: {
    announcement: { type: Object, required: true }
  },

  computed: {
    link () {
      const link = this.announcement.link
      if (!link) return null
      if (/^https?:\/\//.test(link.href)) {
        return { text: link.text, to: link.href, external: true }
      }
      const [file, hash] = link.href.split('#')
      const page = this.$localePath + 'docs/' + file.replace(/\.md$/, '.html')
      return { text: link.text, to: hash ? `${page}#${hash}` : page }
    }
  }
}
</script>

<style lang="stylus">
.announcement-bar
  position fixed
  z-index 30
  top 0
  left 0
  right 0
  height var(--bar)
  box-sizing border-box
  padding 0 1rem
  display flex
  align-items center
  justify-content center
  background #d11c56
  color #fff
  font-size 0.9rem
  line-height 1.35

  &__text
    display -webkit-box
    -webkit-line-clamp 1
    -webkit-box-orient vertical
    overflow hidden
    text-align center
    min-width 0

  &__label
    flex none
    font-size 0.72rem
    font-weight 600
    line-height 1.4
    padding 0.05rem 0.55rem
    border-radius 999px
    margin-right 0.5rem
    white-space nowrap
    background rgba(255, 255, 255, 0.2)

  a
    color #fff
    text-decoration underline
    font-weight 500
    flex none
    white-space nowrap
    margin-left 0.5rem

@media (max-width: $MQMobile)
  .announcement-bar
    font-size 0.8rem
    padding 0 0.75rem

    &__text
      -webkit-line-clamp 2
</style>
