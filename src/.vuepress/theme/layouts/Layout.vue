<template>
  <div :class="{ 'has-announcement': announcement }">
    <AnnouncementBar v-if="announcement" :announcement="announcement" />
    <ParentLayout />
  </div>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue'
import AnnouncementBar from '../components/AnnouncementBar.vue'

export default {
  name: 'Layout',

  components: { ParentLayout, AnnouncementBar },

  computed: {
    announcement () {
      const a = this.$themeLocaleConfig.announcement
      return a && a.text ? a : null
    }
  }
}
</script>

<style lang="stylus">
$bar = 2.5rem

plus(x)
  unquote('calc(' + x + ' + var(--bar))')

minus(x)
  unquote('calc(' + x + ' - var(--bar))')

.has-announcement
  --bar $bar
  .navbar
    top var(--bar)
  .sidebar
    top plus($navbarHeight)
  .theme-default-content:not(.custom) > :first-child:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)
    margin-top plus($navbarHeight)
  .theme-default-content:not(.custom) > h1, .theme-default-content:not(.custom) > h2, .theme-default-content:not(.custom) > h3, .theme-default-content:not(.custom) > h4, .theme-default-content:not(.custom) > h5, .theme-default-content:not(.custom) > h6
    padding-top plus(($navbarHeight + 1rem))
  .theme-default-content:not(.custom) > h1:not(:first-child), .theme-default-content:not(.custom) > h2:not(:first-child), .theme-default-content:not(.custom) > h3:not(:first-child), .theme-default-content:not(.custom) > h4:not(:first-child), .theme-default-content:not(.custom) > h5:not(:first-child), .theme-default-content:not(.custom) > h6:not(:first-child)
    margin-top minus((0.5rem - $navbarHeight))
  .anchor-container .anchor-target
    margin-top minus((-($navbarHeight + 1.15rem + 1rem)))
    padding-top plus(($navbarHeight + 1.15rem + 1rem))
  .page .page-actions
    top plus(($navbarHeight + 2rem))
  .home
    padding-top plus($navbarHeight)

@media (max-width: $MQMobile)
  .has-announcement
    --bar 3.5rem
    .sidebar
      top 0
      padding-top plus($navbarHeight)
    .page .page-actions
      padding-top plus(($navbarHeight + 1rem))
    .theme-default-content:not(.custom) > h1
      padding-top 0.5rem
    .algolia-search-wrapper .suggestions
      top calc(3.6rem + var(--bar))
</style>
