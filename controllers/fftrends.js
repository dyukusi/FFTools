var express = require('express');
var router = express.Router();
var Gear = require(appRoot + '/models/Gear.js').Gear;
var CharacterSnapshot = require(appRoot + '/models/CharacterSnapshot.js').CharacterSnapshot;
var Equipment = require(appRoot + '/models/Equipment.js').Equipment;
var SnapshotViewHistory = require(appRoot + '/models/SnapshotViewHistory.js').SnapshotViewHistory;
var requestIp = require('request-ip');

/* GET home page. */
router.get('/', function (req, res, next) {
  var idAndCountMap = {};
  Q.allSettled([
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Head'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Body'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Hands'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Legs'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Feet'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('MainHand'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('OffHand'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Earrings'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Necklace'),
    Gear.selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng('Bracelets'),
  ])
    .then(function (results) {
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Head').getId()] = results[0].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Body').getId()] = results[1].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Hands').getId()] = results[2].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Legs').getId()] = results[3].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Feet').getId()] = results[4].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('MainHand').getId()] = results[5].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('OffHand').getId()] = results[6].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Earrings').getId()] = results[7].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Necklace').getId()] = results[8].value;
      idAndCountMap[EquipmentTypeCollection.getModelByTypeNameEng('Bracelets').getId()] = results[9].value;

      var rankingData = {};
      __.each(idAndCountMap, function (idAndCountArray, equipmentTypeId) {
        var ids = __.map(idAndCountArray, function (idAndCount) {
          return idAndCount[0];
        });

        rankingData[equipmentTypeId] = EquipmentCollection.getModelsByIds(ids);
        ;
      });

      res.render('fftrends/index', {
        rankingData: rankingData,
      });
    })
    .fail(function (error) {
      throw new Error(error);
      return;
    });
});

router.get('/snapshot/:snapshot_id', function (req, res, next) {
  var par = req.params;
  var query = req.query;
  var ip = requestIp.getClientIp(req);
  var snapshotId = par["snapshot_id"];
  var isOpenInModal = !!query["isOpenInModal"];

  if (!Number(snapshotId)) {
    res.send("invalid snapshot id");
    return;
  }

  Q.allSettled([
    CharacterSnapshot.selectById(snapshotId),
    Gear.selectBySnapshotId(snapshotId),
    SnapshotViewHistory.selectAndIncrementCountIfNeed(snapshotId, ip),
  ])
    .then(function (results) {
      var snapshotModel = results[0].value;
      var gearModels = results[1].value;
      var snapshotViewHistoryModel = results[2].value;

      var gearMap = __.indexBy(gearModels, function (gearModel) {
        return gearModel.getEquipmentTypeId();
      });

      var equipmentIds = __.chain(gearModels)
        .map(function (gearModel) {
          return [gearModel.getEquipmentId(), gearModel.getMirageEquipmentId(), gearModel.getDyeId()];
        })
        .flatten()
        .compact()
        .value();

      Equipment.selectByIds(equipmentIds)
        .then(function (equipmentModels) {
          var equipmentMap = __.indexBy(equipmentModels, function (equipmentModel) {
            return equipmentModel.getId();
          });

          res.render('fftrends/snapshot', {
            snapshotModel: snapshotModel,
            gearMap: gearMap,
            equipmentMap: equipmentMap,
            isOpenInModal: isOpenInModal,
            snapshotViewHistoryModel: snapshotViewHistoryModel,
          });
        });
    });
});

router.get('/search_gearset_image', function (req, res, next) {
  var query = req.query;
  var equipmentId = query.equipment_id;

  Gear.selectSnapshotIdsForSearchGearSet({
    mirageEquipmentId: equipmentId,
    page: Number(query.page),
    gender: Number(query.gender),
    race: Number(query.race),
    job: Number(query.job),
  })
    .then(function (results) {
      return res.send({
        hasNextPage: results.hasNextPage,
        snapshotIds: results.snapshotIds,
      });
    });
});

router.get('/search_equipment', function (req, res, next) {
  var query = req.query;
  var keyword = query.keyword;
  var targetEquipmentTypeId = Number(query.targetEquipmentTypeId);

  Equipment.searchByNameJP(keyword, {
    targetEquipmentTypeId: targetEquipmentTypeId,
  })
    .then(function (equipmentModels) {
      var equipments = __.map(equipmentModels, function (model) {
        return {
          id: model.getId(),
          type_id: model.getEquipmentTypeId(),
          name: model.getNameJP(),
        };
      });

      return res.send({
        result: equipments,
      });
    });
});

router.get('/search_ranking_detail', function (req, res, next) {
  var query = req.query;
  Gear.selectForMirageRankingDetail({
    equipmentTypeId: Number(query.equipmentTypeId),
    serverId:        Number(query.serverId),
    jobId:           Number(query.jobId),
    genderId:        Number(query.genderId),
    raceId:          Number(query.raceId),
  })
    .then(function (results) {
      return res.send({
        results: results,
      });
    });
});

module.exports = router;


