<template>
  <div class="anchor-container">
    <span v-for="(id, index) in ids" :key="index" :id="id" class="anchor-target" ref="anchorRef"></span>
    <a v-if="!hide" class="anchor-link" @click.prevent="copyAnchorLink(anchorLink)" :href="`#${anchorLink}`" title="Копировать ссылку">#</a>
  </div>
</template>

<script>
let toastTimeout = null;
let toastElement = null;

export default {
  name: 'Anchor',

  props: {
    ids: { type: Array, required: true },
    hide: { type: Boolean, default: false },
  },

  data() {
    return {
      observer: null,
      isIntersecting: false,
      scrollTimeout: null,
      observerTimeout: null,
      initialScrollDone: false
    }
  },

  computed: {
    anchorRef() {
      if (!this.$refs.anchorRef) return null;
      
      return Array.isArray(this.$refs.anchorRef) 
        ? this.$refs.anchorRef[0] 
        : this.$refs.anchorRef;
    },

    anchorLink() {
      if (!this.ids || !this.ids.length) return '#';
      return this.ids[0];
    },
    
    navbarHeight() {
      return this.$root.$el.querySelector('.navbar')?.offsetHeight || 58;
    },

    locale() {
      return this.$route.path.startsWith('/en/') ? 'en' : 'ru';
    }
  },

  methods: {
    formatHash(hash) {
      return hash?.replace('#', '') || '';
    },

    setupObserver() {
      this.cleanupObserver();
      if (!this.anchorRef) return;

      this.observer = new IntersectionObserver(this.handleIntersection, { threshold: 0.1, rootMargin: `-${this.navbarHeight}px 0px 0px 0px` });
      this.observer.observe(this.anchorRef);
    },
    
    handleIntersection(entries) {
      this.isIntersecting = entries[0].isIntersecting;
      
      if (this.isIntersecting || this.initialScrollDone) {
        this.cleanupObserver();
        return;
      }
      
      this.openDetails();
      this.scrollToElement();
      
      this.initialScrollDone = true;
      this.cleanupObserver();
    },
    
    cleanupObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },

    openDetails() {
      if (!this.anchorRef) return;
      
      let element = this.anchorRef;
      let detailsOpened = false;
      

      while (element) {
        if (element.tagName === 'DETAILS' && !element.open) {
          element.open = true;
          detailsOpened = true;
        }

        else if (element.parentElement?.tagName === 'DETAILS' && !element.parentElement.open) {
          element.parentElement.open = true;
          detailsOpened = true;
        }

        element = element.parentElement;
      }
      
      if (detailsOpened) {
        clearTimeout(this.observerTimeout);
        this.observerTimeout = setTimeout(() => {
          this.scrollToElement();
        }, 100);
      }
    },

    scrollToElement() {
      if (!this.anchorRef) return;
      
      requestAnimationFrame(() => {
        this.anchorRef?.scrollIntoView?.();
        
        setTimeout(() => {
          this.anchorRef?.scrollIntoView?.();
        }, 300);
      } );
    },

    copyAnchorLink(id) {
      const successMessage = this.locale === 'en' ? 'Link copied!' : 'Ссылка скопирована!';
      const errorMessage = this.locale === 'en' ? 'Failed to copy link' : 'Не удалось скопировать ссылку';

      const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(id)}`;
      this.scrollToElement();
      
      navigator.clipboard.writeText(url)
        .then(() => this.showToastNotification(successMessage))
        .catch(err => {
          console.error(errorMessage, err);
          this.showToastNotification(errorMessage);
        });
    },

    showToastNotification(message) {
      this.cleanupToast();
      
      toastElement = document.createElement('div');
      toastElement.className = 'docs-toast';
      toastElement.innerText = message;
      document.body.appendChild(toastElement);

      toastTimeout = setTimeout(() => this.cleanupToast(), 2000);
    },
    
    cleanupToast() {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
      }
      
      if (toastElement && toastElement.parentNode) {
        document.body.removeChild(toastElement);
        toastElement = null;
      }
    },

    handleRouteChange(hash = this.$route.hash) {
      if (!this.ids.includes(this.formatHash(hash))) return;
      
      this.initialScrollDone = false;
      
      this.openDetails();
      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.setupObserver();
        this.scrollToElement();
        this.initialScrollDone = true;
      }, 200);
    }
  },

  watch: {
    $route() {
      this.handleRouteChange();
    }
  },

  
  mounted() {
    const hash = this.$route.hash;

    setTimeout(() => {
      if (window.location.hash) {
        const hash = this.formatHash(window.location.hash);

        if (this.ids.includes(hash)) {
          this.initialScrollDone = false;
          this.openDetails();
          this.setupObserver();
          this.scrollToElement();
        }
      }
      
      this.handleRouteChange(hash);
    }, 500);
  },
  
  beforeDestroy() {
    clearTimeout(this.scrollTimeout);
    clearTimeout(this.observerTimeout);
    this.cleanupObserver();
    this.cleanupToast();
  },
};
</script>

<style lang="styl">
.docs-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: $accentColor;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
  font-size: 14px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
}
</style>

<style lang="styl">
$lineHeight = 1.15rem
$padding = 1rem

.anchor-container {
     position: relative;
     display: inline;
     font-weight: normal;
     
     .anchor-target {
         position: absolute;
         top: 0;
         left: 0;
         margin-top: -($navbarHeight + $lineHeight + $padding);
         padding-top: ($navbarHeight + $lineHeight + $padding);
         height: 0;
         width: 0;
         visibility: hidden;
         z-index: -1000;
     }

     .anchor-link {
       display: inline;
       opacity: 0.8;
       cursor: pointer;
       color: $accentColor;
       font-size: 0.95em;
       font-weight: normal;
       text-decoration: none;
       transition: opacity 0.2s;
       margin-left: 0.15em;
       vertical-align: baseline;
       
       &:hover {
         opacity: 1 !important;
       }
     }
    
    &:hover {
      .anchor-link {
        opacity: 0.8;
      }
    }

}

h1, h2, h3, h4, h5, h6 {
  &:hover {
    .anchor-container {
      .anchor-link {
        opacity: 1;
      }
    }
  }

  & a.header-anchor {
    display: none;
  }
}
</style>
