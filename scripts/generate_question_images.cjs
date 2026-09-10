const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'static', 'questions');
fs.mkdirSync(outDir, { recursive: true });

async function makePng(svgString, filename) {
  const buf = Buffer.from(svgString);
  await sharp(buf, { density: 150 })
    .png({ quality: 100 })
    .toFile(path.join(outDir, filename));
  console.log(`Generated ${filename}`);
}

async function run() {
  // Q1: Scrambled Python Program - ONLY code pieces. NO question text, NO hints inside image
  const q1Svg = `
  <svg width="900" height="360" viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="360" fill="#080e1a" rx="16"/>
    <rect x="20" y="20" width="860" height="320" fill="#0b1329" rx="12" stroke="#1e293b" stroke-width="2"/>
    
    <!-- Header: Visual label only, no question statement -->
    <g transform="translate(40, 40)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#38bdf8">Scrambled Python Program — Code Pieces</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">9 code blocks available for assembly</text>
    </g>

    <!-- Code Pieces Box (3x3 Grid) -->
    <g transform="translate(40, 105)">
      <!-- Row 1 -->
      <g transform="translate(0, 10)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">1</text>
        <text x="44" y="29" font-family="monospace" font-size="13" fill="#e2e8f0">if num % 2 == 0:</text>
      </g>
      <g transform="translate(280, 10)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">2</text>
        <text x="44" y="29" font-family="monospace" font-size="13" fill="#e2e8f0">print("Even")</text>
      </g>
      <g transform="translate(560, 10)">
        <rect width="260" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">3</text>
        <text x="44" y="29" font-family="monospace" font-size="13" fill="#e2e8f0">num = int(input())</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 70)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">4</text>
        <text x="44" y="29" font-family="monospace" font-size="13" fill="#e2e8f0">else:</text>
      </g>
      <g transform="translate(280, 70)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">5</text>
        <text x="44" y="29" font-family="monospace" font-size="13" fill="#e2e8f0">print("Odd")</text>
      </g>
      <g transform="translate(560, 70)">
        <rect width="260" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">6</text>
        <text x="44" y="29" font-family="monospace" font-size="12" fill="#e2e8f0">print("Enter a number:")</text>
      </g>

      <!-- Row 3 -->
      <g transform="translate(0, 130)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">7</text>
        <text x="44" y="29" font-family="monospace" font-size="13" fill="#e2e8f0">try:</text>
      </g>
      <g transform="translate(280, 130)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">8</text>
        <text x="44" y="29" font-family="monospace" font-size="13" fill="#e2e8f0">except ValueError:</text>
      </g>
      <g transform="translate(560, 130)">
        <rect width="260" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/>
        <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">9</text>
        <text x="44" y="29" font-family="monospace" font-size="12" fill="#e2e8f0">print("Invalid input")</text>
      </g>
    </g>
  </svg>
  `;
  await makePng(q1Svg, 'question_01.png');

  // Q2: C Function Pointer - Code editor window ONLY. NO question text banner inside image
  const q2Svg = `
  <svg width="900" height="370" viewBox="0 0 900 370" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="370" fill="#0a0f1d" rx="16"/>
    
    <!-- Code Editor Window -->
    <g transform="translate(30, 25)">
      <rect width="840" height="320" rx="10" fill="#060913" stroke="#334155" stroke-width="1.5"/>
      <circle cx="25" cy="22" r="6" fill="#ef4444"/>
      <circle cx="45" cy="22" r="6" fill="#f59e0b"/>
      <circle cx="65" cy="22" r="6" fill="#10b981"/>
      <text x="95" y="26" font-family="monospace" font-size="12" fill="#64748b">program.c</text>

      <!-- Code Lines -->
      <g transform="translate(30, 55)" font-family="Consolas, 'Courier New', monospace" font-size="14">
        <text x="0" y="0" fill="#64748b">1</text>
        <text x="40" y="0" fill="#93c5fd">#include</text> <text x="120" y="0" fill="#6ee7b7">&lt;stdio.h&gt;</text>

        <text x="0" y="26" fill="#64748b">2</text>
        <text x="40" y="26" fill="#f43f5e">int</text> <text x="75" y="26" fill="#38bdf8">add</text><text x="105" y="26" fill="#cbd5e1">(int a, int b) {</text> <text x="245" y="26" fill="#f43f5e">return</text> <text x="305" y="26" fill="#cbd5e1">a + b; }</text>

        <text x="0" y="52" fill="#64748b">3</text>
        <text x="40" y="52" fill="#f43f5e">int</text> <text x="75" y="52" fill="#38bdf8">main</text><text x="115" y="52" fill="#cbd5e1">() {</text>

        <text x="0" y="78" fill="#64748b">4</text>
        <text x="60" y="78" fill="#f43f5e">int</text> <text x="95" y="78" fill="#cbd5e1">nums[3] = {2, 5, 8};</text>

        <!-- Missing Code Highlight Block -->
        <rect x="35" y="93" width="750" height="68" rx="4" fill="#382109" stroke="#b45309" stroke-dasharray="4,4"/>
        <text x="0" y="112" fill="#f59e0b">5</text>
        <text x="60" y="112" fill="#d97706">/* ------------------------------------------------------------- */</text>
        <text x="0" y="134" fill="#f59e0b">6</text>
        <text x="60" y="134" fill="#fbbf24" font-weight="bold">/* ??? [ 3 LINES OF CODE MISSING ] ???                          */</text>
        <text x="0" y="156" fill="#f59e0b">7</text>
        <text x="60" y="156" fill="#d97706">/* ------------------------------------------------------------- */</text>

        <text x="0" y="190" fill="#64748b">8</text>
        <text x="60" y="190" fill="#38bdf8">printf</text><text x="115" y="190" fill="#cbd5e1">(<tspan fill="#6ee7b7">"Result: %d\\n"</tspan>, total);</text>

        <text x="0" y="216" fill="#64748b">9</text>
        <text x="60" y="216" fill="#f43f5e">return</text> <text x="120" y="216" fill="#cbd5e1">0;</text>

        <text x="0" y="242" fill="#64748b">10</text>
        <text x="40" y="242" fill="#cbd5e1">}</text>
      </g>
    </g>
  </svg>
  `;
  await makePng(q2Svg, 'question_02.png');

  // Q3: Database Puzzle - ER Diagram Schema ONLY. NO question box or question text inside image
  const q3Svg = `
  <svg width="960" height="390" viewBox="0 0 960 390" xmlns="http://www.w3.org/2000/svg">
    <rect width="960" height="390" fill="#070c18" rx="16"/>
    <rect x="20" y="20" width="920" height="350" fill="#0a1226" rx="12" stroke="#1e293b" stroke-width="2"/>

    <!-- Header: Diagram title only -->
    <g transform="translate(40, 40)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#38bdf8">University Management System — ER Diagram Schema</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Entities, attributes, and relationships</text>
    </g>

    <!-- Puzzle Pieces (Entities & Relations) -->
    <g transform="translate(40, 95)">
      <!-- Row 1 -->
      <!-- Entity 1: STUDENT -->
      <g transform="translate(0, 15)">
        <rect width="135" height="75" rx="6" fill="#0f172a" stroke="#0284c7"/>
        <rect width="135" height="22" rx="6" fill="#0284c7"/>
        <text x="8" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff">1  STUDENT</text>
        <text x="8" y="36" font-family="sans-serif" font-size="9" fill="#f8fafc">student_id (PK)</text>
        <text x="8" y="50" font-family="sans-serif" font-size="9" fill="#94a3b8">name, email</text>
        <text x="8" y="64" font-family="sans-serif" font-size="9" fill="#94a3b8">department_id (FK)</text>
      </g>

      <!-- Relation 2: ENROLLS -->
      <g transform="translate(150, 25)">
        <polygon points="55,0 110,25 55,50 0,25" fill="#0f172a" stroke="#38bdf8"/>
        <text x="55" y="28" font-family="sans-serif" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">ENROLLS</text>
        <text x="-12" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">M</text>
        <text x="115" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">N</text>
      </g>

      <!-- Entity 3: COURSE -->
      <g transform="translate(290, 15)">
        <rect width="135" height="75" rx="6" fill="#0f172a" stroke="#10b981"/>
        <rect width="135" height="22" rx="6" fill="#059669"/>
        <text x="8" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff">3  COURSE</text>
        <text x="8" y="36" font-family="sans-serif" font-size="9" fill="#f8fafc">course_id (PK)</text>
        <text x="8" y="50" font-family="sans-serif" font-size="9" fill="#94a3b8">title, credits</text>
        <text x="8" y="64" font-family="sans-serif" font-size="9" fill="#94a3b8">department_id (FK)</text>
      </g>

      <!-- Relation 4: TEACHES -->
      <g transform="translate(440, 25)">
        <polygon points="50,0 100,25 50,50 0,25" fill="#0f172a" stroke="#818cf8"/>
        <text x="50" y="28" font-family="sans-serif" font-size="9" font-weight="bold" fill="#818cf8" text-anchor="middle">TEACHES</text>
        <text x="-10" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">1</text>
        <text x="105" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">N</text>
      </g>

      <!-- Entity 5: INSTRUCTOR -->
      <g transform="translate(570, 15)">
        <rect width="135" height="75" rx="6" fill="#0f172a" stroke="#8b5cf6"/>
        <rect width="135" height="22" rx="6" fill="#7c3aed"/>
        <text x="8" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff">5  INSTRUCTOR</text>
        <text x="8" y="36" font-family="sans-serif" font-size="9" fill="#f8fafc">instructor_id (PK)</text>
        <text x="8" y="50" font-family="sans-serif" font-size="9" fill="#94a3b8">name, email</text>
        <text x="8" y="64" font-family="sans-serif" font-size="9" fill="#94a3b8">department_id (FK)</text>
      </g>

      <!-- Relation 6: HAS -->
      <g transform="translate(720, 25)">
        <polygon points="45,0 90,25 45,50 0,25" fill="#0f172a" stroke="#f59e0b"/>
        <text x="45" y="28" font-family="sans-serif" font-size="9" font-weight="bold" fill="#f59e0b" text-anchor="middle">HAS</text>
        <text x="-10" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">1</text>
        <text x="95" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">N</text>
      </g>

      <!-- Row 2 -->
      <!-- Entity 7: DEPARTMENT -->
      <g transform="translate(0, 120)">
        <rect width="135" height="65" rx="6" fill="#0f172a" stroke="#ec4899"/>
        <rect width="135" height="22" rx="6" fill="#db2777"/>
        <text x="8" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff">7  DEPARTMENT</text>
        <text x="8" y="36" font-family="sans-serif" font-size="9" fill="#f8fafc">department_id (PK)</text>
        <text x="8" y="50" font-family="sans-serif" font-size="9" fill="#94a3b8">name, location</text>
      </g>

      <!-- Relation 8: BELONGS_TO -->
      <g transform="translate(150, 130)">
        <polygon points="55,0 110,25 55,50 0,25" fill="#0f172a" stroke="#ec4899"/>
        <text x="55" y="28" font-family="sans-serif" font-size="8" font-weight="bold" fill="#f472b6" text-anchor="middle">BELONGS TO</text>
        <text x="-10" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">N</text>
        <text x="115" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">1</text>
      </g>

      <!-- Relation 9: PREREQUISITE -->
      <g transform="translate(290, 130)">
        <polygon points="60,0 120,25 60,50 0,25" fill="#0f172a" stroke="#14b8a6"/>
        <text x="60" y="28" font-family="sans-serif" font-size="8" font-weight="bold" fill="#2dd4bf" text-anchor="middle">PREREQUISITE</text>
        <text x="-10" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">M</text>
        <text x="125" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">N</text>
      </g>

      <!-- Entity 10: COURSE_PREREQUISITE -->
      <g transform="translate(440, 120)">
        <rect width="135" height="65" rx="6" fill="#0f172a" stroke="#14b8a6"/>
        <rect width="135" height="22" rx="6" fill="#0d9488"/>
        <text x="8" y="15" font-family="sans-serif" font-size="8" font-weight="bold" fill="#fff">10 COURSE_PREREQUISITE</text>
        <text x="8" y="36" font-family="sans-serif" font-size="9" fill="#f8fafc">course_id (FK)</text>
        <text x="8" y="50" font-family="sans-serif" font-size="9" fill="#94a3b8">prerequisite_id (FK)</text>
      </g>

      <!-- Relation 11: TAUGHT_IN -->
      <g transform="translate(590, 130)">
        <polygon points="50,0 100,25 50,50 0,25" fill="#0f172a" stroke="#3b82f6"/>
        <text x="50" y="28" font-family="sans-serif" font-size="8" font-weight="bold" fill="#60a5fa" text-anchor="middle">TAUGHT_IN</text>
        <text x="-10" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">N</text>
        <text x="105" y="28" font-family="sans-serif" font-size="10" fill="#cbd5e1">1</text>
      </g>

      <!-- Entity 12: SEMESTER -->
      <g transform="translate(710, 120)">
        <rect width="135" height="65" rx="6" fill="#0f172a" stroke="#3b82f6"/>
        <rect width="135" height="22" rx="6" fill="#2563eb"/>
        <text x="8" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff">12 SEMESTER</text>
        <text x="8" y="36" font-family="sans-serif" font-size="9" fill="#f8fafc">semester_id (PK)</text>
        <text x="8" y="50" font-family="sans-serif" font-size="9" fill="#94a3b8">name, start_date</text>
      </g>
    </g>
  </svg>
  `;
  await makePng(q3Svg, 'question_03.png');

  // Q4: Password Puzzle - Security Policy & Attack Logs ONLY. NO question text banner inside image
  const q4Svg = `
  <svg width="860" height="420" viewBox="0 0 860 420" xmlns="http://www.w3.org/2000/svg">
    <rect width="860" height="420" fill="#090f1d" rx="16"/>
    <rect x="20" y="20" width="820" height="380" fill="#0a1226" rx="12" stroke="#1e293b" stroke-width="2"/>

    <!-- Header -->
    <g transform="translate(40, 45)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#38bdf8" letter-spacing="0.5">Security Specifications &amp; Attack Logs</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Policy requirements and attacker's failed attempts</text>
    </g>

    <!-- Scenario Card -->
    <g transform="translate(40, 95)">
      <rect width="780" height="280" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="24" y="28" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#38bdf8">Security Specifications:</text>

      <g transform="translate(24, 45)" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">
        <text x="0" y="20">• Password length is <tspan font-weight="bold" fill="#f59e0b">exactly 8 characters</tspan>.</text>
        <text x="0" y="44">• Contains <tspan font-weight="bold" fill="#f8fafc">exactly 2 digits</tspan> and <tspan font-weight="bold" fill="#38bdf8">one special character (@, #, or $)</tspan>.</text>
        <text x="0" y="68">• The remaining <tspan font-weight="bold" fill="#f8fafc">5 characters</tspan> are lowercase letters.</text>
        <text x="0" y="92">• Employee name: <tspan font-weight="bold" fill="#f8fafc">KARAN</tspan> | Birth year: <tspan font-weight="bold" fill="#f8fafc">2004</tspan> | Favorite color: <tspan font-weight="bold" fill="#f8fafc">BLUE</tspan>.</text>
        <text x="0" y="116">• Company policy prohibits directly containing the employee's full name or birth year.</text>
        <text x="0" y="146" font-weight="600" fill="#ef4444">Attacker has already tried (and failed) with these passwords:</text>
      </g>

      <!-- Attacker attempted pills -->
      <g transform="translate(24, 215)">
        <rect x="0" y="0" width="730" height="34" rx="6" fill="#180d14" stroke="#881337"/>
        <text x="20" y="22" font-family="monospace" font-size="13" fill="#fda4af">blue@04x    blue#04k    blue$04n    k@04blue    r#04blue</text>
      </g>
    </g>
  </svg>
  `;
  await makePng(q4Svg, 'question_04.png');

  // Q5: Java String Pool - Code editor ONLY. NO question line inside image
  const q5Svg = `
  <svg width="860" height="370" viewBox="0 0 860 370" xmlns="http://www.w3.org/2000/svg">
    <rect width="860" height="370" fill="#070c18" rx="16"/>
    <rect x="20" y="20" width="820" height="330" fill="#0a1226" rx="12" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Terminal Code Box -->
    <g transform="translate(40, 35)">
      <rect width="780" height="300" rx="10" fill="#050811" stroke="#334155" stroke-width="1.5"/>
      <circle cx="25" cy="22" r="6" fill="#ef4444"/>
      <circle cx="45" cy="22" r="6" fill="#f59e0b"/>
      <circle cx="65" cy="22" r="6" fill="#10b981"/>
      <text x="95" y="26" font-family="monospace" font-size="12" fill="#64748b">Main.java</text>

      <g transform="translate(30, 55)" font-family="Consolas, 'Courier New', monospace" font-size="14">
        <text x="0" y="0" fill="#64748b">1</text>
        <text x="35" y="0" fill="#38bdf8">public class</text> <text x="135" y="0" fill="#fbbf24">Main</text> <text x="175" y="0" fill="#cbd5e1">{</text>

        <text x="0" y="24" fill="#64748b">2</text>
        <text x="55" y="24" fill="#38bdf8">public static void</text> <text x="205" y="24" fill="#fbbf24">main</text><text x="240" y="24" fill="#cbd5e1">(String[] args) {</text>

        <text x="0" y="48" fill="#64748b">3</text>
        <text x="85" y="48" fill="#38bdf8">String</text> <text x="140" y="48" fill="#cbd5e1">s1 = </text><text x="180" y="48" fill="#6ee7b7">"Java"</text><text x="230" y="48" fill="#cbd5e1">;</text>

        <text x="0" y="72" fill="#64748b">4</text>
        <text x="85" y="72" fill="#38bdf8">String</text> <text x="140" y="72" fill="#cbd5e1">s2 = </text><text x="180" y="72" fill="#38bdf8">new</text> <text x="215" y="72" fill="#38bdf8">String</text><text x="265" y="72" fill="#cbd5e1">(</text><text x="275" y="72" fill="#6ee7b7">"Java"</text><text x="325" y="72" fill="#cbd5e1">);</text>

        <text x="0" y="96" fill="#64748b">5</text>
        <text x="85" y="96" fill="#38bdf8">String</text> <text x="140" y="96" fill="#cbd5e1">s3 = s2.</text><text x="205" y="96" fill="#fbbf24">intern</text><text x="255" y="96" fill="#cbd5e1">();</text>

        <text x="0" y="120" fill="#64748b">6</text>
        <text x="85" y="120" fill="#38bdf8">boolean</text> <text x="150" y="120" fill="#cbd5e1">b1 = (s1 == s2);</text>

        <text x="0" y="144" fill="#64748b">7</text>
        <text x="85" y="144" fill="#38bdf8">boolean</text> <text x="150" y="144" fill="#cbd5e1">b2 = (s1 == s3);</text>

        <text x="0" y="168" fill="#64748b">8</text>
        <text x="85" y="168" fill="#cbd5e1">System.out.println(</text><text x="240" y="168" fill="#6ee7b7">"Res: "</text> <text x="295" y="168" fill="#cbd5e1">+ b1 + </text><text x="350" y="168" fill="#6ee7b7">","</text> <text x="380" y="168" fill="#cbd5e1">+ (b2 ? </text><text x="440" y="168" fill="#fbbf24">10</text> <text x="460" y="168" fill="#cbd5e1">: </text><text x="475" y="168" fill="#fbbf24">20</text><text x="495" y="168" fill="#cbd5e1">) + </text><text x="525" y="168" fill="#6ee7b7">"None"</text><text x="575" y="168" fill="#cbd5e1">);</text>

        <text x="0" y="196" fill="#64748b">9</text>
        <text x="55" y="196" fill="#cbd5e1">}</text>

        <text x="0" y="220" fill="#64748b">10</text>
        <text x="35" y="220" fill="#cbd5e1">}</text>
      </g>
    </g>
  </svg>
  `;
  await makePng(q5Svg, 'question_05.png');

  // Q6: Prim's Algorithm - Graph & Details ONLY. NO question box or question text inside image
  const q6Svg = `
  <svg width="860" height="430" viewBox="0 0 860 430" xmlns="http://www.w3.org/2000/svg">
    <rect width="860" height="430" fill="#070c18" rx="16"/>
    <rect x="20" y="20" width="820" height="390" fill="#0a1226" rx="12" stroke="#1e293b" stroke-width="2"/>

    <!-- Header -->
    <g transform="translate(40, 40)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#38bdf8">Weighted Graph Diagram — Vertices A through G</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">Edge weights for minimum spanning tree analysis</text>
    </g>

    <!-- Graph Panel (Left) -->
    <g transform="translate(40, 95)">
      <rect width="500" height="300" rx="8" fill="#070f1f" stroke="#1e293b"/>

      <!-- Edges and weights -->
      <!-- A to B (weight 4) -->
      <line x1="250" y1="35" x2="90" y2="85" stroke="#475569" stroke-width="2.5"/>
      <rect x="160" y="50" width="22" height="18" rx="4" fill="#0f172a"/><text x="171" y="64" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">4</text>

      <!-- A to C (weight 2) -->
      <line x1="250" y1="35" x2="410" y2="85" stroke="#475569" stroke-width="2.5"/>
      <rect x="325" y="50" width="22" height="18" rx="4" fill="#0f172a"/><text x="336" y="64" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">2</text>

      <!-- B to D (weight 3) -->
      <line x1="90" y1="85" x2="90" y2="175" stroke="#475569" stroke-width="2.5"/>
      <rect x="75" y="120" width="22" height="18" rx="4" fill="#0f172a"/><text x="86" y="134" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">3</text>

      <!-- B to E (weight 8) -->
      <line x1="90" y1="85" x2="410" y2="175" stroke="#475569" stroke-width="2.5"/>
      <rect x="220" y="120" width="22" height="18" rx="4" fill="#0f172a"/><text x="231" y="134" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">8</text>

      <!-- C to D (weight 4) -->
      <line x1="410" y1="85" x2="90" y2="175" stroke="#475569" stroke-width="2.5"/>
      <rect x="280" y="120" width="22" height="18" rx="4" fill="#0f172a"/><text x="291" y="134" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">4</text>

      <!-- C to E (weight 5) -->
      <line x1="410" y1="85" x2="410" y2="175" stroke="#475569" stroke-width="2.5"/>
      <rect x="415" y="120" width="22" height="18" rx="4" fill="#0f172a"/><text x="426" y="134" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">5</text>

      <!-- D to E (weight 1) -->
      <line x1="90" y1="175" x2="410" y2="175" stroke="#475569" stroke-width="2.5"/>
      <rect x="240" y="165" width="22" height="18" rx="4" fill="#0f172a"/><text x="251" y="179" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">1</text>

      <!-- D to F (weight 6) -->
      <line x1="90" y1="175" x2="90" y2="265" stroke="#475569" stroke-width="2.5"/>
      <rect x="65" y="210" width="22" height="18" rx="4" fill="#0f172a"/><text x="76" y="224" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">6</text>

      <!-- E to F (weight 8) -->
      <line x1="410" y1="175" x2="90" y2="265" stroke="#475569" stroke-width="2.5"/>
      <rect x="220" y="210" width="22" height="18" rx="4" fill="#0f172a"/><text x="231" y="224" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">8</text>

      <!-- E to G (weight 7) -->
      <line x1="410" y1="175" x2="410" y2="265" stroke="#475569" stroke-width="2.5"/>
      <rect x="415" y="210" width="22" height="18" rx="4" fill="#0f172a"/><text x="426" y="224" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">7</text>

      <!-- F to G (weight 9) -->
      <line x1="90" y1="265" x2="410" y2="265" stroke="#475569" stroke-width="2.5"/>
      <rect x="240" y="255" width="22" height="18" rx="4" fill="#0f172a"/><text x="251" y="269" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">9</text>

      <!-- Nodes -->
      <circle cx="250" cy="35" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="250" y="40" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">A</text>
      <circle cx="90" cy="85" r="16" fill="#16a34a" stroke="#4ade80" stroke-width="2"/><text x="90" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">B</text>
      <circle cx="410" cy="85" r="16" fill="#9333ea" stroke="#c084fc" stroke-width="2"/><text x="410" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">C</text>
      <circle cx="90" cy="175" r="16" fill="#ea580c" stroke="#fb923c" stroke-width="2"/><text x="90" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">D</text>
      <circle cx="410" cy="175" r="16" fill="#e11d48" stroke="#f43f5e" stroke-width="2"/><text x="410" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">E</text>
      <circle cx="90" cy="265" r="16" fill="#0891b2" stroke="#22d3ee" stroke-width="2"/><text x="90" y="270" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">F</text>
      <circle cx="410" cy="265" r="16" fill="#7c3aed" stroke="#a855f7" stroke-width="2"/><text x="410" y="270" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">G</text>
    </g>

    <!-- Details Box (Right) -->
    <g transform="translate(560, 95)">
      <rect width="220" height="300" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="20" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#38bdf8">Graph Topology:</text>
      <text x="20" y="65" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">• Vertices: 7</text>
      <text x="20" y="90" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">  (A, B, C, D, E, F, G)</text>
      <text x="20" y="125" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">• Total Edges: 11</text>
      <text x="20" y="160" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">• Spanning Tree Edges: 6</text>
      <text x="20" y="195" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">• Source Vertex: Node A</text>
    </g>
  </svg>
  `;
  await makePng(q6Svg, 'question_06.png');

  // Q7: Python Prime & Reverse - Code pieces ONLY. NO question statement inside image
  const q7Svg = `
  <svg width="900" height="360" viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="360" fill="#080e1a" rx="16"/>
    <rect x="20" y="20" width="860" height="320" fill="#0b1329" rx="12" stroke="#1e293b" stroke-width="2"/>

    <!-- Header: Visual label only -->
    <g transform="translate(40, 40)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#38bdf8">Python Functions &amp; Main Block — Code Pieces</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">9 code blocks available for assembly</text>
    </g>

    <!-- Code Pieces Box (9 pieces in 3x3) -->
    <g transform="translate(40, 105)">
      <!-- Row 1 -->
      <g transform="translate(0, 10)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">1</text>
        <text x="44" y="23" font-family="monospace" font-size="11" fill="#e2e8f0">def is_prime(num):</text>
        <text x="44" y="37" font-family="monospace" font-size="10" fill="#94a3b8">  if num &lt; 2: return False</text>
      </g>
      <g transform="translate(280, 10)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">2</text>
        <text x="44" y="23" font-family="monospace" font-size="10" fill="#e2e8f0">for n in range(2, num):</text>
        <text x="44" y="37" font-family="monospace" font-size="10" fill="#94a3b8">  if num % n == 0: return False</text>
      </g>
      <g transform="translate(560, 10)">
        <rect width="260" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">3</text>
        <text x="44" y="29" font-family="monospace" font-size="12" fill="#e2e8f0">return True</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 70)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">4</text>
        <text x="44" y="23" font-family="monospace" font-size="11" fill="#e2e8f0">print("Enter a number:")</text>
        <text x="44" y="37" font-family="monospace" font-size="11" fill="#94a3b8">n = int(input())</text>
      </g>
      <g transform="translate(280, 70)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">5</text>
        <text x="44" y="29" font-family="monospace" font-size="11" fill="#e2e8f0">print("Prime" if is_prime(n) else "Not")</text>
      </g>
      <g transform="translate(560, 70)">
        <rect width="260" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">6</text>
        <text x="44" y="23" font-family="monospace" font-size="11" fill="#e2e8f0">def reverse_string(s):</text>
        <text x="44" y="37" font-family="monospace" font-size="11" fill="#94a3b8">  return s[::-1]</text>
      </g>

      <!-- Row 3 -->
      <g transform="translate(0, 130)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">7</text>
        <text x="44" y="29" font-family="monospace" font-size="11" fill="#e2e8f0">s = input("Enter a string: ")</text>
      </g>
      <g transform="translate(280, 130)">
        <rect width="250" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">8</text>
        <text x="44" y="29" font-family="monospace" font-size="11" fill="#e2e8f0">print(reverse_string(s))</text>
      </g>
      <g transform="translate(560, 130)">
        <rect width="260" height="48" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
        <circle cx="20" cy="24" r="12" fill="#0284c7"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">9</text>
        <text x="44" y="29" font-family="monospace" font-size="11" fill="#e2e8f0">if __name__ == "__main__":</text>
      </g>
    </g>
  </svg>
  `;
  await makePng(q7Svg, 'question_07.png');

  // Q8: Multistage Graph - Directed graph stages ONLY. NO question footer inside image
  const q8Svg = `
  <svg width="900" height="390" viewBox="0 0 900 390" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="390" fill="#080e1a" rx="16"/>
    <rect x="20" y="20" width="860" height="350" fill="#0b1329" rx="12" stroke="#1e293b" stroke-width="2"/>

    <!-- Header -->
    <g transform="translate(40, 40)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#38bdf8">Multistage Graph: Stages &amp; Travel Costs</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">Directed graph from START to destination T</text>
    </g>

    <!-- Multistage Graph Canvas -->
    <g transform="translate(40, 95)">
      <rect width="820" height="255" rx="8" fill="#060a14" stroke="#1e293b"/>

      <!-- Stage Labels -->
      <text x="60" y="235" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Stage 0 (Start)</text>
      <text x="210" y="235" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Stage 1</text>
      <text x="380" y="235" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Stage 2</text>
      <text x="560" y="235" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Stage 3</text>
      <text x="740" y="235" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Stage 4 (End)</text>

      <!-- Arrows and Edges -->
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
        </marker>
      </defs>

      <!-- START to A (4) -->
      <line x1="85" y1="100" x2="190" y2="50" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="130" y="65" width="18" height="16" rx="3" fill="#0f172a"/><text x="139" y="77" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">4</text>

      <!-- START to B (5) -->
      <line x1="85" y1="110" x2="190" y2="110" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="135" y="102" width="18" height="16" rx="3" fill="#0f172a"/><text x="144" y="114" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">5</text>

      <!-- START to C (6) -->
      <line x1="85" y1="120" x2="190" y2="170" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="130" y="145" width="18" height="16" rx="3" fill="#0f172a"/><text x="139" y="157" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">6</text>

      <!-- A to D (4) -->
      <line x1="230" y1="45" x2="360" y2="45" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="290" y="37" width="18" height="16" rx="3" fill="#0f172a"/><text x="299" y="49" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">4</text>

      <!-- A to E (6) -->
      <line x1="225" y1="55" x2="365" y2="105" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="290" y="70" width="18" height="16" rx="3" fill="#0f172a"/><text x="299" y="82" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">6</text>

      <!-- B to E (3) -->
      <line x1="230" y1="110" x2="360" y2="110" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="290" y="102" width="18" height="16" rx="3" fill="#0f172a"/><text x="299" y="114" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">3</text>

      <!-- B to F (8) -->
      <line x1="225" y1="120" x2="365" y2="170" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="285" y="140" width="18" height="16" rx="3" fill="#0f172a"/><text x="294" y="152" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">8</text>

      <!-- C to F (3) -->
      <line x1="230" y1="175" x2="360" y2="175" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="290" y="167" width="18" height="16" rx="3" fill="#0f172a"/><text x="299" y="179" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">3</text>

      <!-- D to G (5) -->
      <line x1="400" y1="45" x2="540" y2="45" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="465" y="37" width="18" height="16" rx="3" fill="#0f172a"/><text x="474" y="49" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">5</text>

      <!-- E to G (2) -->
      <line x1="395" y1="105" x2="545" y2="55" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="465" y="70" width="18" height="16" rx="3" fill="#0f172a"/><text x="474" y="82" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">2</text>

      <!-- E to H (3) -->
      <line x1="395" y1="115" x2="545" y2="165" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="465" y="135" width="18" height="16" rx="3" fill="#0f172a"/><text x="474" y="147" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">3</text>

      <!-- F to H (1) -->
      <line x1="400" y1="175" x2="540" y2="175" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="465" y="167" width="18" height="16" rx="3" fill="#0f172a"/><text x="474" y="179" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">1</text>

      <!-- G to T (4) -->
      <line x1="580" y1="55" x2="720" y2="105" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="645" y="70" width="18" height="16" rx="3" fill="#0f172a"/><text x="654" y="82" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">4</text>

      <!-- H to T (2) -->
      <line x1="580" y1="165" x2="720" y2="115" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="645" y="135" width="18" height="16" rx="3" fill="#0f172a"/><text x="654" y="147" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">2</text>

      <!-- Nodes -->
      <rect x="35" y="92" width="60" height="35" rx="6" fill="#059669" stroke="#34d399" stroke-width="1.5"/>
      <text x="65" y="114" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">START</text>

      <!-- Stage 1 Nodes -->
      <circle cx="210" cy="45" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="210" y="50" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">A</text>
      <circle cx="210" cy="110" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="210" y="115" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">B</text>
      <circle cx="210" cy="175" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="210" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">C</text>

      <!-- Stage 2 Nodes -->
      <circle cx="380" cy="45" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="380" y="50" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">D</text>
      <circle cx="380" cy="110" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="380" y="115" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">E</text>
      <circle cx="380" cy="175" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="380" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">F</text>

      <!-- Stage 3 Nodes -->
      <circle cx="560" cy="45" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="560" y="50" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">G</text>
      <circle cx="560" cy="175" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/><text x="560" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">H</text>

      <!-- T Node -->
      <circle cx="740" cy="110" r="18" fill="#9333ea" stroke="#c084fc" stroke-width="2"/>
      <text x="740" y="116" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">T</text>
    </g>
  </svg>
  `;
  await makePng(q8Svg, 'question_08.png');

  // Q9: 4-bit Binary Encoding - Table & Encoded Bitstream ONLY. NO question text inside image
  const q9Svg = `
  <svg width="860" height="380" viewBox="0 0 860 380" xmlns="http://www.w3.org/2000/svg">
    <rect width="860" height="380" fill="#080e1a" rx="16"/>
    <rect x="20" y="20" width="820" height="340" fill="#0b1329" rx="12" stroke="#1e293b" stroke-width="2"/>

    <!-- Header -->
    <g transform="translate(40, 40)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#38bdf8">Binary Encoding Scheme &amp; Bitstream</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">Character mappings and the encoded sequence</text>
    </g>

    <!-- Table & Encoded Message Box -->
    <g transform="translate(40, 95)">
      <!-- Table (Left) -->
      <g transform="translate(0, 0)">
        <rect width="320" height="245" rx="8" fill="#0f172a" stroke="#334155"/>
        <rect width="320" height="34" rx="8" fill="#0284c7"/>
        <text x="60" y="22" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff">Character</text>
        <text x="210" y="22" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fff">Binary Code</text>

        <!-- Rows -->
        <g font-family="monospace" font-size="13" fill="#f8fafc">
          <text x="80" y="62">A</text> <text x="230" y="62" fill="#38bdf8">0001</text>
          <line x1="10" y1="74" x2="310" y2="74" stroke="#1e293b"/>
          <text x="80" y="96">B</text> <text x="230" y="96" fill="#38bdf8">0010</text>
          <line x1="10" y1="108" x2="310" y2="108" stroke="#1e293b"/>
          <text x="80" y="130">C</text> <text x="230" y="130" fill="#38bdf8">0011</text>
          <line x1="10" y1="142" x2="310" y2="142" stroke="#1e293b"/>
          <text x="80" y="164">D</text> <text x="230" y="164" fill="#38bdf8">0100</text>
          <line x1="10" y1="176" x2="310" y2="176" stroke="#1e293b"/>
          <text x="80" y="198">E</text> <text x="230" y="198" fill="#38bdf8">0101</text>
          <line x1="10" y1="210" x2="310" y2="210" stroke="#1e293b"/>
          <text x="80" y="232">F</text> <text x="230" y="232" fill="#38bdf8">0110</text>
        </g>
      </g>

      <!-- Encoded Message Area (Right) -->
      <g transform="translate(360, 0)">
        <rect width="420" height="245" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
        <text x="24" y="34" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#38bdf8">Encoded Bitstream:</text>

        <!-- Big code display -->
        <rect x="20" y="65" width="380" height="70" rx="6" fill="#070c18" stroke="#38bdf8"/>
        <text x="210" y="108" font-family="Consolas, monospace" font-size="18" font-weight="bold" fill="#4ade80" text-anchor="middle" letter-spacing="2">
          0100 0011 0001 0101 0010 0110
        </text>

        <text x="24" y="180" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">6 blocks of 4-bit binary representation</text>
      </g>
    </g>
  </svg>
  `;
  await makePng(q9Svg, 'question_09.png');

  // Q10: Stack Operations - Visual & Operations ONLY. NO question footer inside image
  const q10Svg = `
  <svg width="860" height="370" viewBox="0 0 860 370" xmlns="http://www.w3.org/2000/svg">
    <rect width="860" height="370" fill="#080e1a" rx="16"/>
    <rect x="20" y="20" width="820" height="330" fill="#0b1329" rx="12" stroke="#1e293b" stroke-width="2"/>

    <!-- Header -->
    <g transform="translate(40, 40)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#f8fafc">Stack State &amp; Sequence of Operations</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">Initial stack elements (top to bottom) and 7 sequential operations</text>
    </g>

    <!-- Stack and Operations Container -->
    <g transform="translate(40, 95)">
      <rect width="780" height="235" rx="10" fill="#060a14" stroke="#334155" stroke-width="1.5"/>

      <!-- Stack Visual (Left) -->
      <g transform="translate(40, 20)">
        <text x="0" y="24" font-family="sans-serif" font-size="14" font-weight="bold" fill="#38bdf8">TOP →</text>
        <g transform="translate(65, 0)">
          <rect x="0" y="0" width="65" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="32" y="22" font-family="monospace" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">7</text>

          <rect x="0" y="36" width="65" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="32" y="58" font-family="monospace" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">6</text>

          <rect x="0" y="72" width="65" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="32" y="94" font-family="monospace" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">5</text>

          <rect x="0" y="108" width="65" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="32" y="130" font-family="monospace" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">4</text>

          <rect x="0" y="144" width="65" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="32" y="166" font-family="monospace" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">3</text>
        </g>
      </g>

      <!-- Operations List (Right) -->
      <g transform="translate(230, 20)">
        <text x="0" y="12" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Sequential Operations (1 to 7):</text>
        <g transform="translate(10, 25)" font-family="monospace" font-size="13" fill="#f8fafc">
          <circle cx="10" cy="10" r="9" fill="#0284c7"/><text x="10" y="14" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">1</text>
          <text x="28" y="15" fill="#f43f5e">POP()</text>

          <circle cx="10" cy="32" r="9" fill="#0284c7"/><text x="10" y="36" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">2</text>
          <text x="28" y="37" fill="#f43f5e">POP()</text>

          <circle cx="10" cy="54" r="9" fill="#0284c7"/><text x="10" y="58" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">3</text>
          <text x="28" y="59" fill="#10b981">PUSH(10)</text>

          <circle cx="10" cy="76" r="9" fill="#0284c7"/><text x="10" y="80" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">4</text>
          <text x="28" y="81" fill="#f43f5e">POP()</text>

          <circle cx="10" cy="98" r="9" fill="#0284c7"/><text x="10" y="102" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">5</text>
          <text x="28" y="103" fill="#10b981">PUSH(20)</text>

          <circle cx="10" cy="120" r="9" fill="#0284c7"/><text x="10" y="124" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">6</text>
          <text x="28" y="125" fill="#10b981">PUSH(30)</text>

          <circle cx="10" cy="142" r="9" fill="#0284c7"/><text x="10" y="146" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">7</text>
          <text x="28" y="147" fill="#f43f5e">POP()</text>
        </g>
      </g>
    </g>
  </svg>
  `;
  await makePng(q10Svg, 'question_10.png');
  console.log('Successfully regenerated all 10 question images without embedded question text.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
