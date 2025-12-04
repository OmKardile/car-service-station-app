const { User } = require('./models');

async function listUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('📋 Users in database:');
    console.log('─'.repeat(80));
    console.log('ID  | Email                     | Name           | Role    | Created');
    console.log('─'.repeat(80));
    
    users.forEach(user => {
      const name = `${user.firstName} ${user.lastName}`;
      console.log(
        user.id.toString().padEnd(3),
        '|',
        user.email.padEnd(25),
        '|',
        name.padEnd(15),
        '|',
        user.role.padEnd(8),
        '|',
        user.createdAt.toISOString().split('T')[0]
      );
    });
    
    console.log('─'.repeat(80));
    console.log(`Total: ${users.length} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();