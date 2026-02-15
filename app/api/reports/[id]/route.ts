import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const report = await prisma.leakReport.findFirst({
    where: { id: params.id, userId: user.id },
    include: { upload: { select: { isSample: true, sampleType: true, inputType: true } } },
  });

  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  return NextResponse.json({
    report: {
      id: report.id,
      leakScore: report.leakScore,
      topLeaks: report.topLeaks,
      keyStats: report.keyStats,
      behaviorPatterns: report.behaviorPatterns,
      fixPlan: report.fixPlan,
      riskChecklist: report.riskChecklist,
      createdAt: report.createdAt.toISOString(),
      isSample: report.upload?.isSample || false,
      sampleType: report.upload?.sampleType || null,
      inputType: report.upload?.inputType || "IMAGE",
    },
  });
}
