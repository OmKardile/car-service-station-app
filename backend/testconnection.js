const { sequelize } = require('./models');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1+1 as result');
    console.log('✅ Simple query test:', results);
    
    // Check if users table exists
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('✅ Tables in database:', tables.map(t => Object.values(t)[0]));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();