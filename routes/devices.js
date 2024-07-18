const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Camera = require('../models/camera');
const ElectricFence = require('../models/electricFence');

// Endpoint to add a new device
router.post('/', (req, res) => {
  const { deviceType, deviceId, deviceName, deviceLocation, deviceLatitude, deviceLongitude, status } = req.body;

  let typePrefix;
  let DeviceModel;

  if (deviceType === 'Camera') {
    typePrefix = 'cam';
    DeviceModel = Camera;
  } else if (deviceType === 'Electric Fence') {
    typePrefix = 'ef';
    DeviceModel = ElectricFence;
  } else {
    return res.status(400).json({ error: 'Invalid device type' });
  }

  const deviceData = {
    [`${typePrefix}_id`]: deviceId,
    [`${typePrefix}Name`]: deviceName,
    [`${typePrefix}Location`]: deviceLocation,
    [`${typePrefix}Lat`]: deviceLatitude,
    [`${typePrefix}Long`]: deviceLongitude,
    [`${typePrefix}Stat`]: status
  };

  DeviceModel.create(deviceData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add device' });
    }
    res.status(200).json({ success: true, message: 'Device added successfully' });
  });
});

module.exports = router;
