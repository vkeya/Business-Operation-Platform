"use server";

import { revalidatePath } from "next/cache";
import { businessUserService } from "@/lib/business/businessUserService";

export async function getBusinessUsersAction() {
  return businessUserService.listUsers();
}

export async function getBusinessRolesAction() {
  return businessUserService.listRoles();
}

export async function getBusinessUserInvitationsAction() {
  return businessUserService.listInvitations();
}

export async function revokeBusinessUserInvitationAction(
  invitationId: string,
) {
  const result =
    await businessUserService.revokeInvitation(
      invitationId,
    );

  revalidatePath("/settings/users");

  return result;
}

export async function resendBusinessUserInvitationAction(
  invitationId: string,
) {
  const result =
    await businessUserService.resendInvitation(
      invitationId,
    );

  revalidatePath("/settings/users");

  return result;
}

export async function createBusinessUserInvitationAction(input: {
  name: string;
  email: string;
  roleId: string;
}) {
  const result =
    await businessUserService.createInvitation(input);

  revalidatePath("/settings/users");

  return result;
}

export async function setBusinessUserActiveAction(
  userId: string,
  isActive: boolean,
) {
  const result =
    await businessUserService.setUserActive(
      userId,
      isActive,
    );

  revalidatePath("/settings/users");

  return result;
}