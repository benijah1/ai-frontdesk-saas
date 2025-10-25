import { NextResponse } from "next/server";
const greeting = String(form.get("greeting")||"");
const voice = String(form.get("voice")||"");


if(!name) return new NextResponse("Company name required", { status: 400 });


// Ensure current user
const user = await prisma.user.findUnique({ where: { email: session.user.email } });
if(!user) return new NextResponse("User not found", { status: 404 });


// Create tenant
const desired = subdomain || slugify(name).slice(0, 30);


// Try reserve subdomain; if conflict, leave null and fallback to path
const existing = await prisma.tenant.findFirst({ where: { OR: [ { subdomain: desired }, { name } ] } });
const sub = existing?.subdomain ? null : desired;


const tenant = await prisma.tenant.create({
data: {
name,
subdomain: sub || null,
primaryColor, secondaryColor, accentColor,
brandFont, logoUrl, phone, email, address,
greeting, voice,
users: user.tenantId ? undefined : { connect: [{ id: user.id }] },
}
});


// Attach tenant to user if not already
if(!user.tenantId){
await prisma.user.update({ where: { id: user.id }, data: { tenantId: tenant.id } });
}


// Upsert services
const names = servicesCsv.split(",").map(s=>s.trim()).filter(Boolean);
for(const svcName of names){
const slug = slugify(svcName);
await prisma.service.upsert({
where: { tenantId_slug: { tenantId: tenant.id, slug } },
create: { tenantId: tenant.id, name: svcName, slug },
update: { name: svcName }
});
}


// Build URL
const host = req.headers.get("host") || "localhost:3000";
const isLocal = host.startsWith("localhost");
let url = "";
if(tenant.subdomain && !isLocal){
const root = host.split(".").slice(-2).join("."); // yourapp.com
url = `https://${tenant.subdomain}.${root}/frontdesk`;
} else {
url = `/${"t"}/${tenant.pathSlug}/frontdesk`;
}


return NextResponse.json({ ok: true, tenantId: tenant.id, url });
}
