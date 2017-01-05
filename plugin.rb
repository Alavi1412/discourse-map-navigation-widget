# name: discourse-map-navigation-widget
# about: A widget that provides map-based navigation for Discourse categories. Requires discourse-layouts.
# version: 0.1
# authors: Angus McLeod

register_asset 'stylesheets/navigation-widget.scss'
register_asset 'lib/leaflet/leaflet.css'
register_asset 'lib/leaflet/leaflet.js'

after_initialize do
  Category.register_custom_field_type('has_geojson', :boolean)
  Category.register_custom_field_type('geojson', :json)
  User.register_custom_field_type("home_category", :string)
  User.preloaded_custom_fields << "home_category" if User.respond_to? :preloaded_custom_fields

  add_to_serializer(:basic_category, :has_geojson) {object.custom_fields["has_geojson"]}
  add_to_serializer(:basic_category, :geojson) {object.custom_fields["geojson"]}
  add_to_serializer(:user, :home_category) {object.custom_fields["home_category"]}
  add_to_serializer(:current_user, :home_category) {object.custom_fields["home_category"]}

  SiteSetting.class_eval do
    @choices[:layouts_sidebar_right_widgets].push('navigation')
  end
end
