import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import {
businessInvitationService,
} from "@/lib/business/businessInvitationService";

interface AuthContinuePageProps {
searchParams: Promise<{
invitation?: string;
}>;
}

export default async function AuthContinuePage({
searchParams,
}: AuthContinuePageProps) {
const user =
await getAuthenticatedUser();

const {
invitation: invitationToken,
} = await searchParams;

if (invitationToken) {
try {
await businessInvitationService.acceptInvitation({
token: invitationToken,
userId: user.id,
email: user.email,
});
} catch (error) {
console.error(
"Unable to accept business invitation:",
error,
);
}
}

const membership =
await prisma.businessMembership.findFirst({
where: {
userId: user.id,
isActive: true,
business: {
status: "ACTIVE",
},
},
select: {
businessId: true,
},
orderBy: {
createdAt: "asc",
},
});

if (!membership) {
redirect("/setup");
}

redirect("/dashboard");
}
