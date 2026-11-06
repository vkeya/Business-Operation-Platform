import { prisma } from "@/lib/database/prisma";

export const DEFAULT_BUSINESS_ROLES = [
  {
    name: "Business Owner",
    description:
      "Full control of the business and all business settings.",
    permissions: ["*"],
  },
  {
    name: "Administrator",
    description:
      "Administrative access to manage business operations and users.",
    permissions: [
      "business.read",
      "business.update",
      "users.read",
      "users.create",
      "users.update",
      "roles.read",
      "roles.manage",
	  "audit.read",
      "inventory.read",
      "inventory.manage",
      "purchases.read",
      "purchases.manage",
      "sales.read",
      "sales.manage",
      "payments.read",
      "payments.manage",
	  "expenses.read",
      "expenses.manage",
      "accounting.read",
      "accounting.manage",
      "pharmacy.controlled_dispense",
	  "pharmacy.batch_adjust",
	  "pharmacy.batch_recall",

    ],
  },
  {
    name: "Manager",
    description:
      "Operational management access for the business.",
    permissions: [
      "business.read",
      "inventory.read",
      "inventory.manage",
      "purchases.read",
      "purchases.manage",
      "sales.read",
      "sales.manage",
      "payments.read",
      "payments.manage",
	  "expenses.read",
      "expenses.manage",
      "accounting.read",
      "accounting.manage",
      "pharmacy.controlled_dispense",
	  "pharmacy.batch_adjust",
	  "pharmacy.batch_recall",
    ],
  },
  {
    name: "Staff",
    description:
      "Standard operational access.",
    permissions: [
      "business.read",
      "inventory.read",
      "sales.read",
      "sales.manage",
    ],
  },
] as const;


export async function createDefaultBusinessRoles(
  businessId: string,
) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { type: true },
  });

  if (!business) {
    throw new Error("Business not found.");
  }


  const roleDefinitions: Array<{
    name: string;
    description: string;
    permissions: string[];
  }> = DEFAULT_BUSINESS_ROLES.map((role) => ({
    ...role,
    permissions: [...role.permissions],
  }));

  if (business.type === "hospital") {
    const administrator = roleDefinitions.find(
      (role) => role.name === "Administrator",
    );

    if (administrator) {
      administrator.permissions.push(
        "hospital.patients.read",
        "hospital.patients.manage",
        "hospital.invoices.read",
        "hospital.invoices.manage",
        "hospital.appointments.read",
        "hospital.appointments.manage",
        "hospital.encounters.read",
        "hospital.encounters.manage",
        "hospital.admissions.read",
        "hospital.admissions.manage",
        "hospital.clinical_notes.read",
        "hospital.clinical_notes.manage",
        "hospital.diagnoses.read",
        "hospital.diagnoses.manage",
        "hospital.observations.read",
        "hospital.observations.manage",
        "hospital.prescriptions.read",
        "hospital.prescriptions.manage",
        "hospital.labs.read",
        "hospital.labs.manage",
        "hospital.imaging.read",
        "hospital.imaging.manage",
        "hospital.wards.read",
        "hospital.wards.manage",
        "hospital.beds.read",
        "hospital.beds.manage",
        "hospital.lab_results.verify",
        "hospital.lab_results.release",
        "hospital.imaging_reports.verify",
        "hospital.imaging_reports.release",
        "hospital.imaging_reports.amend",
      );
    }

    roleDefinitions.push({
      name: "Receptionist",
      description:
        "Front-desk access for patient registration, billing, appointments and admissions. No clinical record management.",
      permissions: [
        "business.read",
        "hospital.patients.read",
        "hospital.patients.manage",
        "hospital.invoices.read",
        "hospital.invoices.manage",
        "hospital.appointments.read",
        "hospital.appointments.manage",
        "hospital.admissions.read",
        "hospital.admissions.manage",
        "hospital.wards.read",
        "hospital.beds.read",
      ],
    });
  }

  await prisma.role.createMany({
    data: roleDefinitions.map((role) => ({
      businessId,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystemRole: true,
    })),
    skipDuplicates: true,
  });

  // System roles are managed by the platform. Reconcile their
  // permissions against the current definitions rather than
  // continually appending permissions to existing roles.
  if (business.type === "hospital") {
    for (const roleDefinition of roleDefinitions.filter(
      (role) =>
        role.name === "Administrator" ||
        role.name === "Receptionist",
    )) {
      const role = await prisma.role.findFirst({
        where: {
          businessId,
          name: roleDefinition.name,
          isSystemRole: true,
        },
        select: {
          id: true,
          permissions: true,
        },
      });

      if (!role) continue;

      const desiredPermissions = [
        ...new Set(roleDefinition.permissions),
      ];

      const currentPermissions = Array.isArray(role.permissions)
        ? role.permissions
        : [];

      const permissionsChanged =
        JSON.stringify([...currentPermissions].sort()) !==
        JSON.stringify([...desiredPermissions].sort());

      if (permissionsChanged) {
        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: desiredPermissions,
          },
        });
      }
    }
  }


  const ownerRole = await prisma.role.findUnique({
    where: {
      businessId_name: {
        businessId,
        name: "Business Owner",
      },
    },
  });

  if (!ownerRole) {
    throw new Error(
      "Unable to create the Business Owner role.",
    );
  }

  return ownerRole;
}


export async function assignBusinessOwnerRole(
  userId: string,
  businessId: string,
) {
  const ownerRole =
    await createDefaultBusinessRoles(
      businessId,
    );

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: ownerRole.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: ownerRole.id,
    },
  });

  return ownerRole;
}
