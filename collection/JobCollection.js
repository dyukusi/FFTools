exports.JobCollection = class JobCollection {
  constructor(models) {
    this.models = models;
  }

  getTankJobModels() {
    return __.filter(this.models, function(model) {
      return model.getRoleId() == 1;
    });
  }

  getHealerJobModels() {
    return __.filter(this.models, function(model) {
      return model.getRoleId() == 2;
    });
  }

  getDPSJobModels() {
    return __.filter(this.models, function(model) {
      return model.getRoleId() == 3 || model.getRoleId() == 4 || model.getRoleId() == 5;
    });
  }

  getFighterJobModels() {
    return __.filter(this.models, function(model) {
      return model.getRoleId() < 10;
    });
  }

  getModelById(jobId) {
    return __.find(this.models, function(model) {
      return jobId == model.getId();
    });
  }

  getModelsByRoleId(roleId) {
    return __.filter(this.models, function(model) {
      return roleId == model.getRoleId();
    });
  }
}



