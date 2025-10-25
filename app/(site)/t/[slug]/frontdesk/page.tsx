import { prisma } from "@/lib/prisma";
secondary: t.secondaryColor||"#111827",
accent: t.accentColor||"#22d3ee",
font: t.brandFont||"Inter",
logo: t.logoUrl||""
}} services={t.services} greeting={t.greeting||"Hi! How can I help?"} />
);
}


function FrontDeskUI({ name, brand, services, greeting }:{
name: string,
brand: { primary:string; secondary:string; accent:string; font:string; logo:string }
services: { id:string; name:string; slug:string }[]
greeting: string
}){
return (
<main style={{
minHeight: "100dvh",
background: `linear-gradient(135deg, ${brand.secondary} 0%, #0a0b10 60%)`,
color: "white",
fontFamily: brand.font
}} className="p-6">
<header className="flex items-center gap-3 mb-6">
{brand.logo && <img src={brand.logo} alt="logo" className="w-10 h-10 rounded-xl"/>}
<h1 className="text-2xl font-semibold">{name} — AI Front Desk</h1>
</header>
<div className="grid md:grid-cols-3 gap-6">
<section className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
<div className="text-sm text-white/80 mb-4" style={{color:brand.accent}}>{greeting}</div>
<div className="rounded-xl p-4" style={{background: brand.primary}}>
<p className="text-sm">Ask about pricing, availability, or book a service.</p>
</div>
</section>
<aside className="bg-white/5 border border-white/10 rounded-2xl p-5">
<h2 className="font-medium mb-3">Services</h2>
<ul className="space-y-2 text-sm">
{services.map(s=> (
<li key={s.id} className="flex items-center justify-between">
<span>{s.name}</span>
<a className="underline opacity-80 hover:opacity-100" href={`#book-${s.slug}`}>Book</a>
</li>
))}
</ul>
</aside>
</div>
</main>
);
}
