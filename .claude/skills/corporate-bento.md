# Skill: Corporate Bento Design System (Shadcn + Tailwind + Font Awesome)
A professional design paradigm blending Corporate Clean minimalism with structured Bento Grid modular elements.

## 🎨 Design Rules & UI Constraints

### 1. Component Archetypes & Shadcn Tokens
*   **Card Container**: Always use Shadcn's primitive classes or components: `bg-card text-card-foreground border-border rounded-xl shadow-sm`.
*   **Grid Layouts**: Wrap bento sections in `grid grid-cols-1 md:grid-cols-3 gap-6`.
*   **Card Hierarchy**: Use asymmetric row/col spans. Main features should use `md:col-span-2` while supporting elements or metrics use `md:col-span-1`.
*   **Padding Balance**: Maintain a strict `p-6` or `p-8` spacing within cards to sustain a spacious, premium corporate aesthetic.

### 2. Typography & Semantics
*   **Headings**: Headings must use tight tracking and heavy weights (`scroll-m-20 text-xl font-bold tracking-tight text-foreground`).
*   **Muted Text**: Descriptive text must use the muted utility framework (`text-sm text-muted-foreground leading-relaxed`).

### 3. Font Awesome Icon Integration
*   **Sizing**: Standardize context icons at `fa-lg` or `fa-xl`. Inside small data cards, use `fa-sm` or `fa-md`.
*   **Coloring**: Keep icons elegant and low-profile by applying `text-muted-foreground` or a soft corporate accent variant (e.g., `text-primary` or `text-blue-600`).
*   **Layout placement**: Place icons inside a clean, rounded background chip (`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center`) directly preceding headers.

### 4. Implementation Code Blueprint
When building sections or dashboards, strictly implement layouts using this standard markup pattern:

```html
<section class="max-w-7xl mx-auto px-6 py-20 bg-background">
  <!-- Corporate Header -->
  <div class="max-w-3xl mb-12">
    <p class="text-sm font-semibold tracking-wider uppercase text-primary mb-2">Platform Infrastructure</p>
    <h2 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
      Engineered for deep analytical clarity.
    </h2>
    <p class="mt-4 text-lg text-muted-foreground">
      A high-performance command center balancing metric visualization and modular layout design.
    </p>
  </div>

  <!-- Corporate Bento Grid Box -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    <!-- Primary Highlight Feature (2 Columns Wide) -->
    <div class="md:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <i class="fa-solid fa-chart-network text-primary fa-lg"></i>
          </div>
          <h3 class="text-xl font-bold tracking-tight text-foreground">Global Metric Node Streams</h3>
        </div>
        <p class="text-sm text-muted-foreground max-w-xl">
          Instantly view concurrent system performance pipelines running globally across clusters.
        </p>
      </div>
      <!-- Mock Visual Content Block -->
      <div class="mt-8 h-44 rounded-lg bg-muted/40 border border-dashed border-border flex items-center justify-center">
        <span class="text-xs font-mono text-muted-foreground">[ Minimalist Area Chart Graphic ]</span>
      </div>
    </div>

    <!-- Secondary Analytic Feature (1 Column Wide) -->
    <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <i class="fa-solid fa-shield-check text-muted-foreground fa-lg"></i>
          </div>
          <h3 class="text-xl font-bold tracking-tight text-foreground">Verified Uptime</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          Enterprise operational guarantee backed by global consensus monitoring.
        </p>
      </div>
      <div class="mt-8">
        <div class="text-5xl font-extrabold tracking-tight text-foreground flex items-baseline gap-1">
          99.99<span class="text-2xl font-semibold text-muted-foreground">%</span>
        </div>
        <div class="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <i class="fa-solid fa-circle-check"></i> Active & Balanced
        </div>
      </div>
    </div>

  </div>
</section>
```