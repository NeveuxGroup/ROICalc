// ROI Calculator - Main Script
// Constants
const WEEKS_PER_MONTH = 4.33;

// DOM Elements
const managersSlider = document.getElementById('managers');
const hoursSavedSlider = document.getElementById('hours-saved');
const hourlyCostSlider = document.getElementById('hourly-cost');

const managersValue = document.getElementById('managers-value');
const hoursSavedValue = document.getElementById('hours-saved-value');
const hourlyCostValue = document.getElementById('hourly-cost-value');

const hoursSavedResult = document.getElementById('hours-saved-result');
const costSavedResult = document.getElementById('cost-saved-result');

const getStartedBtn = document.getElementById('get-started-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const leadForm = document.getElementById('lead-form');
const formError = document.getElementById('form-error');
const formSuccess = document.getElementById('form-success');
const methodologyToggle = document.getElementById('methodology-toggle');
const methodologyContent = document.getElementById('methodology-content');

// Calculator State
let calculatorState = {
  managers: 5,
  hoursSavedPerManagerPerWeek: 1.0,
  hourlyManagerCost: 50
};

// Initialize calculator
function initCalculator() {
  // Set initial values
  updateSliderValues();
  calculateResults();
  
  // Add event listeners
  managersSlider.addEventListener('input', handleManagersChange);
  hoursSavedSlider.addEventListener('input', handleHoursSavedChange);
  hourlyCostSlider.addEventListener('input', handleHourlyCostChange);
  
  // Modal handlers
  getStartedBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', handleModalOverlayClick);
  
  // Form handlers
  leadForm.addEventListener('submit', handleFormSubmit);
  
  // Close modal on Escape key
  document.addEventListener('keydown', handleKeyDown);
  
  // Tooltip handlers
  initTooltips();
  
  // Methodology toggle handler
  if (methodologyToggle) {
    methodologyToggle.addEventListener('click', toggleMethodology);
  }
}

// Initialize tooltips
function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
  
  tooltipTriggers.forEach(trigger => {
    const tooltip = trigger.querySelector('.tooltip');
    
    // Handle click for mobile/touch devices
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isActive = this.classList.contains('active');
      
      // Close all tooltips first
      document.querySelectorAll('.tooltip-trigger').forEach(t => {
        t.classList.remove('active');
      });
      
      // Toggle this tooltip
      if (!isActive) {
        this.classList.add('active');
      }
    });
    
    // Handle hover for desktop
    trigger.addEventListener('mouseenter', function() {
      this.classList.add('active');
    });
    
    trigger.addEventListener('mouseleave', function() {
      this.classList.remove('active');
    });
    
    // Handle focus for keyboard navigation
    trigger.addEventListener('focus', function() {
      this.classList.add('active');
    });
    
    trigger.addEventListener('blur', function() {
      this.classList.remove('active');
    });
  });
  
  // Close tooltips when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.tooltip-trigger') && !e.target.closest('.tooltip')) {
      document.querySelectorAll('.tooltip-trigger').forEach(t => {
        t.classList.remove('active');
      });
    }
  });
}

// Update slider display values
function updateSliderValues() {
  managersValue.textContent = calculatorState.managers;
  hoursSavedValue.textContent = calculatorState.hoursSavedPerManagerPerWeek.toFixed(1);
  hourlyCostValue.textContent = `$${calculatorState.hourlyManagerCost}`;
}

// Slider change handlers
function handleManagersChange(e) {
  calculatorState.managers = parseInt(e.target.value, 10);
  updateSliderValues();
  calculateResults();
}

function handleHoursSavedChange(e) {
  calculatorState.hoursSavedPerManagerPerWeek = parseFloat(e.target.value);
  updateSliderValues();
  calculateResults();
}

function handleHourlyCostChange(e) {
  calculatorState.hourlyManagerCost = parseInt(e.target.value, 10);
  updateSliderValues();
  calculateResults();
}

