import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "marketplace": "Marketplace",
        "about": "About",
        "partners": "Partners",
        "login": "Login",
        "logout": "Logout",
        "dashboard": "Dashboard"
      },
      "home": {
        "hero_title": "Built for <0>SPEED.</0>",
        "hero_subtitle": "Premium performance parts for the serious enthusiast.",
        "hero_button": "Identify Your Build"
      },
      "login": {
        "title": "Operational Access",
        "subtitle": "SECURE PORTAL AUTHENTICATION",
        "email_label": "EMAIL_ENDPOINT",
        "password_label": "SECURE_ACCESS_KEY",
        "submit": "ESTABLISH LINK",
        "footer": "AUTHORIZED PERSONNEL ONLY"
      }
    }
  },
  hi: {
    translation: {
      "nav": {
        "marketplace": "मार्केटप्लेस",
        "about": "हमारे बारे में",
        "partners": "पार्टनर्स",
        "login": "लॉगिन",
        "logout": "लॉगआउट",
        "dashboard": "डैशबोर्ड"
      },
      "home": {
        "hero_title": "<0>रफ़्तार</0> के लिए निर्मित।",
        "hero_subtitle": "गंभीर उत्साही लोगों के लिए प्रीमियम प्रदर्शन पुर्जे।",
        "hero_button": "अपना वाहन चुनें"
      },
      "login": {
        "title": "ऑपरेशनल एक्सेस",
        "subtitle": "सुरक्षित पोर्टल प्रमाणीकरण",
        "email_label": "ईमेल एंडपॉइंट",
        "password_label": "सुरक्षित एक्सेस की",
        "submit": "लिंक स्थापित करें",
        "footer": "केवल अधिकृत कर्मचारी"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
