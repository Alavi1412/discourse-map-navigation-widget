import { createWidget } from 'discourse/widgets/widget';
import DiscourseURL from 'discourse/lib/url';
import { ajax } from 'discourse/lib/ajax';
import { h } from 'virtual-dom';

export default createWidget('about-list', {
  tagName: 'div.about-list',
  buildKey: (attrs) => `showAboutList`,

  defaultState() {
    return {
      showAboutList: true
    }
  },

  html(attrs) {
    const category = attrs.category;
    const isHome = attrs.isHome;

    let aboutNode = this.attach('button', {
      className: 'btn widget-button',
      action: 'goToAboutPlace',
      label: 'about.simple_title'
    })

    let aboutPlace = category && category.topic_url ? aboutNode : ''
    let setHomeNode = this.attach('button', {
      className: 'btn widget-button',
      action: 'setHomePlace',
      label: 'user.home_category',
      icon: 'plus'
    })
    let setHome = isHome ? '' : setHomeNode
    let catNotfBtn = category ? this.attach('category-notifications-button', {
      className: 'btn widget-button',
      category: category
    }) : ''
    let aboutList = [
      aboutPlace,
      setHome,
      catNotfBtn
    ]
    return this.state.showAboutList ? aboutList : ''
  },

  goToAboutPlace: function() {
    DiscourseURL.routeTo(this.attrs.category.topic_url)
  },

  setHomePlace: function() {
    let category = this.attrs.category,
        slug = category.slug,
        parent = category.parentCategory;
    if (parent) {
      slug = parent.slug + '/' + slug
    }
    ajax("/users/" + this.currentUser.username, {
      type: "PUT",
      data: {
        custom_fields: {
          home_category: slug
        }
      }
    }).then(function(result){
      Discourse.User.current().set('location', result.user.home_category);
    })
  }
})
