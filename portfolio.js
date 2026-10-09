const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });
}

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('open', !isOpen);
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
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('visible'));
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const chart = document.querySelector('#monte-carlo-chart');

if (chart) {
  const context = chart.getContext('2d');
  const runButton = document.querySelector('#run-simulation');
  const regimeButtons = document.querySelectorAll('[data-regime]');
  const returnMetric = document.querySelector('#sim-return');
  const varMetric = document.querySelector('#sim-var');
  const positiveMetric = document.querySelector('#sim-positive');
  const yAxisLabels = document.querySelectorAll('.chart-axis-y span');

  const regimes = {
    base: { drift: 0.08, volatility: 0.18 },
    volatile: { drift: 0.07, volatility: 0.34 },
    stress: { drift: -0.12, volatility: 0.31 }
  };

  const simulation = {
    regime: 'base',
    paths: [],
    lower: [],
    median: [],
    upper: [],
    width: 0,
    height: 0,
    yMin: 50,
    yMax: 170,
    progress: 1,
    frame: null
  };

  function normalRandom() {
    let first = 0;
    let second = 0;
    while (first === 0) first = Math.random();
    while (second === 0) second = Math.random();
    return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
  }

  function quantile(sorted, percentile) {
    const position = (sorted.length - 1) * percentile;
    const base = Math.floor(position);
    const remainder = position - base;
    return sorted[base + 1] === undefined
      ? sorted[base]
      : sorted[base] + remainder * (sorted[base + 1] - sorted[base]);
  }

  function buildSimulation() {
    const { drift, volatility } = regimes[simulation.regime];
    const tradingDays = 252;
    const pathCount = 160;
    const dt = 1 / tradingDays;

    simulation.paths = Array.from({ length: pathCount }, () => {
      const path = [100];
      for (let day = 1; day <= tradingDays; day += 1) {
        const shock = normalRandom();
        const previous = path[day - 1];
        const next = previous * Math.exp((drift - .5 * volatility ** 2) * dt + volatility * Math.sqrt(dt) * shock);
        path.push(next);
      }
      return path;
    });

    simulation.lower = [];
    simulation.median = [];
    simulation.upper = [];

    for (let day = 0; day <= tradingDays; day += 1) {
      const values = simulation.paths.map(path => path[day]).sort((a, b) => a - b);
      simulation.lower.push(quantile(values, .05));
      simulation.median.push(quantile(values, .5));
      simulation.upper.push(quantile(values, .95));
    }

    const envelope = [...simulation.lower, ...simulation.upper];
    const rawMin = Math.min(...envelope);
    const rawMax = Math.max(...envelope);
    simulation.yMin = Math.max(10, Math.floor((rawMin - 8) / 10) * 10);
    simulation.yMax = Math.ceil((rawMax + 8) / 10) * 10;

    const endingReturns = simulation.paths
      .map(path => path[path.length - 1] / 100 - 1)
      .sort((a, b) => a - b);
    const meanReturn = endingReturns.reduce((sum, value) => sum + value, 0) / endingReturns.length;
    const fifthPercentile = quantile(endingReturns, .05);
    const positiveProbability = endingReturns.filter(value => value > 0).length / endingReturns.length;

    returnMetric.textContent = `${meanReturn >= 0 ? '+' : ''}${(meanReturn * 100).toFixed(1)}%`;
    varMetric.textContent = `${Math.max(0, -fifthPercentile * 100).toFixed(1)}%`;
    positiveMetric.textContent = `${Math.round(positiveProbability * 100)}%`;

    const range = simulation.yMax - simulation.yMin;
    yAxisLabels.forEach((label, index) => {
      label.textContent = Math.round(simulation.yMax - range * (index / Math.max(1, yAxisLabels.length - 1)));
    });
  }

  function resizeChart() {
    const bounds = chart.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    simulation.width = Math.max(320, Math.round(bounds.width));
    simulation.height = Math.max(220, Math.round(bounds.height));
    chart.width = Math.round(simulation.width * ratio);
    chart.height = Math.round(simulation.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawSimulation(simulation.progress);
  }

  function xPosition(index) {
    const left = 29;
    const right = 7;
    return left + index / 252 * (simulation.width - left - right);
  }

  function yPosition(value) {
    const top = 13;
    const bottom = 23;
    return top + (simulation.yMax - value) / (simulation.yMax - simulation.yMin) * (simulation.height - top - bottom);
  }

  function drawSeries(series, limit, stroke, width, alpha = 1) {
    context.beginPath();
    for (let index = 0; index <= limit; index += 1) {
      const x = xPosition(index);
      const y = yPosition(series[index]);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.globalAlpha = alpha;
    context.strokeStyle = stroke;
    context.lineWidth = width;
    context.stroke();
    context.globalAlpha = 1;
  }

  function drawSimulation(progress = 1) {
    if (!simulation.paths.length || !simulation.width || !simulation.height) return;

    const limit = Math.max(1, Math.min(252, Math.floor(252 * progress)));
    context.clearRect(0, 0, simulation.width, simulation.height);

    context.strokeStyle = 'rgba(225, 255, 235, .07)';
    context.lineWidth = 1;
    for (let row = 0; row < 5; row += 1) {
      const y = 13 + row / 4 * (simulation.height - 36);
      context.beginPath();
      context.moveTo(29, y);
      context.lineTo(simulation.width - 7, y);
      context.stroke();
    }
    for (let column = 0; column < 5; column += 1) {
      const x = 29 + column / 4 * (simulation.width - 36);
      context.beginPath();
      context.moveTo(x, 13);
      context.lineTo(x, simulation.height - 23);
      context.stroke();
    }

    context.beginPath();
    for (let index = 0; index <= limit; index += 1) {
      const x = xPosition(index);
      const y = yPosition(simulation.upper[index]);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    for (let index = limit; index >= 0; index -= 1) {
      context.lineTo(xPosition(index), yPosition(simulation.lower[index]));
    }
    context.closePath();
    const band = context.createLinearGradient(0, 13, 0, simulation.height);
    band.addColorStop(0, 'rgba(98, 217, 255, .13)');
    band.addColorStop(1, 'rgba(185, 255, 102, .025)');
    context.fillStyle = band;
    context.fill();

    simulation.paths.filter((_, index) => index % 7 === 0).forEach((path, index) => {
      const color = index % 3 === 0 ? '#62d9ff' : '#b9ff66';
      drawSeries(path, limit, color, .65, .13);
    });

    drawSeries(simulation.lower, limit, '#62d9ff', 1, .38);
    drawSeries(simulation.upper, limit, '#62d9ff', 1, .38);
    drawSeries(simulation.median, limit, '#b9ff66', 2, .92);

    const finalX = xPosition(limit);
    const finalY = yPosition(simulation.median[limit]);
    context.fillStyle = '#b9ff66';
    context.beginPath();
    context.arc(finalX, finalY, 3.2, 0, Math.PI * 2);
    context.fill();
  }

  function animateSimulation() {
    if (simulation.frame) cancelAnimationFrame(simulation.frame);
    if (reducedMotion) {
      simulation.progress = 1;
      drawSimulation(1);
      return;
    }

    const start = performance.now();
    const duration = 1200;
    const animate = now => {
      const elapsed = Math.min(1, (now - start) / duration);
      simulation.progress = 1 - (1 - elapsed) ** 3;
      drawSimulation(simulation.progress);
      if (elapsed < 1) simulation.frame = requestAnimationFrame(animate);
    };
    simulation.frame = requestAnimationFrame(animate);
  }

  function runSimulation() {
    buildSimulation();
    animateSimulation();
  }

  regimeButtons.forEach(button => {
    button.addEventListener('click', () => {
      simulation.regime = button.dataset.regime;
      regimeButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      runSimulation();
    });
  });

  runButton.addEventListener('click', runSimulation);
  buildSimulation();
  resizeChart();
  animateSimulation();

  if ('ResizeObserver' in window) {
    const chartObserver = new ResizeObserver(resizeChart);
    chartObserver.observe(chart);
  } else {
    window.addEventListener('resize', resizeChart, { passive: true });
  }
}

const resourceFilters = document.querySelectorAll('[data-filter]');
const resourceCards = document.querySelectorAll('[data-category]');

if (resourceFilters.length && resourceCards.length) {
  resourceFilters.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      resourceFilters.forEach(item => item.classList.toggle('is-active', item === button));
      resourceCards.forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });
}
