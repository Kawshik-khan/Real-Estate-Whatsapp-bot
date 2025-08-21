import { Project } from '../models/Project.js';

export async function getProjectCountsByType() {
  const pipeline = [
    { $group: { _id: { type: '$type', status: '$status' }, count: { $sum: 1 } } }
  ];
  const agg = await Project.aggregate(pipeline);
  const result = {};
  for (const row of agg) {
    const type = row._id.type || 'unknown';
    const status = row._id.status || 'unknown';
    result[type] = result[type] || {};
    result[type][status] = row.count;
  }
  return result;
}


