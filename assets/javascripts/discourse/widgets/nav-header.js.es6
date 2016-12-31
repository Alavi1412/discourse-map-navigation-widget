import DiscourseURL from 'discourse/lib/url';
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

export default createWidget('nav-header', {
  tagName: 'div.widget-header',

  homeBtn(isHome) {
    const user = this.currentUser;
    let homeBtnClass = isHome ? 'is-home' : ''

    let homeButtonNode = this.attach('button', {
      className: `btn place-home ${homeBtnClass}`,
      label: 'user.home_category',
      icon: 'home',
      action: 'goToDefaultPlace'
    });

    return user && !user.get('is_anonymous') ? homeButtonNode : '';
  },

  html(attrs) {
    const category = attrs.category;
    const isHome = attrs.isHome;
    const user = this.currentUser;
    let catClasses = user ? '' : 'guest';

    return h('div.nav-header', [
      this.homeBtn(isHome),
      this.attach('nav-category',
        { className: catClasses},
        { category: category }
      )
    ])
  },

  goToDefaultPlace: function() {
    let slug = this.currentUser.get('home_category');
    let url = slug ? ('/c/' + slug) : '/';
    DiscourseURL.routeTo(url)
  }
})
