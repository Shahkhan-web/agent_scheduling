const express = require("express");
const router = express.Router(); 

const list = require('../controllers/list')

router.route("/masterlist").get(list.get_masterl_list);
 
router.route("/clusterred_list").get(list.get_clustered_branches);
 
module.exports = router;
