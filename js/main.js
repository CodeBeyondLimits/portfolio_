// ==========================================================================
// HARSHITH — PRIMARY APPLICATION ENTRYPOINT
// Orchestrates:
// - 3D AI Core Disassembly Engine
// - Lenis Smooth Scrolling
// - Massive Hero Typography Interactions
// - Custom Magnetic Cursor
// - Algorithm Visualizer Demo
// - 3D Objects & Constellation
// ==========================================================================

import { PhosphorIcons } from './icons.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initAICoreDisassembly } from './ai-core-disassembly.js';
import { initHeroTypography } from './hero-typography.js';
import { initCustomCursor } from './cursor.js';
import { initAlgoVisualizer } from './algo-visualizer.js';
import { init3DObjects } from './3d-objects.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Phosphor Icons
  injectIcons();

  // 2. Initialize Custom Magnetic Cursor
  initCustomCursor();

  // 3. Initialize Lenis Smooth Scrolling
  const lenis = initSmoothScroll();

  // 4. Initialize Massive 3D AI Machine Disassembly
  initAICoreDisassembly();

  // 5. Initialize Hero 3D Typography Physics
  initHeroTypography();

  // 6. Initialize Embedded Interactive Algorithm Visualizer
  initAlgoVisualizer();

  // 7. Initialize 3D Objects (About & Constellation)
  init3DObjects();

  // 8. Collaboration Form Validation
  initCollaborationForm();

  // 9. Custom 404 Modal
  initCustom404();
});

function injectIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const iconName = el.getAttribute('data-icon');
    if (PhosphorIcons[iconName]) {
      el.innerHTML = PhosphorIcons[iconName];
    }
  });
}

function initCollaborationForm() {
  const form = document.getElementById('collab-form');
  const successBox = document.getElementById('collab-success');
  const errorBox = document.getElementById('collab-error');
  const submitBtn = document.getElementById('collab-submit-btn');
  const btnText = document.getElementById('collab-btn-text');

  if (!form) return;

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nameInput = document.getElementById('collab-name');
    const emailInput = document.getElementById('collab-email');
    const msgInput = document.getElementById('collab-msg');
    const gotchaInput = document.getElementById('collab-gotcha');

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const msgVal = msgInput ? msgInput.value.trim() : '';
    const gotchaVal = gotchaInput ? gotchaInput.value.trim() : '';

    // Clear previous error
    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    }

    // Client side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameVal) {
      showError('Please provide your name.');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!emailVal || !emailRegex.test(emailVal)) {
      showError('Please provide a valid email address.');
      if (emailInput) emailInput.focus();
      return;
    }

    if (!msgVal || msgVal.length < 10) {
      showError('Please provide a message of at least 10 characters.');
      if (msgInput) msgInput.focus();
      return;
    }

    // Enter loading state
    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.style.cursor = 'not-allowed';
    }
    if (btnText) {
      btnText.textContent = 'Transmitting Note...';
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          message: msgVal,
          _gotcha: gotchaVal
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        // Successful delivery confirmation
        form.reset();
        form.style.display = 'none';
        if (successBox) {
          successBox.style.display = 'block';
        }
      } else {
        // Delivery failed or configuration missing
        const errorMessage = data.error || 'Unable to transmit note at this time. Please reach out directly to sharshith346@gmail.com.';
        showError(errorMessage);
        resetButton();
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      showError('Network error connecting to transmission endpoint. Please reach out directly to sharshith346@gmail.com.');
      resetButton();
    } finally {
      isSubmitting = false;
    }
  });

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }
  }

  function resetButton() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = '';
    }
    if (btnText) {
      btnText.textContent = 'Transmit Note';
    }
  }
}

function initCustom404() {
  const trigger404 = document.getElementById('trigger-404-view');
  const modal404 = document.getElementById('modal-404');
  const close404 = document.getElementById('close-404');

  if (!trigger404 || !modal404) return;

  trigger404.addEventListener('click', (e) => {
    e.preventDefault();
    modal404.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  if (close404) {
    close404.addEventListener('click', () => {
      modal404.style.display = 'none';
      document.body.style.overflow = '';
    });
  }
}
