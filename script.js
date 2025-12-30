// ROI Calculator - Main Script
// Constants
const WEEKS_PER_MONTH = 4.33;

// DOM Elements
const managersSlider = document.getElementById('managers');
const hoursSavedSlider = document.getElementById('hours-saved');
const hourlyCostSlider = document.getElementById('hourly-cost');
const traditionalReachSlider = document.getElementById('traditional-reach');
const textFirstReachSlider = document.getElementById('textfirst-reach');

const managersValue = document.getElementById('managers-value');
const hoursSavedValue = document.getElementById('hours-saved-value');
const hourlyCostValue = document.getElementById('hourly-cost-value');
const traditionalReachValue = document.getElementById('traditional-reach-value');
const traditionalReachBar = document.getElementById('traditional-reach-bar');
const traditionalReachText = document.getElementById('traditional-reach-text');
const textFirstReachValue = document.getElementById('textfirst-reach-value');
const textFirstReachBar = document.getElementById('textfirst-reach-bar');
const textFirstReachText = document.getElementById('textfirst-reach-text');
const improvementMetrics = document.getElementById('improvement-metrics');

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
const employeesSlider = document.getElementById('employees');
const employeesValue = document.getElementById('employees-value');
const employeeCountSlider = document.getElementById('employee-count');
const employeeCountValue = document.getElementById('employee-count-value');
const employeeNarrative = document.getElementById('employee-narrative');
const employeeCountNarrative = document.getElementById('employee-count-narrative');

// Calculator State
let calculatorState = {
  managers: 5,
  hoursSavedPerManagerPerWeek: 1.0,
  hourlyManagerCost: 50,
  traditionalReach: 30,
  textFirstReach: 90
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
  
  // Reach slider listeners
  if (traditionalReachSlider) {
    traditionalReachSlider.addEventListener('input', handleTraditionalReachChange);
  }
  if (textFirstReachSlider) {
    textFirstReachSlider.addEventListener('input', handleTextFirstReachChange);
  }
  
  // Initialize reach display
  updateReachDisplay();
  
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
  
  // Employee slider handler (form)
  if (employeesSlider && employeesValue) {
    employeesSlider.addEventListener('input', handleEmployeesChange);
    updateEmployeesValue();
  }
  
  // Employee count slider handler (context section)
  if (employeeCountSlider && employeeCountValue) {
    employeeCountSlider.addEventListener('input', handleEmployeeCountChange);
    updateEmployeeCountDisplay();
  }
}

// Update employee tier display
function updateEmployeesValue() {
  if (!employeesSlider || !employeesValue) return;
  const employeeTiers = ['<100', '100-500', '500-1K', '1K-5K', '5K+'];
  const value = parseInt(employeesSlider.value, 10);
  employeesValue.textContent = employeeTiers[value - 1] || '100-500';
}

function handleEmployeesChange(e) {
  updateEmployeesValue();
}

// Update employee count display (context section)
function updateEmployeeCountDisplay() {
  if (!employeeCountSlider || !employeeCountValue) return;
  const employeeTiers = ['<100', '100-500', '500-1K', '1K-5K', '5K+'];
  const value = parseInt(employeeCountSlider.value, 10);
  const tier = employeeTiers[value - 1] || '100-500';
  employeeCountValue.textContent = tier;
  if (employeeCountNarrative) {
    employeeCountNarrative.textContent = tier.toLowerCase();
  }
}

function handleEmployeeCountChange(e) {
  updateEmployeeCountDisplay();
}

