const { use_db } = require("../config/db_pool");

const get_masterl_list = async (req, res) => {
  const masterlist = await use_db(`select * from masterlist_branches`);
  res.status(200).json(masterlist.rows);
};

const get_clustered_branches = async (req, res) => {
  const list = await use_db(`select * from branches`);
  const waypoints = await use_db(`select * from waypoints`);

  let data = { masterlist: list.rows, waypoints: waypoints.rows };

  const mutatedData = data.masterlist.reduce((result, item) => {
    const existingGroup = result.find((group) => group.group === item.array_id);

    if (existingGroup) {
      existingGroup.branches.push({
        lat: parseFloat(item.lat),
            long: parseFloat(item.lng),
            branch: item.branch,
            city: item.city,
            duration: item.duration,
            frequency: item.frequency,
            google_link:item.google_link, 
            name: item.name,
            project: item.project,
      });
    } else {
      result.push({
        group: item.array_id,
        branches: [
          {
            lat: parseFloat(item.lat),
            long: parseFloat(item.lng),
            branch: item.branch,
            city: item.city,
            duration: item.duration,
            frequency: item.frequency,
            google_link:item.google_link, 
            name: item.name,
            project: item.project,
          },
        ],
        waypoints:
          data.waypoints.find((waypoint) => waypoint.id === item.array_id)
            ?.waypoints || [],
      });
    }

    return result;
  }, []);

  res.status(200).json(mutatedData);
};

module.exports = {
  get_masterl_list,
  get_clustered_branches,
};

