const blocked = new Set();

export function isBlocked(userId) {
  return blocked.has(parseInt(userId));
}

export function blockUser(userId) {
  blocked.add(parseInt(userId));
  return true;
}

export function unblockUser(userId) {
  blocked.delete(parseInt(userId));
  return true;
}

export function listBlocked() {
  return Array.from(blocked);
}

export default { isBlocked, blockUser, unblockUser, listBlocked };
