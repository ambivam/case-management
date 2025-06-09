import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CaseForm from "@/components/cases/case-form";

export default async function EditCasePage({
  params,
}: {
  params: { id: string };
}) {
  const caseData = await prisma.case.findUnique({
    where: {
      id: params.id,
    },
    include: {
      creator: true,
      assignments: {
        include: {
          user: true
        }
      },
      messages: true,
      documents: true
    },
  });

  if (!caseData) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Case</h1>
      <CaseForm initialData={caseData} />
    </div>
  );
}
