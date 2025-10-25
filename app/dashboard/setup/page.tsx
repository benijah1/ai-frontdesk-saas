"use client";
<label className="block text-sm mb-1">Accent</label>
<input name="accentColor" type="color" defaultValue="#22d3ee" className="w-full h-10 rounded"/>
</div>
</div>
<div className="grid sm:grid-cols-2 gap-4">
<div>
<label className="block text-sm mb-1">Brand Font</label>
<input name="brandFont" defaultValue="Inter" className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"/>
</div>
<div>
<label className="block text-sm mb-1">Logo URL</label>
<input name="logoUrl" className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2" placeholder="https://..."/>
</div>
</div>
</section>


<section className="grid gap-4">
<h2 className="text-lg font-medium">Services</h2>
<p className="text-sm text-white/70">Enter a comma‑separated list. You can refine later with prices and durations.</p>
<input name="servicesCsv" required className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2" placeholder="Drain Cleaning, Water Heater Install, Bathroom Remodel"/>
</section>


<section className="grid gap-4">
<h2 className="text-lg font-medium">Assistant</h2>
<div className="grid sm:grid-cols-2 gap-4">
<div>
<label className="block text-sm mb-1">Greeting</label>
<input name="greeting" className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2" placeholder="Hi! I’m your AI Front Desk — how can I help today?"/>
</div>
<div>
<label className="block text-sm mb-1">Voice (optional)</label>
<input name="voice" className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2" placeholder="alloy, verse, aria..."/>
</div>
</div>
</section>


<div className="flex items-center gap-3">
<button disabled={loading} className="rounded-xl px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50">{loading?"Setting up...":"Create My Front Desk"}</button>
<span className="text-xs text-white/60">You can edit everything later in Settings → Branding & Services.</span>
</div>
</form>
</div>
</main>
);
}
