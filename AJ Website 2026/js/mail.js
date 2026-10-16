/**
 * Asha Jyothi Employable Skill Training Centre
 * Dedicated Email Service (EmailJS Integration via .env)
 * 
 * Capabilities:
 * 1. Reads EmailJS configuration directly from .env file
 * 2. Fallback to window.EMAILJS_CONFIG
 * 3. 10-second timeout race to prevent infinite loading
 * 4. Transparent live, demo, and error status handling
 */

'use strict';

const MailService = (function () {
  const config = {
    serviceId: '',
    templateId: '',
    publicKey: '',
    timeoutMs: 10000,
    isLoaded: false,
    source: 'unloaded'
  };

  /**
   * Parse .env file contents into key-value map
   */
  function parseEnvString(text) {
    const result = {};
    if (!text || typeof text !== 'string') return result;

    const lines = text.split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      result[key] = value;
    });

    return result;
  }

  /**
   * Load .env file from root
   */
  async function loadEnvConfig() {
    let envData = {};
    let loadedFrom = null;

    // Try relative path first, then absolute root
    const pathsToTry = ['.env', '/.env'];

    for (const p of pathsToTry) {
      try {
        const resp = await fetch(p, { cache: 'no-store' });
        if (resp.ok) {
          const rawText = await resp.text();
          envData = parseEnvString(rawText);
          loadedFrom = p;
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }

    if (loadedFrom) {
      config.serviceId = envData.EMAILJS_SERVICE_ID || config.serviceId;
      config.templateId = envData.EMAILJS_TEMPLATE_ID || config.templateId;
      config.publicKey = envData.EMAILJS_PUBLIC_KEY || config.publicKey;
      config.source = loadedFrom;
      console.info(`MailService: Loaded configuration from ${loadedFrom}`);
    } else {
      console.info('MailService: .env file fetch not available, checking window config.');
    }

    // Merge window.EMAILJS_CONFIG if provided
    if (window.EMAILJS_CONFIG && typeof window.EMAILJS_CONFIG === 'object') {
      if (window.EMAILJS_CONFIG.serviceId) config.serviceId = window.EMAILJS_CONFIG.serviceId;
      if (window.EMAILJS_CONFIG.templateId) config.templateId = window.EMAILJS_CONFIG.templateId;
      if (window.EMAILJS_CONFIG.publicKey) config.publicKey = window.EMAILJS_CONFIG.publicKey;
      config.source = 'window.EMAILJS_CONFIG';
    }

    config.isLoaded = true;
    return config;
  }

  // Pre-load on script load
  loadEnvConfig();

  /**
   * Check if credentials are real vs placeholder defaults
   */
  function isConfigured() {
    const isPlaceholder = (val) =>
      !val ||
      val.trim() === '' ||
      val.includes('your_') ||
      val.includes('YOUR_') ||
      val === 'your_service_id_here' ||
      val === 'your_template_id_here' ||
      val === 'your_public_key_here';

    return (
      !isPlaceholder(config.serviceId) &&
      !isPlaceholder(config.templateId) &&
      !isPlaceholder(config.publicKey)
    );
  }

  /**
   * Send enquiry form data using EmailJS
   * @param {Object} data - Form data payload
   * @returns {Promise<Object>} Status object
   */
  async function sendEnquiryMail(data) {
    if (!config.isLoaded) {
      await loadEnvConfig();
    }

    // Verify EmailJS SDK
    if (typeof emailjs === 'undefined') {
      console.warn('MailService: EmailJS SDK not detected.');
      await new Promise((r) => setTimeout(r, 600));
      return {
        success: false,
        isDemo: true,
        fullName: data.fullName,
        courseName: data.courseName,
        message: 'EmailJS SDK is unreachable. Please call admissions directly at 80196 80291.'
      };
    }

    // Check if real keys exist in .env
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 700));
      return {
        success: false,
        isDemo: true,
        fullName: data.fullName,
        courseName: data.courseName,
        message: 'EmailJS keys in .env are currently default placeholders. To activate live mail sending, put your EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in the .env file.'
      };
    }

    // Initialize EmailJS with public key from .env
    try {
      emailjs.init({ publicKey: config.publicKey });
    } catch (err) {
      console.warn('MailService: init note:', err);
    }

    // Template parameters for EmailJS template
    const templateParams = {
      from_name: data.fullName,
      from_phone: data.mobileNumber,
      from_email: data.email || 'Not provided',
      campus: data.preferredCampus,
      preferred_campus: data.preferredCampus,
      course_name: data.courseName,
      message: data.message || 'No additional note provided.',
      reply_to: data.email || 'info@ashajyothi.org.in',
      submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    // 10-second timeout race to strictly prevent infinite loading
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email service request timed out after 10 seconds.')), config.timeoutMs)
    );

    try {
      const response = await Promise.race([
        emailjs.send(config.serviceId, config.templateId, templateParams),
        timeoutPromise
      ]);

      if (response && (response.status === 200 || response.text === 'OK')) {
        return {
          success: true,
          isDemo: false,
          fullName: data.fullName,
          courseName: data.courseName,
          message: `Thank you, ${data.fullName}! Your enquiry for "${data.courseName}" has been received. Our admissions team will call you at ${data.mobileNumber} shortly.`
        };
      }

      throw new Error(`EmailJS responded with status: ${response ? response.status : 'Unknown'}`);
    } catch (err) {
      console.error('MailService Send Error:', err);
      return {
        success: false,
        isDemo: false,
        fullName: data.fullName,
        courseName: data.courseName,
        message: err.message || 'A network error occurred while sending your message. Please call us directly at 80196 80291.'
      };
    }
  }

  return {
    sendEnquiryMail,
    loadEnvConfig,
    getConfig: () => ({ ...config }),
    isConfigured
  };
})();

// Global exposure
window.MailService = MailService;
window.sendEnquiryMail = MailService.sendEnquiryMail;
