exports.ContentTypeCollection = class ContentTypeCollection {
  constructor(models) {
    this.models = models;
    this.idToDataMap = null;
  }

  getModelById(id) {
    return __.find(this.models, function(model) {
      return id == model.getId();
    });
  }

  getAllModelsWithIdOrder() {
    return __.sortBy(this.models, function(model) {
      return model.getId();
    });
  }

  getIdToDataMap() {
    if (this.idToDataMap) return this.idToDataMap;

    var result = {};
    __.each(this.models, function(model) {
      result[model.getId()] = {
        title_en: model.getTitle_en(),
        title_ja: model.getTitle_ja(),
        icon_path: model.getIconPath()
      };
    });

    this.idToDataMap = result;

    return result;
  }

}



