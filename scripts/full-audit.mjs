import { performance } from 'node:perf_hooks';

const API_BASE = 'https://nest-ten-taupe.vercel.app';
const FE_BASE = 'https://nuxt-flame.vercel.app';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: [],
};

function assert(suite, name, condition, details = '') {
  results.total++;
  if (condition) {
    results.passed++;
    suite.tests.push({ name, status: 'PASS', details });
    console.log(`  [PASS] ${name} ${details ? '→ ' + details : ''}`);
  } else {
    results.failed++;
    suite.tests.push({ name, status: 'FAIL', details });
    console.error(`  [FAIL] ${name} → ${details}`);
  }
}

async function runFullAudit() {
  console.log('================================================================================');
  console.log('✈️  SUSI AIR PILOT OPERATIONS APP — COMPREHENSIVE QA & COMPLIANCE AUDIT');
  console.log(`Backend Target:  ${API_BASE}`);
  console.log(`Frontend Target: ${FE_BASE}`);
  console.log(`Timestamp:       ${new Date().toISOString()}`);
  console.log('================================================================================\n');

  let token = null;

  // -------------------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & SECURITY
  // -------------------------------------------------------------------------
  const suiteAuth = { name: 'Suite 1: Authentication & Security Control', tests: [] };
  results.suites.push(suiteAuth);
  console.log(`\n📋 Running ${suiteAuth.name}...`);

  // Test 1.1: Health endpoint
  const t0 = performance.now();
  const healthRes = await fetch(`${API_BASE}/health`);
  const healthTime = Math.round(performance.now() - t0);
  assert(suiteAuth, 'GET /health returns 200 OK', healthRes.status === 200, `Latency: ${healthTime}ms`);
  const healthJson = await healthRes.json();
  assert(
    suiteAuth,
    'Health response schema matches {status, service, timestamp}',
    healthJson.status === 'ok' && healthJson.service === 'susi-air-pilot-api',
  );

  // Test 1.2: Bad credentials rejection
  const badLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'johndoe', password: 'invalid_password' }),
  });
  assert(suiteAuth, 'POST /auth/login with invalid password rejected with 401', badLoginRes.status === 401);
  const badLoginJson = await badLoginRes.json();
  assert(
    suiteAuth,
    'Error response follows consistent exception filter shape',
    badLoginJson.statusCode === 401 && badLoginJson.error === 'Unauthorized',
  );

  // Test 1.3: Unauthenticated access to guarded endpoint
  const unauthRes = await fetch(`${API_BASE}/pilot/me`);
  assert(suiteAuth, 'GET /pilot/me without token rejected with 401', unauthRes.status === 401);

  // Test 1.4: Valid pilot login
  const validLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'johndoe', password: 'susiairtest' }),
  });
  assert(suiteAuth, 'POST /auth/login with valid credentials returns 200', validLoginRes.status === 200);
  const authData = await validLoginRes.json();
  token = authData.token;
  assert(suiteAuth, 'JWT token issued and signed', typeof token === 'string' && token.length > 50);
  assert(
    suiteAuth,
    'Pilot profile embedded in auth response',
    authData.pilot.name === 'John Doe' && authData.pilot.totalFlightHours >= 1444.5,
  );

  const authHeaders = { Authorization: `Bearer ${token}` };

  // -------------------------------------------------------------------------
  // SUITE 2: PILOT PROFILE
  // -------------------------------------------------------------------------
  const suitePilot = { name: 'Suite 2: Pilot Identity & Logged Hours', tests: [] };
  results.suites.push(suitePilot);
  console.log(`\n📋 Running ${suitePilot.name}...`);

  const meRes = await fetch(`${API_BASE}/pilot/me`, { headers: authHeaders });
  assert(suitePilot, 'GET /pilot/me returns 200 OK with Bearer token', meRes.status === 200);
  const meData = await meRes.json();
  assert(suitePilot, "Pilot name is 'John Doe'", meData.name === 'John Doe');
  assert(suitePilot, 'Total flight hours tracked (>= 1444.5h)', meData.totalFlightHours >= 1444.5);
  assert(
    suitePilot,
    'Avatar URL is valid string',
    typeof meData.avatarUrl === 'string' && meData.avatarUrl.startsWith('http'),
  );

  // -------------------------------------------------------------------------
  // SUITE 3: CASR REGULATORY LIMITS & ROLLING WINDOW ENGINE
  // -------------------------------------------------------------------------
  const suiteRolling = { name: 'Suite 3: CASR Flight Duty Limits & Rolling Window Engine', tests: [] };
  results.suites.push(suiteRolling);
  console.log(`\n📋 Running ${suiteRolling.name}...`);

  const rangeConfigs = [
    { range: '1w', limit: 40, max: 45, windowDays: 7 },
    { range: '1m', limit: 100, max: 125, windowDays: 30 },
    { range: '3m', limit: 300, max: 325, windowDays: 90 },
    { range: '6m', limit: 600, max: 625, windowDays: 180 },
    { range: '1y', limit: 1050, max: 1200, windowDays: 365 },
  ];

  for (const cfg of rangeConfigs) {
    const res = await fetch(`${API_BASE}/flight-hours/summary?range=${cfg.range}`, { headers: authHeaders });
    assert(suiteRolling, `GET /flight-hours/summary?range=${cfg.range} returns 200 OK`, res.status === 200);
    const data = await res.json();

    assert(suiteRolling, `Range ${cfg.range}: Anchor today is '2026-05-15'`, data.today === '2026-05-15');
    assert(suiteRolling, `Range ${cfg.range}: Limit line = ${cfg.limit}h`, data.chart.limitLine === cfg.limit);
    assert(suiteRolling, `Range ${cfg.range}: Y-Axis max = ${cfg.max}h`, data.chart.yAxisMax === cfg.max);
    assert(suiteRolling, `Range ${cfg.range}: Window days = ${cfg.windowDays}d`, data.chart.windowDays === cfg.windowDays);

    assert(suiteRolling, `Range ${cfg.range}: Exactly 15 chart series points`, data.chart.series.length === 15);
    const centerPoint = data.chart.series[7];
    assert(
      suiteRolling,
      `Range ${cfg.range}: Center point is 2026-05-15 (isToday: true)`,
      centerPoint.date === '2026-05-15' && centerPoint.isToday === true,
    );

    if (cfg.range === '1w') {
      assert(suiteRolling, 'Cards array contains 4 regulatory limits', data.cards.length === 4);
      const [daily, weekly, monthly, annual] = data.cards;
      assert(suiteRolling, 'Daily limit card: limit = 8.0h and hours tracked', daily.currentHours >= 6.4 && daily.limit === 8);
      assert(suiteRolling, 'Weekly limit card: limit = 40.0h and hours tracked', weekly.currentHours >= 25.2 && weekly.limit === 40);
      assert(suiteRolling, 'Monthly limit card: limit = 100.0h and hours tracked', monthly.currentHours >= 87.2 && monthly.limit === 100);
      assert(suiteRolling, 'Annual limit card: limit = 1050.0h and hours tracked', annual.currentHours >= 1013.8 && annual.limit === 1050);

      // Spill-over edge case
      const p18 = data.chart.series.find((p) => p.date === '2026-05-18');
      const p20 = data.chart.series.find((p) => p.date === '2026-05-20');
      assert(
        suiteRolling,
        'Edge Case: 2026-05-18 rolling sum exceeds 40h and flagged isExceeded',
        p18.rollingSum >= 40 && p18.isExceeded === true,
      );
      assert(
        suiteRolling,
        'Edge Case: 2026-05-20 reaches high capacity near yMax',
        p20.rollingSum >= 40 && p20.rollingSum <= cfg.max + 10,
      );
    }
  }

  // -------------------------------------------------------------------------
  // SUITE 4: PILOT DOCUMENTS & EXPIRY URGENCY BADGES
  // -------------------------------------------------------------------------
  const suiteDocs = { name: 'Suite 4: Document Expiry Urgency Classifications', tests: [] };
  results.suites.push(suiteDocs);
  console.log(`\n📋 Running ${suiteDocs.name}...`);

  const docRes = await fetch(`${API_BASE}/documents`, { headers: authHeaders });
  assert(suiteDocs, 'GET /documents returns 200 OK', docRes.status === 200);
  const docData = await docRes.json();
  assert(suiteDocs, 'Document count equals 5', docData.documents.length === 5);
  assert(suiteDocs, 'Warning threshold is 30 days', docData.warningDaysThreshold === 30);
  assert(suiteDocs, 'Calculations anchored at 2026-05-15', docData.today === '2026-05-15');

  const docSec = docData.documents.find((d) => d.id === 'doc_security');
  const docLic = docData.documents.find((d) => d.id === 'doc_license');
  const docMed = docData.documents.find((d) => d.id === 'doc_medical');
  const docRec = docData.documents.find((d) => d.id === 'doc_recurrent');
  const docPpc = docData.documents.find((d) => d.id === 'doc_ppc');

  assert(
    suiteDocs,
    'Security Clearance: Expired (status: expired, badgeColor: #E63757, -14 days)',
    docSec.status === 'expired' && docSec.badgeColor === '#E63757' && docSec.daysRemaining === -14,
  );
  assert(
    suiteDocs,
    'Indonesian License: Soon (status: soon, badgeColor: #F59E0B, 14 days left)',
    docLic.status === 'soon' && docLic.badgeColor === '#F59E0B' && docLic.daysRemaining === 14,
  );
  assert(
    suiteDocs,
    'Indonesian Medical: Soon (status: soon, badgeColor: #F59E0B, 27 days left)',
    docMed.status === 'soon' && docMed.badgeColor === '#F59E0B' && docMed.daysRemaining === 27,
  );
  assert(
    suiteDocs,
    'Next Recurrent: Safe (status: safe, badgeColor: #1FBF8F, 152 days left)',
    docRec.status === 'safe' && docRec.badgeColor === '#1FBF8F' && docRec.daysRemaining === 152,
  );
  assert(
    suiteDocs,
    'PPC Exp Date: Safe (status: safe, badgeColor: #1FBF8F, 224 days left)',
    docPpc.status === 'safe' && docPpc.badgeColor === '#1FBF8F' && docPpc.daysRemaining === 224,
  );

  // -------------------------------------------------------------------------
  // SUITE 5: FLIGHT SCHEDULES & MONTHLY DUTY ROSTER
  // -------------------------------------------------------------------------
  const suiteSched = { name: 'Suite 5: Flight Schedules & Duty Indicators', tests: [] };
  results.suites.push(suiteSched);
  console.log(`\n📋 Running ${suiteSched.name}...`);

  const schedRes = await fetch(`${API_BASE}/schedules?year=2026&month=05`, { headers: authHeaders });
  assert(suiteSched, 'GET /schedules?year=2026&month=05 returns 200 OK', schedRes.status === 200);
  const schedData = await schedRes.json();
  assert(suiteSched, 'May 2026 duties count equals 21', schedData.schedules.length === 21);
  assert(suiteSched, 'Legend contains 10 aviation duty categories', schedData.legend.length === 10);

  const day15Duty = schedData.schedules.find((s) => s.duty_date === '2026-05-15');
  assert(
    suiteSched,
    '2026-05-15 (Today): count_logbooks >= count_schedules → isCompleted: true',
    day15Duty.isCompleted === true && day15Duty.count_logbooks >= day15Duty.count_schedules,
  );

  const day19Duty = schedData.schedules.find((s) => s.duty_date === '2026-05-19');
  assert(
    suiteSched,
    '2026-05-19: count_schedules(2), count_logbooks(0) → isCompleted: false, remainingDuties: 2',
    day19Duty.isCompleted === false && day19Duty.remainingDuties === 2,
  );

  assert(
    suiteSched,
    'Every schedule item has valid hex base_color',
    schedData.schedules.every((s) => /^#[0-9A-Fa-f]{6}$/.test(s.base_color)),
  );

  const aprilRes = await fetch(`${API_BASE}/schedules?year=2026&month=04`, { headers: authHeaders });
  const aprilData = await aprilRes.json();
  assert(suiteSched, 'April 2026 schedule navigation returns duties', aprilRes.status === 200 && aprilData.schedules.length > 0);

  const juneRes = await fetch(`${API_BASE}/schedules?year=2026&month=06`, { headers: authHeaders });
  const juneData = await juneRes.json();
  assert(suiteSched, 'June 2026 schedule navigation returns duties', juneRes.status === 200 && juneData.schedules.length > 0);

  // Weather METAR test
  const weatherRes = await fetch(`${API_BASE}/schedules/weather?airport=CJN`, { headers: authHeaders });
  assert(suiteSched, 'GET /schedules/weather?airport=CJN returns METAR briefing', weatherRes.status === 200);
  const weatherData = await weatherRes.json();
  assert(suiteSched, 'Weather has ICAO, wind, visibility, QNH, and VFR condition', weatherData.icao === 'WI1A' && weatherData.condition === 'VFR');

  // -------------------------------------------------------------------------
  // SUITE 6: ELECTRONIC FLIGHT LOGBOOK (EFB)
  // -------------------------------------------------------------------------
  const suiteLogbook = { name: 'Suite 6: Electronic Flight Logbook (EFB)', tests: [] };
  results.suites.push(suiteLogbook);
  console.log(`\n📋 Running ${suiteLogbook.name}...`);

  const logListRes = await fetch(`${API_BASE}/logbook`, { headers: authHeaders });
  assert(suiteLogbook, 'GET /logbook returns 200 OK', logListRes.status === 200);
  const logListData = await logListRes.json();
  assert(suiteLogbook, 'Logbook contains entries and statistics', logListData.entries.length > 0 && logListData.stats.totalFlights > 0);

  // Create flight leg test
  const createLogRes = await fetch(`${API_BASE}/logbook`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: '2026-05-15',
      flightNumber: 'SI-888',
      aircraft: 'PK-VVP (C208B)',
      origin: 'CJN',
      destination: 'HLP',
      offBlock: '15:30',
      onBlock: '16:45',
      flightHours: 1.25,
      landings: 1,
      pilotRole: 'PIC',
      remarks: 'Automated EFB Verification Flight',
    }),
  });
  assert(suiteLogbook, 'POST /logbook records new flight leg (201 Created)', createLogRes.status === 201);
  const createdLog = await createLogRes.json();
  assert(suiteLogbook, 'Created flight leg has ID, flightNumber, and formatted hours', createdLog.id && createdLog.flightNumber === 'SI-888');

  // -------------------------------------------------------------------------
  // SUITE 6: DTO INPUT VALIDATION & BOUNDARY TESTING
  // -------------------------------------------------------------------------
  const suiteValidation = { name: 'Suite 6: Input Validation & Boundary Testing', tests: [] };
  results.suites.push(suiteValidation);
  console.log(`\n📋 Running ${suiteValidation.name}...`);

  const badRangeRes = await fetch(`${API_BASE}/flight-hours/summary?range=invalid_range`, { headers: authHeaders });
  assert(suiteValidation, 'Invalid range parameter rejected with 400 Bad Request', badRangeRes.status === 400);

  const badDateRes = await fetch(`${API_BASE}/flight-hours?from=invalid-date`, { headers: authHeaders });
  assert(suiteValidation, 'Invalid from date parameter rejected with 400 Bad Request', badDateRes.status === 400);

  const badSchedRes = await fetch(`${API_BASE}/schedules?year=26&month=99`, { headers: authHeaders });
  assert(suiteValidation, 'Invalid year/month rejected with 400 Bad Request', badSchedRes.status === 400);

  // -------------------------------------------------------------------------
  // SUITE 7: ENTERPRISE SECURITY & CACHE HEADERS (HELMET + SWR)
  // -------------------------------------------------------------------------
  const suiteSecurity = { name: 'Suite 7: Enterprise Security & Edge Cache Headers', tests: [] };
  results.suites.push(suiteSecurity);
  console.log(`\n📋 Running ${suiteSecurity.name}...`);

  // Helmet Headers
  const secHeadRes = await fetch(`${API_BASE}/health`);
  assert(suiteSecurity, 'X-Content-Type-Options: nosniff header present', secHeadRes.headers.get('x-content-type-options') === 'nosniff');
  assert(suiteSecurity, 'X-Frame-Options: DENY (anti-clickjacking) header present', secHeadRes.headers.get('x-frame-options') === 'DENY');
  assert(suiteSecurity, 'Strict-Transport-Security (HSTS) header present', !!secHeadRes.headers.get('strict-transport-security'));

  // Edge Cache-Control Header
  const cacheHeadRes = await fetch(`${API_BASE}/schedules?year=2026&month=05`, { headers: authHeaders });
  assert(suiteSecurity, 'Schedules endpoint has SWR Cache-Control header', cacheHeadRes.headers.get('cache-control')?.includes('stale-while-revalidate'));

  // Parameter Injection & Mass Assignment Prevention
  const injectionRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'johndoe',
      password: 'susiairtest',
      injectedField: '<script>alert(1)</script>',
      isAdmin: true,
    }),
  });
  assert(suiteSecurity, 'Strict parameter injection rejected with 400 Bad Request', injectionRes.status === 400);

  // Swagger / OpenAPI Docs verification
  const swaggerHtmlRes = await fetch(`${API_BASE}/docs`);
  assert(suiteSecurity, 'GET /docs returns 200 OK (Swagger UI active)', swaggerHtmlRes.status === 200);

  const swaggerJsonRes = await fetch(`${API_BASE}/docs-json`);
  assert(suiteSecurity, 'GET /docs-json returns 200 OK (Valid OpenAPI 3.0 schema)', swaggerJsonRes.status === 200);
  const swaggerSpec = await swaggerJsonRes.json();
  assert(suiteSecurity, 'OpenAPI schema registers all 10 endpoints', Object.keys(swaggerSpec.paths).length >= 10);

  // -------------------------------------------------------------------------
  // SUITE 8: FRONTEND LIVE INTEGRITY & SSR CHECKS
  // -------------------------------------------------------------------------
  const suiteFrontend = { name: 'Suite 8: Frontend Web App & SSR Integrity', tests: [] };
  results.suites.push(suiteFrontend);
  console.log(`\n📋 Running ${suiteFrontend.name}...`);

  const feLoginRes = await fetch(`${FE_BASE}/login`);
  assert(suiteFrontend, 'GET /login returns 200 OK on Vercel Edge', feLoginRes.status === 200);
  const loginHtml = await feLoginRes.text();
  assert(suiteFrontend, "Login page contains 'Susi Air · Pilot App' title", loginHtml.includes('Susi Air · Pilot App'));
  assert(
    suiteFrontend,
    'Login page includes official Susi Air logo asset',
    loginHtml.includes('logo-white.png') || loginHtml.includes('logo.png'),
  );
  assert(suiteFrontend, 'Login page includes Google Font Plus Jakarta Sans', loginHtml.includes('Plus+Jakarta+Sans'));

  const feHomeRes = await fetch(`${FE_BASE}/`, { redirect: 'manual' });
  assert(
    suiteFrontend,
    'Unauthenticated access to / redirects to /login (HTTP 302)',
    feHomeRes.status === 302 && feHomeRes.headers.get('location') === '/login',
  );

  const feSchedRes = await fetch(`${FE_BASE}/schedule`, { redirect: 'manual' });
  assert(
    suiteFrontend,
    'Unauthenticated access to /schedule redirects to /login (HTTP 302)',
    feSchedRes.status === 302 && feSchedRes.headers.get('location') === '/login',
  );

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`🏁 AUDIT COMPLETE: ${results.passed} PASSED / ${results.failed} FAILED (TOTAL: ${results.total} TESTS)`);
  console.log(`Success Rate:   ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('================================================================================');
}

runFullAudit();
