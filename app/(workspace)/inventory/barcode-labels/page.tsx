import { prisma } from "@/lib/database/prisma";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { BarcodeLabelWorkspace } from "@/components/barcode/BarcodeLabelWorkspace";

export default async function BarcodeLabelsPage() {
  const business = await getCurrentBusiness();

  const warehouses = await prisma.warehouse.findMany({
    where: {
      businessId: business.id,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  return (
    <BarcodeLabelWorkspace
      warehouses={warehouses}
    />
  );
}