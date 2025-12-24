export type Permission = {
  id: string;
  resource: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export const resolvePermissions = (
  permissions: Permission[] | null,
  resource: string,
  isAdmin?: boolean
) => {
  if (isAdmin) {
    return {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    };
  }

  const permission = permissions?.find((p) => p.resource === resource);

  return {
    canView: Boolean(permission?.canView),
    canCreate: Boolean(permission?.canCreate),
    canUpdate: Boolean(permission?.canUpdate),
    canDelete: Boolean(permission?.canDelete),
  };
};
