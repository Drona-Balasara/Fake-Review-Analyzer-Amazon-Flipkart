/**
 * Animation Utilities - UI Refresh Modern Design System
 * Handles entrance animations, stagger effects, and reduced motion support
 */

(function() {
  'use strict';
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  /**
   * Animate element entrance with fade and rise
   * @param {HTMLElement} element - Element to animate
   * @param {number} delay - Delay in ms
   */
  function animateEntrance(element, delay = 0) {
    if (!element) return;
    
    setTimeout(() => {
      if (prefersReducedMotion) {
        element.classList.add('animate-fade-in');
      } else {
        element.classList.add('animate-fade-in-up');
      }
    }, delay);
  }
  
  /**
   * Animate emphasis elements (scale effect)
   * @param {HTMLElement} element - Element to animate
   * @param {number} delay - Delay in ms
   */
  function animateEmphasis(element, delay = 0) {
    if (!element) return;
    
    setTimeout(() => {
      if (prefersReducedMotion) {
        element.classList.add('animate-fade-in');
      } else {
        element.classList.add('animate-scale-in');
      }
    }, delay);
  }
  
  /**
   * Animate list items with stagger
   * @param {NodeList|Array} items - List items to animate
   * @param {number} staggerDelay - Delay between items in ms (default 35ms)
   * @param {number} maxItems - Maximum items to stagger (default 8)
   */
  function animateList(items, staggerDelay = 35, maxItems = 8) {
    if (!items || items.length === 0) return;
    
    const itemsToAnimate = Math.min(items.length, maxItems);
    
    for (let i = 0; i < itemsToAnimate; i++) {
      const item = items[i];
      if (item) {
        item.setAttribute('data-animated', 'true');
        animateEntrance(item, i * staggerDelay);
      }
    }
    
    // Animate remaining items without stagger
    for (let i = maxItems; i < items.length; i++) {
      const item = items[i];
      if (item) {
        item.setAttribute('data-animated', 'true');
        animateEntrance(item, maxItems * staggerDelay);
      }
    }
  }
  
  /**
   * Animate gauge ring fill
   * @param {HTMLElement} gaugeRing - Gauge ring element
   * @param {number} value - Value from 0-100
   */
  function animateGaugeRing(gaugeRing, value) {
    if (!gaugeRing) return;
    
    const fill = gaugeRing.querySelector('.gauge-ring__fill');
    const numberEl = gaugeRing.querySelector('.gauge-ring__number');
    
    if (!fill) return;
    
    // Set initial state
    fill.style.strokeDashoffset = '534';
    
    // Animate after a brief delay
    setTimeout(() => {
      const circumference = 534;
      const offset = circumference - (value / 100) * circumference;
      fill.style.strokeDashoffset = offset;
      
      // Animate number if present
      if (numberEl) {
        animateNumber(numberEl, 0, value, 800);
      }
      
      // Add entrance animation
      gaugeRing.setAttribute('data-animated', 'true');
      animateEmphasis(gaugeRing);
    }, 100);
  }
  
  /**
   * Animate number counting
   * @param {HTMLElement} element - Element containing the number
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} duration - Duration in ms
   */
  function animateNumber(element, start, end, duration) {
    if (!element) return;
    
    const startTime = performance.now();
    const isDecimal = end % 1 !== 0;
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = start + (end - start) * eased;
      element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  /**
   * Animate bar row fill
   * @param {HTMLElement} barRow - Bar row element
   * @param {number} value - Value from 0-100
   * @param {number} delay - Delay in ms
   */
  function animateBarRow(barRow, value, delay = 0) {
    if (!barRow) return;
    
    const fill = barRow.querySelector('.bar-row__fill');
    if (!fill) return;
    
    setTimeout(() => {
      fill.style.width = value + '%';
    }, delay);
  }
  
  /**
   * Setup Intersection Observer for lazy animations
   * @param {string} selector - CSS selector for elements to observe
   * @param {Function} callback - Callback function when element is visible
   */
  function observeElements(selector, callback) {
    const elements = document.querySelectorAll(selector);
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      elements.forEach(el => observer.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      elements.forEach(callback);
    }
  }
  
  /**
   * Update progress strip
   * @param {number} progress - Progress value 0-100
   */
  function updateProgressStrip(progress) {
    const strip = document.querySelector('.progress-strip');
    const fill = document.querySelector('.progress-strip__fill');
    
    if (!strip || !fill) return;
    
    if (progress === 0) {
      strip.removeAttribute('data-loading');
      strip.removeAttribute('data-complete');
      fill.style.width = '0%';
    } else if (progress >= 100) {
      strip.setAttribute('data-complete', 'true');
      strip.removeAttribute('data-loading');
      fill.style.width = '100%';
      
      // Reset after animation
      setTimeout(() => {
        strip.removeAttribute('data-complete');
        fill.style.width = '0%';
      }, 500);
    } else {
      strip.setAttribute('data-loading', 'true');
      strip.removeAttribute('data-complete');
      fill.style.width = progress + '%';
    }
  }
  
  /**
   * Show/hide sticky context bar
   * @param {boolean} visible - Whether to show the bar
   */
  function toggleContextBar(visible) {
    const contextBar = document.querySelector('.sticky-context-bar');
    if (!contextBar) return;
    
    contextBar.setAttribute('data-visible', visible ? 'true' : 'false');
  }
  
  /**
   * Setup sticky context bar observer
   * @param {string} targetSelector - Selector for element to observe
   */
  function setupContextBarObserver(targetSelector) {
    const target = document.querySelector(targetSelector);
    const contextBar = document.querySelector('.sticky-context-bar');
    
    if (!target || !contextBar) return;
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          toggleContextBar(!entry.isIntersecting);
        });
      }, {
        threshold: 0,
        rootMargin: '-64px 0px 0px 0px' // Account for top bar height
      });
      
      observer.observe(target);
    }
  }
  
  // Export functions to global scope
  window.AnimationUtils = {
    animateEntrance,
    animateEmphasis,
    animateList,
    animateGaugeRing,
    animateNumber,
    animateBarRow,
    observeElements,
    updateProgressStrip,
    toggleContextBar,
    setupContextBarObserver,
    prefersReducedMotion
  };
  
})();
