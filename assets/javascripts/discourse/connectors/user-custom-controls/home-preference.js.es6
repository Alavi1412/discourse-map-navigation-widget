export default {
  setupComponent(args, component) {
    var categories = Discourse.Category.list(),
        slugs = [];
    if (!categories) {return}
    categories.forEach(function (c){
      var slug = c.slug
      if (c.parentCategory) {
        slug = c.parentCategory.slug + '/' + c.slug
      }
      slugs.push(slug)
    })
    component.set('categorySlugs', slugs);
  }
}
