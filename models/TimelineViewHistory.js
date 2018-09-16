var appRoot = require('app-root-path');
var TimelineViewHistory = require(appRoot + '/models/TimelineViewHistory.js').TimelineViewHistory;

exports.TimelineViewHistory = class TimelineViewHistory {
  constructor(id, ip, timelineId, createdAt) {
    this.id = id;
    this.ip = ip;
    this.timelineId = timelineId;
    this.createdAt = createdAt;
  }

  getId() {
    return this.id;
  }

  getIp() {
    return this.ip;
  }

  getTimelineId() {
    return this.timelineId;
  }

  getCreatedAt() {
    return this.createdAt;
  }
}
