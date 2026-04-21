/**
 * translations.ts — Hindi/English UI strings.
 * Add new strings here. Keep keys consistent.
 */

type Lang = 'en' | 'hi';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    'nav.home':          'Home',
    'nav.astrologers':   'Astrologers',
    'nav.horoscope':     'Horoscope',
    'nav.panchang':      'Panchang',
    'nav.favorites':     'Saved',
    'nav.wallet':        'Wallet',
    'nav.profile':       'Profile',
    'nav.consultations': 'Consultations',
    'nav.logout':        'Logout',
    'nav.login':         'Login',
    'nav.register':      'Register',

    // Home
    'home.hero.title':    'Talk to Expert Astrologers',
    'home.hero.subtitle': 'Get guidance on love, career & life from verified experts',
    'home.cta.talk':      'Talk to Astrologer',
    'home.cta.horoscope': 'Check Horoscope',
    'home.top':           'Top Astrologers',
    'home.viewAll':       'View All',

    // Astrologer card
    'card.online':      'Online',
    'card.offline':     'Offline',
    'card.talkNow':     'Talk Now',
    'card.viewProfile': 'View Profile',
    'card.recharge':    'Recharge',
    'card.perMin':      '/min',
    'card.years':       'yrs exp',
    'card.reviews':     'reviews',

    // Booking
    'booking.title':    'Book Consultation',
    'booking.type':     'Choose Type',
    'booking.note':     'Your Note',
    'booking.optional': '(optional)',
    'booking.rate':     'Rate',
    'booking.balance':  'Your wallet balance',
    'booking.book':     'Book Now',
    'booking.cancel':   'Cancel',
    'booking.chat':     'Chat',
    'booking.call':     'Voice Call',
    'booking.video':    'Video Call',

    // Wallet
    'wallet.balance':   'Current Balance',
    'wallet.recharge':  'Add Money',
    'wallet.history':   'Transactions',
    'wallet.payNow':    'Pay Now',
    'wallet.min':       'Minimum recharge ₹50',

    // Common
    'common.loading':   'Loading...',
    'common.save':      'Save',
    'common.cancel':    'Cancel',
    'common.edit':      'Edit',
    'common.submit':    'Submit',
    'common.search':    'Search...',
    'common.noData':    'No data found',
    'common.error':     'Something went wrong',
    'common.success':   'Done!',
  },

  hi: {
    // Nav
    'nav.home':          'होम',
    'nav.astrologers':   'ज्योतिषी',
    'nav.horoscope':     'राशिफल',
    'nav.panchang':      'पंचांग',
    'nav.favorites':     'सहेजे गए',
    'nav.wallet':        'वॉलेट',
    'nav.profile':       'प्रोफ़ाइल',
    'nav.consultations': 'परामर्श',
    'nav.logout':        'लॉगआउट',
    'nav.login':         'लॉगिन',
    'nav.register':      'रजिस्टर',

    // Home
    'home.hero.title':    'विशेषज्ञ ज्योतिषियों से बात करें',
    'home.hero.subtitle': 'प्रेम, करियर और जीवन पर सत्यापित विशेषज्ञों से मार्गदर्शन लें',
    'home.cta.talk':      'ज्योतिषी से बात करें',
    'home.cta.horoscope': 'राशिफल देखें',
    'home.top':           'शीर्ष ज्योतिषी',
    'home.viewAll':       'सभी देखें',

    // Astrologer card
    'card.online':      'ऑनलाइन',
    'card.offline':     'ऑफलाइन',
    'card.talkNow':     'अभी बात करें',
    'card.viewProfile': 'प्रोफ़ाइल देखें',
    'card.recharge':    'रिचार्ज करें',
    'card.perMin':      '/मिनट',
    'card.years':       'वर्ष अनुभव',
    'card.reviews':     'समीक्षाएं',

    // Booking
    'booking.title':    'परामर्श बुक करें',
    'booking.type':     'प्रकार चुनें',
    'booking.note':     'आपकी टिप्पणी',
    'booking.optional': '(वैकल्पिक)',
    'booking.rate':     'दर',
    'booking.balance':  'आपका वॉलेट बैलेंस',
    'booking.book':     'अभी बुक करें',
    'booking.cancel':   'रद्द करें',
    'booking.chat':     'चैट',
    'booking.call':     'वॉयस कॉल',
    'booking.video':    'वीडियो कॉल',

    // Wallet
    'wallet.balance':   'वर्तमान बैलेंस',
    'wallet.recharge':  'पैसे जोड़ें',
    'wallet.history':   'लेन-देन',
    'wallet.payNow':    'अभी भुगतान करें',
    'wallet.min':       'न्यूनतम रिचार्ज ₹50',

    // Common
    'common.loading':   'लोड हो रहा है...',
    'common.save':      'सहेजें',
    'common.cancel':    'रद्द करें',
    'common.edit':      'संपादित करें',
    'common.submit':    'जमा करें',
    'common.search':    'खोजें...',
    'common.noData':    'कोई डेटा नहीं मिला',
    'common.error':     'कुछ गलत हुआ',
    'common.success':   'हो गया!',
  },
};

export default translations;
export type { Lang };
