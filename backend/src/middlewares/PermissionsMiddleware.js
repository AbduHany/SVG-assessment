const checkPermission = (resource, action) => (req, res, next) => {
  const user = req.user;

  if (user.isAdmin) {
    return next();
  }

  const perm = user.permissions.find((p) => p.resource === resource);

  if (!perm) {
    return res.status(403).json({ msg: `No permissions for ${resource}` });
  }

  const actionMap = {
    view: perm.canView,
    create: perm.canCreate,
    update: perm.canUpdate,
    delete: perm.canDelete,
  };

  if (!actionMap[action]) {
    return res
      .status(403)
      .json({ msg: `No permission to ${action} ${resource}` });
  }

  next();
};

module.exports = checkPermission;
