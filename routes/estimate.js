const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /estimate
router.get('/', async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM item_categories ORDER BY sort_order');
    const items = await pool.query(
      'SELECT i.*, c.name as category_name FROM inventory_items i JOIN item_categories c ON i.category_id = c.id WHERE i.is_active = true ORDER BY i.category_id, i.sort_order'
    );
    const vehicles = await pool.query('SELECT * FROM vehicles WHERE is_active=true ORDER BY sort_order');
    const settingsRows = await pool.query('SELECT * FROM labour_settings');
    const settings = {};
    settingsRows.rows.forEach(s => { settings[s.setting_key] = parseFloat(s.setting_value); });

    res.render('public/estimate', {
      title: 'Estimate Moving Cost - Kalyani Packers and Movers',
      categories: categories.rows,
      items: items.rows,
      vehicles: vehicles.rows,
      settings,
      user: req.session.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { error: err.message });
  }
});

// POST /estimate/calculate-vehicle
router.post('/calculate-vehicle', async (req, res) => {
  try {
    const { vehicle_id, distance_km, weight_kg } = req.body;
    const distance = parseFloat(distance_km);
    const weight = parseFloat(weight_kg);

    if (!distance || distance <= 0) return res.json({ success: false, message: 'Enter valid distance.' });
    if (!weight || weight <= 0) return res.json({ success: false, message: 'Enter valid weight.' });

    const vRes = await pool.query('SELECT * FROM vehicles WHERE id=$1', [vehicle_id]);
    if (vRes.rows.length === 0) return res.json({ success: false, message: 'Vehicle not found.' });
    const v = vRes.rows[0];

    if (weight > v.capacity_kg) {
      return res.json({ success: false, message: `Weight ${weight}kg exceeds ${v.name} capacity of ${v.capacity_kg}kg. Please select a larger vehicle.` });
    }

    const settingsRows = await pool.query('SELECT * FROM labour_settings');
    const settings = {};
    settingsRows.rows.forEach(s => { settings[s.setting_key] = parseFloat(s.setting_value); });

    const baseFare = parseFloat(v.base_fare);
    const distanceCharge = distance * parseFloat(v.per_km_rate);
    const weightCharge = weight * parseFloat(v.per_kg_rate);
    const vehicleTotal = baseFare + distanceCharge + weightCharge;

    // Labour calculation
    const baseLabour = settings.base_labour_count || 2;
    const extraLabour = Math.floor(weight / (settings.weight_per_extra_labour || 150));
    const totalLabour = baseLabour + extraLabour;
    const labourCharge = totalLabour * (settings.labour_rate_per_person || 400);

    const grandTotal = vehicleTotal + labourCharge;

    res.json({
      success: true,
      vehicle_name: v.name,
      capacity: v.capacity_kg,
      distance,
      weight,
      base_fare: baseFare.toFixed(0),
      distance_charge: distanceCharge.toFixed(0),
      weight_charge: weightCharge.toFixed(0),
      vehicle_total: vehicleTotal.toFixed(0),
      labour_count: totalLabour,
      labour_rate: settings.labour_rate_per_person,
      labour_charge: labourCharge.toFixed(0),
      grand_total: grandTotal.toFixed(0)
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Server error.' });
  }
});

// POST /estimate/calculate-material
router.post('/calculate-material', async (req, res) => {
  try {
    const { distance_km, items, vehicle_id } = req.body;
    const distance = parseFloat(distance_km);

    if (!distance || distance <= 0) return res.json({ success: false, message: 'Enter valid distance.' });

    const selectedItems = JSON.parse(items || '[]');
    if (selectedItems.length === 0) return res.json({ success: false, message: 'Select at least one item.' });

    const settingsRows = await pool.query('SELECT * FROM labour_settings');
    const settings = {};
    settingsRows.rows.forEach(s => { settings[s.setting_key] = parseFloat(s.setting_value); });

    const ids = selectedItems.map(i => i.id);
    const dbItems = await pool.query(
      'SELECT i.*, c.name as category_name FROM inventory_items i JOIN item_categories c ON i.category_id = c.id WHERE i.id = ANY($1)',
      [ids]
    );

    let totalWeight = 0;
    const breakdown = [];

    for (const sel of selectedItems) {
      const dbItem = dbItems.rows.find(r => r.id == sel.id);
      if (!dbItem) continue;
      const qty = parseInt(sel.qty) || 1;
      const itemWeight = parseFloat(dbItem.weight_kg) * qty;
      totalWeight += itemWeight;
      const itemPrice = itemWeight * settings.material_base_rate + distance * settings.material_per_km_rate;
      breakdown.push({
        name: dbItem.name,
        qty,
        weight_per: dbItem.weight_kg,
        total_weight: itemWeight,
        price: itemPrice.toFixed(0)
      });
    }

    const basePrice = totalWeight * settings.material_base_rate;
    const distanceCharge = distance * settings.material_per_km_rate * (totalWeight / 100);
    const packingCharge = basePrice * (settings.packing_charge_percent / 100);
    const handlingCharge = basePrice * (settings.handling_charge_percent / 100);
    const materialTotal = basePrice + distanceCharge + packingCharge + handlingCharge;

    // Labour
    const baseLabour = settings.base_labour_count || 2;
    const extraLabour = Math.floor(totalWeight / (settings.weight_per_extra_labour || 150));
    const totalLabour = baseLabour + extraLabour;
    const labourCharge = totalLabour * (settings.labour_rate_per_person || 400);

    // Vehicle suggestion
    let suggestedVehicle = null;
    if (vehicle_id) {
      const vRes = await pool.query('SELECT * FROM vehicles WHERE id=$1', [vehicle_id]);
      if (vRes.rows.length > 0) suggestedVehicle = vRes.rows[0];
    } else {
      const vRes = await pool.query('SELECT * FROM vehicles WHERE capacity_kg >= $1 AND is_active=true ORDER BY capacity_kg ASC LIMIT 1', [totalWeight]);
      if (vRes.rows.length > 0) suggestedVehicle = vRes.rows[0];
    }

    let vehicleCost = 0;
    if (suggestedVehicle) {
      vehicleCost = parseFloat(suggestedVehicle.base_fare) + distance * parseFloat(suggestedVehicle.per_km_rate) + totalWeight * parseFloat(suggestedVehicle.per_kg_rate);
    }

    const grandTotal = materialTotal + labourCharge + vehicleCost;

    res.json({
      success: true,
      total_weight: totalWeight.toFixed(1),
      distance,
      breakdown,
      base_price: basePrice.toFixed(0),
      distance_charge: distanceCharge.toFixed(0),
      packing_charge: packingCharge.toFixed(0),
      handling_charge: handlingCharge.toFixed(0),
      material_total: materialTotal.toFixed(0),
      labour_count: totalLabour,
      labour_rate: settings.labour_rate_per_person,
      labour_charge: labourCharge.toFixed(0),
      suggested_vehicle: suggestedVehicle ? suggestedVehicle.name : null,
      vehicle_cost: vehicleCost.toFixed(0),
      grand_total: grandTotal.toFixed(0)
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Server error.' });
  }
});

// Porter-style vehicle price calculator
router.post('/calculate-porter', async (req, res) => {
  try {
    const { vehicle_id, distance_km, labour_count } = req.body;
    const distance = parseFloat(distance_km);
    const labourCount = parseInt(labour_count) || 0;

    if (!distance || distance <= 0) return res.json({ success: false, message: 'Enter valid distance.' });

    // Porter formula
    let basePrice = 0;
    if (distance <= 4) {
      basePrice = 300;
    } else if (distance <= 10) {
      basePrice = 300 + (distance - 4) * 63;
    } else {
      basePrice = 300 + (6 * 63) + (distance - 10) * 113;
    }

    // Vehicle multiplier
    const vRes = await pool.query('SELECT * FROM vehicles WHERE id=$1', [vehicle_id]);
    if (vRes.rows.length === 0) return res.json({ success: false, message: 'Select a vehicle.' });
    const vehicle = vRes.rows[0];

    // Apply vehicle multiplier based on capacity
    let multiplier = 1;
    if (vehicle.capacity_kg <= 30) multiplier = 1;
    else if (vehicle.capacity_kg <= 500) multiplier = 1.8;
    else if (vehicle.capacity_kg <= 750) multiplier = 2.5;
    else if (vehicle.capacity_kg <= 1200) multiplier = 3.5;
    else multiplier = 5;

    const vehiclePrice = Math.round(basePrice * multiplier);
    const labourCharge = labourCount * 400;
    const grandTotal = vehiclePrice + labourCharge;

    res.json({
      success: true,
      distance,
      vehicle_name: vehicle.name,
      vehicle_price: vehiclePrice,
      labour_count: labourCount,
      labour_charge: labourCharge,
      grand_total: grandTotal
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;