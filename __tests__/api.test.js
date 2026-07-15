const request = require('supertest');
const app = require('../api/index.js');

describe('API Endpoints', function() {
  describe('GET /api/crops', function() {
    test('returns crops data', async function() {
      const response = await request(app).get('/api/crops');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/crops', function() {
    test('creates a new crop with valid data', async function() {
      const newCrop = {
        id: 'TEST-001',
        name: 'Tomate Test',
        field: 'Parcelle Test',
        status: 'Croissance'
      };

      const response = await request(app)
        .post('/api/crops')
        .send(newCrop);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.crop.name).toBe('Tomate Test');
    });

    test('rejects crop with missing required fields', async function() {
      const invalidCrop = {
        name: 'Tomate Sans ID'
        // Missing id field
      };

      const response = await request(app)
        .post('/api/crops')
        .send(invalidCrop);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('rejects crop with empty name', async function() {
      const invalidCrop = {
        id: 'TEST-002',
        name: '' // Empty name
      };

      const response = await request(app)
        .post('/api/crops')
        .send(invalidCrop);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/crops/:id', function() {
    test('updates an existing crop', async function() {
      const updateData = {
        name: 'Tomate Mongal F1 Updated',
        status: 'Floraison'
      };

      const response = await request(app)
        .put('/api/crops/C-101')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.crop.name).toBe('Tomate Mongal F1 Updated');
    });

    test('returns 404 for non-existent crop', async function() {
      const response = await request(app)
        .put('/api/crops/NON-EXISTENT')
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/crops/:id', function() {
    test('deletes an existing crop', async function() {
      const response = await request(app).delete('/api/crops/TEST-001');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('returns 200 even for non-existent crop', async function() {
      const response = await request(app).delete('/api/crops/NON-EXISTENT');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/parcelles', function() {
    test('returns parcelles data', async function() {
      const response = await request(app).get('/api/parcelles');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/parcelles', function() {
    test('creates a new parcelle with valid data', async function() {
      const newParcelle = {
        id: 'P-TEST-001',
        name: 'Parcelle Test',
        surface: 200,
        lat: 14.7930,
        lng: -17.2650
      };

      const response = await request(app)
        .post('/api/parcelles')
        .send(newParcelle);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.parcelle.name).toBe('Parcelle Test');
    });

    test('rejects parcelle with missing required fields', async function() {
      const invalidParcelle = {
        id: 'P-TEST-002'
        // Missing name
      };

      const response = await request(app)
        .post('/api/parcelles')
        .send(invalidParcelle);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/employees', function() {
    test('returns employees data', async function() {
      const response = await request(app).get('/api/employees');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/employees', function() {
    test('creates a new employee with valid data', async function() {
      const newEmployee = {
        id: 'E-TEST-001',
        name: 'Ouvrier Test',
        phone: '77 123 45 67',
        role: 'Maraîcher',
        dailyRate: 4000,
        status: 'Actif'
      };

      const response = await request(app)
        .post('/api/employees')
        .send(newEmployee);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.employee.name).toBe('Ouvrier Test');
    });

    test('rejects employee with missing required fields', async function() {
      const invalidEmployee = {
        id: 'E-TEST-002'
        // Missing name
      };

      const response = await request(app)
        .post('/api/employees')
        .send(invalidEmployee);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/finances', function() {
    test('returns finances data', async function() {
      const response = await request(app).get('/api/finances');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/finances', function() {
    test('creates a new finance entry with valid data', async function() {
      const newFinance = {
        id: 'F-TEST-001',
        description: 'Test vente légumes',
        type: 'Revenu',
        category: 'Vente',
        amount: 50000,
        date: '2026-06-26'
      };

      const response = await request(app)
        .post('/api/finances')
        .send(newFinance);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.finance.amount).toBe(50000);
    });

    test('rejects finance with negative amount', async function() {
      const invalidFinance = {
        id: 'F-TEST-002',
        description: 'Test',
        type: 'Revenu',
        amount: -1000 // Invalid negative amount
      };

      const response = await request(app)
        .post('/api/finances')
        .send(invalidFinance);

      expect(response.status).toBe(400);
    });

    test('rejects finance with invalid type', async function() {
      const invalidFinance = {
        id: 'F-TEST-003',
        description: 'Test',
        type: 'InvalidType', // Not Revenu or Dépense
        amount: 1000
      };

      const response = await request(app)
        .post('/api/finances')
        .send(invalidFinance);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/weather', function() {
    test('returns weather data for valid coordinates', async function() {
      const response = await request(app)
        .get('/api/weather')
        .query({ lat: 14.7930, lon: -17.2650 });

      expect(response.status).toBe(200);
      expect(response.body.temp).toBeDefined();
      expect(response.body.humidity).toBeDefined();
    });

    test('returns 400 for missing coordinates', async function() {
      const response = await request(app)
        .get('/api/weather')
        .query({ lat: 14.7930 }); // Missing lon

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', function() {
    test('allows requests within limit', async function() {
      const response = await request(app).get('/api/crops');
      expect(response.status).toBe(200);
    });
  });
});