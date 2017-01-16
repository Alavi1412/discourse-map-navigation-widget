let mapStyle = function(feature, highlight) {
  return {
    fillColor: feature.parent ? "#ff7800" : "#0088cc",
    weight: highlight ? 1 : 0.5,
    fillOpacity: feature.parent ? 0.4 : 0,
    color: feature.parent ? "#ff7800" : "#0088cc",
    opacity: 0.6
  };
}

let getGeoJson = function(category) {
  let geojson;

  function isActive(layer) {
    if (!category) {return false}
    let slug = layer.feature.slug,
        parentSlug = category.parentCategory && category.parentCategory.slug
    return category.slug === slug || parentSlug === slug
  }

  function highlightFeature(e) {
    let layer = e.target;
    if (!isActive(layer)) {
      let style = mapStyle(layer.feature, true)
      layer.setStyle(style);
      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }
    }
  }

  function resetHighlight(e) {
    let layer = e.target
    if (!isActive(layer)) {
      geojson.resetStyle(layer);
    }
  }

  function zoomToFeature(e) {
    let feature = e.target.feature,
        slug = feature.parent ? feature.parent + '/' + feature.slug : feature.slug,
        route = "/c/" + slug
    DiscourseURL.routeTo(route)
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  geojson = L.geoJson(false, {
    onEachFeature: onEachFeature,
    style: mapStyle
  })

  const categories = Discourse.Category.list()
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].has_geojson) {
      geojson.addData(JSON.parse(categories[i].geojson))
    }
  }

  return geojson
}

let generateMap = function(category) {
  let element = document.createElement('div')

  let map = L.map(element, {
    zoomControl: false,
    attributionControl: false
  }).fitWorld()

  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  let geojson = getGeoJson(category)
  geojson.addTo(map)

  let attribution = L.control.attribution({ position: 'bottomright' });

  return { element: element, map: map, geojson: geojson, attribution: attribution };
}

let setupMap = function(category, map, geojson) {
  if (category) {
    let slug = category.slug,
        parentSlug = category.parentCategory ? category.parentCategory.slug : null;

    geojson.eachLayer(function (layer) {
      if (layer.feature.slug === slug) {
        let style = mapStyle(layer.feature, true)
        layer.setStyle(style)
        map.fitBounds(layer.getBounds())
      } else if (layer.feature.slug === parentSlug) {
        layer.setStyle({
          fillOpacity: 0
        })
      } else {
        geojson.resetStyle(layer)
      }
    })
  } else {
    geojson.eachLayer(function (layer) {
      geojson.resetStyle(layer)
    })
    map.fitWorld()
  }
}

export { generateMap, setupMap }
