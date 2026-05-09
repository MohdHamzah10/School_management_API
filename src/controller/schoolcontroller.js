const { pool } = require("../config/db");
const { haversineDistance, formatDistance } = require("../utils/distance");

/*
 * POST /addSchool
 * Add a new school to the database
 */
const addSchool = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    const [existing] = await pool.execute(
      "SELECT id FROM schools WHERE name = ? AND address = ?",
      [name.trim(), address.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A school with the same name and address already exists",
        existingId: existing[0].id,
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [name.trim(), address.trim(), parseFloat(latitude), parseFloat(longitude)]
    );

   
    const [newSchool] = await pool.execute(
      "SELECT id, name, address, latitude, longitude, created_at FROM schools WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "School added successfully",
      data: newSchool[0],
    });
  } catch (err) {
    console.error("addSchool error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding school",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/*
 * GET /listSchools
 * Fetch all schools sorted by proximity to user's location
 */
const listSchools = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    // Fetch all schools
    const [schools] = await pool.execute(
      "SELECT id, name, address, latitude, longitude, created_at FROM schools ORDER BY id"
    );

    if (schools.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No schools found in the database",
        userLocation: { latitude: userLat, longitude: userLon },
        count: 0,
        data: [],
      });
    }


    const schoolsWithDistance = schools
      .map((school) => {
        const distanceKm = haversineDistance(
          userLat,
          userLon,
          school.latitude,
          school.longitude
        );
        return {
          ...school,
          distance_km: parseFloat(distanceKm.toFixed(4)),
          distance_formatted: formatDistance(distanceKm),
        };
      })
      .sort((a, b) => a.distance_km - b.distance_km);

    return res.status(200).json({
      success: true,
      message: "Schools retrieved and sorted by proximity",
      userLocation: { latitude: userLat, longitude: userLon },
      count: schoolsWithDistance.length,
      data: schoolsWithDistance,
    });
  } catch (err) {
    console.error("listSchools error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching schools",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = { addSchool, listSchools };