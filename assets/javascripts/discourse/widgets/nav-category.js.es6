import { createWidget } from 'discourse/widgets/widget';
import Category from 'discourse/models/category';
import DiscourseURL from 'discourse/lib/url';
import RawHtml from 'discourse/widgets/raw-html';
import { h } from 'virtual-dom';

function categoryStripe(color, classes) {
  var style = color ? "style='background-color: #" + color + ";'" : "";
  return "<span class='" + classes + "' " + style + "></span>";
}

function categoryStripeHTML(category, listVisible) {
  var get = Em.get;
  let parentCat = category ? Discourse.Category.findById(get(category, 'parent_category_id')) : false;
  let html = '';
  let categoryColor = category ? get(category, 'color') : 'fff';
  let classes = Discourse.SiteSettings.category_style;
  let empty = !category || listVisible;

  if (empty) {
    categoryColor = 'fff'
    classes += ' empty'
  }

  if (parentCat && parentCat !== category) {
    let parentColor = empty ? 'fff' : get(parentCat, 'color')
    html += categoryStripe(parentColor, "badge-category-parent-bg");
  }
  html += categoryStripe(categoryColor, "badge-category-bg");

  return "<div class='badge-wrapper " + classes + "'>" + html + "</div>";
}

createWidget('category-item', {
  tagName: 'li',

  html(attrs) {
    return [
      new RawHtml({ html: categoryStripeHTML(attrs.category) }),
      attrs.category.name
    ]
  },

  click() {
    this.sendWidgetAction('goToCategory', this.attrs.category)
  }
})

createWidget('category-input', {
  tagName: 'input',
  buildId: () => 'category-input',
  buildKey: () => 'category-input',

  defaultState(attrs) {
    return {
      category: attrs.category
    }
  },

  buildAttributes(attrs) {
    return {
      type: 'text',
      value: attrs.category.name || '',
      placeholder: 'Category'
    };
  },

  click() {
    this.sendWidgetAction('toggleList', true)
  },

  keyDown(e) {
    this.sendWidgetAction('toggleList', true)
    if (e.which === 9) {
      return this.sendWidgetAction('autoComplete')
    }
  },

  clickOutside() {
    this.sendWidgetAction('toggleList', false)
  },

  keyUp(e) {
    if (e.which === 13) {
      let category = this.state.category;
      if (this.attrs.topResult) {
        category = this.attrs.topResult
      }
      this.sendWidgetAction('toggleList', false)
      return this.sendWidgetAction('goToCategory', category);
    }
    this.sendWidgetAction('inputChanged', e.target.value);
  }
})

export default createWidget('nav-category', {
  tagName: 'div',
  buildKey: () => 'nav-category',

  defaultState(attrs) {
    let filter = attrs.category ? attrs.category.name : '';
    return {
      category: attrs.category,
      categories: this.filterCategories(filter),
      listVisible: false
    }
  },

  buildClasses(attrs) {
    const result = [];
    result.push('nav-category');
    if (attrs.className) { result.push(attrs.className); };
    return result;
  },

  filterCategories(filterBy) {
    let val = filterBy ? filterBy.toLowerCase() : '';
    return Category.list().filter((c) => {
      const name = c.get('name').toLowerCase();
      return name.indexOf(val) > -1
    }).slice(0,8)
  },

  getCategoryList() {
    let options = []
    this.state.categories.forEach((c) => {
      options.push(this.attach('category-item', {
        category: c
      }))
    })
    return options
  },

  html(attrs, state) {
    let contents = [
      new RawHtml({ html: categoryStripeHTML(state.category, state.listVisible) }),
      this.attach('category-input', {
        category: state.category || {},
        topResult: state.categories[0] || false
      })
    ]
    if (state.listVisible) {
      const list = this.getCategoryList();
      contents.push(
        h('ul.nav-category-list', list)
      )
    }
    return contents
  },

  inputChanged(value) {
    this.state.categories = this.filterCategories(value)
  },

  autoComplete() {
    this.goToCategory(this.state.categories[0])
  },

  toggleList(visible) {
    this.state.listVisible = visible
  },

  goToCategory(category) {
    this.state.category = category
    const node = document.getElementById('category-input');
    if (node) {
      node.value = category.name
    }
    DiscourseURL.routeTo(category.get('url'))
  }
})
