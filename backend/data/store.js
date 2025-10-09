export const db = {
  otps: new Map(),
  users: new Map(),
  residents: new Map(),
  packages: new Map(),
  shelves: new Map(),
  shipments: new Map(),
  wallet: new Map(),
  events: []
};

export const getNextId = (collection) => {
  const next = collection.size + 1;
  return String(next).padStart(6, '0');
};

export const addEvent = (type, message, metadata = {}) => {
  const event = {
    id: db.events.length + 1,
    type,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };
  db.events.unshift(event);
  return event;
};