// Initialize tooltips
function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
  let tooltipTimeout = null;
  
  function hideTooltip(trigger, tooltip) {
    trigger.classList.remove('active');
    tooltip.style.display = '';
  }
  
  function showTooltip(trigger, tooltip) {
    // Close any other open tooltips
    document.querySelectorAll('.tooltip-trigger').forEach(t => {
      if (t !== trigger) {
        const otherTooltipId = t.getAttribute('aria-describedby');
        if (otherTooltipId) {
          const otherTooltip = document.getElementById(otherTooltipId);
          if (otherTooltip) hideTooltip(t, otherTooltip);
        }
      }
    });
    
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    
    // Show this tooltip
    trigger.classList.add('active');
    tooltip.style.display = 'block';
    
    // Auto-hide after 4 seconds
    tooltipTimeout = setTimeout(() => {
      hideTooltip(trigger, tooltip);
    }, 4000);
  }
  
  tooltipTriggers.forEach(trigger => {
    // Find the tooltip
    const tooltipId = trigger.getAttribute('aria-describedby');
    const tooltip = tooltipId ? document.getElementById(tooltipId) : null;
    
    if (!tooltip) {
      console.warn('Tooltip not found for trigger', trigger);
      return;
    }
    
    // Handle click - show tooltip
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showTooltip(this, tooltip);
    });
    
    // Handle hover for desktop - show on hover, hide on leave
    trigger.addEventListener('mouseenter', function() {
      showTooltip(this, tooltip);
    });
    
    trigger.addEventListener('mouseleave', function() {
      hideTooltip(this, tooltip);
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
    });
    
    // Handle focus for keyboard navigation
    trigger.addEventListener('focus', function() {
      showTooltip(this, tooltip);
    });
    
    trigger.addEventListener('blur', function() {
      hideTooltip(this, tooltip);
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
    });
  });
  
  // Close tooltips when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.tooltip-trigger') && !e.target.closest('.tooltip')) {
      tooltipTriggers.forEach(t => {
        const tooltipId = t.getAttribute('aria-describedby');
        if (tooltipId) {
          const tooltip = document.getElementById(tooltipId);
          if (tooltip) hideTooltip(t, tooltip);
        }
      });
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
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

function handleTraditionalReachChange(e) {
  calculatorState.traditionalReach = parseInt(e.target.value, 10);
  updateReachDisplay();
}

function handleTextFirstReachChange(e) {
  calculatorState.textFirstReach = parseInt(e.target.value, 10);
  updateReachDisplay();
}

// Update reach display
function updateReachDisplay() {
  if (!traditionalReachValue || !textFirstReachValue) return;
  
  const traditional = calculatorState.traditionalReach;
  const textFirst = calculatorState.textFirstReach;
  
  // Update values
  traditionalReachValue.textContent = `${traditional}%`;
  textFirstReachValue.textContent = `${textFirst}%`;
  
  // Update bars
  if (traditionalReachBar) {
    traditionalReachBar.style.width = `${traditional}%`;
  }
  if (traditionalReachText) {
    traditionalReachText.textContent = `${traditional}%`;
  }
  if (textFirstReachBar) {
    textFirstReachBar.style.width = `${textFirst}%`;
  }
  if (textFirstReachText) {
    textFirstReachText.textContent = `${textFirst}%`;
  }
  
  // Calculate and display improvement metrics
  if (improvementMetrics) {
    const percentagePoints = textFirst - traditional;
    const multiplier = (textFirst / traditional).toFixed(1);
    improvementMetrics.innerHTML = `<span class="improvement-badge">+${percentagePoints} percentage points (${multiplier}x)</span>`;
  }
}

// Initialize reach display on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateReachDisplay, 100);
  });
} else {
  setTimeout(updateReachDisplay, 100);
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
  const fullName = formData.get('fullName').trim();
  const email = formData.get('email').trim();
  const mobile = formData.get('mobile').trim();
  const company = formData.get('company').trim();
  const employees = formData.get('employees');
  const website = formData.get('website').trim(); // Honeypot
  
  // Validate required fields
  if (!fullName || !email || !mobile || !company) {
    showError('Please fill in all required fields.');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }
  
  // Validate mobile format (basic validation)
  const mobileRegex = /^[\d\s\(\)\-\+]+$/;
  if (!mobileRegex.test(mobile) || mobile.replace(/\D/g, '').length < 10) {
    showError('Please enter a valid mobile number.');
    return;
  }
  
  // Map employee slider value to tier
  const employeeTiers = ['<100', '100-500', '500-1K', '1K-5K', '5K+'];
  const employeeTier = employeeTiers[parseInt(employees, 10) - 1] || '100-500';
  
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
      fullName,
      email,
      mobile,
      company,
      employeeTier,
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