// Calculate ROI results
function calculateResults() {
  const monthlyHoursSaved = 
    calculatorState.managers * 
    calculatorState.hoursSavedPerManagerPerWeek * 
    WEEKS_PER_MONTH;
  
  const monthlyCostSaved = monthlyHoursSaved * calculatorState.hourlyManagerCost;
  
  // Update display
  hoursSavedResult.textContent = monthlyHoursSaved.toFixed(1);
  costSavedResult.textContent = formatCurrency(monthlyCostSaved);
}

// Format currency
function formatCurrency(value) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${Math.round(value)}`;
}

// Modal functions
function openModal() {
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Focus first input
  const firstNameInput = document.getElementById('firstName');
  if (firstNameInput) {
    setTimeout(() => firstNameInput.focus(), 100);
  }
}

function closeModal() {
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // Reset form
  leadForm.reset();
  formError.classList.remove('show');
  formError.textContent = '';
  formSuccess.style.display = 'none';
}

function handleModalOverlayClick(e) {
  if (e.target === modalOverlay) {
    closeModal();
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && modalOverlay.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
}

// Form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Hide previous messages
  formError.classList.remove('show');
  formError.textContent = '';
  formSuccess.style.display = 'none';
  
  // Get form data
  const formData = new FormData(leadForm);
  const firstName = formData.get('firstName').trim();
  const email = formData.get('email').trim();
  const company = formData.get('company').trim();
  const website = formData.get('website').trim(); // Honeypot
  
  // Validate required fields
  if (!firstName || !email || !company) {
    showError('Please fill in all required fields.');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }
  
  // Check honeypot (if filled, treat as spam but show success)
  if (website) {
    // Spam detected - show success but don't send webhook
    showSuccess();
    return;
  }
  
  // Disable submit button
  const submitBtn = leadForm.querySelector('.form-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  try {
    // Calculate current results
    const monthlyHoursSaved = 
      calculatorState.managers * 
      calculatorState.hoursSavedPerManagerPerWeek * 
      WEEKS_PER_MONTH;
    
    const monthlyCostSaved = monthlyHoursSaved * calculatorState.hourlyManagerCost;
    
    // Prepare webhook payload
    const payload = {
      firstName,
      email,
      company,
      managers: calculatorState.managers,
      hoursSavedPerManagerPerWeek: calculatorState.hoursSavedPerManagerPerWeek,
      hourlyManagerCost: calculatorState.hourlyManagerCost,
      monthlyHoursSaved: parseFloat(monthlyHoursSaved.toFixed(2)),
      monthlyCostSaved: parseFloat(monthlyCostSaved.toFixed(2)),
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href
    };
    
    // Check if webhook URL is configured
    if (!CONFIG || !CONFIG.zapierWebhookUrl || CONFIG.zapierWebhookUrl === 'YOUR_ZAPIER_WEBHOOK_URL_HERE') {
      console.warn('Zapier webhook URL not configured. Form data:', payload);
      // Still show success for testing
      showSuccess();
      return;
    }
    
    // Send to Zapier webhook
    const response = await fetch(CONFIG.zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Success
    showSuccess();
    
  } catch (error) {
    console.error('Error submitting form:', error);
    showError('There was an error submitting your information. Please try again or contact us directly.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

function showError(message) {
  formError.textContent = message;
  formError.classList.add('show');
  formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showSuccess() {
  formSuccess.style.display = 'block';
  leadForm.style.display = 'none';
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Re-enable submit button (in case of error recovery)
  const submitBtn = leadForm.querySelector('.form-submit');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

// Toggle methodology section
function toggleMethodology() {
  const isExpanded = methodologyToggle.getAttribute('aria-expanded') === 'true';
  const newState = !isExpanded;
  
  methodologyToggle.setAttribute('aria-expanded', newState);
  methodologyContent.setAttribute('aria-hidden', !newState);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculator);
} else {
  initCalculator();
}

