const request = require('supertest');
const { app } = require('../server');
const { User, Service, Station, StationServicePrice } = require('../models');
const bcrypt = require('bcryptjs');

describe('Booking API', () => {
  let authToken;
  let testUserId;
  let testServiceId;
  let testStationId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      email: 'bookingtest@example.com',
      password: await bcrypt.hash('password123', 12),
      firstName: 'Booking',
      lastName: 'Test',
      role: 'client'
    });
    testUserId = user.id;

    // Create test service
    const service = await Service.create({
      name: 'Test Service',
      description: 'Test Description',
      basePrice: 99.99,
      estimatedDuration: 60,
      isActive: true
    });
    testServiceId = service.id;

    // Create test station
    const station = await Station.create({
      name: 'Test Station',
      address: 'Test Address',
      phone: '+1234567890',
      email: 'test@station.com',
      operatingHours: '9 AM - 6 PM',
      isActive: true
    });
    testStationId = station.id;

    // Create station service price
    await StationServicePrice.create({
      stationId: testStationId,
      serviceId: testServiceId,
      price: 99.99,
      isActive: true
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bookingtest@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: {} });
    await Service.destroy({ where: {} });
    await Station.destroy({ where: {} });
    await StationServicePrice.destroy({ where: {} });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      const scheduledDate = new Date();
      scheduledDate.setHours(scheduledDate.getHours() + 2); // 2 hours from now

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: testServiceId,
          stationId: testStationId,
          scheduledDate: scheduledDate.toISOString(),
          vehicleDetails: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            licensePlate: 'ABC123'
          },
          specialInstructions: 'Test instructions'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking created successfully');
      expect(response.body.data.serviceId).toBe(testServiceId);
      expect(response.body.data.stationId).toBe(testStationId);
      expect(response.body.data.status).toBe('pending');
    });

    it('should not create booking with invalid data', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          serviceId: testServiceId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    it('should get user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});