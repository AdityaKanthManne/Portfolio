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

const intelligenceCanvas = document.querySelector('#intelligence-canvas');

if (intelligenceCanvas) {
  const world = document.querySelector('.intelligence-world');
  const context = intelligenceCanvas.getContext('2d');
  const panel = document.querySelector('#intelligence-panel');
  const panelNumber = document.querySelector('#panel-number');
  const panelCategory = document.querySelector('#panel-category');
  const panelTitle = document.querySelector('#panel-title');
  const panelBody = document.querySelector('#panel-body');
  const panelActions = document.querySelector('#panel-actions');
  const panelIndex = document.querySelector('#panel-index-value');
  const networkStatus = document.querySelector('#network-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const profileNodes = {
    about: {
      number: '01',
      category: 'ABOUT ME',
      title: 'Intelligence meets uncertainty.',
      body: `
        <p>I’m an AI Research Engineer in Finance with experience across data engineering, data science, and business analytics.</p>
        <p>My interests sit where <strong>artificial intelligence, quantitative finance, and game theory</strong> meet: systems that predict, compete, and adapt.</p>
        <div class="panel-tags"><span>Prediction markets</span><span>Market microstructure</span><span>Decision systems</span></div>`,
      actions: '<a href="#about">Full profile ↓</a><a href="assets/AdityaResume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a>'
    },
    experience: {
      number: '02',
      category: 'EXPERIENCE',
      title: 'Engineering data into decisions.',
      body: `
        <ul class="panel-list">
          <li><strong>Data Coordinator</strong><span>Early Learning Coalition of Flagler &amp; Volusia · Jul 2024—Present · Python ETL, SQL Server, vendor APIs, and Tableau</span></li>
          <li><strong>BI Analyst</strong><span>Smart Grow Infotech · Feb 2024—Jul 2024 · Churn modeling, forecasting, FastAPI, Airflow, and MLflow</span></li>
          <li><strong>Data Analyst</strong><span>Vesper Distributions · Oct 2018—Nov 2021 · Machine learning for retention and automated Python/SQL validation</span></li>
        </ul>`,
      actions: '<a href="#experience">View timeline ↓</a><a href="https://www.linkedin.com/in/adityakanthmanne/" target="_blank" rel="noreferrer">LinkedIn ↗</a>'
    },
    projects: {
      number: '03',
      category: 'ACTIVE RESEARCH',
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
    education: {
      number: '04',
      category: 'EDUCATION',
      title: 'A multidisciplinary foundation.',
      body: `
        <ul class="panel-list">
          <li><strong>Ph.D. in Artificial Intelligence</strong><span>University of the Cumberlands · 2026—2029</span></li>
          <li><strong>M.S. Engineering Management</strong><span>Data Science · USF · 3.83 GPA</span></li>
          <li><strong>B.E. Mechanical Engineering</strong><span>Industrial Engineering · JNTU Hyderabad</span></li>
        </ul>`,
      actions: '<a href="#education">View education ↓</a><a href="#certifications">Certifications ↓</a>'
    },
    skills: {
      number: '05',
      category: 'CAPABILITY MATRIX',
      title: 'Models, markets, and infrastructure.',
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
      category: 'CONNECT',
      title: 'Let’s build intelligent markets.',
      body: `
        <p>I’m open to AI research engineering, prediction-market research, quantitative research, and ML/AI market-making roles.</p>
        <div class="panel-tags"><span>Research teams</span><span>Quant roles</span><span>AI systems</span></div>`,
      actions: '<a href="mailto:adityamanneqr@gmail.com">Email me ↗</a><a href="https://www.linkedin.com/in/adityakanthmanne/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://github.com/adityakanthmanne" target="_blank" rel="noreferrer">GitHub ↗</a>'
    }
  };

  let canvasWidth = 0;
  let canvasHeight = 0;
  let dataPoints = [];
  let pointerX = .5;
  let pointerY = .5;
  let activeNode = 'about';

  function resizeCanvas() {
    const bounds = world.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = Math.round(bounds.width);
    canvasHeight = Math.round(bounds.height);
    intelligenceCanvas.width = Math.round(canvasWidth * ratio);
    intelligenceCanvas.height = Math.round(canvasHeight * ratio);
    intelligenceCanvas.style.width = `${canvasWidth}px`;
    intelligenceCanvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    dataPoints = Array.from({ length: Math.max(26, Math.round(canvasWidth / 38)) }, (_, index) => ({
      x: ((index * 83.71) % 97) / 97,
      y: ((index * 47.23 + 11) % 89) / 89,
      radius: .7 + index % 3 * .35,
      phase: index * .73
    }));
  }

  function drawBackground(time) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const positions = dataPoints.map(point => ({
      ...point,
      screenX: point.x * canvasWidth + Math.sin(time * .00022 + point.phase) * 8,
      screenY: point.y * canvasHeight + Math.cos(time * .00018 + point.phase) * 6
    }));

    for (let first = 0; first < positions.length; first += 1) {
      for (let second = first + 1; second < positions.length; second += 1) {
        const dx = positions[first].screenX - positions[second].screenX;
        const dy = positions[first].screenY - positions[second].screenY;
        const distance = Math.hypot(dx, dy);
        if (distance < 155) {
          context.strokeStyle = `rgba(116, 128, 201, ${.055 * (1 - distance / 155)})`;
          context.lineWidth = .7;
          context.beginPath();
          context.moveTo(positions[first].screenX, positions[first].screenY);
          context.lineTo(positions[second].screenX, positions[second].screenY);
          context.stroke();
        }
      }
    }

    positions.forEach(point => {
      context.fillStyle = 'rgba(151, 157, 233, .18)';
      context.beginPath();
      context.arc(point.screenX, point.screenY, point.radius, 0, Math.PI * 2);
      context.fill();
    });

    const focusX = pointerX * canvasWidth;
    const focusY = pointerY * canvasHeight;
    const glow = context.createRadialGradient(focusX, focusY, 0, focusX, focusY, 220);
    glow.addColorStop(0, 'rgba(107, 99, 255, .07)');
    glow.addColorStop(1, 'rgba(107, 99, 255, 0)');
    context.fillStyle = glow;
    context.fillRect(focusX - 220, focusY - 220, 440, 440);
  }

  function animate(time) {
    drawBackground(reducedMotion ? 0 : time);
    if (!reducedMotion) window.requestAnimationFrame(animate);
  }

  function openProfileNode(key, announce = true) {
    const node = profileNodes[key];
    if (!node) return;
    activeNode = key;
    panelNumber.textContent = node.number;
    panelCategory.textContent = node.category;
    panelTitle.textContent = node.title;
    panelBody.innerHTML = node.body;
    panelActions.innerHTML = node.actions;
    panelIndex.textContent = `${node.number} / 06`;

    document.querySelectorAll('.network-nodes [data-node]').forEach(button => {
      button.classList.toggle('is-active', button.dataset.node === key);
      button.setAttribute('aria-pressed', String(button.dataset.node === key));
    });
    document.querySelectorAll('.network-links [data-link]').forEach(path => {
      path.classList.toggle('is-active', path.dataset.link === key);
    });

    panel.classList.remove('is-changing');
    void panel.offsetWidth;
    panel.classList.add('is-changing');
    if (announce) networkStatus.textContent = `${node.category} node active`;
  }

  document.querySelector('.network-nodes').addEventListener('click', event => {
    const button = event.target.closest('[data-node]');
    if (button) openProfileNode(button.dataset.node);
  });

  document.querySelectorAll('.network-nodes [data-node]').forEach(button => {
    button.addEventListener('mouseenter', () => {
      if (button.dataset.node !== activeNode) networkStatus.textContent = `Preview ${profileNodes[button.dataset.node].category}`;
    });
    button.addEventListener('mouseleave', () => {
      networkStatus.textContent = `${profileNodes[activeNode].category} node active`;
    });
  });

  world.addEventListener('pointermove', event => {
    const bounds = world.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width;
    pointerY = (event.clientY - bounds.top) / bounds.height;
  }, { passive: true });

  const canvasObserver = new ResizeObserver(resizeCanvas);
  canvasObserver.observe(world);
  resizeCanvas();
  openProfileNode('about', false);
  drawBackground(0);
  if (!reducedMotion) window.requestAnimationFrame(animate);
}
