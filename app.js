/**
 * SIGASOLAR - ELETRICIDADE SUSTENTÁVEL
 * JavaScript Interativo de Alta Performance
 * Canvas de Fótons Solares, Simulador Financeiro, Filtros e Micro-interações
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initSolarCalculator();
  initProjectsFilter();
  initFaqAccordion();
  initHero3dTilt();
  initNavigation();
});

/* ==========================================================================
   1. HERO CANVAS: FEIXES E FÓTONS SOLARES INTERATIVOS
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    createParticles();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Photon {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.8 + 1.2;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      // Solar Amber / Golden Photon or High-energy Cyan Photon
      this.isCyan = Math.random() > 0.65;
      this.color = this.isCyan 
        ? { r: 0, g: 180, b: 216 } 
        : { r: 255, g: Math.floor(Math.random() * 60 + 170), b: 3 };
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.005;

      // Mouse repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 3;
          this.y += (dy / dist) * force * 3;
        }
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.max(0.1, this.alpha)})`;
      ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
      ctx.shadowBlur = this.size * 4;
      ctx.fill();
      ctx.restore();
    }
  }

  function createParticles() {
    const count = Math.min(Math.floor((width * height) / 16000), 75);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Photon());
    }
  }

  function drawSunRayGlow() {
    const rayGrad = ctx.createRadialGradient(
      width * 0.75, height * 0.2, 10,
      width * 0.75, height * 0.2, width * 0.6
    );
    rayGrad.addColorStop(0, 'rgba(255, 183, 3, 0.15)');
    rayGrad.addColorStop(0.5, 'rgba(0, 180, 216, 0.05)');
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, 0, width, height);
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawSunRayGlow();

    // Connect close photons with faint energy laser lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 183, 3, ${0.12 * (1 - dist / 95)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  resize();
  animate();
}

/* ==========================================================================
   2. SIMULADOR INTERATIVO DE ECONOMIA SOLAR
   ========================================================================== */
function initSolarCalculator() {
  const slider = document.getElementById('billRange');
  const sliderValDisplay = document.getElementById('sliderValDisplay');
  const monthlySavingDisplay = document.getElementById('monthlySavingDisplay');
  const yearSavingDisplay = document.getElementById('yearSavingDisplay');
  const lifetimeSavingDisplay = document.getElementById('lifetimeSavingDisplay');
  const modulesCountDisplay = document.getElementById('modulesCountDisplay');
  const systemPowerDisplay = document.getElementById('systemPowerDisplay');
  const propertyTypeSelect = document.getElementById('propertyType');
  const citySelect = document.getElementById('citySelect');
  const btnWhatsapp = document.getElementById('btnSimulateWhatsapp');
  const presetButtons = document.querySelectorAll('.preset-btn');

  if (!slider) return;

  function formatBRL(val) {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function calculate(billValue) {
    // Tarifa média estimada Enel RJ + impostos: ~R$ 1.05/kWh
    // Taxa mínima residual obrigatória: R$ 50 a R$ 90 dependendo do tipo
    const minFee = billValue > 2000 ? 90 : 50;
    const monthlySaving = Math.max(0, Math.round(billValue * 0.92 - (minFee * 0.3)));
    const yearlySaving = monthlySaving * 12;
    // Em 25 anos com aumento médio tarifário anual de ~5%
    const lifetimeSaving = Math.round(yearlySaving * 25 * 1.15);

    // Módulos 600Wp de alta eficiência: geram ~75 kWh/mês cada na Região dos Lagos
    const monthlyKwhEstimated = billValue / 1.05;
    const estimatedModules = Math.max(4, Math.round(monthlyKwhEstimated / 72));
    const powerKwp = (estimatedModules * 0.6).toFixed(1);

    // Atualiza elementos na tela com efeito visual suave
    sliderValDisplay.textContent = `R$ ${formatBRL(billValue)},00`;
    monthlySavingDisplay.textContent = formatBRL(monthlySaving);
    yearSavingDisplay.textContent = `R$ ${formatBRL(yearlySaving)}`;
    lifetimeSavingDisplay.textContent = `R$ ${formatBRL(lifetimeSaving)}`;
    modulesCountDisplay.textContent = `${estimatedModules} Módulos (600Wp)`;
    systemPowerDisplay.textContent = `Hoymiles (${powerKwp} kWp)`;

    // Atualiza o gradiente da barra do slider
    const percentage = ((billValue - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(90deg, #FFB703 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;

    // Atualiza o link do WhatsApp com mensagem pronta personalizada
    const propType = propertyTypeSelect ? propertyTypeSelect.options[propertyTypeSelect.selectedIndex].text : 'Residencial';
    const city = citySelect ? citySelect.value : 'Rio das Ostras';

    const message = `Olá, Eduardo e equipe Sigasolar! Fiz uma simulação no site e gostaria de uma proposta formal gratuita:
• Imóvel: ${propType}
• Cidade: ${city}
• Fatura Média: R$ ${formatBRL(billValue)}/mês
• Economia Estimada: R$ ${formatBRL(monthlySaving)}/mês (${powerKwp} kWp estimados)
Poderiam analisar minha viabilidade técnica?`;

    btnWhatsapp.href = `https://wa.me/5522992218981?text=${encodeURIComponent(message)}`;
  }

  // Eventos do Slider
  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    presetButtons.forEach(btn => {
      if (parseInt(btn.getAttribute('data-val'), 10) === val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    calculate(val);
  });

  // Presets clicáveis
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseInt(btn.getAttribute('data-val'), 10);
      slider.value = val;
      calculate(val);
    });
  });

  if (propertyTypeSelect) {
    propertyTypeSelect.addEventListener('change', () => calculate(parseInt(slider.value, 10)));
  }

  if (citySelect) {
    citySelect.addEventListener('change', () => calculate(parseInt(slider.value, 10)));
  }

  // Inicialização inicial com o valor padrão
  calculate(parseInt(slider.value, 10));
}

/* ==========================================================================
   3. FILTRO INTERATIVO DE PROJETOS
   ========================================================================== */
function initProjectsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.classList.remove('hidden');
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px)';
          setTimeout(() => {
            item.style.transition = 'all 0.35s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 40);
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   4. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('active');

      // Fecha outros itens
      triggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.classList.remove('active');
          otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherTrigger.nextElementSibling) {
            otherTrigger.nextElementSibling.style.maxHeight = null;
            otherTrigger.nextElementSibling.classList.remove('open');
          }
        }
      });

      // Abre/fecha o clicado
      if (!isOpen) {
        trigger.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        trigger.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        content.classList.remove('open');
        content.style.maxHeight = null;
      }
    });
  });
}

/* ==========================================================================
   5. INTERACTIVE 3D TILT EFFECT NO HERO CARD
   ========================================================================== */
function initHero3dTilt() {
  const card = document.getElementById('heroCard3d');
  if (!card || window.innerWidth < 1024) return;

  const wrapper = card.parentElement;

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* ==========================================================================
   6. NAVEGAÇÃO & MENU MOBILE
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header com blur no scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Toggle do menu mobile
  if (mobileToggle && navMenu) {
    const closeMenu = () => {
      navMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
      const icon = mobileToggle.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
      mobileToggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      navMenu.classList.add('open');
      document.body.classList.add('menu-open');
      const icon = mobileToggle.querySelector('i');
      if (icon) icon.className = 'fas fa-times';
      mobileToggle.setAttribute('aria-expanded', 'true');
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fecha menu mobile ao clicar em um link
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Fecha ao clicar fora do menu
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Fecha ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Fecha se redimensionar para desktop (> 1024px)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // Destaque do link ativo no scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  });
}
