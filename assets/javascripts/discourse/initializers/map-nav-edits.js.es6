import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'map-nav-edits',
  initialize(){

    // changes the location navigated to when the site logo is clicked
    if (Discourse.SiteSettings.widget_map_logo_url_override) {
      withPluginApi('0.1', api => {
        const user = api.getCurrentUser()
        if (!user) {return}
        const home = user.home_category;
        if (home) {
          var homeUrl = "/c/" + home;
          api.changeWidgetSetting('home-logo', 'href', homeUrl)
        }
      })
    }
  }
}
