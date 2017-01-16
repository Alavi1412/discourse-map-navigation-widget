import jsonFileUploader from 'discourse/components/json-file-uploader';

export default jsonFileUploader.extend({
  classNames: ['geojson-uploader'],

  fileName: function() {
    const value = this.get('value')
    if (!value) { return "No geojson file uploaded" }

    let obj = typeof value === 'object' ? value : JSON.parse(value);
    return obj.fileName || "Geojson file uploaded, but fileName not set"
  }.property('value')
})
