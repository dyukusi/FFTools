exports.SkillCollection = class SkillCollection {
  constructor(models) {
    this.models = models;
  }

  // return only role actions
  getModelsByOnlyRoleId(roleId) {
    return __.filter(this.models, function(model) {
      return !model.getJobId() && roleId == model.getRoleId();
    });
  }

  getModelsByJobId(jobId) {
    return __.filter(this.models, function(model) {
      return jobId == model.getJobId();
    });
  }
}



