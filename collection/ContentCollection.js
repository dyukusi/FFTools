exports.ContentCollection = class ContentCollection {
  constructor(models) {
    this.models = models;
    this.idToDataMap = null;
  }

  getModelById(id) {
    return __.find(this.models, function(model) {
      return id == model.getId();
    });
  }

  getModelsByType(typeId) {
    return __.filter(this.models, function(model) {
      return typeId == model.getTypeId();
    });
  }

  getIdToDataMap() {
    if (this.idToDataMap) return this.idToDataMap;

    var result = {};
    __.each(this.models, function(model) {
      result[model.getId()] = {
        type_id: model.getTypeId(),
        title_en: model.getTitle_en(),
        title_ja: model.getTitle_ja(),
      };
    });

    this.idToDataMap = result;

    return result;
  }

}



