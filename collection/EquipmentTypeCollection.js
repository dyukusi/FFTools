exports.EquipmentTypeCollection = class EquipmentTypeCollection {
  constructor(models) {
    this.models = models;
    this.mapById = __.indexBy(models, function(model) {
      return model.getId();
    });
    this.mapByNameEng = __.indexBy(models, function(model) {
      return model.getNameEng();
    });
  }

  getModelByTypeNameEng(nameEng) {
    return this.mapByNameEng[nameEng];
  }

  getModelById(id) {
    return this.mapById[id];
  }

  getSortedModelsForRankingSummary() {
    if (this.sortedModelsForRankingSummary) return this.sortedModelsForRankingSummary;

    this.sortedModelsForRankingSummary = [
      this.getModelByTypeNameEng('Head'),
      this.getModelByTypeNameEng('Body'),
      this.getModelByTypeNameEng('Hands'),
      this.getModelByTypeNameEng('Legs'),
      this.getModelByTypeNameEng('Feet'),
      this.getModelByTypeNameEng('MainHand'),
      this.getModelByTypeNameEng('OffHand'),
      this.getModelByTypeNameEng('Earrings'),
      this.getModelByTypeNameEng('Necklace'),
      this.getModelByTypeNameEng('Bracelets'),
    ];

    return this.sortedModelsForRankingSummary;
  }

  getSortedTypeIdArrayForGearSet() {
    if (this.sortedTypeIdArrayForGearSet) return this.sortedTypeIdArrayForGearSet;

    this.sortedTypeIdArrayForGearSet = [
      this.getModelByTypeNameEng('MainHand').getId(),
      this.getModelByTypeNameEng('OffHand').getId(),
      this.getModelByTypeNameEng('Alchemist').getId(),
      this.getModelByTypeNameEng('Armorer').getId(),
      this.getModelByTypeNameEng('Blacksmith').getId(),
      this.getModelByTypeNameEng('Carpenter').getId(),
      this.getModelByTypeNameEng('Culinarian').getId(),
      this.getModelByTypeNameEng('Goldsmith').getId(),
      this.getModelByTypeNameEng('Leatherworker').getId(),
      this.getModelByTypeNameEng('Weaver').getId(),
      this.getModelByTypeNameEng('Botanist').getId(),
      this.getModelByTypeNameEng('Fisher').getId(),
      this.getModelByTypeNameEng('Miner').getId(),
      this.getModelByTypeNameEng('Head').getId(),
      this.getModelByTypeNameEng('Body').getId(),
      this.getModelByTypeNameEng('Hands').getId(),
      this.getModelByTypeNameEng('Waist').getId(),
      this.getModelByTypeNameEng('Legs').getId(),
      this.getModelByTypeNameEng('Feet').getId(),
      this.getModelByTypeNameEng('Earrings').getId(),
      this.getModelByTypeNameEng('Necklace').getId(),
      this.getModelByTypeNameEng('Bracelets').getId(),
      this.getModelByTypeNameEng('Ring1').getId(),
      this.getModelByTypeNameEng('Ring2').getId(),
      this.getModelByTypeNameEng('SoulCrystal').getId(),
    ];

    return this.sortedTypeIdArrayForGearSet;
  }
}



