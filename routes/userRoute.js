const express = require('express');
const { getAllUser, addUser, deleteUser, updatedUser, getUserById } = require('../controllers/userController');
const router = express.Router();

router.get("/", getAllUser);
router.post("/add", addUser);
router.put('/:id', updatedUser);
router.delete('/:id', deleteUser);
router.get('/:id', getUserById);

module.exports = router;