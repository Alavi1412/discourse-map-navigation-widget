import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import RawHtml from 'discourse/widgets/raw-html';
import { generateMap, setupMap } from '../lib/map-utilities';

export default createWidget('nav-map', {
  tagName: 'div.nav-map',
  buildKey: () => `navMap`,

  defaultState(attrs) {
    return {
      mapObjs: undefined,
      mapToggle: 'fa-expand',
      expanded: false,
      showattribution: false,
      invalidateSize: true,
    }
  },

  editCategory() {
    const appRoute = this.register.lookup('route:application');
    appRoute.send('editCategory', this.state.category);
  },

  editCategoryBtn(isTopic, category) {
    if (isTopic || !category || !category.get('can_edit')) {return ''}
    return this.attach('button', {
      className: "btn edit-category",
      action: "editCategory",
      icon: "wrench",
      title: "category.edit_long"
    })
  },

  aboutList(category, isHome) {
    if (!category) { return '' }
    return this.state.showAttribution ? '' : this.attach('about-list', {
      category: category,
      isHome: isHome
    })
  },

  html(attrs, state) {
    let mapToggle = state.mapToggle;
    let mapObjs = {};

    if (state.mapObjs) {
      mapObjs = state.mapObjs;
    } else {
      mapObjs = generateMap(attrs.category);
      state.mapObjs = mapObjs;
      this.appEvents.on('dom:clean', () => {
        if ($('.leaflet-tile').length && state.invalidateSize) {
          mapObjs.map.invalidateSize(false)
          state.invalidateSize = false;
        }
      });
    }

    if (attrs.category && attrs.category != state.category) {
      state.category = attrs.category
      Ember.run.scheduleOnce('afterRender', () => {
        setupMap(attrs.category, mapObjs.map, mapObjs.geojson, state.showAttribution)
      })
    }

    return [
      this.attach('button', {
        className: `btn fa ${mapToggle} nav-map-expand`,
        action: 'toggleExpand'
      }),
      this.editCategoryBtn(attrs.isTopic, attrs.category),
      new RawHtml({ html: mapObjs.element }),
      this.aboutList(attrs.category, attrs.isHome),
      this.attach('button', {
        className: 'btn fa fa-info nav-map-attribution',
        action: 'toggleAttribution'
      })
    ]
  },

  toggleExpand() {
    const category = this.state.category,
          map = this.state.mapObjs.map,
          $map = $('.nav-map'),
          $attribution = $('.nav-map .leaflet-control-attribution');

    $map.toggleClass('expanded')
    if ($map.hasClass('expanded')) {
      if ($attribution.is(':hidden')) {
        map.addControl(attributionControl)
      }
      this.state.showAttribution = false;
      this.state.mapToggle = "fa-compress";
    } else {
      this.state.mapToggle = "fa-expand";
    }
    map.invalidateSize()
  },

  toggleAttribution() {
    this.state.showAttribution = !this.state.showAttribution
  }
})
