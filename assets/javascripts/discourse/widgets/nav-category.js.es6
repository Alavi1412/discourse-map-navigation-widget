import { createWidget } from 'discourse/widgets/widget';
import Category from 'discourse/models/category';
import DiscourseURL from 'discourse/lib/url';
import { h } from 'virtual-dom';

createWidget('category-item', {
  tagName: 'li',

  html(attrs) {
    return attrs.category.name
  },

  click() {
    this.sendWidgetAction('goToCategory', this.attrs.category)
  }
})

createWidget('category-input', {
  tagName: 'input',
  buildId: () => 'category-input',

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
      return this.sendWidgetAction('goToCategory', this.state.category);
    }
    this.sendWidgetAction('inputChanged', e.target.value);
  }
})

export default createWidget('nav-category', {
  tagName: () => 'div',
  buildKey: () => 'nav-category',

  defaultState(attrs) {
    let category = attrs.category || '';
    return {
      category: category,
      categories: this.filterCategories(category.name),
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
    this.state.categories.forEach((category) => {
      options.push(this.attach('category-item', {
        category: category
      }))
    })
    return options
  },

  html(attrs, state) {
    let contents = [this.attach('category-input', {
      category: state.category || {}
    })]
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
