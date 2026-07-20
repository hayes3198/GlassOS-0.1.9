export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  suggestedMargins?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

export const TEMPLATES: DocumentTemplate[] = [
  {
    id: "letterhead",
    name: "Letterhead",
    category: "Professional",
    description: "Corporate company correspondence with an elegant modern glass header.",
    suggestedMargins: { left: 72, right: 72, top: 54, bottom: 54 },
    content: `<div style="font-family: 'Inter', sans-serif; color: #1e293b;">
  <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <h1 style="font-size: 20pt; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.025em; text-transform: uppercase;">Nexus Cognitive Labs</h1>
      <p style="font-size: 9pt; color: #64748b; margin: 2px 0 0 0; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600;">Next-Gen Interface Systems</p>
    </div>
    <div style="text-align: right; font-size: 8pt; color: #64748b; line-height: 1.4;">
      <p style="margin: 0;">100 Shimmering Boulevard, Suite 400</p>
      <p style="margin: 0;">Silicon Valley, CA 94025</p>
      <p style="margin: 0; color: #3b82f6; font-weight: 500;">contact@nexus-cognitive.io</p>
    </div>
  </div>

  <div style="font-size: 10pt; line-height: 1.6;">
    <p style="margin: 0 0 24px 0; color: #64748b;">July 20, 2026</p>
    
    <div style="margin-bottom: 30px; font-weight: 500;">
      <p style="margin: 0; font-weight: bold; color: #0f172a;">To Whom It May Concern,</p>
      <p style="margin: 2px 0 0 0; color: #475569;">The GlassOS Foundation</p>
      <p style="margin: 2px 0 0 0; color: #475569;">Infinite Loop, Cupertino, CA</p>
    </div>

    <h2 style="font-size: 12pt; font-weight: 700; color: #0f172a; border-left: 3px solid #3b82f6; padding-left: 10px; margin: 0 0 20px 0;">Subject: Integration of Shimmering Window Protocols</h2>

    <p style="margin: 0 0 16px 0;">We are pleased to submit our formal proposal for the integration of modern translucent window rendering protocols into the core GlassOS desktop environment. Our research demonstrates a <b>42% improvement</b> in user focus and a <b>30% reduction</b> in visual fatigue when frosted glassmorphic backdrops are utilized.</p>

    <p style="margin: 0 0 16px 0;">As outlined in the technical appendix, our proprietary <i>RefractionGL</i> engine executes efficiently on modern Neural Processing Units, requiring minimal memory footprint while ensuring 60fps compositing speeds.</p>

    <p style="margin: 0 0 24px 0;">We look forward to collaborating with your systems engineering team to make this interface paradigm a standard across all consumer devices.</p>

    <div style="margin-top: 40px;">
      <p style="margin: 0; color: #64748b;">Sincerely,</p>
      <div style="height: 45px; margin: 10px 0;">
        <span style="font-family: 'Georgia', serif; font-size: 18pt; color: #1e3a8a; font-style: italic; opacity: 0.85;">Elena Rostova</span>
      </div>
      <p style="margin: 0; font-weight: bold; color: #0f172a;">Dr. Elena Rostova</p>
      <p style="margin: 2px 0 0 0; color: #64748b; font-size: 9pt;">Chief Interface Scientist, Nexus Cognitive Labs</p>
    </div>
  </div>
</div>`
  },
  {
    id: "newsletter",
    name: "Newsletter",
    category: "Publications",
    description: "Multi-column monthly bulletin or company announcement dispatch.",
    suggestedMargins: { left: 54, right: 54, top: 54, bottom: 54 },
    content: `<div style="font-family: 'Inter', sans-serif; color: #334155;">
  <div style="background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
    <p style="font-size: 8pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #38bdf8; margin: 0 0 6px 0;">Monthly Dispatch</p>
    <h1 style="font-size: 24pt; font-weight: 900; margin: 0; letter-spacing: -0.03em;">The Frosted Chronicle</h1>
    <div style="border-top: 1px solid #334155; margin-top: 12px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8pt; color: #94a3b8; font-weight: 500;">
      <span>ISSUE 12 // JULY 2026</span>
      <span>GLASSOS COOPERATIVE</span>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; font-size: 10pt; line-height: 1.5;">
    <div>
      <h2 style="font-size: 14pt; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.02em;">Breaking the Glass Ceiling: Version 3.0 Announced</h2>
      <p style="font-size: 8pt; color: #64748b; font-weight: 600; margin: 0 0 12px 0;">BY ARTHUR DENT, EDITOR-IN-CHIEF</p>
      <p style="margin: 0 0 12px 0;">Yesterday, the developer consortium officially unveiled the roadmap for <b>GlassOS 3.0</b>, codenamed <i>"AeroGlass"</i>. The release promises comprehensive performance enhancements and a complete overhaul of the terminal emulation system.</p>
      <p style="margin: 0 0 12px 0;">With a brand-new sub-surface scattering engine, 3.0 offers real-time window refractions that adapt dynamically to ambient light changes in the physical room, leveraging the device's light sensor arrays.</p>
      <blockquote style="border-left: 4px solid #38bdf8; padding-left: 12px; font-style: italic; color: #0f172a; font-weight: 500; margin: 16px 0; font-size: 11pt;">
        "This is not just another minor update; this is a total visual and architectural reinvention."
      </blockquote>
      <p style="margin: 0;">Beta registrations are now open for core contributors, with public testing slated to commence early next quarter.</p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 10pt; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px;">In This Issue</h3>
      <ul style="padding-left: 16px; margin: 0;">
        <li style="margin-bottom: 8px;"><b>Page 1:</b> AeroGlass 3.0 Unveiled</li>
        <li style="margin-bottom: 8px;"><b>Page 2:</b> GlassSheet Macro Coding Tips</li>
        <li style="margin-bottom: 8px;"><b>Page 3:</b> Designing with Translucent UI Guidelines</li>
        <li style="margin-bottom: 8px;"><b>Page 4:</b> The Rise of Local-First Storage Architecture</li>
      </ul>
      <div style="margin-top: 20px; text-align: center; background: rgba(56, 189, 248, 0.1); padding: 10px; border-radius: 4px;">
        <span style="font-size: 8pt; font-weight: 700; color: #0369a1;">UPCOMING WEBINAR</span>
        <p style="font-size: 8pt; margin: 4px 0 0 0; color: #0f172a;">Refraction Secrets: July 28th at 4:00 PM UTC</p>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: "newspaper",
    name: "Newspaper",
    category: "Publications",
    description: "Classical double-column editorial layout styled with Times font styles.",
    suggestedMargins: { left: 54, right: 54, top: 54, bottom: 54 },
    content: `<div style="font-family: 'Georgia', serif; color: #1c1917; line-height: 1.4;">
  <div style="text-align: center; border-bottom: 4px double #1c1917; padding-bottom: 10px; margin-bottom: 16px;">
    <h1 style="font-size: 28pt; font-weight: 900; font-family: 'Times New Roman', serif; margin: 0; letter-spacing: -0.02em; text-transform: uppercase;">THE DAILY REFRACTION</h1>
    <div style="border-top: 1px solid #1c1917; border-bottom: 1px solid #1c1917; margin-top: 8px; padding: 4px 12px; display: flex; justify-content: space-between; font-size: 8pt; font-family: 'Courier New', monospace; font-weight: bold;">
      <span>VOL. CXLII... No. 49,820</span>
      <span>SAN FRANCISCO, MONDAY, JULY 20, 2026</span>
      <span>$1.50</span>
    </div>
  </div>

  <div style="text-align: center; margin-bottom: 16px;">
    <h2 style="font-size: 16pt; font-weight: bold; margin: 0 0 4px 0; font-family: 'Times New Roman', serif; text-transform: uppercase;">A breakthrough in glass OS design</h2>
    <p style="font-size: 9pt; font-style: italic; color: #44403c; margin: 0;">Silicon Valley engineers claim the future is completely clear, transparent, and beautiful.</p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 9.5pt; text-align: justify;">
    <div style="border-right: 1px solid #e7e5e4; padding-right: 16px;">
      <p style="margin: 0 0 10px 0;"><span style="font-size: 24pt; float: left; font-weight: bold; line-height: 0.8; margin-right: 6px; font-family: 'Times New Roman', serif;">I</span>n what industry veterans are calling a paradigm shift, the GlassOS software federation declared a comprehensive consolidation of all user interfaces. Under the new decree, all physical screens are declared obsolete, replaced entirely by beautiful dynamic glassmorphic holographic plates.</p>
      <p style="margin: 0 0 10px 0;">"The tactile physical keyboard coupled to static pixel layouts was merely a stepping stone," declared chief technology architect Evelyn Vance. "By refracting physical light source data and mapping interfaces directly onto spatial ambient sheets, we unlock authentic digital organic integration."</p>
      <p style="margin: 0;">Initial trials amongst 10,000 corporate workers in Tokyo indicate a remarkable decrease in screen fatigue and a dramatic surge in creative performance.</p>
    </div>
    <div>
      <p style="margin: 0 0 10px 0;">The technology, built upon a mathematical base of sub-surface Gaussian convolutions, operates directly within the retina projection layers of standard ocular wear.</p>
      <p style="margin: 0 0 10px 0;">Critics of the spatial clear-sheet paradigm, however, warn of potential privacy risks. "If your operating system is entirely transparent, anyone sitting opposite you at a café table can see your secret financial spreadsheets," commented independent privacy advocate Marcus Cole.</p>
      <p style="margin: 0;">To combat these challenges, developers have integrated a "polarizing filter layer" that obscures the display for any viewer at an angle exceeding fifteen degrees from the optical axis.</p>
    </div>
  </div>
</div>`
  },
  {
    id: "emagazine",
    name: "eMagazine",
    category: "Publications",
    description: "Modern layout featuring deep contrasting dark design elements and quote callouts.",
    suggestedMargins: { left: 54, right: 54, top: 54, bottom: 54 },
    content: `<div style="font-family: 'Inter', sans-serif; color: #111827;">
  <div style="position: relative; overflow: hidden; background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); color: #ffffff; padding: 40px 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
    <span style="font-size: 7.5pt; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; color: #ec4899;">TECH & DESIGN JOURNAL</span>
    <h1 style="font-size: 26pt; font-weight: 900; margin: 8px 0 12px 0; letter-spacing: -0.04em; line-height: 1.1;">Aesthetics of Translucency</h1>
    <p style="font-size: 10.5pt; color: #d1d5db; max-width: 90%; margin: 0; line-height: 1.5;">How frosted glass textures, spatial blur shaders, and dynamic refraction arrays redefined our relationship with digital workspaces in the late 2020s.</p>
    <div style="margin-top: 24px; font-size: 8pt; color: #9ca3af; font-weight: 500;">
      JULY 2026 • WRITTEN BY <span style="color: #ec4899; font-weight: bold;">VICTORIA CHEN</span>
    </div>
  </div>

  <div style="font-size: 10.5pt; line-height: 1.7; color: #374151;">
    <p style="margin: 0 0 18px 0; font-size: 11pt; font-weight: 500; color: #111827; letter-spacing: -0.01em;">The digital interface was once a simulation of desk accessories—folders, filing cabinets, wastebaskets. But as screens transitioned from glowing boxes into spatial layers integrated seamlessly into our glasses and smart environments, the skeuomorphs faded, leaving behind something far more ethereal.</p>

    <div style="float: right; width: 45%; margin-left: 20px; margin-bottom: 10px; background-color: #f3f4f6; border-left: 4px solid #ec4899; padding: 12px; border-radius: 0 8px 8px 0; font-size: 9.5pt; line-height: 1.5; color: #4b5563;">
      <span style="font-weight: 800; color: #111827; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.05em;">Key Takeaway</span>
      Translucent interfaces lower cognitive friction by preserving ambient spatial awareness of underlying screens.
    </div>

    <p style="margin: 0 0 18px 0;">This new visual philosophy is built on three pillars: **light, depth, and material**. Modern digital systems are no longer flat layers of opaque color. Instead, they behave like physical physical substances—refracting background colors, absorbing light, casting realistic soft shadows, and creating an instant, intuitive sense of hierarchy.</p>

    <p style="margin: 0 0 18px 0;">By simulating physical materials, these interfaces give our brains immediate spatial anchors. We know exactly where we are, what layer is active, and how elements relate to each other—making complex multitasking feel as natural as shifting papers on a real wooden desk.</p>
  </div>
</div>`
  },
  {
    id: "resume",
    name: "Resume",
    category: "Professional",
    description: "Highly polished modern resume layout with left & right sidebar information split.",
    suggestedMargins: { left: 54, right: 54, top: 54, bottom: 54 },
    content: `<div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5;">
  <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <h1 style="font-size: 20pt; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.025em;">Alexander Chen</h1>
      <p style="font-size: 10pt; color: #3b82f6; font-weight: 600; margin: 4px 0 0 0; letter-spacing: 0.05em; text-transform: uppercase;">Lead Systems Architect & UI Engineer</p>
    </div>
    <div style="text-align: right; font-size: 8.5pt; color: #64748b; line-height: 1.4;">
      <p style="margin: 0; font-weight: 500; color: #0f172a;">alexander.chen@glassos.dev</p>
      <p style="margin: 2px 0 0 0;">(555) 019-2831</p>
      <p style="margin: 2px 0 0 0;">github.com/alexchen-dev</p>
      <p style="margin: 2px 0 0 0;">San Francisco, CA</p>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
    <div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 11pt; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Professional Experience</h2>
        
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
            <span style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">Senior Principal Engineer</span>
            <span style="font-size: 8.5pt; color: #64748b; font-weight: 500;">2023 - Present</span>
          </div>
          <span style="font-size: 8.5pt; color: #3b82f6; font-weight: 600; display: block; margin-bottom: 6px;">GlassOS Software Cooperative</span>
          <ul style="padding-left: 16px; margin: 0; font-size: 9pt; color: #475569;">
            <li style="margin-bottom: 4px;">Led a team of 8 engineers in developing the core windowing compositor utilizing multi-threaded OpenGL and Vulkan refraction pipelines.</li>
            <li style="margin-bottom: 4px;">Optimized sub-surface spatial blur algorithms, reducing CPU overhead by 35% and improving battery life on portable glass slates.</li>
            <li style="margin-bottom: 4px;">Designed and implemented the first dynamic point-based typesetting engine for full-fidelity documents within rich Web environments.</li>
          </ul>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
            <span style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">Lead Frontend Developer</span>
            <span style="font-size: 8.5pt; color: #64748b; font-weight: 500;">2020 - 2023</span>
          </div>
          <span style="font-size: 8.5pt; color: #3b82f6; font-weight: 600; display: block; margin-bottom: 6px;">Frostmorphic Design Agency</span>
          <ul style="padding-left: 16px; margin: 0; font-size: 9pt; color: #475569;">
            <li style="margin-bottom: 4px;">Built responsive, high-performance web applications using React, Vite, and custom shaders.</li>
            <li style="margin-bottom: 4px;">Pioneered the integration of local-first state synchronization mechanisms for collaborative tools, supporting thousands of concurrent users.</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 style="font-size: 11pt; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Education</h2>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">M.S. in Human-Computer Interaction</span>
            <span style="font-size: 8.5pt; color: #475569; display: block; margin-top: 2px;">Stanford University</span>
          </div>
          <span style="font-size: 8.5pt; color: #64748b; font-weight: 500;">Graduated 2020</span>
        </div>
      </div>
    </div>

    <div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 11pt; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Technical Skills</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          <span style="font-size: 8.5pt; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px; font-weight: 500; color: #1e293b;">TypeScript</span>
          <span style="font-size: 8.5pt; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px; font-weight: 500; color: #1e293b;">React / Next.js</span>
          <span style="font-size: 8.5pt; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px; font-weight: 500; color: #1e293b;">C++ / Vulkan</span>
          <span style="font-size: 8.5pt; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px; font-weight: 500; color: #1e293b;">GLSL Shaders</span>
          <span style="font-size: 8.5pt; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px; font-weight: 500; color: #1e293b;">Tailwind CSS</span>
          <span style="font-size: 8.5pt; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px; font-weight: 500; color: #1e293b;">Wasm Engines</span>
        </div>
      </div>

      <div>
        <h2 style="font-size: 11pt; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Core Strengths</h2>
        <ul style="padding-left: 16px; margin: 0; font-size: 8.5pt; color: #475569;">
          <li style="margin-bottom: 6px;"><b>Performance Profiling</b></li>
          <li style="margin-bottom: 6px;"><b>Frosted UI Design</b></li>
          <li style="margin-bottom: 6px;"><b>Collaborative Systems</b></li>
          <li style="margin-bottom: 6px;"><b>Clean Modular APIs</b></li>
        </ul>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: "pamphlet",
    name: "Pamphlet",
    category: "Publications",
    description: "Three-section brochure grid detailing tourist or commercial service highlights.",
    suggestedMargins: { left: 54, right: 54, top: 54, bottom: 54 },
    content: `<div style="font-family: 'Inter', sans-serif; color: #0f172a; line-height: 1.5;">
  <div style="border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; background: linear-gradient(to bottom, #eff6ff 0%, #ffffff 100%); text-align: center; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(59,130,246,0.1);">
    <span style="font-size: 8pt; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.25em;">EXCURSION GUIDE</span>
    <h1 style="font-size: 22pt; font-weight: 900; margin: 6px 0; color: #1e3b8b; letter-spacing: -0.03em;">The Refraction Valley</h1>
    <p style="font-size: 10pt; color: #475569; margin: 0;">A guide to the world's most luminous glass habitats.</p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; font-size: 8.5pt; text-align: center;">
    <div style="background-color: #ffffff; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      <div style="width: 24px; height: 24px; background-color: #3b82f6; border-radius: 50%; color: #ffffff; font-weight: bold; font-size: 10pt; line-height: 24px; margin: 0 auto 10px auto;">1</div>
      <h3 style="font-size: 9.5pt; font-weight: 800; margin: 0 0 6px 0; color: #1e3a8a;">Lumina Spire</h3>
      <p style="color: #64748b; margin: 0; line-height: 1.4;">A 400-meter architectural masterpiece crafted completely of structural frosted obsidian, designed to refract morning solar arrays.</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      <div style="width: 24px; height: 24px; background-color: #3b82f6; border-radius: 50%; color: #ffffff; font-weight: bold; font-size: 10pt; line-height: 24px; margin: 0 auto 10px auto;">2</div>
      <h3 style="font-size: 9.5pt; font-weight: 800; margin: 0 0 6px 0; color: #1e3a8a;">Cascade Dome</h3>
      <p style="color: #64748b; margin: 0; line-height: 1.4;">Immersive spatial ecological dome featuring pressurized liquid glass slides, offering tourists close encounters with refractive marine moss.</p>
    </div>

    <div style="background-color: #ffffff; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      <div style="width: 24px; height: 24px; background-color: #3b82f6; border-radius: 50%; color: #ffffff; font-weight: bold; font-size: 10pt; line-height: 24px; margin: 0 auto 10px auto;">3</div>
      <h3 style="font-size: 9.5pt; font-weight: 800; margin: 0 0 6px 0; color: #1e3a8a;">The Frosted Dunes</h3>
      <p style="color: #64748b; margin: 0; line-height: 1.4;">Expansive deserts composed of natural crystal sands. Visitors are advised to wear dynamic polarizing eyewear to filter heavy optical flare.</p>
    </div>
  </div>

  <div style="margin-top: 24px; padding: 16px; border-radius: 8px; border: 1px dashed #3b82f6; text-align: center; background-color: #f0f7ff;">
    <span style="font-size: 8.5pt; font-weight: 700; color: #1e3a8a;">ADMISSION & SCHEDULING</span>
    <p style="font-size: 8.5pt; color: #475569; margin: 4px 0 0 0; line-height: 1.4;">Guided tours depart daily from the central glass tram station starting at 08:00 UTC. Custom modular passes available upon request.</p>
  </div>
</div>`
  },
  {
    id: "blog",
    name: "Blog Post",
    category: "Publications",
    description: "Centred readable publication structure optimized with custom headings & meta headers.",
    suggestedMargins: { left: 72, right: 72, top: 72, bottom: 72 },
    content: `<div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; line-height: 1.7;">
  <span style="font-size: 8pt; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">SOFTWARE DESIGN</span>
  <h1 style="font-size: 22pt; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.03em; line-height: 1.25;">Why Single-Page Apps Need Local-First Architectures</h1>
  
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
    <div style="width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10pt;">K</div>
    <div>
      <span style="font-size: 9pt; font-weight: 600; color: #0f172a; display: block;">Kaelen Vance</span>
      <span style="font-size: 7.5pt; color: #64748b;">July 20, 2026 • 5 min read</span>
    </div>
  </div>

  <div style="font-size: 10.5pt; color: #334155;">
    <p style="margin: 0 0 16px 0; font-size: 11.5pt; line-height: 1.6; color: #0f172a; font-weight: 500;">We've spent the last decade building web apps that are completely reliant on the cloud. Every single keystroke, click, and transition is sent to a remote server, processed, and piped back. But as client devices grow infinitely powerful, this architecture is showing its cracks.</p>
    
    <p style="margin: 0 0 16px 0;">Enter <b>Local-First development</b>. By keeping user data primarily in-memory or in persistent client-side storage (like SQLite in the browser or IndexedDB), we make software that feels incredibly fast, works perfectly offline, and respects user privacy by default.</p>

    <h2 style="font-size: 14pt; font-weight: 800; color: #0f172a; margin: 24px 0 12px 0; letter-spacing: -0.02em;">1. The Fallacy of Opaque Loaders</h2>
    <p style="margin: 0 0 16px 0;">No one likes waiting for spinners. In classic client-server setups, even the simplest action—such as toggling a checkbox—requires a round-trip network delay. When connection speeds are slow, this ruins the user experience.</p>
    
    <p style="margin: 0 0 16px 0;">Local-first apps perform all state changes instantaneously on the local client. State synchronizations happen quietly in the background. If a network packet is dropped, the UI doesn't freeze; it simply retries when the user's connection returns.</p>
  </div>
</div>`
  },
  {
    id: "business_letter",
    name: "Business Letter",
    category: "Professional",
    description: "Formal classical business correspondence letter featuring standard margins and alignment.",
    suggestedMargins: { left: 72, right: 72, top: 72, bottom: 72 },
    content: `<div style="font-family: 'Georgia', serif; color: #1c1917; line-height: 1.5; font-size: 10pt;">
  <div style="text-align: right; margin-bottom: 30px; color: #44403c;">
    <p style="margin: 0; font-weight: bold; color: #1c1917;">Aero Composites Inc.</p>
    <p style="margin: 2px 0 0 0;">492 Windward Parkway</p>
    <p style="margin: 2px 0 0 0;">Seattle, WA 98101</p>
    <p style="margin: 2px 0 0 0;">Phone: (206) 555-0144</p>
  </div>

  <div style="margin-bottom: 24px;">
    <p style="margin: 0; color: #44403c;">July 20, 2026</p>
  </div>

  <div style="margin-bottom: 30px; color: #1c1917;">
    <p style="margin: 0; font-weight: bold;">Dr. Julian Forester</p>
    <p style="margin: 2px 0 0 0;">Director of Materials Science</p>
    <p style="margin: 2px 0 0 0;">Pacific Research Lab</p>
    <p style="margin: 2px 0 0 0;">1010 Ocean Drive, Suite B</p>
    <p style="margin: 2px 0 0 0;">La Jolla, CA 92037</p>
  </div>

  <p style="margin: 0 0 18px 0; font-weight: bold;">Dear Dr. Forester,</p>

  <p style="margin: 0 0 16px 0;">I am writing to formally request a technical specification sheet for the newly developed <i>Titanium-Silica compositing alloy (TSC-9)</i>, which your team presented at the advanced materials conference in Geneva last month.</p>

  <p style="margin: 0 0 16px 0;">Our engineering department is currently evaluating structural materials for our next-generation aerodynamic stabilizer units. The load-bearing capacity and thermal resistance properties of TSC-9, particularly in high-moisture high-velocity environments, make it an exceptional candidate for our manufacturing pipeline.</p>

  <p style="margin: 0 0 16px 0;">Specifically, we would appreciate receiving test telemetry data regarding tensile fatigue limits at temperatures exceeding 450 degrees Celsius, as well as detailed manufacturing cost estimates for bulk sheets.</p>

  <p style="margin: 0 0 24px 0;">Thank you for your assistance. We look forward to exploring a potential partnership between Aero Composites and Pacific Research Lab.</p>

  <div style="margin-top: 40px;">
    <p style="margin: 0; color: #44403c;">Sincerely yours,</p>
    <div style="height: 50px;"></div>
    <p style="margin: 0; font-weight: bold; color: #1c1917;">Marcus Vance</p>
    <p style="margin: 2px 0 0 0; color: #44403c; font-size: 9pt;">Vice President of Engineering, Aero Composites Inc.</p>
  </div>
</div>`
  },
  {
    id: "receipt",
    name: "Receipt / Invoice",
    category: "Financial",
    description: "Itemized commercial transaction ledger with tabular calculations & receipt aesthetics.",
    suggestedMargins: { left: 72, right: 72, top: 54, bottom: 54 },
    content: `<div style="font-family: 'Courier New', monospace; color: #1f2937; max-width: 480px; margin: 0 auto; line-height: 1.4; font-size: 9.5pt;">
  <div style="text-align: center; border-bottom: 1px dashed #9ca3af; padding-bottom: 16px; margin-bottom: 16px;">
    <h2 style="font-size: 14pt; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">FROSTED COFFEE CO.</h2>
    <p style="margin: 0; font-size: 8.5pt;">Store #4820 - Terminal Gate 4</p>
    <p style="margin: 2px 0 0 0; font-size: 8.5pt;">San Francisco Int'l Airport</p>
    <p style="margin: 2px 0 0 0; font-size: 8.5pt;">Tel: (415) 555-0199</p>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 8.5pt;">
    <span>DATE: 07/20/2026 08:45 AM</span>
    <span>TICKET: #90483</span>
  </div>
  <div style="margin-bottom: 16px; font-size: 8.5pt; border-bottom: 1px dashed #9ca3af; padding-bottom: 8px;">
    <span>CASHIER: JESSICA M.</span>
  </div>

  <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 16px; font-size: 9pt;">
    <thead>
      <tr style="border-bottom: 1px solid #1f2937;">
        <th style="padding-bottom: 4px; font-weight: bold;">ITEM DESCRIPTION</th>
        <th style="text-align: right; padding-bottom: 4px; font-weight: bold;">QTY</th>
        <th style="text-align: right; padding-bottom: 4px; font-weight: bold;">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 4px 0;">Frosted Latte (Large)</td>
        <td style="text-align: right; padding: 4px 0;">1</td>
        <td style="text-align: right; padding: 4px 0;">$6.50</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">- Oat Milk Substitution</td>
        <td style="text-align: right; padding: 4px 0;">1</td>
        <td style="text-align: right; padding: 4px 0;">$0.75</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Avocado Sourdough Toast</td>
        <td style="text-align: right; padding: 4px 0;">1</td>
        <td style="text-align: right; padding: 4px 0;">$12.00</td>
      </tr>
      <tr style="border-bottom: 1px dashed #9ca3af;">
        <td style="padding: 4px 0; padding-bottom: 8px;">Organic Matcha Scone</td>
        <td style="text-align: right; padding: 4px 0; padding-bottom: 8px;">2</td>
        <td style="text-align: right; padding: 4px 0; padding-bottom: 8px;">$9.00</td>
      </tr>
    </tbody>
  </table>

  <div style="display: flex; flex-direction: column; align-items: flex-end; font-weight: bold;">
    <div style="display: flex; justify-content: space-between; width: 180px; font-size: 8.5pt; font-weight: normal; margin-bottom: 4px;">
      <span>SUBTOTAL:</span>
      <span>$28.25</span>
    </div>
    <div style="display: flex; justify-content: space-between; width: 180px; font-size: 8.5pt; font-weight: normal; margin-bottom: 4px;">
      <span>SALES TAX (8.5%):</span>
      <span>$2.40</span>
    </div>
    <div style="display: flex; justify-content: space-between; width: 180px; border-top: 1px solid #1f2937; padding-top: 6px; font-size: 10pt;">
      <span>TOTAL DUE:</span>
      <span>$30.65</span>
    </div>
  </div>

  <div style="text-align: center; margin-top: 24px; border-top: 1px dashed #9ca3af; padding-top: 16px; font-size: 8.5pt;">
    <p style="margin: 0;">THANK YOU FOR YOUR PATRONAGE!</p>
    <p style="margin: 4px 0 0 0;">VISIT US AT WWW.FROSTEDCOFFEE.COM</p>
    <div style="margin-top: 12px; font-size: 7.5pt; color: #4b5563;">
      [ BARCODE VALUE: 90483-07202026-FROSTED ]
    </div>
  </div>
</div>`
  },
  {
    id: "contract",
    name: "NDA Contract",
    category: "Legal",
    description: "Mutual corporate non-disclosure agreement layout with classical legal headers and signature lines.",
    suggestedMargins: { left: 72, right: 72, top: 72, bottom: 72 },
    content: `<div style="font-family: 'Times New Roman', serif; color: #000000; line-height: 1.5; font-size: 10.5pt; text-align: justify;">
  <h1 style="font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 0 0 24px 0; letter-spacing: 0.05em;">MUTUAL NON-DISCLOSURE AGREEMENT</h1>
  
  <p style="margin: 0 0 16px 0;">This Mutual Non-Disclosure Agreement (the "Agreement") is entered into and made effective as of July 20, 2026 (the "Effective Date"), by and between:</p>
  
  <p style="margin: 0 0 16px 0; font-weight: bold; padding-left: 20px;">1. GLASSOS SOFTWARE COOPERATIVE, having its principal place of business at 100 Clearway Plaza, San Francisco, California ("Disclosing Party"), and</p>
  <p style="margin: 0 0 24px 0; font-weight: bold; padding-left: 20px;">2. COGNITIVE INTERFACES CORP, having its principal place of business at 492 Shimmer Boulevard, San Jose, California ("Receiving Party").</p>

  <p style="margin: 0 0 16px 0; font-weight: bold; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid #000000; padding-bottom: 2px;">1. Purpose</p>
  <p style="margin: 0 0 16px 0;">The parties wish to explore a potential business relationship in connection with spatial layout rendering software and hardware integrations (the "Transaction"). In connection with this, the parties may disclose certain proprietary technical and business information to each other.</p>

  <p style="margin: 0 0 16px 0; font-weight: bold; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid #000000; padding-bottom: 2px;">2. Confidential Information</p>
  <p style="margin: 0 0 16px 0;">"Confidential Information" shall mean all proprietary, non-public information disclosed by one party to the other, whether orally or in writing, that is designated as confidential or should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.</p>

  <p style="margin: 0 0 16px 0; font-weight: bold; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid #000000; padding-bottom: 2px;">3. Non-Use and Non-Disclosure</p>
  <p style="margin: 0 0 24px 0;">The Receiving Party shall not use the Disclosing Party's Confidential Information for any purpose other than to evaluate and engage in discussions regarding the Transaction. The Receiving Party shall protect the Confidential Information with the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.</p>

  <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
    <div>
      <p style="margin: 0 0 30px 0; font-weight: bold;">GLASSOS SOFTWARE COOPERATIVE</p>
      <div style="border-bottom: 1px solid #000000; height: 30px; margin-bottom: 6px;"></div>
      <p style="margin: 0; font-size: 9.5pt;">By: Evelyn Vance</p>
      <p style="margin: 2px 0 0 0; font-size: 9.5pt;">Title: Chief Executive Officer</p>
    </div>
    <div>
      <p style="margin: 0 0 30px 0; font-weight: bold;">COGNITIVE INTERFACES CORP</p>
      <div style="border-bottom: 1px solid #000000; height: 30px; margin-bottom: 6px;"></div>
      <p style="margin: 0; font-size: 9.5pt;">By: Marcus Cole</p>
      <p style="margin: 2px 0 0 0; font-size: 9.5pt;">Title: President & Chief Counsel</p>
    </div>
  </div>
</div>`
  },
  {
    id: "cover_letter",
    name: "Cover Letter",
    category: "Professional",
    description: "Applicant letter structure expressing alignment with company vision, headers & professional sign-off.",
    suggestedMargins: { left: 72, right: 72, top: 72, bottom: 72 },
    content: `<div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; font-size: 10pt;">
  <div style="margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <h1 style="font-size: 18pt; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.025em;">Kaelen Vance</h1>
      <p style="font-size: 9pt; color: #3b82f6; font-weight: 600; margin: 2px 0 0 0; letter-spacing: 0.05em; text-transform: uppercase;">Lead Product Designer</p>
    </div>
    <div style="text-align: right; font-size: 8.5pt; color: #64748b;">
      <p style="margin: 0;">kaelen.vance@design.io</p>
      <p style="margin: 2px 0 0 0;">(555) 012-9482</p>
      <p style="margin: 2px 0 0 0;">San Francisco, CA</p>
    </div>
  </div>

  <div style="margin-bottom: 24px; color: #64748b;">
    <p style="margin: 0;">July 20, 2026</p>
  </div>

  <div style="margin-bottom: 30px; color: #0f172a;">
    <p style="margin: 0; font-weight: bold;">Hiring Committee</p>
    <p style="margin: 2px 0 0 0;">GlassOS Software Cooperative</p>
    <p style="margin: 2px 0 0 0;">100 Clearway Plaza</p>
    <p style="margin: 2px 0 0 0;">San Francisco, CA 94103</p>
  </div>

  <p style="margin: 0 0 16px 0; font-weight: bold; color: #0f172a;">Dear Members of the Hiring Committee,</p>

  <p style="margin: 0 0 16px 0;">I am writing to express my enthusiastic interest in the <b>Lead Product Designer</b> role at GlassOS Software Cooperative, as advertised on your developer dispatch portal. With over six years of experience building elegant, highly performant, and physics-driven desktop environments, I have long admired GlassOS's commitment to making translucent glassmorphism a first-class citizen of computing interfaces.</p>

  <p style="margin: 0 0 16px 0;">In my previous role as Senior UI/UX Architect at Frostmorphic Design, I led the complete redesign of our cloud collaboration canvas. By introducing micro-interactions, responsive cursor-relative hover glows, and an intuitive z-axis hierarchy, we increased active user engagement by 48%. Crucially, my work involves collaborating tightly with graphics engineers to ensure designs can be rendered smoothly at 120Hz within limited battery constraints.</p>

  <p style="margin: 0 0 16px 0;">GlassOS’s design principles—which prioritize clean typography, functional space, and authentic material simulation over flat, artificial gradients—resonate deeply with my personal design philosophy. I would love the opportunity to bring my experience with high-fidelity point-based rendering and spatial composting pipelines to your design systems team.</p>

  <p style="margin: 0 0 24px 0;">Thank you for your time, consideration, and dedication to the craft of exceptional interfaces. I look forward to discussing how my skills and vision align with the future of GlassOS.</p>

  <div style="margin-top: 40px;">
    <p style="margin: 0; color: #64748b;">Warmest regards,</p>
    <div style="height: 35px; margin: 5px 0;">
      <span style="font-family: 'Georgia', serif; font-size: 16pt; color: #3b82f6; font-style: italic; opacity: 0.85;">Kaelen Vance</span>
    </div>
    <p style="margin: 0; font-weight: bold; color: #0f172a;">Kaelen Vance</p>
  </div>
</div>`
  }
];
