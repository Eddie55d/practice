const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travelController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/my-travels', authMiddleware, travelController.getUserTravels);
router.post('/', authMiddleware, travelController.createTravel);
router.post('/:id/places', authMiddleware, travelController.savePlaces);


router.get('/', travelController.getAllTravels);
router.get('/:id', travelController.getTravelById);



module.exports = router;