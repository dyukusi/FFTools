exports.RoleCollection = class RoleCollection {
  constructor(models) {
    this.models = models;
  }

  getModelById(id) {
    return __.find(this.models, function(model) {
      return id == model.getId();
    });
  }
}



