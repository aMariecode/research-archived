const mongoose = require("mongoose");
const Capstone = require("../models/Capstone.js");

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const baseFilter = {
  isDeleted: false,
  isApproved: true,
};

const projection = {
  _id: 1,
  previewImage: 1,
  title: 1,
  abstract: 1,
  members: 1,
  adviser: 1,
  year: 1,
  technologies: 1,
  githubUrl: 1,
  createdBy: 1,
  createdAt: 1,
};

const createdByPopulate = {
  path: "createdBy",
  select: "_id fullName email",
};

// ✅ SEARCH ONLY (keywords)
exports.searchCapstones = async (req, res) => {
  try {
    const keywords = String(req.query.keywords || req.query.q || "").trim();

    if (!keywords) {
      return res.status(400).send({
        message: "keywords is required for search",
        data: [],
      });
    }

    // Fix: Always allow partial match for author (members) and title, even for single word
    const rx = new RegExp(escapeRegex(keywords), "i");
    mongoQuery = {
      ...baseFilter,
      $or: [
        { title: rx },
        { abstract: rx },
        { adviser: rx },
        { technologies: rx },
        { members: rx },
      ],
    };
    sort = { year: -1 };

    const results = await Capstone.find(
      mongoQuery,
      keywords.length < 3
        ? projection
        : { ...projection, score: { $meta: "textScore" } }
    )
      .sort(sort)
      .populate(createdByPopulate);

    return res.status(200).send({
      message: results.length ? "Search results:" : "No results found.",
      data: results,
    });
  } catch (err) {
    console.error("searchCapstones error:", err);
    return res.status(500).send({
      message: "Server error when searching capstones",
    });
  }
};

// ✅ FILTER ONLY (year/adviser/createdBy)
exports.filterCapstones = async (req, res) => {
  try {
    const yearRaw = req.query.year;
    const adviserRaw = req.query.adviser;
    const createdByRaw = req.query.createdBy;

    // For year filter, show all capstones regardless of approval/deletion
    const filter = {};

    if (yearRaw !== undefined && String(yearRaw).trim() !== "") {
      const year = Number(yearRaw);
      if (!Number.isInteger(year)) {
        return res.status(400).send({ message: "Invalid year filter", data: [] });
      }
      filter.year = year;
    }

    if (adviserRaw !== undefined && String(adviserRaw).trim() !== "") {
      filter.adviser = {
        $regex: escapeRegex(String(adviserRaw).trim()),
        $options: "i",
      };
    }

    if (createdByRaw !== undefined && String(createdByRaw).trim() !== "") {
      const createdBy = String(createdByRaw).trim();
      if (!mongoose.Types.ObjectId.isValid(createdBy)) {
        return res.status(400).send({
          message: "Invalid createdBy filter",
          data: [],
        });
      }
      filter.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    const results = await Capstone.find(filter, projection)
      .sort({ year: -1 })
      .populate(createdByPopulate);

    return res.status(200).send({
      message: results.length ? "Filtered results:" : "No results found.",
      data: results,
    });
  } catch (err) {
    console.error("filterCapstones error:", err);
    return res.status(500).send({
      message: "Server error when filtering capstones",
    });
  }
};

