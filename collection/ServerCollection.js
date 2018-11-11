exports.ServerCollection = class ServerCollection {
  constructor(models) {
    this.models = models;

    var dcIdtoModelsMap = {};
    __.each(models, function (m) {
      var dcId = m.getDcId();

      if (!dcIdtoModelsMap[dcId]) {
        dcIdtoModelsMap[dcId] = [];
      }

      dcIdtoModelsMap[dcId].push(m);
    });
    this.dcIdtoModelsMap = dcIdtoModelsMap;
  }

  getModelById(id) {
    return __.find(this.models, function (model) {
      return id == model.getId();
    });
  }

  getModelsByDcId(dcId) {
    return this.dcIdtoModelsMap[dcId];
  }
}



