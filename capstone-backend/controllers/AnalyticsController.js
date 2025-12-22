const Capstone = require("../models/Capstone.js");
const User = require("../models/User.js");

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// GET /api/admin/analytics/overview?startDate=...&endDate=...
exports.getOverview = async (req, res) => {
  try {
    const startDate = parseDate(req.query.startDate);
    const endDate = parseDate(req.query.endDate);

    const capstoneMatch = {};
    if (startDate || endDate) {
      capstoneMatch.createdAt = {};
      if (startDate) capstoneMatch.createdAt.$gte = startDate;
      if (endDate) capstoneMatch.createdAt.$lte = endDate;
    }

    const [usersTotal, usersActive, capstoneCounts] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isDeleted: false, isDisabled: false }),
      Capstone.aggregate([
        { $match: capstoneMatch },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
            archived: { $sum: { $cond: [{ $eq: ["$isDeleted", true] }, 1, 0] } },
            activeApproved: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$isDeleted", false] }, { $eq: ["$isApproved", true] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const c = capstoneCounts[0] || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
      activeApproved: 0,
    };

    return res.status(200).send({
      message: "Analytics overview",
      data: {
        users: { total: usersTotal, active: usersActive },
        capstones: c,
        range: { startDate: startDate || null, endDate: endDate || null },
      },
    });
  } catch (err) {
    console.error("getOverview analytics error:", err);
    return res.status(500).send({ message: "Server error when fetching analytics overview" });
  }
};

// GET /api/admin/analytics/capstones/by-year
exports.getApprovedCapstonesByYear = async (req, res) => {
  try {
    const data = await Capstone.aggregate([
      { $match: { isDeleted: false, isApproved: true } },
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, year: "$_id", count: 1 } },
    ]);

    return res.status(200).send({ message: "Approved capstones by year", data });
  } catch (err) {
    console.error("getApprovedCapstonesByYear error:", err);
    return res.status(500).send({ message: "Server error when fetching capstones by year" });
  }
};

// GET /api/admin/analytics/capstones/by-adviser
exports.getApprovedCapstonesByAdviser = async (req, res) => {
  try {
    const data = await Capstone.aggregate([
      { $match: { isDeleted: false, isApproved: true } },
      {
        $group: {
          _id: { $ifNull: ["$adviser", ""] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, adviser: "$_id", count: 1 } },
    ]);

    return res.status(200).send({ message: "Approved capstones by adviser", data });
  } catch (err) {
    console.error("getApprovedCapstonesByAdviser error:", err);
    return res.status(500).send({ message: "Server error when fetching capstones by adviser" });
  }
};

// GET /api/admin/analytics/capstones/submissions-trend?startDate=...&endDate=...
exports.getSubmissionsTrendByMonth = async (req, res) => {
  try {
    const startDate = parseDate(req.query.startDate);
    const endDate = parseDate(req.query.endDate);

    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    const data = await Capstone.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
        },
      },
    ]);

    return res.status(200).send({ message: "Submissions trend by month", data });
  } catch (err) {
    console.error("getSubmissionsTrendByMonth error:", err);
    return res.status(500).send({ message: "Server error when fetching submissions trend" });
  }
};