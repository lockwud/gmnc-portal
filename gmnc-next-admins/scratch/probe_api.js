const API_URL = 'https://api.getmyneurocare.org';
const TOKEN = 'YOUR_TOKEN'; // I don't have it easily here, but I can check endpoints for 404 vs 401

async function probe() {
  const endpoints = [
    '/auth/signup',
    '/auth/register',
    '/signup',
    '/register',
    '/admin/users',
    '/service-provider',
    '/caregiver',
    '/cp-patient',
    '/enrollment'
  ];

  for (const path of endpoints) {
    try {
      const res = await fetch(`${API_URL}${path}`, { method: 'POST' });
      console.log(`POST ${path} -> ${res.status}`);
    } catch (e) {
      console.log(`POST ${path} -> FAILED`);
    }
  }
}

probe();
