export const firstNameLower = 'pierpaolo'
export const gender = 'his'
export const location = 'Naples, Italy'

export const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/PierW', icon: 'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-2.938.346-5.834-1.283-6.503-3.515-.214-.662.16-.885.488-.747C4.633 10.945 6.174 11.67 8 11.67c1.718 0 3.26-.725 4.388-1.89.328-.138.7.082.488.748-.669 2.231-3.565 3.86-6.503 3.516v2.233c0 .317.193.69.794.577A12.006 12.006 0 0024 12c0-6.627-5.373-12-12-12z' },
  { name: 'YouTube', url: 'https://www.youtube.com/@PierDev', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 12 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { name: 'X', url: 'https://twitter.com/PierpaoloW', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { name: 'Website', url: 'https://portfolio.themillennials.it', icon: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { name: 'Email', url: 'mailto:info@themillennials.it', icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' }
]

export const skills = [
  'HTML5', 'CSS3', 'JavaScript', 'Vue.js', 'PHP', 'Laravel',
  'SQL / MySQL', 'Git', 'Terminal', 'WordPress', 'E-Commerce',
  'SEO', 'Performance Optimization', 'Accessibility', 'Landing Pages', 'Agile'
]

export const projects = [
  { name: 'Trivio Bistrot', description: 'Landing page for a restaurant in Caserta', stars: 42 },
  { name: 'Brown Cafè', description: 'Landing page for a local café', stars: 38 },
  { name: 'boolzapp', description: 'WhatsApp replica — JavaScript', stars: 27 },
  { name: 'htmlcssjs-boolflix', description: 'Netflix replica — JavaScript', stars: 23 },
  { name: 'BoolBnB', description: 'Rental management app — PHP', stars: 31 }
]

export const contactLinks = [
  { label: 'github', value: 'github.com/PierW', url: 'https://github.com/PierW' },
  { label: 'youtube', value: 'youtube.com/@PierDev', url: 'https://www.youtube.com/@PierDev' },
  { label: 'x', value: 'twitter.com/PierpaoloW', url: 'https://twitter.com/PierpaoloW' },
  { label: 'linkedin', value: 'linkedin.com/in/pierpaolo-wurzburger', url: 'https://www.linkedin.com/in/pierpaolo-wurzburger/' },
  { label: 'site', value: 'portfolio.themillennials.it', url: 'https://portfolio.themillennials.it' },
  { label: 'email', value: 'info@themillennials.it', url: 'mailto:info@themillennials.it' }
]

export const toolDetails = {
  0: [
    { text: 'Searching repositories...', detail: 'Scanning github.com/PierW for relevant projects' },
    { text: 'Read github.com/PierW (85 repos)', detail: 'Fetched repository metadata and descriptions' },
    { text: 'Sorted by stars', detail: 'Ranked repositories by star count and relevance' },
  ],
  1: [
    { text: 'Accessing user history', detail: 'Loading career timeline from profile data' },
    { text: 'Parsing experience data', detail: 'Extracting key milestones and projects' },
    { text: 'Formatting biography', detail: 'Generating narrative from structured data' },
  ],
  2: [
    { text: 'Loading skills.json', detail: 'Reading skill database from configuration' },
    { text: 'Parsing skill categories', detail: 'Grouping by frontend, backend, and tools' },
    { text: 'Formatting output', detail: 'Rendering skill list with proficiency indicators' },
  ],
  3: [
    { text: 'Listing directory', detail: 'Scanning projects/ directory structure' },
    { text: 'Fetching project metadata', detail: 'Reading package.json and README files' },
    { text: 'Reading descriptions', detail: 'Extracting project summaries and tech stacks' },
  ],
  4: [
    { text: 'Loading contacts.db', detail: 'Querying contact information database' },
    { text: 'Formatting contact list', detail: 'Organizing by platform and priority' },
    { text: 'Validating URLs', detail: 'Checking link accessibility and status codes' },
  ]
}

export const sections = [
  { id: 'bio', prompt: `who is ${firstNameLower}?`, tools: toolDetails[0] },
  { id: 'background', prompt: `tell me more about ${gender} background`, tools: toolDetails[1] },
  { id: 'skills', prompt: 'cat skills.txt', tools: toolDetails[2] },
  { id: 'projects', prompt: 'ls projects/', tools: toolDetails[3] },
  { id: 'contact', prompt: 'cat contact.txt', tools: toolDetails[4] }
]

export const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

const socialSVGs = socialLinks.map((l) =>
  `<a href="${l.url}" target="_blank" rel="noopener" class="w-5 h-5 text-dim hover:text-accent transition-colors inline-block" aria-label="${l.name}"><svg fill="currentColor" viewBox="0 0 24 24"><path d="${l.icon}"/></svg></a>`
).join('\n      ')

export const heroContent = `<div class="flex flex-col sm:flex-row gap-6 items-start">
  <div class="flex flex-col items-center shrink-0">
    <div class="relative w-52 h-52 rounded-full border-2 border-accent shadow-[0_0_80px_-15px_rgba(245,158,11,0.55)] overflow-hidden">
      <img src="/me.jpg" alt="Pierpaolo Wurzburger" class="w-full h-full object-cover" />
    </div>
    <span class="text-muted text-xs mt-2 font-mono">me.jpg</span>
  </div>
  <div class="flex-1 min-w-0">
    <h1 class="text-5xl sm:text-6xl font-bold tracking-wide uppercase text-foreground">PIERPAOLO WURZBURGER</h1>
    <p class="text-2xl text-success font-mono mt-1">Full-Stack Web Developer</p>
    <p class="text-foreground mt-3 leading-relaxed">Designs and builds <span class="text-accent">scalable software solutions</span> for businesses and professionals. Improving <span class="text-accent">digital presence</span> and <span class="text-accent">web visibility</span>.</p>
    <p class="text-dim text-sm mt-3 font-mono">// ${location}</p>
    <div class="flex items-center gap-4 mt-4">
      ${socialSVGs}
    </div>
  </div>
</div>`

export const bioContent = `Born in <span class="text-accent">Naples</span> in 1991. Fell in love with computing at age 12, starting with <span class="text-accent">Windows XP</span> on the family PC. Today, Pierpaolo works as a <span class="text-accent">Full-Stack Web Developer</span>, crafting scalable solutions from <span class="text-accent">landing pages</span> to <span class="text-accent">e-commerce platforms</span>. He focuses on <span class="text-accent">performance optimization</span>, <span class="text-accent">SEO best practices</span>, and <span class="text-accent">accessibility</span> — always keeping clients involved through an <span class="text-accent">Agile</span> process. Currently building something top secret from home.`