"use strict";(()=>{var e={};e.id=530,e.ids=[530],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4770:e=>{e.exports=require("crypto")},8926:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>f,patchFetch:()=>g,requestAsyncStorage:()=>m,routeModule:()=>p,serverHooks:()=>h,staticGenerationAsyncStorage:()=>y});var r={};a.r(r),a.d(r,{POST:()=>u});var n=a(9303),s=a(8716),i=a(3131),o=a(7070),c=a(9178),d=a(2663);let l=new(a(1088)).ZP;async function u(e){try{let t=await (0,c.ts)();if(!t)return o.NextResponse.json({error:"Unauthorized"},{status:401});let a=await d._.usageCounter.findUnique({where:{userId:t.id}}),r=await d._.subscription.findUnique({where:{userId:t.id}});if(r?.status!=="active"&&(a?.freeReportsUsed??0)>=10)return o.NextResponse.json({error:"Free report limit reached. Please upgrade to Pro."},{status:403});let{uploadId:n,trades:s}=await e.json();if(!n||!s?.length)return o.NextResponse.json({error:"Upload ID and trades are required"},{status:400});if(!await d._.upload.findFirst({where:{id:n,userId:t.id}}))return o.NextResponse.json({error:"Upload not found"},{status:404});await d._.trade.createMany({data:s.map(e=>({uploadId:n,ticker:e.ticker,action:e.action,quantity:e.quantity,entryPrice:e.entryPrice,exitPrice:e.exitPrice,entryDate:e.entryDate,exitDate:e.exitDate,pnl:e.pnl,pnlPercent:e.pnlPercent,holdingDays:e.holdingDays,confidence:e.confidence}))});let i=JSON.stringify(s,null,2),u=((await l.chat.completions.create({model:"gpt-4o-mini",max_tokens:4e3,messages:[{role:"system",content:`You are a trading performance analyst. Analyze trade data and generate a Leak Report.
You MUST return ONLY valid JSON with this exact structure:
{
  "leakScore": 42,
  "topLeaks": [
    {
      "title": "Leak name",
      "severity": 82,
      "evidence": "Specific data-backed evidence",
      "meaning": "What this pattern means for their trading",
      "quickFix": "Actionable fix they can implement today"
    }
  ],
  "keyStats": {
    "totalTrades": 47,
    "winRate": 0.41,
    "avgRR": 0.8,
    "avgWin": 250,
    "avgLoss": -312,
    "biggestWin": 1200,
    "biggestLoss": -890,
    "avgHoldWinDays": 1.8,
    "avgHoldLossDays": 4.2,
    "profitFactor": 0.75
  },
  "behaviorPatterns": [
    "Pattern description with evidence"
  ],
  "fixPlan": [
    { "day": 1, "task": "Action item for day 1" },
    { "day": 2, "task": "Action item for day 2" },
    { "day": 3, "task": "Action item for day 3" },
    { "day": 4, "task": "Action item for day 4" },
    { "day": 5, "task": "Action item for day 5" },
    { "day": 6, "task": "Action item for day 6" },
    { "day": 7, "task": "Action item for day 7" }
  ],
  "riskChecklist": [
    { "item": "Risk control item", "status": "pass" },
    { "item": "Risk control item", "status": "fail" },
    { "item": "Risk control item", "status": "warning" }
  ]
}
Rules:
- leakScore is 0-100 where lower means more leaks (worse)
- Identify exactly 3 top leaks
- Be compliance-safe: no promises, no buy/sell recommendations
- Focus on behavior and process, not specific stocks
- Use novice-friendly language
- All evidence must be data-backed from the actual trades provided
- The fix plan should be practical and progressive`},{role:"user",content:`Analyze these trades and generate a Leak Report:

${i}`}]})).choices[0].message.content||"").match(/\{[\s\S]*\}/);if(!u)throw Error("Could not parse AI response");let p=JSON.parse(u[0]),m=await d._.leakReport.create({data:{userId:t.id,uploadId:n,leakScore:p.leakScore||50,topLeaks:p.topLeaks||[],keyStats:p.keyStats||{},behaviorPatterns:p.behaviorPatterns||[],fixPlan:p.fixPlan||[],riskChecklist:p.riskChecklist||[],fullReport:p}});return await d._.upload.update({where:{id:n},data:{status:"completed"}}),await d._.usageCounter.upsert({where:{userId:t.id},create:{userId:t.id,freeReportsUsed:1,totalReports:1,lastReportAt:new Date},update:{freeReportsUsed:{increment:1},totalReports:{increment:1},lastReportAt:new Date}}),o.NextResponse.json({reportId:m.id,report:p})}catch(e){return console.error("Generate report error:",e),o.NextResponse.json({error:e.message||"Report generation failed"},{status:500})}}let p=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/generate-report/route",pathname:"/api/generate-report",filename:"route",bundlePath:"app/api/generate-report/route"},resolvedPagePath:"/home/runner/workspace/app/api/generate-report/route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:m,staticGenerationAsyncStorage:y,serverHooks:h}=p,f="/api/generate-report/route";function g(){return(0,i.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:y})}},9178:(e,t,a)=>{a.d(t,{Gv:()=>l,c_:()=>d,ed:()=>u,lV:()=>h,sd:()=>m,ts:()=>y});var r=a(1615),n=a(2663),s=a(8691),i=a(4770),o=a.n(i);let c="piq_session";async function d(e){return s.ZP.hash(e,12)}async function l(e,t){return s.ZP.compare(e,t)}async function u(e){let t=o().randomBytes(32).toString("hex"),a=new Date(Date.now()+2592e6);return await n._.session.create({data:{userId:e,token:t,expiresAt:a}}),(0,r.cookies)().set(c,t,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:2592e3,path:"/"}),t}async function p(){let e=(0,r.cookies)(),t=e.get(c)?.value;if(!t)return null;let a=await n._.session.findUnique({where:{token:t},include:{user:!0}});return!a||a.expiresAt<new Date?(a&&await n._.session.delete({where:{id:a.id}}),null):a}async function m(){let e=(0,r.cookies)(),t=e.get(c)?.value;t&&(await n._.session.deleteMany({where:{token:t}}),e.delete(c))}async function y(){let e=await p();return e?e.user:null}function h(e){let t=process.env.IP_HASH_SALT||"default-salt";return o().createHash("sha256").update(e+t).digest("hex")}},2663:(e,t,a)=>{a.d(t,{_:()=>n});let r=require("@prisma/client"),n=globalThis.prisma??new r.PrismaClient({log:["error"]})}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[276,972,899,88],()=>a(8926));module.exports=r})();