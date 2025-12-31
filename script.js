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
const employeesSlider = document.getElementById('employees');
const employeesValue = document.getElementById('employees-value');
const employeeCountSlider = document.getElementById('employee-count');
const employeeCountValue = document.getElementById('employee-count-value');

// Calculator State
let calculatorState = {
  managers: 5,
  baseHoursSavedPerManagerPerWeek: 1.0, // Base hours (before employee tier add-on)
  hourlyManagerCost: 50,
  employeeCountTier: 3 // 1=<100, 2=100-500, 3=500-1K (baseline), 4=1K-5K, 5=5K+
};

// Initialize calculator state with employee count
if (employeeCountSlider) {
  calculatorState.employeeCountTier = parseInt(employeeCountSlider.value, 10) || 3;
}

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
  
  // Employee slider handler (form)
  if (employeesSlider && employeesValue) {
    employeesSlider.addEventListener('input', handleEmployeesChange);
    updateEmployeesValue();
  }
  
  // Employee count slider handler
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

// Update employee count display
function updateEmployeeCountDisplay() {
  if (!employeeCountSlider || !employeeCountValue) return;
  const employeeTiers = ['<100', '100-500', '500-1K', '1K-5K', '5K+'];
  const value = parseInt(employeeCountSlider.value, 10);
  const tier = employeeTiers[value - 1] || '100-500';
  employeeCountValue.textContent = tier;
  
  // Update calculator state and recalculate
  calculatorState.employeeCountTier = value;
  
  // Update slider display values to show combined hours (base + bonus)
  updateSliderValues();
  calculateResults();
  
  // Update form slider if it exists
  if (employeesSlider) {
    employeesSlider.value = value;
    updateEmployeesValue();
  }
}

function handleEmployeeCountChange(e) {
  const value = parseInt(e.target.value, 10);
  calculatorState.employeeCountTier = value;
  updateEmployeeCountDisplay();
}

// Initialize tooltips
function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
  let tooltipTimeout = null;
  
  function hideTooltip(trigger, tooltip) {
    trigger.classList.remove('active');
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = '';
  }
  
  function showTooltip(trigger, tooltip) {
    // Close any other open tooltips
    document.querySelectorAll('.tooltip-trigger').forEach(t => {
      if (t !== trigger) {
        const otherTooltipId = t.getAttribute('aria-describedby');
        if (otherTooltipId) {
          const otherTooltip = document.getElementById(otherTooltipId);
          if (otherTooltip) {
            t.classList.remove('active');
            otherTooltip.style.opacity = '0';
            otherTooltip.style.visibility = 'hidden';
            otherTooltip.style.display = '';
          }
        }
      }
    });
    
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
    
    // Show this tooltip
    trigger.classList.add('active');
    tooltip.style.display = 'block';
    // Force visibility with a small delay to ensure display is set first
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    }, 10);
    
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

// Round to nearest 0.25 hours (15 minutes)
function roundToQuarterHour(hours) {
  return Math.round(hours * 4) / 4; // Round to nearest 0.25
}

// Calculate employee tier add-on
function getEmployeeTierAddon(tier) {
  // Baseline: Tier 3 (500-1K) = +0.0
  // Tiers 1-3: +0.0, Tier 4: +0.2, Tier 5: +0.4
  if (tier <= 3) return 0;
  return tier === 4 ? 0.2 : 0.4;
}

// Update slider display values
function updateSliderValues() {
  managersValue.textContent = calculatorState.managers;
  
  // Show BASE hours in slider display (not total)
  hoursSavedValue.textContent = calculatorState.baseHoursSavedPerManagerPerWeek.toFixed(1);
  hourlyCostValue.textContent = `$${calculatorState.hourlyManagerCost}`;
}

// Slider change handlers
function handleManagersChange(e) {
  calculatorState.managers = parseInt(e.target.value, 10);
  updateSliderValues();
  calculateResults();
}

function handleHoursSavedChange(e) {
  calculatorState.baseHoursSavedPerManagerPerWeek = parseFloat(e.target.value);
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
  // Calculate total hours per manager/admin per week = base + employee tier add-on
  const baseHours = calculatorState.baseHoursSavedPerManagerPerWeek;
  const employeeTierAddon = getEmployeeTierAddon(calculatorState.employeeCountTier || 3);
  const totalHoursPerManagerPerWeek = baseHours + employeeTierAddon;
  
  // Monthly calculation: managers × total hours per manager per week × 4.33 weeks
  const monthlyHoursSaved = 
    calculatorState.managers * 
    totalHoursPerManagerPerWeek * 
    WEEKS_PER_MONTH;
  
  // Round monthly hours to nearest 0.25 hours (15 minutes)
  const roundedMonthlyHours = roundToQuarterHour(monthlyHoursSaved);
  
  // Monthly value recovered = rounded hours × hourly cost
  const monthlyValueRecovered = roundedMonthlyHours * calculatorState.hourlyManagerCost;
  
  // Update display
  if (hoursSavedResult) {
    hoursSavedResult.textContent = roundedMonthlyHours.toFixed(1);
  }
  if (costSavedResult) {
    costSavedResult.textContent = formatCurrency(monthlyValueRecovered);
  }
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
  const employeeTierValue = parseInt(employees, 10);
  const employeeTier = employeeTiers[employeeTierValue - 1] || '100-500';
  
  // Update calculator state with form value
  calculatorState.employeeCountTier = employeeTierValue;
  
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
    // Use the current calculator state (which includes employee count impact)
    const baseHours = calculatorState.baseHoursSavedPerManagerPerWeek;
    const employeeTierAddon = getEmployeeTierAddon(calculatorState.employeeCountTier || 3);
    const totalHoursPerManagerPerWeek = baseHours + employeeTierAddon;
    
    const monthlyHoursSaved = 
      calculatorState.managers * 
      totalHoursPerManagerPerWeek * 
      WEEKS_PER_MONTH;
    const roundedMonthlyHours = roundToQuarterHour(monthlyHoursSaved);
    const finalMonthlyCostSaved = roundedMonthlyHours * calculatorState.hourlyManagerCost;
    
    // Prepare webhook payload
    const payload = {
      fullName,
      email,
      mobile,
      company,
      employeeTier,
      employeeCountTier: calculatorState.employeeCountTier,
      managers: calculatorState.managers,
      baseHoursSavedPerManagerPerWeek: calculatorState.baseHoursSavedPerManagerPerWeek,
      employeeTierAddon: employeeTierAddon,
      totalHoursPerManagerPerWeek: totalHoursPerManagerPerWeek,
      hourlyManagerCost: calculatorState.hourlyManagerCost,
      monthlyHoursSaved: parseFloat(roundedMonthlyHours.toFixed(2)),
      monthlyCostSaved: parseFloat(finalMonthlyCostSaved.toFixed(2)),
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

