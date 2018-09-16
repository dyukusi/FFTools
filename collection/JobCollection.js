exports.JobCollection = class JobCollection {
  constructor(models) {
    this.models = models;
  }

  getModelsByRoleId(roleId) {
    return __.filter(this.models, function(model) {
      return roleId == model.getRoleId();
    });
  }
}



