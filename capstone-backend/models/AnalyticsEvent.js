const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema({
    type: { type: String, enum: ['visit', 'view', 'download'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    capstone: { type: mongoose.Schema.Types.ObjectId, ref: 'Capstone' },
    timestamp: { type: Date, default: Date.now },
    meta: { type: Object },
});

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);