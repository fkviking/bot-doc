/**
 * Client app enhancement file.
 *
 * https://v1.vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements
 */

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {

  router.afterEach((to) => {
    setTimeout(() => {
      try {
        const isHomePage = ['/', '/en/'].includes(to.path)
        if (isHomePage) transformFeatureToLink(to, siteData);
      } catch (error) {
        console.error('Error in enhanceApp.js', error);
      }
    }, 100);
  });
}


function transformFeatureToLink(to, siteData) {
  const features = siteData.pages?.find(page => page.path === to.path)?.frontmatter?.features
  const featureLinks = features?.map(feature => feature.link)
  const featureTitles = features?.map(feature => feature.title)

  const $features = document.querySelectorAll('.features .feature');

  $features.forEach((feature, index) => {
    const $title = feature.firstChild

    if (!$title) return;
    if (!featureLinks || !featureLinks?.[index]) return;

    const href = `${siteData.base}${featureLinks[index]}`.replaceAll(/[\/]+/g, '/')
    const text = featureTitles[index];

    const a = document.createElement('a');

    a.href = href;
    a.textContent = text;
    $title.replaceWith(a);
    a.classList.add('feature-link');
  });

}
