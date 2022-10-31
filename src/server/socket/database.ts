import Enmap from 'enmap';

// CREATE IF NOT EXISTS OR RECOVER TABLE 'connections'
export const connections = new Enmap({ name: 'connections' });
export const lobbies = new Enmap({ name: 'lobbies' });