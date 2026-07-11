/**
 * Birajdar Travels — Booking Engine Configuration
 * Update notificationEmail to receive booking alerts via FormSubmit.
 * Optional: add Supabase url + anonKey for cloud booking storage & admin panel.
 */
window.BT_CONFIG = {
  business: {
    name: 'Birajdar Travels',
    phone: '+919322613925',
    whatsapp: '919322613925',
    contactPerson: 'Vikrant Birajdar',
    notificationEmail: ''
  },
  payment: {
    upiId: '9322613925@paytm',
    upiName: 'Vikrant Birajdar',
    bankName: 'State Bank of India',
    accountName: 'Vikrant Birajdar',
    accountNumber: 'Contact us for account details',
    ifsc: 'Contact us for IFSC'
  },
  supabase: {
    url: '',
    anonKey: ''
  },
  adminPin: '3925',
  bookingPrefix: 'BT'
};
