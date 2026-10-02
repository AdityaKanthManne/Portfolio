const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('open', !open);
});

navLinks.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navLinks.classList.contains('open')) {
    menuButton.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    menuButton.focus();
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();

const strategyCanvas = document.querySelector('#strategy-canvas');

if (strategyCanvas) {
  const context = strategyCanvas.getContext('2d');
  const world = document.querySelector('.strategy-world');
  const panel = document.querySelector('#strategy-panel');
  const panelNumber = document.querySelector('#panel-number');
  const panelCategory = document.querySelector('#panel-category');
  const panelIdentity = document.querySelector('#panel-identity');
  const panelTitle = document.querySelector('#panel-title');
  const panelBody = document.querySelector('#panel-body');
  const panelActions = document.querySelector('#panel-actions');
  const statusText = document.querySelector('#strategy-status-text');
  const progressCount = document.querySelector('#progress-count');
  const progressBar = document.querySelector('#progress-bar');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const boardSize = 9;

  const zones = {
    about: {
      number: '01',
      category: 'ABOUT ME',
      label: 'ABOUT',
      icon: '●',
      color: '#68c7ff',
      x: 1,
      y: 1,
      title: 'Intelligence meets uncertainty.',
      body: `
        <p>I’m an AI Research Engineer in Finance with 3+ years across data science and business analytics.</p>
        <p>My interests sit where <strong>artificial intelligence, quantitative finance, and game theory</strong> meet: systems that predict, compete, and adapt.</p>
        <div class="panel-tags"><span>Prediction markets</span><span>Market microstructure</span><span>Decision systems</span></div>`,
      actions: '<a href="#about">Full profile ↓</a><a href="assets/AdityaResume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a>'
    },
    education: {
      number: '02',
      category: 'EDUCATION · PAWN PROMOTION',
      label: 'EDUCATION',
      icon: '♛',
      color: '#9a86ff',
      x: 7,
      y: 1,
      title: 'Learning expands the possible moves.',
      body: `
        <ul class="panel-list">
          <li><strong>Ph.D. in Artificial Intelligence</strong><span>University of the Cumberlands · 2026—2029</span></li>
          <li><strong>M.S. Engineering Management</strong><span>Data Science · USF · 3.83 GPA</span></li>
          <li><strong>B.E. Mechanical Engineering</strong><span>Industrial Engineering · JNTU Hyderabad</span></li>
        </ul>`,
      actions: '<a href="#education">View education ↓</a><a href="#certifications">Certifications ↓</a>'
    },
    experience: {
      number: '03',
      category: 'EXPERIENCE · ENDGAME',
      label: 'EXPERIENCE',
      icon: '♚',
      color: '#ff82ae',
      x: 7,
      y: 7,
      title: 'Strategy becomes valuable in the real world.',
      body: `
        <ul class="panel-list">
          <li><strong>Data Analyst</strong><span>Early Learning Coalition · 2024—Present</span></li>
          <li><strong>Outdoor Recreation Center Lead</strong><span>University of South Florida · 2022—2023</span></li>
        </ul>`,
      actions: '<a href="#experience">View timeline ↓</a><a href="assets/AdityaResume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a>'
    },
    projects: {
      number: '04',
      category: 'RESEARCH · ACTIVE SYSTEMS',
      label: 'PROJECTS',
      icon: '◇',
      color: '#65e6c4',
      x: 1,
      y: 7,
      title: 'Experiments for intelligent markets.',
      body: `
        <ul class="panel-list">
          <li><strong>FinResearch Agent</strong><span>Agentic financial investigation</span></li>
          <li><strong>Prediction Market Agents</strong><span>Calibrated forecasting and participation</span></li>
          <li><strong>AI Portfolio Manager</strong><span>Adaptive allocation and risk research</span></li>
          <li><strong>Market Simulator</strong><span>Price formation and strategy interaction</span></li>
          <li><strong>Research Copilot</strong><span>Reproducible quantitative experiments</span></li>
        </ul>`,
      actions: '<a href="#work">Explore projects ↓</a><a href="https://github.com/adityakanthmanne" target="_blank" rel="noreferrer">GitHub ↗</a>'
    },
    skills: {
      number: '05',
      category: 'CAPABILITY MATRIX',
      label: 'SKILLS',
      icon: '⌘',
      color: '#ffd36d',
      x: 4,
      y: 0,
      title: 'Models, markets, and the systems between them.',
      body: `
        <ul class="panel-list">
          <li><strong>Research</strong><span>Prediction · Microstructure · Options · Risk</span></li>
          <li><strong>Model</strong><span>Machine learning · NLP · Time series · RL</span></li>
          <li><strong>Build</strong><span>Python · SQL · AWS · Git</span></li>
          <li><strong>Think</strong><span>Game theory · Multi-agent systems · Incentives</span></li>
        </ul>`,
      actions: '<a href="#about">Technical profile ↓</a><a href="#certifications">Credentials ↓</a>'
    },
    contact: {
      number: '06',
      category: 'NEXT MOVE',
      label: 'CONTACT',
      icon: '↗',
      color: '#ff9d6f',
      x: 4,
      y: 8,
      title: 'Let’s build intelligent markets.',
      body: `
        <p>I’m open to AI research engineering, prediction-market research, quantitative research, and ML/AI market-making roles.</p>
        <div class="panel-tags"><span>Research teams</span><span>Quant roles</span><span>AI systems</span></div>`,
      actions: '<a href="mailto:adityamanneqr@gmail.com">Email me ↗</a><a href="https://www.linkedin.com/in/adityakanthmanne/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://github.com/adityakanthmanne" target="_blank" rel="noreferrer">GitHub ↗</a>'
    }
  };

  const zoneEntries = Object.entries(zones);
  const visitedZones = new Set();
  const agent = {
    x: 4,
    y: 4,
    visualX: 4,
    visualY: 4,
    fromX: 4,
    fromY: 4,
    targetX: 4,
    targetY: 4,
    moveStarted: 0,
    moveDuration: 190,
    queue: [],
    moving: false,
    destination: null
  };

  let viewportWidth = 0;
  let viewportHeight = 0;
  let tileWidth = 70;
  let tileHeight = 35;
  let originX = 0;
  let originY = 0;
  let particles = [];
  let lastFrame = 0;

  function resizeCanvas() {
    const rect = world.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    viewportWidth = Math.round(rect.width);
    viewportHeight = Math.round(rect.height);
    strategyCanvas.width = Math.round(viewportWidth * ratio);
    strategyCanvas.height = Math.round(viewportHeight * ratio);
    strategyCanvas.style.width = `${viewportWidth}px`;
    strategyCanvas.style.height = `${viewportHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const mobile = viewportWidth <= 760;
    tileWidth = mobile ? Math.min(42, (viewportWidth - 24) / 9) : Math.min(72, (viewportWidth - 520) / 9);
    tileWidth = Math.max(tileWidth, mobile ? 36 : 52);
    tileHeight = tileWidth * .5;
    originX = mobile ? viewportWidth / 2 : viewportWidth * .48;
    originY = mobile ? 360 : Math.max(340, viewportHeight * .4);

    particles = Array.from({ length: Math.round(viewportWidth / 22) }, (_, index) => ({
      x: (index * 83.71) % viewportWidth,
      y: (index * 47.23) % viewportHeight,
      size: .4 + (index % 3) * .35,
      alpha: .08 + (index % 5) * .025
    }));
  }

  function toScreen(x, y) {
    return {
      x: originX + (x - y) * tileWidth / 2,
      y: originY + (x + y) * tileHeight / 2
    };
  }

  function drawDiamond(x, y, width, height) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + width / 2, y + height / 2);
    context.lineTo(x, y + height);
    context.lineTo(x - width / 2, y + height / 2);
    context.closePath();
  }

  function drawBackdrop(time) {
    context.clearRect(0, 0, viewportWidth, viewportHeight);

    particles.forEach(particle => {
      context.fillStyle = `rgba(160, 145, 255, ${particle.alpha})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    });

    const chartTop = viewportHeight * .61;
    ['rgba(92,132,255,.10)', 'rgba(173,105,255,.09)', 'rgba(255,99,159,.07)'].forEach((color, chartIndex) => {
      context.beginPath();
      for (let x = 0; x <= viewportWidth; x += 14) {
        const wave = Math.sin(x * .012 + chartIndex * 2.1 + time * .00012) * (13 + chartIndex * 7);
        const trend = x * (.018 - chartIndex * .008);
        const y = chartTop + chartIndex * 55 + wave - trend;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
    });
  }

  function drawBoard(time) {
    const boardCenter = toScreen(4, 4);
    const glow = context.createRadialGradient(boardCenter.x, boardCenter.y, 10, boardCenter.x, boardCenter.y, tileWidth * 6);
    glow.addColorStop(0, 'rgba(110,87,255,.14)');
    glow.addColorStop(1, 'rgba(20,15,55,0)');
    context.fillStyle = glow;
    context.fillRect(0, originY - 100, viewportWidth, tileHeight * 14);

    for (let x = 0; x < boardSize; x += 1) {
      for (let y = 0; y < boardSize; y += 1) {
        const point = toScreen(x, y);
        drawDiamond(point.x, point.y, tileWidth - 2, tileHeight - 1);
        context.fillStyle = (x + y) % 2 === 0 ? 'rgba(97,82,165,.16)' : 'rgba(255,255,255,.035)';
        context.fill();
        context.strokeStyle = 'rgba(158,140,255,.12)';
        context.lineWidth = .7;
        context.stroke();
      }
    }

    context.save();
    context.setLineDash([3, 7]);
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(133,115,255,.23)';
    context.beginPath();
    zoneEntries.forEach(([, zone], index) => {
      const point = toScreen(zone.x, zone.y);
      const center = toScreen(4, 4);
      context.moveTo(center.x, center.y + tileHeight / 2);
      context.lineTo(point.x, point.y + tileHeight / 2);
      if (index === zoneEntries.length - 1) context.stroke();
    });
    context.restore();

    zoneEntries.forEach(([key, zone]) => drawZone(key, zone, time));
  }

  function drawZone(key, zone, time) {
    const point = toScreen(zone.x, zone.y);
    const isVisited = visitedZones.has(key);
    const isDestination = agent.destination === key;
    const pulse = reducedMotion ? 0 : Math.sin(time * .003 + zone.x) * 3;

    context.save();
    context.shadowColor = zone.color;
    context.shadowBlur = isVisited ? 20 : 11;
    context.strokeStyle = zone.color;
    context.globalAlpha = isVisited ? .86 : .52;
    context.lineWidth = isDestination ? 2 : 1;
    context.beginPath();
    context.ellipse(point.x, point.y + tileHeight * .54, tileWidth * .25 + pulse * .2, tileHeight * .22 + pulse * .08, 0, 0, Math.PI * 2);
    context.stroke();

    const pillarHeight = tileHeight * 1.2;
    context.globalAlpha = isVisited ? .45 : .2;
    const beam = context.createLinearGradient(0, point.y - pillarHeight, 0, point.y + tileHeight);
    beam.addColorStop(0, 'transparent');
    beam.addColorStop(1, zone.color);
    context.fillStyle = beam;
    context.beginPath();
    context.moveTo(point.x - tileWidth * .17, point.y + tileHeight * .52);
    context.lineTo(point.x - tileWidth * .08, point.y - pillarHeight);
    context.lineTo(point.x + tileWidth * .08, point.y - pillarHeight);
    context.lineTo(point.x + tileWidth * .17, point.y + tileHeight * .52);
    context.closePath();
    context.fill();

    context.globalAlpha = 1;
    context.shadowBlur = 12;
    context.fillStyle = zone.color;
    context.font = `${Math.max(15, tileWidth * .27)}px Inter, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(zone.icon, point.x, point.y - pillarHeight * .72);
    context.shadowBlur = 0;
    context.fillStyle = isVisited ? '#f5f5f7' : '#888894';
    context.font = `600 ${Math.max(7, tileWidth * .115)}px ui-monospace, monospace`;
    context.letterSpacing = '1px';
    context.fillText(zone.label, point.x, point.y - pillarHeight - 12);
    context.restore();
  }

  function drawAgent(time) {
    const point = toScreen(agent.visualX, agent.visualY);
    const centerY = point.y + tileHeight * .35;
    const pulse = reducedMotion ? 0 : Math.sin(time * .006) * 2;

    context.save();
    const aura = context.createRadialGradient(point.x, centerY, 2, point.x, centerY, tileWidth * .58);
    aura.addColorStop(0, 'rgba(105,196,255,.28)');
    aura.addColorStop(1, 'rgba(105,196,255,0)');
    context.fillStyle = aura;
    context.beginPath();
    context.arc(point.x, centerY, tileWidth * .58, 0, Math.PI * 2);
    context.fill();

    context.shadowColor = '#8c7dff';
    context.shadowBlur = 22;
    context.fillStyle = '#0b0b13';
    context.strokeStyle = '#a9a0ff';
    context.lineWidth = 1.5;
    context.beginPath();
    context.ellipse(point.x, centerY, tileWidth * .22 + pulse * .15, tileHeight * .36 + pulse * .08, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.shadowBlur = 8;
    context.fillStyle = '#f2f0ff';
    context.font = `${Math.max(18, tileWidth * .34)}px Georgia, serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('♞', point.x, centerY - 1);

    context.shadowBlur = 0;
    context.fillStyle = '#85ddff';
    context.beginPath();
    context.arc(point.x + tileWidth * .07, centerY - tileHeight * .08, 1.4, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function animate(time) {
    lastFrame = time;
    updateAgent(time);
    drawBackdrop(time);
    drawBoard(time);
    drawAgent(time);
    window.requestAnimationFrame(animate);
  }

  function beginNextMove(time = performance.now()) {
    if (agent.moving || agent.queue.length === 0) return;
    const next = agent.queue.shift();
    agent.fromX = agent.visualX;
    agent.fromY = agent.visualY;
    agent.targetX = next.x;
    agent.targetY = next.y;
    agent.moveStarted = time;
    agent.moveDuration = next.duration || 190;
    agent.moving = true;
  }

  function updateAgent(time) {
    if (!agent.moving) {
      beginNextMove(time);
      return;
    }

    const rawProgress = reducedMotion ? 1 : Math.min(1, (time - agent.moveStarted) / agent.moveDuration);
    const progress = 1 - Math.pow(1 - rawProgress, 3);
    agent.visualX = agent.fromX + (agent.targetX - agent.fromX) * progress;
    agent.visualY = agent.fromY + (agent.targetY - agent.fromY) * progress;

    if (rawProgress >= 1) {
      agent.x = agent.targetX;
      agent.y = agent.targetY;
      agent.visualX = agent.x;
      agent.visualY = agent.y;
      agent.moving = false;
      if (agent.queue.length === 0) {
        const destination = agent.destination;
        agent.destination = null;
        if (destination) openZone(destination);
        else checkCurrentZone();
      }
    }
  }

  function queueStep(x, y, duration = 190) {
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return false;
    agent.queue.push({ x, y, duration });
    beginNextMove();
    return true;
  }

  function moveAgent(direction) {
    if (agent.moving || agent.queue.length) return;
    const movements = {
      up: [-1, -1],
      right: [1, -1],
      down: [1, 1],
      left: [-1, 1]
    };
    const [deltaX, deltaY] = movements[direction];
    agent.destination = null;
    if (queueStep(agent.x + deltaX, agent.y + deltaY)) {
      statusText.textContent = `Agent moving ${direction} · Find a glowing profile node`;
    }
  }

  function makePath(start, target) {
    const directions = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const queue = [{ x: start.x, y: start.y, path: [] }];
    const seen = new Set([`${start.x},${start.y}`]);

    while (queue.length) {
      const current = queue.shift();
      if (current.x === target.x && current.y === target.y) return current.path;
      for (const [deltaX, deltaY] of directions) {
        const x = current.x + deltaX;
        const y = current.y + deltaY;
        const id = `${x},${y}`;
        if (x >= 0 && x < boardSize && y >= 0 && y < boardSize && !seen.has(id)) {
          seen.add(id);
          queue.push({ x, y, path: [...current.path, { x, y }] });
        }
      }
    }
    return [{ x: target.x, y: target.y }];
  }

  function navigateToZone(key) {
    const zone = zones[key];
    if (!zone) return;
    agent.queue = [];
    agent.moving = false;
    agent.visualX = agent.x;
    agent.visualY = agent.y;
    agent.destination = key;
    const path = makePath({ x: agent.x, y: agent.y }, zone);
    path.forEach(step => agent.queue.push({ ...step, duration: 145 }));
    statusText.textContent = `Calculating route · ${zone.label}`;
    if (path.length === 0) openZone(key);
    else beginNextMove();
  }

  function openZone(key) {
    const zone = zones[key];
    if (!zone) return;
    visitedZones.add(key);
    panelNumber.textContent = zone.number;
    panelCategory.textContent = zone.category;
    panelTitle.textContent = zone.title;
    panelBody.innerHTML = zone.body;
    panelActions.innerHTML = zone.actions;
    panelIdentity.hidden = key !== 'about';
    panel.classList.add('is-open');
    statusText.textContent = `${zone.label} unlocked · Profile data loaded`;

    document.querySelectorAll('.strategy-map [data-zone]').forEach(button => {
      button.classList.toggle('is-active', button.dataset.zone === key);
      button.classList.toggle('is-visited', visitedZones.has(button.dataset.zone));
    });

    const total = zoneEntries.length;
    progressCount.textContent = `${visitedZones.size} / ${total} discovered`;
    progressBar.style.width = `${visitedZones.size / total * 100}%`;
  }

  function checkCurrentZone() {
    const current = zoneEntries.find(([, zone]) => zone.x === agent.x && zone.y === agent.y);
    if (current) openZone(current[0]);
  }

  document.addEventListener('click', event => {
    const zoneButton = event.target.closest('[data-zone]');
    if (zoneButton) navigateToZone(zoneButton.dataset.zone);

    const moveButton = event.target.closest('[data-move]');
    if (moveButton) moveAgent(moveButton.dataset.move);
  });

  document.querySelector('.panel-close').addEventListener('click', () => {
    panel.classList.remove('is-open');
    document.querySelectorAll('.strategy-map [data-zone]').forEach(button => button.classList.remove('is-active'));
    statusText.textContent = 'Agent online · Select another profile node';
  });

  document.addEventListener('keydown', event => {
    const activeTag = document.activeElement.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;
    const keyMap = {
      ArrowUp: 'up',
      w: 'up',
      W: 'up',
      ArrowRight: 'right',
      d: 'right',
      D: 'right',
      ArrowDown: 'down',
      s: 'down',
      S: 'down',
      ArrowLeft: 'left',
      a: 'left',
      A: 'left'
    };
    const direction = keyMap[event.key];
    const worldIsActive = window.scrollY < world.offsetHeight - 120;
    if (direction && worldIsActive) {
      event.preventDefault();
      moveAgent(direction);
    }
    if (event.key === 'Escape' && panel.classList.contains('is-open')) panel.classList.remove('is-open');
  });

  strategyCanvas.addEventListener('pointerdown', event => {
    const rect = strategyCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let closest = null;
    let closestDistance = Infinity;

    zoneEntries.forEach(([key, zone]) => {
      const point = toScreen(zone.x, zone.y);
      const distance = Math.hypot(mouseX - point.x, mouseY - (point.y - tileHeight * .3));
      if (distance < closestDistance) {
        closest = key;
        closestDistance = distance;
      }
    });

    if (closestDistance < Math.max(38, tileWidth * .75)) {
      navigateToZone(closest);
      return;
    }

    const agentPoint = toScreen(agent.visualX, agent.visualY);
    const horizontal = mouseX - agentPoint.x;
    const vertical = mouseY - agentPoint.y;
    if (Math.abs(horizontal) > Math.abs(vertical)) moveAgent(horizontal > 0 ? 'right' : 'left');
    else moveAgent(vertical > 0 ? 'down' : 'up');
  });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();
  window.requestAnimationFrame(animate);
}
