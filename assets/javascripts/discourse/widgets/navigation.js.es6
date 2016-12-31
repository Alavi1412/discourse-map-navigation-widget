import { createWidget } from 'discourse/widgets/widget';
import { avatarImg } from 'discourse/widgets/post';
import { h } from 'virtual-dom';
import { ajax } from 'discourse/lib/ajax';

export default createWidget('navigation', {
  tagName: 'div.widget-container.nav-container',

  html(attrs, state) {
    const topic = attrs.topic;
    const user = this.currentUser;
    const category = attrs.category;
    let isHome = category && category.get('url') === ('/c/' + user.get('home_category'));
    let isTopic = Boolean(topic)

    let contents = [
      this.attach('nav-header', {
        category: category,
        isHome: isHome
      }),
      this.attach('nav-map', {
        category: category,
        isHome: isHome,
        isTopic: isTopic
      })
    ]
    
    return contents;
  }
})
