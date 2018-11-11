exports.EquipmentCollection = class EquipmentCollection {
  constructor(models) {
    this.models = __.indexBy(models, 'id');
  }

  getModelsByIds(ids) {
    var models = this.models;
    return __.map(ids, function(id) {
      return models[id];
    });
  }

  createMapForRankingByIds(ids) {
    var models = this.models;
    var ranking = __.map(ids, function(id) {
      var model = models[id];
      return [model.getId(), model.getEquipmentTypeId(), model.getNameEng(), model.getNameJP()];
    });

    return {
      ranking: ranking,
    };
  }
}



