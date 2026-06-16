export function getMediaUrl(path, fallback) {
  if (!path) return `media://${fallback || 'assets/producto_comodin.webp'}`;
  if (path.startsWith('media://')) return path;
  const normalized = path.replace(/\\/g, '/');
  return `media://${normalized}`;
}

export function getUserAvatar(user) {
  if (user.image_path) return getMediaUrl(user.image_path);
  const avatarMap = {
    Administrator: 'assets/administrador.webp',
    Supervisor: 'assets/supervisor.webp',
    Cashier: 'assets/empleado.webp',
  };
  return `media://${avatarMap[user.role] || 'assets/empleado.webp'}`;
}
